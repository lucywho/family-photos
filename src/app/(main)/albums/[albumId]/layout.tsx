import React from 'react';
import { AlbumLayoutContent } from '@/components/albums';

export default function AlbumLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = React.use(params);
  return <AlbumLayoutContent albumId={albumId}>{children}</AlbumLayoutContent>;
}
