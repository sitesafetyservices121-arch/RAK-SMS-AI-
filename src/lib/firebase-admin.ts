import type { App, AppOptions } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';

// This function is dynamically imported in the middleware and API routes.
// This prevents the firebase-admin module from being bundled in client-side code.
function initializeAdminApp(options?: AppOptions): App {
  const { getApps, initializeApp, cert } = require('firebase-admin/app') as typeof import('firebase-admin/app');
  
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    return initializeApp({
      ...options,
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
}

// We are not exporting a singleton instance anymore, but rather functions that
// ensure the app is initialized and then return the service.

export function getAdminAuth(): Auth {
  initializeAdminApp();
  const { getAuth } = require('firebase-admin/auth') as typeof import('firebase-admin/auth');
  return getAuth();
}
