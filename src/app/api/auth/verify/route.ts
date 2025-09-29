import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import { verifySessionCookie } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('firebase-session-token')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ isValid: false }, { status: 200 });
  }

  try {
    const decodedToken = await verifySessionCookie(sessionCookie);
    if (decodedToken) {
      return NextResponse.json({ isValid: true }, { status: 200 });
    } else {
      return NextResponse.json({ isValid: false }, { status: 200 });
    }
  } catch (error) {
    console.error('Error verifying session in API route:', error);
    return NextResponse.json({ isValid: false }, { status: 500 });
  }
}