import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';
import {
  APP_NAME,
  APP_DESCRIPTION,
  PASSWORD_REQUIREMENTS,
} from '@/lib/constants';

export default function WelcomePage() {
  return (
    <main className='min-h-screen bg-[#212a31] flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <Camera className='mx-auto h-12 w-12 text-[#124e66]' />
          <h1 className='mt-6 text-3xl font-bold tracking-tight text-[#d3d9d4]'>
            {APP_NAME}
          </h1>
          <p className='mt-2 text-sm text-[#748d92]'>{APP_DESCRIPTION}</p>
        </div>

        <div className='mt-8 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className='space-y-4'>
                <div className='space-y-2'>
                  <Input type='text' placeholder='Username or email' required />
                </div>
                <div className='space-y-2'>
                  <Input type='password' placeholder='Password' required />
                </div>
                <Button className='w-full' type='submit'>
                  Login
                </Button>
              </form>
            </CardContent>
            <CardFooter className='flex flex-col space-y-2'>
              <Button variant='link' className='w-full'>
                Forgot password?
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>
                Create a new account to access family photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className='space-y-4'>
                <div className='space-y-2'>
                  <Input type='text' placeholder='Username' required />
                </div>
                <div className='space-y-2'>
                  <Input type='email' placeholder='Email address' required />
                </div>
                <div className='space-y-2'>
                  <Input type='password' placeholder='Password' required />
                  <p className='text-xs text-[#748d92]'>
                    {PASSWORD_REQUIREMENTS}
                  </p>
                </div>
                <Button className='w-full' type='submit'>
                  Register
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className='text-center'>
            <Button variant='secondary' className='w-full'>
              Continue as Guest
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
