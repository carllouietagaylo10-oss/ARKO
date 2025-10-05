import React, { useState, useEffect } from 'react';
import { 
  Navigation, MapPin, Clock, Users, Phone, Car, Footprints, 
  AlertTriangle, CheckCircle, X, ExternalLink, Route, 
  Shield, Home, RefreshCw, Zap
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArkoAvatar } from './ArkoAvatar';
import { JellyfishShield, JellyfishMap } from './ColorfulIcons';
import { toast } from 'sonner@2.0.3';

interface EvacuationRouteFinderProps {
  isVisible: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number };
}

interface EvacuationCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  distance: string;
  travelTime: string;
  status: 'available' | 'nearly-full' | 'full';
  facilities: string[];
  contactNumber: string;
  routeType: 'walking' | 'driving';
  safetyLevel: 'safe' | 'caution' | 'dangerous';
  lastUpdated: string;
}

interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  warning?: string;
}

const valenciaCenters: EvacuationCenter[] = [
  {
    id: 'valencia-gym',
    name: 'Valencia City Gymnasium',
    address: 'Capitol Drive, Valencia City, Bukidnon',
    latitude: 7.9135,
    longitude: 125.0874,
    capacity: 500,
    currentOccupancy: 45,
    distance: '2.1 km',
    travelTime: '8 min drive / 25 min walk',
    status: 'available',
    facilities: ['Medical Aid', 'Kitchen', 'Generator', 'Wi-Fi', 'Restrooms', 'Security'],
    contactNumber: '+63 88 828-2411',
    routeType: 'driving',
    safetyLevel: 'safe',
    lastUpdated: 'Just now'
  },
  {
    id: 'valencia-hall',
    name: 'Valencia City Hall Multi-Purpose Hall',
    address: 'Poblacion, Valencia City, Bukidnon',
    latitude: 7.9125,
    longitude: 125.0870,
    capacity: 300,
    currentOccupancy: 240,
    distance: '1.5 km',
    travelTime: '6 min drive / 18 min walk',
    status: 'nearly-full',
    facilities: ['Medical Aid', 'Communication Center', 'Restrooms', 'Security'],
    contactNumber: '+63 88 828-1234',
    routeType: 'walking',
    safetyLevel: 'safe',
    lastUpdated: '2 minutes ago'
  },
  {
    id: 'valencia-school',
    name: 'Valencia Central Elementary School',
    address: 'San Isidro, Valencia City, Bukidnon',
    latitude: 7.9130,
    longitude: 125.0850,
    capacity: 400,
    currentOccupancy: 320,
    distance: '2.8 km',
    travelTime: '12 min drive / 35 min walk',
    status: 'nearly-full',
    facilities: ['Classrooms', 'Kitchen', 'Water Tank', 'Restrooms', 'Playground'],
    contactNumber: '+63 88 828-5678',
    routeType: 'driving',
    safetyLevel: 'caution',
    lastUpdated: '5 minutes ago'
  },
  {
    id: 'barangay-center',
    name: 'Barangay Community Center',
    address: 'San Carlos, Valencia City, Bukidnon',
    latitude: 7.9100,
    longitude: 125.0880,
    capacity: 150,
    currentOccupancy: 25,
    distance: '3.2 km',
    travelTime: '15 min drive / 40 min walk',
    status: 'available',
    facilities: ['Community Kitchen', 'Meeting Hall', 'Generator', 'Restrooms'],
    contactNumber: '+63 88 828-9012',
    routeType: 'driving',
    safetyLevel: 'safe',
    lastUpdated: '3 minutes ago'
  }
];

export function EvacuationRouteFinder({ isVisible, onClose, userLocation }: EvacuationRouteFinderProps) {
  const [selectedCenter, setSelectedCenter] = useState<EvacuationCenter | null>(null);
  const [centers, setCenters] = useState<EvacuationCenter[]>(valenciaCenters);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Center, 2: Route Details, 3: Navigation
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);

  // Sort centers by priority (availability, distance, safety)
  const getSortedCenters = () => {
    return centers.sort((a, b) => {
      // Priority: available > nearly-full > full
      const statusPriority = { available: 0, 'nearly-full': 1, full: 2 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      
      // Secondary: safety level
      const safetyPriority = { safe: 0, caution: 1, dangerous: 2 };
      if (safetyPriority[a.safetyLevel] !== safetyPriority[b.safetyLevel]) {
        return safetyPriority[a.safetyLevel] - safetyPriority[b.safetyLevel];
      }
      
      // Tertiary: distance (parse and compare)
      const distanceA = parseFloat(a.distance);
      const distanceB = parseFloat(b.distance);
      return distanceA - distanceB;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'nearly-full': return 'bg-yellow-500';
      case 'full': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-600';
      case 'caution': return 'text-yellow-600';
      case 'dangerous': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const generateRouteSteps = (center: EvacuationCenter): RouteStep[] => {
    // This would normally come from a routing API like Google Maps
    return [
      {
        instruction: 'Head southeast on your current street',
        distance: '0.2 km',
        duration: '2 min'
      },
      {
        instruction: 'Turn right onto National Highway',
        distance: '1.1 km',
        duration: '4 min',
        warning: center.safetyLevel === 'caution' ? 'Possible flooding on this stretch' : undefined
      },
      {
        instruction: 'Continue straight past Valencia Public Market',
        distance: '0.5 km',
        duration: '2 min'
      },
      {
        instruction: `Turn left onto ${center.address.split(',')[0]}`,
        distance: '0.3 km',
        duration: '1 min'
      },
      {
        instruction: `Arrive at ${center.name}`,
        distance: '0.0 km',
        duration: '0 min'
      }
    ];
  };

  const selectCenter = (center: EvacuationCenter) => {
    setSelectedCenter(center);
    setCurrentStep(2);
    
    // Generate route
    setIsLoadingRoute(true);
    setTimeout(() => {
      setRouteSteps(generateRouteSteps(center));
      setIsLoadingRoute(false);
      toast.success(`Route to ${center.name} calculated`);
    }, 1500);
  };

  const startNavigation = () => {
    if (!selectedCenter) return;

    // Open in Google Maps
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.latitude},${selectedCenter.longitude}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
    
    toast.success('Navigation started in Google Maps', {
      description: `Navigating to ${selectedCenter.name}`,
      duration: 5000
    });

    // Move to navigation step
    setCurrentStep(3);
  };

  const callCenter = (center: EvacuationCenter) => {
    const phoneNumber = center.contactNumber.replace(/\s+/g, '');
    window.location.href = `tel:${phoneNumber}`;
    toast.success(`Calling ${center.name}`);
  };

  const reset = () => {
    setSelectedCenter(null);
    setCurrentStep(1);
    setRouteSteps([]);
    setIsLoadingRoute(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-green-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArkoAvatar size={36} animated={true} severity="low" showSparkles={true} />
              <div>
                <h2 className="text-lg font-bold m-0">🗺️ Find Evacuation Route</h2>
                <p className="text-sm opacity-90 m-0">Get directions to the nearest safe location</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedCenter && (
                <Button variant="ghost" onClick={reset} className="text-white hover:bg-white/20 text-sm">
                  Reset
                </Button>
              )}
              <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20 p-2">
                <X size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentStep === 1 ? 'Select Evacuation Center' :
               currentStep === 2 ? 'Route Details' : 'Navigation Active'}
            </span>
            <span className="text-xs text-gray-500">Step {currentStep} of 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Step 1: Select Evacuation Center */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <JellyfishMap size={40} animated color="text-green-600" />
                <h3 className="text-xl font-bold text-gray-800 mt-2 mb-1">Choose Your Evacuation Center</h3>
                <p className="text-gray-600 text-sm">Centers are sorted by availability and safety</p>
              </div>
              
              <div className="space-y-4">
                {getSortedCenters().map((center, index) => (
                  <Card
                    key={center.id}
                    className={`p-4 cursor-pointer transition-all border-2 hover:border-green-300 ${
                      index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                    onClick={() => selectCenter(center)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Home className="w-8 h-8 text-green-600" />
                          {index === 0 && (
                            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0">
                              BEST
                            </Badge>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">{center.name}</h4>
                          <p className="text-sm text-gray-600">{center.address}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(center.status)} text-white text-xs`}>
                        {center.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-500" />
                        <span>{center.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-500" />
                        <span className="text-xs">{center.travelTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-500" />
                        <span className="text-xs">{center.currentOccupancy}/{center.capacity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield size={14} className={getSafetyColor(center.safetyLevel)} />
                        <span className={`text-xs ${getSafetyColor(center.safetyLevel)}`}>
                          {center.safetyLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {center.facilities.slice(0, 3).map((facility) => (
                        <Badge key={facility} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                      {center.facilities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{center.facilities.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Updated: {center.lastUpdated}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            callCenter(center);
                          }}
                          className="text-xs h-7"
                        >
                          <Phone size={12} className="mr-1" />
                          Call
                        </Button>
                        <Button size="sm" className="text-xs h-7 bg-green-600 hover:bg-green-700">
                          <Navigation size={12} className="mr-1" />
                          Get Route
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Route Details */}
          {currentStep === 2 && selectedCenter && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Route className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-800 mb-1">Route to {selectedCenter.name}</h3>
                <p className="text-gray-600 text-sm">Review your route before starting navigation</p>
              </div>

              {/* Center Summary */}
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-800">{selectedCenter.name}</h4>
                  <Badge className={`${getStatusColor(selectedCenter.status)} text-white text-xs`}>
                    {selectedCenter.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium ml-2">{selectedCenter.distance}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Travel Time:</span>
                    <span className="font-medium ml-2">{selectedCenter.travelTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium ml-2">{selectedCenter.currentOccupancy}/{selectedCenter.capacity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Safety Level:</span>
                    <span className={`font-medium ml-2 ${getSafetyColor(selectedCenter.safetyLevel)}`}>
                      {selectedCenter.safetyLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Route Steps */}
              {isLoadingRoute ? (
                <Card className="p-6 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-600">Calculating optimal route...</p>
                </Card>
              ) : (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Navigation size={16} />
                    Turn-by-Turn Directions
                  </h4>
                  <div className="space-y-3">
                    {routeSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{step.instruction}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500">{step.distance}</span>
                            <span className="text-xs text-gray-500">{step.duration}</span>
                          </div>
                          {step.warning && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle size={12} className="text-yellow-500" />
                              <span className="text-xs text-yellow-600">{step.warning}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Route Safety Info */}
              {selectedCenter.safetyLevel !== 'safe' && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-yellow-800 mb-1">Route Advisory</h5>
                      <p className="text-sm text-yellow-700">
                        {selectedCenter.safetyLevel === 'caution' 
                          ? 'Exercise caution on this route. Some areas may have minor flooding or obstacles.'
                          : 'This route may be dangerous due to severe flooding or road damage. Consider alternative centers.'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Navigation Active */}
          {currentStep === 3 && selectedCenter && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-1">Navigation Started!</h3>
                <p className="text-gray-600 text-sm">Follow the directions in Google Maps</p>
              </div>

              <Card className="p-6 bg-green-50 border-green-200 text-center">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">En Route to:</h4>
                    <p className="text-lg font-bold text-green-900">{selectedCenter.name}</p>
                    <p className="text-sm text-green-700">{selectedCenter.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600">Estimated Arrival:</span>
                      <div className="font-semibold text-green-800">{selectedCenter.travelTime.split('/')[0]}</div>
                    </div>
                    <div>
                      <span className="text-green-600">Distance Remaining:</span>
                      <div className="font-semibold text-green-800">{selectedCenter.distance}</div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-green-200">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => callCenter(selectedCenter)}
                    >
                      <Phone size={16} className="mr-2" />
                      Call Evacuation Center
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.latitude},${selectedCenter.longitude}`, '_blank')}
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Emergency Contacts */}
              <Card className="p-4 bg-red-50 border-red-200">
                <h5 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <Phone size={16} />
                  Emergency Contacts
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => window.location.href = 'tel:+63956-135-2663'}
                  >
                    🚨 DRRMC: +63956-135-2663
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => window.location.href = 'tel:+63965-192-4530'}
                  >
                    🏥 Medical: +63965-192-4530
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            {currentStep === 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <JellyfishShield size={16} animated color="text-green-600" />
                <span>4 evacuation centers available</span>
              </div>
            )}
            
            {currentStep === 2 && !isLoadingRoute && (
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Choose Different Center
              </Button>
            )}
            
            {currentStep === 3 && (
              <Button variant="outline" onClick={reset}>
                Find Another Route
              </Button>
            )}

            {currentStep === 2 && !isLoadingRoute && (
              <Button 
                onClick={startNavigation}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Navigation size={16} className="mr-2" />
                Start Navigation
              </Button>
            )}

            {currentStep === 1 && (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}

            {currentStep === 3 && (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                <CheckCircle size={16} className="mr-2" />
                Got It!
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}