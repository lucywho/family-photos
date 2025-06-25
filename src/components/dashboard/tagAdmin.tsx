'use client';

import { useRef, useState, useTransition } from 'react';
import { getTagsWithPhotoCount } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { createTag, editTag, deleteTag } from '@/app/actions/admin';
import { MAX_TAG_LENGTH } from '@/lib/constants';

export default function TagAdmin({
  tags,
}: {
  tags: Awaited<ReturnType<typeof getTagsWithPhotoCount>>;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const createFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  async function handleCreate(formData: FormData) {
    setFormError(null);
    const result = await createTag(formData);
    if (result.success) {
      toast.success(result.message);
      setCreateOpen(false);
      createFormRef.current?.reset();
    } else {
      setFormError(result.message);
    }
  }

  async function handleEdit(tagId: number, formData: FormData) {
    setFormError(null);
    const result = await editTag(tagId, formData);
    if (result.success) {
      toast.success(result.message);
      setEditOpen(null);
      editFormRef.current?.reset();
    } else {
      setFormError(result.message);
    }
  }

  function handleDelete(tagId: number) {
    setFormError(null);
    startTransition(async () => {
      const result = await deleteTag(tagId);
      if (result.success) {
        toast.success(result.message);
        setDeleteOpen(null);
      } else {
        setFormError(result.message);
      }
    });
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between mb-4'>
        <AlertDialog open={createOpen} onOpenChange={setCreateOpen}>
          <AlertDialogTrigger asChild>
            <Button variant='default' size='sm'>
              <Plus className='h-4 w-4 mr-2' />
              Add New Tag
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Tag</AlertDialogTitle>
              <AlertDialogDescription>
                Enter a name for the new tag (max {MAX_TAG_LENGTH} characters).
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
                maxLength={MAX_TAG_LENGTH}
                required
                className='border rounded px-2 py-1 text-sm'
                placeholder='Tag name'
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
        {tags.map((tag) => (
          <div key={tag.id} className='flex items-center justify-between p-4'>
            <div>
              <span className='font-medium'>{tag.name}</span>
              <span className='ml-2 text-muted-foreground text-sm'>
                ({tag._count.photos} photos)
              </span>
            </div>
            <div className='flex flex-row gap-2'>
              {/* Delete Tag */}
              <AlertDialog
                open={deleteOpen === tag.id}
                onOpenChange={(open) => setDeleteOpen(open ? tag.id : null)}
              >
                <AlertDialogTrigger asChild>
                  <Button variant='ghost' size='icon' aria-label='Delete Tag'>
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete tag: {tag.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this tag? This will remove
                      the tag from every tagged photo. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {formError && (
                    <div className='text-destructive text-sm'>{formError}</div>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(tag.id)}
                      disabled={isPending}
                    >
                      {isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {/* Edit Tag */}
              <AlertDialog
                open={editOpen === tag.id}
                onOpenChange={(open) => setEditOpen(open ? tag.id : null)}
              >
                <AlertDialogTrigger asChild>
                  <Button variant='ghost' size='icon' aria-label='Edit Tag'>
                    <Edit className='h-4 w-4 text-text' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Edit tag: {tag.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to edit this tag? This will update
                      this tag on every tagged photo. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form
                    ref={editFormRef}
                    action={(fd) => handleEdit(tag.id, fd)}
                    className='flex flex-col gap-4 mt-2'
                  >
                    <input
                      name='name'
                      type='text'
                      maxLength={MAX_TAG_LENGTH}
                      required
                      className='border rounded px-2 py-1 text-sm'
                      placeholder='New tag name'
                      defaultValue={tag.name}
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
          </div>
        ))}
      </div>
    </div>
  );
}
