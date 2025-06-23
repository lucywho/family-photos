'use client';

import isEqual from 'lodash.isequal';
import { formatDate } from '@/lib/utils';
import { CancelAlert } from './CancelAlert';
import { Button } from '@/components/ui/button';
import { updatePhoto } from '@/app/actions/photos';
import { Skeleton } from '@/components/ui/skeleton';
import { DateInput } from '@/components/edit/DateInput';
import { TitleInput } from '@/components/edit/TitleInput';
import { NotesInput } from '@/components/edit/NotesInput';
import { useState, useEffect, useActionState } from 'react';
import { TagsSelector } from '@/components/edit/TagsSelector';
import { AlbumsSelector } from '@/components/edit/AlbumsSelector';
import { MAX_TAG_LENGTH, MAX_ALBUM_NAME_LENGTH } from '@/lib/constants';
import { FamilyOnlyCheckbox } from '@/components/edit/FamilyOnlyCheckbox';

import type { PhotoEditResponse } from '@/lib/schemas/photo';
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
  allTags: Tag[];
  allAlbums: Album[];
  onCancel: () => void;
  onSave: (updatedPhoto: Photo) => void | Promise<void>;
}

const initialFormState: PhotoEditResponse = {
  success: false,
  message: '',
  data: undefined,
  errors: {},
};

export function PhotoEditForm({
  photo,
  allTags: _allTags,
  allAlbums: _allAlbums,
  onCancel,
  onSave,
}: PhotoEditFormProps) {
  const [title, setTitle] = useState(photo.title || '');
  const [notes, setNotes] = useState(photo.notes || '');
  const [date, setDate] = useState(photo.date ? formatDate(photo.date) : '');
  const [dateClientError, setDateClientError] = useState<string | null>(null);
  const [familyOnly, setFamilyOnly] = useState(!!photo.isFamilyOnly);
  const [tags, setTags] = useState<string[]>(photo.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [tagClientError, setTagClientError] = useState<string | null>(null);
  const allAlbumsSafe = Array.isArray(_allAlbums) ? _allAlbums : [];
  const [albums, setAlbums] = useState<{ id: number; name: string }[]>(
    photo.albums && photo.albums.length > 0
      ? photo.albums
      : allAlbumsSafe.filter((a) => a.name === 'All Photos')
  );
  const [albumInput, setAlbumInput] = useState('');
  const [albumClientError, setAlbumClientError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Tags logic
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (!newTag) return;
    if (newTag.length > MAX_TAG_LENGTH) {
      setTagClientError(`Tag must be ${MAX_TAG_LENGTH} characters or less`);
      return;
    }
    if (tags.some((t) => t.toLowerCase() === newTag.toLowerCase())) {
      setTagClientError('Tag already selected');
      return;
    }
    setTags([...tags, newTag]);
    setTagInput('');
    setTagClientError(null);
  };
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setTagClientError(null);
  };
  const handleSelectTag = (tag: string) => {
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setTagClientError('Tag already selected');
      return;
    }
    setTags([...tags, tag]);
    setTagClientError(null);
  };
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  useEffect(() => {
    setTagClientError(null);
  }, [tagInput]);

  // Albums logic
  const handleAddAlbum = () => {
    const newAlbum = albumInput.trim();
    if (!newAlbum) return;
    if (newAlbum.length > MAX_ALBUM_NAME_LENGTH) {
      setAlbumClientError(
        `Album name must be ${MAX_ALBUM_NAME_LENGTH} characters or less`
      );
      return;
    }
    if (albums.some((a) => a.name.toLowerCase() === newAlbum.toLowerCase())) {
      setAlbumClientError('Album already selected');
      return;
    }
    setAlbums([...albums, { id: 0, name: newAlbum }]);
    setAlbumInput('');
    setAlbumClientError(null);
  };
  const handleRemoveAlbum = (album: { id: number; name: string }) => {
    if (album.name === 'All Photos') return;
    setAlbums(albums.filter((a) => a.name !== album.name));
    setAlbumClientError(null);
  };
  const handleSelectAlbum = (album: { id: number; name: string }) => {
    if (albums.some((a) => a.name.toLowerCase() === album.name.toLowerCase())) {
      setAlbumClientError('Album already selected');
      return;
    }
    setAlbums([...albums, album]);
    setAlbumClientError(null);
  };
  const handleAlbumInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAlbum();
    }
  };

  useEffect(() => {
    setAlbumClientError(null);
  }, [albumInput]);

  const handleDateChange = (value: string) => {
    setDate(value);
    if (value && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      setDateClientError('Date must be in dd/mm/yyyy format');
    } else {
      setDateClientError(null);
    }
  };

  const handleClearDate = () => {
    setDate('');
    setDateClientError(null);
  };

  const [formState, formAction, isPending] = useActionState(
    async (_state: PhotoEditResponse, formData: FormData) => {
      formData.set('title', title);
      formData.set('notes', notes);
      formData.set('date', date);
      formData.set('familyOnly', familyOnly ? 'true' : 'false');
      formData.delete('tags');
      tags.forEach((tag) => formData.append('tags', tag));
      formData.set('albums', JSON.stringify(albums));
      const result = await updatePhoto(photo.id, formData);
      return result;
    },
    initialFormState
  );

  useEffect(() => {
    if (formState.success && formState.data) {
      onSave({
        ...photo,
        ...formState.data,
        albums: (formState.data.albums || []).map(
          (a: { id?: number; name: string }) => ({
            id: a.id ?? 0,
            name: a.name,
          })
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.success]);

  if (isPending) {
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

  const fieldErrors = formState.errors || {};

  function getFormDataObj() {
    return {
      title,
      notes,
      date,
      familyOnly,
      tags: tags.map((t) => t.trim().toLowerCase()).sort(),
      albums: albums.map((a) => a.name.trim().toLowerCase()).sort(),
    };
  }

  function getInitialFormDataObj() {
    return {
      title: photo.title || '',
      notes: photo.notes || '',
      date: photo.date ? formatDate(photo.date) : '',
      familyOnly: !!photo.isFamilyOnly,
      tags: (photo.tags || []).map((t) => t.trim().toLowerCase()).sort(),
      albums: (photo.albums || [])
        .map((a) => a.name.trim().toLowerCase())
        .sort(),
    };
  }

  const noChanges = isEqual(getFormDataObj(), getInitialFormDataObj());

  const isDisabled = () => {
    return (
      isPending ||
      !!dateClientError ||
      !!tagClientError ||
      !!albumClientError ||
      noChanges
    );
  };

  const hasUnsavedChanges = () => {
    const currentFormData = {
      title,
      notes,
      date,
      familyOnly,
      tags: tags.map((t) => t.trim().toLowerCase()).sort(),
      albums: albums.map((a) => a.name.trim().toLowerCase()).sort(),
    };

    const initialFormData = {
      title: photo.title || '',
      notes: photo.notes || '',
      date: photo.date ? formatDate(photo.date) : '',
      familyOnly: !!photo.isFamilyOnly,
      tags: (photo.tags || []).map((t) => t.trim().toLowerCase()).sort(),
      albums: (photo.albums || [])
        .map((a) => a.name.trim().toLowerCase())
        .sort(),
    };

    return !isEqual(currentFormData, initialFormData);
  };

  const handleCancelClick = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmModal(true);
    } else {
      onCancel();
    }
  };

  return (
    <>
      <form
        className='flex flex-col md:flex-row gap-8 mx-16'
        action={formAction}
      >
        <div className='flex-1 space-y-4'>
          <h2 className='text-xl font-bold mb-2 text-center'>
            Edit: {photo.title || 'untitled'}
          </h2>
          {formState.message && !formState.success && (
            <div className='text-destructive text-center'>
              {formState.message}
            </div>
          )}
          <TitleInput
            value={title}
            error={fieldErrors.title?.join(' ')}
            onChange={setTitle}
            disabled={isPending}
            placeholder={photo.title || 'Title'}
          />
          <NotesInput
            value={notes}
            error={fieldErrors.notes?.join(' ')}
            onChange={setNotes}
            disabled={isPending}
            placeholder={photo.notes || 'Notes'}
          />
          <DateInput
            value={date}
            error={dateClientError || fieldErrors.date?.join(' ')}
            onChange={handleDateChange}
            onClear={handleClearDate}
            disabled={isPending}
            placeholder={photo.date ? formatDate(photo.date) : 'dd/mm/yyyy'}
          />
          <FamilyOnlyCheckbox
            value={familyOnly}
            onChange={setFamilyOnly}
            disabled={isPending}
          />
          <TagsSelector
            tags={tags}
            allTags={_allTags}
            inputValue={tagInput}
            error={tagClientError || fieldErrors.tags?.join(' ')}
            pending={isPending}
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
            error={albumClientError || fieldErrors.albums?.join(' ')}
            pending={isPending}
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
              onClick={handleCancelClick}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' variant='default' disabled={isDisabled()}>
              Save
            </Button>
          </div>
        </div>
      </form>

      <CancelAlert
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        onCancel={onCancel}
      />
    </>
  );
}
