'use server';

import { AlbumRepository } from '@/features/albums/data/albumRepository';
import {
  createAlbumService,
  editAlbumService,
  deleteAlbumService,
} from '@/features/albums/services/albumServices';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';

type AlbumActionState = {
  error: string | null;
  success: boolean;
  message: string | null;
};

export async function createAlbum(
  formData: FormData
): Promise<AlbumActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: 'Unauthorized', message: null };

  const name = formData.get('name') as string;
  const repo = new AlbumRepository();
  const result = await createAlbumService(name, repo);

  if (result.success) {
    revalidatePath('/dashboard');
    revalidatePath('/albums');
    return {
      success: true,
      error: null,
      message: 'successfully created album',
    };
  }
  return {
    success: false,
    error: result.message,
    message: null,
  };
}

export async function editAlbum(
  albumId: number,
  formData: FormData
): Promise<AlbumActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: 'Unauthorized', message: null };

  const name = formData.get('name') as string;
  const repo = new AlbumRepository();
  const result = await editAlbumService(Number(albumId), name, repo);

  if (result.success) {
    revalidatePath('/dashboard');
    revalidatePath('/albums');
    return {
      success: true,
      error: null,
      message: `succesfully edited ${name} album`,
    };
  }
  return { success: false, error: result.message, message: null };
}

export async function deleteAlbum(albumId: number): Promise<AlbumActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: 'Unauthorized', message: null };

  const repo = new AlbumRepository();
  const result = await deleteAlbumService(Number(albumId), repo);

  if (result.success) {
    revalidatePath('/dashboard');
    revalidatePath('/albums');
    return {
      success: true,
      error: null,
      message: 'successfully deleted album',
    };
  }
  return { success: false, error: result.message, message: null };
}
