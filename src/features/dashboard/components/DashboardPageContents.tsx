import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { PageTitle } from '@/shared/components/layout';
import { authOptions } from '@/lib/auth-options';
import {
  getUsers,
  getPendingUsers,
  getAlbumsWithPhotoCount,
  getTagsWithPhotoCount,
} from '@/lib/db';
import { DashboardTabs } from './DashboardTabs';
export async function DashboardPageContents() {
  const session = await getServerSession(authOptions);

  // Only allow admins
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/not-found');
  }

  const albums = await getAlbumsWithPhotoCount();
  const tags = await getTagsWithPhotoCount();
  const username = session.user.name;
  const users = await getUsers();
  const pendingUsers = await getPendingUsers();

  return (
    <>
      <PageTitle pageTitle={`Admin Dashboard: ${username}`} />
      <DashboardTabs
        albums={albums}
        tags={tags}
        users={users}
        pendingUsers={pendingUsers}
      />
    </>
  );
}
