// Real API Service for Live Data Integration
// CONFIGURATION: Update the API_BASE_URL with your actual API base URL

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'evacuation_center' | 'flood_zone' | 'weather_station' | 'landmark';
  properties: {
    capacity?: number;
    current_occupancy?: number;
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'operational' | 'full' | 'closed';
    description?: string;
    contact_number?: string;
    updated_at?: string;
  };
}

interface AlertData {
  id: string;
  type: 'flood' | 'weather' | 'evacuation' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    area_name: string;
    radius_km: number;
  };
  status: 'active' | 'resolved' | 'monitoring';
  created_at: string;
  expires_at?: string;
  properties: {
    water_level_cm?: number;
    wind_speed_kmh?: number;
    rainfall_mm?: number;
    affected_areas?: string[];
    instructions?: string[];
    evacuation_required?: boolean;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

class RealApiService {
  private config: ApiConfig;

  constructor() {
    // TODO: REPLACE WITH YOUR ACTUAL API BASE URL
    // Example: 'https://your-api-domain.com' or 'https://api.valencia-flood.com'
    const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 
                        'YOUR_API_BASE_URL_HERE';

    this.config = {
      baseUrl: API_BASE_URL,
      timeout: 15000, // 15 seconds for real API calls
      retryAttempts: 3
    };

    // Log current configuration
    console.log('🌐 Real API Service initialized:', {
      baseUrl: this.config.baseUrl,
      isConfigured: this.config.baseUrl !== 'YOUR_API_BASE_URL_HERE'
    });
  }

  // Set the API base URL dynamically (call this with your actual API URL)
  setApiBaseUrl(baseUrl: string) {
    this.config.baseUrl = baseUrl;
    console.log('🔄 API Base URL updated:', baseUrl);
  }

  // Check if API is properly configured
  isConfigured(): boolean {
    return this.config.baseUrl !== 'YOUR_API_BASE_URL_HERE' && 
           this.config.baseUrl.startsWith('http');
  }

  // Generic API request method with retry logic
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!this.isConfigured()) {
      console.warn('⚠️ API not configured, using fallback data');
      throw new Error('API not configured');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Add any additional headers your API requires
            // 'Authorization': 'Bearer YOUR_API_TOKEN',
            // 'X-API-Key': 'YOUR_API_KEY',
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
          success: true,
          data: data.data || data, // Handle different response formats
          pagination: data.pagination
        };

      } catch (error) {
        console.warn(`🔄 API request attempt ${attempt}/${this.config.retryAttempts} failed:`, error);
        
        if (attempt === this.config.retryAttempts) {
          return {
            success: false,
            data: [] as any,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return {
      success: false,
      data: [] as any,
      error: 'All retry attempts failed'
    };
  }

  // Get locations for map markers (YOUR ENDPOINT: /api/locations)
  async getLocations(params?: {
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    type?: string;
    limit?: number;
    page?: number;
  }): Promise<LocationData[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.latitude) queryParams.append('lat', params.latitude.toString());
      if (params?.longitude) queryParams.append('lng', params.longitude.toString());
      if (params?.radius_km) queryParams.append('radius', params.radius_km.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const endpoint = `/api/locations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.makeRequest<LocationData[]>(endpoint);

      if (response.success) {
        console.log('✅ Locations loaded from real API:', response.data.length);
        return response.data;
      } else {
        console.error('❌ Failed to load locations from API:', response.error);
        return this.getFallbackLocations();
      }
    } catch (error) {
      console.error('Error fetching locations from API:', error);
      return this.getFallbackLocations();
    }
  }

  // Get alerts for map overlays (YOUR ENDPOINT: /api/alerts)
  async getAlerts(params?: {
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    type?: string;
    severity?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<AlertData[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.latitude) queryParams.append('lat', params.latitude.toString());
      if (params?.longitude) queryParams.append('lng', params.longitude.toString());
      if (params?.radius_km) queryParams.append('radius', params.radius_km.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.severity) queryParams.append('severity', params.severity);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const endpoint = `/api/alerts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.makeRequest<AlertData[]>(endpoint);

      if (response.success) {
        console.log('✅ Alerts loaded from real API:', response.data.length);
        return response.data;
      } else {
        console.error('❌ Failed to load alerts from API:', response.error);
        return this.getFallbackAlerts();
      }
    } catch (error) {
      console.error('Error fetching alerts from API:', error);
      return this.getFallbackAlerts();
    }
  }

  // Post new location data (YOUR ENDPOINT: POST /api/locations)
  async createLocation(locationData: Omit<LocationData, 'id'>): Promise<LocationData | null> {
    try {
      const response = await this.makeRequest<LocationData>('/api/locations', {
        method: 'POST',
        body: JSON.stringify(locationData)
      });

      if (response.success) {
        console.log('✅ Location created via API:', response.data);
        return response.data;
      } else {
        console.error('❌ Failed to create location via API:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error creating location via API:', error);
      return null;
    }
  }

  // Post new alert data (YOUR ENDPOINT: POST /api/alerts)
  async createAlert(alertData: Omit<AlertData, 'id' | 'created_at'>): Promise<AlertData | null> {
    try {
      const response = await this.makeRequest<AlertData>('/api/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData)
      });

      if (response.success) {
        console.log('✅ Alert created via API:', response.data);
        return response.data;
      } else {
        console.error('❌ Failed to create alert via API:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error creating alert via API:', error);
      return null;
    }
  }

  // Update alert status (YOUR ENDPOINT: PUT /api/alerts/{id})
  async updateAlert(alertId: string, updates: Partial<AlertData>): Promise<AlertData | null> {
    try {
      const response = await this.makeRequest<AlertData>(`/api/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      if (response.success) {
        console.log('✅ Alert updated via API:', response.data);
        return response.data;
      } else {
        console.error('❌ Failed to update alert via API:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error updating alert via API:', error);
      return null;
    }
  }

  // Delete alert (YOUR ENDPOINT: DELETE /api/alerts/{id})
  async deleteAlert(alertId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ deleted: boolean }>(`/api/alerts/${alertId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        console.log('✅ Alert deleted via API:', alertId);
        return true;
      } else {
        console.error('❌ Failed to delete alert via API:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting alert via API:', error);
      return false;
    }
  }

  // Check API health (YOUR ENDPOINT: GET /api/health)
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ status: string; version?: string }>('/api/health');
      const isHealthy = response.success && (response.data.status === 'ok' || response.data.status === 'healthy');
      
      if (isHealthy) {
        console.log('✅ API health check passed:', response.data.status);
      } else {
        console.warn('⚠️ API health check failed:', response.data);
      }
      
      return isHealthy;
    } catch (error) {
      console.warn('❌ API health check failed:', error);
      return false;
    }
  }

  // Get API configuration
  getConfig(): ApiConfig & { configured: boolean } {
    return { 
      ...this.config,
      configured: this.isConfigured()
    };
  }

  // Fallback data for when API is unavailable (Valencia City specific)
  private getFallbackLocations(): LocationData[] {
    console.log('📍 Using fallback location data for Valencia City');
    return [
      {
        id: 'fallback-valencia-gym',
        name: 'Valencia City Gymnasium',
        latitude: 7.9135,
        longitude: 125.0874,
        type: 'evacuation_center',
        properties: {
          capacity: 500,
          current_occupancy: 45,
          status: 'operational',
          description: 'Primary evacuation center with full facilities',
          contact_number: '+63956-135-2663'
        }
      },
      {
        id: 'fallback-valencia-hall',
        name: 'Valencia City Hall',
        latitude: 7.9115,
        longitude: 125.0854,
        type: 'evacuation_center',
        properties: {
          capacity: 300,
          current_occupancy: 12,
          status: 'operational',
          description: 'Secondary evacuation center',
          contact_number: '+63956-135-2663'
        }
      },
      {
        id: 'fallback-valencia-school',
        name: 'Valencia Central School',
        latitude: 7.9145,
        longitude: 125.0844,
        type: 'evacuation_center',
        properties: {
          capacity: 250,
          current_occupancy: 8,
          status: 'operational',
          description: 'School-based evacuation center',
          contact_number: '+63956-135-2663'
        }
      }
    ];
  }

  private getFallbackAlerts(): AlertData[] {
    console.log('⚠️ Using fallback alert data for Valencia City');
    return [
      {
        id: 'fallback-flood-alert',
        type: 'flood',
        severity: 'medium',
        title: 'Moderate Flood Risk - Valencia City',
        description: 'Current rainfall levels indicate potential flooding in low-lying areas of Valencia City',
        location: {
          latitude: 7.9125,
          longitude: 125.0864,
          area_name: 'Valencia City, Bukidnon',
          radius_km: 5
        },
        status: 'active',
        created_at: new Date().toISOString(),
        properties: {
          water_level_cm: 30,
          rainfall_mm: 15,
          affected_areas: ['Riverside Road', 'Lower Bridge Area', 'Poblacion Low Area'],
          instructions: [
            'Avoid low-lying areas and bridges',
            'Monitor weather updates regularly',
            'Prepare emergency supplies and evacuation kit',
            'Stay in contact with family members'
          ],
          evacuation_required: false
        }
      }
    ];
  }
}

// Export singleton instance
export const realApiService = new RealApiService();
export type { LocationData, AlertData, ApiResponse };

// QUICK SETUP INSTRUCTIONS:
// 1. Replace 'YOUR_API_BASE_URL_HERE' with your actual API base URL
// 2. Add your API URL to .env file as VITE_API_BASE_URL=https://your-api.com
// 3. Update API headers if your API requires authentication
// 4. Test endpoints: /api/locations and /api/alerts
// 5. Verify response format matches LocationData and AlertData interfaces

console.log(`
🔧 REAL API SERVICE SETUP REQUIRED:
   
   Current API URL: ${realApiService.getConfig().baseUrl}
   Status: ${realApiService.isConfigured() ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}

   TO CONFIGURE:
   1. Update API_BASE_URL in /services/realApiService.ts
   2. Or add VITE_API_BASE_URL to your .env file
   3. Ensure your endpoints match:
      - GET /api/locations (returns coordinates and data for markers)
      - GET /api/alerts (returns flood/event information for overlays)
      - POST /api/locations (create new location)
      - POST /api/alerts (create new alert)
      - GET /api/health (health check)
`);