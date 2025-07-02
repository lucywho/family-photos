import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const users = await sql`SELECT id, email, username FROM users LIMIT 5`;
    const albums = await sql`SELECT id, name FROM albums LIMIT 5`;
    const photos = await sql`SELECT id, title FROM photos LIMIT 5`;

    const counts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM albums) as album_count,
        (SELECT COUNT(*) FROM photos) as photo_count
    `;

    return NextResponse.json({
      counts: counts[0],
      sample_users: users,
      sample_albums: albums,
      sample_photos: photos,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
