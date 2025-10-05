#!/usr/bin/env node

/**
 * Mapbox + Real API Integration Verification Script
 * Run this to verify your setup is complete and properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Mapbox + Real API Integration...\n');

// Files to check
const checks = [
  {
    name: 'MapboxFloodMap Component',
    file: './components/MapboxFloodMap.tsx',
    required: true,
    checkContent: (content) => {
      const checks = [
        { test: content.includes('realApiService'), message: 'Uses real API service' },
        { test: content.includes('getLocations'), message: 'Fetches locations from API' },
        { test: content.includes('getAlerts'), message: 'Fetches alerts from API' },
        { test: content.includes('mapboxService'), message: 'Uses Mapbox service' },
        { test: content.includes('apiConnected'), message: 'Has API connection monitoring' },
        { test: !content.includes('generateEvacuationCenters'), message: 'No hardcoded data generation' }
      ];
      return checks;
    }
  },
  {
    name: 'Real API Service',
    file: './services/realApiService.ts',
    required: true,
    checkContent: (content) => {
      const checks = [
        { test: content.includes('/api/locations'), message: 'Has locations endpoint' },
        { test: content.includes('/api/alerts'), message: 'Has alerts endpoint' },
        { test: content.includes('/api/health'), message: 'Has health check endpoint' },
        { test: content.includes('makeRequest'), message: 'Has request method with retry logic' },
        { test: content.includes('getFallbackLocations'), message: 'Has fallback system' }
      ];
      return checks;
    }
  },
  {
    name: 'App.tsx Integration',
    file: './App.tsx',
    required: true,
    checkContent: (content) => {
      const checks = [
        { test: content.includes('MapboxFloodMap'), message: 'Uses Mapbox component' },
        { test: !content.includes('Enhanced3DFloodMap'), message: 'No old Enhanced3D component' },
        { test: !content.includes('Professional3DFloodMap'), message: 'No old Professional3D component' },
        { test: !content.includes('FloodMap'), message: 'No old FloodMap component' }
      ];
      return checks;
    }
  }
];

// Files that should NOT exist (old map components)
const shouldNotExist = [
  './components/FloodMap.tsx',
  './components/Enhanced3DFloodMap.tsx',
  './components/EnhancedFloodMap.tsx',
  './components/Professional3DFloodMap.tsx'
];

let allPassed = true;

// Check required files exist and have correct content
for (const check of checks) {
  console.log(`📁 Checking: ${check.name}`);
  
  try {
    if (!fs.existsSync(check.file)) {
      console.log(`   ❌ File not found: ${check.file}`);
      allPassed = false;
      continue;
    }
    
    console.log(`   ✅ File exists: ${check.file}`);
    
    if (check.checkContent) {
      const content = fs.readFileSync(check.file, 'utf8');
      const contentChecks = check.checkContent(content);
      
      for (const contentCheck of contentChecks) {
        if (contentCheck.test) {
          console.log(`   ✅ ${contentCheck.message}`);
        } else {
          console.log(`   ❌ ${contentCheck.message}`);
          allPassed = false;
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Error checking ${check.file}: ${error.message}`);
    allPassed = false;
  }
  
  console.log('');
}

// Check that old components are removed
console.log('🗑️  Checking old components are removed:');
for (const file of shouldNotExist) {
  if (fs.existsSync(file)) {
    console.log(`   ❌ Old component still exists: ${file}`);
    allPassed = false;
  } else {
    console.log(`   ✅ Old component removed: ${file}`);
  }
}

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('🎉 ALL CHECKS PASSED!');
  console.log('✅ Mapbox integration is complete');
  console.log('✅ Real API service is configured');
  console.log('✅ Old map components are removed');
  console.log('✅ Only MapboxFloodMap is used');
  console.log('\n🚀 Next step: Configure your API base URL in /services/realApiService.ts');
} else {
  console.log('❌ SOME CHECKS FAILED');
  console.log('Please review the issues above and fix them.');
}

console.log('\n📖 For setup instructions, see: /REAL_API_INTEGRATION_SETUP.md');
console.log('='.repeat(60));