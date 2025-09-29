
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { signInWithEmailAndPassword, getAuth as getClientAuth } from 'firebase/auth';
import { initializeApp as initializeClientApp, getApps as getClientApps, getApp as getClientApp } from 'firebase/app';

// Hardcoded credentials
const ADMIN_EMAIL = "ruan@sitesafety.services";
const ADMIN_PASSWORD = "50700Koen*";
const CLIENT_EMAIL = "info@sitesafety.services";
const CLIENT_PASSWORD = "50700Koen*";

// Helper function to initialize Firebase Admin SDK
function initializeAdmin() {
  if (getAdminApps().length > 0) {
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    // The private key from the environment variable can have its newlines escaped.
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    initializeAdminApp({
      credential: cert(serviceAccount),
    });
  } catch (e) {
    console.error('Failed to parse Firebase service account key:', e);
    throw new Error('Could not initialize Firebase Admin SDK. Please check your FIREBASE_SERVICE_ACCOUNT_KEY.');
  }
}

export async function POST(request: Request) {
  try {
    // Initialize Admin SDK within the handler
    initializeAdmin();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const isAdmin = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    const isClient = email === CLIENT_EMAIL && password === CLIENT_PASSWORD;

    if (!isAdmin && !isClient) {
        return NextResponse.json({ error: 'Invalid email or password. Please try again.' }, { status: 401 });
    }
    
    const firebaseEmail = isAdmin ? ADMIN_EMAIL : CLIENT_EMAIL;
    const firebasePassword = isAdmin ? ADMIN_PASSWORD : CLIENT_PASSWORD;

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    const clientApp = !getClientApps().length ? initializeClientApp(firebaseConfig) : getClientApp();
    const clientAuth = getClientAuth(clientApp);

    const userCredential = await signInWithEmailAndPassword(clientAuth, firebaseEmail, firebasePassword);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

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
    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: 'Authentication failed. Please ensure the user exists in Firebase Auth.' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
