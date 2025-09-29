import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import { verifySessionCookie } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const sessionCookie = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!sessionCookie) {
    return NextResponse.json({error: 'No session cookie provided'}, {status: 401});
  }

  try {
    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) {
       return NextResponse.json({error: 'Invalid session cookie'}, {status: 401});
    }
    // Session is valid
    return NextResponse.json({status: 'success'}, {status: 200});
  } catch (error) {
    console.error('Error verifying session cookie in API route:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
