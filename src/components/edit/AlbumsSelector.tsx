import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Album {
  id: number;
  name: string;
}

interface AlbumsSelectorProps {
  albums: Album[];
  allAlbums: Album[];
  inputValue: string;
  error?: string | null;
  pending?: boolean;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (album: Album) => void;
  onSelect: (album: Album) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function AlbumsSelector({
  albums,
  allAlbums,
  inputValue,
  error,
  pending,
  onInputChange,
  onAdd,
  onRemove,
  onSelect,
  onInputKeyDown,
}: AlbumsSelectorProps) {
  return (
    <div>
      <label className='block font-medium mb-1'>Albums</label>
      <div className='flex flex-wrap gap-2 mb-2'>
        {albums.length > 0 ? (
          albums.map((album) => (
            <span
              key={album.name}
              className='inline-flex items-center bg-primary text-secondary px-2 py-1 rounded text-xs'
            >
              {album.name}
              {album.name !== 'All Photos' && (
                <button
                  type='button'
                  className='ml-1 hover:underline'
                  onClick={() => onRemove(album)}
                  aria-label={`Remove album ${album.name}`}
                >
                  <X size={16} className='text-destructive' />
                </button>
              )}
            </span>
          ))
        ) : (
          <span className='text-muted-foreground text-xs'>
            No albums selected
          </span>
        )}
      </div>
      <div className='flex gap-2 mb-2'>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          maxLength={20}
          placeholder='Add or select an album'
          className='border rounded px-2 py-1'
          disabled={pending}
          aria-label='Add album'
        />
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={onAdd}
          disabled={pending || !inputValue.trim()}
        >
          Add
        </Button>
      </div>
      {error && <div className='text-destructive text-xs mb-1'>{error}</div>}
      <div className='flex flex-wrap gap-2'>
        {allAlbums?.length > 0 ? (
          allAlbums
            .filter((album) => !albums.some((a) => a.name === album.name))
            .map((album) => (
              <button
                key={album.id}
                type='button'
                className='bg-secondary text-primary px-2 py-1 rounded text-xs hover:bg-primary hover:text-white'
                onClick={() => onSelect(album)}
                disabled={pending}
                aria-label={`Add to album ${album.name}`}
              >
                {album.name.toUpperCase()}
              </button>
            ))
        ) : (
          <span className='text-muted-foreground text-xs'></span>
        )}
      </div>
    </div>
  );
}
