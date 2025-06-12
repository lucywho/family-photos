'use client';

import { useState, useTransition, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/app/actions/auth';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
      'Password must be at least 6 characters long and include a lowercase letter, uppercase letter, and a number'
    ),
  privacyAgreement: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the privacy policy',
  }),
});

type FormData = z.infer<typeof formSchema>;

const initialState = {
  error: null as string | null,
  success: false,
};

export function RegistrationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(register, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      privacyAgreement: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('privacyAgreement', data.privacyAgreement.toString());

    startTransition(async () => {
      await formAction(formData);
    });
  };

  if (state.success) {
    return (
      <div className='space-y-4 p-6'>
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Registration successful! Please check your email to verify your
            account.
          </AlertDescription>
        </Alert>
        <Button
          variant='secondary'
          className='w-full'
          onClick={() => router.push('/')}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        data-testid='registration-form'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4 p-6'
        method='POST'
      >
        {state.error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid='username-input'
                  type='text'
                  placeholder='Choose a username'
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid='email-input'
                  type='email'
                  placeholder='Enter your email'
                  required
                />
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
                <div className='relative'>
                  <Input
                    {...field}
                    data-testid='password-input'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Create a password'
                    required
                  />
                  <Button
                    data-testid='show-password-button'
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-[-10px] px-3 hover:bg-transparent text-primary'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </FormControl>
              <div className='mt-2 text-xs text-muted-foreground'>
                Password must:
                <ul
                  data-testid='password-requirements'
                  className='list-disc pl-4'
                >
                  <li>Be at least 6 characters long</li>
                  <li>Include a lowercase letter</li>
                  <li>Include an uppercase letter</li>
                  <li>Include a number</li>
                </ul>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='privacyAgreement'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
              <FormControl>
                <Checkbox
                  data-testid='privacy-agreement-check'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  required
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>Privacy Agreement</FormLabel>
                <div
                  data-testid='privacy-statement'
                  className='text-sm text-muted-foreground'
                >
                  I agree to the storage and processing of my personal data
                  (username, email address, and password) for the purpose of
                  accessing the Family Photos app. My data will be used solely
                  for authentication and communication purposes. I understand
                  that my email address will be used for account verification
                  and password reset requests.
                </div>
              </div>
            </FormItem>
          )}
        />

        <SubmitButton isPending={isPending} />
      </form>
    </Form>
  );
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button
      data-testid='submit-registration-button'
      type='submit'
      className='w-full'
      disabled={isPending}
    >
      {isPending ? 'Registering...' : 'Register'}
    </Button>
  );
}
