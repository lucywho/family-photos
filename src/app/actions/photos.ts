'use server';

import { prisma } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { photoEditSchema, type PhotoEditResponse } from '@/lib/schemas/photo';

export async function updatePhoto(
  photoId: number,
  formData: FormData
): Promise<PhotoEditResponse> {
  try {
    // Parse and validate the form data
    const rawData = {
      title: formData.get('title'),
      notes: formData.get('notes'),
      date: formData.get('date'),
      familyOnly: formData.get('familyOnly') === 'true',
      tags: formData.getAll('tags'),
      albums: JSON.parse((formData.get('albums') as string) || '[]'),
    };

    const validatedData = photoEditSchema.parse(rawData);

    // --- TAGS ---
    // Find or create tags (case-insensitive), get their IDs
    const tagRecords = await Promise.all(
      (validatedData.tags || []).map(async (tagName: string) => {
        // Find existing tag (case-insensitive)
        const existingTag = await prisma.tag.findFirst({
          where: {
            name: {
              equals: tagName,
              mode: 'insensitive',
            },
          },
        });
        if (existingTag) return existingTag;
        // Create new tag with the entered casing
        return prisma.tag.create({ data: { name: tagName } });
      })
    );

    // --- ALBUMS ---
    // Always include "All Photos" album
    const albumNames = [
      ...new Set([
        ...(validatedData.albums || []).map((a) => a.name),
        'All Photos',
      ]),
    ];

    const albumRecords = await Promise.all(
      albumNames.map(async (albumName) => {
        return prisma.album.upsert({
          where: { name: albumName },
          update: {},
          create: { name: albumName },
        });
      })
    );

    // --- UPDATE PHOTO ---
    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: {
        title: validatedData.title,
        notes: validatedData.notes,
        date: validatedData.date,
        isFamilyOnly: validatedData.familyOnly,
        tags: {
          set: [], // disconnect all first
          connect: tagRecords.map((tag) => ({ id: tag.id })),
        },
        albums: {
          set: [], // disconnect all first
          connect: albumRecords.map((album) => ({ id: album.id })),
        },
      },
      include: {
        tags: true,
        albums: true,
      },
    });

    // Revalidate the photo and album pages
    revalidatePath(`/photos/${photoId}`);
    revalidatePath('/albums');

    return {
      success: true,
      message: 'Photo updated successfully',
      data: {
        ...updatedPhoto,
        familyOnly: updatedPhoto.isFamilyOnly,
        tags: updatedPhoto.tags.map((t) => t.name),
        albums: updatedPhoto.albums.map((a) => ({ id: a.id, name: a.name })),
      },
    };
  } catch (error) {
    console.error('Error updating photo:', error);

    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(error.formErrors.fieldErrors)) {
        if (value) fieldErrors[key] = value;
      }

      return {
        success: false,
        message: 'Invalid form data',
        errors: fieldErrors,
      };
    }

    return {
      success: false,
      message: 'Failed to update photo',
    };
  }
}
