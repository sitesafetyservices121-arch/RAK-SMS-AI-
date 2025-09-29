import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import { verifySessionCookie } from '@/lib/firebase-admin';

// This middleware function runs on the Edge Runtime.
// It can NOT use Node.js-specific APIs or packages like `firebase-admin`.

async function verifyToken(sessionCookie: string | undefined) {
    if (!sessionCookie) {
        return false;
    }
    const decodedToken = await verifySessionCookie(sessionCookie);
    return !!decodedToken;
}


export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const sessionCookie = request.cookies.get('firebase-session-token')?.value;

  const isLoginPage = pathname.startsWith('/login');
  
  const isSessionValid = await verifyToken(sessionCookie);

  // If the user is trying to access the login page but already has a valid session,
  // redirect them to the dashboard.
  if (isSessionValid && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user does not have a valid session and is trying to access any page
  // other than the login page, redirect them to the login page.
  if (!isSessionValid && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed if:
  // 1. The user has a valid session and is not on the login page.
  // 2. The user does not have a valid session and is on the login page.
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static files, images, and the API auth routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)'],
};
