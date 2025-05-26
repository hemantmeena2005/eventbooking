import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/auth/login', '/auth/signup', '/api/auth/login', '/api/auth/signup', '/api/events'];

  // Check if the path is public
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/organizer/:path*',
    '/api/events/:path*',
  ],
}; 