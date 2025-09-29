import type { App } from 'firebase-admin/app';

// This function dynamically imports and initializes the Firebase Admin SDK.
// It ensures that the SDK is only imported on the server-side and only when needed.
async function getAdminApp(): Promise<App> {
  const admin = await import('firebase-admin');
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    // Re-throw the error to be caught by the caller
    throw error;
  }
}

// Dynamically imports the auth module and returns it.
async function getAdminAuth() {
  await getAdminApp();
  const { getAuth } = await import('firebase-admin/auth');
  return getAuth();
}

/**
 * Verifies a session cookie and returns the decoded token.
 * Returns null if the cookie is invalid.
 */
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const auth = await getAdminAuth();
    return await auth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

/**
 * Creates a session cookie for the given ID token.
 */
export async function createSessionCookie(idToken: string, expiresIn: number) {
    const auth = await getAdminAuth();
    return auth.createSessionCookie(idToken, { expiresIn });
}
