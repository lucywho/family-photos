'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { APP_NAME } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { PendingUsersBadge } from '@/components/layout';
import { usePathname, useSearchParams } from 'next/navigation';
import { Camera, Home, LayoutGrid, LibraryBig, LogOut } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const showHomeButton = pathname !== '/';
  const albumId = searchParams.get('albumId');
  const [photoHash, setPhotoHash] = useState('');
  const isAdmin = session?.user.role === 'ADMIN';
  const username = session?.user?.name || 'Guest';
  const dashboardPage = pathname.startsWith('/dashboard');
  const showAllAlbumsButton = pathname.startsWith('/albums/');
  const showBackToAlbumButton = pathname.startsWith('/photos/');

  // Get the photo hash from the current URL to preserve scroll position
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#photo-')) {
        setPhotoHash(hash);
      } else {
        setPhotoHash('');
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className='bg-background/90 text-primary py-4 px-6 border border-primary border-t-0 border-x-0 fixed top-0 z-50 w-full backdrop-filter backdrop-blur-md bg-opacity-10'>
      <div className='container mx-auto flex flex-col md:flex-row items-center justify-between max-w-[1200px]'>
        <div className='flex md:flex-row items-center gap-4'>
          <Camera className='mx-auto text-primary h-9 w-9 md:h-12 md:w-12' />
          <div className='flex flex-col'>
            <Link
              href='/'
              className='text-2xl md:text-3xl font-semibold hover:text-secondary transition-colors'
            >
              {APP_NAME}
            </Link>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <div className='px-3 py-1 rounded-full bg-primary text-text text-sm font-medium'>
            {username}
          </div>

          {isAdmin && !dashboardPage && (
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='text-text hover:text-primary hover:bg-secondary relative'
            >
              <Link href='/dashboard'>
                <LayoutGrid className='h-4 w-4 md:mr-2' />
                <span className='hidden md:inline'>Dashboard</span>
                <PendingUsersBadge />
              </Link>
            </Button>
          )}

          {isAdmin && dashboardPage && (
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='text-text hover:text-primary hover:bg-secondary'
            >
              <Link href='/albums'>
                <LibraryBig className='h-4 w-4 md:mr-2' />
                <span className='hidden md:inline'>Albums</span>
              </Link>
            </Button>
          )}

          {showHomeButton && (
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='text-text hover:text-primary hover:bg-secondary'
            >
              <Link href='/'>
                <Home className='h-4 w-4 md:mr-2' />
                <span className='hidden md:inline'>Home</span>
              </Link>
            </Button>
          )}
          {showAllAlbumsButton && (
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='text-text hover:text-primary hover:bg-secondary'
            >
              <Link href='/albums'>
                <LibraryBig className='h-4 w-4 md:mr-2' />
                <span className='hidden md:inline'>All albums</span>
              </Link>
            </Button>
          )}
          {showBackToAlbumButton && albumId && (
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='text-text hover:text-primary hover:bg-secondary'
            >
              <Link href={`/albums/${albumId}${photoHash}`}>
                <LibraryBig className='h-4 w-4 md:mr-2' />
                <span className='hidden md:inline'>Back to album</span>
              </Link>
            </Button>
          )}

          {session && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              className='text-text hover:text-primary hover:bg-secondary'
            >
              <LogOut className='h-4 w-4 md:mr-2' />
              <span className='hidden md:inline'>Log out</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
