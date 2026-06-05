# Frontend API Implementation Guide

> **Target Audience:** Frontend & Backend Engineering Team
> **Stack:** Next.js 16 (App Router), Axios, SWR, Django REST Framework (DRF)

This document details the frontend API architecture that has been implemented to securely connect to the upcoming Django REST Framework backend.

---

## 1. Architecture Overview

To comply with our strict security and performance standards, the frontend follows a tightly controlled data-flow architecture:

- **No Direct DB Access**: The frontend NEVER connects directly to Supabase. All data is fetched via the Django REST API.
- **Single Source of Truth**: All HTTP requests flow through a single, globally configured `axios` instance (`src/lib/api/client.ts`).
- **In-Memory JWT Security**: Access tokens are stored exclusively in memory (`src/lib/api/authStore.ts`). `localStorage` and `sessionStorage` are strictly banned to prevent XSS exfiltration.
- **Server Data Management**: SWR is used for fetching, caching, and deduplicating server data. `useState` + `useEffect` are banned for server data fetching.
- **Double-Layer Route Protection**: Protected routes are guarded at the Edge (`src/proxy.ts` — formerly `middleware.ts`) and at the Server Component layout level (`src/app/contributor/layout.tsx`).

---

## 2. What Has Been Built So Far

We have scaffolded the complete frontend shell for the API integration using **Mock Data**. 

### Core Networking (`src/lib/api/`)
*   `client.ts`: The central Axios instance. It handles:
    *   Automatic injection of the `Authorization: Bearer <token>` header.
    *   **401 Auto-Refresh**: If a request fails with 401 Unauthorized, the client pauses all pending requests, attempts to exchange the refresh token for a new access token, updates the `authStore`, and automatically retries the queued requests.
    *   **429 Throttling**: Safely catches DRF rate-limits and rejects the promise gracefully.
*   `authStore.ts`: An in-memory store exposing getters and setters for the current JWT session.
*   `apiError.ts`: A robust error parser that translates DRF's structured validation errors (`{ field: ["error"] }`) and standard HTTP errors into user-friendly strings.

### Resource API Modules
Instead of placing fetch calls inside React components, every DRF resource has an isolated module under `src/lib/api/`. Currently, these contain **mocked implementations** using `setTimeout` to mimic network latency:
*   `auth.ts`: `login`, `register`, `logout`, `refresh`, and `getMe`.
*   `photos.ts`: `list` and `detail` for the portfolio.
*   `contributor.ts`: `getMetrics` for the dashboard overview.

### SWR React Hooks (`src/hooks/`)
We've abstracted SWR data fetching into custom hooks. Components simply call these hooks to get reactive, cached data:
*   `usePhotos()`
*   `useContributor()`
*   `useAuth()`

### Authentication Context & Guards
*   **`AuthContext.tsx`**: Provides global authentication state (`user`, `isLoading`, `login`, `logout`) to the React tree. It dispatches and listens to a global `auth:logout` event to ensure the UI immediately responds when the Axios interceptor kills an expired session.
*   **`proxy.ts`**: (Next.js 16's version of Edge Middleware). It checks for a non-sensitive `session_active` cookie to quickly route unauthenticated users to `/login`.
*   **`session.ts` & `layout.tsx`**: A Server Component layout wrap that validates the session on the server before rendering protected UI, protecting against middleware-bypass exploits (CVE-2025-29927).

---

## 3. Connecting the Real Backend (Next Steps)

When the Django backend credentials and endpoints are ready, the team should follow these steps to swap from Mocks to Real Data:

### Step A: Environment Setup
Update `.env.local` with the real backend URL:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdjangoapp.com
NEXT_PUBLIC_AUTH_TOKEN_OBTAIN=/api/token/
NEXT_PUBLIC_AUTH_TOKEN_REFRESH=/api/token/refresh/
```

### Step B: Replace Mock Functions with Axios Calls
Open each file in `src/lib/api/` (e.g., `photos.ts`) and delete the mock logic. Replace it with direct `apiClient` calls.

**Before (Mock):**
```typescript
export const photosApi = {
  list: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { count: 1, next: null, previous: null, results: [...] };
  }
}
```

**After (Real):**
```typescript
export const photosApi = {
  list: (params?: Record<string, unknown>) => 
    apiClient.get<PaginatedResponse<Photo>>('/api/photos/', { params })
}
```

### Step C: Verify Backend Contracts
The backend team **must** ensure Django is configured to match the frontend expectations:
1.  **Trailing Slashes**: Django's `APPEND_SLASH=True` is expected. All Axios requests are hardcoded to end with `/`.
2.  **CORS**: Ensure `http://localhost:3000` (and the production frontend domain) is in `CORS_ALLOWED_ORIGINS`.
3.  **Pagination**: `PageNumberPagination` should return `{ count, next, previous, results: [] }`.
4.  **JWT Rotation**: `simplejwt` MUST have `ROTATE_REFRESH_TOKENS: True` and `BLACKLIST_AFTER_ROTATION: True`. The frontend's auto-refresh interceptor expects a **new** refresh token in every refresh response.

### Step D: Testing
Run the application and verify:
1. Login flow populates the `authStore` and sets the `session_active` cookie.
2. The Dashboard loads using SWR (Network tab should show a real request to `/api/contributor/metrics/`).
3. Forcing a 401 (e.g., waiting 5 minutes for the access token to expire) triggers a seamless background refresh without logging the user out.
