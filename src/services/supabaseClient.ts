/**
 * Supabase Client Configuration
 * Initialize and export Supabase client for database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database type definitions
export interface Database {
  public: {
    Tables: {
      flood_alerts: {
        Row: {
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
        };
        Insert: {
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
          is_active?: boolean;
          resolved_at?: string;
        };
        Update: {
          severity?: 'low' | 'medium' | 'high' | 'critical';
          location?: string;
          barangay?: string;
          latitude?: number;
          longitude?: number;
          water_level_cm?: number;
          time_to_impact_minutes?: number;
          evacuation_center?: string;
          instructions?: string[];
          avoid_areas?: string[];
          is_active?: boolean;
          resolved_at?: string;
        };
      };
      community_reports: {
        Row: {
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
          verified_by?: string;
          status: 'active' | 'resolved' | 'false_report';
        };
        Insert: {
          user_id: string;
          report_type: 'flooding' | 'evacuation' | 'missing_person' | 'road_closure' | 'utility_damage';
          severity: 'low' | 'medium' | 'high' | 'critical';
          location: string;
          barangay: string;
          latitude: number;
          longitude: number;
          description: string;
          water_level_estimate?: string;
          photo_urls?: string[];
          verification_count?: number;
          is_verified?: boolean;
          verified_at?: string;
          verified_by?: string;
          status?: 'active' | 'resolved' | 'false_report';
        };
        Update: {
          user_id?: string;
          report_type?: 'flooding' | 'evacuation' | 'missing_person' | 'road_closure' | 'utility_damage';
          severity?: 'low' | 'medium' | 'high' | 'critical';
          location?: string;
          barangay?: string;
          latitude?: number;
          longitude?: number;
          description?: string;
          water_level_estimate?: string;
          photo_urls?: string[];
          verification_count?: number;
          is_verified?: boolean;
          verified_at?: string;
          verified_by?: string;
          status?: 'active' | 'resolved' | 'false_report';
        };
      };
      evacuation_centers: {
        Row: {
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
        };
        Insert: {
          name: string;
          address: string;
          barangay: string;
          latitude: number;
          longitude: number;
          max_capacity: number;
          current_occupancy?: number;
          contact_number?: string;
          contact_person?: string;
          facilities?: {
            medical?: boolean;
            food?: boolean;
            water?: boolean;
            electricity?: boolean;
            generators?: boolean;
            communications?: boolean;
          };
          is_operational?: boolean;
          last_updated?: string;
        };
        Update: {
          name?: string;
          address?: string;
          barangay?: string;
          latitude?: number;
          longitude?: number;
          max_capacity?: number;
          current_occupancy?: number;
          contact_number?: string;
          contact_person?: string;
          facilities?: {
            medical?: boolean;
            food?: boolean;
            water?: boolean;
            electricity?: boolean;
            generators?: boolean;
            communications?: boolean;
          };
          is_operational?: boolean;
          last_updated?: string;
        };
      };
      weather_data: {
        Row: {
          id: string;
          recorded_at: string;
          location: string;
          latitude: number;
          longitude: number;
          temperature?: number;
          humidity?: number;
          wind_speed?: number;
          precipitation?: number;
          pressure?: number;
          condition?: string;
          visibility?: number;
          rainfall_24h?: number;
          source: string;
        };
        Insert: {
          location: string;
          latitude: number;
          longitude: number;
          temperature?: number;
          humidity?: number;
          wind_speed?: number;
          precipitation?: number;
          pressure?: number;
          condition?: string;
          visibility?: number;
          rainfall_24h?: number;
          source: string;
        };
        Update: {
          location?: string;
          latitude?: number;
          longitude?: number;
          temperature?: number;
          humidity?: number;
          wind_speed?: number;
          precipitation?: number;
          pressure?: number;
          condition?: string;
          visibility?: number;
          rainfall_24h?: number;
          source?: string;
        };
      };
      user_locations: {
        Row: {
          id: string;
          user_id: string;
          updated_at: string;
          latitude: number;
          longitude: number;
          accuracy?: number;
          barangay?: string;
          is_in_flood_zone: boolean;
        };
        Insert: {
          user_id: string;
          latitude: number;
          longitude: number;
          accuracy?: number;
          barangay?: string;
          is_in_flood_zone?: boolean;
        };
        Update: {
          user_id?: string;
          latitude?: number;
          longitude?: number;
          accuracy?: number;
          barangay?: string;
          is_in_flood_zone?: boolean;
        };
      };
    };
  };
}

export interface FloodAlert {
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

export interface CommunityReport {
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
  verified_by?: string;
  status: 'active' | 'resolved' | 'false_report';
}

export interface EvacuationCenter {
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

export interface WeatherRecord {
  id: string;
  recorded_at: string;
  location: string;
  latitude: number;
  longitude: number;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  precipitation?: number;
  pressure?: number;
  condition?: string;
  visibility?: number;
  rainfall_24h?: number;
  source: string;
}

export interface UserLocation {
  id: string;
  user_id: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  barangay?: string;
  is_in_flood_zone: boolean;
}

class SupabaseService {
  private client: SupabaseClient<Database> | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Supabase client
   */
  private initialize() {
    // Get environment variables
    const supabaseUrl = (import.meta.env as any)?.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = (import.meta.env as any)?.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '') {
      // Only show once to reduce console noise
      if (!localStorage.getItem('supabase_warning_shown')) {
        console.warn('⚠️ Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
        console.warn('Expected URL format: https://your-project.supabase.co');
        console.warn('Expected key format: eyJhbGciOiJIUzI1NiIsInR5...');
        localStorage.setItem('supabase_warning_shown', 'true');
      }
      this.isConfigured = false;
      return;
    }

    try {
      this.client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      this.isConfigured = true;
      console.log('✅ Supabase client initialized successfully');
      console.log('✅ Project URL:', supabaseUrl);
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Get Supabase client instance
   */
  getClient(): SupabaseClient<Database> | null {
    return this.client;
  }

  /**
   * Check if Supabase is configured
   */
  isReady(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Subscribe to real-time updates for a table
   */
  subscribeToTable<T extends keyof Database['public']['Tables']>(
    table: T,
    callback: (payload: any) => void,
    filter?: string
  ) {
    if (!this.client) {
      console.warn(`Cannot subscribe to ${table}: Supabase not configured`);
      return null;
    }

    const channel = this.client
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Unsubscribe from real-time updates
   */
  async unsubscribe(channel: any) {
    if (channel) {
      await this.client?.removeChannel(channel);
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();

// Export service with getClient method (not direct client)
export const supabase = supabaseService;
