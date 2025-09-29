import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  
  // Expire the cookie by setting its maxAge to 0
  response.cookies.set('firebase-session-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });

  return response;
}
