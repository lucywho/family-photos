'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useFormStatus } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import {
  APP_NAME,
  PASSWORD_REQUIREMENTS,
  PRIVACY_STATEMENT,
} from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { register } from '@/app/actions/auth';
import { useState, useActionState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui';
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog';

const formSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, PASSWORD_REQUIREMENTS),
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
  const [state, formAction] = useActionState(register, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      privacyAgreement: false,
    },
  });

  if (state.success) {
    return (
      <div className='space-y-4 p-6'>
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription data-testid='registration-success-alert'>
            Registration successful! Please check your email to verify your
            account.
          </AlertDescription>
        </Alert>
        <Button
          data-testid='go-to-login-button'
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
        action={formAction}
        className='space-y-4 p-6'
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
                  name='privacyAgreement'
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='secondary'
                        size='sm'
                        className='text-xs wrap'
                      >
                        Privacy and cookies statement
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle className='sr-only'>
                        Privacy and cookies statement
                      </AlertDialogTitle>

                      <span
                        className='text-xs md:text-sm'
                        dangerouslySetInnerHTML={{ __html: PRIVACY_STATEMENT }}
                      />

                      <AlertDialogTrigger asChild>
                        <Button className='flex items-center gap-2 w-fit'>
                          <X className='h-4 w-4 text-warning' />
                          Close
                        </Button>
                      </AlertDialogTrigger>
                    </AlertDialogContent>
                  </AlertDialog>
                  <p>
                    I have read the privacy policy and cookies statement and I
                    agree to the storage and processing of my personal data
                    (username, email address, and password) for the purpose of
                    accessing the {APP_NAME} app.
                  </p>
                </div>
              </div>
            </FormItem>
          )}
        />

        <SubmitButton />
      </form>
    </Form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      data-testid='submit-registration-button'
      type='submit'
      className='w-full'
      disabled={pending}
    >
      {pending ? 'Registering...' : 'Register'}
    </Button>
  );
}
