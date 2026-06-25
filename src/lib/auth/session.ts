import { cookies } from 'next/headers';
import type { UserProfile } from '@/types/auth';

/**
 * Mock Server Session Retriever
 * When the backend is ready, this function should read the HttpOnly `refresh` cookie,
 * exchange it for a new access token via the Django backend, and fetch the user profile.
 * For now, it simply checks the `session_active` cookie.
 */
export async function getServerSession(): Promise<{ user: UserProfile | null } | null> {
  const cookieStore = await cookies();
  const sessionActive = cookieStore.get('session_active')?.value === 'true';

  if (!sessionActive) {
    return null;
  }

  // Return session with null user to let AuthContext fetch the real user profile from live backend
  return {
    user: null,
  };
}
