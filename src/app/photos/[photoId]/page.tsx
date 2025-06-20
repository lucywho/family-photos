/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MAX_RETRIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { PhotoEditForm } from './PhotoEditForm';
import { Header } from '@/components/layout/Header';
import { Photo, PhotoPageProps } from '@/types/photo';
import { Card, CardContent } from '@/components/ui/card';
import { PhotoInfo } from '@/components/photos/PhotoInfo';
import { useRouter, useSearchParams } from 'next/navigation';
import { PhotoDisplay } from '@/components/photos/PhotoDisplay';
import { usePhotoNavigation } from '@/lib/hooks/usePhotoNavigation';
import { PhotoNavigation } from '@/components/photos/PhotoNavigation';

export default function PhotoPage({ params }: PhotoPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [allAlbums, setAllAlbums] = useState([]);

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

  const handleRetry = () => {
    setRetryCount(0);
    setIsLoading(true);
  };

  const handlePreviousPhoto = () => {
    if (canNavigatePrevious && albumPhotos.length > 0) {
      const currentIndex = albumPhotos.findIndex((p) => p.id === photo?.id);
      if (currentIndex > 0) {
        const previousPhoto = albumPhotos[currentIndex - 1];
        navigateToPhoto(previousPhoto.id);
      }
    }
  };

  const handleNextPhoto = () => {
    if (canNavigateNext && albumPhotos.length > 0) {
      const currentIndex = albumPhotos.findIndex((p) => p.id === photo?.id);
      if (currentIndex < albumPhotos.length - 1) {
        const nextPhoto = albumPhotos[currentIndex + 1];
        navigateToPhoto(nextPhoto.id);
      }
    }
  };

  const navigateToPhoto = (newPhotoId: number) => {
    setIsLoading(true);
    setRetryCount(0);

    // Navigate to the new photo with hash to preserve scroll position
    const newUrl = `/photos/${newPhotoId}${
      sourceAlbumId ? `?albumId=${sourceAlbumId}` : ''
    }#photo-${newPhotoId}`;
    router.push(newUrl);
  };

  const handleEditClick = async () => {
    // Fetch tags and albums only when entering edit mode
    const [tags, albums] = await Promise.all([
      fetch('/api/tags').then((res) => res.json()),
      fetch('/api/albums/all').then((res) => res.json()),
    ]);
    if (tags) {
      setAllTags(tags);
    }
    setAllAlbums(albums);
    setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);
  const handleSaveEdit = async (updatedPhoto: Photo) => {
    try {
      const response = await fetch(`/api/photos/${updatedPhoto.id}`);
      if (response.ok) {
        const freshPhoto = await response.json();
        setPhoto(normalizePhoto(freshPhoto));
      } else {
        setPhoto(normalizePhoto(updatedPhoto));
      }
    } catch (err) {
      setPhoto(normalizePhoto(updatedPhoto));
    }
    setIsEditing(false);
  };

  // Helper to normalize photo object
  function normalizePhoto(photo: unknown): Photo {
    const p = photo as Partial<Photo> & {
      tags?: unknown[];
      albums?: unknown[];
    };
    return {
      ...p,
      tags: (p.tags ?? []).map((t) =>
        typeof t === 'string' ? t : (t as { name: string }).name
      ),
      albums: (p.albums ?? []).map((a) =>
        typeof a === 'object' && a !== null
          ? { id: (a as { id: number }).id, name: (a as { name: string }).name }
          : (a as { id: number; name: string })
      ),
    } as Photo;
  }

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
    <>
      <Header />
      <div className='container mx-auto p-4'>
        <Card className='max-w-4xl mx-auto'>
          <CardContent className='p-4 space-y-4'>
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
            <div className='relative'>
              <PhotoNavigation
                canNavigatePrevious={canNavigatePrevious}
                canNavigateNext={canNavigateNext}
                onPrevious={handlePreviousPhoto}
                onNext={handleNextPhoto}
              />
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
    </>
  );
}
