#!/usr/bin/env tsx

/**
 * Test document upload functionality
 * Creates a test document and verifies Storage and Firestore integration
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { db, storage } from '../src/lib/firebase-admin';

async function testDocumentUpload() {
  console.log('📄 Testing Document Upload System...\n');

  try {
    // Test 1: Check Storage bucket access
    console.log('1️⃣  Testing Storage bucket access...');
    const bucket = storage.bucket();
    const [bucketExists] = await bucket.exists();

    if (!bucketExists) {
      throw new Error('Storage bucket does not exist!');
    }

    console.log(`   ✅ Storage bucket accessible: ${bucket.name}`);

    // Test 2: Check if we can list files in document-library
    console.log('\n2️⃣  Checking document-library folder...');
    const [files] = await bucket.getFiles({ prefix: 'document-library/', maxResults: 10 });
    console.log(`   📁 Found ${files.length} file(s) in document-library`);

    if (files.length > 0) {
      console.log('   Recent files:');
      files.slice(0, 5).forEach(file => {
        console.log(`      - ${file.name}`);
      });
    }

    // Test 3: Check Firestore documents collection
    console.log('\n3️⃣  Checking Firestore documents collection...');
    const documentsSnapshot = await db.collection('documents').limit(10).get();
    console.log(`   📚 Found ${documentsSnapshot.size} document(s) in Firestore`);

    if (documentsSnapshot.size > 0) {
      console.log('   Recent documents:');
      documentsSnapshot.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        console.log(`      - ${data.name} (${data.category}/${data.section})`);
      });
    }

    // Test 4: Check categories
    console.log('\n4️⃣  Analyzing document categories...');
    const categories = new Map<string, number>();
    documentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const count = categories.get(data.category) || 0;
      categories.set(data.category, count + 1);
    });

    console.log('   📊 Documents by category:');
    if (categories.size > 0) {
      categories.forEach((count, category) => {
        console.log(`      ${category}: ${count}`);
      });
    } else {
      console.log('      (No documents uploaded yet)');
    }

    // Test 5: Verify upload permissions
    console.log('\n5️⃣  Testing upload permissions...');
    const testPath = 'document-library/_test/test.txt';
    const testFile = bucket.file(testPath);

    try {
      await testFile.save('Test content', {
        metadata: { contentType: 'text/plain' }
      });
      console.log('   ✅ Upload permissions: Working');

      // Clean up test file
      await testFile.delete();
      console.log('   🧹 Test file cleaned up');
    } catch (error: any) {
      console.error('   ❌ Upload permissions: Failed');
      console.error(`   Error: ${error.message}`);
      throw error;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ Document Upload System is working correctly!\n');
    console.log('Summary:');
    console.log(`  - Storage bucket: ✅ Accessible`);
    console.log(`  - Upload permissions: ✅ Working`);
    console.log(`  - Firestore integration: ✅ Working`);
    console.log(`  - Total documents: ${documentsSnapshot.size}`);
    console.log(`  - Storage files: ${files.length}`);
    console.log('\nYou can now upload documents via /admin/document-upload');
    console.log('Supported categories: Safety, Quality, HR, Environment, Toolbox Talks');
    console.log('Supported formats: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)');
    console.log('='.repeat(50));

  } catch (error: any) {
    console.error('\n❌ Document upload system test failed!');
    console.error(`Error: ${error.message}`);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
    process.exit(1);
  }
}

testDocumentUpload()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
