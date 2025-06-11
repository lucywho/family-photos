'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardFooter,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { continueAsGuest } from './actions/auth';
import Link from 'next/link';

export default function WelcomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuestAccess = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get guest user data
      const guestUser = await continueAsGuest();

      // Sign in as guest
      const result = await signIn('credentials', {
        email: guestUser.email,
        password: '', // Empty password for guest
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Redirect to albums page
      router.push('/albums');
      router.refresh();
    } catch (err) {
      setError('Failed to continue as guest. Please try again.');
      console.error('Guest access error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className='min-h-screen bg-[hsl(var(--background))] p-4'>
      <div className='max-w-[400px] lg:md:max-w-[1200px] mx-auto'>
        {/* Header Section */}
        <section className='text-center pb-8'>
          <Camera className='mx-auto text-primary' size={48} />
          <h1 className='text-3xl font-bold mt-4'>{APP_NAME}</h1>
          <p className='text-secondary mt-2'>{APP_DESCRIPTION}</p>
        </section>
        <section className='flex flex-col lg:flex-row lg:justify-between'>
          {/* Login Section */}
          <Card className='mb-4 max-h-[33vh] flex-1'>
            <CardHeader>Login</CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>

            <CardFooter>
              <Button variant='link' className='w-full' asChild>
                <Link href='/reset-password'>Forgot password?</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Register Section */}
          <Card className='mb-4 lg:mx-6 flex-1'>
            <CardHeader>Create an Account</CardHeader>
            <CardDescription className='my-4 px-6'>
              Join the Family Photos app to view and manage family photos.
            </CardDescription>
            <RegistrationForm />
          </Card>

          {/* Guest Section */}
          <Card className='max-h-[33vh] p-4 flex-1'>
            <CardHeader>Continue as Guest</CardHeader>
            <CardDescription>
              View public photos without an account
            </CardDescription>
            {error && (
              <div className='px-6 text-sm text-red-500 mb-4'>{error}</div>
            )}
            <CardFooter>
              <Button
                variant='default'
                className='w-full'
                onClick={handleGuestAccess}
                disabled={isLoading}
              >
                {isLoading ? 'Continuing as guest...' : 'Continue as Guest'}
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}
