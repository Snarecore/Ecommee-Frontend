import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')?.value;
  const pathname = request.nextUrl.pathname;

  const protectedPaths = [
    '/customer-dashboard',
    '/checkout',
    '/wallet',
    '/chat',
  ];

  const isProtected = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  if (isProtected) {
    if (!userCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    let user: any = null;
    try {
      user = JSON.parse(userCookie);
    } catch {
      try {
        user = JSON.parse(decodeURIComponent(userCookie));
      } catch {
        user = null;
      }
    }

    if (!user || typeof user !== 'object') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    const rawRole = user?.role ? String(user.role).trim().toLowerCase() : 'customer';
    const userRole = rawRole || 'customer';

    // Protect customer routes
    const isCustomerRoute = pathname.startsWith('/customer-dashboard');
    if (isCustomerRoute && userRole !== 'customer' && userRole !== 'user' && userRole !== 'admin') {
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
}

