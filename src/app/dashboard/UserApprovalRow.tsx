'use client';

import { useTransition } from 'react';
import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Check, Edit } from 'lucide-react';
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
import { approveUser } from '@/app/actions/admin';
import { toast } from 'sonner';

interface UserApprovalRowProps {
  user: User;
  showAllUsers: boolean;
}

export default function UserApprovalRow({
  user,
  showAllUsers,
}: UserApprovalRowProps) {
  const [isPending, startTransition] = useTransition();

  // Check if this is the default Guest account
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
        {!showAllUsers && user.role === 'GUEST' && !isDefaultGuest && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='ghost' size='icon' aria-label='Approve User'>
                <Check className='h-5 w-5 text-green-500' />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve {user.username}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This user will now be able to see family-only photos. Are you
                  sure?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleApprove} disabled={isPending}>
                  {isPending ? 'Approving...' : 'Approve'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {showAllUsers && !isDefaultGuest && (
          <Button variant='ghost' size='icon' aria-label='Edit User'>
            <Edit className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
}
