import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const sessionCookie = request.cookies.get('firebase-session-token')?.value;

  const isLoginPage = pathname.startsWith('/login');

  if (!sessionCookie) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there's a cookie, verify it by calling the API route
  const verifyUrl = new URL('/api/auth/verify', request.url);
  const response = await fetch(verifyUrl, {
    headers: {
      Authorization: `Bearer ${sessionCookie}`,
    },
  });

  const isSessionValid = response.ok;

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

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static files, images, and fonts.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/login|.*\\.woff2$).*)'],
};
