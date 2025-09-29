import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export async function POST(request: NextRequest) {
  const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const response = NextResponse.json({ status: 'success' }, { status: 200 });

    // Set the cookie on the response
    response.cookies.set({
      name: 'firebase-auth-token',
      value: idToken,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
