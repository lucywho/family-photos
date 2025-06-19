import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const albums = await prisma.album.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(albums);
}
