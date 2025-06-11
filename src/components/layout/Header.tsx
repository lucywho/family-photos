'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { Camera } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const username = session?.user?.name || 'Guest';

  // Show Home button on all pages except welcome page
  const showHomeButton = pathname !== '/';

  // Determine if we should show the Back to album button
  const showBackToAlbumButton = pathname.startsWith('/photos/');

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className='bg-background text-primary py-4 px-6 border border-primary border-t-0 border-x-0'>
      <div className='container mx-auto flex flex-col md:flex-row items-center justify-between'>
        <div className='flex md:flex-row items-center gap-4'>
          <Camera className='mx-auto text-primary h-9 w-9 md:h-12 md:w-12' />
          <Link
            href='/'
            className='text-2xl md:text-3xl font-semibold hover:text-secondary transition-colors'
          >
            {APP_NAME}
          </Link>
        </div>

        <div className='flex items-center gap-4'>
          <div className='px-3 py-1 rounded-full bg-primary text-text text-sm font-medium'>
            {username}
          </div>

          {showHomeButton && (
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='text-text hover:text-primary hover:bg-secondary'
            >
              <Link href='/'>
                <Home className='h-4 w-4 mr-2' />
                Home
              </Link>
            </Button>
          )}
          {showBackToAlbumButton && (
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='text-text hover:text-primary hover:bg-secondary'
            >
              <Link href='/albums'>Back to album</Link>
            </Button>
          )}

          {session && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              className='text-text hover:text-primary hover:bg-secondary'
            >
              <LogOut className='h-4 w-4 mr-2' />
              Log out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
