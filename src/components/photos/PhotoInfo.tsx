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
      <h1 className='text-2xl font-semibold text-center'>
        {photo.title || 'untitled'}
      </h1>
      <div className='text-muted-foreground text-center my-2'>
        <Badge variant='default'>{formattedDate || 'undated'}</Badge>
      </div>
      <p className='text-muted-foreground text-center'>
        {photo.notes || 'no notes'}
      </p>
      <p className='w-full border border-secondary border-t-0 border-x-0 pb-4 mb-4'></p>
      <div className='flex flex-row justify-around gap-4'>
        {/* Tags section */}
        <div className='flex flex-wrap flex-col flex-1 gap-2'>
          <p className='text-center text-sm text-secondary'>Tags:</p>
          <span className='md:flex-row flex-wrap md:mx-auto'>
            {photo.tags && photo.tags.length > 0 ? (
              photo.tags.map((tag) => (
                <Badge key={tag} variant='outline' className='mx-1'>
                  {tag}
                </Badge>
              ))
            ) : (
              <p className='text-center text-sm text-secondary'>
                this photo has no tags
              </p>
            )}
          </span>
        </div>

        {/* Albums section */}
        {photo.albums && photo.albums.length > 0 && (
          <div className='flex flex-wrap flex-col flex-1 gap-2'>
            <p className='text-center text-sm text-secondary'>Albums:</p>
            <span className='flex-row flex-wrap mx-auto'>
              {photo.albums.map((album) => (
                <Badge key={album.id} variant='secondary' className='mx-1'>
                  {album.name}
                </Badge>
              ))}
            </span>
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
