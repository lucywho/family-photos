/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/shared/components/ui';
import {
  AlbumAdmin,
  TagAdmin,
  UserAdmin,
} from '@/features/dashboard/components';

interface DashboardTabsProps {
  albums: any; // Replace 'any' with the actual type if available
  tags: any; // Replace 'any' with the actual type if available
  users?: any; // Optional, since not used
  pendingUsers?: any; // Optional, since not used
}

export function DashboardTabs({
  albums,
  tags,
  users,
  pendingUsers,
}: DashboardTabsProps) {
  return (
    <>
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
              <UserAdmin pendingUsers={pendingUsers} />
            </div>
          </TabsContent>
          <TabsContent value='users' className='mt-6'>
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold pb-4'>Member Management</h2>
              <UserAdmin users={users} />
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
