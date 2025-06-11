/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface Album {
  id: string;
  name: string;
  photoCount: number;
  thumbnailUrl?: string;
}

interface AlbumGridProps {
  albums: Album[];
  defaultIcon: React.ReactNode;
}

export function AlbumGrid({ albums, defaultIcon }: AlbumGridProps) {
  return (
    <>
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} defaultIcon={defaultIcon} />
      ))}
    </>
  );
}

function AlbumCard({
  album,
  defaultIcon,
}: {
  album: Album;
  defaultIcon: React.ReactNode;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/albums/${album.id}`}>
      <Card className='h-full transition-colors hover:bg-accent'>
        <CardContent className='p-4'>
          <div className='aspect-square relative mb-2 bg-muted rounded-lg overflow-hidden'>
            {!imageError && album.thumbnailUrl ? (
              <img
                src={album.thumbnailUrl}
                alt={`${album.name} thumbnail`}
                className='object-cover w-full h-full'
                onError={(e) => {
                  console.error(
                    `Failed to load image for album ${album.name}:`,
                    e
                  );
                  setImageError(true);
                }}
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center'>
                {defaultIcon}
              </div>
            )}
          </div>
          <div className='space-y-1'>
            <h3 className='font-semibold line-clamp-1'>{album.name}</h3>
            <p className='text-sm text-muted-foreground'>
              {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
