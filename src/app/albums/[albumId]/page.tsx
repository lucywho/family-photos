'use client';

import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PhotoGrid } from '@/components/photos/PhotoGrid';
import { PhotoSkeleton } from '@/components/photos/PhotoSkeleton';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import React from 'react';
import { AlbumProvider } from '@/contexts/AlbumContext';

interface Photo {
  id: number;
  url: string;
  title: string | null;
  date: string | null;
  notes: string | null;
  isFamilyOnly: boolean;
  tags: string[];
}

interface Album {
  id: number;
  name: string;
  _count: {
    photos: number;
  };
}

interface PhotosResponse {
  photos: Photo[];
  hasMore: boolean;
  isS3Available: boolean;
  totalCount: number;
  album: Album;
}

async function fetchPhotos(
  albumId: number,
  page: number
): Promise<PhotosResponse> {
  const response = await fetch(
    `/api/albums/${albumId}/photos?page=${page}&limit=${ITEMS_PER_PAGE}`,
    {
      credentials: 'include',
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch photos');
  }
  return response.json();
}

// Client component that handles the gallery view
function GalleryView({ albumId }: { albumId: number }) {
  const [s3Error, setS3Error] = useState(false);
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['photos', albumId],
      queryFn: ({ pageParam }) => fetchPhotos(albumId, pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage: PhotosResponse, pages: PhotosResponse[]) => {
        if (lastPage.photos.length < ITEMS_PER_PAGE) return undefined;
        return pages.length + 1;
      },
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update S3 error state when we get the first page of data
  useEffect(() => {
    if (data?.pages[0] && !data.pages[0].isS3Available) {
      setS3Error(true);
    }
  }, [data?.pages]);

  // Show error only for non-S3 related issues
  if (status === 'error' && !data?.pages[0]) {
    return (
      <div className='container mx-auto p-4'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>Sorry, something has gone wrong</AlertDescription>
        </Alert>
      </div>
    );
  }

  const album = data?.pages[0]?.album ?? null;

  return (
    <AlbumProvider album={album}>
      <div className='container mx-auto p-4'>
        {s3Error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Photos are currently unavailable, but you can still browse albums
            </AlertDescription>
          </Alert>
        )}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {status === 'pending'
            ? // Show skeleton loading state
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <PhotoSkeleton key={i} />
              ))
            : // Show photos
              data?.pages.map((page: PhotosResponse, i: number) => (
                <PhotoGrid key={i} photos={page.photos} />
              ))}
        </div>

        {/* Loading indicator for infinite scroll */}
        <div ref={ref} className='h-20 flex items-center justify-center'>
          {isFetchingNextPage && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
              {Array.from({ length: 4 }).map((_, i) => (
                <PhotoSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AlbumProvider>
  );
}

// Server component that handles params
export default function GalleryPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = React.use(params);
  return <GalleryView albumId={parseInt(albumId, 10)} />;
}
