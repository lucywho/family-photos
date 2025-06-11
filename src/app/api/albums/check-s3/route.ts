import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION,
});

export async function GET() {
  try {
    // Try to list objects in the bucket to check availability
    await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_URL,
        MaxKeys: 1, // We only need to check if we can access the bucket
      })
    );

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error checking S3 availability:', error);
    return NextResponse.json(
      { error: 'S3 bucket is unavailable' },
      { status: 503 }
    );
  }
}
