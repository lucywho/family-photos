import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
