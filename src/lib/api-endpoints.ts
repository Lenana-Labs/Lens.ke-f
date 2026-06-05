/**
 * API Endpoints configuration
 * Extracted from Lens.ke API Swagger Documentation
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/v1/auth/login",                     // POST: Login with email and password
    LOGIN_CUSTOM: "/api/v1/auth/login/custom",       // POST: Login with email and password
    LOGOUT: "/api/v1/auth/logout",                   // POST: Logout and revoke a refresh token
    ME: "/api/v1/auth/me",                           // GET: Get the current user
    REFRESH: "/api/v1/auth/refresh",                 // POST: Refresh an access token
    REGISTER: "/api/v1/auth/register",               // POST: Register a user
  },

  // Contributor
  CONTRIBUTOR: {
    DASHBOARD: "/api/v1/contributor/dashboard",      // GET: Get contributor dashboard
  },

  // Licensing
  LICENSING: {
    DOWNLOAD_TOKEN: (photoId: string | number) => `/api/v1/licenses/download-token/${photoId}`, // GET: Create a secure download token
  },

  // Photos
  PHOTOS: {
    LIST: "/api/v1/photos",                          // GET: List active photos
    DETAILS: (photoId: string | number) => `/api/v1/photos/${photoId}`,                         // GET: Get photo details
    FINALIZE: (photoId: string | number) => `/api/v1/photos/${photoId}/finalize`,               // POST: Finalize a photo upload
    UPLOAD_INTENT: "/api/v1/photos/upload-intent",   // POST: Create an upload intent
  },

  // Users
  USERS: {
    PROFILE: "/api/v1/users/profile",                // GET: Get user profile
  }
};
