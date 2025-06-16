import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PhotoSkeleton() {
  return (
    <Card className='h-full'>
      <CardContent className='p-4'>
        <Skeleton className='aspect-square w-full rounded-lg' />
      </CardContent>
    </Card>
  );
}
