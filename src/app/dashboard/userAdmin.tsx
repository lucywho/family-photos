import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

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

  return (
    <div>
      {showAllUsers ? (
        <p>Member Management - All Users</p>
      ) : (
        <p>New Member Approvals - Pending Users</p>
      )}
    </div>
  );
}
