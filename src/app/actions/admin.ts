'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { MAX_ALBUM_NAME_LENGTH, MAX_TAG_LENGTH } from '@/lib/constants';

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

// --- Album Management ---

const AlbumNameSchema = z.object({
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
  if (!session) return { success: false, message: 'Unauthorized' };

  const name = formData.get('name');
  const validatedFields = AlbumNameSchema.safeParse({ name });
  if (!validatedFields.success)
    return { success: false, message: validatedFields.error.errors[0].message };

  // Check uniqueness
  const exists = await prisma.album.findFirst({
    where: {
      name: {
        equals: validatedFields.data.name,
        mode: 'insensitive',
      },
    },
  });
  if (exists) return { success: false, message: 'Album name already exists' };

  await prisma.album.create({ data: { name: validatedFields.data.name } });
  revalidatePath('/dashboard');
  revalidatePath('/albums');
  return { success: true, message: 'new album created' };
}

export async function editAlbum(albumId: number, formData: FormData) {
  const session = await requireAdmin();
  if (!session) return { success: false, message: 'Unauthorized' };

  const name = formData.get('name');
  const validatedFields = AlbumNameSchema.safeParse({ name });
  if (!validatedFields.success)
    return { success: false, message: validatedFields.error.errors[0].message };

  // Prevent renaming 'All Photos'
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album || album.name === 'All Photos')
    return { success: false, message: 'Cannot rename this album' };

  // Check uniqueness
  const exists = await prisma.album.findFirst({
    where: {
      name: {
        equals: validatedFields.data.name,
        mode: 'insensitive',
      },
    },
  });
  if (exists && exists.id !== albumId)
    return { success: false, message: 'Album name already exists' };

  await prisma.album.update({
    where: { id: albumId },
    data: { name: validatedFields.data.name },
  });
  revalidatePath('/dashboard');
  revalidatePath('/albums');
  return { success: true, message: 'Album renamed' };
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
    revalidatePath('/albums');
    return { success: true, message: 'Album deleted successfully.' };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: 'Database error: Could not delete album.',
    };
  }
}

// --- Tag Management ---

const TagNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(
    MAX_TAG_LENGTH,
    `Tag name must be ${MAX_TAG_LENGTH} characters or less.`
  );

export async function createTag(formData: FormData) {
  const session = await requireAdmin();
  if (!session) return { success: false, message: 'Unauthorized' };

  const name = formData.get('name');
  const parsed = TagNameSchema.safeParse(name);
  if (!parsed.success)
    return { success: false, message: parsed.error.errors[0].message };

  // Case-insensitive uniqueness check
  const exists = await prisma.tag.findFirst({
    where: {
      name: {
        equals: parsed.data,
        mode: 'insensitive',
      },
    },
  });
  if (exists) return { success: false, message: 'Tag name already exists' };

  await prisma.tag.create({ data: { name: parsed.data } });
  revalidatePath('/dashboard');
  return { success: true, message: 'Tag created' };
}

export async function editTag(tagId: number, formData: FormData) {
  const session = await requireAdmin();
  if (!session) return { success: false, message: 'Unauthorized' };

  const name = formData.get('name');
  const parsed = TagNameSchema.safeParse(name);
  if (!parsed.success)
    return { success: false, message: parsed.error.errors[0].message };

  // Case-insensitive uniqueness check
  const exists = await prisma.tag.findFirst({
    where: {
      name: {
        equals: parsed.data,
        mode: 'insensitive',
      },
    },
  });
  if (exists && exists.id !== tagId)
    return { success: false, message: 'Tag name already exists' };

  await prisma.tag.update({
    where: { id: tagId },
    data: { name: parsed.data },
  });
  revalidatePath('/dashboard');
  return { success: true, message: 'Tag renamed' };
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
