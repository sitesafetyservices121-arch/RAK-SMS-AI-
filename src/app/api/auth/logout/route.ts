
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  
  // Expire the custom cookie
  response.cookies.set('rak-sms-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });

  return response;
}
