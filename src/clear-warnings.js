#!/usr/bin/env node

/**
 * Clear All Warning Flags from localStorage
 * Run this in browser console to reset all "shown once" warnings
 */

function clearAllWarnings() {
  const warningKeys = [
    'weather_simulation_warning_shown',
    'supabase_warning_shown',
    'mapbox_warning_shown',
    'nasa_simulation_warning_shown',
    'pagasa_simulation_warning_shown',
    'flood_simulation_warning_shown'
  ];

  console.log('🧹 Clearing all warning flags...');
  
  warningKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Cleared: ${key}`);
    }
  });

  console.log('🎉 All warning flags cleared! Refresh page to see warnings again.');
}

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearAllWarnings };
}

// For browser console
if (typeof window !== 'undefined') {
  window.clearAllWarnings = clearAllWarnings;
  console.log('💡 Run clearAllWarnings() in browser console to reset warnings');
}

// Self-execute if run directly
if (typeof process !== 'undefined' && process.argv && process.argv[0].includes('node')) {
  console.log(`
🧹 ARKO Warning Cleaner

To clear warnings in browser:
1. Open browser developer console (F12)
2. Run: clearAllWarnings()
3. Refresh the page

This will reset all "show once" warning flags and display them again.
  `);
}