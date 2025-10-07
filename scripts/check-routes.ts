#!/usr/bin/env tsx

/**
 * Check for missing routes and broken navigation links
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';

// Navigation configuration from nav.tsx
const navLinks = [
  // Main
  "/dashboard",
  "/documents",
  "/generated-documents",
  "/news",
  "/how-to-guide",
  // Management Tools
  "/employee-training-tracker",
  "/storeroom-tracker",
  "/site-resource-tracker",
  "/vehicle-inspection-tracker",
  "/ppe-issue-register",
  "/toolbox-talks",
  "/sds-management",
  // AI Tools
  "/she-plan-generator",
  "/hira-generator",
  "/safe-work-procedure",
  "/method-statement",
  "/ltir-analysis",
  // Consultant
  "/ohs-consultant",
  // My Account
  "/account/settings",
  "/account/billing",
  "/support",
  // Admin
  "/admin/onboarding",
  "/admin/prescription-management",
  "/admin/billing",
  "/admin/document-upload",
  "/admin/bulk-import",
  "/admin/create-news",
  "/admin/wilson-training",
  "/admin/model-inspector",
];

async function checkRoutes() {
  console.log('🔍 Checking Navigation Routes...\n');

  // Find all page files
  const pageFiles = await glob('src/app/**/page.{tsx,ts,jsx,js}', {
    cwd: resolve(__dirname, '..'),
    absolute: true
  });

  // Convert file paths to routes
  const existingRoutes = pageFiles.map(file => {
    let route = file
      .replace(/.*\/src\/app/, '')
      .replace(/\/page\.(tsx|ts|jsx|js)$/, '')
      .replace(/\/\(.*?\)/g, ''); // Remove route groups like (dashboard)

    // Root page becomes /
    if (route === '') route = '/';

    return route;
  });

  console.log(`📄 Found ${existingRoutes.length} existing routes\n`);

  // Check for missing routes
  const missingRoutes: string[] = [];
  const foundRoutes: string[] = [];

  navLinks.forEach(navLink => {
    const routeExists = existingRoutes.some(route => {
      // Exact match or parent route match
      return route === navLink || navLink.startsWith(route + '/');
    });

    if (!routeExists) {
      missingRoutes.push(navLink);
    } else {
      foundRoutes.push(navLink);
    }
  });

  // Report results
  console.log('✅ Valid Routes:');
  foundRoutes.forEach(route => {
    console.log(`   ✓ ${route}`);
  });

  if (missingRoutes.length > 0) {
    console.log('\n❌ Missing Routes (Broken Links):');
    missingRoutes.forEach(route => {
      console.log(`   ✗ ${route}`);
    });
    console.log(`\n⚠️  Found ${missingRoutes.length} broken navigation link(s)!`);
  } else {
    console.log('\n🎉 All navigation links are valid!');
  }

  // Check for orphan routes (routes that exist but aren't in nav)
  const orphanRoutes = existingRoutes.filter(route => {
    if (route === '/' || route === '/login' || route === '/register' || route === '/unauthorized') {
      return false; // Skip special routes
    }
    return !navLinks.includes(route) && !navLinks.some(nav => nav.startsWith(route + '/'));
  });

  if (orphanRoutes.length > 0) {
    console.log('\n📋 Routes not in navigation (may be intentional):');
    orphanRoutes.forEach(route => {
      console.log(`   → ${route}`);
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Total routes checked: ${navLinks.length}`);
  console.log(`Valid: ${foundRoutes.length}`);
  console.log(`Missing: ${missingRoutes.length}`);
  console.log('='.repeat(50));

  if (missingRoutes.length > 0) {
    process.exit(1);
  }
}

checkRoutes().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
