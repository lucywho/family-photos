import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/db';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  pages: {
    signIn: '/',
    error: '/',
    verifyRequest: '/verify-request',
    newUser: '/register',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Invalid credentials');
        }

        // Handle guest access
        if (credentials.email === 'guest@family-photos.app') {
          const guestUser = await prisma.user.findUnique({
            where: { email: 'guest@family-photos.app' },
          });

          if (!guestUser) {
            throw new Error('Guest access not available');
          }

          return {
            id: guestUser.id.toString(),
            email: guestUser.email,
            name: guestUser.username,
            role: guestUser.role,
          };
        }

        // Regular user login
        if (!credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Check failed login attempts
        if (user.failedLoginAttempts >= 3) {
          const timeSinceLastAttempt = user.lastFailedLogin
            ? Date.now() - user.lastFailedLogin.getTime()
            : 0;

          // If less than 1 hour has passed since last attempt
          if (timeSinceLastAttempt < 60 * 60 * 1000) {
            throw new Error('Account locked. Please reset your password.');
          }

          // Reset failed attempts after 1 hour
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lastFailedLogin: null,
            },
          });
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          // Increment failed login attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: user.failedLoginAttempts + 1,
              lastFailedLogin: new Date(),
            },
          });
          throw new Error('Invalid credentials');
        }

        // Reset failed login attempts on successful login
        if (user.failedLoginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lastFailedLogin: null,
            },
          });
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};

import NextAuth from 'next-auth';
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
