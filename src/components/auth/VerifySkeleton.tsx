import { Skeleton } from '@/components/ui';

export function VerifySkeleton() {
  return (
    <section>
      <Skeleton className='h-12 pb-8' />
      <Skeleton className='mx-auto h-12' />
      <Skeleton className='h-12 mt-4' />
      <Skeleton className='h-12 mt-2' />
    </section>
  );
}
