'use client';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [title, setTitle] = useState(photo.title || '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [notes, setNotes] = useState(photo.notes || '');
  const [notesError, setNotesError] = useState<string | null>(null);
  const [date, setDate] = useState(photo.date ? formatDate(photo.date) : '');
  const [dateError, setDateError] = useState<string | null>(null);
  const [familyOnly, setFamilyOnly] = useState(!!photo.isFamilyOnly);
  const [tags, setTags] = useState<string[]>(photo.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  // Default _allAlbums to empty array if undefined
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
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (value.length > 70) {
      setTitleError('Title must be 70 characters or less');
    } else {
      setTitleError(null);
    }
  };

  // Notes validation
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    if (value.length > 1000) {
      setNotesError('Notes must be 1000 characters or less');
    } else {
      setNotesError(null);
    }
  };

  // Date validation (dd/mm/yyyy)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
  const handleFamilyOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFamilyOnly(e.target.checked);
  };

  // Add tag handler
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

  // Remove tag handler
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Select existing tag
  const handleSelectTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTagError('Tag already selected');
      return;
    }
    setTags([...tags, tag]);
    setTagError(null);
  };

  // Handle tag input Enter key
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Add album handler
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
    // Always add as a new album (id: 0 for new, will be created on save)
    setAlbums([...albums, { id: 0, name: newAlbum }]);
    setAlbumInput('');
    setAlbumError(null);
  };

  // Remove album handler (cannot remove All Photos)
  const handleRemoveAlbum = (album: { id: number; name: string }) => {
    if (album.name === 'All Photos') return;
    setAlbums(albums.filter((a) => a.name !== album.name));
  };

  // Select existing album
  const handleSelectAlbum = (album: { id: number; name: string }) => {
    if (albums.some((a) => a.name === album.name)) {
      setAlbumError('Album already selected');
      return;
    }
    setAlbums([...albums, album]);
    setAlbumError(null);
  };

  // Handle album input Enter key
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
    <form
      className='flex flex-col md:flex-row gap-8 mx-16' /* action={formAction} */
    >
      {/* Form fields */}
      <div className='flex-1 space-y-4'>
        <h2 className='text-xl font-bold mb-2 text-center'>
          Edit: {photo.title || 'untitled'}
        </h2>
        {/* Title input */}
        <div>
          <label htmlFor='title' className='block font-medium mb-1'>
            Title
          </label>
          <input
            id='title'
            name='title'
            type='text'
            maxLength={70}
            value={title}
            onChange={handleTitleChange}
            placeholder={photo.title || 'Title'}
            className='w-full border rounded px-3 py-2'
            disabled={pending}
            aria-describedby='title-help title-error'
          />
          <div className='flex justify-between text-xs mt-1'>
            <span id='title-help' className='text-muted-foreground'>
              {title.length}/70 characters
            </span>
            {titleError && (
              <span id='title-error' className='text-destructive'>
                {titleError}
              </span>
            )}
          </div>
        </div>
        {/* Notes input */}
        <div>
          <label htmlFor='notes' className='block font-medium mb-1'>
            Notes
          </label>
          <textarea
            id='notes'
            name='notes'
            maxLength={1000}
            value={notes}
            onChange={handleNotesChange}
            placeholder={photo.notes || 'Notes'}
            className='w-full border rounded px-3 py-2 min-h-[100px] resize-y'
            disabled={pending}
            aria-describedby='notes-help notes-error'
          />
          <div className='flex justify-between text-xs mt-1'>
            <span id='notes-help' className='text-muted-foreground'>
              {notes.length}/1000 characters
            </span>
            {notesError && (
              <span id='notes-error' className='text-destructive'>
                {notesError}
              </span>
            )}
          </div>
        </div>
        {/* Date input */}
        <div>
          <label htmlFor='date' className='block font-medium mb-1'>
            Date
          </label>
          <div className='flex gap-2 items-center'>
            <input
              id='date'
              name='date'
              type='text'
              value={date}
              onChange={handleDateChange}
              placeholder={photo.date ? formatDate(photo.date) : 'dd/mm/yyyy'}
              className='w-full border rounded px-3 py-2'
              disabled={pending}
              aria-describedby='date-help date-error'
            />
            {date && (
              <Button
                type='button'
                variant='secondary'
                size='sm'
                onClick={handleClearDate}
                disabled={pending}
              >
                Clear
              </Button>
            )}
          </div>
          <div className='flex justify-between text-xs mt-1'>
            <span id='date-help' className='text-muted-foreground'>
              Format: dd/mm/yyyy
            </span>
            {dateError && (
              <span id='date-error' className='text-destructive'>
                {dateError}
              </span>
            )}
          </div>
        </div>
        {/* Family only toggle */}
        <div className='flex items-center gap-2'>
          <input
            id='familyOnly'
            name='familyOnly'
            type='checkbox'
            checked={familyOnly}
            onChange={handleFamilyOnlyChange}
            disabled={pending}
          />
          <label htmlFor='familyOnly' className='text-sm'>
            Family only
          </label>
          <span className='text-xs text-muted-foreground ml-2'>
            (Only visible to registered users)
          </span>
        </div>
        {/* Tags section */}
        <div>
          <label className='block font-medium mb-1'>Tags</label>
          <div className='flex flex-wrap gap-2 mb-2'>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center bg-primary text-secondary px-2 py-1 rounded text-xs'
                >
                  {tag}
                  <button
                    type='button'
                    className='ml-1 hover:underline'
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={16} className='text-destructive' />
                  </button>
                </span>
              ))
            ) : (
              <span className='text-muted-foreground text-xs'>
                No tags selected
              </span>
            )}
          </div>
          <div className='flex gap-2 mb-2'>
            <input
              type='text'
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setTagError(null);
              }}
              onKeyDown={handleTagInputKeyDown}
              maxLength={20}
              placeholder='Add or select a tag'
              className='border rounded px-2 py-1'
              disabled={pending}
              aria-label='Add tag'
            />
            <Button
              type='button'
              variant='secondary'
              size='sm'
              onClick={handleAddTag}
              disabled={pending || !tagInput.trim()}
            >
              Add
            </Button>
          </div>
          {tagError && (
            <div className='text-destructive text-xs mb-1'>{tagError}</div>
          )}
          <div className='flex flex-wrap gap-2'>
            {_allTags?.length > 0 ? (
              _allTags
                .filter((tag) => !tags.includes(tag.name))
                .map((tag) => (
                  <button
                    key={tag.id}
                    type='button'
                    className='bg-secondary text-primary px-2 py-1 rounded text-xs hover:bg-primary hover:text-white'
                    onClick={() => handleSelectTag(tag.name)}
                    disabled={pending}
                  >
                    {tag.name}
                  </button>
                ))
            ) : (
              <span className='text-muted-foreground text-xs'>No tags yet</span>
            )}
          </div>
        </div>
        {/* Albums section */}
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
                      onClick={() => handleRemoveAlbum(album)}
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
              value={albumInput}
              onChange={(e) => {
                setAlbumInput(e.target.value);
                setAlbumError(null);
              }}
              onKeyDown={handleAlbumInputKeyDown}
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
              onClick={handleAddAlbum}
              disabled={pending || !albumInput.trim()}
            >
              Add
            </Button>
          </div>
          {albumError && (
            <div className='text-destructive text-xs mb-1'>{albumError}</div>
          )}
          <div className='flex flex-wrap gap-2'>
            {allAlbumsSafe.length > 0 ? (
              allAlbumsSafe
                .filter((album) => !albums.some((a) => a.name === album.name))
                .map((album) => (
                  <button
                    key={album.id}
                    type='button'
                    className='bg-secondary text-primary px-2 py-1 rounded text-xs hover:bg-primary hover:text-white'
                    onClick={() => handleSelectAlbum(album)}
                    disabled={pending}
                  >
                    {album.name}
                  </button>
                ))
            ) : (
              <span className='text-muted-foreground text-xs'></span>
            )}
          </div>
        </div>
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
