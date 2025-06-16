'use client';

import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AlbumGrid } from '@/components/albums/AlbumGrid';
import { AlbumSkeleton } from '@/components/albums/AlbumSkeleton';
import { ALBUMS_PER_PAGE } from '@/lib/constants';

interface Album {
  id: string;
  name: string;
  photoCount: number;
  thumbnailUrl?: string;
}

interface AlbumsResponse {
  albums: Album[];
  hasMore: boolean;
  isS3Available: boolean;
}

async function fetchAlbums(page: number): Promise<AlbumsResponse> {
  const response = await fetch(
    `/api/albums?page=${page}&limit=${ALBUMS_PER_PAGE}`,
    {
      credentials: 'include',
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch albums');
  }
  const data = await response.json();
  return data;
}

export default function AlbumsPage() {
  const [s3Error, setS3Error] = useState(false);
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['albums'],
      queryFn: ({ pageParam }) => fetchAlbums(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage: AlbumsResponse, pages: AlbumsResponse[]) => {
        if (lastPage.albums.length < ALBUMS_PER_PAGE) return undefined;
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

  return (
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
            Array.from({ length: ALBUMS_PER_PAGE }).map((_, i) => (
              <AlbumSkeleton key={i} />
            ))
          : // Show albums
            data?.pages.map((page: AlbumsResponse, i: number) => (
              <AlbumGrid key={i} albums={page.albums} />
            ))}
      </div>

      {/* Loading indicator for infinite scroll */}
      <div ref={ref} className='h-20 flex items-center justify-center'>
        {isFetchingNextPage && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
            {Array.from({ length: 4 }).map((_, i) => (
              <AlbumSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
