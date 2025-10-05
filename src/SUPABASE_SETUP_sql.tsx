-- ===================================
-- ARKO DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- FLOOD ALERTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS flood_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  water_level_cm INTEGER,
  time_to_impact_minutes INTEGER,
  evacuation_center TEXT,
  instructions JSONB DEFAULT '[]'::jsonb,
  avoid_areas JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_flood_alerts_active ON flood_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_flood_alerts_severity ON flood_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_flood_alerts_barangay ON flood_alerts(barangay);

-- ===================================
-- COMMUNITY REPORTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('flooding', 'evacuation', 'missing_person', 'road_closure', 'utility_damage')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT NOT NULL,
  water_level_estimate TEXT,
  photo_urls JSONB DEFAULT '[]'::jsonb,
  verification_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_report'))
);

CREATE INDEX IF NOT EXISTS idx_community_reports_type ON community_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_barangay ON community_reports(barangay);
CREATE INDEX IF NOT EXISTS idx_community_reports_created ON community_reports(created_at DESC);

-- ===================================
-- EVACUATION CENTERS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS evacuation_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  max_capacity INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  contact_number TEXT,
  contact_person TEXT,
  facilities JSONB DEFAULT '{}'::jsonb,
  is_operational BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evacuation_centers_barangay ON evacuation_centers(barangay);
CREATE INDEX IF NOT EXISTS idx_evacuation_centers_operational ON evacuation_centers(is_operational);

-- ===================================
-- WEATHER DATA TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  temperature DECIMAL(5, 2),
  humidity INTEGER,
  wind_speed DECIMAL(5, 2),
  precipitation DECIMAL(6, 2),
  pressure INTEGER,
  condition TEXT,
  visibility INTEGER,
  rainfall_24h DECIMAL(6, 2),
  source TEXT DEFAULT 'openweathermap'
);

CREATE INDEX IF NOT EXISTS idx_weather_data_recorded_at ON weather_data(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_data_location ON weather_data(location);

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS on all tables
ALTER TABLE flood_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE evacuation_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read active alerts" ON flood_alerts;
DROP POLICY IF EXISTS "Allow public read verified reports" ON community_reports;
DROP POLICY IF EXISTS "Allow anyone to create reports" ON community_reports;
DROP POLICY IF EXISTS "Allow public read evacuation centers" ON evacuation_centers;
DROP POLICY IF EXISTS "Allow public read weather data" ON weather_data;

-- Public read access for flood alerts
CREATE POLICY "Allow public read active alerts" 
ON flood_alerts FOR SELECT 
USING (is_active = true);

-- Public read for verified community reports
CREATE POLICY "Allow public read verified reports" 
ON community_reports FOR SELECT 
USING (is_verified = true OR status = 'active');

-- Anyone can insert community reports
CREATE POLICY "Allow anyone to create reports" 
ON community_reports FOR INSERT 
WITH CHECK (true);

-- Public read for evacuation centers
CREATE POLICY "Allow public read evacuation centers" 
ON evacuation_centers FOR SELECT 
USING (true);

-- Public read for weather data
CREATE POLICY "Allow public read weather data" 
ON weather_data FOR SELECT 
USING (true);

-- ===================================
-- SAMPLE DATA FOR VALENCIA CITY
-- ===================================

-- Insert evacuation centers
INSERT INTO evacuation_centers (name, address, barangay, latitude, longitude, max_capacity, current_occupancy, contact_number, contact_person, facilities) VALUES
('Valencia City Hall', 'Poblacion, Valencia City, Bukidnon', 'Poblacion', 7.9125, 125.0864, 500, 0, '+63-88-000-1111', 'Mayor Office', '{"medical": true, "food": true, "water": true, "electricity": true, "generators": true, "communications": true}'::jsonb),
('Lumbo Elementary School', 'Brgy. Lumbo, Valencia City, Bukidnon', 'Lumbo', 7.9200, 125.0900, 300, 0, '+63-88-000-2222', 'Principal Office', '{"medical": false, "food": true, "water": true, "electricity": true, "generators": false, "communications": true}'::jsonb),
('San Carlos Multi-Purpose Hall', 'Brgy. San Carlos, Valencia City, Bukidnon', 'San Carlos', 7.9050, 125.0800, 200, 0, '+63-88-000-3333', 'Barangay Captain', '{"medical": false, "food": true, "water": true, "electricity": true, "generators": true, "communications": true}'::jsonb),
('Mailag Covered Court', 'Brgy. Mailag, Valencia City, Bukidnon', 'Mailag', 7.9180, 125.0950, 250, 0, '+63-88-000-4444', 'Barangay Official', '{"medical": false, "food": true, "water": true, "electricity": true, "generators": false, "communications": true}'::jsonb),
('Tugaya Gymnasium', 'Brgy. Tugaya, Valencia City, Bukidnon', 'Tugaya', 7.9080, 125.0750, 350, 0, '+63-88-000-5555', 'Sports Coordinator', '{"medical": true, "food": true, "water": true, "electricity": true, "generators": true, "communications": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert a sample flood alert (for testing - you can remove this later)
INSERT INTO flood_alerts (severity, location, barangay, latitude, longitude, water_level_cm, time_to_impact_minutes, evacuation_center, instructions, avoid_areas, is_active) VALUES
('medium', 'Riverside Area, Poblacion', 'Poblacion', 7.9125, 125.0864, 35, 45, 'Valencia City Hall', 
'["Monitor flood levels closely", "Prepare emergency supplies", "Move valuables to higher ground", "Stay tuned for updates"]'::jsonb, 
'["Riverside Road", "Lower Bridge Area", "Market Street"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- ===================================
-- VERIFICATION QUERY
-- ===================================

-- Check if everything was created successfully
SELECT 
  'Tables Created' as status,
  COUNT(*) FILTER (WHERE table_name = 'flood_alerts') as flood_alerts,
  COUNT(*) FILTER (WHERE table_name = 'community_reports') as community_reports,
  COUNT(*) FILTER (WHERE table_name = 'evacuation_centers') as evacuation_centers,
  COUNT(*) FILTER (WHERE table_name = 'weather_data') as weather_data
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('flood_alerts', 'community_reports', 'evacuation_centers', 'weather_data');

-- Show sample data
SELECT 'Evacuation Centers Loaded' as info, COUNT(*) as count FROM evacuation_centers;
SELECT 'Flood Alerts Active' as info, COUNT(*) as count FROM flood_alerts WHERE is_active = true;

-- Success message
SELECT '✅ Database setup complete! Arko is ready for real-time data.' as message;