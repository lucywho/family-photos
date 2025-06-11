'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <>
      <form onSubmit={handleLogin} className='space-y-4'>
        <div className='px-2'>
          <Input
            type='text'
            name='username'
            placeholder='Email address'
            required
            disabled={isLoggingIn}
          />
        </div>
        <div className='px-2 relative'>
          <Input
            type={showPassword ? 'text' : 'password'}
            name='password'
            placeholder='Password'
            required
            disabled={isLoggingIn}
          />
          <button
            type='button'
            className='absolute right-0 top-0 h-full mr-4 py-2 text-sm text-primary'
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {loginError && (
          <div className='px-2 text-sm text-red-500'>{loginError}</div>
        )}
        <div className='px-2'>
          <Button type='submit' className='w-full' disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>
    </>
  );
}
