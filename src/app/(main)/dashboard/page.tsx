// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { PageTitle } from '@/components/layout';
import { authOptions } from '@/lib/auth-options';
import { AlbumAdmin, TagAdmin, UserAdmin } from '@/components/dashboard';
import { getAlbumsWithPhotoCount, getTagsWithPhotoCount } from '@/lib/db';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Only allow admins
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/not-found');
  }

  const albums = await getAlbumsWithPhotoCount();
  const tags = await getTagsWithPhotoCount();
  const username = session.user.name;

  return (
    <>
      <PageTitle pageTitle={`Admin Dashboard: ${username}`} />
      <main className='container md:mx-auto mt-14 md:mt-0'>
        <Tabs defaultValue='approvals' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='approvals'>Approvals</TabsTrigger>
            <TabsTrigger value='users'>Members</TabsTrigger>
            <TabsTrigger value='albums'>Albums</TabsTrigger>
            <TabsTrigger value='tags'>Tags</TabsTrigger>
          </TabsList>

          <TabsContent value='approvals' className='mt-6'>
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold pb-4'>
                New Member Approvals
              </h2>
              <UserAdmin />
            </div>
          </TabsContent>

          <TabsContent value='users' className='mt-6'>
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold pb-4'>Member Management</h2>
              <UserAdmin showAllUsers />
            </div>
          </TabsContent>

          <TabsContent value='albums' className='mt-6'>
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold'>Album Management</h2>
              <AlbumAdmin albums={albums} />
            </div>
          </TabsContent>

          <TabsContent value='tags' className='mt-6'>
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold'>Tag Management</h2>
              <TagAdmin tags={tags} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
