import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';
import {
  APP_NAME,
  APP_DESCRIPTION,
  PASSWORD_REQUIREMENTS,
} from '@/lib/constants';

export default function WelcomePage() {
  return (
    <main className='min-h-screen bg-[hsl(var(--background))] p-4'>
      <div className='max-w-[400px] mx-auto'>
        {/* Header Section */}
        <section className='text-center pb-8'>
          <Camera className='mx-auto text-primary' size={48} />
          <h1 className='text-3xl font-bold mt-4'>{APP_NAME}</h1>
          <p className='text-secondary mt-2'>{APP_DESCRIPTION}</p>
        </section>

        {/* Login Section */}
        <section className='pb-6'>
          <div className='border border-[hsl(var(--card-border))] bg-background rounded-lg'>
            <div className='p-6 border-b border-[hsl(var(--card-border))]'>
              <h2 className='text-2xl font-semibold text-center'>Login</h2>
            </div>
            <div className='p-6'>
              <form className='space-y-6'>
                <div className='px-4'>
                  <Input
                    type='text'
                    name='username'
                    placeholder='Username or email'
                    required
                  />
                </div>
                <div className='px-4'>
                  <Input
                    type='password'
                    name='password'
                    placeholder='Password'
                    required
                  />
                </div>
                <div className='px-4'>
                  <Button type='submit' className='w-full'>
                    Login
                  </Button>
                </div>
              </form>
              <div className='mt-4 px-4'>
                <Button variant='link' className='w-full'>
                  Forgot password?
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Register Section */}
        <section className='pb-6'>
          <div className='border border-[hsl(var(--card-border))] bg-background rounded-lg'>
            <div className='p-6 border-b border-[hsl(var(--card-border))]'>
              <h2 className='text-2xl font-semibold text-center'>Register</h2>
            </div>
            <div className='p-6'>
              <form className='space-y-6'>
                <div className='px-4'>
                  <Input
                    type='text'
                    name='username'
                    placeholder='Username'
                    required
                  />
                </div>
                <div className='px-4'>
                  <Input
                    type='email'
                    name='email'
                    placeholder='Email'
                    required
                  />
                </div>
                <div className='px-4'>
                  <Input
                    type='password'
                    name='password'
                    placeholder='Password'
                    required
                  />
                  <p className='text-xs text-secondary mt-2'>
                    {PASSWORD_REQUIREMENTS}
                  </p>
                </div>
                <div className='px-4'>
                  <Button type='submit' className='w-full'>
                    Register
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Guest Section */}
        <section>
          <div className='border border-[hsl(var(--card-border))] bg-background rounded-lg'>
            <div className='p-6 border-b border-[hsl(var(--card-border))]'>
              <h2 className='text-2xl font-semibold text-center'>
                Continue as Guest
              </h2>
              <p className='text-sm text-secondary mt-2 text-center'>
                View public photos without an account
              </p>
            </div>
            <div className='p-6'>
              <div className='px-4'>
                <Button variant='secondary' className='w-full'>
                  Continue as Guest
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
