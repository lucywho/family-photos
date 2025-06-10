import { createTransport } from 'nodemailer';
import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

type SendVerificationEmailParams = {
  email: string;
  username: string;
  token?: string;
};

export async function sendVerificationEmail({
  email,
  username,
  token,
}: SendVerificationEmailParams) {
  // If no token provided, create a new one
  if (!token) {
    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Create a new verification token
    token = randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
  }

  // Send verification email
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Family Photos: please verify your email address',
    html: `
      <h1>Welcome to ${process.env.APP_NAME || 'Family Photos'}!</h1>
      <p>Hi ${username},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email Address</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    `,
  });

  return token;
}
