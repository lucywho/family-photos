import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { PhotoEditForm } from './PhotoEditForm';
import { authOptions } from '@/lib/auth-options';
import { Header } from '@/components/layout/Header';

interface EditPhotoPageProps {
  params: {
    photoId: string;
  };
}

export default async function EditPhotoPage({ params }: EditPhotoPageProps) {
  const session = await getServerSession(authOptions);

  // Only allow admin access
  if (!session?.user || session.user.role !== 'ADMIN') {
    notFound();
  }

  const photoId = parseInt(params.photoId, 10);
  if (isNaN(photoId)) {
    notFound();
  }

  // TODO: Fetch photo data
  // This is a placeholder that will be implemented in later stages
  const photo = { id: photoId };

  return (
    <>
      <Header />
      <main className='container mx-auto p-4'>
        {/* TODO: PhotoEditForm will be implemented in the next stage */}
        <PhotoEditForm photo={photo} />
      </main>
    </>
  );
}
