'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { AlbumProvider } from '@/contexts/AlbumContext';

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

// Client component that handles the album data
function AlbumLayoutContent({
  albumId,
  children,
}: {
  albumId: string;
  children: React.ReactNode;
}) {
  const [album, setAlbum] = useState<Album | null>(null);

  // Fetch album data when the component mounts
  useEffect(() => {
    const id = parseInt(albumId, 10);
    fetchAlbum(id)
      .then((albumData) => {
        setAlbum(albumData);
      })
      .catch((error) => {
        console.error('Failed to fetch album:', error);
      });
  }, [albumId]);

  return <AlbumProvider album={album}>{children}</AlbumProvider>;
}

// Server component that handles params
export default function AlbumLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = React.use(params);
  return <AlbumLayoutContent albumId={albumId}>{children}</AlbumLayoutContent>;
}
