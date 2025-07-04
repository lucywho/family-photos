'use server';

import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/email';
import { PASSWORD_REQUIREMENTS } from '@/shared/constants';

type RegisterState = {
  error: string | null;
  success: boolean;
};

if (!process.env.ADMIN_EMAIL_DOMAIN) {
  throw new Error('ADMIN_EMAIL_DOMAIN environment variable is not set');
}

const adminEmail = process.env.ADMIN_EMAIL_DOMAIN;

export async function register(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const privacyAgreement = formData.get('privacyAgreement') === 'on';

  // Validate input
  if (!username || !email || !password) {
    return { error: 'All fields are required', success: false };
  }

  if (!privacyAgreement) {
    return { error: 'You must agree to the privacy policy', success: false };
  }

  // Validate password requirements
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!passwordRegex.test(password)) {
    return {
      error: PASSWORD_REQUIREMENTS,
      success: false,
    };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return { error: 'Username or email already exists', success: false };
    }

    // Determine role based on email domain
    const role = email.endsWith(adminEmail) ? UserRole.ADMIN : UserRole.GUEST;

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          role,
          emailVerified: false,
        },
      });

      // If user is not an admin, notify admins
      if (role !== UserRole.ADMIN) {
        const admins = await tx.user.findMany({
          where: { role: UserRole.ADMIN },
        });

        for (const admin of admins) {
          await tx.notification.create({
            data: {
              userId: admin.id,
              message: `New registration request from ${username} (${email})`,
            },
          });
        }
      }
    });

    // Send verification email outside transaction
    try {
      await sendVerificationEmail({
        email,
        username,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw here - we still want the registration to succeed
      // The user can request a new verification email if needed
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'An error occurred during registration', success: false };
  }
}

type VerifyEmailState = {
  error?: string;
  success?: boolean;
};

export async function verifyEmail(token: string): Promise<VerifyEmailState> {
  try {
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return { error: 'Invalid verification token' };
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return { error: 'Verification token has expired' };
    }

    // Find the user by email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Update user and delete token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error verifying email:', error);
    return { error: 'Failed to verify email' };
  }
}

export async function resetPassword(email: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/send-reset-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send reset email');
    }
  } catch (error) {
    console.error('Error in resetPassword action:', error);
    throw error;
  }
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    throw new Error('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Hash the new password
  const hashedPassword = await hash(newPassword, 10);

  // Update the user's password and reset failed login attempts in a transaction
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
      },
    }),
    // Delete the used token
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);
}

export async function continueAsGuest() {
  try {
    // Create a temporary guest user if it doesn't exist
    const guestUser = await prisma.user.upsert({
      where: { email: 'guest@family-photos.app' },
      update: {},
      create: {
        username: 'Guest',
        email: 'guest@family-photos.app',
        passwordHash: '', // Empty password since guest can't log in
        role: UserRole.GUEST,
        emailVerified: true, // Guest doesn't need email verification
      },
    });

    // Return the guest user data for session creation
    return {
      id: guestUser.id.toString(),
      email: guestUser.email,
      name: guestUser.username,
      role: guestUser.role,
    };
  } catch (error) {
    console.error('Error in continueAsGuest:', error);
    throw new Error('Failed to continue as guest');
  }
}
