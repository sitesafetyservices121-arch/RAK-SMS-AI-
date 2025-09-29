import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

async function verifySession(sessionCookie: string | undefined, request: NextRequest) {
  if (!sessionCookie) {
    return false;
  }
  
  // The API route is an absolute URL.
  const verifyUrl = new URL('/api/auth/verify', request.url);

  try {
    const response = await fetch(verifyUrl, {
      headers: {
        'Cookie': `firebase-session-token=${sessionCookie}`,
      },
    });

    return response.ok;
  } catch (e) {
    console.error('Error verifying session:', e);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const sessionCookie = request.cookies.get('firebase-session-token')?.value;

  const isLoginPage = pathname.startsWith('/login');
  
  const isSessionValid = await verifySession(sessionCookie, request);

  // If the user is trying to access the login page but already has a valid session,
  // redirect them to the dashboard.
  if (isSessionValid && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user does not have a valid session and is trying to access any page
  // other than the login page, redirect them to the login page.
  if (!isSessionValid && !isLoginPage) {
    // To prevent redirect loops for the new API route.
    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed if:
  // 1. The user has a valid session and is not on the login page.
  // 2. The user does not have a valid session and is on the login page.
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static files, images, and the login API route itself.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)'],
};
