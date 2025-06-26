/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { normalizePhoto } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { MAX_RETRIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { PhotoEditForm } from './PhotoEditForm';
import { createPhotoHandlers } from './photoHandlers';
import { Card, CardContent } from '@/components/ui/card';
import { PhotoInfo } from '@/components/photos/PhotoInfo';
import { useRouter, useSearchParams } from 'next/navigation';
import { PhotoDisplay } from '@/components/photos/PhotoDisplay';
import { usePhotoNavigation } from '@/lib/hooks/usePhotoNavigation';
import { PhotoNavigation } from '@/components/photos/PhotoNavigation';

import { Photo, PhotoPageProps } from '@/types/photo';
interface Tag {
  id: number;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Album {
  id: number;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function PhotoPage({ params }: PhotoPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allAlbums, setAllAlbums] = useState<Album[]>([]);

  // Get the resolved params
  const { photoId } = React.use(params);
  const sourceAlbumId = searchParams.get('albumId');

  // Use custom hook for navigation logic
  const {
    albumPhotos,
    canNavigatePrevious,
    canNavigateNext,
    updatePhotoIndex,
  } = usePhotoNavigation(sourceAlbumId);

  // Update photo index when photo changes
  useEffect(() => {
    if (photo) {
      updatePhotoIndex(photo.id);
    }
  }, [photo, updatePhotoIndex]);

  // Create handlers
  const {
    handleRetry,
    handlePreviousPhoto,
    handleNextPhoto,
    handleEditClick,
    handleCancelEdit,
    handleSaveEdit,
  } = createPhotoHandlers(
    setIsLoading,
    setRetryCount,
    setPhoto,
    setAllTags,
    setAllAlbums,
    setIsEditing,
    router,
    albumPhotos,
    photo,
    sourceAlbumId
  );

  // Try to get photo data from URL first, fall back to API if not available
  useEffect(() => {
    const photoData = searchParams.get('photo');

    async function fetchPhotoFromApi() {
      try {
        const response = await fetch(`/api/photos/${photoId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            // If we came from an album, go back to that album
            if (sourceAlbumId) {
              router.push(`/albums/${sourceAlbumId}`);
            } else {
              router.push('/albums');
            }
            return;
          }
          throw new Error('Failed to fetch photo');
        }

        const data = await response.json();
        setPhoto(normalizePhoto(data));
      } catch (error) {
        console.error('Error fetching photo:', error);
        setError('Failed to load photo');
      } finally {
        setIsLoading(false);
      }
    }

    if (photoData) {
      try {
        const parsedPhoto = JSON.parse(decodeURIComponent(photoData));
        setPhoto(normalizePhoto(parsedPhoto));
        // Remove photo data from URL without refreshing the page, but preserve the hash
        const hash = window.location.hash;
        const newUrl = `/photos/${photoId}${
          sourceAlbumId ? `?albumId=${sourceAlbumId}` : ''
        }${hash}`;
        window.history.replaceState({}, '', newUrl);
      } catch (error) {
        console.error('Failed to parse photo data:', error);
        fetchPhotoFromApi();
      }
    } else {
      fetchPhotoFromApi();
    }
  }, [photoId, searchParams, router, sourceAlbumId]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    const errorEvent = e.nativeEvent as ErrorEvent;

    // Log detailed error information
    const errorInfo = {
      photoId: photo?.id,
      url: photo?.url,
      src: target.src,
      retryCount,
      timestamp: new Date().toISOString(),
      errorType: target.src.startsWith('http')
        ? 'S3_LOAD_ERROR'
        : 'INVALID_URL',
      status: target.complete ? 'COMPLETE' : 'INCOMPLETE',
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      error: errorEvent.message || 'Unknown error',
      errorStack: errorEvent.error?.stack,
      // Add S3-specific error details
      s3Error:
        errorEvent.error?.name === 'S3Error'
          ? {
              code: errorEvent.error?.code,
              requestId: errorEvent.error?.requestId,
              statusCode: errorEvent.error?.statusCode,
            }
          : null,
    };

    // Log the error with more context
    console.error('Image load error:', {
      ...errorInfo,
      // Stringify the error object to ensure it's captured
      errorString: JSON.stringify(
        errorEvent,
        Object.getOwnPropertyNames(errorEvent)
      ),
    });

    // If we've exceeded retry attempts, show error state
    if (retryCount >= MAX_RETRIES) {
      setIsLoading(false);
      return;
    }

    // Implement exponential backoff for retries
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    console.log(
      `Retrying image load in ${backoffDelay}ms (attempt ${
        retryCount + 1
      }/${MAX_RETRIES})`
    );

    setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      setIsLoading(true);
    }, backoffDelay);
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-4 space-y-4'>
        <div className='w-full aspect-[4/3] md:w-1/3 mx-auto rounded-lg bg-muted animate-pulse' />
        <div className='space-y-2 max-w-2xl mx-auto'>
          <div className='h-6 w-3/4 mx-auto bg-muted animate-pulse rounded' />
          <div className='h-4 w-full bg-muted animate-pulse rounded' />
          <div className='h-4 w-2/3 bg-muted animate-pulse rounded' />
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className='container mx-auto p-4'>
        <Card className='max-w-4xl mx-auto'>
          <CardContent className='p-4 text-center'>
            <p className='text-destructive'>{error || 'Photo not found'}</p>
            <Button
              variant='secondary'
              className='mt-4'
              onClick={() =>
                router.push(
                  sourceAlbumId ? `/albums/${sourceAlbumId}` : '/albums'
                )
              }
            >
              Return to album
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className='min-h-screen'>
      <div className='container mx-auto p-4'>
        <Card className='max-w-4xl mx-auto'>
          <CardContent className='p-4 space-y-4'>
            <div>
              <div className='relative'>
                <PhotoNavigation
                  canNavigatePrevious={canNavigatePrevious}
                  canNavigateNext={canNavigateNext}
                  onPrevious={handlePreviousPhoto}
                  onNext={handleNextPhoto}
                />
                <PhotoDisplay
                  photo={photo}
                  isLoading={isLoading}
                  onLoad={() => {
                    setIsLoading(false);
                    setRetryCount(0);
                  }}
                  onError={handleImageError}
                  retryCount={retryCount}
                  onRetry={handleRetry}
                />
              </div>
              {isEditing ? (
                <PhotoEditForm
                  photo={photo}
                  allTags={allTags}
                  allAlbums={allAlbums}
                  onCancel={handleCancelEdit}
                  onSave={handleSaveEdit}
                />
              ) : (
                <PhotoInfo
                  photo={photo}
                  isAdmin={isAdmin}
                  onEdit={handleEditClick}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
