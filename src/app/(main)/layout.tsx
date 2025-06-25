'use client';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className='pt-24 max-w-[1200px] mx-auto'>{children}</main>
    </>
  );
}
