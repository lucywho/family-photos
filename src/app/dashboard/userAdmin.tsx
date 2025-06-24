import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getPendingUsers, getUsers } from '@/lib/db';
import UserApprovalRow from './UserApprovalRow';

interface UserAdminProps {
  showAllUsers?: boolean;
}

export default async function UserAdmin({
  showAllUsers = false,
}: UserAdminProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/not-found');
  }

  const users = showAllUsers ? await getUsers() : await getPendingUsers();

  if (!users || users.length === 0) {
    return (
      <div className='mt-4 rounded-lg border border-dashed p-8 text-center'>
        <h3 className='text-lg font-semibold'>
          {showAllUsers ? 'No Users Found' : 'No New Approvals'}
        </h3>
        <p className='text-sm text-muted-foreground'>
          {showAllUsers
            ? 'There are currently no users in the system.'
            : 'There are no new members awaiting approval.'}
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <div className='divide-y divide-border'>
        {users.map((user) => (
          <UserApprovalRow
            key={user.id}
            user={user}
            showAllUsers={showAllUsers}
          />
        ))}
      </div>
    </div>
  );
}
