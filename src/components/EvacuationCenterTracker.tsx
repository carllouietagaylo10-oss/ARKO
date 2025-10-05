import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, MapPin, Clock, AlertTriangle, CheckCircle, Navigation, Phone } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArkoAvatar } from './ArkoAvatar';
import { toast } from 'sonner@2.0.3';

interface EvacuationCenter {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'full' | 'maintenance' | 'nearly-full';
  estimatedDistance: string;
  estimatedTravelTime: string;
  acceptingNewEvacuees: boolean;
  alternativeCenters?: string[];
  primaryContact: string;
}

// Using stable initial data to prevent infinite loops
const initialCenters: EvacuationCenter[] = [
  {
    id: 'valencia-gym',
    name: 'Valencia City Gymnasium',
    address: 'Capitol Drive, Valencia City',
    coordinates: { lat: 7.9120, lng: 125.0865 },
    capacity: 500,
    currentOccupancy: 45,
    status: 'available',
    estimatedDistance: '2.1 km',
    estimatedTravelTime: '8 mins',
    acceptingNewEvacuees: true,
    alternativeCenters: ['valencia-hall', 'valencia-elem'],
    primaryContact: '+63 88 000-1001'
  },
  {
    id: 'valencia-hall',
    name: 'Valencia City Hall',
    address: 'Poblacion, Valencia City',
    coordinates: { lat: 7.9125, lng: 125.0870 },
    capacity: 300,
    currentOccupancy: 240,
    status: 'nearly-full',
    estimatedDistance: '1.5 km',
    estimatedTravelTime: '6 mins',
    acceptingNewEvacuees: true,
    alternativeCenters: ['valencia-gym', 'valencia-elem'],
    primaryContact: '+63 88 000-2001'
  },
  {
    id: 'valencia-elem',
    name: 'Valencia Central Elementary',
    address: 'San Isidro, Valencia City',
    coordinates: { lat: 7.9130, lng: 125.0850 },
    capacity: 400,
    currentOccupancy: 320,
    status: 'nearly-full',
    estimatedDistance: '2.8 km',
    estimatedTravelTime: '12 mins',
    acceptingNewEvacuees: true,
    alternativeCenters: ['valencia-gym', 'valencia-high'],
    primaryContact: '+63 88 000-3001'
  }
];

interface EvacuationCenterTrackerProps {
  isVisible?: boolean;
  onEmergencyCall?: () => void;
}

export function EvacuationCenterTracker({ 
  isVisible = true, 
  onEmergencyCall 
}: EvacuationCenterTrackerProps) {
  const [centers, setCenters] = useState<EvacuationCenter[]>(initialCenters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Memoize expensive computations
  const availableCenters = useMemo(() => {
    return centers.filter(center => center.acceptingNewEvacuees);
  }, [centers]);

  const recommendedCenter = useMemo(() => {
    return availableCenters.sort((a, b) => {
      const aRatio = a.currentOccupancy / a.capacity;
      const bRatio = b.currentOccupancy / b.capacity;
      return aRatio - bRatio;
    })[0];
  }, [availableCenters]);

  // Stable update function to prevent infinite loops
  const updateCenters = useCallback(() => {
    const now = Date.now();
    // Only update if enough time has passed
    if (now - lastUpdate < 60000) return; // Minimum 1 minute between updates

    try {
      setCenters(prev => {
        if (!prev || prev.length === 0) return prev;
        
        return prev.map(center => {
          const occupancyChange = Math.floor(Math.random() * 6) - 3; // -3 to +3 for smaller changes
          const newOccupancy = Math.max(0, Math.min(center.capacity, center.currentOccupancy + occupancyChange));
          
          let newStatus = center.status;
          if (newOccupancy >= center.capacity) {
            newStatus = 'full';
          } else if (newOccupancy >= center.capacity * 0.8) {
            newStatus = 'nearly-full';
          } else {
            newStatus = 'available';
          }

          return {
            ...center,
            currentOccupancy: newOccupancy,
            status: newStatus,
            acceptingNewEvacuees: newStatus !== 'full' && newStatus !== 'maintenance'
          };
        });
      });
      setLastUpdate(now);
    } catch (error) {
      console.error('Error updating evacuation centers:', error);
    }
  }, [lastUpdate]);

  // Simulate real-time updates with better control
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(updateCenters, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, [isVisible, updateCenters]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'nearly-full': return 'text-orange-600';
      case 'full': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, []);

  if (!isVisible) return null;

  // Add error protection
  if (!centers || centers.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 left-4 z-40"
    >
      <Card className="bg-white/95 backdrop-blur-md shadow-xl border-2 border-blue-200 max-w-sm">
        {/* Compact Header */}
        <div 
          className="p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <ArkoAvatar size={32} animated={true} severity="low" showSparkles={false} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="m-0 text-sm font-semibold">Evacuation Centers</h4>
                <Badge className="bg-green-500 text-white text-xs animate-pulse">
                  LIVE
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                {availableCenters.length} centers available
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Recommended</div>
              {recommendedCenter && (
                <div className="text-sm font-medium text-blue-600">
                  {recommendedCenter.estimatedTravelTime}
                </div>
              )}
            </div>
          </div>

          {/* Quick Status Bar */}
          <div className="mt-3">
            <div className="flex gap-1">
              {centers.slice(0, 3).map(center => {
                const ratio = center.currentOccupancy / center.capacity;
                return (
                  <div
                    key={center.id}
                    className={`flex-1 h-2 rounded-full ${
                      ratio >= 1 ? 'bg-red-500' :
                      ratio >= 0.8 ? 'bg-orange-500' :
                      ratio >= 0.6 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    title={`${center.name}: ${Math.round(ratio * 100)}% full`}
                  />
                );
              })}
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              Tap to {isExpanded ? 'collapse' : 'expand'} details
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Recommended Center */}
                {recommendedCenter && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Recommended Center
                      </span>
                    </div>
                    <h5 className="m-0 mb-1 text-sm font-semibold">
                      {recommendedCenter.name}
                    </h5>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Users size={10} />
                          <span>{recommendedCenter.currentOccupancy}/{recommendedCenter.capacity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>{recommendedCenter.estimatedTravelTime}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="h-1 bg-green-500 rounded-full"
                          style={{ 
                            width: `${(recommendedCenter.currentOccupancy / recommendedCenter.capacity) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-7"
                        onClick={() => {
                          const coords = `${recommendedCenter.coordinates.lat},${recommendedCenter.coordinates.lng}`;
                          const url = `https://www.google.com/maps/dir//${coords}`;
                          window.open(url, '_blank');
                          toast.success(`Navigation to ${recommendedCenter.name}`);
                        }}
                      >
                        <Navigation size={10} className="mr-1" />
                        Go Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => {
                          window.location.href = `tel:${recommendedCenter.primaryContact}`;
                        }}
                      >
                        <Phone size={10} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Other Centers Summary */}
                <div className="space-y-2">
                  <h6 className="m-0 text-xs font-medium text-gray-700">Other Centers</h6>
                  {centers.filter(c => c.id !== recommendedCenter?.id).map(center => (
                    <div key={center.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="text-xs font-medium truncate">{center.name}</div>
                        <div className="text-xs text-gray-600">
                          <span className={getStatusColor(center.status)}>
                            {center.currentOccupancy}/{center.capacity}
                          </span>
                          {' • '}
                          {center.estimatedTravelTime}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {center.status === 'full' ? (
                          <AlertTriangle size={14} className="text-red-500" />
                        ) : center.status === 'nearly-full' ? (
                          <AlertTriangle size={14} className="text-orange-500" />
                        ) : (
                          <CheckCircle size={14} className="text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Emergency Contact */}
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-xs h-8"
                  onClick={() => {
                    if (onEmergencyCall) {
                      onEmergencyCall();
                    } else {
                      window.location.href = 'tel:+6388000000';
                    }
                  }}
                >
                  <Phone size={12} className="mr-1" />
                  Emergency Hotline
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}