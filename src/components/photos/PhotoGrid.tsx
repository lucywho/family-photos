/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { RefObject } from 'react';
import { ImageIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';

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
  photoRefs?: RefObject<Map<number, HTMLAnchorElement>>;
}

export function PhotoGrid({ photos, photoRefs }: PhotoGridProps) {
  const pathname = usePathname();
  const albumId = pathname.split('/')[2]; // Extract albumId from /albums/[albumId]

  return (
    <>
      {photos.map((photo) => {
        const photoUrl = `/photos/${
          photo.id
        }?albumId=${albumId}&photo=${encodeURIComponent(
          JSON.stringify(photo)
        )}#photo-${photo.id}`;

        return (
          <Link
            key={photo.id}
            href={photoUrl}
            className='block transition-transform hover:scale-[1.02]'
            ref={(el) => {
              if (el && photoRefs?.current) {
                photoRefs.current.set(photo.id, el);
              }
            }}
          >
            <Card className='overflow-hidden'>
              <CardContent className='p-0 aspect-[4/3] relative bg-muted'>
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={photo.title || 'Photo'}
                    className='object-cover w-full h-full'
                    loading='lazy'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <ImageIcon className='h-12 w-12 text-muted-foreground' />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </>
  );
}
