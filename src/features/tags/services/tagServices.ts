'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { MAX_TAG_LENGTH } from '@/shared/constants';

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
