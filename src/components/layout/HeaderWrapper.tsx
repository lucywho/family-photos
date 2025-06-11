'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function HeaderWrapper() {
  const pathname = usePathname();

  // Don't show header on the welcome page
  if (pathname === '/') {
    return null;
  }

  return <Header />;
}
