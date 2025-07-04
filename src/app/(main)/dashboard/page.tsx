export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import {
  DashboardSkeleton,
  DashboardPageContents,
} from '@/features/dashboard/components';

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageContents />
    </Suspense>
  );
}
