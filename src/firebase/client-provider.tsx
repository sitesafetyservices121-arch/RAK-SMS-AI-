// path: src/providers/FirebaseClientProvider.tsx
'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { app as firebaseApp, auth, db as firestore } from '@/lib/firebase-client';

/**
 * Why: firebase-client exports singletons guarded by getApps();
 * calling initialize here is redundant and can cause hydration issues.
 */
interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return (
    <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}

export default FirebaseClientProvider;
