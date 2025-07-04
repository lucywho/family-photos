'use server';

import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { MAX_ALBUM_NAME_LENGTH } from '@/shared/constants';

type AlbumActionState = {
  error: string | null;
  success: boolean;
};

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    throw new Error('Unauthorized');
  }
}

export async function createAlbum(
  prevState: AlbumActionState,
  formData: FormData
): Promise<AlbumActionState> {
  try {
    await checkAdminAccess();

    const name = formData.get('name') as string;
    if (!name) {
      return { error: 'Album name is required', success: false };
    }

    if (name.length > MAX_ALBUM_NAME_LENGTH) {
      return {
        error: `Album name must be ${MAX_ALBUM_NAME_LENGTH} characters or less`,
        success: false,
      };
    }

    // Don't allow creating an album with the same name as "All Photos"
    if (name.toLowerCase() === 'all photos') {
      return {
        error: 'Cannot create an album with this name',
        success: false,
      };
    }

    // Check if album already exists (case-insensitive)
    const existingAlbum = await prisma.album.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingAlbum) {
      return {
        error: 'An album with this name already exists',
        success: false,
      };
    }

    await prisma.album.create({
      data: { name },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error creating album:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        error: 'You do not have permission to create albums',
        success: false,
      };
    }
    return { error: 'Failed to create album', success: false };
  }
}

export async function deleteAlbum(
  prevState: AlbumActionState,
  albumId: string
): Promise<AlbumActionState> {
  try {
    await checkAdminAccess();

    // Don't allow deleting the "All Photos" album
    const album = await prisma.album.findUnique({
      where: { id: parseInt(albumId) },
    });

    if (!album) {
      return { error: 'Album not found', success: false };
    }

    if (album.name.toLowerCase() === 'all photos') {
      return {
        error: 'Cannot delete the All Photos album',
        success: false,
      };
    }

    await prisma.album.delete({
      where: { id: parseInt(albumId) },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting album:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        error: 'You do not have permission to delete albums',
        success: false,
      };
    }
    return { error: 'Failed to delete album', success: false };
  }
}

export async function addPhotoToAlbum(
  prevState: AlbumActionState,
  albumId: string,
  photoId: string
): Promise<AlbumActionState> {
  try {
    await checkAdminAccess();

    await prisma.album.update({
      where: { id: parseInt(albumId) },
      data: {
        photos: {
          connect: { id: parseInt(photoId) },
        },
      },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding photo to album:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        error: 'You do not have permission to modify albums',
        success: false,
      };
    }
    return { error: 'Failed to add photo to album', success: false };
  }
}

export async function removePhotoFromAlbum(
  prevState: AlbumActionState,
  albumId: string,
  photoId: string
): Promise<AlbumActionState> {
  try {
    await checkAdminAccess();

    // Don't allow removing photos from "All Photos" album
    const album = await prisma.album.findUnique({
      where: { id: parseInt(albumId) },
    });

    if (!album) {
      return { error: 'Album not found', success: false };
    }

    if (album.name.toLowerCase() === 'all photos') {
      return {
        error: 'Cannot remove photos from the All Photos album',
        success: false,
      };
    }

    await prisma.album.update({
      where: { id: parseInt(albumId) },
      data: {
        photos: {
          disconnect: { id: parseInt(photoId) },
        },
      },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing photo from album:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        error: 'You do not have permission to modify albums',
        success: false,
      };
    }
    return { error: 'Failed to remove photo from album', success: false };
  }
}
