export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import {
  DashboardSkeleton,
  DashboardPageContents,
} from '@/components/dashboard';

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageContents />
    </Suspense>
  );
}
