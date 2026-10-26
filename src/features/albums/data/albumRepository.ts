import { prisma } from '@/lib/db';

export class AlbumRepository {
  async create(data: { name: string }) {
    return prisma.album.create({ data });
  }
  async findByName(name: string) {
    return prisma.album.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
      },
    });
  }

  async findById(id: number) {
    return prisma.album.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.album.findMany({ orderBy: { name: 'asc' } });
  }

  // In albumRepository.ts
  async findPaginatedWithThumbnails(skip: number, take: number) {
    return prisma.album.findMany({
      skip,
      take,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { photos: true } },
        photos: {
          where: { isFamilyOnly: false },
          take: 1,
          orderBy: [{ id: 'asc' }],
          select: { url: true },
        },
      },
    });
  }

  async countAll() {
    return prisma.album.count();
  }

  async update(id: number, data: { name: string }) {
    return prisma.album.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.album.delete({ where: { id } });
  }
}
