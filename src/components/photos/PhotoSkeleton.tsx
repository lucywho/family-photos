import { Card, CardContent, Skeleton } from '@/components/ui';

export function PhotoSkeleton() {
  return (
    <Card className='h-full'>
      <CardContent className='p-4'>
        <Skeleton className='aspect-square w-full rounded-lg' />
      </CardContent>
    </Card>
  );
}
