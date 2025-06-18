import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlbumPhoto, QueryData, PhotosPage } from '@/types/photo';

export function usePhotoNavigation(sourceAlbumId: string | null) {
  const queryClient = useQueryClient();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(-1);

  // Get album photos from React Query cache
  const getAlbumPhotos = useCallback((): AlbumPhoto[] => {
    if (!sourceAlbumId) return [];

    try {
      const cache = queryClient.getQueryCache();
      const query = cache.find({
        queryKey: ['photos', parseInt(sourceAlbumId, 10)],
      });
      const data = query?.state.data as QueryData | undefined;

      if (data?.pages) {
        // Flatten all pages and extract the photo data
        return data.pages.flatMap((page: PhotosPage) =>
          page.photos.map((photo: AlbumPhoto) => ({
            id: photo.id,
            url: photo.url,
            title: photo.title,
            date: photo.date,
          }))
        );
      }
    } catch (error) {
      console.error('Error getting album photos from cache:', error);
    }

    return [];
  }, [sourceAlbumId, queryClient]);

  // Update current photo index when photo changes
  const updatePhotoIndex = useCallback(
    (photoId: number) => {
      if (sourceAlbumId) {
        const albumPhotos = getAlbumPhotos();
        const index = albumPhotos.findIndex((p) => p.id === photoId);
        setCurrentPhotoIndex(index);
      }
    },
    [sourceAlbumId, getAlbumPhotos]
  );

  // Check if navigation buttons should be enabled
  const albumPhotos = getAlbumPhotos();
  const canNavigatePrevious = currentPhotoIndex > 0 && albumPhotos.length > 0;
  const canNavigateNext =
    currentPhotoIndex < albumPhotos.length - 1 && albumPhotos.length > 0;

  return {
    albumPhotos,
    currentPhotoIndex,
    canNavigatePrevious,
    canNavigateNext,
    updatePhotoIndex,
  };
}
