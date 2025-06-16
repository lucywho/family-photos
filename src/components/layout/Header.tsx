'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Home, LibraryBig, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { Camera } from 'lucide-react';
import { useAlbum } from '@/contexts/AlbumContext';

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const username = session?.user?.name || 'Guest';

  // Try to get album data, but don't throw if not in AlbumProvider
  let album = null;
  try {
    const albumContext = useAlbum();
    album = albumContext.album;
  } catch {
    // Not in AlbumProvider context, which is fine
  }

  console.log('Header - Current pathname:', pathname);
  console.log('Header - Album data:', album);

  const showHomeButton = pathname !== '/';
  const showBackToAlbumsButton = pathname.startsWith('/albums/');
  const showBackToAlbumButton = pathname.startsWith('/photos/');

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
        {album && (
          <div className='text-xl md:text-2xl font-semibold text-primary'>
            {album.name}
          </div>
        )}

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
          {showBackToAlbumsButton && (
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
          {showBackToAlbumButton && (
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='text-text hover:text-primary hover:bg-secondary'
            >
              <Link href='/albums'>
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
