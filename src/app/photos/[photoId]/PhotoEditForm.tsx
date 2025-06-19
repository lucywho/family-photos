'use client';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { TitleInput } from '@/components/edit/TitleInput';
import { NotesInput } from '@/components/edit/NotesInput';
import { DateInput } from '@/components/edit/DateInput';
import { FamilyOnlyCheckbox } from '@/components/edit/FamilyOnlyCheckbox';
import { TagsSelector } from '@/components/edit/TagsSelector';
import { AlbumsSelector } from '@/components/edit/AlbumsSelector';
// import { X } from 'lucide-react'; // No longer needed
// import { updatePhoto } from '@/app/actions/photos'; // Uncomment when server action is ready

interface Photo {
  id: number;
  url: string;
  title: string | null;
  date: string | null;
  notes: string | null;
  isFamilyOnly: boolean;
  tags?: string[];
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
  allTags: Tag[];
  allAlbums: Album[];
  onCancel: () => void;
  onSave: (updatedPhoto: Photo) => void;
}

export function PhotoEditForm({
  photo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allTags: _allTags, // will be used in Stage 5
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allAlbums: _allAlbums, // will be used in Stage 6
  onCancel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSave: _onSave, // will be used in Stage 7
}: PhotoEditFormProps) {
  // Placeholder server action and optimistic state
  // const [formState, formAction] = useActionState(updatePhoto, initialState);
  const { pending } = useFormStatus();
  // Title
  const [title, setTitle] = useState(photo.title || '');
  const [titleError, setTitleError] = useState<string | null>(null);
  // Notes
  const [notes, setNotes] = useState(photo.notes || '');
  const [notesError, setNotesError] = useState<string | null>(null);
  // Date
  const [date, setDate] = useState(photo.date ? formatDate(photo.date) : '');
  const [dateError, setDateError] = useState<string | null>(null);
  // Family only
  const [familyOnly, setFamilyOnly] = useState(!!photo.isFamilyOnly);
  // Tags
  const [tags, setTags] = useState<string[]>(photo.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  // Albums
  const allAlbumsSafe = Array.isArray(_allAlbums) ? _allAlbums : [];
  const [albums, setAlbums] = useState<{ id: number; name: string }[]>(
    photo.albums && photo.albums.length > 0
      ? photo.albums
      : allAlbumsSafe.filter((a) => a.name === 'All Photos')
  );
  const [albumInput, setAlbumInput] = useState('');
  const [albumError, setAlbumError] = useState<string | null>(null);

  // Helper to format ISO date to dd/mm/yyyy
  function formatDate(iso: string) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Title validation
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (value.length > 70) {
      setTitleError('Title must be 70 characters or less');
    } else {
      setTitleError(null);
    }
  };

  // Notes validation
  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (value.length > 1000) {
      setNotesError('Notes must be 1000 characters or less');
    } else {
      setNotesError(null);
    }
  };

  // Date validation (dd/mm/yyyy)
  const handleDateChange = (value: string) => {
    setDate(value);
    if (value && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      setDateError('Date must be in dd/mm/yyyy format');
    } else {
      setDateError(null);
    }
  };
  const handleClearDate = () => {
    setDate('');
    setDateError(null);
  };

  // Family only toggle
  const handleFamilyOnlyChange = (checked: boolean) => {
    setFamilyOnly(checked);
  };

  // Tags logic
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (!newTag) return;
    if (newTag.length > 20) {
      setTagError('Tag must be 20 characters or less');
      return;
    }
    if (tags.includes(newTag)) {
      setTagError('Tag already selected');
      return;
    }
    setTags([...tags, newTag]);
    setTagInput('');
    setTagError(null);
  };
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };
  const handleSelectTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTagError('Tag already selected');
      return;
    }
    setTags([...tags, tag]);
    setTagError(null);
  };
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Albums logic
  const handleAddAlbum = () => {
    const newAlbum = albumInput.trim();
    if (!newAlbum) return;
    if (newAlbum.length > 20) {
      setAlbumError('Album name must be 20 characters or less');
      return;
    }
    if (albums.some((a) => a.name.toLowerCase() === newAlbum.toLowerCase())) {
      setAlbumError('Album already selected');
      return;
    }
    setAlbums([...albums, { id: 0, name: newAlbum }]);
    setAlbumInput('');
    setAlbumError(null);
  };
  const handleRemoveAlbum = (album: { id: number; name: string }) => {
    if (album.name === 'All Photos') return;
    setAlbums(albums.filter((a) => a.name !== album.name));
  };
  const handleSelectAlbum = (album: { id: number; name: string }) => {
    if (albums.some((a) => a.name === album.name)) {
      setAlbumError('Album already selected');
      return;
    }
    setAlbums([...albums, album]);
    setAlbumError(null);
  };
  const handleAlbumInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAlbum();
    }
  };

  // Error boundary wrapper
  if (pending) {
    return (
      <div className='flex flex-col md:flex-row gap-8'>
        <Skeleton className='w-full md:w-1/2 aspect-[4/3] rounded-lg' />
        <div className='flex-1 space-y-4'>
          <Skeleton className='h-10 w-3/4' />
          <Skeleton className='h-6 w-1/2' />
          <Skeleton className='h-32 w-full' />
        </div>
      </div>
    );
  }

  const isDisabled = () => {
    if (
      pending ||
      !!titleError ||
      !!notesError ||
      !!dateError ||
      (!title && !date && !notes)
    ) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <form className='flex flex-col md:flex-row gap-8 mx-16'>
      <div className='flex-1 space-y-4'>
        <h2 className='text-xl font-bold mb-2 text-center'>
          Edit: {photo.title || 'untitled'}
        </h2>
        <TitleInput
          value={title}
          error={titleError}
          onChange={handleTitleChange}
          disabled={pending}
          placeholder={photo.title || 'Title'}
        />
        <NotesInput
          value={notes}
          error={notesError}
          onChange={handleNotesChange}
          disabled={pending}
          placeholder={photo.notes || 'Notes'}
        />
        <DateInput
          value={date}
          error={dateError}
          onChange={handleDateChange}
          onClear={handleClearDate}
          disabled={pending}
          placeholder={photo.date ? formatDate(photo.date) : 'dd/mm/yyyy'}
        />
        <FamilyOnlyCheckbox
          value={familyOnly}
          onChange={handleFamilyOnlyChange}
          disabled={pending}
        />
        <TagsSelector
          tags={tags}
          allTags={_allTags}
          inputValue={tagInput}
          error={tagError}
          pending={pending}
          onInputChange={setTagInput}
          onAdd={handleAddTag}
          onRemove={handleRemoveTag}
          onSelect={handleSelectTag}
          onInputKeyDown={handleTagInputKeyDown}
        />
        <AlbumsSelector
          albums={albums}
          allAlbums={allAlbumsSafe}
          inputValue={albumInput}
          error={albumError}
          pending={pending}
          onInputChange={setAlbumInput}
          onAdd={handleAddAlbum}
          onRemove={handleRemoveAlbum}
          onSelect={handleSelectAlbum}
          onInputKeyDown={handleAlbumInputKeyDown}
        />
        <div className='flex gap-2 justify-center'>
          <Button
            type='button'
            variant='secondary'
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type='submit' variant='default' disabled={isDisabled()}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}
