import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';

/**
 * Checks if the current session belongs to an admin user.
 * @returns The session object if the user is an admin, otherwise `false`.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return false;
  }
  return session;
}
