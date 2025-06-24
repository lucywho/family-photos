import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className='w-[75%] md:w-[75%] mx-auto mt-4 md:mt-8'>
      <p className='text-warning text-xl my-4'>
        Sorry, we cannot show you this page.
      </p>
      <p className='text-secondary text-lg my-4'>
        Either the page does not exist, or you do not have permission to access
        it.
      </p>
      <p className='text-secondary text-lg my-4'>
        If you think this is a mistake, please contact your{' '}
        <span className='font-bold'> {APP_NAME} </span>
        administrator
      </p>
      <div className='w-full flex justify-center md:justify-start gap-2'>
        <Link href='/'>
          <Button>Log in or register</Button>
        </Link>
        <Link href='/albums'>
          <Button>Return to albums</Button>
        </Link>
      </div>
    </div>
  );
}
