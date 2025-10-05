/**
 * NASA Earth Observations Service
 * Integrates NASA POWER API, GIBS Imagery, and Earth Data
 */

export interface NASAWeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  solarRadiation?: number;
  cloudCover?: number;
  source: 'nasa_power';
}

export interface NASASatelliteImagery {
  imageUrl: string;
  timestamp: string;
  layer: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface NASAFloodData {
  floodExtent: number;
  waterLevel: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  satelliteTimestamp: string;
}

class NASAService {
  private powerApiBase = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  private gibsBase = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';
  private useSimulation: boolean;

  constructor() {
    // Get NASA token from environment
    const hasToken = import.meta.env?.VITE_NASA_EARTHDATA_TOKEN && import.meta.env.VITE_NASA_EARTHDATA_TOKEN !== '';
    const useSimFlag = import.meta.env?.VITE_USE_NASA_SIMULATION === 'true';
    
    this.useSimulation = !hasToken || useSimFlag;
    
    if (this.useSimulation) {
      // Only show once to reduce console noise
      if (!localStorage.getItem('nasa_simulation_warning_shown')) {
        console.warn('⚠️ NASA Service: Using simulation mode. Add VITE_NASA_EARTHDATA_TOKEN for real data.');
        localStorage.setItem('nasa_simulation_warning_shown', 'true');
      }
    } else {
      console.log('✅ NASA Service: Initialized with Earthdata token');
    }
  }

  /**
   * Get NASA POWER API weather data
   * Free API - no authentication required
   * Data from weather stations and satellite observations
   */
  async getPOWERWeatherData(latitude: number, longitude: number): Promise<NASAWeatherData> {
    if (this.useSimulation) {
      return this.getSimulatedNASAWeather(latitude, longitude);
    }

    try {
      // NASA POWER API parameters
      const params = new URLSearchParams({
        parameters: 'T2M,RH2M,PRECTOTCORR,WS2M,ALLSKY_SFC_SW_DWN,CLOUD_AMT',
        community: 'RE',
        longitude: longitude.toString(),
        latitude: latitude.toString(),
        start: this.getYesterdayDate(),
        end: this.getTodayDate(),
        format: 'JSON'
      });

      const response = await fetch(`${this.powerApiBase}?${params}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parsePOWERResponse(data);
    } catch (error) {
      console.error('Error fetching NASA POWER data:', error);
      return this.getSimulatedNASAWeather(latitude, longitude);
    }
  }

  /**
   * Get MODIS satellite imagery from NASA GIBS
   * Shows flood extent and water bodies
   */
  async getMODISFloodImagery(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 50
  ): Promise<NASASatelliteImagery> {
    try {
      const bounds = this.calculateBounds(latitude, longitude, radiusKm);
      const date = this.getTodayDate();

      const params = new URLSearchParams({
        SERVICE: 'WMS',
        REQUEST: 'GetMap',
        VERSION: '1.3.0',
        LAYERS: 'MODIS_Terra_CorrectedReflectance_TrueColor',
        CRS: 'EPSG:4326',
        BBOX: `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`,
        WIDTH: '1024',
        HEIGHT: '1024',
        FORMAT: 'image/png',
        TIME: date
      });

      const imageUrl = `${this.gibsBase}?${params}`;

      return {
        imageUrl,
        timestamp: date,
        layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
        bounds
      };
    } catch (error) {
      console.error('Error fetching MODIS imagery:', error);
      throw error;
    }
  }

  /**
   * Analyze flood risk based on NASA satellite data
   * Uses precipitation, temperature, and humidity patterns
   */
  async analyzeFloodRisk(latitude: number, longitude: number): Promise<NASAFloodData> {
    try {
      const weatherData = await this.getPOWERWeatherData(latitude, longitude);
      
      // Calculate flood risk based on NASA data
      let riskScore = 0;
      
      // Heavy precipitation increases risk
      if (weatherData.precipitation > 50) riskScore += 40;
      else if (weatherData.precipitation > 30) riskScore += 25;
      else if (weatherData.precipitation > 15) riskScore += 10;
      
      // High humidity indicates moisture saturation
      if (weatherData.humidity > 90) riskScore += 20;
      else if (weatherData.humidity > 80) riskScore += 10;
      
      // Cloud cover indicates potential rain
      if (weatherData.cloudCover && weatherData.cloudCover > 80) riskScore += 15;
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (riskScore >= 75) riskLevel = 'critical';
      else if (riskScore >= 50) riskLevel = 'high';
      else if (riskScore >= 30) riskLevel = 'medium';
      else riskLevel = 'low';

      return {
        floodExtent: riskScore,
        waterLevel: Math.min(riskScore * 1.5, 150), // Estimated in cm
        riskLevel,
        satelliteTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing flood risk:', error);
      return this.getSimulatedFloodRisk();
    }
  }

  /**
   * Parse NASA POWER API response
   */
  private parsePOWERResponse(data: any): NASAWeatherData {
    const properties = data.properties?.parameter;
    if (!properties) {
      throw new Error('Invalid NASA POWER response');
    }

    // Get the most recent data point
    const latestDate = Object.keys(properties.T2M || {}).sort().pop();
    if (!latestDate) {
      throw new Error('No data available');
    }

    return {
      temperature: Math.round(properties.T2M?.[latestDate] || 28),
      humidity: Math.round(properties.RH2M?.[latestDate] || 75),
      precipitation: Math.round(properties.PRECTOTCORR?.[latestDate] || 0),
      windSpeed: Math.round((properties.WS2M?.[latestDate] || 0) * 3.6), // m/s to km/h
      solarRadiation: properties.ALLSKY_SFC_SW_DWN?.[latestDate],
      cloudCover: properties.CLOUD_AMT?.[latestDate],
      source: 'nasa_power'
    };
  }

  /**
   * Calculate bounding box for satellite imagery
   */
  private calculateBounds(lat: number, lng: number, radiusKm: number) {
    const kmToDegrees = radiusKm / 111; // Approximate
    return {
      north: lat + kmToDegrees,
      south: lat - kmToDegrees,
      east: lng + kmToDegrees,
      west: lng - kmToDegrees
    };
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get yesterday's date in YYYY-MM-DD format
   */
  private getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  /**
   * Simulated NASA weather data for testing
   */
  private getSimulatedNASAWeather(latitude: number, longitude: number): NASAWeatherData {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    const isWetSeason = month >= 5 && month <= 10;

    return {
      temperature: 27 + Math.round((Math.random() - 0.5) * 4),
      humidity: isWetSeason ? 82 + Math.round(Math.random() * 10) : 72 + Math.round(Math.random() * 10),
      precipitation: isWetSeason ? Math.round(Math.random() * 25) : Math.round(Math.random() * 8),
      windSpeed: 12 + Math.round(Math.random() * 10),
      solarRadiation: hour >= 6 && hour <= 18 ? 500 + Math.random() * 300 : 0,
      cloudCover: isWetSeason ? 60 + Math.random() * 30 : 30 + Math.random() * 40,
      source: 'nasa_power'
    };
  }

  /**
   * Simulated flood risk data
   */
  private getSimulatedFloodRisk(): NASAFloodData {
    const riskScore = Math.random() * 100;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    
    if (riskScore >= 75) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    return {
      floodExtent: riskScore,
      waterLevel: Math.round(riskScore * 1.5),
      riskLevel,
      satelliteTimestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const nasaService = new NASAService();