'use client';
import { HeaderWrapper } from '@/shared/components/layout';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderWrapper />
      <main className='pt-24 max-w-[1200px] mx-auto'>{children}</main>
    </>
  );
}
