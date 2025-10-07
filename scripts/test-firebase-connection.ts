#!/usr/bin/env tsx

/**
 * Test Firebase Admin SDK connections
 * Tests: Firestore, Storage, and Auth
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { db, auth, storage } from '../src/lib/firebase-admin';

async function testFirebaseConnections() {
  console.log('🔥 Testing Firebase Admin SDK connections...\n');

  let allTestsPassed = true;

  // Test 1: Firestore connection
  try {
    console.log('1️⃣  Testing Firestore connection...');
    const testDoc = await db.collection('_test').doc('connection-test').get();
    console.log('   ✅ Firestore: Connected successfully');
    console.log(`   📊 Connection exists: ${testDoc.exists ? 'Yes' : 'No (normal for first run)'}`);
  } catch (error: any) {
    console.error('   ❌ Firestore: Connection failed');
    console.error(`   Error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 2: Storage connection
  try {
    console.log('\n2️⃣  Testing Storage connection...');
    const bucket = storage.bucket();
    const [exists] = await bucket.exists();
    console.log('   ✅ Storage: Connected successfully');
    console.log(`   🗂️  Bucket exists: ${exists ? 'Yes' : 'No'}`);
    console.log(`   📦 Bucket name: ${bucket.name}`);
  } catch (error: any) {
    console.error('   ❌ Storage: Connection failed');
    console.error(`   Error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 3: Auth connection & Admin user check
  try {
    console.log('\n3️⃣  Testing Auth connection and admin user...');
    const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!adminUid || !adminEmail) {
      throw new Error('NEXT_PUBLIC_ADMIN_UID or NEXT_PUBLIC_ADMIN_EMAIL not configured');
    }

    console.log(`   🔍 Looking for admin user: ${adminEmail} (${adminUid})`);

    try {
      const adminUser = await auth.getUser(adminUid);
      console.log('   ✅ Auth: Connected successfully');
      console.log(`   👤 Admin user found:`);
      console.log(`      Email: ${adminUser.email}`);
      console.log(`      UID: ${adminUser.uid}`);
      console.log(`      Display Name: ${adminUser.displayName || 'Not set'}`);
      console.log(`      Email Verified: ${adminUser.emailVerified ? 'Yes' : 'No'}`);
      console.log(`      Disabled: ${adminUser.disabled ? 'Yes' : 'No'}`);
      console.log(`      Created: ${new Date(adminUser.metadata.creationTime).toLocaleString()}`);
    } catch (userError: any) {
      if (userError.code === 'auth/user-not-found') {
        console.log('   ⚠️  Admin user does not exist in Firebase Auth');
        console.log(`   💡 You need to create user: ${adminEmail}`);
        console.log('   Run: firebase auth:users:create or use Firebase Console');
      } else {
        throw userError;
      }
    }
  } catch (error: any) {
    console.error('   ❌ Auth: Connection or config failed');
    console.error(`   Error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 4: Check Firestore users collection
  try {
    console.log('\n4️⃣  Checking Firestore users collection...');
    const usersSnapshot = await db.collection('users').limit(5).get();
    console.log(`   ✅ Users collection accessible`);
    console.log(`   👥 Found ${usersSnapshot.size} user(s) (showing up to 5)`);

    const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;
    if (adminUid && usersSnapshot.size > 0) {
      const adminDoc = await db.collection('users').doc(adminUid).get();
      if (adminDoc.exists) {
        console.log(`   ✅ Admin user document exists in Firestore`);
        const data = adminDoc.data();
        console.log(`      Role: ${data?.role || 'Not set'}`);
      } else {
        console.log(`   ⚠️  Admin user document not found in Firestore`);
        console.log(`   💡 Consider creating a document for admin user`);
      }
    }
  } catch (error: any) {
    console.error('   ❌ Users collection check failed');
    console.error(`   Error: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('✅ All Firebase connections successful!\n');
    console.log('Your Firebase setup is working correctly.');
    console.log('Admin UID and credentials are properly configured.');
  } else {
    console.log('❌ Some Firebase connections failed.\n');
    console.log('Please check the errors above and your environment variables.');
  }
  console.log('='.repeat(50));
}

// Run the tests
testFirebaseConnections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Fatal error running tests:', error);
    process.exit(1);
  });
