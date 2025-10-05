const fs = require('fs');
const path = require('path');

async function main() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env not found at', envPath);
    process.exit(1);
  }

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

  const supabaseUrl = env['VITE_SUPABASE_URL'];
  const anonKey = env['VITE_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !anonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  const endpoint = `${supabaseUrl.replace(/\/+$/,'')}/rest/v1/flood_alerts`;

  const payload = {
    severity: 'high',
    location: 'Automated Test Insert',
    barangay: 'Brgy. Test',
    latitude: 7.9125 + (Math.random() - 0.5) * 0.02,
    longitude: 125.0864 + (Math.random() - 0.5) * 0.02,
    water_level_cm: 60,
    time_to_impact_minutes: 20,
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
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
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
