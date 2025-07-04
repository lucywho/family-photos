'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';

const UpdateUserSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  email: z.string().email('Invalid email address.'),
  role: z.nativeEnum(UserRole),
});

export async function approveUser(userId: number) {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'MEMBER' },
    });
    revalidatePath('/dashboard');
    return { success: true, message: 'User approved successfully.' };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: 'Database error: Could not approve user.',
    };
  }
}

export async function deleteUser(userId: number) {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath('/dashboard');
    return { success: true, message: 'User deleted successfully.' };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: 'Database error: Could not delete user.',
    };
  }
}

export async function updateUser(
  userId: number,
  data: FormData | { username: string; email: string; role: string }
) {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: 'Unauthorized', errors: null };
  }

  let validatedFields;
  if (data instanceof FormData) {
    validatedFields = UpdateUserSchema.safeParse({
      username: data.get('username'),
      email: data.get('email'),
      role: data.get('role'),
    });
  } else {
    validatedFields = UpdateUserSchema.safeParse(data);
  }

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: validatedFields.data,
    });
    revalidatePath('/dashboard');
    return { success: true, message: 'User updated successfully.' };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: 'Database error: Could not update user.',
      errors: null,
    };
  }
}
