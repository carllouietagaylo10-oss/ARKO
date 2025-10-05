/**
 * Data Aggregation Service
 * Combines data from multiple sources (OpenWeatherMap, NASA, PAGASA, Supabase)
 * Provides unified, reliable weather and flood data
 */

import { weatherService } from './weatherService';
import { nasaService } from './nasaService';
import { pagasaService } from './pagasaService';
import { floodService } from './floodService';
import { supabase } from './supabaseClient';

export interface AggregatedWeatherData {
  // Primary data
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  pressure: number;
  visibility: number;
  
  // Extended data
  rainfall24h: number;
  cloudCover?: number;
  solarRadiation?: number;
  windDirection?: string;
  feelsLike?: number;
  
  // Data quality
  sources: {
    openweather: boolean;
    nasa: boolean;
    pagasa: boolean;
  };
  confidence: number; // 0-100
  lastUpdate: string;
  
  // Alerts and warnings
  warnings: string[];
  advisories: string[];
}

export interface AggregatedFloodData {
  currentRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  waterLevel: number;
  floodExtent: number;
  
  // Predictions
  timeToImpact?: number; // minutes
  peakTime?: string;
  peakLevel?: number;
  
  // Sources
  rainfallData: {
    current: number;
    last1h: number;
    last3h: number;
    last6h: number;
    last24h: number;
  };
  
  // Analysis
  factors: {
    rainfall: number; // contribution to risk (%)
    saturation: number;
    riverLevel: number;
    terrain: number;
  };
  
  // Recommendations
  recommendations: string[];
  evacuationAdvised: boolean;
  affectedBarangays: string[];
}

export interface ComprehensiveDataReport {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    barangay?: string;
  };
  
  weather: AggregatedWeatherData;
  flood: AggregatedFloodData;
  
  // Typhoon data (if active)
  typhoon?: {
    active: boolean;
    name?: string;
    category?: number;
    distance?: number; // km from location
    signalLevel?: number;
  };
  
  // Historical comparison
  historical: {
    averageTemp: number;
    averageRainfall: number;
    floodEvents: number; // past 30 days
  };
  
  timestamp: string;
  dataQuality: 'excellent' | 'good' | 'fair' | 'limited';
}

class DataAggregationService {
  /**
   * Get comprehensive weather data from all available sources
   */
  async getAggregatedWeather(latitude: number, longitude: number): Promise<AggregatedWeatherData> {
    const sources = {
      openweather: false,
      nasa: false,
      pagasa: false
    };
    
    const weatherDataPoints: Array<any> = [];
    const warnings: string[] = [];
    const advisories: string[] = [];

    try {
      // Fetch from OpenWeatherMap
      const owData = await weatherService.getCurrentWeather(latitude, longitude);
      if (owData) {
        sources.openweather = true;
        weatherDataPoints.push({
          temperature: owData.temperature,
          humidity: owData.humidity,
          windSpeed: owData.windSpeed,
          precipitation: owData.precipitation,
          pressure: owData.pressure,
          condition: owData.condition,
          visibility: owData.visibility,
          feelsLike: owData.feelsLike
        });
      }
    } catch (error) {
      console.error('OpenWeather fetch failed:', error);
    }

    try {
      // Fetch from NASA POWER
      const nasaData = await nasaService.getPOWERWeatherData(latitude, longitude);
      if (nasaData) {
        sources.nasa = true;
        weatherDataPoints.push({
          temperature: nasaData.temperature,
          humidity: nasaData.humidity,
          windSpeed: nasaData.windSpeed,
          precipitation: nasaData.precipitation,
          cloudCover: nasaData.cloudCover,
          solarRadiation: nasaData.solarRadiation
        });
      }
    } catch (error) {
      console.error('NASA fetch failed:', error);
    }

    try {
      // Fetch from PAGASA
      const pagasaData = await pagasaService.getCurrentWeather(latitude, longitude);
      if (pagasaData) {
        sources.pagasa = true;
        weatherDataPoints.push({
          temperature: pagasaData.temperature,
          humidity: pagasaData.humidity,
          windSpeed: pagasaData.windSpeed,
          precipitation: pagasaData.precipitation,
          pressure: pagasaData.pressure,
          windDirection: pagasaData.windDirection,
          condition: pagasaData.condition
        });
        
        // Add PAGASA warnings
        warnings.push(...pagasaData.warnings);
        if (pagasaData.forecast) {
          advisories.push(pagasaData.forecast);
        }
      }
    } catch (error) {
      console.error('PAGASA fetch failed:', error);
    }

    // Aggregate the data using weighted averages
    const aggregated = this.aggregateWeatherData(weatherDataPoints);
    
    // Calculate data confidence based on number of sources
    const activeSourcesCount = Object.values(sources).filter(Boolean).length;
    const confidence = Math.min(100, activeSourcesCount * 33.33);

    // Add rainfall-based warnings
    if (aggregated.precipitation > 20) {
      warnings.push('⚠️ Heavy Rainfall Alert');
    }
    if (aggregated.precipitation > 30) {
      warnings.push('🚨 Severe Rainfall - Flash Flood Risk');
    }

    return {
      ...aggregated,
      sources,
      confidence,
      lastUpdate: new Date().toISOString(),
      warnings,
      advisories
    };
  }

  /**
   * Get comprehensive flood risk analysis from all sources
   */
  async getAggregatedFloodData(latitude: number, longitude: number): Promise<AggregatedFloodData> {
    // Get rainfall data from PAGASA
    const rainfallData = await pagasaService.getRainfallData(latitude, longitude);
    
    // Get NASA flood analysis
    const nasaFloodData = await nasaService.analyzeFloodRisk(latitude, longitude);
    
    // Get Supabase alerts
    const supabaseAlerts = await floodService.getActiveAlerts(latitude, longitude, 10);
    
    // Calculate comprehensive risk score
    const riskFactors = {
      rainfall: this.calculateRainfallRisk(rainfallData.rainfall24h),
      saturation: this.calculateSaturationRisk(rainfallData.rainfall24h),
      riverLevel: nasaFloodData.waterLevel / 150 * 100,
      terrain: this.calculateTerrainRisk(latitude, longitude)
    };

    const totalRiskScore = (
      riskFactors.rainfall * 0.4 +
      riskFactors.saturation * 0.3 +
      riskFactors.riverLevel * 0.2 +
      riskFactors.terrain * 0.1
    );

    let currentRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    if (totalRiskScore >= 80) currentRisk = 'critical';
    else if (totalRiskScore >= 60) currentRisk = 'high';
    else if (totalRiskScore >= 40) currentRisk = 'medium';
    else if (totalRiskScore >= 20) currentRisk = 'low';
    else currentRisk = 'none';

    // Generate recommendations
    const recommendations: string[] = [];
    const evacuationAdvised = currentRisk === 'critical' || currentRisk === 'high';
    
    if (evacuationAdvised) {
      recommendations.push('🚨 EVACUATE to higher ground immediately');
      recommendations.push('📞 Contact CDRRMO Valencia: +63-88-000-1111');
    }
    if (currentRisk === 'medium') {
      recommendations.push('⚠️ Prepare emergency supplies');
      recommendations.push('📱 Monitor updates from authorities');
    }
    if (rainfallData.rainfall24h > 50) {
      recommendations.push('💧 Significant rainfall recorded - avoid low-lying areas');
    }

    // Determine affected barangays (simplified)
    const affectedBarangays: string[] = [];
    if (currentRisk === 'critical' || currentRisk === 'high') {
      affectedBarangays.push('Brgy. Poblacion', 'Brgy. Lumbo', 'Brgy. Mailag');
    }

    return {
      currentRisk,
      riskScore: Math.round(totalRiskScore),
      waterLevel: nasaFloodData.waterLevel,
      floodExtent: nasaFloodData.floodExtent,
      
      rainfallData: {
        current: rainfallData.rainfall1h,
        last1h: rainfallData.rainfall1h,
        last3h: rainfallData.rainfall3h,
        last6h: rainfallData.rainfall6h,
        last24h: rainfallData.rainfall24h
      },
      
      factors: riskFactors,
      recommendations,
      evacuationAdvised,
      affectedBarangays
    };
  }

  /**
   * Get comprehensive data report for a location
   */
  async getComprehensiveReport(
    latitude: number, 
    longitude: number,
    locationName: string = 'Valencia City'
  ): Promise<ComprehensiveDataReport> {
    // Fetch all data in parallel
    const [weatherData, floodData, typhoonData] = await Promise.all([
      this.getAggregatedWeather(latitude, longitude),
      this.getAggregatedFloodData(latitude, longitude),
      pagasaService.getTyphoonData()
    ]);

    // Calculate typhoon impact if active
    let typhoonInfo: any = { active: false };
    if (typhoonData) {
      const distance = this.calculateDistance(
        latitude, longitude,
        typhoonData.location.latitude,
        typhoonData.location.longitude
      );
      
      typhoonInfo = {
        active: true,
        name: typhoonData.name,
        category: typhoonData.category,
        distance: Math.round(distance),
        signalLevel: typhoonData.signalLevels['Valencia City'] || 0
      };
    }

    // Calculate data quality
    const sourceCount = Object.values(weatherData.sources).filter(Boolean).length;
    let dataQuality: 'excellent' | 'good' | 'fair' | 'limited';
    if (sourceCount === 3) dataQuality = 'excellent';
    else if (sourceCount === 2) dataQuality = 'good';
    else if (sourceCount === 1) dataQuality = 'fair';
    else dataQuality = 'limited';

    return {
      location: {
        name: locationName,
        latitude,
        longitude,
        barangay: 'Auto-detected'
      },
      weather: weatherData,
      flood: floodData,
      typhoon: typhoonInfo,
      historical: {
        averageTemp: 27, // Valencia City average
        averageRainfall: 180, // Monthly average
        floodEvents: 0 // Would come from database
      },
      timestamp: new Date().toISOString(),
      dataQuality
    };
  }

  /**
   * Aggregate weather data from multiple sources using weighted averages
   */
  private aggregateWeatherData(dataPoints: any[]): any {
    if (dataPoints.length === 0) {
      // Fallback to default values
      return {
        temperature: 28,
        humidity: 75,
        windSpeed: 12,
        precipitation: 5,
        condition: 'partly_cloudy',
        pressure: 1010,
        visibility: 10,
        rainfall24h: 10
      };
    }

    const avg = (key: string) => {
      const values = dataPoints
        .map(d => d[key])
        .filter(v => v !== undefined && v !== null);
      return values.length > 0 
        ? values.reduce((sum, v) => sum + v, 0) / values.length 
        : undefined;
    };

    const first = (key: string) => {
      return dataPoints.find(d => d[key] !== undefined)?.[key];
    };

    return {
      temperature: Math.round(avg('temperature') || 28),
      humidity: Math.round(avg('humidity') || 75),
      windSpeed: Math.round(avg('windSpeed') || 12),
      precipitation: Math.round(avg('precipitation') || 5),
      pressure: Math.round(avg('pressure') || 1010),
      visibility: Math.round(avg('visibility') || 10),
      condition: first('condition') || 'partly_cloudy',
      rainfall24h: Math.round(avg('precipitation') || 5) * 2,
      cloudCover: avg('cloudCover'),
      solarRadiation: avg('solarRadiation'),
      windDirection: first('windDirection'),
      feelsLike: Math.round(avg('feelsLike') || avg('temperature') || 28)
    };
  }

  /**
   * Calculate rainfall contribution to flood risk (0-100)
   */
  private calculateRainfallRisk(rainfall24h: number): number {
    if (rainfall24h > 150) return 100;
    if (rainfall24h > 100) return 90;
    if (rainfall24h > 75) return 75;
    if (rainfall24h > 50) return 60;
    if (rainfall24h > 30) return 40;
    if (rainfall24h > 15) return 20;
    return 10;
  }

  /**
   * Calculate soil saturation risk (0-100)
   */
  private calculateSaturationRisk(rainfall24h: number): number {
    // Soil saturation increases risk even with moderate current rain
    const saturationFactor = Math.min(100, rainfall24h * 1.5);
    return saturationFactor;
  }

  /**
   * Calculate terrain-based risk for Valencia City (0-100)
   */
  private calculateTerrainRisk(latitude: number, longitude: number): number {
    // Valencia City is in highlands but has flood-prone areas
    // This would ideally use elevation data
    
    // Simplified: Areas closer to rivers have higher risk
    const isNearRiver = Math.random() > 0.5; // Would use actual river data
    return isNearRiver ? 60 : 30;
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
}

// Export singleton instance
export const dataAggregationService = new DataAggregationService();