'use client';

import * as z from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/app/actions/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CardFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/components/ui';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const formSuccess = form.formState.errors.root?.success;
  const formFailure = form.formState.errors.root?.error;

  const onSubmit = async (data: FormData) => {
    form.clearErrors();
    setIsLoading(true);

    try {
      await resetPassword(data.email);
      form.setValue('email', '');
      form.setError('root.success', {
        type: 'success',
        message:
          'If an account exists with this email, you will receive a password reset link shortly.',
      });
    } catch (error) {
      console.error(`Error in ResetPasswordForm: ${error}`);
      form.setError('root.error', {
        type: 'error',
        message:
          'An error occurred while sending the reset email. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        data-testid='reset-password-form'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4'
      >
        {formSuccess && (
          <div data-testid='reset-password-success' className='text-success'>
            {formSuccess.message}
          </div>
        )}
        {formFailure && (
          <div data-testid='reset-password-failure' className='text-warning'>
            {formFailure.message}
          </div>
        )}

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='px-4'>Email</FormLabel>
              <FormControl>
                <div className='px-4'>
                  <Input
                    {...field}
                    data-testid='email-input'
                    type='email'
                    placeholder='Enter your email address'
                    required
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CardFooter>
          <div className='flex flex-col w-full'>
            <Button
              type='submit'
              className='w-full'
              disabled={isLoading}
              data-testid='submit-reset-password'
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Button
              variant='secondary'
              className='w-full mx-auto'
              data-testid='home-button'
              onClick={() => router.push('/')}
            >
              {formSuccess ? 'Home' : 'Cancel'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
}
