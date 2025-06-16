/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

interface Photo {
  id: number;
  url: string;
  title: string | null;
  date: string | null;
  notes: string | null;
  isFamilyOnly: boolean;
  tags: string[];
}

interface PhotoGridProps {
  photos: Photo[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <>
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </>
  );
}

function PhotoCard({ photo }: { photo: Photo }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/photos/${photo.id}`}>
      <Card className='h-full transition-colors hover:bg-accent'>
        <CardContent className='p-4'>
          <div className='aspect-square relative bg-muted rounded-lg overflow-hidden'>
            {!imageError ? (
              <img
                src={photo.url}
                alt={photo.title || 'Photo'}
                className='object-cover w-full h-full'
                onError={(e) => {
                  console.error(
                    `Failed to load image for photo ${photo.id}:`,
                    e
                  );
                  setImageError(true);
                }}
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-muted'>
                <ImageIcon className='h-12 w-12 text-muted-foreground' />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
