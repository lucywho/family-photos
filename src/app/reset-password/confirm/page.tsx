import React from 'react';
import { ConfirmResetPasswordForm } from '@/features/auth/components';
import {
  Button,
  Card,
  CardHeader,
  CardFooter,
  CardDescription,
} from '@/shared/components/ui';

export default function ConfirmResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const search = React.use(searchParams);

  if (!search.token) {
    return (
      <main className='min-h-screen bg-background p-4'>
        <div className='max-w-[400px] mx-auto'>
          <Card>
            <CardHeader>
              <h1 className='text-2xl font-bold'>Invalid Reset Link</h1>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant='link' className='w-full' asChild>
                <a href='/reset-password'>Request a new reset link</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-background p-4'>
      <div className='max-w-[400px] mx-auto'>
        <Card>
          <CardHeader>
            <h1 className='text-2xl font-bold'>Set New Password</h1>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <ConfirmResetPasswordForm token={search.token} />
        </Card>
      </div>
    </main>
  );
}
