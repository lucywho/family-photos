'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email address or password'),
  password: z.string().min(1, 'Invalid email address or password'),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setLoginError(result.error);
      } else {
        router.push('/albums');
        router.refresh();
      }
    } catch (error) {
      setLoginError('Sorry, something went wrong. Please try again.');
      console.error(`LoginForm error: ${error}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Form {...form}>
      <form
        data-testid='login-form'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4'
      >
        {loginError && (
          <Alert variant='destructive' data-testid='login-error-message'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className='px-2'>
                  <Input
                    {...field}
                    data-testid='email-input'
                    type='email'
                    placeholder='Enter your email address'
                    disabled={isLoggingIn}
                    className='focus:bg-secondary focus:text-background'
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className='px-2 relative'>
                  <Input
                    {...field}
                    data-testid='password-input'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    disabled={isLoggingIn}
                    className='focus:bg-secondary focus:text-background'
                  />
                  <button
                    type='button'
                    data-testid='show-password-button'
                    className='absolute right-0 top-0 h-full mr-4 py-2 text-sm text-primary'
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='px-2'>
          <Button
            type='submit'
            className='w-full'
            disabled={isLoggingIn}
            data-testid='login-button'
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
