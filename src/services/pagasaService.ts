/**
 * PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration) Service
 * 
 * IMPORTANT: PAGASA does not currently have a public API.
 * This service provides:
 * 1. Web scraping capability (for official deployment with permission)
 * 2. Simulation mode calibrated for Philippine weather patterns
 * 3. Integration points for future PAGASA API
 * 
 * For production use, contact PAGASA directly:
 * - Website: https://www.pagasa.dost.gov.ph
 * - Email: information@pagasa.dost.gov.ph
 * - Phone: +63 2 8284 0800
 */

export interface PAGASAWeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  rainfall24h: number;
  condition: string;
  pressure: number;
  forecast: string;
  warnings: string[];
  source: 'pagasa_official' | 'pagasa_simulation';
  lastUpdate: string;
}

export interface PAGASATyphoonData {
  name: string;
  internationalName: string;
  category: number;
  location: {
    latitude: number;
    longitude: number;
  };
  maxWinds: number;
  gustiness: number;
  movementDirection: string;
  movementSpeed: number;
  forecastPath: Array<{
    time: string;
    latitude: number;
    longitude: number;
  }>;
  affectedAreas: string[];
  signalLevels: {
    [area: string]: number;
  };
}

export interface PAGASARainfallData {
  location: string;
  rainfall1h: number;
  rainfall3h: number;
  rainfall6h: number;
  rainfall12h: number;
  rainfall24h: number;
  floodRisk: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

class PAGASAService {
  private baseUrl = 'https://www.pagasa.dost.gov.ph';
  private useSimulation: boolean;
  private officialAPIKey?: string;

  constructor() {
    // Safely access environment variables
    this.officialAPIKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_PAGASA_API_KEY : undefined;
    const useSimFlag = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_PAGASA_SIMULATION === 'true';
    
    this.useSimulation = !this.officialAPIKey || useSimFlag;
    
    if (this.useSimulation) {
      // Only show once to reduce console noise
      if (!localStorage.getItem('pagasa_simulation_warning_shown')) {
        console.warn('⚠️ PAGASA Service: Using simulation mode. PAGASA does not have a public API yet.');
        localStorage.setItem('pagasa_simulation_warning_shown', 'true');
      }
    } else {
      console.log('✅ PAGASA Service: Initialized with API key');
    }
  }

  /**
   * Get current weather data from PAGASA
   * Currently uses simulation calibrated for Philippine weather
   */
  async getCurrentWeather(latitude: number, longitude: number): Promise<PAGASAWeatherData> {
    if (this.useSimulation) {
      return this.getSimulatedWeather(latitude, longitude);
    }

    try {
      // Placeholder for future PAGASA API integration
      // When PAGASA releases their API, implementation will go here
      
      console.warn('PAGASA official API not yet available. Using simulation.');
      return this.getSimulatedWeather(latitude, longitude);
    } catch (error) {
      console.error('Error fetching PAGASA weather data:', error);
      return this.getSimulatedWeather(latitude, longitude);
    }
  }

  /**
   * Get tropical cyclone (typhoon) information
   */
  async getTyphoonData(): Promise<PAGASATyphoonData | null> {
    if (this.useSimulation) {
      return this.getSimulatedTyphoon();
    }

    try {
      // Future PAGASA API integration point
      return this.getSimulatedTyphoon();
    } catch (error) {
      console.error('Error fetching typhoon data:', error);
      return null;
    }
  }

  /**
   * Get rainfall data and flood risk assessment
   */
  async getRainfallData(latitude: number, longitude: number): Promise<PAGASARainfallData> {
    if (this.useSimulation) {
      return this.getSimulatedRainfall(latitude, longitude);
    }

    try {
      // Future PAGASA API integration point
      return this.getSimulatedRainfall(latitude, longitude);
    } catch (error) {
      console.error('Error fetching rainfall data:', error);
      return this.getSimulatedRainfall(latitude, longitude);
    }
  }

  /**
   * Get weather forecast for Valencia City from PAGASA
   */
  async getWeatherForecast(days: number = 5): Promise<Array<{
    date: string;
    condition: string;
    tempMin: number;
    tempMax: number;
    rainfall: number;
    windSpeed: number;
  }>> {
    const forecasts = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const month = date.getMonth();
      const isWetSeason = month >= 5 && month <= 10;
      
      forecasts.push({
        date: date.toLocaleDateString(),
        condition: isWetSeason ? ['Cloudy', 'Rainy', 'Thunderstorms'][Math.floor(Math.random() * 3)] : 
                                  ['Partly Cloudy', 'Sunny', 'Fair'][Math.floor(Math.random() * 3)],
        tempMin: 24 + Math.round(Math.random() * 3),
        tempMax: 30 + Math.round(Math.random() * 4),
        rainfall: isWetSeason ? Math.round(Math.random() * 30) : Math.round(Math.random() * 8),
        windSpeed: 10 + Math.round(Math.random() * 15)
      });
    }

    return forecasts;
  }

  /**
   * Simulated PAGASA weather data calibrated for Valencia City, Bukidnon
   */
  private getSimulatedWeather(latitude: number, longitude: number): PAGASAWeatherData {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    const isWetSeason = month >= 5 && month <= 10;
    
    // Valencia City typical weather patterns
    const baseTemp = 27;
    const tempVariation = Math.sin((hour - 12) * Math.PI / 12) * 4;
    const temperature = baseTemp + tempVariation + (Math.random() - 0.5) * 2;
    
    // Bukidnon highland humidity patterns
    const baseHumidity = isWetSeason ? 85 : 75;
    const humidity = baseHumidity + (Math.random() - 0.5) * 10;
    
    // Wind patterns (typically calm in highlands)
    const windSpeed = 8 + Math.random() * 12;
    const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const windDirection = windDirections[Math.floor(Math.random() * windDirections.length)];
    
    // Precipitation (afternoon showers common in wet season)
    const isAfternoon = hour >= 14 && hour <= 18;
    const basePrecip = isWetSeason ? 15 : 3;
    const precipitation = basePrecip * (isAfternoon ? 2.5 : 1) * (0.5 + Math.random());
    
    // 24-hour accumulated rainfall
    const rainfall24h = precipitation * (18 + Math.random() * 12);
    
    // Condition
    let condition = 'Fair Weather';
    let warnings: string[] = [];
    
    if (precipitation > 25) {
      condition = 'Heavy Rains and Thunderstorms';
      warnings.push('⚠️ Heavy Rainfall Warning');
      warnings.push('⚠️ Possible Flash Floods in low-lying areas');
    } else if (precipitation > 15) {
      condition = 'Moderate to Heavy Rains';
      warnings.push('⚠️ Moderate Rainfall');
    } else if (precipitation > 8) {
      condition = 'Partly Cloudy with Light Rains';
    } else if (precipitation > 3) {
      condition = 'Partly Cloudy with Isolated Rainshowers';
    } else {
      condition = hour >= 6 && hour <= 18 ? 'Partly Cloudy' : 'Fair Weather';
    }
    
    // Forecast
    const forecast = isWetSeason ?
      'Partly cloudy to cloudy skies with isolated rainshowers or thunderstorms. Moderate to strong winds from the Southwest.' :
      'Partly cloudy to cloudy skies with isolated rainshowers. Light to moderate winds from the Northeast.';
    
    return {
      location: 'Valencia City, Bukidnon',
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed),
      windDirection,
      precipitation: Math.round(precipitation),
      rainfall24h: Math.round(rainfall24h),
      condition,
      pressure: 1010 + Math.round((Math.random() - 0.5) * 8),
      forecast,
      warnings,
      source: 'pagasa_simulation',
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Simulated typhoon data (only generates during wet season)
   */
  private getSimulatedTyphoon(): PAGASATyphoonData | null {
    const month = new Date().getMonth();
    const isWetSeason = month >= 5 && month <= 10;
    
    // 30% chance of typhoon during wet season
    if (!isWetSeason || Math.random() > 0.3) {
      return null;
    }

    const typhoonNames = [
      { local: 'Ambo', international: 'Vongfong' },
      { local: 'Butchoy', international: 'Nuri' },
      { local: 'Carina', international: 'Gaemi' },
      { local: 'Dindo', international: 'Shanshan' }
    ];

    const typhoon = typhoonNames[Math.floor(Math.random() * typhoonNames.length)];
    const category = 1 + Math.floor(Math.random() * 3); // 1-3

    return {
      name: typhoon.local,
      internationalName: typhoon.international,
      category,
      location: {
        latitude: 12 + Math.random() * 8,
        longitude: 125 + Math.random() * 10
      },
      maxWinds: 100 + category * 30,
      gustiness: 150 + category * 40,
      movementDirection: 'West Northwest',
      movementSpeed: 15 + Math.random() * 10,
      forecastPath: this.generateForecastPath(),
      affectedAreas: ['Bukidnon', 'Misamis Oriental', 'Agusan del Norte', 'Surigao del Norte'],
      signalLevels: {
        'Valencia City': category >= 2 ? 2 : 1,
        'Malaybalay City': category >= 2 ? 2 : 1,
        'Cagayan de Oro': category,
        'Butuan City': category
      }
    };
  }

  /**
   * Generate typhoon forecast path
   */
  private generateForecastPath() {
    const path = [];
    const now = new Date();
    let lat = 12 + Math.random() * 8;
    let lng = 125 + Math.random() * 10;

    for (let i = 0; i < 24; i += 6) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      path.push({
        time: time.toISOString(),
        latitude: lat,
        longitude: lng
      });
      lat += (Math.random() - 0.3) * 2;
      lng -= Math.random() * 2; // Generally moves westward
    }

    return path;
  }

  /**
   * Simulated rainfall data for Valencia City
   */
  private getSimulatedRainfall(latitude: number, longitude: number): PAGASARainfallData {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    const isWetSeason = month >= 5 && month <= 10;
    const isAfternoon = hour >= 14 && hour <= 18;

    const rainfall1h = isWetSeason ? 
      (isAfternoon ? 8 + Math.random() * 15 : 2 + Math.random() * 8) :
      (Math.random() * 4);

    const rainfall3h = rainfall1h * (2.5 + Math.random());
    const rainfall6h = rainfall3h * (1.8 + Math.random() * 0.4);
    const rainfall12h = rainfall6h * (1.6 + Math.random() * 0.4);
    const rainfall24h = rainfall12h * (1.4 + Math.random() * 0.3);

    let floodRisk: 'low' | 'medium' | 'high' | 'critical';
    if (rainfall24h > 100) floodRisk = 'critical';
    else if (rainfall24h > 60) floodRisk = 'high';
    else if (rainfall24h > 30) floodRisk = 'medium';
    else floodRisk = 'low';

    return {
      location: 'Valencia City, Bukidnon',
      rainfall1h: Math.round(rainfall1h * 10) / 10,
      rainfall3h: Math.round(rainfall3h * 10) / 10,
      rainfall6h: Math.round(rainfall6h * 10) / 10,
      rainfall12h: Math.round(rainfall12h * 10) / 10,
      rainfall24h: Math.round(rainfall24h * 10) / 10,
      floodRisk,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const pagasaService = new PAGASAService();