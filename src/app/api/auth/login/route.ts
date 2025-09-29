import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import { createSessionCookie, verifySessionCookie } from '@/lib/firebase-admin';


export async function POST(request: NextRequest) {
  const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({error: 'No token provided'}, {status: 401});
  }

  try {
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    // Create the session cookie. This will also verify the ID token.
    const sessionCookie = await createSessionCookie(idToken, expiresIn);
    
    const response = NextResponse.json({status: 'success'}, {status: 200});

    response.cookies.set({
      name: 'firebase-session-token',
      value: sessionCookie,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
    });

    return response;

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
