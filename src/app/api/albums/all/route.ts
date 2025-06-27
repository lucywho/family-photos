import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const albums = await prisma.album.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
