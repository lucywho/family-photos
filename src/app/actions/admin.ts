'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { MAX_ALBUM_NAME_LENGTH } from '@/lib/constants';

// --- User Management ---

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

// --- Album & Tag Management ---

const NameSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(
      MAX_ALBUM_NAME_LENGTH,
      `Name must be ${MAX_ALBUM_NAME_LENGTH} characters or less.`
    ),
});

export async function createAlbum(formData: FormData) {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: 'Unauthorized', errors: null };
  }

  const validatedFields = NameSchema.safeParse({ name: formData.get('name') });
  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid field.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.album.create({
      data: { name: validatedFields.data.name },
    });
    revalidatePath('/dashboard');
    return { success: true, message: 'Album created successfully.' };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: 'Database error: Album name may already exist.',
      errors: null,
    };
  }
}

export async function deleteAlbum(albumId: number) {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (album?.name === 'All Photos') {
      return {
        success: false,
        message: "Cannot delete the 'All Photos' album.",
      };
    }

    await prisma.album.delete({ where: { id: albumId } });
    revalidatePath('/dashboard');
    return { success: true, message: 'Album deleted successfully.' };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: 'Database error: Could not delete album.',
    };
  }
}

export async function createTag(formData: FormData) {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: 'Unauthorized', errors: null };
  }

  const validatedFields = NameSchema.safeParse({ name: formData.get('name') });
  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid field.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.tag.create({
      data: { name: validatedFields.data.name },
    });
    revalidatePath('/dashboard');
    return { success: true, message: 'Tag created successfully.' };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: 'Database error: Tag name may already exist.',
      errors: null,
    };
  }
}

export async function deleteTag(tagId: number) {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await prisma.tag.delete({ where: { id: tagId } });
    revalidatePath('/dashboard');
    return { success: true, message: 'Tag deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Database error: Could not delete tag.' };
  }
}

// --- Notification Management ---

export async function markNotificationsAsRead(userId: number) {
  const session = await requireAdmin();
  if (!session || parseInt(session.user.id, 10) !== userId) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Database error.' };
  }
}
