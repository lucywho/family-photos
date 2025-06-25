// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import UserAdmin from '@/components/dashboard/userAdmin';
import AlbumAdmin from '@/components/dashboard/albumAdmin';
import TagAdmin from '@/components/dashboard/tagAdmin';
import { getAlbumsWithPhotoCount, getTagsWithPhotoCount } from '@/lib/db';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Only allow admins
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/not-found');
  }

  const albums = await getAlbumsWithPhotoCount();
  const tags = await getTagsWithPhotoCount();

  return (
    <main className='container px-2 md:mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>
      <p className='text-lg mb-8'>Welcome, {session.user?.name || 'Admin'}!</p>

      <Tabs defaultValue='approvals' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='approvals'>Approvals</TabsTrigger>
          <TabsTrigger value='users'>Members</TabsTrigger>
          <TabsTrigger value='albums'>Albums</TabsTrigger>
          <TabsTrigger value='tags'>Tags</TabsTrigger>
        </TabsList>

        <TabsContent value='approvals' className='mt-6'>
          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold pb-4'>
              New Member Approvals
            </h2>
            <UserAdmin />
          </div>
        </TabsContent>

        <TabsContent value='users' className='mt-6'>
          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold pb-4'>Member Management</h2>
            <UserAdmin showAllUsers />
          </div>
        </TabsContent>

        <TabsContent value='albums' className='mt-6'>
          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Album Management</h2>
            <AlbumAdmin albums={albums} />
          </div>
        </TabsContent>

        <TabsContent value='tags' className='mt-6'>
          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Tag Management</h2>
            <TagAdmin tags={tags} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
