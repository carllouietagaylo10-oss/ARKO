const fs = require('fs');
const path = require('path');

async function main() {
  // Prefer SERVICE_ROLE_KEY from environment for safety
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

  // Fallback: read from .env if present (not recommended for production)
  let envServiceRole = null;
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!serviceRoleKey && fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
      .reduce((acc, line) => {
        const idx = line.indexOf('=');
        if (idx === -1) return acc;
        const key = line.slice(0, idx);
        const val = line.slice(idx + 1);
        acc[key] = val;
        return acc;
      }, {});
    envServiceRole = env['SERVICE_ROLE_KEY'];
  }

  const keyToUse = serviceRoleKey || envServiceRole;
  if (!keyToUse) {
    console.error('Provide SERVICE_ROLE_KEY in environment when running this script. Example:');
    console.error('  $env:SERVICE_ROLE_KEY = "<your-service-role-key>"; node scripts/triggerAlertServiceRole.js');
    process.exit(1);
  }

  // Load supabase url from .env
  const supabaseUrl = (process.env.VITE_SUPABASE_URL) || (fs.existsSync(envPath) && fs.readFileSync(envPath,'utf8').match(/VITE_SUPABASE_URL=(.*)/)?.[1]);
  if (!supabaseUrl) {
    console.error('VITE_SUPABASE_URL not found in environment or .env');
    process.exit(1);
  }

  const endpoint = `${supabaseUrl.replace(/\/+$/,'')}/rest/v1/flood_alerts`;

  const payload = {
    severity: 'critical',
    location: 'Service Role Insert',
    barangay: 'Brgy. Test Service',
    latitude: 7.9125 + (Math.random() - 0.5) * 0.02,
    longitude: 125.0864 + (Math.random() - 0.5) * 0.02,
    water_level_cm: 90,
    time_to_impact_minutes: 8,
    evacuation_center: 'Valencia City Hall',
    instructions: ['Evacuate immediately', 'Move to higher ground'],
    avoid_areas: ['Riverside Road'],
    is_active: true
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': keyToUse,
        'Authorization': `Bearer ${keyToUse}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch(e) { json = text; }

    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));

    if (!res.ok) process.exit(2);
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
}

main();
