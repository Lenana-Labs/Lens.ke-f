import { cookies } from 'next/headers';
import type { UserProfile } from '@/types/auth';

/**
 * Mock Server Session Retriever
 * When the backend is ready, this function should read the HttpOnly `refresh` cookie,
 * exchange it for a new access token via the Django backend, and fetch the user profile.
 * For now, it simply checks the `session_active` cookie.
 */
export async function getServerSession(): Promise<{ user: UserProfile } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return null;
  }

  // TODO: Replace this mock by fetching the real user profile from your Django backend
  // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/me`, {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // const realUser = await res.json();

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
