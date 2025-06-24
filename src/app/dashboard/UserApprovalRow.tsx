'use client';

import { useTransition } from 'react';
import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Check, Edit, Trash2 } from 'lucide-react';
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
import { approveUser, deleteUser } from '@/app/actions/admin';
import { toast } from 'sonner';

export default function UserApprovalRow(user: User) {
  const [isPending, startTransition] = useTransition();

  // default Guest account should never be edited
  const isDefaultGuest =
    user.username === 'Guest' && user.email === 'guest@family-photos.app';

  const handleApprove = async () => {
    if (isDefaultGuest) {
      toast.error('Cannot modify the default Guest account');
      return;
    }

    startTransition(async () => {
      const result = await approveUser(user.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = async () => {
    if (isDefaultGuest) {
      toast.error('Cannot delete the default Guest account');
      return;
    }

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
    <div className='flex items-center justify-between p-4'>
      <div className='grid gap-1'>
        <p className='font-semibold'>{user.username}</p>
        <p className='text-sm text-muted-foreground'>{user.email}</p>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm font-medium capitalize text-muted-foreground'>
          {user.role.toLowerCase()}
        </span>
        {user.role === 'GUEST' && !isDefaultGuest && (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='ghost' size='icon' aria-label='Approve User'>
                  <Check className='h-5 w-5 text-success' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve {user.username}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This user will now be able to see family-only photos. Are
                    you sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleApprove}
                    disabled={isPending}
                  >
                    {isPending ? 'Approving...' : 'Approve'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='ghost' size='icon' aria-label='Delete User'>
                  <Trash2 className='h-5 w-5 text-warning' />
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
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    {isPending ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        {!isDefaultGuest && (
          <Button variant='ghost' size='icon' aria-label='Edit User'>
            <Edit className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
}
