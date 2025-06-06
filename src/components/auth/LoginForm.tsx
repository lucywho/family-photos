'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('username') as string; // Using username field for email
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoginError(result.error);
      } else {
        router.push('/albums');
        router.refresh();
      }
    } catch {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <Card className='mb-4'>
      <CardHeader>Login</CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className='space-y-4'>
          <div className='px-4'>
            <Input
              type='text'
              name='username'
              placeholder='Email address'
              required
              disabled={isLoggingIn}
            />
          </div>
          <div className='px-4'>
            <Input
              type='password'
              name='password'
              placeholder='Password'
              required
              disabled={isLoggingIn}
            />
          </div>
          {loginError && (
            <div className='px-4 text-sm text-red-500'>{loginError}</div>
          )}
          <div className='px-4'>
            <Button type='submit' className='w-full' disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant='link' className='w-full' asChild>
          <Link href='/reset-password'>Forgot password?</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
