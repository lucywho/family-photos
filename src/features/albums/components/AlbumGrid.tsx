/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface Album {
  id: string | number;
  name: string;
  photoCount: number;
  thumbnailUrl?: string;
}

interface AlbumGridProps {
  albums: Album[];
}

export function AlbumGrid({ albums }: AlbumGridProps) {
  const [imageError, setImageError] = useState(false);
  return (
    <>
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/albums/${album.id}`}
          className='group relative aspect-square overflow-hidden rounded-lg bg-muted transition-colors hover:bg-muted/80'
        >
          {album.thumbnailUrl && !imageError ? (
            <img
              src={album.thumbnailUrl}
              alt=''
              className='h-full w-full object-cover transition-transform group-hover:scale-105'
              onError={() => setImageError(true)}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-muted'>
              <ImageIcon className='h-12 w-12 text-muted-foreground' />
            </div>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4'>
            <div className='flex h-full flex-col justify-end'>
              <h2 className='text-lg font-semibold text-white'>{album.name}</h2>
              <p className='text-sm text-white/80'>
                {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}
