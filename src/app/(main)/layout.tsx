'use client';
import { HeaderWrapper } from '@/components/layout/HeaderWrapper';

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
