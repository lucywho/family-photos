'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';

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
