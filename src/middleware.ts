import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_HIERARCHY: Record<string, number> = {
  customer: 10,
  user: 10,
  admin: 20,
};

function parseJwtPayload(token?: string | null): any {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const protectedPaths = [
    '/customer-dashboard',
    '/checkout',
    '/wallet',
    '/chat',
  ];

  const isProtected = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  if (isProtected) {
    const authToken =
      request.cookies.get('cloth_customer_access')?.value ||
      request.cookies.get('cloth_admin_access')?.value ||
      request.cookies.get('accessToken')?.value;

    const userCookie = request.cookies.get('user')?.value;

    let userRole = '';
    let isAuthenticated = false;

    if (authToken) {
      const payload = parseJwtPayload(authToken);
      if (payload && (payload.sub || payload.id || payload.email)) {
        isAuthenticated = true;
        userRole = String(payload.role || payload.roles || 'customer').trim().toLowerCase();
      }
    }

    if (!isAuthenticated && userCookie) {
      try {
        const parsed = JSON.parse(userCookie.startsWith('%') ? decodeURIComponent(userCookie) : userCookie);
        if (parsed && (parsed.id || parsed._id || parsed.email)) {
          isAuthenticated = true;
          userRole = String(parsed.role || 'customer').trim().toLowerCase();
        }
      } catch {}
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    const userLevel = ROLE_HIERARCHY[userRole] ?? 10;

    // Customer protected routes require at least Level 10 (Customer=10, Admin=20)
    const requiredLevel = 10;
    if (userLevel < requiredLevel) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/customer-dashboard',
    '/customer-dashboard/:path*',
    '/checkout',
    '/checkout/:path*',
    '/wallet',
    '/wallet/:path*',
    '/chat',
    '/chat/:path*',
  ],
};
