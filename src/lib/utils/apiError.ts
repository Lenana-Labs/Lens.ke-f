import type { ApiError } from '@/types/api';
import { AxiosError } from 'axios';

export function parseApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;

    if (data?.detail) return data.detail;

    // DRF field-level errors: { email: ["Enter a valid email."] }
    const fieldErrors = Object.entries(data ?? {})
      .filter(([key]) => key !== 'detail')
      .map(([field, msg]) =>
        `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`
      )
      .join(' | ');
    if (fieldErrors) return fieldErrors;

    if (error.message === 'Network Error')
      return 'Unable to reach the server. Check your connection.';
    if (error.response?.status === 403)
      return 'You do not have permission to perform this action.';
    if (error.response?.status === 404)
      return 'The requested resource was not found.';
    if ((error.response?.status ?? 0) >= 500)
      return 'A server error occurred. Please try again later.';
  }
  return 'An unexpected error occurred.';
}
