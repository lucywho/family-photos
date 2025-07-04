import { Photo } from '@/features/photos/types/photo';

// Helper to format ISO date to dd/mm/yyyy
export function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper to normalize photo object
export function normalizePhoto(photo: unknown): Photo {
  const p = photo as Partial<Photo> & {
    tags?: unknown[];
    albums?: unknown[];
  };
  return {
    ...p,
    tags: (p.tags ?? []).map((t) =>
      typeof t === 'string' ? t : (t as { name: string }).name
    ),
    albums: (p.albums ?? []).map((a) =>
      typeof a === 'object' && a !== null
        ? { id: (a as { id: number }).id, name: (a as { name: string }).name }
        : (a as { id: number; name: string })
    ),
  } as Photo;
}
