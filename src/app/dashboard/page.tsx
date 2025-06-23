// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import UserAdmin from './userAdmin';
import AlbumAdmin from './albumAdmin';
import TagAdmin from './tagAdmin';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Only allow admins
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <main className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>
      <p className='text-lg'>Welcome, {session.user?.name || 'Admin'}!</p>
      <div>
        <UserAdmin />
        <AlbumAdmin />
        <TagAdmin />
      </div>
    </main>
  );
}
