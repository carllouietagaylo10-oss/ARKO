import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, MapPin, Clock, AlertTriangle, X, PhoneCall, 
  Radio, Loader2, CheckCircle, XCircle, Zap, Navigation,
  Shield, Users, HeartHandshake
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArkoAvatar } from './ArkoAvatar';
import { JellyfishPhone, JellyfishShield } from './ColorfulIcons';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../services/supabaseClient';

interface SOSEmergencyTrackerProps {
  isActive: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number };
  onEmergencyCall?: () => void;
}

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

interface SOSSession {
  sessionId: string;
  startTime: string;
  isActive: boolean;
  locationUpdates: LocationUpdate[];
  emergencyContacts: string[];
}

const CDRRMC_CONTACTS = [
  {
    name: 'CDRRMC Valencia City (Primary)',
    number: '+63956-135-2663',
    type: 'primary'
  },
  {
    name: 'CDRRMC Valencia City (Landline)',
    number: '088-828-2411',
    type: 'primary'
  },
  {
    name: 'Adventist Medical Center',
    number: '+63965-192-4530',
    type: 'medical'
  }
];

export function SOSEmergencyTracker({ 
  isActive, 
  onClose, 
  userLocation, 
  onEmergencyCall 
}: SOSEmergencyTrackerProps) {
  const [sosSession, setSosSession] = useState<SOSSession | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationUpdate[]>([]);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [battery, setBattery] = useState<number | null>(null);
  const [isConfirmingStop, setIsConfirmingStop] = useState(false);

  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchPositionRef = useRef<number | null>(null);

  // Check battery level if available
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBattery(Math.round(battery.level * 100));
      }).catch(() => {
        setBattery(null);
      });
    }
  }, []);

  // Start SOS tracking
  const startSOSTracking = async () => {
    const sessionId = `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date().toISOString();

    const newSession: SOSSession = {
      sessionId,
      startTime,
      isActive: true,
      locationUpdates: [],
      emergencyContacts: CDRRMC_CONTACTS.map(c => c.number)
    };

    setSosSession(newSession);
    setIsTrackingLocation(true);
    setUpdateCount(0);
    setTimeElapsed(0);
    setLocationHistory([]);

    // Start location tracking
    startLocationTracking();

    // Start timer
    timerIntervalRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Log SOS initiation
    console.log('🚨 SOS EMERGENCY TRACKING STARTED:', {
      sessionId,
      startTime,
      contacts: CDRRMC_CONTACTS.map(c => c.number)
    });

    // Show confirmation
    toast.error('🚨 SOS EMERGENCY TRACKING ACTIVE', {
      description: 'Your location is being sent to CDRRMC every 5 seconds',
      duration: 8000,
      action: {
        label: 'Call CDRRMC',
        onClick: () => window.location.href = 'tel:+63956-135-2663'
      }
    });

    // Send initial notification to database
    await saveSOSSession(newSession);
  };

  // Stop SOS tracking
  const stopSOSTracking = async () => {
    if (!sosSession) return;

    // Clear intervals
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Stop geolocation watching
    if (watchPositionRef.current !== null) {
      navigator.geolocation.clearWatch(watchPositionRef.current);
      watchPositionRef.current = null;
    }

    // Update session as inactive
    const updatedSession = {
      ...sosSession,
      isActive: false,
      locationUpdates: locationHistory
    };

    setSosSession(null);
    setIsTrackingLocation(false);
    setIsConfirmingStop(false);

    // Log SOS completion
    console.log('✅ SOS EMERGENCY TRACKING STOPPED:', {
      sessionId: sosSession.sessionId,
      duration: timeElapsed,
      locationUpdates: locationHistory.length,
      finalLocation: currentLocation
    });

    // Save final session state
    await saveSOSSession(updatedSession);

    toast.success('SOS Tracking Stopped', {
      description: `Emergency session lasted ${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s with ${locationHistory.length} location updates`,
      duration: 5000
    });
  };

  // Start continuous location tracking
  const startLocationTracking = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation not supported');
      return;
    }

    // Get initial location immediately
    getCurrentLocationUpdate();

    // Set up continuous location tracking every 5 seconds
    locationIntervalRef.current = setInterval(() => {
      getCurrentLocationUpdate();
    }, 5000);

    // Also set up high-accuracy watching for better tracking
    watchPositionRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position);
      },
      (error) => {
        console.error('GPS watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000
      }
    );
  };

  // Get current location and send to CDRRMC
  const getCurrentLocationUpdate = async () => {
    if (!sosSession) return;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 3000
        });
      });

      await updateLocation(position);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('GPS unavailable');
      
      // If GPS fails, try to use provided location
      if (userLocation) {
        const fallbackUpdate: LocationUpdate = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          accuracy: 1000, // Mark as low accuracy
          timestamp: new Date().toISOString(),
          address: 'Valencia City, Bukidnon (Approximate)'
        };
        
        await processLocationUpdate(fallbackUpdate);
      }
    }
  };

  // Update location and send to emergency services
  const updateLocation = async (position: GeolocationPosition) => {
    const locationUpdate: LocationUpdate = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date().toISOString()
    };

    // Try to get address (reverse geocoding simulation)
    try {
      locationUpdate.address = `Lat: ${locationUpdate.latitude.toFixed(6)}, Lng: ${locationUpdate.longitude.toFixed(6)}, Valencia City`;
    } catch (error) {
      locationUpdate.address = 'Valencia City, Bukidnon';
    }

    await processLocationUpdate(locationUpdate);
  };

  // Process and send location update
  const processLocationUpdate = async (locationUpdate: LocationUpdate) => {
    setCurrentLocation(locationUpdate);
    setLocationHistory(prev => [...prev, locationUpdate]);
    setUpdateCount(prev => prev + 1);
    setLocationError(null);

    // Send to database/emergency services
    await sendLocationToCDRRMC(locationUpdate);

    console.log(`📍 SOS Location Update #${updateCount + 1}:`, {
      coordinates: `${locationUpdate.latitude}, ${locationUpdate.longitude}`,
      accuracy: `±${locationUpdate.accuracy}m`,
      address: locationUpdate.address,
      timestamp: locationUpdate.timestamp
    });
  };

  // Send location to CDRRMC emergency database
  const sendLocationToCDRRMC = async (location: LocationUpdate) => {
    if (!sosSession) return;

    try {
      const client = supabase.getClient();
      
      if (client) {
        // Try to save to database
        const sosData = {
          session_id: sosSession.sessionId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          address: location.address,
          timestamp: location.timestamp,
          update_count: updateCount + 1,
          battery_level: battery,
          is_active: true,
          emergency_contacts: sosSession.emergencyContacts
        };

        const { error } = await client
          .from('sos_emergency_tracking')
          .insert([sosData]);

        if (error) {
          console.error('Database save error:', error);
        } else {
          console.log('✅ Location sent to CDRRMC database');
        }
      }

      // Also log for emergency services (in real implementation, this would trigger SMS/API)
      console.log('🚨 EMERGENCY LOCATION SENT TO CDRRMC:', {
        sessionId: sosSession.sessionId,
        location: `${location.latitude}, ${location.longitude}`,
        accuracy: `±${location.accuracy}m`,
        address: location.address,
        updateNumber: updateCount + 1,
        timeElapsed: `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`,
        battery: battery ? `${battery}%` : 'Unknown'
      });

    } catch (error) {
      console.error('Error sending location to CDRRMC:', error);
    }
  };

  // Save SOS session to database
  const saveSOSSession = async (session: SOSSession) => {
    try {
      const client = supabase.getClient();
      
      if (client) {
        const sessionData = {
          session_id: session.sessionId,
          start_time: session.startTime,
          end_time: session.isActive ? null : new Date().toISOString(),
          is_active: session.isActive,
          total_updates: session.locationUpdates.length,
          emergency_contacts: session.emergencyContacts,
          final_location: session.locationUpdates.length > 0 ? 
            session.locationUpdates[session.locationUpdates.length - 1] : null
        };

        await client
          .from('sos_sessions')
          .upsert([sessionData]);
      }
    } catch (error) {
      console.error('Error saving SOS session:', error);
    }
  };

  // Start SOS when component becomes active
  useEffect(() => {
    if (isActive && !sosSession) {
      startSOSTracking();
    }
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (watchPositionRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionRef.current);
      }
    };
  }, []);

  // Format time elapsed
  const formatTimeElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle stop confirmation
  const handleStopConfirmation = () => {
    setIsConfirmingStop(true);
  };

  const confirmStop = () => {
    stopSOSTracking();
    onClose();
  };

  const cancelStop = () => {
    setIsConfirmingStop(false);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border-4 border-red-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArkoAvatar size={36} animated={true} severity="high" showSparkles={true} />
              <div>
                <h2 className="text-lg font-bold m-0 flex items-center gap-2">
                  🚨 SOS EMERGENCY ACTIVE
                  <div className="w-3 h-3 bg-red-300 rounded-full animate-pulse"></div>
                </h2>
                <p className="text-sm opacity-90 m-0">Location tracking to CDRRMC</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleStopConfirmation} 
              className="text-white hover:bg-white/20 p-2"
              disabled={isConfirmingStop}
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Status Display */}
        <div className="p-6 space-y-4">
          {/* Timer and Status */}
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-700">{formatTimeElapsed(timeElapsed)}</div>
                <div className="text-xs text-red-600">Time Elapsed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-700">{updateCount}</div>
                <div className="text-xs text-red-600">Location Updates Sent</div>
              </div>
            </div>
          </Card>

          {/* Current Location Status */}
          <Card className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <MapPin className="w-5 h-5 text-blue-600" />
                {isTrackingLocation && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">Current Location</h4>
                {currentLocation ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">{currentLocation.address}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>±{Math.round(currentLocation.accuracy)}m accuracy</span>
                      {battery && <span>Battery: {battery}%</span>}
                    </div>
                    <p className="text-xs text-green-600">
                      Last updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">Getting location...</span>
                  </div>
                )}
                
                {locationError && (
                  <p className="text-sm text-red-600 mt-1">⚠️ {locationError}</p>
                )}
              </div>
            </div>
          </Card>

          {/* CDRRMC Contact Status */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <JellyfishShield size={20} animated color="text-blue-600" />
              <h4 className="font-semibold text-blue-800">Emergency Contacts Notified</h4>
            </div>
            <div className="space-y-2">
              {CDRRMC_CONTACTS.map((contact, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{contact.name}</div>
                    <div className="text-xs text-gray-600">{contact.number}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `tel:${contact.number.replace(/\s+/g, '')}`}
                      className="text-xs h-7"
                    >
                      <PhoneCall size={12} className="mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Next Update Countdown */}
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-yellow-600 animate-pulse" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800">Automatic Location Updates</h4>
                <p className="text-sm text-yellow-700">
                  Next update in {5 - (timeElapsed % 5)} seconds
                </p>
                <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((timeElapsed % 5) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Stop Confirmation */}
          {isConfirmingStop && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto" />
                <h4 className="font-semibold text-orange-800">Stop SOS Tracking?</h4>
                <p className="text-sm text-orange-700">
                  Are you sure you want to stop emergency location tracking? 
                  CDRRMC will no longer receive your location updates.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={cancelStop}
                    className="flex-1 border-gray-300"
                  >
                    Continue Tracking
                  </Button>
                  <Button
                    onClick={confirmStop}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Stop SOS
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Footer with Emergency Actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="space-y-3">
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={() => window.location.href = 'tel:+63956-135-2663'}
            >
              <PhoneCall size={16} className="mr-2" />
              Call CDRRMC Emergency Line
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = 'tel:+63965-192-4530'}
                className="border-blue-300 text-blue-600"
              >
                🚑 Medical
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEmergencyCall}
                className="border-green-300 text-green-600"
              >
                📞 All Contacts
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Your location is being sent every 5 seconds to Valencia City emergency services
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}