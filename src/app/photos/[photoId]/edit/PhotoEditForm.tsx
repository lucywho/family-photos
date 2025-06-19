'use client';

interface Photo {
  id: number;
}

interface PhotoEditFormProps {
  photo: Photo;
}

export function PhotoEditForm({ photo }: PhotoEditFormProps) {
  return (
    <div>
      {/* This is a placeholder that will be implemented in the next stage */}
      <p>Edit form for photo {photo.id}</p>
    </div>
  );
}
