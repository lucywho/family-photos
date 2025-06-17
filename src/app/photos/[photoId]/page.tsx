/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ImageIcon, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import React from 'react';
import { Header } from '@/components/layout/Header';

interface Photo {
  id: number;
  url: string;
  title: string | null;
  date: string | null;
  notes: string | null;
  isFamilyOnly: boolean;
  tags: string[];
  albums: { id: number; name: string }[];
}

interface PhotoPageProps {
  params: Promise<{ photoId: string }>;
}

function PhotoSkeleton() {
  return (
    <div className='container mx-auto p-4 space-y-4'>
      <Skeleton className='w-full aspect-[4/3] md:w-1/3 mx-auto rounded-lg' />
      <div className='space-y-2 max-w-2xl mx-auto'>
        <Skeleton className='h-6 w-3/4 mx-auto' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
        <div className='flex flex-wrap gap-2 justify-center'>
          <Skeleton className='h-6 w-20 rounded-full' />
          <Skeleton className='h-6 w-24 rounded-full' />
          <Skeleton className='h-6 w-16 rounded-full' />
        </div>
      </div>
    </div>
  );
}

export default function PhotoPage({ params }: PhotoPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Get the resolved params
  const { photoId } = React.use(params);
  const sourceAlbumId = searchParams.get('albumId');

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
        setPhoto(data);
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
        setPhoto(parsedPhoto);
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
      setImageError(true);
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
      setImageError(false);
      setIsLoading(true);
    }, backoffDelay);
  };

  const handleRetry = () => {
    setRetryCount(0);
    setImageError(false);
    setIsLoading(true);
  };

  if (isLoading) {
    return <PhotoSkeleton />;
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
  const formattedDate = photo.date
    ? format(new Date(photo.date), 'dd/MM/yyyy')
    : null;

  return (
    <>
      <Header />
      <div className='container mx-auto p-4'>
        <Card className='max-w-4xl mx-auto'>
          <CardContent className='p-4 space-y-4'>
            {/* Photo */}
            <div className='relative w-full max-w-2xl mx-auto bg-muted rounded-lg overflow-hidden'>
              {isLoading && <PhotoSkeleton />}
              {!imageError ? (
                <img
                  src={photo.url}
                  alt={photo.title || 'Photo'}
                  className={`object-cover w-full h-full ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                  } transition-opacity duration-300`}
                  onLoad={() => {
                    setIsLoading(false);
                    setImageError(false);
                    setRetryCount(0);
                  }}
                  onError={handleImageError}
                  loading='lazy'
                  key={`photo-${photo.id}-retry-${retryCount}`}
                />
              ) : (
                <div className='w-full h-full flex flex-col items-center justify-center bg-muted gap-4'>
                  <ImageIcon className='h-12 w-12 text-muted-foreground' />
                  <p className='text-sm text-muted-foreground text-center px-4'>
                    {retryCount >= MAX_RETRIES
                      ? 'Sorry, your photos are currently unavailable'
                      : 'Unable to load image'}
                  </p>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={handleRetry}
                    className='flex items-center gap-2'
                  >
                    <RefreshCw className='h-4 w-4' />
                    Try Again
                  </Button>
                </div>
              )}
            </div>

            <h1 className='text-2xl font-semibold text-center'>
              {photo.title || 'untitled'}
            </h1>
            <p className='text-muted-foreground text-center'>
              {' '}
              <Badge variant='default'>{formattedDate || 'undated'}</Badge>
            </p>
            <p className='text-muted-foreground text-center'>
              {photo.notes || 'no notes'}
            </p>
            <p className='w-full border border-secondary border-t-0 border-x-0 pb-4'></p>

            <div className='flex flex-row items-center justify-around gap-4'>
              {/* Tags section */}
              {photo.tags && photo.tags.length > 0 ? (
                <div className='flex flex-wrap flex-col gap-2 justify-center'>
                  <p className='w-full text-center font-medium'>Tags:</p>
                  {photo.tags.map((tag) => (
                    <Badge key={tag} variant='outline'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-center text-sm text-secondary'>
                  this photo has no tags
                </p>
              )}

              {/* Albums section */}
              {photo.albums && photo.albums.length > 0 && (
                <div className='flex flex-wrap flex-col gap-2 justify-center'>
                  <p className='text-center text-sm text-secondary'>Albums:</p>
                  {photo.albums.map((album) => (
                    <Badge key={album.id} variant='secondary'>
                      {album.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Edit button for admin */}
            {isAdmin && (
              <div className='flex justify-center pt-4'>
                <Button variant='secondary' asChild>
                  <a href={`/photos/${photo.id}/edit`}>Edit</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
