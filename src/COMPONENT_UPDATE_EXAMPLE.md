# 📝 Component Update Examples
## How to Convert Components from Mock to Real Data

---

## Example 1: Update WeatherDisplay Component

### **BEFORE (Mock Data):**
```typescript
// WeatherDisplay.tsx - OLD VERSION
const [weather, setWeather] = useState({
  temperature: 28,
  humidity: 75,
  condition: 'rainy'
});
```

### **AFTER (Real Data):**
```typescript
// WeatherDisplay.tsx - NEW VERSION
import { useEffect, useState } from 'react';
import { weatherService, WeatherData } from '../services/weatherService';

export function WeatherDisplay({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather on mount and every 5 minutes
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await weatherService.getCurrentWeather(latitude, longitude);
        setWeather(data);
        setError(null);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [latitude, longitude]);

  if (loading) {
    return <div>Loading weather...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!weather) {
    return <div>No weather data available</div>;
  }

  return (
    <div className="weather-display">
      <h3>Current Weather</h3>
      <p>Temperature: {weather.temperature}°C</p>
      <p>Humidity: {weather.humidity}%</p>
      <p>Wind: {weather.windSpeed} km/h</p>
      <p>Condition: {weather.condition}</p>
      {weather.precipitation > 0 && (
        <p className="text-orange-600">Rainfall: {weather.precipitation}mm/h</p>
      )}
    </div>
  );
}
```

---

## Example 2: Update AlertPanel Component

### **BEFORE (Mock Data):**
```typescript
// AlertPanel.tsx - OLD VERSION
const [alerts, setAlerts] = useState([
  {
    id: '1',
    severity: 'medium',
    location: 'Brgy. Poblacion',
    message: 'Flood alert'
  }
]);
```

### **AFTER (Real Data with Real-time Updates):**
```typescript
// AlertPanel.tsx - NEW VERSION
import { useEffect, useState } from 'react';
import { floodService, FloodAlert } from '../services/floodService';
import { supabase } from '../services/supabaseClient';

export function AlertPanel({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      const data = await floodService.getActiveAlerts(latitude, longitude, 10);
      setAlerts(data);
      setLoading(false);
    };

    fetchAlerts();
  }, [latitude, longitude]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!supabase) return;

    const channel = floodService.subscribeToAlerts((newAlert) => {
      // Check if alert is within radius
      const distance = calculateDistance(
        latitude,
        longitude,
        newAlert.latitude,
        newAlert.longitude
      );
      
      if (distance <= 10) {
        setAlerts((prev) => {
          // Update existing or add new
          const index = prev.findIndex((a) => a.id === newAlert.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = newAlert;
            return updated;
          }
          return [newAlert, ...prev];
        });

        // Show browser notification for critical alerts
        if (newAlert.severity === 'critical' && newAlert.is_active) {
          showNotification(newAlert);
        }
      }
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [latitude, longitude]);

  const showNotification = (alert: FloodAlert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 CRITICAL FLOOD ALERT', {
        body: `${alert.location}: Evacuate immediately!`,
        icon: '/arko-logo.png',
        badge: '/arko-logo.png',
        requireInteraction: true,
      });
    }
  };

  // Helper function to calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number) => degrees * (Math.PI / 180);

  if (loading) {
    return <div>Loading alerts...</div>;
  }

  return (
    <div className="alert-panel">
      <h2>Active Flood Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-green-600">No active alerts in your area</p>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-card severity-${alert.severity}`}
            >
              <div className="alert-header">
                <span className="severity-badge">{alert.severity.toUpperCase()}</span>
                <span className="location">{alert.location}</span>
              </div>
              {alert.water_level_cm && (
                <p>Water Level: {alert.water_level_cm}cm</p>
              )}
              {alert.time_to_impact_minutes && (
                <p className="text-red-600 font-bold">
                  ⏰ Impact in {alert.time_to_impact_minutes} minutes
                </p>
              )}
              <ul className="instructions">
                {alert.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ul>
              {alert.evacuation_center && (
                <p className="evacuation-info">
                  🏢 Evacuation Center: {alert.evacuation_center}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Example 3: Update CommunityReports Component

### **AFTER (Real Data with Supabase):**
```typescript
// CommunityReports.tsx - NEW VERSION
import { useEffect, useState } from 'react';
import { supabase, CommunityReport } from '../services/supabaseClient';

export function CommunityReports() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReport, setNewReport] = useState({
    description: '',
    report_type: 'flooding' as const,
    severity: 'medium' as const,
  });

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('community_reports')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching reports:', error);
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    fetchReports();

    // Subscribe to new reports
    if (supabase) {
      const channel = supabase
        .channel('community-reports-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'community_reports',
          },
          (payload) => {
            setReports((prev) => [payload.new as CommunityReport, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Submit new report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    // Get user location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const { data, error } = await supabase
          .from('community_reports')
          .insert({
            ...newReport,
            latitude,
            longitude,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            barangay: 'Auto-detected', // You can improve this with reverse geocoding
            user_id: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
            photo_urls: [],
            verification_count: 0,
            is_verified: false,
            status: 'active',
          })
          .select()
          .single();

        if (error) {
          alert('Error submitting report: ' + error.message);
        } else {
          alert('Report submitted successfully!');
          setNewReport({ description: '', report_type: 'flooding', severity: 'medium' });
        }
      },
      (error) => {
        alert('Please enable location access to submit reports');
      }
    );
  };

  return (
    <div className="community-reports">
      {/* Report Form */}
      <form onSubmit={handleSubmit} className="report-form">
        <h3>Submit a Report</h3>
        <select
          value={newReport.report_type}
          onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value as any })}
        >
          <option value="flooding">Flooding</option>
          <option value="road_closure">Road Closure</option>
          <option value="evacuation">Evacuation Needed</option>
          <option value="utility_damage">Utility Damage</option>
          <option value="missing_person">Missing Person</option>
        </select>

        <select
          value={newReport.severity}
          onChange={(e) => setNewReport({ ...newReport, severity: e.target.value as any })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <textarea
          value={newReport.description}
          onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
          placeholder="Describe the situation..."
          required
        />

        <button type="submit">Submit Report</button>
      </form>

      {/* Reports List */}
      <div className="reports-list">
        <h3>Community Reports</h3>
        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p>No reports yet</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <span className={`badge severity-${report.severity}`}>
                  {report.severity}
                </span>
                <span className="report-type">{report.report_type}</span>
                <span className="timestamp">
                  {new Date(report.created_at).toLocaleString()}
                </span>
              </div>
              <p className="location">{report.location}</p>
              <p className="description">{report.description}</p>
              {report.is_verified && (
                <span className="verified-badge">✓ Verified</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Example 4: Update App.tsx Main Component

### **Key Changes in App.tsx:**

```typescript
// App.tsx - UPDATED SECTIONS

import { weatherService } from './services/weatherService';
import { floodService } from './services/floodService';

function AppContent() {
  // ... existing state ...

  // REPLACE: Mock weather data initialization
  // OLD:
  // setWeatherData({ temperature: 28, humidity: 75, ... });
  
  // NEW:
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchInitialData = async () => {
      try {
        // Get real weather data
        const weather = await weatherService.getCurrentWeather(
          coordinates.latitude,
          coordinates.longitude
        );
        setWeatherData(weather);

        // Get real flood alerts
        const alerts = await floodService.getActiveAlerts(
          coordinates.latitude,
          coordinates.longitude,
          10
        );
        
        if (alerts.length > 0) {
          setCurrentAlert(alerts[0]); // Show most severe alert
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    // Set up periodic updates
    const weatherInterval = setInterval(async () => {
      const weather = await weatherService.getCurrentWeather(
        coordinates.latitude,
        coordinates.longitude
      );
      setWeatherData(weather);
    }, 5 * 60 * 1000); // Every 5 minutes

    const alertInterval = setInterval(async () => {
      const alerts = await floodService.getActiveAlerts(
        coordinates.latitude,
        coordinates.longitude,
        10
      );
      if (alerts.length > 0) {
        setCurrentAlert(alerts[0]);
      }
    }, 2 * 60 * 1000); // Every 2 minutes

    return () => {
      clearInterval(weatherInterval);
      clearInterval(alertInterval);
    };
  }, [isLoggedIn, coordinates.latitude, coordinates.longitude]);
}
```

---

## 🔄 Migration Checklist

For each component, follow these steps:

### **1. Import Services**
```typescript
import { weatherService } from '../services/weatherService';
import { floodService } from '../services/floodService';
import { supabase } from '../services/supabaseClient';
```

### **2. Add Loading & Error States**
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### **3. Fetch Data in useEffect**
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await service.getData();
      setData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [dependencies]);
```

### **4. Add Real-time Subscriptions**
```typescript
useEffect(() => {
  if (!supabase) return;
  
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', {...}, handleChange)
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, []);
```

### **5. Handle Loading & Error UI**
```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
if (!data) return <NoData />;
```

---

## 🎯 Next Steps

1. **Set up your environment variables** (`.env` file)
2. **Get your API keys** (OpenWeatherMap, Supabase)
3. **Create Supabase tables** (use SQL schema from guide)
4. **Test with simulation mode first** (before adding real keys)
5. **Update components one by one** (starting with WeatherDisplay)
6. **Add real-time subscriptions** (for live updates)
7. **Implement error handling** (for offline support)

When you're ready, provide your API keys and I'll update all the components for you!