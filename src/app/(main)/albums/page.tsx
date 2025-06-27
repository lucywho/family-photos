export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { AlbumsPageContents, AlbumSkeleton } from '@/components/albums';

export default function AlbumsPage() {
  return (
    <Suspense fallback={<AlbumSkeleton />}>
      <AlbumsPageContents />
    </Suspense>
  );
}
