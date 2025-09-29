import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import admin from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const sessionCookie = request.cookies.get('firebase-session-token')?.value;

  // For API routes, we don't need to do any verification here.
  // The matcher below already excludes them, but this is a good practice.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // If there's no session cookie and the user is not on the login page, redirect to login.
  if (!sessionCookie) {
    if (pathname.startsWith('/login')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session cookie, verify it.
  try {
    await admin.auth().verifySessionCookie(sessionCookie, true);
    
    // If the cookie is valid and the user is on the login page, redirect to the dashboard.
    if (pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Allow the request to proceed.
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware token verification error:', error);
    // If verification fails, redirect to the login page.
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear the invalid cookie.
    response.cookies.set({
        name: 'firebase-session-token',
        value: '',
        path: '/',
        maxAge: 0,
    });
    return response;
  }
}

export const config = {
  // Match all routes except for static files, images, and the API auth routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)'],
};
