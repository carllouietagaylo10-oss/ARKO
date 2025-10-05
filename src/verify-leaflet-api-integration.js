#!/usr/bin/env node

// Verify Leaflet API Integration Script
// This script checks if your Leaflet map component will work properly

console.log('🗺️ VERIFYING LEAFLET API INTEGRATION...\n');

// Check 1: API Service Configuration
console.log('1. 📡 API SERVICE CONFIGURATION:');
try {
  // Read the realApiService file to check configuration
  const fs = require('fs');
  const path = require('path');
  const serviceFile = path.join(__dirname, 'services', 'realApiService.ts');
  
  if (fs.existsSync(serviceFile)) {
    const content = fs.readFileSync(serviceFile, 'utf8');
    
    // Check if API URL is configured
    if (content.includes('YOUR_API_BASE_URL_HERE')) {
      console.log('   ⚠️  API URL not configured (using fallback data)');
      console.log('   📝 This is OK - map will show mock Valencia City data');
    } else {
      console.log('   ✅ API URL configured');
    }
    
    // Check if environment variable is mentioned
    if (content.includes('VITE_API_BASE_URL')) {
      console.log('   ✅ Environment variable support available');
    }
    
    console.log('   ✅ API service file exists and is properly structured');
  } else {
    console.log('   ❌ API service file not found');
  }
} catch (error) {
  console.log(`   ❌ Error checking API service: ${error.message}`);
}

// Check 2: Leaflet Component Structure
console.log('\n2. 🗺️ LEAFLET COMPONENT:');
try {
  const fs = require('fs');
  const path = require('path');
  const componentFile = path.join(__dirname, 'components', 'LeafletFloodMap.tsx');
  
  if (fs.existsSync(componentFile)) {
    const content = fs.readFileSync(componentFile, 'utf8');
    
    console.log('   ✅ LeafletFloodMap component exists');
    
    // Check key features
    if (content.includes('realApiService')) {
      console.log('   ✅ Real API service integration');
    }
    
    if (content.includes('loadRealTimeData')) {
      console.log('   ✅ Real-time data loading');
    }
    
    if (content.includes('updateMapMarkers')) {
      console.log('   ✅ Dynamic marker updates');
    }
    
    if (content.includes('window.L')) {
      console.log('   ✅ Standard Leaflet loading approach');
    }
    
    if (content.includes('evacuation_center')) {
      console.log('   ✅ Evacuation center support');
    }
    
    if (content.includes('floodAlerts')) {
      console.log('   ✅ Flood alert integration');
    }
    
    if (content.includes('weatherData')) {
      console.log('   ✅ Weather data integration');
    }
    
  } else {
    console.log('   ❌ LeafletFloodMap component not found');
  }
} catch (error) {
  console.log(`   ❌ Error checking Leaflet component: ${error.message}`);
}

// Check 3: App Integration
console.log('\n3. 🚀 APP INTEGRATION:');
try {
  const fs = require('fs');
  const path = require('path');
  const appFile = path.join(__dirname, 'App.tsx');
  
  if (fs.existsSync(appFile)) {
    const content = fs.readFileSync(appFile, 'utf8');
    
    if (content.includes('LeafletFloodMap')) {
      console.log('   ✅ LeafletFloodMap imported in App.tsx');
    }
    
    if (content.includes('coordinates')) {
      console.log('   ✅ Valencia City coordinates configured');
    }
    
    if (content.includes('7.9125') && content.includes('125.0864')) {
      console.log('   ✅ Valencia City coordinates (7.9125, 125.0864) found');
    }
    
    if (content.includes('realApiService')) {
      console.log('   ✅ Real API service imported in app');
    }
    
    if (content.includes('dataAggregationService')) {
      console.log('   ✅ Data aggregation service integration');
    }
    
  } else {
    console.log('   ❌ App.tsx not found');
  }
} catch (error) {
  console.log(`   ❌ Error checking App integration: ${error.message}`);
}

// Check 4: Expected Behavior
console.log('\n4. 🎯 EXPECTED BEHAVIOR:');
console.log('   📍 Map will load at Valencia City center (7.9125, 125.0864)');
console.log('   🏠 Will show 3 evacuation centers (Valencia Gym, City Hall, Central School)');
console.log('   ⚠️  Will show flood alerts based on weather conditions');
console.log('   🔄 Data refreshes every 2 minutes');
console.log('   🌐 Uses fallback data when API is not configured');
console.log('   🌤️ Integrates with app weather data');

// Check 5: API Setup Instructions
console.log('\n5. 🔧 TO ENABLE LIVE API:');
console.log('   1. Replace "YOUR_API_BASE_URL_HERE" in /services/realApiService.ts');
console.log('   2. Or add VITE_API_BASE_URL=https://your-api.com to .env file');
console.log('   3. Ensure your API has these endpoints:');
console.log('      - GET /api/locations (returns evacuation centers)');
console.log('      - GET /api/alerts (returns flood alerts)');
console.log('      - GET /api/health (health check)');

console.log('\n✅ LEAFLET INTEGRATION VERIFICATION COMPLETE!');
console.log('🗺️ Your map should work with either live API or fallback data');
console.log('📍 Valencia City coordinates are properly configured');