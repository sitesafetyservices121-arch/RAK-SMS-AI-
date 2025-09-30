
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This function initializes the Firebase Admin SDK.
function initializeAdmin() {
  // If the app is already initialized, return the existing instance.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Retrieve the service account key from environment variables.
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }
  
  // Parse the service account key from a JSON string.
  const serviceAccount = JSON.parse(serviceAccountKey);

  // The private key needs to have its newline characters properly formatted.
  if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  // Initialize the Firebase Admin app with the service account credentials.
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
}

export const adminApp = initializeAdmin();
export const db = admin.firestore(adminApp);
export const storage = admin.storage(adminApp);
