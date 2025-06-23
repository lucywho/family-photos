import { normalizePhoto } from '@/lib/utils';
import { type Photo, type AlbumPhoto } from '@/types/photo';

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

export const createPhotoHandlers = (
  setIsLoading: (loading: boolean) => void,
  setRetryCount: (count: number) => void,
  setPhoto: (photo: Photo) => void,
  setAllTags: (tags: Tag[]) => void,
  setAllAlbums: (albums: Album[]) => void,
  setIsEditing: (editing: boolean) => void,
  router: { push: (url: string) => void },
  albumPhotos: AlbumPhoto[],
  currentPhoto: Photo | null,
  sourceAlbumId?: string | null
) => {
  const handleRetry = () => {
    setRetryCount(0);
    setIsLoading(true);
  };

  const handlePreviousPhoto = () => {
    if (albumPhotos.length > 0 && currentPhoto) {
      const currentIndex = albumPhotos.findIndex(
        (p) => p.id === currentPhoto.id
      );
      if (currentIndex > 0) {
        const previousPhoto = albumPhotos[currentIndex - 1];
        navigateToPhoto(previousPhoto.id);
      }
    }
  };

  const handleNextPhoto = () => {
    if (albumPhotos.length > 0 && currentPhoto) {
      const currentIndex = albumPhotos.findIndex(
        (p) => p.id === currentPhoto.id
      );
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
    } catch {
      setPhoto(normalizePhoto(updatedPhoto));
    }
    setIsEditing(false);
  };

  return {
    handleRetry,
    handlePreviousPhoto,
    handleNextPhoto,
    handleEditClick,
    handleCancelEdit,
    handleSaveEdit,
  };
};
