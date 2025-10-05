import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface LocationData {
  barangay: string;
  municipality: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  accuracy: number;
}

// Mock barangays in Valencia City for demonstration
const mockBarangays = [
  'Brgy. Poblacion',
  'Brgy. Poblacion Riverside', 
  'Brgy. Bagontaas',
  'Brgy. Lumbayao',
  'Brgy. Mailag',
  'Brgy. Banlag',
  'Brgy. Tongantongan'
];

export function LocationService() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock location detection with timeout protection
  const detectLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Reduced delay to prevent timeouts
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, randomly select a barangay
      const randomBarangay = mockBarangays[Math.floor(Math.random() * mockBarangays.length)];
      
      const mockLocation: LocationData = {
        barangay: randomBarangay,
        municipality: 'Valencia City, Bukidnon',
        coordinates: {
          latitude: 7.9125 + (Math.random() - 0.5) * 0.01,
          longitude: 125.0864 + (Math.random() - 0.5) * 0.01
        },
        accuracy: Math.floor(Math.random() * 20) + 5
      };
      
      setLocation(mockLocation);
    } catch (err) {
      setError('Unable to detect location. Please check GPS settings.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  const getRiskBadge = (barangay: string) => {
    if (barangay.includes('Riverside') || barangay.includes('Poblacion')) {
      return <Badge className="bg-red-500 text-white">High Risk Area</Badge>;
    } else if (barangay.includes('Bagontaas') || barangay.includes('Lumbayao')) {
      return <Badge className="bg-orange-500 text-white">Moderate Risk</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">Safe Area</Badge>;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="m-0">Your Location</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={detectLocation}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="m-0">Detecting your location...</p>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {location && !loading && (
        <div className="space-y-3">
          <div>
            <p className="m-0">{location.barangay}</p>
            <p className="text-sm text-muted-foreground m-0">{location.municipality}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {getRiskBadge(location.barangay)}
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="m-0">Coordinates: {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}</p>
            <p className="m-0">Accuracy: ±{location.accuracy}m</p>
          </div>
        </div>
      )}
    </Card>
  );
}