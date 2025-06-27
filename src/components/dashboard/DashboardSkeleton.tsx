import { Skeleton } from '@/components/ui';

export function DashboardSkeleton() {
  return (
    <Skeleton className='container md:mx-auto mt-14 md:mt-0'>
      <Skeleton defaultValue='approvals' className='w-full' />
    </Skeleton>
  );
}
