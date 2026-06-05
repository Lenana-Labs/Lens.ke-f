import { cookies } from 'next/headers';
import type { UserProfile } from '@/types/auth';

/**
 * Mock Server Session Retriever
 * When the backend is ready, this function should read the HttpOnly `refresh` cookie,
 * exchange it for a new access token via the Django backend, and fetch the user profile.
 * For now, it simply checks the `session_active` cookie.
 */
export async function getServerSession(): Promise<{ user: UserProfile } | null> {
  const cookieStore = cookies();
  const sessionActive = cookieStore.get('session_active')?.value === 'true';

  if (!sessionActive) {
    return null;
  }

  // Mock returning a user profile based on the session flag
  return {
    user: {
      id: 2,
      email: 'contributor@example.com',
      firstName: 'Wanjiku',
      lastName: 'Kamau',
      phone: '+254700000000',
      isContributor: true,
    },
  };
}
