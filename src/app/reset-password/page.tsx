'use client';

import { ResetPasswordForm } from '@/components/auth';
import { Card, CardHeader, CardDescription } from '@/components/ui';

export default function ResetPasswordPage() {
  return (
    <main className='min-h-screen bg-background p-4'>
      <div className='max-w-[400px] mx-auto'>
        <Card className='md:mt-10'>
          <CardHeader>Reset Password</CardHeader>
          <CardDescription className='my-4 px-6'>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
          <ResetPasswordForm />
        </Card>
      </div>
    </main>
  );
}
