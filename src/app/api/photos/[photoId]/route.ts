'use server';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function checkS3Availability(): Promise<boolean> {
  try {
    await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_URL,
        MaxKeys: 1,
      })
    );
    return true;
  } catch (error) {
    console.error('Error checking S3 availability:', error);
    return false;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { photoId } = await params;

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(photoId, 10) },
      include: {
        albums: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: { name: true },
        },
      },
    });

    if (!photo) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    // Check if photo is family-only and user is not admin
    if (photo.isFamilyOnly && session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check S3 availability and transform URL if available
    let photoUrl = photo.url;
    try {
      const isS3Available = await checkS3Availability();
      if (isS3Available) {
        photoUrl = `/api/photos/proxy?key=${encodeURIComponent(
          photo.url.split('/').pop() || ''
        )}`;
      }
    } catch (error) {
      console.error('S3 availability check failed:', error);
      // Continue with original URL if S3 check fails
    }

    return NextResponse.json({
      ...photo,
      url: photoUrl,
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
