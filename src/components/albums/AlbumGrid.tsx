/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
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
  return (
    <>
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/albums/${album.id}`}
          className='group relative aspect-square overflow-hidden rounded-lg bg-muted transition-colors hover:bg-muted/80'
        >
          {album.thumbnailUrl ? (
            <img
              src={album.thumbnailUrl}
              alt={album.name}
              className='h-full w-full object-cover transition-transform group-hover:scale-105'
              onError={(e) => {
                // Replace the img element with the default icon on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const iconContainer = document.createElement('div');
                  iconContainer.className =
                    'flex h-full w-full items-center justify-center bg-muted';
                  // Create a new div to hold the icon
                  const iconWrapper = document.createElement('div');
                  iconWrapper.innerHTML =
                    '<svg class="h-12 w-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                  iconContainer.appendChild(iconWrapper);
                  parent.appendChild(iconContainer);
                }
              }}
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
