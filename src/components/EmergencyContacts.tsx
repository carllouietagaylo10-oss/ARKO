import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, Users, Building, Wifi, Utensils, AlertTriangle, CheckCircle, XCircle, Navigation, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { JellyfishPhone, JellyfishIcon } from './ColorfulIcons';
import { ArkoAvatar } from './ArkoAvatar';
import { toast } from 'sonner@2.0.3';

interface EvacuationCenter {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  capacity: number;
  currentOccupancy: number;
  facilities: string[];
  primaryContact: string;
  secondaryContact: string;
  emergencyContact: string;
  status: 'available' | 'full' | 'maintenance' | 'nearly-full';
  estimatedDistance: string;
  estimatedTravelTime: string;
  priority: number; // 1 = highest priority (closest/best), 5 = lowest
  lastUpdated: string;
  alternativeCenters?: string[]; // IDs of alternative centers
  specialNotes?: string;
  acceptingNewEvacuees: boolean;
}

const evacuationCenters: EvacuationCenter[] = [
  {
    id: 'valencia-gym',
    name: 'Valencia City Gymnasium',
    address: 'Capitol Drive, Valencia City, Bukidnon',
    coordinates: { lat: 7.9120, lng: 125.0865 },
    capacity: 500,
    currentOccupancy: 45,
    facilities: ['Medical Aid', 'Kitchen', 'Generator', 'Wi-Fi', 'Restrooms', 'Security'],
    primaryContact: '+63 88 000-1001',
    secondaryContact: '+63 88 000-1002',
    emergencyContact: '+63 88 000-1000',
    status: 'available',
    estimatedDistance: '2.1 km',
    estimatedTravelTime: '8 mins',
    priority: 1,
    lastUpdated: 'Just now',
    alternativeCenters: ['valencia-hall', 'valencia-elem'],
    specialNotes: 'Primary evacuation center with full medical facilities',
    acceptingNewEvacuees: true
  },
  {
    id: 'valencia-hall',
    name: 'Valencia City Hall Multi-Purpose Hall',
    address: 'Poblacion, Valencia City, Bukidnon',
    coordinates: { lat: 7.9125, lng: 125.0870 },
    capacity: 300,
    currentOccupancy: 240,
    facilities: ['Medical Aid', 'Communication Center', 'Restrooms', 'Security'],
    primaryContact: '+63 88 000-2001',
    secondaryContact: '+63 88 000-2002',
    emergencyContact: '+63 88 000-2000',
    status: 'nearly-full',
    estimatedDistance: '1.5 km',
    estimatedTravelTime: '6 mins',
    priority: 2,
    lastUpdated: '2 minutes ago',
    alternativeCenters: ['valencia-gym', 'valencia-elem', 'barangay-center'],
    specialNotes: 'Municipal command center - limited space remaining',
    acceptingNewEvacuees: true
  },
  {
    id: 'valencia-elem',
    name: 'Valencia Central Elementary School',
    address: 'San Isidro, Valencia City, Bukidnon',
    coordinates: { lat: 7.9130, lng: 125.0850 },
    capacity: 400,
    currentOccupancy: 320,
    facilities: ['Classrooms', 'Kitchen', 'Water Tank', 'Restrooms', 'Playground'],
    primaryContact: '+63 88 000-3001',
    secondaryContact: '+63 88 000-3002',
    emergencyContact: '+63 88 000-3000',
    status: 'nearly-full',
    estimatedDistance: '2.8 km',
    estimatedTravelTime: '12 mins',
    priority: 3,
    lastUpdated: '5 minutes ago',
    alternativeCenters: ['valencia-gym', 'barangay-center', 'lourdes-chapel'],
    specialNotes: 'Family-friendly with playground area for children',
    acceptingNewEvacuees: true
  },
  {
    id: 'valencia-covered',
    name: 'Valencia Covered Court',
    address: 'Brgy. Poblacion, Valencia City, Bukidnon',
    coordinates: { lat: 7.9115, lng: 125.0875 },
    capacity: 200,
    currentOccupancy: 200,
    facilities: ['Basic Shelter', 'Restrooms', 'Water Access'],
    primaryContact: '+63 88 000-4001',
    secondaryContact: '+63 88 000-4002',
    emergencyContact: '+63 88 000-4000',
    status: 'full',
    estimatedDistance: '1.8 km',
    estimatedTravelTime: '7 mins',
    priority: 4,
    lastUpdated: '1 minute ago',
    alternativeCenters: ['valencia-hall', 'barangay-center', 'lourdes-chapel'],
    specialNotes: 'FULL - Please proceed to alternative centers',
    acceptingNewEvacuees: false
  },
  {
    id: 'barangay-center',
    name: 'Barangay Community Center',
    address: 'San Carlos, Valencia City, Bukidnon',
    coordinates: { lat: 7.9100, lng: 125.0880 },
    capacity: 150,
    currentOccupancy: 25,
    facilities: ['Community Kitchen', 'Meeting Hall', 'Generator', 'Restrooms'],
    primaryContact: '+63 88 000-5001',
    secondaryContact: '+63 88 000-5002',
    emergencyContact: '+63 88 000-5000',
    status: 'available',
    estimatedDistance: '3.2 km',
    estimatedTravelTime: '15 mins',
    priority: 2,
    lastUpdated: '3 minutes ago',
    alternativeCenters: ['valencia-gym', 'valencia-hall'],
    specialNotes: 'Plenty of space available - community kitchen operational',
    acceptingNewEvacuees: true
  },
  {
    id: 'lourdes-chapel',
    name: 'Our Lady of Lourdes Chapel Hall',
    address: 'Brgy. Lourdes, Valencia City, Bukidnon',
    coordinates: { lat: 7.9140, lng: 125.0890 },
    capacity: 180,
    currentOccupancy: 35,
    facilities: ['Chapel', 'Community Hall', 'Kitchen', 'Restrooms', 'Prayer Area'],
    primaryContact: '+63 88 000-6001',
    secondaryContact: '+63 88 000-6002',
    emergencyContact: '+63 88 000-6000',
    status: 'available',
    estimatedDistance: '4.1 km',
    estimatedTravelTime: '18 mins',
    priority: 3,
    lastUpdated: '4 minutes ago',
    alternativeCenters: ['barangay-center', 'valencia-gym'],
    specialNotes: 'Peaceful environment with spiritual support available',
    acceptingNewEvacuees: true
  },
  {
    id: 'valencia-high',
    name: 'Valencia National High School',
    address: 'Brgy. Bagontaas, Valencia City, Bukidnon',
    coordinates: { lat: 7.9080, lng: 125.0820 },
    capacity: 600,
    currentOccupancy: 145,
    facilities: ['Multiple Classrooms', 'Cafeteria', 'Library', 'Gymnasium', 'Medical Room'],
    primaryContact: '+63 88 000-7001',
    secondaryContact: '+63 88 000-7002',
    emergencyContact: '+63 88 000-7000',
    status: 'available',
    estimatedDistance: '5.3 km',
    estimatedTravelTime: '22 mins',
    priority: 1,
    lastUpdated: '6 minutes ago',
    alternativeCenters: ['valencia-gym', 'barangay-center'],
    specialNotes: 'Largest capacity center - multiple buildings available',
    acceptingNewEvacuees: true
  }
];

const emergencyServices = [
  {
    name: 'City Rescue / DRRMC Valencia City',
    number: '+63956-135-2663',
    description: '24/7 Emergency Response & Rescue',
    type: 'primary',
    icon: '🚨'
  },
  {
    name: 'City Rescue / DRRMC Valencia (Landline)',
    number: '088-828-2411',
    description: 'Local Emergency Rescue Hotline',
    type: 'primary',
    icon: '📞'
  },
  {
    name: 'Bureau of Fire Protection Valencia',
    number: '088-828-1481',
    description: 'Fire & Rescue Services',
    type: 'emergency',
    icon: '🚒'
  },
  {
    name: 'Fire Department (Mobile)',
    number: '+63926-190-3020',
    description: 'Fire Department Mobile Unit',
    type: 'emergency',
    icon: '🔥'
  },
  {
    name: 'Valencia City Police Station',
    number: '088-828-3721',
    description: 'Law Enforcement Services',
    type: 'emergency',
    icon: '👮'
  },
  {
    name: 'Police Mobile Unit',
    number: '+63917-718-9191',
    description: 'Police Mobile Response',
    type: 'emergency',
    icon: '🚔'
  },
  {
    name: 'Adventist Medical Center Valencia',
    number: '+63965-192-4530',
    description: '24/7 Medical Emergency',
    type: 'medical',
    icon: '🏥'
  },
  {
    name: 'Valencia City Information',
    number: '088-828-0000',
    description: 'City Government Information',
    type: 'support',
    icon: '🏛️'
  }
];

interface EmergencyContactsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyContacts({ isOpen, onClose }: EmergencyContactsProps) {
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [calling, setCalling] = useState<string | null>(null);
  const [centers, setCenters] = useState<EvacuationCenter[]>(evacuationCenters);
  const [showAlternatives, setShowAlternatives] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleCall = async (number: string, name: string) => {
    setCalling(number);
    
    // Simulate call initiation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      window.location.href = `tel:${number}`;
      toast.success(`Calling ${name}`, {
        description: `Dialing ${number}...`
      });
    } catch (error) {
      toast.error(`Failed to initiate call to ${name}`);
    } finally {
      setCalling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'nearly-full': return 'bg-orange-500';
      case 'full': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={14} />;
      case 'nearly-full': return <AlertTriangle size={14} />;
      case 'full': return <XCircle size={14} />;
      case 'maintenance': return <RefreshCw size={14} />;
      default: return <AlertTriangle size={14} />;
    }
  };

  // Auto-refresh evacuation center data
  useEffect(() => {
    if (!autoRefresh || !isOpen) return;

    const interval = setInterval(() => {
      // Simulate real-time updates with smaller changes to prevent chaos
      setCenters(prev => prev.map(center => {
        const occupancyChange = Math.floor(Math.random() * 11) - 5; // -5 to +5
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
          acceptingNewEvacuees: newStatus !== 'full' && newStatus !== 'maintenance',
          lastUpdated: `${Math.floor(Math.random() * 5) + 1} minutes ago`
        };
      }));
      setLastRefresh(new Date());
    }, 45000); // Update every 45 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isOpen]);

  const handleCenterFull = (center: EvacuationCenter) => {
    if (center.status === 'full' && center.alternativeCenters) {
      const alternatives = centers.filter(c => 
        center.alternativeCenters?.includes(c.id) && c.acceptingNewEvacuees
      );
      
      if (alternatives.length > 0) {
        const sortedAlternatives = alternatives.sort((a, b) => a.priority - b.priority);
        const recommended = sortedAlternatives[0];
        
        toast.error(`${center.name} is at full capacity!`, {
          description: `Consider ${recommended.name} - ${recommended.estimatedTravelTime} away`,
          duration: 8000
        });
        
        setShowAlternatives(center.id);
        return true;
      }
    }
    return false;
  };

  const refreshCapacityData = () => {
    setCenters(prev => prev.map(center => ({
      ...center,
      lastUpdated: 'Just now'
    })));
    setLastRefresh(new Date());
    toast.success('Evacuation center data refreshed');
  };

  const getRecommendedCenters = () => {
    return centers
      .filter(center => center.acceptingNewEvacuees)
      .sort((a, b) => {
        // Sort by priority first, then by available capacity
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        const aCapacityRatio = a.currentOccupancy / a.capacity;
        const bCapacityRatio = b.currentOccupancy / b.capacity;
        return aCapacityRatio - bCapacityRatio;
      })
      .slice(0, 3);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'nearly-full': return 'Nearly Full';
      case 'full': return 'Full';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArkoAvatar size={40} animated={true} severity="high" showSparkles={true} />
              <div>
                <h2 className="m-0">Emergency Contacts & Evacuation Centers</h2>
                <p className="text-sm opacity-90 m-0">Valencia City Flood Response Network - Live Updates</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-80">Last updated: {lastRefresh.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={refreshCapacityData}
                className="text-white hover:bg-white/20"
                title="Refresh capacity data"
              >
                <RefreshCw size={16} />
              </Button>
              <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
                ×
              </Button>
            </div>
          </div>
        </div>

        <div className="flex max-h-full">
          {/* Emergency Services Sidebar */}
          <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
            <h3 className="mb-4 flex items-center gap-2">
              <JellyfishPhone size={20} animated />
              Emergency Hotlines
            </h3>
            
            <div className="space-y-3">
              {emergencyServices.map((service, index) => (
                <Card key={index} className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{service.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="m-0 text-sm font-medium truncate">{service.name}</h4>
                      <p className="text-xs text-gray-600 m-0 mb-2">{service.description}</p>
                      <Button
                        size="sm"
                        className={`w-full text-xs ${
                          service.type === 'primary' ? 'bg-red-600 hover:bg-red-700' :
                          service.type === 'emergency' ? 'bg-orange-600 hover:bg-orange-700' :
                          'bg-blue-600 hover:bg-blue-700'
                        }`}
                        onClick={() => handleCall(service.number, service.name)}
                        disabled={calling === service.number}
                      >
                        <Phone size={12} className="mr-1" />
                        {calling === service.number ? 'Calling...' : service.number}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Evacuation Centers Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <JellyfishIcon type="shield" size={20} color="text-green-500" animated />
                  <h3 className="m-0">Evacuation Centers</h3>
                  <Badge className="bg-blue-500 text-white">
                    Live Capacity
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                  </div>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`w-8 h-4 rounded-full transition-colors ${
                      autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                    } relative`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                      autoRefresh ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
              
              {/* Recommended Centers Alert */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <ArkoAvatar size={32} animated={true} severity="low" showSparkles={false} />
                  <div className="flex-1">
                    <h4 className="m-0 mb-2 text-blue-800">🎯 Recommended Evacuation Centers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {getRecommendedCenters().map((center, index) => (
                        <div key={center.id} className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <div className={`text-lg font-bold ${
                              index === 0 ? 'text-green-600' : 
                              index === 1 ? 'text-blue-600' : 'text-purple-600'
                            }`}>
                              #{index + 1}
                            </div>
                            <Badge className={`text-xs ${getStatusColor(center.status)} text-white`}>
                              {getStatusText(center.status)}
                            </Badge>
                          </div>
                          <h5 className="m-0 mb-1 text-sm font-medium">{center.name}</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <Users size={10} />
                              <span className={getOccupancyColor(center.currentOccupancy, center.capacity)}>
                                {center.currentOccupancy}/{center.capacity}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={10} />
                              {center.estimatedTravelTime}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2 text-xs h-7 bg-gradient-to-r from-blue-500 to-green-500"
                            onClick={() => {
                              const coords = `${center.coordinates.lat},${center.coordinates.lng}`;
                              const url = `https://www.google.com/maps/dir//${coords}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <Navigation size={10} className="mr-1" />
                            Go Now
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 m-0">
                Real-time availability and contact information for Valencia City evacuation centers
              </p>
            </div>

            <div className="grid gap-4">
              {centers.map((center) => (
                <Card
                  key={center.id}
                  className={`p-4 border-2 transition-all cursor-pointer hover:shadow-lg ${
                    selectedCenter === center.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedCenter(selectedCenter === center.id ? null : center.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="m-0">{center.name}</h4>
                        <p className="text-sm text-gray-600 m-0 flex items-center gap-1">
                          <MapPin size={12} />
                          {center.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(center.status)} text-white flex items-center gap-1`}>
                        {getStatusIcon(center.status)}
                        {getStatusText(center.status)}
                      </Badge>
                      {!center.acceptingNewEvacuees && (
                        <Badge className="bg-red-600 text-white animate-pulse">
                          NOT ACCEPTING
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Capacity and Distance Info */}
                  <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-500" />
                      <span className={getOccupancyColor(center.currentOccupancy, center.capacity)}>
                        {center.currentOccupancy}/{center.capacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-500" />
                      <span>{center.estimatedDistance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-500" />
                      <span>{center.estimatedTravelTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw size={14} className="text-gray-500" />
                      <span className="text-xs">{center.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Capacity</span>
                      <span className="text-xs font-medium">
                        {Math.round((center.currentOccupancy / center.capacity) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          center.currentOccupancy / center.capacity >= 0.9 ? 'bg-red-500' :
                          center.currentOccupancy / center.capacity >= 0.8 ? 'bg-orange-500' :
                          center.currentOccupancy / center.capacity >= 0.6 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(center.currentOccupancy / center.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Special Notes */}
                  {center.specialNotes && (
                    <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      💡 {center.specialNotes}
                    </div>
                  )}

                  {/* Full Center Warning and Alternatives */}
                  {center.status === 'full' && center.alternativeCenters && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle size={16} className="text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Center at Full Capacity
                        </span>
                      </div>
                      <p className="text-xs text-red-700 mb-2">
                        This center cannot accept more evacuees. Please proceed to these alternatives:
                      </p>
                      <div className="space-y-2">
                        {center.alternativeCenters.slice(0, 2).map(altId => {
                          const altCenter = centers.find(c => c.id === altId && c.acceptingNewEvacuees);
                          if (!altCenter) return null;
                          return (
                            <div key={altId} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex-1">
                                <div className="text-xs font-medium">{altCenter.name}</div>
                                <div className="text-xs text-gray-600">
                                  {altCenter.estimatedTravelTime} • {altCenter.currentOccupancy}/{altCenter.capacity} capacity
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="text-xs h-7 bg-green-600 hover:bg-green-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const coords = `${altCenter.coordinates.lat},${altCenter.coordinates.lng}`;
                                  const url = `https://www.google.com/maps/dir//${coords}`;
                                  window.open(url, '_blank');
                                  toast.success(`Redirecting to ${altCenter.name}`);
                                }}
                              >
                                <Navigation size={10} className="mr-1" />
                                Go
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Facilities */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {center.facilities.map((facility, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* Main Action Button */}
                    {center.acceptingNewEvacuees ? (
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          const coords = `${center.coordinates.lat},${center.coordinates.lng}`;
                          const url = `https://www.google.com/maps/dir//${coords}`;
                          window.open(url, '_blank');
                          toast.success(`Navigation started to ${center.name}`);
                        }}
                      >
                        <Navigation size={14} className="mr-2" />
                        Get Directions to Center
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full bg-gray-400 text-gray-700 cursor-not-allowed"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCenterFull(center);
                        }}
                      >
                        <XCircle size={14} className="mr-2" />
                        Center Full - View Alternatives
                      </Button>
                    )}

                    {/* Contact Numbers */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(center.primaryContact, `${center.name} - Primary`);
                        }}
                        disabled={calling === center.primaryContact}
                      >
                        <Phone size={10} className="mr-1" />
                        {calling === center.primaryContact ? 'Calling...' : 'Primary'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(center.secondaryContact, `${center.name} - Secondary`);
                        }}
                        disabled={calling === center.secondaryContact}
                      >
                        <Phone size={10} className="mr-1" />
                        {calling === center.secondaryContact ? 'Calling...' : 'Secondary'}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(center.emergencyContact, `${center.name} - Emergency`);
                        }}
                        disabled={calling === center.emergencyContact}
                      >
                        <Phone size={10} className="mr-1" />
                        {calling === center.emergencyContact ? 'Calling...' : 'Emergency'}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedCenter === center.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Coordinates:</strong>
                          <br />
                          {center.coordinates.lat}, {center.coordinates.lng}
                        </div>
                        <div>
                          <strong>Current Status:</strong>
                          <br />
                          {center.status === 'available' && 'Ready to receive evacuees'}
                          {center.status === 'full' && 'At maximum capacity'}
                          {center.status === 'maintenance' && 'Under maintenance'}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const coords = `${center.coordinates.lat},${center.coordinates.lng}`;
                            const url = `https://www.google.com/maps/dir//${coords}`;
                            window.open(url, '_blank');
                            toast.success(`Opening directions to ${center.name}`);
                          }}
                        >
                          <MapPin size={14} className="mr-1" />
                          Get Directions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const coords = `${center.coordinates.lat},${center.coordinates.lng}`;
                            navigator.clipboard.writeText(coords);
                            toast.success('Coordinates copied to clipboard');
                          }}
                        >
                          Copy Coordinates
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}