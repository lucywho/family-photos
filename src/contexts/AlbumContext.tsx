'use client';

import { createContext, useContext, ReactNode } from 'react';

interface Album {
  id: number;
  name: string;
  _count: {
    photos: number;
  };
}

interface AlbumContextType {
  album: Album | null;
}

const AlbumContext = createContext<AlbumContextType | undefined>(undefined);

export function AlbumProvider({
  children,
  album,
}: {
  children: ReactNode;
  album: Album | null;
}) {
  return (
    <AlbumContext.Provider value={{ album }}>{children}</AlbumContext.Provider>
  );
}

export function useAlbum() {
  const context = useContext(AlbumContext);
  if (context === undefined) {
    throw new Error('useAlbum must be used within an AlbumProvider');
  }
  return context;
}
