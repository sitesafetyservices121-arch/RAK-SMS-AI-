
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

// Hardcoded credentials
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

    // Hardcoded credentials check
    const isAdmin = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    const isClient = email === CLIENT_EMAIL && password === CLIENT_PASSWORD;

    if (!isAdmin && !isClient) {
        return NextResponse.json({ error: 'Invalid email or password. Please try again.' }, { status: 401 });
    }
    
    // We still need a valid Firebase user to create a session.
    // For this temporary solution, we'll sign in as one of the real users 
    // in Firebase to generate a token, but the login access is controlled by the hardcoded check above.
    // IMPORTANT: The email used here MUST exist in your Firebase Authentication users.
    const firebaseEmail = isAdmin ? ADMIN_EMAIL : CLIENT_EMAIL;
    const firebasePassword = isAdmin ? ADMIN_PASSWORD : CLIENT_PASSWORD;

    // Initialize client auth within the handler to avoid module scope issues
    const clientApp = !getClientApps().length ? initializeClientApp(firebaseConfig) : getClientApp();
    const clientAuth = getClientAuth(clientApp);

    // 1. Sign in with client SDK to get user and ID token
    const userCredential = await signInWithEmailAndPassword(clientAuth, firebaseEmail, firebasePassword);
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
    // If the Firebase sign-in fails, it means the underlying user doesn't exist.
    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: 'Authentication failed. Please ensure the hardcoded user exists in Firebase Auth.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
