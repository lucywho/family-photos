import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// --- Admin Dashboard Data Fetching ---

export async function getUsers() {
  return prisma.user.findMany({
    where: {
      NOT: {
        AND: [{ username: 'Guest' }, { email: 'guest@family-photos.app' }],
      },
    },
    orderBy: { username: 'asc' },
  });
}

export async function getPendingUsers() {
  return prisma.user.findMany({
    where: {
      role: 'GUEST',
      emailVerified: true,
      NOT: {
        AND: { username: 'Guest' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getAlbumsWithPhotoCount() {
  return prisma.album.findMany({
    include: {
      _count: {
        select: { photos: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getTagsWithPhotoCount() {
  return prisma.tag.findMany({
    include: {
      _count: {
        select: { photos: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getUnreadNotifications(userId: number) {
  return prisma.notification.findMany({
    where: {
      userId: userId,
      isRead: false,
    },
    orderBy: { createdAt: 'desc' },
  });
}
