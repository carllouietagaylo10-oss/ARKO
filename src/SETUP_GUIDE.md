# 🚀 Arko Real-Time Data Setup Guide
## Quick Start: From Mock Data to Live Data in 30 Minutes

---

## 📋 Prerequisites

- [ ] Node.js 16+ installed
- [ ] Git repository set up
- [ ] Basic understanding of React
- [ ] Text editor (VS Code recommended)

---

## 🎯 Quick Setup (5 Steps)

### **Step 1: Install Dependencies (2 minutes)**

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install types (if using TypeScript)
npm install -D @types/node
```

### **Step 2: Create Environment File (1 minute)**

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
# (we'll get these values in the next steps)
```

### **Step 3: Get API Keys (10 minutes)**

#### **3a. OpenWeatherMap API Key (FREE)**

1. Go to https://openweathermap.org/api
2. Click "Sign Up" → Create free account
3. Verify your email
4. Go to "API Keys" section
5. Copy your API key
6. Add to `.env`:
   ```env
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```

**✅ Free Tier Limits:**
- 1,000 API calls per day
- Current weather + 5-day forecast
- Perfect for Arko MVP!

---

#### **3b. Supabase Setup (FREE)**

1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub
3. Create new project:
   - **Project name:** arko-flood-alert
   - **Database password:** (create a strong password)
   - **Region:** Southeast Asia (Singapore) - closest to Philippines
   - **Pricing plan:** Free
4. Wait 2 minutes for project to initialize
5. Go to Project Settings → API
6. Copy:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **Anon/Public Key** (long string starting with "eyJ...")
7. Add to `.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

**✅ Free Tier Limits:**
- 500MB database
- 1GB file storage
- 2GB bandwidth
- Unlimited API requests
- Perfect for Arko!

---

### **Step 4: Create Database Tables (5 minutes)**

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- ===================================
-- ARKO DATABASE SCHEMA
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- FLOOD ALERTS TABLE
-- ===================================
CREATE TABLE flood_alerts (
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

CREATE INDEX idx_flood_alerts_active ON flood_alerts(is_active);
CREATE INDEX idx_flood_alerts_severity ON flood_alerts(severity);
CREATE INDEX idx_flood_alerts_barangay ON flood_alerts(barangay);

-- ===================================
-- COMMUNITY REPORTS TABLE
-- ===================================
CREATE TABLE community_reports (
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

CREATE INDEX idx_community_reports_type ON community_reports(report_type);
CREATE INDEX idx_community_reports_status ON community_reports(status);
CREATE INDEX idx_community_reports_barangay ON community_reports(barangay);
CREATE INDEX idx_community_reports_created ON community_reports(created_at DESC);

-- ===================================
-- EVACUATION CENTERS TABLE
-- ===================================
CREATE TABLE evacuation_centers (
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

CREATE INDEX idx_evacuation_centers_barangay ON evacuation_centers(barangay);
CREATE INDEX idx_evacuation_centers_operational ON evacuation_centers(is_operational);

-- ===================================
-- WEATHER DATA TABLE
-- ===================================
CREATE TABLE weather_data (
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

CREATE INDEX idx_weather_data_recorded_at ON weather_data(recorded_at DESC);
CREATE INDEX idx_weather_data_location ON weather_data(location);

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS on all tables
ALTER TABLE flood_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE evacuation_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

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
-- SAMPLE DATA
-- ===================================

-- Insert sample evacuation centers
INSERT INTO evacuation_centers (name, address, barangay, latitude, longitude, max_capacity, current_occupancy, contact_number, contact_person, facilities) VALUES
('Valencia City Hall', 'Poblacion, Valencia City', 'Poblacion', 7.9125, 125.0864, 500, 0, '+63-88-000-1111', 'Mayor Office', '{"medical": true, "food": true, "water": true, "electricity": true, "generators": true, "communications": true}'::jsonb),
('Lumbo Elementary School', 'Brgy. Lumbo, Valencia City', 'Lumbo', 7.9200, 125.0900, 300, 0, '+63-88-000-2222', 'Principal Office', '{"medical": false, "food": true, "water": true, "electricity": true, "generators": false, "communications": true}'::jsonb),
('San Carlos Multi-Purpose Hall', 'Brgy. San Carlos, Valencia City', 'San Carlos', 7.9050, 125.0800, 200, 0, '+63-88-000-3333', 'Barangay Captain', '{"medical": false, "food": true, "water": true, "electricity": true, "generators": true, "communications": true}'::jsonb);

-- Insert sample flood alert (for testing)
INSERT INTO flood_alerts (severity, location, barangay, latitude, longitude, water_level_cm, time_to_impact_minutes, evacuation_center, instructions, avoid_areas, is_active) VALUES
('medium', 'Riverside Area', 'Poblacion', 7.9125, 125.0864, 35, 45, 'Valencia City Hall', '["Monitor flood levels closely", "Prepare emergency supplies", "Move valuables to higher ground", "Stay tuned for updates"]'::jsonb, '["Riverside Road", "Lower Bridge Area", "Market Street"]'::jsonb, true);

-- Success message
SELECT 'Database setup complete! ✅' as status;
```

4. Click **Run** (or press Ctrl/Cmd + Enter)
5. Check for success message: "Database setup complete! ✅"

---

### **Step 5: Test the Integration (10 minutes)**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open browser to** `http://localhost:5173`

3. **Check browser console** - you should see:
   ```
   ✅ Supabase client initialized
   ⚠️ Weather Service: Using simulation mode or real API
   ```

4. **Test data fetching:**
   - Weather display should show real/simulated data
   - Map should load
   - Alerts should appear

5. **Enable location permission** when prompted

---

## 🧪 Testing Your Setup

### **Test 1: Weather API**

```javascript
// In browser console:
fetch('https://api.openweathermap.org/data/2.5/weather?lat=7.9125&lon=125.0864&appid=YOUR_KEY&units=metric')
  .then(r => r.json())
  .then(console.log)
```

**Expected:** Weather data for Valencia City

---

### **Test 2: Supabase Connection**

```javascript
// In browser console (after app loads):
const { data, error } = await supabase.from('flood_alerts').select('*').limit(1)
console.log('Supabase test:', data)
```

**Expected:** Array with sample flood alert

---

### **Test 3: Real-time Updates**

1. Open Supabase Dashboard → Table Editor
2. Go to **flood_alerts** table
3. Click **Insert row**
4. Fill in:
   - severity: "high"
   - location: "Test Location"
   - barangay: "Test Barangay"
   - latitude: 7.9125
   - longitude: 125.0864
   - is_active: true
5. Click **Save**
6. **Check your app** - new alert should appear automatically!

---

## 🎨 Visual Confirmation

When setup is successful, you should see:

✅ **Header shows:**
- "Valencia Active" badge (green dot)
- "LIVE" badge (orange)

✅ **Weather widget shows:**
- Real temperature for Valencia City
- Current conditions
- Wind speed, humidity
- Updates every 5 minutes

✅ **Alert panel shows:**
- Sample alert from database
- Real-time severity indicators
- Evacuation center information

✅ **Map displays:**
- Valencia City centered
- Flood zones (if any)
- Evacuation center markers

---

## 🐛 Troubleshooting

### **Issue: "Supabase not configured" warning**

**Solution:**
1. Check `.env` file exists in root directory
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Restart dev server: `npm run dev`

---

### **Issue: Weather data not loading**

**Solution:**
1. Check `VITE_OPENWEATHER_API_KEY` in `.env`
2. Verify API key is active at OpenWeatherMap dashboard
3. Check browser console for error messages
4. Test API key with curl:
   ```bash
   curl "https://api.openweathermap.org/data/2.5/weather?lat=7.9125&lon=125.0864&appid=YOUR_KEY"
   ```

---

### **Issue: Database tables not created**

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Check for error messages in query result
3. Try creating tables one by one
4. Verify UUID extension is enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

---

### **Issue: Location permission denied**

**Solution:**
1. Click lock icon in browser address bar
2. Allow location access
3. Refresh page
4. Or manually enter coordinates in settings

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     USER OPENS APP                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              LOGIN (Guest/Email/Emergency)               │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Browser    │  │ OpenWeather  │  │   Supabase   │
│  Geolocation │  │     API      │  │   Database   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                  │                  │
       │ Get Position     │ Fetch Weather    │ Fetch Alerts
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│              ARKO APP STATE (React)                      │
│  - User Location                                         │
│  - Weather Data (updates every 5 min)                   │
│  - Flood Alerts (real-time subscriptions)               │
│  - Community Reports                                     │
│  - Evacuation Centers                                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    DISPLAY TO USER                       │
│  ✅ Weather widget                                       │
│  ✅ Alert banners                                        │
│  ✅ Interactive map                                      │
│  ✅ Community reports                                    │
│  ✅ Evacuation routing                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Update Schedule

Once setup, Arko will automatically:

| Data Type | Update Frequency | Method |
|-----------|-----------------|---------|
| Weather | Every 5 minutes | API polling |
| Flood Alerts | Real-time | Supabase subscription |
| User Location | Every 30 seconds | Browser geolocation |
| Community Reports | Real-time | Supabase subscription |
| Evacuation Centers | On demand | Database query |

---

## 🎯 Next Steps After Setup

1. **Add sample data** to test features:
   - Create more evacuation centers
   - Add community reports
   - Test different alert severities

2. **Customize for Valencia City**:
   - Add actual barangay boundaries
   - Input real evacuation center data
   - Configure emergency contacts

3. **Enable features**:
   - Push notifications
   - SMS alerts (requires Twilio)
   - Photo uploads (requires Cloudinary)
   - Admin dashboard

4. **Deploy to production**:
   - See `DEPLOYMENT_GUIDE.md` (coming soon)
   - Configure domain
   - Set up CDN
   - Enable analytics

---

## 📞 Need Help?

If you encounter issues:

1. **Check the logs:**
   - Browser console (F12)
   - Supabase Dashboard → Logs
   - OpenWeatherMap Dashboard → Usage

2. **Verify credentials:**
   - Test API keys separately
   - Check `.env` file syntax
   - Ensure no trailing spaces

3. **Common fixes:**
   - Restart dev server
   - Clear browser cache
   - Check internet connection
   - Verify API rate limits

---

## ✅ Setup Complete!

When you see:
- ✅ Real weather data loading
- ✅ Database connection working
- ✅ Real-time updates functioning
- ✅ No console errors

**You're ready to use Arko with real-time data!**

Next: Read `REAL_TIME_DATA_INTEGRATION_GUIDE.md` for advanced features.