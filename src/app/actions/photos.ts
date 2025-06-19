'use server';

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

    // TODO: Implement database update
    // This is a placeholder that will be implemented in later stages
    console.log('Updating photo:', photoId, validatedData);

    // Revalidate the photo and album pages
    revalidatePath(`/photos/${photoId}`);
    revalidatePath('/albums');

    return {
      success: true,
      message: 'Photo updated successfully',
      data: validatedData,
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
