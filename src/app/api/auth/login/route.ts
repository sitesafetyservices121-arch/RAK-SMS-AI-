import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({error: 'No token provided'}, {status: 401});
  }

  try {
    const auth = getAdminAuth();
    // Exchange the ID token for a session cookie.
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const decodedIdToken = await auth.verifyIdToken(idToken);
    
    // Only create a session cookie if the user is verified and not disabled.
    if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
      const sessionCookie = await auth.createSessionCookie(idToken, {expiresIn});
      const response = NextResponse.json({status: 'success'}, {status: 200});

      response.cookies.set({
        name: 'firebase-session-token', // Use a different name to avoid conflicts
        value: sessionCookie,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: expiresIn / 1000,
      });

      return response;
    } else {
        return NextResponse.json({ error: 'Recent sign-in required.' }, { status: 401 });
    }

  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({status: 'success'}, {status: 200});
    // Expire the cookie by setting maxAge to 0
    response.cookies.set({
        name: 'firebase-session-token',
        value: '',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error('Error deleting auth cookie:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
