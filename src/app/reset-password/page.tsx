'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const router = useRouter();

  return (
    <main className='min-h-screen bg-[hsl(var(--background))] p-4'>
      <div className='max-w-[400px] mx-auto'>
        <Card className='md:mt-10'>
          <CardHeader>Reset Password</CardHeader>
          <CardDescription className='my-4 px-6'>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
          <ResetPasswordForm />
          <CardFooter>
            <Button
              variant='secondary'
              className='w-full mx-auto'
              onClick={() => router.push('/')}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
