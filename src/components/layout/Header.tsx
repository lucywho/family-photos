'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Home, LogOut } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

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
    <header className='bg-[hsl(var(--background))] text-[hsl(var(--text))] py-4 px-6'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link
            href='/'
            className='text-xl font-semibold hover:text-[hsl(var(--secondary))] transition-colors'
          >
            Family Photos
          </Link>
          {showHomeButton && (
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='text-[hsl(var(--text))] hover:text-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-secondary))]'
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
              className='text-[hsl(var(--text))] hover:text-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-secondary))]'
            >
              <Link href='/albums'>Back to album</Link>
            </Button>
          )}
        </div>

        <div className='flex items-center gap-4'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--text))] font-semibold'>
                  {username.charAt(0).toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{username}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {session && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              className='text-[hsl(var(--text))] hover:text-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-secondary))]'
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
