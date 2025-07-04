'use client';

import { AlertCircle } from 'lucide-react';
import { PageTitle } from '@/shared/components/layout';
import { ITEMS_PER_PAGE } from '@/shared/constants';
import { AlbumProvider } from '@/contexts/AlbumContext';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useEffect, useState, useRef } from 'react';
import { Alert, AlertDescription } from '@/shared/components/ui';
import { PhotoGrid, PhotoSkeleton } from '@/features/photos/components';
import { usePhotoPosition } from '@/features/photos/hooks/usePhotoPosition';
import { Photo, Album } from '@/shared/types/shared-types';

interface AlbumWithCount extends Album {
  _count: {
    photos: number;
  };
}

interface PhotosResponse {
  photos: Photo[];
  hasMore: boolean;
  isS3Available: boolean;
  totalCount: number;
  album: AlbumWithCount;
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
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const { ref, inView } = useInView();
  const photoRefs = useRef<Map<number, HTMLAnchorElement>>(new Map());
  const scrollPositionRef = useRef<number>(0);
  const { getPhotoPosition, setPhotoPosition } = usePhotoPosition();

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

  // Handle efficient scroll restoration when returning from photo page
  useEffect(() => {
    if (hasRestoredPosition || !data?.pages.length) return;

    const hash = window.location.hash;
    if (hash.startsWith('#photo-')) {
      const targetPhotoId = parseInt(hash.replace('#photo-', ''), 10);

      // First, check if we have cached position data
      const cachedPosition = getPhotoPosition(albumId);

      if (cachedPosition && cachedPosition.photoId === targetPhotoId) {
        // We have cached data, load the specific page and restore position
        const pagesToLoad = Math.max(
          0,
          cachedPosition.page - data.pages.length
        );

        if (pagesToLoad > 0) {
          const loadPages = async () => {
            for (let i = 0; i < pagesToLoad; i++) {
              await fetchNextPage();
            }
            // Restore scroll position
            setTimeout(() => {
              window.scrollTo(0, cachedPosition.scrollPosition);
              scrollToPhoto(targetPhotoId);
            }, 100);
          };
          loadPages();
        } else {
          // Restore scroll position immediately
          setTimeout(() => {
            window.scrollTo(0, cachedPosition.scrollPosition);
            scrollToPhoto(targetPhotoId);
          }, 100);
        }
      } else {
        // No cached data, use the efficient page calculation approach
        let targetPage = 1;
        let found = false;

        for (let pageIndex = 0; pageIndex < data.pages.length; pageIndex++) {
          const page = data.pages[pageIndex];
          const photoInPage = page.photos.findIndex(
            (photo) => photo.id === targetPhotoId
          );

          if (photoInPage !== -1) {
            targetPage = pageIndex + 1;
            found = true;
            break;
          }
        }

        if (found) {
          const pagesToLoad = targetPage - data.pages.length;

          if (pagesToLoad > 0) {
            const loadPages = async () => {
              for (let i = 0; i < pagesToLoad; i++) {
                await fetchNextPage();
              }
              setTimeout(() => scrollToPhoto(targetPhotoId), 100);
            };
            loadPages();
          } else {
            setTimeout(() => scrollToPhoto(targetPhotoId), 100);
          }
        } else {
          // Photo not found in loaded pages, estimate which page it's on
          const estimatedPage = Math.ceil(targetPhotoId / ITEMS_PER_PAGE);
          const pagesToLoad = Math.max(0, estimatedPage - data.pages.length);

          if (pagesToLoad > 0) {
            const loadPages = async () => {
              for (let i = 0; i < pagesToLoad; i++) {
                await fetchNextPage();
              }
              setTimeout(() => scrollToPhoto(targetPhotoId), 100);
            };
            loadPages();
          }
        }
      }

      setHasRestoredPosition(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [
    data?.pages,
    hasRestoredPosition,
    fetchNextPage,
    albumId,
    getPhotoPosition,
  ]);

  const scrollToPhoto = (photoId: number) => {
    const photoElement = photoRefs.current.get(photoId);
    if (photoElement) {
      photoElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Store scroll position and current photo when user scrolls or clicks photos
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;

      // Find which photo is currently most visible and store its position
      if (data?.pages.length) {
        const currentPage = Math.ceil(scrollPositionRef.current / 800) + 1; // Rough estimate
        const visiblePhotos = data.pages.flatMap((page) => page.photos);

        // Find the photo closest to the center of the viewport
        const viewportCenter = window.innerHeight / 2;
        let closestPhoto = visiblePhotos[0];
        let minDistance = Infinity;

        visiblePhotos.forEach((photo) => {
          const element = photoRefs.current.get(photo.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            const distance = Math.abs(
              rect.top + rect.height / 2 - viewportCenter
            );
            if (distance < minDistance) {
              minDistance = distance;
              closestPhoto = photo;
            }
          }
        });

        if (closestPhoto) {
          setPhotoPosition(
            albumId,
            closestPhoto.id,
            currentPage,
            scrollPositionRef.current
          );
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data?.pages, albumId, setPhotoPosition]);

  // Show error only for non-S3 related issues
  if (status === 'error' && !data?.pages[0]) {
    return (
      <div className='container mx-auto p-4'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Sorry, something has gone wrong. You may have been automatically
            logged out after a period of inactivity. Please try logging in
            again. If the problem persists, please contact the administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const album = data?.pages[0]?.album ?? null;
  const albumName = album ? album.name : '';

  return (
    <AlbumProvider album={album}>
      <PageTitle pageTitle={albumName} />
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
                <PhotoGrid key={i} photos={page.photos} photoRefs={photoRefs} />
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
