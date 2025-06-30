'use client';

import { toast } from 'sonner';
import { useTransition } from 'react';
import { User } from '@prisma/client';
import { Check, Trash2 } from 'lucide-react';
import { approveUser, deleteUser } from '@/app/actions/admin';
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
} from '@/components/ui';

export default function UserApprovalRow({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();

  // Note: default Guest account should never be edited
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
    <tr className='block border-b p-4 md:table-row md:border-none md:p-0'>
      <td
        data-label='Username'
        className='block md:table-cell md:p-4 md:align-middle before:content-[attr(data-label)] before:font-semibold before:md:hidden'
      >
        <div className='text-right font-semibold md:text-left'>
          {user.username}
        </div>
      </td>
      <td
        data-label='Email'
        className='block md:table-cell md:p-4 md:align-middle before:content-[attr(data-label)] before:font-semibold before:md:hidden'
      >
        <div className='truncate text-right text-sm text-muted-foreground md:text-left'>
          {user.email}
        </div>
      </td>
      <td
        data-label='Role'
        className='block md:table-cell md:p-4 md:align-middle before:content-[attr(data-label)] before:font-semibold before:md:hidden'
      >
        <div className='text-right font-medium capitalize text-muted-foreground md:text-left'>
          {user.role.toLowerCase()}
        </div>
      </td>
      <td
        data-label='Actions'
        className='block md:table-cell md:p-4 md:align-middle before:content-[attr(data-label)] before:font-semibold before:md:hidden'
      >
        <div className='flex items-center justify-end gap-2'>
          {!isDefaultGuest && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label={`Approve ${user.username}`}
                >
                  <Check className='h-4 w-4 md:h-5 md:w-5 text-success' />
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
          )}
          {user.role === 'GUEST' && !isDefaultGuest && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label={`Delete ${user.username}`}
                  >
                    <Trash2 className='h-4 w-4 md:h-5 md:w-5 text-warning' />
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
        </div>
      </td>
    </tr>
  );
}
