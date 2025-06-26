'use client';

import { toast } from 'sonner';
import { getAlbumsWithPhotoCount } from '@/lib/db';
import { Edit, Trash2, Plus } from 'lucide-react';
import { MAX_ALBUM_NAME_LENGTH } from '@/lib/constants';
import { useRef, useState, useTransition } from 'react';
import { createAlbum, editAlbum, deleteAlbum } from '@/app/actions/admin';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@/components/ui';

export function AlbumAdmin({
  albums,
}: {
  albums: Awaited<ReturnType<typeof getAlbumsWithPhotoCount>>;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const createFormRef = useRef<HTMLFormElement>(null);
  const renameFormRef = useRef<HTMLFormElement>(null);

  // Create Album
  async function handleCreate(formData: FormData) {
    setFormError(null);
    const result = await createAlbum(formData);
    if (result.success) {
      toast.success(result.message);
      setCreateOpen(false);
      createFormRef.current?.reset();
    } else {
      setFormError(result.message);
    }
  }

  // Rename Album
  async function handleRename(albumId: number, formData: FormData) {
    setFormError(null);
    const result = await editAlbum(albumId, formData);
    if (result.success) {
      toast.success(result.message);
      setRenameOpen(null);
      renameFormRef.current?.reset();
    } else {
      setFormError(result.message);
    }
  }

  // Delete Album
  function handleDelete(albumId: number) {
    setFormError(null);
    startTransition(async () => {
      const result = await deleteAlbum(albumId);
      if (result.success) {
        toast.success(result.message);
        setDeleteOpen(null);
      } else {
        setFormError(result.message);
      }
    });
  }

  return (
    <div className='space-y-6 min-h-vh'>
      <div className='flex items-center justify-between mb-4'>
        <AlertDialog open={createOpen} onOpenChange={setCreateOpen}>
          <AlertDialogTrigger asChild>
            <Button variant='default' size='sm'>
              <Plus className='h-4 w-4 mr-2' />
              Add New Album
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Album</AlertDialogTitle>
              <AlertDialogDescription>
                Enter a name for the new album (max {MAX_ALBUM_NAME_LENGTH}{' '}
                characters).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form
              ref={createFormRef}
              action={handleCreate}
              className='flex flex-col gap-4 mt-2'
            >
              <input
                name='name'
                type='text'
                maxLength={MAX_ALBUM_NAME_LENGTH}
                required
                className='border rounded px-2 py-1 text-sm'
                placeholder='Album name'
                autoFocus
              />
              {formError && (
                <div className='text-destructive text-sm'>{formError}</div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel type='button'>Cancel</AlertDialogCancel>
                <Button type='submit'>Create</Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className='rounded-md border divide-y divide-border'>
        {albums?.map((album) => (
          <div key={album.id} className='flex items-center justify-between p-4'>
            <div>
              <span className='font-medium'>{album.name}</span>
              <span className='ml-2 text-muted-foreground text-sm'>
                ({album._count.photos} photos)
              </span>
            </div>
            {album.name !== 'All Photos' && (
              <div className='flex flex-row gap-2'>
                {/* Delete Album */}
                <AlertDialog
                  open={deleteOpen === album.id}
                  onOpenChange={(open) => setDeleteOpen(open ? album.id : null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Delete Album'
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete album: {album.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this album? Deleting an
                        album cannot be undone. Your photos will remain in the
                        'All Photos' album.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {formError && (
                      <div className='text-destructive text-sm'>
                        {formError}
                      </div>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(album.id)}
                        disabled={isPending}
                      >
                        {isPending ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {/* Rename Album */}
                <AlertDialog
                  open={renameOpen === album.id}
                  onOpenChange={(open) => setRenameOpen(open ? album.id : null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Rename Album'
                    >
                      <Edit className='h-4 w-4 text-text' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Rename album: {album.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Enter a new name for this album (max{' '}
                        {MAX_ALBUM_NAME_LENGTH} characters).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                      ref={renameFormRef}
                      action={(fd) => handleRename(album.id, fd)}
                      className='flex flex-col gap-4 mt-2'
                    >
                      <input
                        name='name'
                        type='text'
                        maxLength={MAX_ALBUM_NAME_LENGTH}
                        required
                        className='border rounded px-2 py-1 text-sm'
                        placeholder='New album name'
                        defaultValue={album.name}
                        autoFocus
                      />
                      {formError && (
                        <div className='text-destructive text-sm'>
                          {formError}
                        </div>
                      )}
                      <AlertDialogFooter>
                        <AlertDialogCancel type='button'>
                          Cancel
                        </AlertDialogCancel>
                        <Button type='submit'>Rename</Button>
                      </AlertDialogFooter>
                    </form>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
