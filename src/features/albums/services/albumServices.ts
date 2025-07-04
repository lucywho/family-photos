'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { MAX_ALBUM_NAME_LENGTH } from '@/shared/constants';

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
