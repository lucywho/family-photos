'use server';

import { z } from 'zod';
import { AlbumRepository } from '../data/albumRepository';
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

export async function createAlbumService(name: string, repo: AlbumRepository) {
  const validatedFields = AlbumNameSchema.safeParse({ name });
  if (!validatedFields.success)
    return { success: false, message: validatedFields.error.issues[0].message };

  // Check uniqueness
  const exists = await repo.findByName(validatedFields.data.name);
  if (exists) return { success: false, message: 'Album name already exists' };

  await repo.create({ name: validatedFields.data.name });
  return { success: true, message: 'new album created' };
}

export async function editAlbumService(
  albumId: number,
  name: string,
  repo: AlbumRepository
) {
  const validatedFields = AlbumNameSchema.safeParse({ name });
  if (!validatedFields.success)
    return { success: false, message: validatedFields.error.issues[0].message };

  // Prevent renaming 'All Photos'
  const album = await repo.findById(albumId);
  if (!album || album.name === 'All Photos')
    return { success: false, message: 'Cannot rename this album' };

  // Check uniqueness
  const exists = await repo.findByName(validatedFields.data.name);
  if (exists && exists.id !== albumId)
    return { success: false, message: 'Album name already exists' };

  await repo.update(albumId, { name: validatedFields.data.name });
  return { success: true, message: 'Album renamed' };
}

export async function deleteAlbumService(
  albumId: number,
  repo: AlbumRepository
) {
  const album = await repo.findById(albumId);
  if (!album) {
    return { success: false, message: 'Album not found' };
  }
  if (album.name === 'All Photos') {
    return { success: false, message: "Cannot delete the 'All Photos' album." };
  }
  await repo.delete(albumId);
  return { success: true, message: 'Album deleted successfully.' };
}
