import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardFooter,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Camera } from 'lucide-react';
import {
  APP_NAME,
  APP_DESCRIPTION,
  PASSWORD_REQUIREMENTS,
} from '@/lib/constants';
import { LoginForm } from '@/components/auth/LoginForm';

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
        <LoginForm />

        {/* Register Section to be implemented */}
        <Card className='mb-4'>
          <CardHeader>Register</CardHeader>
          <CardContent>
            <form className='space-y-4'>
              <div className='px-4'>
                <Input
                  type='text'
                  name='username'
                  placeholder='Username'
                  required
                />
              </div>
              <div className='px-4'>
                <Input type='email' name='email' placeholder='Email' required />
              </div>
              <div className='px-4'>
                <Input
                  type='password'
                  name='password'
                  placeholder='Password'
                  required
                />
                <p className='text-xs text-secondary mt-4'>
                  {PASSWORD_REQUIREMENTS}
                </p>
              </div>
              <div className='px-4'>
                <Button type='submit' className='w-full'>
                  Register
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Guest Section to be implemented */}
        <Card>
          <CardHeader>Continue as Guest</CardHeader>
          <CardDescription>
            View public photos without an account
          </CardDescription>

          <CardFooter>
            <Button variant='secondary' className='w-full'>
              Continue as Guest
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
