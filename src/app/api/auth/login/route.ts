import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
  }

  const response = new NextResponse(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  response.cookies.set({
    name: 'firebase-auth-token',
    value: idToken,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}
