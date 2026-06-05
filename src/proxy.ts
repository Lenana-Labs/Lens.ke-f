import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a public path or an exact match
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  
  // session_active: a non-sensitive boolean cookie set by AuthContext after login
  // The actual JWT lives in memory — this cookie is only a routing signal
  const isAuthenticated = request.cookies.has('session_active');

  // If the user is trying to access a protected route and is not authenticated
  if (!isAuthenticated && !isPublic && pathname !== '/') {
    const url = new URL('/auth', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access login/register, redirect them to dashboard
  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL('/contributor', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next/static|_next/image|favicon.ico|images/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
