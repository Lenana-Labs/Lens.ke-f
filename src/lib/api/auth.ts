import { authStore } from './authStore';
import type { LoginPayload, RegisterPayload, AuthTokens, UserProfile } from '@/types/auth';

/**
 * Mock Auth API.
 * When backend connection details arrive, replace these with real `apiClient.post` / `apiClient.get` calls.
 * Example: `const { data } = await apiClient.post<AuthTokens>(TOKEN_OBTAIN, payload);`
 */
export const authApi = {
  /**
   * MOCK: Simulates logging in with email/password.
   * Expected real endpoint: POST /api/token/
   */
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation
    if (payload.email === 'admin@example.com' && payload.password === 'admin') {
      const tokens: AuthTokens = {
        access: 'mock-access-token-12345',
        refresh: 'mock-refresh-token-67890',
      };
      authStore.setTokens(tokens.access, tokens.refresh);
      return tokens;
    }

    if (payload.email === 'contributor@example.com' && payload.password === 'contributor') {
      const tokens: AuthTokens = {
        access: 'mock-access-token-contributor',
        refresh: 'mock-refresh-token-contributor',
      };
      authStore.setTokens(tokens.access, tokens.refresh);
      return tokens;
    }

    throw new Error('Invalid credentials. For mock, use admin@example.com / admin');
  },

  /**
   * MOCK: Simulates user registration.
   * Expected real endpoint: POST /api/users/ (or custom registration endpoint)
   */
  register: async (payload: RegisterPayload): Promise<AuthTokens> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Simulate successful registration and auto-login
    const tokens: AuthTokens = {
      access: 'mock-access-token-new-user',
      refresh: 'mock-refresh-token-new-user',
    };
    authStore.setTokens(tokens.access, tokens.refresh);
    return tokens;
  },

  /**
   * MOCK: Simulates refreshing the access token.
   * Expected real endpoint: POST /api/token/refresh/
   */
  refresh: async (): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const refresh = authStore.getRefreshToken();
    if (!refresh) throw new Error('No refresh token available');
    
    const newAccess = 'mock-new-access-token';
    const newRefresh = 'mock-new-refresh-token'; // Simulating ROTATE_REFRESH_TOKENS=True
    authStore.setTokens(newAccess, newRefresh);
    return newAccess;
  },

  /**
   * MOCK: Simulates logging out and token blacklisting.
   * Expected real endpoint: POST /api/token/blacklist/
   */
  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    authStore.clearTokens();
  },

  /**
   * MOCK: Simulates fetching the current user's profile.
   * Expected real endpoint: GET /api/users/me/
   */
  getMe: async (): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const token = authStore.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    // Return dummy data based on the mock token
    if (token === 'mock-access-token-contributor') {
      return {
        id: 2,
        email: 'contributor@example.com',
        firstName: 'Wanjiku',
        lastName: 'Kamau',
        phone: '+254700000000',
        isContributor: true,
      };
    }

    return {
      id: 1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+254711111111',
      isContributor: false,
    };
  },
};
