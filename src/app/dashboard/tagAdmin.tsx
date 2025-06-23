import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
export default async function TagAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/'); // or show a 403 page
  }
  return <p>TagAdmin holding text</p>;
}
