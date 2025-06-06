import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { UserRole } from '@prisma/client';

export async function register(formData: FormData) {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate input
  if (!username || !email || !password) {
    return { error: 'All fields are required' };
  }

  // Validate password requirements
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!passwordRegex.test(password)) {
    return {
      error:
        'Password must be at least 6 characters long and include a lowercase letter, uppercase letter, and a number',
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
      return { error: 'Username or email already exists' };
    }

    // Determine role based on email domain
    const role = email.endsWith('@toman.me.uk')
      ? UserRole.ADMIN
      : UserRole.GUEST;

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user and verification token in a transaction
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

      const verificationToken = await tx.verificationToken.create({
        data: {
          identifier: email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // Send verification email via API
      await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          token: verificationToken.token,
        }),
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

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'An error occurred during registration' };
  }
}

export async function verifyEmail(token: string) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return { error: 'Invalid verification token' };
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return { error: 'Verification token has expired' };
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Update user and delete token
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
    console.error('Email verification error:', error);
    return { error: 'An error occurred during email verification' };
  }
}

export async function resetPassword(email: string) {
  try {
    const response = await fetch('/api/auth/send-reset-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to send reset email');
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

  // Update the user's password and reset failed login attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      failedLoginAttempts: 0,
      lastFailedLogin: null,
    },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { token },
  });
}
