(async () => {
  try {
    const fs = require('fs');
    const path = require('path');

    // Load env values if present
    const envPath = path.resolve(__dirname, '..', '.env');
    let env = {};
    if (fs.existsSync(envPath)) {
      env = fs.readFileSync(envPath, 'utf8')
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
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY || env.SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing VITE_SUPABASE_URL or SERVICE_ROLE_KEY in environment/.env');
      process.exit(1);
    }

    // dynamic import of supabase client
    const { createClient } = await import('@supabase/supabase-js');

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const payload = {
      severity: 'critical',
      location: 'Service Role Client Insert',
      barangay: 'Brgy. Test Service',
      latitude: 7.9125 + (Math.random() - 0.5) * 0.02,
      longitude: 125.0864 + (Math.random() - 0.5) * 0.02,
      water_level_cm: 95,
      time_to_impact_minutes: 6,
      evacuation_center: 'Valencia City Hall',
      instructions: ['Evacuate immediately', 'Move to higher ground'],
      avoid_areas: ['Riverside Road'],
      is_active: true
    };

    console.log('Inserting row with service_role...');
    const { data, error } = await supabase
      .from('flood_alerts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      process.exit(2);
    }

    console.log('Insert result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();
