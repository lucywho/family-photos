'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { continueAsGuest } from './actions/auth';
import { signIn, signOut } from 'next-auth/react';
import { APP_NAME, APP_DESCRIPTION } from '@/shared/constants';
import { LoginForm, RegistrationForm } from '@/features/auth/components';
import {
  Button,
  Card,
  CardHeader,
  CardFooter,
  CardDescription,
  CardContent,
} from '@/shared/components/ui';

export default function WelcomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterExpanded, setIsRegisterExpanded] = useState(false);

  const handleGuestAccess = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign out any existing session first
      await signOut({ redirect: false });

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

  const toggleRegister = () => {
    setIsRegisterExpanded(!isRegisterExpanded);
  };

  return (
    <main className='min-h-screen bg-background p-4 '>
      <div className='max-w-[400px] lg:max-w-[1000px] mx-auto'>
        {/* Header Section */}
        <section className='text-center pb-8'>
          <Camera className='mx-auto text-primary' size={48} />
          <h1 className='text-3xl font-bold mt-4'>{APP_NAME}</h1>
          <p className='text-secondary mt-2'>{APP_DESCRIPTION}</p>
        </section>
        <section className='grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start'>
          {/* Login Section - Order 1 on mobile, Order 2 on desktop */}
          <Card className='mb-4 flex-1 order-1 lg:order-2'>
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

          {/* Register Section - Order 2 on mobile, Order 1 on desktop */}
          <Card className='mb-4 flex-1 overflow-hidden lg:min-h-[390px] order-2 lg:order-1'>
            <div
              className='cursor-pointer transition-all duration-300 ease-in-out'
              onClick={toggleRegister}
            >
              <CardHeader>
                <span>Create an Account</span>
              </CardHeader>
              <CardDescription className='px-6 pb-4 min-h-[60px]'>
                Join the {APP_NAME} app to view and manage family photos.
              </CardDescription>
              {!isRegisterExpanded && (
                <div className='px-6 pb-4'>
                  <Button
                    variant='default'
                    className='w-full'
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRegister();
                    }}
                  >
                    Register now
                  </Button>
                </div>
              )}
            </div>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isRegisterExpanded
                  ? 'max-h-[800px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <CardContent className='px-6 pt-0'>
                <RegistrationForm />
              </CardContent>
            </div>
          </Card>

          {/* Guest Section - Order 3 on mobile, Order 3 on desktop */}
          <Card className='mb-4 flex-1 lg:min-h-[390px] order-3 lg:order-3'>
            <CardHeader>Continue as Guest</CardHeader>
            <CardDescription className='min-h-[60px]'>
              View public photos without an account
            </CardDescription>
            {error && (
              <div className='px-6 text-sm text-red-500 mb-4'>{error}</div>
            )}
            <CardFooter>
              <Button
                variant='default'
                className='w-full flex-1'
                onClick={handleGuestAccess}
                disabled={isLoading}
                data-testid='continue-as-guest-button'
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
