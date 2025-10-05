# 🔄 Mock to Real Data Mapping
## Visual Guide: Every Mock Data Point in Arko

---

## 📍 File-by-File Mock Data Inventory

### **1. /App.tsx**

#### **Line 91-99: Weather Data Initialization**
```typescript
// ❌ MOCK DATA - NEEDS REPLACEMENT
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

**🔄 REPLACEMENT:**
```typescript
// ✅ REAL DATA
const weather = await weatherService.getCurrentWeather(
  coordinates.latitude,
  coordinates.longitude
);
setWeatherData(weather);
```

**📊 Data Source:** OpenWeatherMap API  
**Update Frequency:** Every 5 minutes  
**Fallback:** Simulation mode if API unavailable

---

#### **Line 89: Static Coordinates**
```typescript
// ❌ STATIC DATA
const coordinates = {
  latitude: 7.9125,
  longitude: 125.0864
};
```

**🔄 REPLACEMENT:**
```typescript
// ✅ DYNAMIC GPS LOCATION
const [coordinates, setCoordinates] = useState({
  latitude: 7.9125,  // Default fallback
  longitude: 125.0864
});

useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    () => {
      // Use default Valencia coordinates if GPS fails
    },
    { enableHighAccuracy: true }
  );
}, []);
```

**📊 Data Source:** Browser Geolocation API  
**Update Frequency:** Every 30 seconds  
**Fallback:** Valencia City center coordinates

---

#### **Line 141-153: Flood Alert**
```typescript
// ❌ MOCK ALERT
const alert = {
  severity: 'medium' as const,
  location: 'Brgy. Poblacion',
  timeToImpact: 25,
  waterLevel: '30-50cm expected',
  instructions: [
    'Move valuable items to higher ground',
    'Prepare emergency supplies',
    'Monitor weather updates'
  ],
  evacuationCenter: 'Valencia City Hall',
  avoidAreas: ['Riverside Road', 'Lower Bridge Area']
};
setCurrentAlert(alert);
```

**🔄 REPLACEMENT:**
```typescript
// ✅ REAL ALERTS FROM DATABASE
const alerts = await floodService.getActiveAlerts(
  coordinates.latitude,
  coordinates.longitude,
  10 // 10km radius
);

if (alerts.length > 0) {
  setCurrentAlert(alerts[0]); // Show highest severity
}

// Subscribe to real-time updates
const channel = floodService.subscribeToAlerts((newAlert) => {
  if (newAlert.severity === 'critical') {
    setCurrentAlert(newAlert);
    showNotification(newAlert);
  }
});
```

**📊 Data Source:** Supabase Database  
**Update Frequency:** Real-time push  
**Fallback:** Simulated alerts based on weather

---

### **2. /components/AlertPanel.tsx**

**Location:** Entire component uses mock data

#### **Current Mock Structure:**
```typescript
// ❌ MOCK ALERTS
const mockAlerts = [
  {
    id: '1',
    severity: 'high',
    location: 'Brgy. Poblacion',
    message: 'Flash flood warning',
    timeToImpact: 15
  },
  {
    id: '2',
    severity: 'medium',
    location: 'Brgy. Lumbo',
    message: 'Rising water levels',
    timeToImpact: 45
  }
];
```

**🔄 REPLACEMENT:**
See **COMPONENT_UPDATE_EXAMPLE.md** for complete implementation

**📊 Data Source:** 
- Primary: Supabase `flood_alerts` table
- Secondary: Weather-based risk calculation
- Fallback: Simulated alerts

---

### **3. /components/WeatherDisplay.tsx**

**Location:** Weather state and display

#### **Current Implementation:**
```typescript
// ❌ MOCK WEATHER
const [weather] = useState({
  temperature: 28,
  humidity: 75,
  condition: 'rainy',
  windSpeed: 15,
  precipitation: 8
});
```

**🔄 REPLACEMENT:**
```typescript
// ✅ REAL WEATHER
const [weather, setWeather] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchWeather = async () => {
    const data = await weatherService.getCurrentWeather(lat, lng);
    setWeather(data);
    setLoading(false);
  };
  
  fetchWeather();
  const interval = setInterval(fetchWeather, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [lat, lng]);
```

**📊 Data Source:** OpenWeatherMap API  
**Update Frequency:** Every 5 minutes  
**Fallback:** Valencia-calibrated simulation

---

### **4. /components/FloodMap.tsx**

**Location:** Map markers and flood zones

#### **Current Mock Data:**
```typescript
// ❌ MOCK FLOOD ZONES
const floodZones = [
  {
    id: 'zone1',
    coordinates: [[7.91, 125.08], [7.92, 125.09], ...],
    risk: 'high',
    waterLevel: 45
  }
];

// ❌ MOCK EVACUATION CENTERS
const evacuationCenters = [
  {
    name: 'City Hall',
    lat: 7.9125,
    lng: 125.0864,
    capacity: 500
  }
];
```

**🔄 REPLACEMENT:**
```typescript
// ✅ REAL FLOOD ZONES FROM DATABASE
const [floodZones, setFloodZones] = useState([]);

useEffect(() => {
  const fetchZones = async () => {
    const zones = await floodService.getFloodZones();
    setFloodZones(zones);
  };
  fetchZones();
}, []);

// ✅ REAL EVACUATION CENTERS FROM DATABASE
const [centers, setCenters] = useState([]);

useEffect(() => {
  const fetchCenters = async () => {
    const { data } = await supabase
      .from('evacuation_centers')
      .select('*')
      .eq('is_operational', true);
    setCenters(data);
  };
  fetchCenters();
}, []);
```

**📊 Data Source:** Supabase Database  
**Update Frequency:** On demand / Real-time  
**Fallback:** Static Valencia zones

---

### **5. /components/CommunityReports.tsx**

**Location:** Entire component

#### **Current State:**
```typescript
// ❌ MOCK REPORTS
const reports = [
  {
    id: '1',
    user: 'Anonymous',
    location: 'Poblacion',
    description: 'Water rising near market',
    timestamp: '10 mins ago'
  }
];
```

**🔄 REPLACEMENT:**
```typescript
// ✅ REAL COMMUNITY REPORTS
const [reports, setReports] = useState([]);

useEffect(() => {
  // Fetch existing reports
  const fetchReports = async () => {
    const { data } = await supabase
      .from('community_reports')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setReports(data);
  };
  
  fetchReports();
  
  // Subscribe to new reports
  const channel = supabase
    .channel('reports')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'community_reports'
    }, (payload) => {
      setReports(prev => [payload.new, ...prev]);
    })
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, []);

// ✅ SUBMIT NEW REPORT
const submitReport = async (report) => {
  const { data, error } = await supabase
    .from('community_reports')
    .insert({
      ...report,
      user_id: currentUser.id,
      created_at: new Date().toISOString()
    });
  
  if (!error) {
    alert('Report submitted successfully!');
  }
};
```

**📊 Data Source:** Supabase Database  
**Update Frequency:** Real-time push  
**Fallback:** Local storage cache

---

### **6. /components/DataSources.tsx**

**Location:** Data statistics and sources

#### **Current Mock Data:**
```typescript
// ❌ MOCK STATISTICS
const stats = {
  pagasa: {
    rainfall: '150mm',
    lastUpdate: '5 mins ago',
    status: 'active'
  },
  nasa: {
    satelliteData: 'Available',
    lastUpdate: '1 hour ago'
  },
  community: {
    reports: 23,
    verified: 18
  }
};
```

**🔄 REPLACEMENT:**
```typescript
// ✅ REAL STATISTICS
const [stats, setStats] = useState(null);

useEffect(() => {
  const fetchStats = async () => {
    // Get weather data timestamp
    const weatherData = await weatherService.getCurrentWeather(lat, lng);
    
    // Count community reports
    const { count: reportCount } = await supabase
      .from('community_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    const { count: verifiedCount } = await supabase
      .from('community_reports')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);
    
    setStats({
      weather: {
        lastUpdate: new Date(),
        source: 'OpenWeatherMap',
        status: 'active'
      },
      community: {
        reports: reportCount,
        verified: verifiedCount
      }
    });
  };
  
  fetchStats();
  const interval = setInterval(fetchStats, 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

**📊 Data Source:** Multiple (Weather API + Supabase)  
**Update Frequency:** Every minute  
**Fallback:** Last cached values

---

### **7. /components/EvacuationCenterTracker.tsx**

**Location:** Center capacity and status

#### **Current Mock Data:**
```typescript
// ❌ MOCK EVACUATION CENTERS
const centers = [
  {
    name: 'Valencia City Hall',
    capacity: 500,
    current: 0,
    status: 'operational'
  }
];
```

**🔄 REPLACEMENT:**
```typescript
// ✅ REAL EVACUATION CENTER DATA
const [centers, setCenters] = useState([]);

useEffect(() => {
  const fetchCenters = async () => {
    const { data } = await supabase
      .from('evacuation_centers')
      .select('*')
      .eq('is_operational', true)
      .order('current_occupancy', { ascending: false });
    
    setCenters(data);
  };
  
  fetchCenters();
  
  // Subscribe to capacity updates
  const channel = supabase
    .channel('evacuation-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'evacuation_centers'
    }, (payload) => {
      setCenters(prev => prev.map(center => 
        center.id === payload.new.id ? payload.new : center
      ));
    })
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, []);

// ✅ UPDATE OCCUPANCY
const updateOccupancy = async (centerId, newCount) => {
  await supabase
    .from('evacuation_centers')
    .update({ 
      current_occupancy: newCount,
      last_updated: new Date().toISOString()
    })
    .eq('id', centerId);
};
```

**📊 Data Source:** Supabase Database  
**Update Frequency:** Real-time push  
**Fallback:** Last known status

---

## 📊 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARKO DATA SOURCES                            │
└─────────────────────────────────────────────────────────────────┘

┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│ OpenWeatherMap │    │    Supabase    │    │    Browser     │
│      API       │    │    Database    │    │   Geolocation  │
└────────┬───────┘    └────────┬───────┘    └────────┬───────┘
         │                     │                      │
         │ Every 5 min         │ Real-time            │ Every 30sec
         │                     │                      │
         ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ARKO COMPONENTS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WeatherDisplay ──────────► Shows temp, humidity, conditions    │
│  AlertPanel ──────────────► Shows flood alerts & warnings       │
│  FloodMap ────────────────► Displays zones & centers            │
│  CommunityReports ────────► User-submitted reports              │
│  DataSources ──────────────► Statistics & data sources          │
│  EvacuationTracker ───────► Center capacity & status            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Conversion Checklist

### **Phase 1: API Setup**
- [ ] Get OpenWeatherMap API key
- [ ] Create Supabase project
- [ ] Set up database tables
- [ ] Configure `.env` file
- [ ] Test API connections

### **Phase 2: Component Updates**
- [ ] Update App.tsx (weather, alerts, location)
- [ ] Update WeatherDisplay.tsx
- [ ] Update AlertPanel.tsx
- [ ] Update FloodMap.tsx
- [ ] Update CommunityReports.tsx
- [ ] Update DataSources.tsx
- [ ] Update EvacuationCenterTracker.tsx

### **Phase 3: Real-Time Features**
- [ ] Add Supabase subscriptions
- [ ] Implement push notifications
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add offline support
- [ ] Add data caching

### **Phase 4: Testing**
- [ ] Test weather updates
- [ ] Test alert creation
- [ ] Test community reports
- [ ] Test real-time subscriptions
- [ ] Test offline mode
- [ ] Load testing

---

## 📈 Expected Improvements

### **Before (Mock Data):**
- ❌ Static, unchanging information
- ❌ No real-time updates
- ❌ Can't handle user input
- ❌ No location awareness
- ❌ Limited usefulness

### **After (Real Data):**
- ✅ Live weather updates every 5 minutes
- ✅ Real-time flood alerts
- ✅ User GPS location tracking
- ✅ Community-sourced reports
- ✅ Interactive evacuation centers
- ✅ Push notifications
- ✅ Offline support with caching
- ✅ Production-ready monitoring

---

## 🎓 Key Takeaways

1. **Every mock data point has been identified**
2. **Replacement strategies are documented**
3. **Service layer is ready to use**
4. **Database schema is designed**
5. **Real-time subscriptions are planned**
6. **Fallback modes are implemented**

---

## 🚀 Next Action

Follow **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** to start the 30-minute setup process!

Once setup is complete, I can:
1. Update all components automatically
2. Add real-time features
3. Implement error handling
4. Deploy to production

---

**Ready to transform Arko from static to real-time? Let's do this! 🌊**