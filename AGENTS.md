<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN: Advice for Agents on Backend Connection-->
# AGENT.md — Frontend Development Guide

> **Stack:** Next.js (App Router) · Django REST Framework · PostgreSQL via Supabase · JWT Auth (simplejwt)
> This file is the single source of truth for all AI-assisted development in this project.
> Read every section before writing or suggesting any code.

---

## 1. Project Overview

This is a **Next.js** (App Router) frontend connecting exclusively to a **Django REST Framework** backend.
The backend uses **PostgreSQL** hosted on **Supabase** and authenticates via **JWT tokens** issued by
`djangorestframework-simplejwt`.

The frontend does **not** connect directly to Supabase or the database.
All data flows through the Django REST API. No exceptions.

---

## 2. Environment Variables

Connection credentials are **not yet received**. Every environment-dependent value lives in `.env.local`.
**Never hardcode a URL, key, or secret anywhere in source code.**

```env
# .env.local — fill in when backend credentials arrive

# Django backend base URL — no trailing slash
NEXT_PUBLIC_API_BASE_URL=https://PLACEHOLDER_DJANGO_API_URL

# simplejwt default endpoint paths
NEXT_PUBLIC_AUTH_TOKEN_OBTAIN=/api/token/
NEXT_PUBLIC_AUTH_TOKEN_REFRESH=/api/token/refresh/
NEXT_PUBLIC_AUTH_TOKEN_VERIFY=/api/token/verify/

# Supabase — leave blank until/unless direct Storage or Realtime is needed
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NEXT_PUBLIC_APP_ENV=development
```

> `.env.local` is gitignored by default in Next.js. Commit a `.env.example` with all keys
> but no values as a schema reference for the team.

---

## 3. Directory Structure

```
src/
├── app/                          # Next.js App Router — pages and layouts
│   ├── (auth)/                   # Public auth group: login, register, reset
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (protected)/              # Routes that require a valid JWT session
│   │   ├── layout.tsx            # Auth guard lives here — not in middleware alone
│   │   └── dashboard/page.tsx
│   ├── error.tsx                 # Root error boundary
│   ├── loading.tsx               # Root Suspense fallback
│   └── layout.tsx                # Root layout — providers, fonts, global styles
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Single Axios instance — JWT attach + auto-refresh
│   │   ├── authStore.ts          # In-memory token store (never localStorage)
│   │   ├── auth.ts               # Login, refresh, logout, getMe
│   │   └── [resource].ts         # One file per DRF resource (users, orders, etc.)
│   └── utils/
│       └── apiError.ts           # DRF error parser
│
├── hooks/
│   ├── useAuth.ts                # Auth state and actions (wraps AuthContext)
│   └── use[Resource].ts          # SWR or React Query hooks per resource
│
├── context/
│   └── AuthContext.tsx           # JWT state provider — wraps protected layout
│
├── types/
│   ├── auth.ts                   # AuthTokens, UserProfile, LoginPayload
│   └── api.ts                    # PaginatedResponse<T>, ApiError envelope
│
├── components/
│   ├── ui/                       # Reusable primitives (Button, Input, Modal)
│   └── [feature]/                # Feature-specific components
│
└── middleware.ts                 # Next.js Edge middleware — route gating signal only
```

---

## 4. Server Components vs Client Components

> **Rule:** Default to Server Components. Add `"use client"` only when the browser is required.
> Ref: https://nextjs.org/docs/app/building-your-application/rendering/server-components

### Decision Matrix

| Need | Use |
|------|-----|
| Fetch data from Django API | **Server Component** — async/await, no useEffect |
| Read environment secrets | **Server Component** — never expose to client |
| Heavy libraries (parsers, formatters) | **Server Component** — stays off the JS bundle |
| `useState`, `useReducer`, `useContext` | **Client Component** |
| `onClick`, `onChange`, form handlers | **Client Component** |
| Browser APIs (`window`, `localStorage`) | **Client Component** |
| Animations, focus management | **Client Component** |
| Auth guard provider wrapping children | **Client Component** |

### Correct Patterns

```tsx
// Server Component — fetch directly, no hooks needed
// src/app/(protected)/dashboard/page.tsx
import { ordersApi } from '@/lib/api/orders';

export default async function DashboardPage() {
  const orders = await ordersApi.list();
  return <OrderList orders={orders.data.results} />;
}

// Client Component — only when interaction is needed
// src/components/features/SearchBar.tsx
'use client';
import { useState } from 'react';

export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### Anti-Patterns to Avoid

```tsx
// Fetching on the client when a Server Component would work
'use client';
useEffect(() => { fetch('/api/orders').then(...) }, []);

// Adding "use client" to a layout that has no browser APIs
'use client';
export default function DashboardPage() { ... }
```

---

## 5. Rendering Strategy

Choose the rendering strategy based on how frequently the data changes.
Ref: https://nextjs.org/docs/app/building-your-application/rendering

| Data Type | Strategy | Implementation |
|-----------|----------|----------------|
| Marketing pages, static docs | **SSG** | No `dynamic`, no `cache: 'no-store'` |
| Product catalogue, blog posts | **ISR** | `fetch(..., { next: { revalidate: 60 } })` |
| User dashboards, personalized feeds | **SSR (Dynamic)** | `export const dynamic = 'force-dynamic'` |
| Real-time data (chat, live stats) | **CSR** | Client Component + polling / WebSocket |

```ts
// ISR — revalidate every 60 seconds, tag for on-demand invalidation
const res = await fetch(`${BASE_URL}/api/products/`, {
  next: { revalidate: 60, tags: ['products'] },
});

// SSR — never cache user-specific data
const res = await fetch(`${BASE_URL}/api/users/me/`, {
  cache: 'no-store',
});
```

> **Critical rule:** Never cache responses that differ per user (dashboards, account info).
> Opt those routes out of caching entirely with `cache: 'no-store'` or `force-dynamic`.

---

## 6. Caching Strategy (Next.js 15)

Next.js 15 made fetch **opt-out of caching by default**. Be explicit about every cache decision.
Ref: https://nextjs.org/docs/app/guides/caching

### The Four Tools

| Tool | When to Use |
|------|-------------|
| `fetch` with `next.revalidate` | Time-based revalidation on a per-fetch basis |
| `fetch` with `next.tags` | Tag-based on-demand invalidation |
| `'use cache'` directive (Next.js 15) | Cache an entire Server Component or async function |
| `revalidateTag` / `revalidatePath` | Invalidate after a mutation (in Server Actions) |

### Cache Decision by Data Freshness

| Data | Cache Duration | Tool |
|------|---------------|------|
| Static content (docs, help text) | Indefinite | `cache: 'force-cache'` |
| Product catalogue | 60s | `next: { revalidate: 60, tags: ['products'] }` |
| Dashboard/user data | Never | `cache: 'no-store'` |
| After a create/update/delete | Immediate invalidation | `revalidateTag('products')` |

### Invalidation Rules

After **any mutation**, always invalidate the relevant cache:

```ts
// Server Action — create an order
import { revalidateTag, revalidatePath } from 'next/cache';

export async function createOrder(payload: CreateOrderPayload) {
  const result = await ordersApi.create(payload);
  revalidateTag('orders');         // invalidates all fetches tagged 'orders'
  revalidatePath('/dashboard');    // invalidates the dashboard page cache
  return result;
}
```

Rules:
- Use `revalidatePath` when **one specific page** changed.
- Use `revalidateTag` when the **same data appears across multiple pages**.
- A mutation without a paired invalidation silently serves stale data to users.
- Always revalidate all affected tags when a mutation touches multiple data sources.

---

## 7. Streaming & Suspense

Use Suspense boundaries to progressively stream content. Never block the entire page on a single slow fetch.
Ref: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming

```tsx
// app/(protected)/dashboard/page.tsx
import { Suspense } from 'react';
import { OrdersSkeleton } from '@/components/skeletons';

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      {/* Critical UI renders immediately */}
      <UserGreeting />
      {/* Non-critical data streams in with a skeleton fallback */}
      <Suspense fallback={<OrdersSkeleton />}>
        <RecentOrders />
      </Suspense>
    </main>
  );
}
```

> Place `loading.tsx` at each route segment for automatic Suspense wrapping.
> Place `error.tsx` at each segment to isolate failures without crashing the full page.

---

## 8. API Client (`src/lib/api/client.ts`)

One Axios instance for the entire application. No ad-hoc `fetch()` or secondary `axios` instances outside this layer.

```typescript
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { authStore } from './authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not set. Check .env.local.');
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
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 9. Token Storage & Security Rules

### Storage Decision

| Storage | Rule |
|---------|------|
| `localStorage` / `sessionStorage` | Never — readable by any XSS script |
| **In-memory module variable** | Access token only — cleared on page refresh |
| **HttpOnly cookie** | Preferred for refresh token — JS cannot read it |

```typescript
// src/lib/api/authStore.ts
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const authStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  setTokens: (access: string, refresh: string) => {
    accessToken = access;
    refreshToken = refresh;
  },
  clearTokens: () => {
    accessToken = null;
    refreshToken = null;
  },
};
```

> When the backend is available, request that Django sets the refresh token in an HttpOnly,
> Secure, SameSite=Lax cookie. This removes refresh token exposure from JavaScript entirely.

### simplejwt Backend Token Settings (Reference)

Confirm that the Django backend uses these settings — verify with the backend team:

```python
# Django settings.py — expected simplejwt configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),   # Short — limits blast radius
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,       # New refresh token issued on every use
    'BLACKLIST_AFTER_ROTATION': True,    # Old refresh token immediately invalidated
    'UPDATE_LAST_LOGIN': False,          # False — enabling it creates a DB write per login
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Required for blacklisting
INSTALLED_APPS = [
    ...
    'rest_framework_simplejwt.token_blacklist',
]
```

> `ROTATE_REFRESH_TOKENS: True` means each `/api/token/refresh/` response includes a **new**
> refresh token. The frontend `authStore.setTokens()` must update the stored refresh token
> on every refresh call. Failing to do this causes the next refresh to fail with 401.

---

## 10. Auth API (`src/lib/api/auth.ts`)

```typescript
import { apiClient } from './client';
import { authStore } from './authStore';
import type { LoginPayload, AuthTokens, UserProfile } from '@/types/auth';

const TOKEN_OBTAIN = process.env.NEXT_PUBLIC_AUTH_TOKEN_OBTAIN!;
const TOKEN_REFRESH = process.env.NEXT_PUBLIC_AUTH_TOKEN_REFRESH!;

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>(TOKEN_OBTAIN, payload);
    authStore.setTokens(data.access, data.refresh);
    return data;
  },

  refresh: async (): Promise<string> => {
    const refresh = authStore.getRefreshToken();
    if (!refresh) throw new Error('No refresh token available');
    const { data } = await apiClient.post<AuthTokens>(TOKEN_REFRESH, { refresh });
    // Always save the newly rotated refresh token
    authStore.setTokens(data.access, data.refresh);
    return data.access;
  },

  logout: async (): Promise<void> => {
    // Blacklist the refresh token server-side — requires blacklist app on Django
    try {
      const refresh = authStore.getRefreshToken();
      if (refresh) {
        await apiClient.post('/api/token/blacklist/', { refresh });
      }
    } finally {
      authStore.clearTokens();
    }
  },

  getMe: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>('/api/users/me/');
    return data;
  },
};
```

---

## 11. Shared API Types

Define these before writing any resource-specific file. Every API call must be typed.

```typescript
// src/types/auth.ts
export interface LoginPayload {
  username: string; // confirm with backend — may be 'email'
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
}

// src/types/api.ts

// DRF PageNumberPagination default response shape
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// DRF validation error response — field-level errors
export interface ApiError {
  detail?: string;
  [field: string]: string | string[] | undefined;
}
```

---

## 12. Resource API Files

One file per DRF resource under `src/lib/api/`. Do not mix resource concerns.

```typescript
// src/lib/api/[resource].ts — template
import { apiClient } from './client';
import type { PaginatedResponse } from '@/types/api';
import type { ResourceItem, CreateResourcePayload } from '@/types/[resource]';

// Django REST Framework uses trailing slashes — always include them
const BASE = '/api/[resource]/';

export const [resource]Api = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<ResourceItem>>(BASE, { params }),

  detail: (id: number | string) =>
    apiClient.get<ResourceItem>(`${BASE}${id}/`),

  create: (payload: CreateResourcePayload) =>
    apiClient.post<ResourceItem>(BASE, payload),

  update: (id: number | string, payload: Partial<ResourceItem>) =>
    apiClient.patch<ResourceItem>(`${BASE}${id}/`, payload),

  replace: (id: number | string, payload: ResourceItem) =>
    apiClient.put<ResourceItem>(`${BASE}${id}/`, payload),

  remove: (id: number | string) =>
    apiClient.delete(`${BASE}${id}/`),
};
```

### DRF URL & Query Conventions

| Convention | Detail |
|------------|--------|
| Trailing slashes | All paths end with `/` — Django default (`APPEND_SLASH=True`) |
| Pagination | All list responses are `PaginatedResponse<T>` — never a raw array |
| Filtering | Query params: `?status=active&category=electronics` |
| Ordering | `?ordering=-created_at` (prefix `-` = descending) |
| Search | `?search=keyword` when `SearchFilter` is on the ViewSet |
| Page navigation | `?page=2&page_size=20` |
| HTTP verbs | `PATCH` = partial update, `PUT` = full replace, `DELETE` = remove |
| Versioning | Confirm whether `/api/v1/` prefix is used before writing any URLs |

---

## 13. Route Protection

### Middleware — Signal Layer, Not the Only Guard

> **Security Warning:** CVE-2025-29927 (CVSS 9.1, March 2025) proved that middleware-only
> authorization can be bypassed by injecting the `x-middleware-subrequest` header.
> Affected versions: Next.js < 15.2.3, < 14.2.25, < 13.5.9.
> **Enforce `next` version >= 15.2.3 in `package.json`.**
> **Always enforce auth in BOTH middleware AND the Server Component layout.**
> Ref: https://github.com/advisories/GHSA-f82v-jwr5-mffw

```typescript
// src/middleware.ts — routing signal only
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  // session_active: a non-sensitive boolean cookie set by AuthContext after login
  // The actual JWT lives in memory — this cookie is only a routing signal
  const isAuthenticated = request.cookies.has('session_active');

  if (!isAuthenticated && !isPublic) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
```

### Server-Side Auth Enforcement (Second Layer — Required)

```tsx
// src/app/(protected)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) redirect('/login');
  return <AuthProvider initialUser={session.user}>{children}</AuthProvider>;
}
```

---

## 14. Security Headers (`next.config.ts`)

Configure HTTP security headers for production. These are not optional.
Ref: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    // Enforce HTTPS for 1 year including subdomains
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    // Prevent clickjacking — block embedding in iframes
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Prevent MIME-type sniffing — blocks certain XSS vectors
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    // Content Security Policy — tighten script-src before production
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL}`,
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
```

---

## 15. Performance Best Practices

Ref: https://nextjs.org/docs/app/building-your-application/optimizing

### Images — Always `next/image`

```tsx
// Correct — automatic WebP/AVIF, lazy load, prevents CLS
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority          // above-the-fold images only
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Never use raw <img> — no optimization, causes layout shift (CLS)
```

### Fonts — Always `next/font`

```tsx
// Correct — self-hosted, eliminates external DNS lookup, prevents CLS
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

// Never use <link rel="stylesheet"> for Google Fonts — render-blocking
```

### Code Splitting with Dynamic Imports

```tsx
// Split heavy or non-critical components out of the initial bundle
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/charts/RevenueChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,   // only if the component uses window/document
});
```

### Bundle Analysis — Run Before Every Production Deploy

```bash
npm install --save-dev @next/bundle-analyzer
```

```typescript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
export default withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npm run build
```

### Core Web Vitals Targets

| Metric | Target | What It Measures |
|--------|--------|-----------------|
| LCP (Largest Contentful Paint) | < 2.5s | Loading speed |
| INP (Interaction to Next Paint) | < 200ms | Responsiveness |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |

Common causes of failure to fix proactively:

- Raw `<img>` tags without dimensions → CLS
- Fonts loaded via `<link>` → LCP regression
- Client Components re-rendering on every keystroke → INP
- Large third-party scripts loaded synchronously → blocks LCP and INP
- Server data fetched in `useEffect` instead of Server Components → unnecessary waterfall

---

## 16. Error Handling

### DRF Error Parser

```typescript
// src/lib/utils/apiError.ts
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
```

### Status Code Handling by Location

| Status | Handler Location | Action |
|--------|-----------------|--------|
| 400 | Component level | Show field-level validation errors inline |
| 401 | Axios interceptor (global) | Auto-refresh token → retry → logout |
| 403 | Component level | Show permission-denied message |
| 404 | Component or `notFound()` | Render not-found UI |
| 429 | Axios interceptor | Show rate-limit message — do not silently retry |
| 5xx | Component level | Generic error message + optional retry button |
| Network Error | Axios interceptor | Connectivity message |

---

## 17. DRF Backend Contract Reference

Verify each item with the backend team when credentials arrive.

### Authentication Endpoints

```
POST /api/token/            → { access, refresh }
POST /api/token/refresh/    → { access, refresh }   # refresh rotates when ROTATE=True
POST /api/token/verify/     → 200 OK or 401
POST /api/token/blacklist/  → 200 OK                # requires blacklist app
```

### API Design Expectations

| Item | Expected Default | Must Confirm |
|------|-----------------|-------------|
| URL trailing slash | Required (`APPEND_SLASH=True`) | Yes |
| Pagination class | `PageNumberPagination` | Yes |
| Default page size | 10 | Confirm actual |
| Pagination query param | `?page=2` | Yes |
| Page size override | `?page_size=20` | Confirm if allowed |
| Filter backend | `DjangoFilterBackend` / `SearchFilter` | Confirm |
| Ordering param | `?ordering=-created_at` | Yes |
| Date format | ISO 8601 (`2025-06-01T12:00:00Z`) | Yes |
| Non-field error key | `{ "detail": "..." }` | Yes |
| Field-level error key | `{ "field": ["msg"] }` | Yes |
| CORS allowed origins | `localhost:3000` + production domain | Confirm |
| API versioning prefix | `/api/v1/` or header-based | Confirm |

### DRF Throttling Contract

DRF throttling returns `429 Too Many Requests` with a `Retry-After` header.
The API client handles 429 globally (see Section 8). Components must not retry silently on 429.

---

## 18. TypeScript Rules

- `"strict": true` in `tsconfig.json` — mandatory
- `any` is banned. Use `unknown` and narrow with type guards
- All API responses must have explicit return types — never rely on inference from raw `axios.get()`
- All component props must be typed with an interface or type alias
- Prefer named exports in `lib/`, `types/`, `hooks/`
- No `@ts-ignore`. Use `@ts-expect-error` only with a comment explaining why

---

## 19. State Management Rules

| State Type | Tool |
|-----------|------|
| Server data (API responses) | SWR or TanStack Query — not `useState` + `useEffect` |
| Client UI state (modals, tabs, steps) | `useState` / `useReducer` |
| Global auth state | `AuthContext` only |
| Cross-cutting non-server state | Evaluate Zustand only if genuinely needed |

Never store server data in `useState` when a Server Component fetch would work.

---

## 20. Code Conventions

| Rule | Detail |
|------|--------|
| No hardcoded strings | All URLs and config via `process.env.*` |
| Trailing slashes | Every Django API path ends with `/` |
| One resource per file | `src/lib/api/` files stay focused |
| No direct Supabase calls | All data through Django API |
| Async/await only | No `.then().catch()` chains |
| Named exports | In `lib/`, `types/`, `hooks/` |
| Server Components first | Only add `"use client"` when browser is truly required |
| No raw `<img>` | Always `next/image` |
| No `<link>` for fonts | Always `next/font` |
| Error boundaries everywhere | `error.tsx` co-located with every `page.tsx` |
| Next.js version | Must be >= 15.2.3 (CVE-2025-29927 fix) |

---

## 21. Final Connection Checklist

Complete in order when backend credentials arrive:

- [ ] Fill `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- [ ] Verify `next` package version >= 15.2.3 in `package.json`
- [ ] Confirm token endpoint paths with backend team
- [ ] Confirm `username` vs `email` as the login identifier
- [ ] Confirm `ROTATE_REFRESH_TOKENS: True` — authStore must save the new refresh token on every refresh call
- [ ] Confirm `BLACKLIST_AFTER_ROTATION: True` — logout must call `/api/token/blacklist/`
- [ ] Test token obtain — verify `access` and `refresh` fields in response
- [ ] Test token refresh — verify new `refresh` token is returned and stored
- [ ] Test a protected endpoint with `Authorization: Bearer <access_token>`
- [ ] Test 401 auto-refresh + retry flow end-to-end
- [ ] Confirm CORS allows `http://localhost:3000` and the production domain
- [ ] Confirm `ALLOWED_HOSTS` includes the production domain
- [ ] Confirm DRF pagination shape matches `PaginatedResponse<T>`
- [ ] Confirm trailing slash behaviour on all endpoints
- [ ] Confirm API versioning prefix (if any)
- [ ] Add Supabase env vars only if direct Supabase Storage / Realtime is needed
- [ ] Run `ANALYZE=true npm run build` — review bundle before first deploy
- [ ] Verify all security headers appear in production HTTP responses

---

## 22. What This Agent Must Never Do

- Never hardcode any URL, password, API key, or secret
- Never store JWTs in `localStorage` or `sessionStorage`
- Never create Axios instances outside `src/lib/api/client.ts`
- Never write raw `fetch()` outside the `src/lib/api/` layer
- Never connect directly to Supabase for data
- Never use TypeScript `any` without a documented reason
- Never expose raw Axios errors to the UI — always use `parseApiError()`
- Never add `"use client"` to components with no browser API or hook usage
- Never use raw `<img>` tags — always `next/image`
- Never load fonts via `<link>` — always `next/font`
- Never cache user-specific data at the route or page level
- Never rely on middleware as the sole auth enforcement layer
- Never skip cache invalidation after mutations
- Never forget to store the rotated refresh token — `ROTATE_REFRESH_TOKENS: True` issues a new one on every refresh call
<!-- END: Advice for Agents on Backend Connection-->