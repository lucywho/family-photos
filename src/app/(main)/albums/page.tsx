export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import {
  AlbumsPageContents,
  AlbumSkeleton,
} from '@/features/albums/components';

export default function AlbumsPage() {
  return (
    <Suspense fallback={<AlbumSkeleton />}>
      <AlbumsPageContents />
    </Suspense>
  );
}
