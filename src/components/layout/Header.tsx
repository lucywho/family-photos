'use client';

import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { Home, LibraryBig, LogOut, Camera } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const username = session?.user?.name || 'Guest';
  const [photoHash, setPhotoHash] = useState('');

  const showHomeButton = pathname !== '/';
  const showAllAlbumsButton = pathname.startsWith('/albums/');
  const showBackToAlbumButton = pathname.startsWith('/photos/');
  const albumId = searchParams.get('albumId');

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
    <header className='bg-background text-primary py-4 px-6 border border-primary border-t-0 border-x-0'>
      <div className='container mx-auto flex flex-col md:flex-row items-center justify-between'>
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
