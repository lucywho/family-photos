import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface PhotoPosition {
  albumId: number;
  photoId: number;
  page: number;
  scrollPosition: number;
  timestamp: number;
}

interface QueryDataWithMeta {
  pages: unknown[];
  pageParams: unknown[];
  meta?: {
    lastPosition?: PhotoPosition | null;
  };
}

export function usePhotoPosition() {
  const queryClient = useQueryClient();

  const getPhotoPosition = useCallback(
    (albumId: number): PhotoPosition | null => {
      const cache = queryClient.getQueryCache();
      const query = cache.find({ queryKey: ['photos', albumId] });
      const data = query?.state.data as QueryDataWithMeta | undefined;
      return data?.meta?.lastPosition || null;
    },
    [queryClient]
  );

  const setPhotoPosition = useCallback(
    (
      albumId: number,
      photoId: number,
      page: number,
      scrollPosition: number
    ) => {
      const position: PhotoPosition = {
        albumId,
        photoId,
        page,
        scrollPosition,
        timestamp: Date.now(),
      };

      // Update the query cache with the new position
      queryClient.setQueryData(
        ['photos', albumId],
        (oldData: QueryDataWithMeta | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            meta: {
              ...oldData.meta,
              lastPosition: position,
            },
          };
        }
      );
    },
    [queryClient]
  );

  const clearPhotoPosition = useCallback(
    (albumId: number) => {
      queryClient.setQueryData(
        ['photos', albumId],
        (oldData: QueryDataWithMeta | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            meta: {
              ...oldData.meta,
              lastPosition: null,
            },
          };
        }
      );
    },
    [queryClient]
  );

  return {
    getPhotoPosition,
    setPhotoPosition,
    clearPhotoPosition,
  };
}
