'use client';

import { toast } from 'sonner';
import { useState, useTransition } from 'react';
import { User, UserRole } from '@prisma/client';
import { Edit, Save, Trash2 } from 'lucide-react';
import { updateUser, deleteUser } from '@/app/actions/admin';
import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Input,
} from '@/components/ui';

interface UserManagementRowProps {
  user: User;
}

export default function UserManagementRow({ user }: UserManagementRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    role: user.role,
  });
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const isDefaultGuest =
    user.username === 'Guest' && user.email === 'guest@family-photos.app';

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setForm({ username: user.username, email: user.email, role: user.role });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => setShowSaveDialog(true);

  const confirmSave = () => {
    setShowSaveDialog(false);
    startTransition(async () => {
      const result = await updateUser(user.id, {
        username: form.username,
        email: form.email,
        role: form.role,
      });
      if (result.success) {
        toast.success(result.message);
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = () => setShowDeleteDialog(true);

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <tr className='block border-b p-4 md:table-row md:border-none md:p-0'>
      <td
        data-label='Username'
        className='block space-y-2 md:table-cell md:space-y-0 md:p-4 md:align-middle before:content-[attr(data-label)] before:font-semibold before:md:hidden'
      >
        <div className='text-right md:text-left'>
          {isEditing ? (
            <Input
              name='username'
              value={form.username}
              onChange={handleChange}
              className='w-full border rounded px-2 py-1 text-sm'
              maxLength={32}
              required
              disabled={isPending}
            />
          ) : (
            <p className='font-semibold'>{user.username}</p>
          )}
        </div>
      </td>
      <td
        data-label='Email'
        className='block space-y-2 md:table-cell md:space-y-0 md:p-4 md:align-middle before:content-[attr(data-label)] before:font-semibold before:md:hidden'
      >
        <div className='text-right md:text-left'>
          {isEditing ? (
            <Input
              name='email'
              type='email'
              value={form.email}
              onChange={handleChange}
              className='w-full border rounded px-2 py-1 text-sm'
              maxLength={64}
              required
              disabled={isPending}
            />
          ) : (
            <p className='truncate text-sm text-muted-foreground'>
              {user.email}
            </p>
          )}
        </div>
      </td>
      <td
        data-label='Role'
        className='block md:table-cell md:p-4 md:align-middle before:content-[attr(data-label)] before:font-semibold before:md:hidden'
      >
        <div className='text-right md:text-left'>
          {isEditing ? (
            <select
              name='role'
              value={form.role}
              onChange={handleChange}
              className='w-full border rounded px-2 py-1 text-sm text-background'
              disabled={isPending}
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          ) : (
            <span className='font-medium capitalize text-muted-foreground'>
              {user.role.toLowerCase()}
            </span>
          )}
        </div>
      </td>
      <td
        data-label='Actions'
        className='block md:table-cell md:p-4 md:align-middle before:content-[attr(data-label)] before:font-semibold before:md:hidden'
      >
        <div className='flex items-center justify-end gap-2'>
          {!isDefaultGuest && (
            <>
              {isEditing ? (
                <>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Save Changes'
                    onClick={handleSave}
                    disabled={isPending}
                  >
                    <Save className='h-4 w-4 text-success' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label={`Edit ${user.username}`}
                  onClick={handleEdit}
                  disabled={isPending}
                >
                  <Edit className='h-4 w-4' />
                </Button>
              )}
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label={`Delete ${user.username}`}
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {user.username}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This user account will be removed from the app. The user
                      will still be able to login as an unregistered guest. Are
                      you sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmDelete}
                      disabled={isPending}
                    >
                      {isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update user information now?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to update this user&apos;s information?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save changes'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </tr>
  );
}
