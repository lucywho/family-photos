export interface Photo {
  id: number;
  url: string;
  title: string | null;
  date: string | null;
  notes: string | null;
  isFamilyOnly: boolean;
  tags: string[];
  albums: { id: number; name: string }[];
}

export interface AlbumPhoto {
  id: number;
  url: string;
  title: string | null;
  date: string | null;
}

export interface PhotosPage {
  photos: AlbumPhoto[];
  hasMore: boolean;
  isS3Available: boolean;
  totalCount: number;
  album: { id: number; name: string; _count: { photos: number } };
}

export interface QueryData {
  pages: PhotosPage[];
  pageParams: number[];
}

export interface PhotoPageProps {
  params: Promise<{ photoId: string }>;
}
