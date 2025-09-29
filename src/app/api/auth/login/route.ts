
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp, cert } from 'firebase-admin/app';
import { signInWithEmailAndPassword, getAuth as getClientAuth } from 'firebase/auth';
import { initializeApp as initializeClientApp, getApps as getClientApps, getApp as getClientApp } from 'firebase/app';


const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

const serviceAccount = JSON.parse(serviceAccountKey);

// The private key from the environment variable can have its newlines escaped.
// We need to replace `\\n` with `\n` to parse it correctly.
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

// Server-side Firebase Admin SDK initialization
if (getAdminApps().length === 0) {
  initializeAdminApp({
    credential: cert(serviceAccount),
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Initialize client auth within the handler to avoid module scope issues
    const clientApp = !getClientApps().length ? initializeClientApp(firebaseConfig) : getClientApp();
    const clientAuth = getClientAuth(clientApp);


    // 1. Sign in with client SDK to get user and ID token
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    // 2. Create session cookie with Admin SDK
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    // 3. Set cookie in response
    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set('firebase-session-token', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Login API Error:', error);
    let errorMessage = 'An unexpected error occurred.';

    // Provide more specific error messages for common auth issues
    if (error.code?.startsWith('auth/')) {
        errorMessage = 'Invalid email or password. Please try again.';
    }

    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}
