'use client';

import { format } from 'date-fns';
import { Photo } from '@/types/photo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PhotoInfoProps {
  photo: Photo;
  isAdmin: boolean;
  onEdit?: () => void;
}

export function PhotoInfo({ photo, isAdmin, onEdit }: PhotoInfoProps) {
  const formattedDate = photo.date
    ? format(new Date(photo.date), 'dd/MM/yyyy')
    : null;

  return (
    <div className='px-16'>
      {' '}
      {/* Add padding to prevent content overlap with navigation buttons */}
      <h1 className='text-2xl font-semibold text-center'>
        {photo.title || 'untitled'}
      </h1>
      <div className='text-muted-foreground text-center my-2'>
        <Badge variant='default'>{formattedDate || 'undated'}</Badge>
      </div>
      <p className='text-muted-foreground text-center'>
        {photo.notes || 'no notes'}
      </p>
      <p className='w-full border border-secondary border-t-0 border-x-0 pb-4'></p>
      <div className='flex flex-row items-center justify-around gap-4'>
        {/* Tags section */}
        <div className='flex flex-wrap flex-col gap-2 justify-center'>
          <p className='text-center text-sm text-secondary'>Tags:</p>
          {photo.tags && photo.tags.length > 0 ? (
            photo.tags.map((tag) => (
              <Badge key={tag} variant='outline'>
                {tag}
              </Badge>
            ))
          ) : (
            <p className='text-center text-sm text-secondary'>
              this photo has no tags
            </p>
          )}
        </div>

        {/* Albums section */}
        {photo.albums && photo.albums.length > 0 && (
          <div className='flex flex-wrap flex-col gap-2 justify-center'>
            <p className='text-center text-sm text-secondary'>Albums:</p>
            {photo.albums.map((album) => (
              <Badge key={album.id} variant='secondary'>
                {album.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {/* Edit button for admin */}
      {isAdmin && (
        <div className='flex justify-center pt-4'>
          <Button variant='secondary' onClick={onEdit}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}
