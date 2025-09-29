import admin from 'firebase-admin';
import { getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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

if (getApps().length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

export const adminAuth = getAuth(getApp());

export async function verifySessionCookie(sessionCookie: string) {
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}
