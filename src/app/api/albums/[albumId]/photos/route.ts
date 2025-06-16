import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { UserRole } from '@prisma/client';

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

// Helper function to get album ID from params
async function getAlbumId(
  params: Promise<{ albumId: string }>
): Promise<number> {
  const resolvedParams = await params;
  return parseInt(resolvedParams.albumId, 10);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    // Get album ID from params
    const albumId = await getAlbumId(params);

    // Get the album
    const album = await prisma.album.findUnique({
      where: { id: albumId },
      include: {
        _count: {
          select: { photos: true },
        },
      },
    });

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    // Get total count of photos for pagination
    // For guest users, exclude family-only photos
    const whereClause =
      session.user.role === UserRole.GUEST ? { isFamilyOnly: false } : {};

    const totalCount = await prisma.photo.count({
      where: {
        albums: {
          some: {
            id: album.id,
          },
        },
        ...whereClause,
      },
    });

    // Get photos with pagination and sorting
    // Sort by date (null dates last) and then by id
    const photos = await prisma.photo.findMany({
      where: {
        albums: {
          some: {
            id: album.id,
          },
        },
        ...whereClause,
      },
      orderBy: [
        {
          date: {
            sort: 'asc',
            nulls: 'last',
          },
        },
        {
          id: 'asc',
        },
      ],
      skip,
      take: limit,
      select: {
        id: true,
        url: true,
        title: true,
        date: true,
        notes: true,
        isFamilyOnly: true,
        tags: {
          select: {
            name: true,
          },
        },
      },
    });

    // Check S3 availability
    let isS3Available = false;
    try {
      isS3Available = await checkS3Availability();
    } catch (error) {
      console.error('S3 availability check failed:', error);
      // Continue with isS3Available as false
    }

    // Transform the data to include signed URLs if S3 is available
    const transformedPhotos = photos.map((photo) => {
      let photoUrl = photo.url;

      if (isS3Available) {
        // Always use proxy endpoint to generate signed URLs
        photoUrl = `/api/photos/proxy?key=${encodeURIComponent(
          photo.url.split('/').pop() || ''
        )}`;
      }

      return {
        ...photo,
        url: photoUrl,
        tags: photo.tags.map((tag) => tag.name),
      };
    });

    return NextResponse.json({
      photos: transformedPhotos,
      hasMore: skip + limit < totalCount,
      isS3Available,
      totalCount,
      album: {
        id: album.id,
        name: album.name,
        _count: album._count,
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
