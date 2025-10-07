#!/usr/bin/env tsx

/**
 * Set admin role for the configured admin user
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { db } from '../src/lib/firebase-admin';

async function setAdminRole() {
  const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (!adminUid || !adminEmail) {
    console.error('❌ NEXT_PUBLIC_ADMIN_UID or NEXT_PUBLIC_ADMIN_EMAIL not configured');
    process.exit(1);
  }

  console.log(`Setting admin role for: ${adminEmail} (${adminUid})`);

  try {
    await db.collection('users').doc(adminUid).set({
      email: adminEmail,
      role: 'admin',
      displayName: 'Ruan Admin',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log('✅ Admin role set successfully!');
    console.log('User document updated in Firestore users collection');
  } catch (error) {
    console.error('❌ Failed to set admin role:', error);
    process.exit(1);
  }
}

setAdminRole()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
