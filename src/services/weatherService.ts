/**
 * Weather Service
 * Handles all weather-related API calls
 * Supports OpenWeatherMap and fallback simulation
 */

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  visibility: number;
  pressure: number;
  rainfall24h?: number;
  feelsLike?: number;
  description?: string;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  precipitation: number;
  humidity: number;
}

class WeatherService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5';
  private useSimulation: boolean;

  constructor() {
    // Get API key from environment variable
    this.apiKey = import.meta.env?.VITE_OPENWEATHER_API_KEY || '';
    this.useSimulation = !this.apiKey || this.apiKey === '' || import.meta.env?.VITE_USE_WEATHER_SIMULATION === 'true';
    
    if (this.useSimulation) {
      // Only show once to reduce console noise
      if (!localStorage.getItem('weather_simulation_warning_shown')) {
        console.warn('⚠️ Weather Service: Using simulation mode. Add VITE_OPENWEATHER_API_KEY to .env for real data.');
        localStorage.setItem('weather_simulation_warning_shown', 'true');
      }
    } else {
      console.log('✅ Weather Service: Initialized with OpenWeatherMap API');
    }
  }

  /**
   * Get current weather for location
   */
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    if (this.useSimulation) {
      return this.getSimulatedWeather();
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`,
        { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseWeatherResponse(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Fallback to simulation on error
      return this.getSimulatedWeather();
    }
  }

  /**
   * Get weather forecast for next 5 days
   */
  async getWeatherForecast(latitude: number, longitude: number): Promise<WeatherForecast[]> {
    if (this.useSimulation) {
      return this.getSimulatedForecast();
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseForecastResponse(data);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      return this.getSimulatedForecast();
    }
  }

  /**
   * Parse OpenWeatherMap API response
   */
  private parseWeatherResponse(data: any): WeatherData {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      precipitation: data.rain?.['1h'] || 0,
      rainfall24h: data.rain?.['3h'] || 0,
      condition: this.mapWeatherCondition(data.weather[0].main),
      description: data.weather[0].description,
      visibility: Math.round(data.visibility / 1000), // Convert to km
      pressure: data.main.pressure,
    };
  }

  /**
   * Parse forecast API response
   */
  private parseForecastResponse(data: any): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const dailyData: { [key: string]: any[] } = {};

    // Group by date
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    // Process each day
    Object.entries(dailyData).slice(0, 5).forEach(([date, items]) => {
      const temps = items.map((item: any) => item.main.temp);
      const conditions = items.map((item: any) => item.weather[0].main);
      const precipitation = items.reduce((sum, item) => sum + (item.rain?.['3h'] || 0), 0);
      const humidity = items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length;

      forecasts.push({
        date,
        temperature: {
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps)),
        },
        condition: this.getMostCommonCondition(conditions),
        precipitation: Math.round(precipitation),
        humidity: Math.round(humidity),
      });
    });

    return forecasts;
  }

  /**
   * Map OpenWeather conditions to app conditions
   */
  private mapWeatherCondition(condition: string): string {
    const conditionMap: { [key: string]: string } = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'stormy',
      'Snow': 'snowy',
      'Mist': 'foggy',
      'Fog': 'foggy',
    };
    return conditionMap[condition] || 'cloudy';
  }

  /**
   * Get most common weather condition from array
   */
  private getMostCommonCondition(conditions: string[]): string {
    const counts: { [key: string]: number } = {};
    conditions.forEach(condition => {
      counts[condition] = (counts[condition] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostCommon = 'cloudy';
    Object.entries(counts).forEach(([condition, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = this.mapWeatherCondition(condition);
      }
    });
    
    return mostCommon;
  }

  /**
   * Generate simulated weather data for Valencia City
   * Based on Philippine tropical climate patterns
   */
  private getSimulatedWeather(): WeatherData {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    
    // Wet season (June-November) vs Dry season (December-May)
    const isWetSeason = month >= 5 && month <= 10;
    
    // Temperature variations (26-32°C typical for Valencia)
    const baseTemp = 28;
    const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 3;
    const temperature = baseTemp + tempVariation + (Math.random() - 0.5) * 2;
    
    // Humidity (high in tropics, 70-90%)
    const baseHumidity = isWetSeason ? 85 : 75;
    const humidity = baseHumidity + (Math.random() - 0.5) * 10;
    
    // Wind (typically calm to moderate, 10-25 km/h)
    const windSpeed = 10 + Math.random() * 15;
    
    // Precipitation (higher in wet season and afternoon)
    const baseRain = isWetSeason ? 15 : 3;
    const afternoonFactor = (hour >= 14 && hour <= 18) ? 2 : 1;
    const precipitation = baseRain * afternoonFactor * (0.5 + Math.random());
    
    // Conditions
    let condition = 'sunny';
    if (precipitation > 20) condition = 'stormy';
    else if (precipitation > 10) condition = 'rainy';
    else if (precipitation > 5) condition = 'cloudy';
    else if (hour >= 6 && hour <= 18) condition = 'sunny';
    else condition = 'clear';
    
    return {
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed),
      precipitation: Math.round(precipitation),
      condition,
      visibility: precipitation > 15 ? 8 : precipitation > 5 ? 12 : 15,
      pressure: 1010 + Math.round((Math.random() - 0.5) * 10),
      rainfall24h: Math.round(precipitation * 2.5),
    };
  }

  /**
   * Generate simulated forecast
   */
  private getSimulatedForecast(): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const isWetSeason = date.getMonth() >= 5 && date.getMonth() <= 10;
      const baseTemp = 28 + (Math.random() - 0.5) * 3;
      const precipitation = (isWetSeason ? 15 : 5) * (0.5 + Math.random());
      
      let condition = 'sunny';
      if (precipitation > 20) condition = 'stormy';
      else if (precipitation > 10) condition = 'rainy';
      else if (precipitation > 5) condition = 'cloudy';
      
      forecasts.push({
        date: date.toLocaleDateString(),
        temperature: {
          min: Math.round(baseTemp - 2),
          max: Math.round(baseTemp + 4),
        },
        condition,
        precipitation: Math.round(precipitation),
        humidity: Math.round(75 + (Math.random() - 0.5) * 15),
      });
    }

    return forecasts;
  }
}

// Export singleton instance
export const weatherService = new WeatherService();