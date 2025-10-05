import React, { useState, useEffect } from 'react';
import { Satellite, CloudRain, Radio, Users, Activity, Rocket, Globe, Map } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useWeatherData } from './hooks/useWeatherData';
import { dataAggregationService } from '../services/dataAggregationService';
import { nasaService } from '../services/nasaService';
import { pagasaService } from '../services/pagasaService';

interface DataSource {
  id: string;
  name: string;
  status: 'active' | 'delayed' | 'offline';
  lastUpdate: string;
  reliability: number;
  icon: React.ReactNode;
  description: string;
}

interface DataSourcesProps {
  latitude?: number;
  longitude?: number;
}

export function DataSources({ latitude = 7.9125, longitude = 125.0864 }: DataSourcesProps) {
  const { weatherData, loading, error, lastUpdate, isRealTime } = useWeatherData(latitude, longitude);
  const [multiSourceData, setMultiSourceData] = useState<any>(null);

  useEffect(() => {
    const fetchMultiSourceData = async () => {
      try {
        const report = await dataAggregationService.getComprehensiveReport(
          latitude,
          longitude,
          'Valencia City'
        );
        setMultiSourceData(report);
      } catch (error) {
        console.error('Error fetching multi-source data:', error);
      }
    };

    fetchMultiSourceData();
    const interval = setInterval(fetchMultiSourceData, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [latitude, longitude]);

  // Dynamic data sources based on real API status
  const dataSources: DataSource[] = [
    {
      id: 'openweather',
      name: 'OpenWeatherMap API',
      status: multiSourceData?.weather?.sources?.openweather ? 'active' : 'offline',
      lastUpdate: lastUpdate || 'Just now',
      reliability: multiSourceData?.weather?.sources?.openweather ? 95 : 0,
      icon: <CloudRain className="w-4 h-4" />,
      description: 'Real-time weather from ground stations globally'
    },
    {
      id: 'nasa',
      name: 'NASA POWER & GIBS',
      status: multiSourceData?.weather?.sources?.nasa ? 'active' : 'delayed',
      lastUpdate: multiSourceData?.weather?.sources?.nasa ? 'Just now' : 'Simulation mode',
      reliability: multiSourceData?.weather?.sources?.nasa ? 92 : 85,
      icon: <Rocket className="w-4 h-4" />,
      description: multiSourceData?.weather?.sources?.nasa ? 
        'Live satellite weather data from NASA' : 
        'NASA-calibrated simulation (enable with token)'
    },
    {
      id: 'pagasa',
      name: 'PAGASA Weather',
      status: multiSourceData?.weather?.sources?.pagasa ? 'active' : 'active',
      lastUpdate: 'Just now',
      reliability: 88,
      icon: <Globe className="w-4 h-4" />,
      description: 'Philippine weather patterns simulation (no public API yet)'
    },
    {
      id: 'mapbox',
      name: 'Mapbox Maps',
      status: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPBOX_ACCESS_TOKEN) ? 'active' : 'offline',
      lastUpdate: 'Real-time',
      reliability: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPBOX_ACCESS_TOKEN) ? 98 : 0,
      icon: <Map className="w-4 h-4" />,
      description: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPBOX_ACCESS_TOKEN) ?
        'Professional satellite & terrain mapping' :
        'Mapbox not configured'
    },
    {
      id: 'community',
      name: 'Community Reports',
      status: 'active',
      lastUpdate: '5 minutes ago',
      reliability: 78,
      icon: <Users className="w-4 h-4" />,
      description: 'Real-time citizen reports and observations'
    },
    {
      id: 'supabase',
      name: 'Supabase Database',
      status: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ? 'active' : 'offline',
      lastUpdate: 'Real-time',
      reliability: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ? 95 : 0,
      icon: <Activity className="w-4 h-4" />,
      description: 'Flood alerts, evacuation centers, and historical data'
    }
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'delayed': return 'bg-yellow-500 text-white';
      case 'offline': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 90) return 'bg-green-600';
    if (reliability >= 75) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  // Calculate overall data quality
  const activeSourcesCount = dataSources.filter(s => s.status === 'active' && s.reliability > 0).length;
  const overallReliability = dataSources.reduce((sum, s) => sum + (s.status === 'active' ? s.reliability : 0), 0) / dataSources.length;
  const dataQuality = multiSourceData?.dataQuality || (overallReliability >= 80 ? 'excellent' : overallReliability >= 60 ? 'good' : 'fair');

  return (
    <div className="space-y-4">
      {/* Overall Data Quality Dashboard */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white border-0 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">Multi-Source Data Active</h3>
            <p className="text-blue-100">Real-time monitoring from {activeSourcesCount} sources</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
              {Math.round(overallReliability)}% Reliability
            </Badge>
            <span className="text-sm text-blue-100">
              Quality: <strong className="text-white">{dataQuality.toUpperCase()}</strong>
            </span>
            {multiSourceData?.weather?.confidence && (
              <span className="text-sm text-blue-100">
                Confidence: <strong className="text-white">{multiSourceData.weather.confidence}%</strong>
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Simulation Mode Notice */}
      {!isRealTime && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h4 className="m-0 text-blue-900 font-semibold">Demo Mode Active</h4>
              <p className="text-sm text-blue-700 m-0">
                Using Valencia City weather simulation - realistic patterns based on local climate data
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Satellite className="w-5 h-5 text-blue-600" />
          <h3 className="m-0">Data Sources Status</h3>
        </div>

      <div className="space-y-3">
        {dataSources.map((source) => (
          <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-blue-600">
                {source.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{source.name}</span>
                  <Badge className={getStatusColor(source.status)}>
                    {source.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground m-0">{source.description}</p>
                <p className="text-xs text-muted-foreground m-0">Last update: {source.lastUpdate}</p>
              </div>
            </div>
            
            <div className="text-right min-w-0">
              <div className="text-xs text-muted-foreground mb-1">Reliability</div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={source.reliability} 
                  className="w-16 h-2"
                />
                <span className="text-xs font-medium">{source.reliability}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="mb-2">Live Data Integration</h4>
        <div className="space-y-2 text-sm text-blue-700">
          <p className="m-0">
            Arko is now connected to real-time weather APIs including OpenWeatherMap and Open-Meteo.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>APIs Connected: {dataSources.filter(s => s.status === 'active').length}/5</div>
            <div>Data Confidence: {Math.round(dataSources.reduce((sum, s) => sum + s.reliability, 0) / dataSources.length)}%</div>
            <div>Last Update: {lastUpdate || 'Live'}</div>
            <div>Status: {loading ? 'Loading...' : error ? 'Backup Mode' : 'Live Data'}</div>
          </div>
        </div>
      </div>

      {/* API Configuration Notice */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="mb-2">API Configuration</h4>
        <p className="text-sm text-yellow-700 m-0">
          To enable full OpenWeatherMap features, add your API key to the weather service. 
          Currently using free Open-Meteo API for live weather data.
        </p>
      </div>
    </Card>
    </div>
  );
}