import { NextResponse } from 'next/server';
import { AlbumRepository } from '@/features/albums/data/albumRepository';

export async function GET() {
  try {
    const repo = new AlbumRepository();
    const albums = await repo.findAll();
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
