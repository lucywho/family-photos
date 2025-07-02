import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface Album {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  photos: {
    url: string;
  }[];
  _count: {
    photos: number;
  };
}

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

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get albums data first
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.album.count();

    // Get albums with their first photo for thumbnail
    const albums = await prisma.album.findMany({
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            photos: true,
          },
        },
        photos: {
          where: { isFamilyOnly: false },
          take: 1,
          orderBy: [
            {
              id: 'asc',
            },
          ],
          select: {
            url: true,
          },
        },
      },
    });

    // Check S3 availability separately
    let isS3Available = false;
    try {
      isS3Available = await checkS3Availability();
    } catch (error) {
      console.error('S3 availability check failed:', error);
      // Continue with isS3Available as false
    }

    // Transform the data to match the frontend interface
    const transformedAlbums = albums.map((album: Album) => {
      let thumbnailUrl: string | undefined;

      if (album.photos[0]?.url) {
        thumbnailUrl = `/api/photos/proxy?key=${encodeURIComponent(
          album.photos[0].url.split('/').pop() || ''
        )}`;
      }

      return {
        id: album.id.toString(),
        name: album.name,
        photoCount: album._count.photos,
        thumbnailUrl,
      };
    });

    // Always return album data, even if S3 is unavailable
    return NextResponse.json({
      albums: transformedAlbums,
      hasMore: skip + limit < totalCount,
      isS3Available,
    });
  } catch (error) {
    // Only return error for non-S3 related issues
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}
