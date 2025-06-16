'use client';

import { useEffect, useState } from 'react';
import { AlbumProvider } from '@/contexts/AlbumContext';
import { Header } from '@/components/layout/Header';

interface Album {
  id: number;
  name: string;
  _count: {
    photos: number;
  };
}

async function fetchAlbum(albumId: number): Promise<Album> {
  const response = await fetch(`/api/albums/${albumId}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch album');
  }
  return response.json();
}

export default function AlbumLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { albumId: string };
}) {
  const albumId = parseInt(params.albumId, 10);
  const [album, setAlbum] = useState<Album | null>(null);

  // Fetch album data when the component mounts
  useEffect(() => {
    fetchAlbum(albumId)
      .then((albumData) => {
        setAlbum(albumData);
      })
      .catch((error) => {
        console.error('Failed to fetch album:', error);
      });
  }, [albumId]);

  return (
    <AlbumProvider album={album}>
      <Header />
      {children}
    </AlbumProvider>
  );
}
