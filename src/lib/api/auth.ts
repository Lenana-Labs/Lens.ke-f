import { apiClient } from './client';
import { authStore } from './authStore';
import type { LoginPayload, RegisterPayload, AuthTokens, UserProfile } from '@/types/auth';

const TOKEN_OBTAIN = process.env.NEXT_PUBLIC_AUTH_TOKEN_OBTAIN || '/api/v1/auth/login';
const TOKEN_REFRESH = process.env.NEXT_PUBLIC_AUTH_TOKEN_REFRESH || '/api/v1/auth/refresh';

export const authApi = {
  /**
   * Logs in a user by fetching JWT access and refresh tokens.
   */
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>(TOKEN_OBTAIN, payload);
    authStore.setTokens(data.access, data.refresh);
    return data;
  },

  /**
   * Registers a new user and returns authentication tokens.
   */
  register: async (payload: RegisterPayload): Promise<AuthTokens> => {
    // Map camelCase fields to standard Django parameters + custom name parameter
    const payloadToSend = {
      email: payload.email,
      password: payload.password,
      name: `${payload.firstName} ${payload.lastName}`.trim(),
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone,
    };
    const { data } = await apiClient.post<any>('/api/v1/auth/register', payloadToSend);
    if (!data.access) {
      return await authApi.login({ email: payload.email, password: payload.password });
    }
    authStore.setTokens(data.access, data.refresh);
    return data;
  },

  /**
   * Manually refreshes the active access token using the stored refresh token.
   */
  refresh: async (): Promise<string> => {
    const refresh = authStore.getRefreshToken();
    if (!refresh) throw new Error('No refresh token available');
    const { data } = await apiClient.post<AuthTokens>(TOKEN_REFRESH, { refresh });
    authStore.setTokens(data.access, data.refresh || refresh);
    return data.access;
  },

  /**
   * Logs the user out and clears in-memory tokens.
   */
  logout: async (): Promise<void> => {
    try {
      const refresh = authStore.getRefreshToken();
      if (refresh) {
        await apiClient.post('/api/v1/auth/logout', { refresh });
      }
    } finally {
      authStore.clearTokens();
    }
  },

  /**
   * Fetches the current logged-in user profile, converting snake_case fields.
   */
  getMe: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<any>('/api/v1/auth/me');
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name || data.firstName || '',
      lastName: data.last_name || data.lastName || '',
      phone: data.phone || data.phone_number || '',
      isContributor: data.is_contributor !== undefined ? data.is_contributor : (data.isContributor || false),
    };
  },
};
