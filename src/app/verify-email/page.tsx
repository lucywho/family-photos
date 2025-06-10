'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Camera } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

type VerificationState = 'verifying' | 'success' | 'expired' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerificationState>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setState('error');
      setError('Invalid verification link');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.error) {
          if (result.error.includes('expired')) {
            setState('expired');
          } else {
            setState('error');
            setError(result.error);
          }
        } else {
          setState('success');
        }
      } catch {
        setState('error');
        setError('An unexpected error occurred');
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: searchParams.get('email') }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      setState('verifying');
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to resend verification email'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className='min-h-screen bg-[hsl(var(--background))] p-4'>
      <div className='max-w-[400px] mx-auto'>
        {/* Header Section */}
        <section className='text-center pb-8'>
          <Camera className='mx-auto text-primary' size={48} />
          <h1 className='text-3xl font-bold mt-4'>{APP_NAME}</h1>
          <p className='text-secondary mt-2'>Email Verification</p>
        </section>

        <Card>
          <CardHeader>Verify Your Email</CardHeader>
          <CardDescription className='my-4 px-6'>
            {state === 'verifying' && 'Verifying your email address...'}
            {state === 'success' &&
              'Your email has been verified successfully!'}
            {state === 'expired' && 'This verification link has expired.'}
            {state === 'error' && 'There was a problem verifying your email.'}
          </CardDescription>

          <div className='p-6'>
            {/* Loading State */}
            {state === 'verifying' && (
              <div className='flex flex-col items-center space-y-4'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <p className='text-sm text-muted-foreground'>
                  Please wait while we verify your email...
                </p>
              </div>
            )}

            {/* Success State */}
            {state === 'success' && (
              <div className='flex flex-col items-center space-y-4'>
                <CheckCircle2 className='h-8 w-8 text-green-500' />
                <p className='text-sm text-center'>
                  Your email has been verified! You can now log in to your
                  account.
                </p>
                <Button className='w-full' onClick={() => router.push('/')}>
                  Go to Login
                </Button>
              </div>
            )}

            {/* Expired State */}
            {state === 'expired' && (
              <div className='flex flex-col items-center space-y-4'>
                <Mail className='h-8 w-8 text-yellow-500' />
                <p className='text-sm text-center'>
                  This verification link has expired. Would you like us to send
                  you a new one?
                </p>
                <Button
                  className='w-full'
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              </div>
            )}

            {/* Error State */}
            {state === 'error' && (
              <div className='flex flex-col items-center space-y-4'>
                <AlertCircle className='h-8 w-8 text-destructive' />
                <Alert variant='destructive'>
                  <AlertDescription>
                    {error || 'An error occurred during verification'}
                  </AlertDescription>
                </Alert>
                <div className='flex flex-col space-y-2 w-full'>
                  <Button
                    variant='secondary'
                    className='w-full'
                    onClick={() => router.push('/')}
                  >
                    Back to Home
                  </Button>
                  <Button
                    variant='ghost'
                    className='w-full'
                    onClick={() => router.push('/')}
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
