import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')?.value;
  const pathname = request.nextUrl.pathname;

  const protectedPaths = [
    '/customer-dashboard',
    '/checkout',
    '/vendor-dashboard',
    '/create-product',
    '/edit-product',
    '/wallet',
    '/chat',
    '/messages',
  ];

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    if (!userCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      
      // Protect vendor routes
      const isVendorRoute = pathname.startsWith('/vendor-dashboard') || 
                            pathname.startsWith('/create-product') || 
                            pathname.startsWith('/edit-product') ||
                            pathname.startsWith('/messages');
                            
      if (isVendorRoute && user.role !== 'vendor') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Protect customer routes
      const isCustomerRoute = pathname.startsWith('/customer-dashboard');
      if (isCustomerRoute && user.role !== 'customer') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/customer-dashboard/:path*',
    '/checkout/:path*',
    '/vendor-dashboard/:path*',
    '/create-product/:path*',
    '/edit-product/:path*',
    '/wallet/:path*',
    '/chat/:path*',
    '/messages/:path*',
  ],
}
