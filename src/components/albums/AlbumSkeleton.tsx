import { Card, CardContent, Skeleton } from '@/components/ui';

export function AlbumSkeleton() {
  return (
    <Card className='h-full'>
      <CardContent className='p-4'>
        <Skeleton className='aspect-square w-full mb-2 rounded-lg' />
        <div className='space-y-2'>
          <Skeleton className='h-5 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      </CardContent>
    </Card>
  );
}
