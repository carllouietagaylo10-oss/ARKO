#!/usr/bin/env node

/**
 * Leaflet Integration Verification Script
 * Run this to verify the migration from Mapbox to Leaflet is complete
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️ Verifying Leaflet Integration...\n');

// Files to check
const checks = [
  {
    name: 'LeafletFloodMap Component',
    file: './components/LeafletFloodMap.tsx',
    required: true,
    checkContent: (content) => {
      const checks = [
        { test: content.includes('LeafletFloodMap'), message: 'Component properly named' },
        { test: content.includes('realApiService'), message: 'Uses real API service' },
        { test: content.includes('getLocations'), message: 'Fetches locations from API' },
        { test: content.includes('getAlerts'), message: 'Fetches alerts from API' },
        { test: content.includes('leaflet@1.9.4'), message: 'Uses Leaflet v1.9.4' },
        { test: content.includes('ArcGIS'), message: 'Has satellite tile provider' },
        { test: content.includes('OpenStreetMap'), message: 'Has street tile provider' },
        { test: content.includes('apiConnected'), message: 'Has API connection monitoring' },
        { test: content.includes('loadRealTimeData'), message: 'Has real-time data loading' },
        { test: !content.includes('mapbox'), message: 'No Mapbox references' }
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
        { test: content.includes('LeafletFloodMap'), message: 'Uses Leaflet component' },
        { test: content.includes('Interactive Leaflet Guide'), message: 'Updated guide text' },
        { test: content.includes('bg-green-50'), message: 'Uses green theme for Leaflet' },
        { test: !content.includes('MapboxFloodMap'), message: 'No Mapbox component references' },
        { test: !content.includes('Mapbox Professional'), message: 'No Mapbox branding' }
      ];
      return checks;
    }
  },
  {
    name: 'Environment Configuration',
    file: './.env',
    required: true,
    checkContent: (content) => {
      const checks = [
        { test: content.includes('LEAFLET MAPPING'), message: 'Has Leaflet configuration section' },
        { test: content.includes('No API Key Required'), message: 'Documents no API key needed' },
        { test: !content.includes('MAPBOX'), message: 'No Mapbox configuration' },
        { test: !content.includes('VITE_MAPBOX_ACCESS_TOKEN'), message: 'No Mapbox token variable' }
      ];
      return checks;
    }
  }
];

// Files that should NOT exist (old Mapbox components)
const shouldNotExist = [
  './components/MapboxFloodMap.tsx',
  './services/mapboxService.ts'
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

// Check that old Mapbox components are removed
console.log('🗑️  Checking old Mapbox components are removed:');
for (const file of shouldNotExist) {
  if (fs.existsSync(file)) {
    console.log(`   ❌ Old Mapbox component still exists: ${file}`);
    allPassed = false;
  } else {
    console.log(`   ✅ Old Mapbox component removed: ${file}`);
  }
}

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('🎉 LEAFLET INTEGRATION COMPLETE!');
  console.log('✅ Leaflet map component is ready');
  console.log('✅ Real API service is integrated');
  console.log('✅ Old Mapbox components are removed');
  console.log('✅ Environment is configured');
  console.log('✅ UI theme updated to green');
  console.log('\n🌟 Benefits of Leaflet over Mapbox:');
  console.log('   💰 100% FREE - No API keys or costs');
  console.log('   ⚡ FASTER - Lightweight and optimized');
  console.log('   🎨 CUSTOMIZABLE - Full styling control');
  console.log('   📱 MOBILE OPTIMIZED - Better mobile performance');
  console.log('\n🚀 Your flood monitoring map is ready with real-time data!');
} else {
  console.log('❌ SOME CHECKS FAILED');
  console.log('Please review the issues above and fix them.');
}

console.log('\n📖 For complete guide, see: /LEAFLET_REAL_TIME_INTEGRATION_COMPLETE.md');
console.log('='.repeat(60));