
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = "ruan@sitesafety.services";
const ADMIN_PASSWORD = "50700Koen*";
const CLIENT_EMAIL = "info@sitesafety.services";
const CLIENT_PASSWORD = "50700Koen*";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const isAdmin = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    const isClient = email === CLIENT_EMAIL && password === CLIENT_PASSWORD;

    if (!isAdmin && !isClient) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = { email: email, role: isAdmin ? 'admin' : 'client' };
    const sessionValue = JSON.stringify(user);
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set('rak-sms-session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
