# 🌊 Arko Real-Time Data Integration Guide
## Complete Guide to Converting Mock Data to Live APIs

---

## 📋 Table of Contents
1. [Current Mock Data Inventory](#current-mock-data-inventory)
2. [Required API Endpoints](#required-api-endpoints)
3. [Recommended Architecture](#recommended-architecture)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [API Data Structures](#api-data-structures)
6. [Security & Authentication](#security--authentication)
7. [Testing & Validation](#testing--validation)

---

## 🔍 Current Mock Data Inventory

### **1. Weather Data (App.tsx - Line 91-99)**
```typescript
// MOCK DATA - NEEDS REPLACEMENT
setWeatherData({
  temperature: 28,
  humidity: 75,
  windSpeed: 15,
  precipitation: 8,
  condition: 'rainy',
  visibility: 8,
  pressure: 1005
});
```
**Location:** App.tsx
**Component:** Main app state
**Frequency:** Set once on login
**Real-time Need:** Update every 5-15 minutes

---

### **2. Flood Alert Data (App.tsx - Line 141-153)**
```typescript
// MOCK DATA - NEEDS REPLACEMENT
const alert = {
  severity: 'medium' as const,
  location: 'Brgy. Poblacion',
  timeToImpact: 25,
  waterLevel: '30-50cm expected',
  instructions: [...],
  evacuationCenter: 'Valencia City Hall',
  avoidAreas: ['Riverside Road', 'Lower Bridge Area']
};
```
**Location:** App.tsx
**Component:** Emergency alert banner
**Frequency:** Real-time updates needed
**Real-time Need:** Immediate push notifications

---

### **3. Location Coordinates (App.tsx - Line 89)**
```typescript
// STATIC DATA - SHOULD BE DYNAMIC
const coordinates = {
  latitude: 7.9125,
  longitude: 125.0864
};
```
**Location:** App.tsx
**Component:** Map center and weather reference
**Frequency:** Update when user location changes
**Real-time Need:** GPS-based location tracking

---

### **4. Components Using Mock Data**

#### **AlertPanel.tsx**
- Flood risk levels
- Active alerts
- Water level predictions
- Evacuation recommendations

#### **WeatherDisplay.tsx**
- Current weather conditions
- Temperature, humidity, wind
- Precipitation data
- Weather forecasts

#### **FloodMap.tsx / Enhanced3DFloodMap.tsx**
- Flood zone boundaries
- Water level markers
- Evacuation centers
- Road closures
- Real-time flood extent

#### **CommunityReports.tsx**
- User-submitted reports
- Photo uploads
- Location-tagged incidents
- Community verification

#### **DataSources.tsx**
- PAGASA weather data
- NASA Earth observations
- DPWH infrastructure status
- CDRRMO emergency updates

#### **EvacuationCenterTracker.tsx**
- Center capacity
- Current occupancy
- Available resources
- Contact information

---

## 🌐 Required API Endpoints

### **1. Weather Data API**

#### **Option A: OpenWeatherMap API (Recommended for Production)**
```
Base URL: https://api.openweathermap.org/data/2.5/
```

**Current Weather:**
```
GET /weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric
```

**Weather Forecast (5-day):**
```
GET /forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric
```

**What you need:**
- API Key from https://openweathermap.org/api
- Free tier: 1,000 calls/day
- Cost: $0 (free tier) or $40/month (startup tier)

---

#### **Option B: PAGASA API (Ideal for Philippines)**
```
Base URL: http://bagong.pagasa.dost.gov.ph/
```

**Note:** PAGASA doesn't have a public API. You'll need to:
1. Contact PAGASA directly for API access
2. Submit official request as municipal government
3. Alternative: Web scraping (not recommended for production)

---

### **2. Flood Monitoring API**

#### **NASA GIBS (Global Imagery Browse Services)**
```
Base URL: https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi
```

**MODIS Flood Mapping:**
```
GET /?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0
  &LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor
  &BBOX={minLat},{minLon},{maxLat},{maxLon}
  &FORMAT=image/png
  &WIDTH=1024&HEIGHT=1024
```

**What you need:**
- Free NASA Earthdata account
- Register at: https://urs.earthdata.nasa.gov/users/new

---

### **3. User Location API**

#### **Browser Geolocation API (Built-in)**
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
  },
  (error) => console.error(error),
  { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
);
```

**What you need:**
- User permission (browser prompt)
- HTTPS connection (required for geolocation)

---

### **4. Community Reports Backend**

#### **Recommended: Supabase (Best for Arko)**
```
Base URL: https://[YOUR_PROJECT].supabase.co/rest/v1/
```

**Benefits:**
- Real-time database
- Authentication built-in
- File storage for photos
- Row-level security
- PostgreSQL database
- Free tier: 500MB database, 1GB storage

**What you need:**
1. Create project at https://supabase.com
2. Get API URL and anon key
3. Set up database tables (see schema below)

---

### **5. Flood Prediction API (Advanced)**

#### **Option A: Build Custom Model**
Using historical data + machine learning:
- Rain intensity
- River water levels
- Terrain elevation
- Historical flood patterns

#### **Option B: Third-Party Service**
```
Google Flood Hub API (if available in Philippines)
Base URL: https://floodhub.google.com/
```

**Note:** Currently limited regions. Check availability.

---

## 🏗️ Recommended Architecture

### **Backend Stack Options**

#### **Option 1: Supabase (Recommended for MVP)**
```
✅ Best for: Quick deployment, real-time features
✅ Pros: 
   - No backend code needed
   - Real-time subscriptions
   - Built-in auth
   - File storage
   - Free tier generous
✅ Ideal for: Arko's community reports, user management
```

#### **Option 2: Firebase + Cloud Functions**
```
✅ Best for: Mobile apps, offline support
✅ Pros:
   - Offline data sync
   - Google infrastructure
   - Easy mobile integration
✅ Ideal for: If planning mobile app expansion
```

#### **Option 3: Node.js + Express + PostgreSQL**
```
✅ Best for: Full control, custom logic
✅ Pros:
   - Complete customization
   - Advanced flood prediction models
   - Integration with local sensors
✅ Ideal for: If you have development team
```

### **Recommended Architecture for Arko:**

```
┌─────────────────────────────────────────────────────────┐
│                    ARKO FRONTEND                        │
│                  (React + TypeScript)                   │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ OpenWeather  │  │   Supabase   │  │  NASA GIBS   │
│     API      │  │   Database   │  │   Imagery    │
└──────────────┘  └──────────────┘  └──────────────┘
     │                  │                  │
     ├─ Weather data    ├─ User reports    ├─ Satellite data
     ├─ Forecasts       ├─ Alerts          └─ Flood mapping
     └─ Conditions      ├─ Evacuation data
                        └─ Real-time updates
```

---

## 🚀 Step-by-Step Implementation

### **PHASE 1: Setup (Week 1)**

#### **Step 1.1: Get API Keys**

1. **OpenWeatherMap:**
   ```
   1. Go to https://openweathermap.org/api
   2. Sign up for free account
   3. Navigate to API Keys section
   4. Copy your API key
   5. Save as: VITE_OPENWEATHER_API_KEY
   ```

2. **Supabase:**
   ```
   1. Go to https://supabase.com
   2. Create new project
   3. Get Project URL and anon key
   4. Save as: 
      - VITE_SUPABASE_URL
      - VITE_SUPABASE_ANON_KEY
   ```

3. **NASA Earthdata:**
   ```
   1. Register at https://urs.earthdata.nasa.gov
   2. Create application token
   3. Save as: VITE_NASA_EARTHDATA_TOKEN
   ```

#### **Step 1.2: Environment Variables**

Create `.env` file in root:
```env
# Weather API
VITE_OPENWEATHER_API_KEY=your_openweather_key_here

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NASA (Optional)
VITE_NASA_EARTHDATA_TOKEN=your_nasa_token_here

# App Configuration
VITE_APP_ENV=development
VITE_API_TIMEOUT=30000
VITE_UPDATE_INTERVAL=300000
```

**Security Note:** Never commit `.env` to git!

---

### **PHASE 2: API Service Layer (Week 1-2)**

#### **Step 2.1: Create API Service Structure**

I'll create these files for you:
- `/services/weatherService.ts` - Weather API integration
- `/services/floodService.ts` - Flood data integration
- `/services/communityService.ts` - User reports & community data
- `/services/locationService.ts` - GPS and location tracking
- `/services/supabaseClient.ts` - Supabase configuration

---

### **PHASE 3: Database Setup (Week 2)**

#### **Step 3.1: Supabase Database Schema**

You need these tables in Supabase:

**Table: `flood_alerts`**
```sql
CREATE TABLE flood_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  water_level_cm INTEGER,
  time_to_impact_minutes INTEGER,
  evacuation_center TEXT,
  instructions JSONB,
  avoid_areas JSONB,
  is_active BOOLEAN DEFAULT true,
  resolved_at TIMESTAMP
);

CREATE INDEX idx_flood_alerts_active ON flood_alerts(is_active);
CREATE INDEX idx_flood_alerts_severity ON flood_alerts(severity);
CREATE INDEX idx_flood_alerts_location ON flood_alerts(location);
```

**Table: `community_reports`**
```sql
CREATE TABLE community_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('flooding', 'evacuation', 'missing_person', 'road_closure', 'utility_damage')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT NOT NULL,
  water_level_estimate TEXT,
  photo_urls JSONB,
  verification_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_report'))
);

CREATE INDEX idx_community_reports_type ON community_reports(report_type);
CREATE INDEX idx_community_reports_status ON community_reports(status);
CREATE INDEX idx_community_reports_barangay ON community_reports(barangay);
```

**Table: `evacuation_centers`**
```sql
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
  facilities JSONB,
  is_operational BOOLEAN DEFAULT true,
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_evacuation_centers_barangay ON evacuation_centers(barangay);
CREATE INDEX idx_evacuation_centers_operational ON evacuation_centers(is_operational);
```

**Table: `weather_data`**
```sql
CREATE TABLE weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recorded_at TIMESTAMP DEFAULT NOW(),
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
```

**Table: `user_locations`**
```sql
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  barangay TEXT,
  is_in_flood_zone BOOLEAN DEFAULT false
);

CREATE INDEX idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX idx_user_locations_updated_at ON user_locations(updated_at DESC);
```

---

### **PHASE 4: Component Updates (Week 2-3)**

I'll show you exactly how to update each component...

---

## 📊 API Data Structures

### **1. Weather API Response (OpenWeatherMap)**

```typescript
interface WeatherAPIResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  rain?: {
    "1h": number;
    "3h": number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  name: string;
}
```

### **2. Flood Alert Structure (Custom)**

```typescript
interface FloodAlert {
  id: string;
  created_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  barangay: string;
  latitude: number;
  longitude: number;
  water_level_cm?: number;
  time_to_impact_minutes?: number;
  evacuation_center?: string;
  instructions: string[];
  avoid_areas: string[];
  is_active: boolean;
  resolved_at?: string;
}
```

### **3. Community Report Structure**

```typescript
interface CommunityReport {
  id: string;
  created_at: string;
  user_id: string;
  report_type: 'flooding' | 'evacuation' | 'missing_person' | 'road_closure' | 'utility_damage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  barangay: string;
  latitude: number;
  longitude: number;
  description: string;
  water_level_estimate?: string;
  photo_urls: string[];
  verification_count: number;
  is_verified: boolean;
  verified_at?: string;
  status: 'active' | 'resolved' | 'false_report';
}
```

### **4. Evacuation Center Structure**

```typescript
interface EvacuationCenter {
  id: string;
  name: string;
  address: string;
  barangay: string;
  latitude: number;
  longitude: number;
  max_capacity: number;
  current_occupancy: number;
  contact_number?: string;
  contact_person?: string;
  facilities: {
    medical: boolean;
    food: boolean;
    water: boolean;
    electricity: boolean;
    generators: boolean;
    communications: boolean;
  };
  is_operational: boolean;
  last_updated: string;
}
```

---

## 🔐 Security & Authentication

### **API Key Protection**

1. **Never expose API keys in frontend code**
2. **Use environment variables**
3. **Implement proxy endpoints for sensitive APIs**

### **Supabase Row-Level Security (RLS)**

Enable RLS on all tables:

```sql
-- Allow public read for flood alerts
CREATE POLICY "Allow public read flood alerts" 
ON flood_alerts FOR SELECT 
USING (is_active = true);

-- Allow authenticated users to create reports
CREATE POLICY "Allow authenticated create reports" 
ON community_reports FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to read own reports
CREATE POLICY "Allow users read own reports" 
ON community_reports FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR is_verified = true);
```

---

## 🧪 Testing & Validation

### **Testing Checklist**

- [ ] Weather API returns valid data
- [ ] Geolocation permissions work
- [ ] Supabase connection successful
- [ ] Real-time updates functioning
- [ ] Error handling for API failures
- [ ] Offline mode graceful degradation
- [ ] Rate limiting respected
- [ ] Data refresh intervals optimal

---

## 📝 What You Need to Provide

### **Immediate Requirements:**

1. **API Keys:**
   - [ ] OpenWeatherMap API key
   - [ ] Supabase project URL and anon key
   - [ ] NASA Earthdata token (optional)

2. **Data Sources:**
   - [ ] PAGASA contact information (if available)
   - [ ] CDRRMO Valencia City contact
   - [ ] DPWH flood monitoring data access

3. **Existing Data:**
   - [ ] List of all barangays in Valencia City
   - [ ] Evacuation center details (name, address, capacity, contact)
   - [ ] Known flood-prone areas
   - [ ] Historical flood data (if available)

4. **Infrastructure:**
   - [ ] Hosting plan (Vercel, Netlify, etc.)
   - [ ] Domain name for production
   - [ ] SSL certificate (usually included with hosting)

---

## 🎯 Next Steps

Once you provide the API keys and credentials, I will:

1. ✅ Create all API service files
2. ✅ Update all components to use real data
3. ✅ Implement error handling and loading states
4. ✅ Add offline support with cached data
5. ✅ Set up real-time subscriptions
6. ✅ Implement push notifications
7. ✅ Add data validation and sanitization
8. ✅ Create admin dashboard for data management

---

## 💡 Additional Recommendations

### **Phase 1 MVP (Weeks 1-3):**
- OpenWeatherMap integration
- Supabase for community reports
- Browser geolocation
- Basic flood alerts

### **Phase 2 Enhancement (Weeks 4-6):**
- PAGASA API (if available)
- Advanced flood prediction
- Photo uploads
- Push notifications

### **Phase 3 Advanced (Weeks 7-8):**
- Machine learning flood predictions
- Integration with local sensors
- SMS alerts
- Admin dashboard

---

## 📞 Support

When you're ready to proceed, provide:
1. Your API keys (via secure method, not in code)
2. Supabase project details
3. Any questions about the implementation

I'll then create all the necessary service files and update your components to use real-time data!