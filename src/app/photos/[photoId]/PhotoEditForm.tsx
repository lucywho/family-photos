'use client';
import { Button } from '@/components/ui/button';
interface Photo {
  id: number;
  url: string;
  title: string | null;
  date: string | null;
  notes: string | null;
  isFamilyOnly: boolean;
  tags: string[];
  albums: { id: number; name: string }[];
}

interface Tag {
  id: number;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Album {
  id: number;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface PhotoEditFormProps {
  photo: Photo;
  allTags?: Tag[];
  allAlbums?: Album[];
  onCancel: () => void;
  onSave: (updatedPhoto: Photo) => void;
}

export function PhotoEditForm({
  photo,
  allTags,
  allAlbums,
  onCancel,
  onSave,
}: PhotoEditFormProps) {
  return (
    <div>
      <h2 className='text-xl font-bold mb-2'>
        Edit: {photo.title || 'untitled'}
      </h2>
      <p>Total tags: {allTags?.length} </p>
      <p>Total albums: {allAlbums?.length}</p>
      <Button variant='secondary' onClick={onCancel}>
        Cancel
      </Button>
      {/* Save button and form logic will go here */}
    </div>
  );
}
