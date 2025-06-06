'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { confirmPasswordReset } from '@/app/actions/auth';
import { PASSWORD_REQUIREMENTS } from '@/lib/constants';

interface ConfirmResetPasswordFormProps {
  token: string;
}

export function ConfirmResetPasswordForm({
  token,
}: ConfirmResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(token, password);
      router.push('/?message=password-reset-success');
    } catch (error) {
      setError('Failed to reset password. The link may have expired.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Input
            type='password'
            placeholder='New password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className='space-y-2'>
          <Input
            type='password'
            placeholder='Confirm new password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <p className='text-xs text-secondary'>{PASSWORD_REQUIREMENTS}</p>
        {error && <div className='text-sm text-red-500'>{error}</div>}
      </CardContent>
      <CardFooter>
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </CardFooter>
    </form>
  );
}
