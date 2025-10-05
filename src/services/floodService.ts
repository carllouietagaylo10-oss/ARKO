/**
 * Flood Service
 * Handles flood alerts, monitoring, and predictions
 */

import { supabase, FloodAlert } from './supabaseClient';

export interface FloodRiskLevel {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  color: string;
  description: string;
}

export interface FloodZone {
  id: string;
  barangay: string;
  coordinates: [number, number][];
  risk_level: 'low' | 'medium' | 'high';
  water_level_cm?: number;
}

class FloodService {
  private useSimulation: boolean;

  constructor() {
    this.useSimulation = !supabase.isReady() || (import.meta.env.VITE_USE_FLOOD_SIMULATION === 'true');
    
    if (this.useSimulation) {
      // Only show once to reduce console noise
      if (!localStorage.getItem('flood_simulation_warning_shown')) {
        console.warn('⚠️ Flood Service: Using simulation mode. Configure Supabase for real data.');
        localStorage.setItem('flood_simulation_warning_shown', 'true');
      }
    } else {
      console.log('✅ Flood Service: Initialized with Supabase database');
    }
  }

  /**
   * Get active flood alerts for a location
   */
  async getActiveAlerts(latitude: number, longitude: number, radiusKm: number = 10): Promise<FloodAlert[]> {
    if (this.useSimulation || !supabase.isReady()) {
      return this.getSimulatedAlerts(latitude, longitude);
    }

    try {
      const client = supabase.getClient();
      if (!client) {
        return this.getSimulatedAlerts(latitude, longitude);
      }

      const { data, error } = await client
        .from('flood_alerts')
        .select('*')
        .eq('is_active', true)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by radius
      const filtered = (data || []).filter(alert => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          alert.latitude,
          alert.longitude
        );
        return distance <= radiusKm;
      });

      return filtered;
    } catch (error) {
      console.error('Error fetching flood alerts:', error);
      return this.getSimulatedAlerts(latitude, longitude);
    }
  }

  /**
   * Get all active alerts (for map display)
   */
  async getAllActiveAlerts(): Promise<FloodAlert[]> {
    if (this.useSimulation || !supabase.isReady()) {
      return this.getSimulatedAlerts(7.9125, 125.0864);
    }

    try {
      const client = supabase.getClient();
      if (!client) {
        return this.getSimulatedAlerts(7.9125, 125.0864);
      }

      const { data, error } = await client
        .from('flood_alerts')
        .select('*')
        .eq('is_active', true)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all flood alerts:', error);
      return this.getSimulatedAlerts(7.9125, 125.0864);
    }
  }

  /**
   * Create new flood alert (admin only)
   */
  async createAlert(alert: Omit<FloodAlert, 'id' | 'created_at'>): Promise<FloodAlert | null> {
    if (!supabase.isReady()) {
      console.warn('Cannot create alert: Supabase not configured');
      return null;
    }

    try {
      const client = supabase.getClient();
      if (!client) {
        console.warn('Cannot create alert: Supabase client not available');
        return null;
      }

      const { data, error } = await client
        .from('flood_alerts')
        .insert(alert)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating flood alert:', error);
      return null;
    }
  }

  /**
   * Resolve flood alert
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    if (!supabase.isReady()) return false;

    try {
      const client = supabase.getClient();
      if (!client) return false;

      const { error } = await client
        .from('flood_alerts')
        .update({
          is_active: false,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resolving flood alert:', error);
      return false;
    }
  }

  /**
   * Calculate flood risk based on weather and location
   */
  calculateFloodRisk(
    precipitation: number,
    waterLevelCm: number,
    terrainElevation: number
  ): FloodRiskLevel {
    let level: FloodRiskLevel['level'] = 'none';
    let color = '#10b981'; // green
    let description = 'No flood risk';

    // Risk calculation logic
    const riskScore = (precipitation * 0.4) + (waterLevelCm * 0.5) - (terrainElevation * 0.1);

    if (riskScore >= 80) {
      level = 'critical';
      color = '#dc2626'; // red
      description = 'Immediate evacuation required';
    } else if (riskScore >= 60) {
      level = 'high';
      color = '#f97316'; // orange
      description = 'Prepare for evacuation';
    } else if (riskScore >= 40) {
      level = 'medium';
      color = '#f59e0b'; // amber
      description = 'Monitor situation closely';
    } else if (riskScore >= 20) {
      level = 'low';
      color = '#eab308'; // yellow
      description = 'Be aware of conditions';
    }

    return { level, color, description };
  }

  /**
   * Get flood zones for map display
   */
  async getFloodZones(): Promise<FloodZone[]> {
    if (this.useSimulation || !supabase.isReady()) {
      return this.getSimulatedFloodZones();
    }

    // This would connect to a flood_zones table or GIS service
    // For now, return simulated data
    return this.getSimulatedFloodZones();
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generate simulated flood alerts for testing
   */
  private getSimulatedAlerts(latitude: number, longitude: number): FloodAlert[] {
    const alerts: FloodAlert[] = [];
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    const isWetSeason = month >= 5 && month <= 10;
    
    // Generate alert based on time and season
    if ((isWetSeason && hour >= 14 && hour <= 20) || Math.random() > 0.7) {
      const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
      const severity = severities[Math.min(Math.floor(Math.random() * 4), 3)];
      
      const barangays = [
        'Brgy. Poblacion',
        'Brgy. Lumbo',
        'Brgy. San Carlos',
        'Brgy. Mailag',
        'Brgy. Tugaya',
      ];

      const timeToImpact = severity === 'critical' ? 5 + Math.floor(Math.random() * 10) :
                          severity === 'high' ? 15 + Math.floor(Math.random() * 15) :
                          severity === 'medium' ? 25 + Math.floor(Math.random() * 25) :
                          45 + Math.floor(Math.random() * 30);

      alerts.push({
        id: 'sim-' + Date.now(),
        created_at: new Date().toISOString(),
        severity,
        location: barangays[Math.floor(Math.random() * barangays.length)],
        barangay: barangays[Math.floor(Math.random() * barangays.length)],
        latitude: latitude + (Math.random() - 0.5) * 0.01,
        longitude: longitude + (Math.random() - 0.5) * 0.01,
        water_level_cm: severity === 'critical' ? 80 + Math.floor(Math.random() * 50) :
                        severity === 'high' ? 50 + Math.floor(Math.random() * 30) :
                        severity === 'medium' ? 30 + Math.floor(Math.random() * 20) :
                        10 + Math.floor(Math.random() * 20),
        time_to_impact_minutes: timeToImpact,
        evacuation_center: 'Valencia City Hall',
        instructions: [
          severity === 'critical' ? 'Evacuate immediately' : 'Monitor flood levels',
          'Move valuables to higher ground',
          'Prepare emergency supplies',
          'Stay tuned for updates',
        ],
        avoid_areas: ['Riverside Road', 'Lower Bridge Area', 'Market Street'],
        is_active: true,
      });
    }

    return alerts;
  }

  /**
   * Generate simulated flood zones
   */
  private getSimulatedFloodZones(): FloodZone[] {
    const valenciaCenter = { lat: 7.9125, lng: 125.0864 };
    
    return [
      {
        id: 'zone-1',
        barangay: 'Brgy. Poblacion',
        coordinates: [
          [valenciaCenter.lat + 0.005, valenciaCenter.lng - 0.005],
          [valenciaCenter.lat + 0.005, valenciaCenter.lng + 0.005],
          [valenciaCenter.lat - 0.005, valenciaCenter.lng + 0.005],
          [valenciaCenter.lat - 0.005, valenciaCenter.lng - 0.005],
        ],
        risk_level: 'high',
        water_level_cm: 45,
      },
      {
        id: 'zone-2',
        barangay: 'Brgy. Lumbo',
        coordinates: [
          [valenciaCenter.lat + 0.01, valenciaCenter.lng - 0.01],
          [valenciaCenter.lat + 0.01, valenciaCenter.lng + 0.005],
          [valenciaCenter.lat + 0.005, valenciaCenter.lng + 0.005],
          [valenciaCenter.lat + 0.005, valenciaCenter.lng - 0.01],
        ],
        risk_level: 'medium',
        water_level_cm: 25,
      },
      {
        id: 'zone-3',
        barangay: 'Brgy. San Carlos',
        coordinates: [
          [valenciaCenter.lat - 0.005, valenciaCenter.lng - 0.01],
          [valenciaCenter.lat - 0.005, valenciaCenter.lng + 0.005],
          [valenciaCenter.lat - 0.01, valenciaCenter.lng + 0.005],
          [valenciaCenter.lat - 0.01, valenciaCenter.lng - 0.01],
        ],
        risk_level: 'low',
        water_level_cm: 15,
      },
    ];
  }

  /**
   * Subscribe to real-time flood alerts
   */
  subscribeToAlerts(callback: (alert: FloodAlert) => void) {
    if (!supabase.isReady()) {
      console.warn('Cannot subscribe: Supabase not configured');
      return null;
    }

    const client = supabase.getClient();
    if (!client) {
      console.warn('Cannot subscribe: Supabase client not available');
      return null;
    }

    const channel = client
      .channel('flood-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'flood_alerts',
        },
        (payload) => callback(payload.new as FloodAlert)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'flood_alerts',
        },
        (payload) => callback(payload.new as FloodAlert)
      )
      .subscribe();

    return channel;
  }
}

// Export singleton instance
export const floodService = new FloodService();
