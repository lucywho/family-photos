/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Button, Skeleton } from '@/shared/components/ui';
import { ImageIcon, RefreshCw } from 'lucide-react';

import { Photo } from '@/shared/types/shared-types';

interface PhotoDisplayProps {
  photo: Photo;
  isLoading: boolean;
  onLoad: () => void;
  onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  retryCount: number;
  onRetry: () => void;
}

export function PhotoDisplay({
  photo,
  isLoading,
  onLoad,
  onError,
  retryCount,
  onRetry,
}: PhotoDisplayProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setImageError(true);
    onError(e);
  };

  const handleRetry = () => {
    setImageError(false);
    onRetry();
  };

  return (
    <div className='relative w-full max-w-2xl mx-auto bg-muted rounded-lg overflow-hidden'>
      {isLoading && <PhotoSkeleton />}
      {!imageError ? (
        <img
          src={photo.url}
          alt={photo.notes || 'this photo has no description yet'}
          className={`object-cover w-full h-full ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
          onLoad={() => {
            setImageError(false);
            onLoad();
          }}
          onError={handleImageError}
          loading='lazy'
          key={`photo-${photo.id}-retry-${retryCount}`}
        />
      ) : (
        <div className='w-full h-full flex flex-col items-center justify-center bg-muted gap-4'>
          <ImageIcon className='h-12 w-12 text-muted-foreground' />
          <p className='text-sm text-muted-foreground text-center px-4'>
            Sorry, your photos are currently unavailable
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
  );
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
