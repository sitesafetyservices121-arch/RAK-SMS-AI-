import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import { verifySessionCookie } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('firebase-session-token')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'No session cookie' }, { status: 401 });
  }

  const decodedToken = await verifySessionCookie(sessionCookie);

  if (!decodedToken) {
    return NextResponse.json({ error: 'Invalid session cookie' }, { status: 401 });
  }

  return NextResponse.json({ status: 'success', uid: decodedToken.uid }, { status: 200 });
}
