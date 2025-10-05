import React from 'react';
import { Cloud, Droplets, Wind, Thermometer, Eye, Gauge } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { useWeatherData } from './hooks/useWeatherData';

interface WeatherDisplayProps {
  latitude?: number;
  longitude?: number;
}

export function WeatherDisplay({ latitude = 7.9125, longitude = 125.0864 }: WeatherDisplayProps) {
  const { weatherData, forecastData, loading, error } = useWeatherData(latitude, longitude);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className="p-4 border-yellow-200 bg-yellow-50">
        <p className="text-sm text-yellow-700 m-0">Weather data temporarily unavailable</p>
      </Card>
    );
  }

  const getFloodRiskColor = (precipitation: number) => {
    if (precipitation > 10) return 'text-red-600';
    if (precipitation > 5) return 'text-orange-600';
    if (precipitation > 1) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getFloodRiskText = (precipitation: number) => {
    if (precipitation > 10) return 'High flood risk';
    if (precipitation > 5) return 'Moderate flood risk';
    if (precipitation > 1) return 'Low flood risk';
    return 'Minimal flood risk';
  };

  return (
    <Card className="p-6 sm:p-8 bg-white shadow-xl border-2 border-blue-200 rounded-xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <Cloud size={28} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 leading-tight">Live Weather Conditions</h3>
          <p className="text-sm sm:text-base text-gray-600 leading-tight">Real-time Valencia City weather data</p>
          {weatherData.sources && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {weatherData.sources.openweather && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                  OpenWeather
                </span>
              )}
              {weatherData.sources.nasa && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                  NASA
                </span>
              )}
              {weatherData.sources.pagasa && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                  PAGASA
                </span>
              )}
              {weatherData.confidence && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                  {weatherData.confidence}% confidence
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Weather Stats - Improved Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Thermometer className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600 mb-1 font-medium">Temperature</p>
            <p className="text-lg font-bold text-gray-800 leading-none">{weatherData.temperature.toFixed(1)}°C</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Droplets className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600 mb-1 font-medium">Humidity</p>
            <p className="text-lg font-bold text-gray-800 leading-none">{weatherData.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Wind className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600 mb-1 font-medium">Wind Speed</p>
            <p className="text-lg font-bold text-gray-800 leading-none">{weatherData.windSpeed.toFixed(1)} km/h</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Eye className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600 mb-1 font-medium">Visibility</p>
            <p className="text-lg font-bold text-gray-800 leading-none">{weatherData.visibility.toFixed(1)} km</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Gauge className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600 mb-1 font-medium">Pressure</p>
            <p className="text-lg font-bold text-gray-800 leading-none">{weatherData.pressure} hPa</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Droplets className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600 mb-1 font-medium">Current Rain</p>
            <p className={`text-lg font-bold leading-none ${getFloodRiskColor(weatherData.precipitation)}`}>
              {weatherData.precipitation.toFixed(1)} mm/hr
            </p>
          </div>
        </div>
      </div>

      {/* Flood Risk Assessment - Improved Layout */}
      <div className="p-4 sm:p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Droplets size={20} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-bold text-blue-900 mb-1 leading-tight">Flood Risk Assessment</h4>
            <p className="text-sm text-blue-700 leading-tight">Based on current conditions</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-medium text-blue-800">Current Risk Level:</span>
            <span className={`font-bold text-sm px-3 py-1 rounded-full bg-white/50 ${getFloodRiskColor(weatherData.precipitation)}`}>
              {getFloodRiskText(weatherData.precipitation)}
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={Math.min(100, weatherData.precipitation * 8)} 
              className="h-3 bg-white/50"
            />
            <p className="text-xs text-blue-600 leading-relaxed">
              Based on current precipitation rate: <strong>{weatherData.precipitation.toFixed(1)} mm/hr</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 24-Hour Forecast Preview - Fixed Layout */}
      {forecastData && (
        <div className="mt-6 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-800">24-Hour Precipitation Forecast</h4>
          </div>
          
          {/* Chart Container with Better Spacing */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-end gap-1 h-20 sm:h-24 mb-3">
              {forecastData.hourlyPrecipitation.slice(0, 12).map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${Math.max(8, Math.min(80, (value || 0) * 10))}px`,
                    opacity: Math.max(0.4, Math.min(1, (value || 0) / 3))
                  }}
                  title={`${value?.toFixed(1) || 0} mm at ${new Date(forecastData.timestamps[index]).getHours()}:00`}
                ></div>
              ))}
            </div>
            
            {/* Time Labels with Better Spacing */}
            <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
              <span className="font-medium">Now</span>
              <span className="font-medium">+6hrs</span>
              <span className="font-medium">+12hrs</span>
            </div>
          </div>
          
          {/* Summary Information */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Total Expected Rainfall
            </p>
            <p className="text-lg font-bold text-blue-700">
              {forecastData.hourlyPrecipitation.slice(0, 24).reduce((sum, val) => sum + (val || 0), 0).toFixed(1)} mm
            </p>
            <p className="text-xs text-blue-600 mt-1">
              in the next 24 hours
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}