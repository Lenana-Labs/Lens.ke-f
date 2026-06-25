import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { authStore } from './authStore';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL is not set. Check .env.local.');
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach access token on every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStore.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh on 401 with request queue to prevent race conditions
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const original = error.config;

    // Handle 429 — DRF throttling
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      return Promise.reject(
        new Error(`Rate limit exceeded. Try again in ${retryAfter ?? 'a few'} seconds.`)
      );
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refresh = authStore.getRefreshToken();
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(
          `${BASE_URL}${process.env.NEXT_PUBLIC_AUTH_TOKEN_REFRESH}`,
          { refresh }
        );
        // ROTATE_REFRESH_TOKENS=True returns a new refresh token — store it
        authStore.setTokens(data.access, data.refresh ?? refresh);
        processQueue(null, data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(original);
      } catch (err) {
        processQueue(err, null);
        authStore.clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
