import { neon } from '@neondatabase/serverless';

// @ts-expect-error implicit any, not fixing as this is a temporary file.
export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL || '');

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

    res.json({
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
        : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
