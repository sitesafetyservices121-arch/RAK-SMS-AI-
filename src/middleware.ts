import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('firebase-session-token');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login');

  if (!sessionCookie && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (sessionCookie && isAuthPage) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
