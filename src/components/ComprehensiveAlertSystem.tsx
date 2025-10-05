import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Volume2, VolumeX, AlertTriangle, MapPin, Clock, Shield, 
  Wind, Navigation, Route, Phone, Zap, Eye, Target, Construction,
  Car, TreePine, Home, Activity, Gauge, Compass, Map
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from './hooks/useLanguage';
import { JellyfishIcon } from './ColorfulIcons';
import { ArkoAvatar } from './ArkoAvatar';

interface StormData {
  center: {
    latitude: number;
    longitude: number;
    location: string;
  };
  intensity: {
    category: number;
    windSpeed: number; // km/h
    pressure: number; // hPa
    movement: {
      direction: string;
      speed: number; // km/h
    };
  };
  forecast: {
    landfallTime: number; // hours
    affectedRadius: number; // km
    riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  };
}

interface EvacuationRoute {
  primary: {
    destination: string;
    distance: number; // km
    estimatedTime: number; // minutes
    route: string[];
    status: 'clear' | 'congested' | 'blocked';
    contact: string;
  };
  alternatives: {
    destination: string;
    distance: number;
    estimatedTime: number;
    route: string[];
    status: 'clear' | 'congested' | 'blocked';
    reason?: string;
    contact: string;
  }[];
}

interface CalamityAlert {
  id: string;
  type: 'typhoon' | 'flood' | 'landslide' | 'storm_surge';
  severity: 'advisory' | 'watch' | 'warning' | 'critical';
  location: string;
  timeToImpact: number; // minutes
  stormData: StormData;
  evacuationRoutes: EvacuationRoute;
  preparations: {
    essential: string[];
    recommended: string[];
    emergency: string[];
  };
  blockedAreas: {
    location: string;
    reason: string;
    alternativeRoute?: string;
  }[];
  emergencyContacts: {
    primary: string[];
    medical: string[];
    rescue: string[];
  };
}

interface ComprehensiveAlertSystemProps {
  isVisible: boolean;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number };
  weatherData?: any;
}

export function ComprehensiveAlertSystem({ 
  isVisible, 
  onClose, 
  userLocation,
  weatherData 
}: ComprehensiveAlertSystemProps) {
  const [currentAlert, setCurrentAlert] = useState<CalamityAlert | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'routes' | 'prepare' | 'contacts'>('overview');
  const { t } = useLanguage();

  // Generate comprehensive alert based on weather data
  useEffect(() => {
    if (isVisible && weatherData) {
      const alert = generateComprehensiveAlert(weatherData);
      setCurrentAlert(alert);
      
      if (voiceEnabled) {
        speakAlert(alert);
      }
    }
  }, [isVisible, weatherData, voiceEnabled]);

  const generateComprehensiveAlert = (weather: any): CalamityAlert => {
    const precipitation = weather.precipitation || 5;
    const windSpeed = weather.windSpeed || 10;
    const severity = precipitation > 20 ? 'critical' : 
                    precipitation > 15 ? 'warning' :
                    precipitation > 8 ? 'watch' : 'advisory';

    return {
      id: `alert-${Date.now()}`,
      type: windSpeed > 60 ? 'typhoon' : precipitation > 15 ? 'flood' : 'storm_surge',
      severity,
      location: 'Valencia City, Bukidnon',
      timeToImpact: Math.max(30, 180 - precipitation * 8),
      stormData: {
        center: {
          latitude: 7.8,
          longitude: 125.0,
          location: '15km Northwest of Valencia City'
        },
        intensity: {
          category: windSpeed > 100 ? 3 : windSpeed > 70 ? 2 : windSpeed > 50 ? 1 : 0,
          windSpeed: Math.max(windSpeed, 45),
          pressure: Math.max(980, 1013 - precipitation),
          movement: {
            direction: 'Southeast',
            speed: Math.max(15, windSpeed * 0.3)
          }
        },
        forecast: {
          landfallTime: Math.max(2, 8 - precipitation * 0.3),
          affectedRadius: Math.max(20, precipitation * 2),
          riskLevel: severity === 'critical' ? 'extreme' : 
                    severity === 'warning' ? 'high' :
                    severity === 'watch' ? 'moderate' : 'low'
        }
      },
      evacuationRoutes: {
        primary: {
          destination: 'Valencia City Hall Evacuation Center',
          distance: 1.2,
          estimatedTime: precipitation > 15 ? 25 : 15,
          route: ['J.P. Laurel Street', 'City Center'],
          status: precipitation > 20 ? 'congested' : 'clear',
          contact: '(088) 123-4567'
        },
        alternatives: [
          {
            destination: 'Central Elementary School',
            distance: 0.8,
            estimatedTime: precipitation > 15 ? 20 : 12,
            route: ['Sayre Highway', 'School Road'],
            status: precipitation > 18 ? 'blocked' : 'clear',
            reason: precipitation > 18 ? 'Flooded underpass at Sayre Highway' : undefined,
            contact: '(088) 123-4568'
          },
          {
            destination: 'Barangay Lumbo Gymnasium',
            distance: 2.1,
            estimatedTime: precipitation > 15 ? 35 : 25,
            route: ['Poblacion Road', 'Lumbo Avenue'],
            status: 'clear',
            contact: '(088) 123-4569'
          }
        ]
      },
      preparations: {
        essential: [
          'Emergency food and water for 72 hours',
          'First aid kit and medications',
          'Flashlight and extra batteries',
          'Important documents in waterproof container',
          'Cash and emergency contact list'
        ],
        recommended: [
          'Portable radio for emergency updates',
          'Extra clothing and blankets',
          'Mobile phone charger/power bank',
          'Personal hygiene items',
          'Emergency whistle'
        ],
        emergency: [
          'Life jackets if available',
          'Rope or strong cord',
          'Emergency flares or signals',
          'Waterproof matches',
          'Emergency shelter materials'
        ]
      },
      blockedAreas: precipitation > 15 ? [
        {
          location: 'Riverside Road Bridge',
          reason: 'High water levels, unsafe crossing',
          alternativeRoute: 'Use Poblacion Road via City Center'
        },
        {
          location: 'Lower Bridge Area',
          reason: 'Flood waters rising, road impassable'
        }
      ] : [],
      emergencyContacts: {
        primary: [
          'CDRRMO Valencia: (088) 000-1111',
          'Police Emergency: (088) 000-2222',
          'Fire Department: (088) 000-3333'
        ],
        medical: [
          'Valencia District Hospital: (088) 111-2222',
          'Emergency Medical Services: (088) 111-3333',
          'Red Cross Valencia: (088) 111-4444'
        ],
        rescue: [
          'Coast Guard Auxiliary: (088) 222-3333',
          'Search and Rescue: (088) 222-4444',
          'Emergency Response Team: (088) 222-5555'
        ]
      }
    };
  };

  const speakAlert = async (alert: CalamityAlert) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    setIsSpeaking(true);
    const urgentMessage = `URGENT ALERT! ${alert.type.toUpperCase()} ${alert.severity.toUpperCase()}! 
      Storm center located ${alert.stormData.center.location}. 
      Wind speed ${alert.stormData.intensity.windSpeed} kilometers per hour. 
      You have ${alert.timeToImpact} minutes to reach safety. 
      Nearest evacuation center: ${alert.evacuationRoutes.primary.destination}, 
      distance ${alert.evacuationRoutes.primary.distance} kilometers. 
      Route status: ${alert.evacuationRoutes.primary.status}. 
      Take action immediately!`;
    
    const utterance = new SpeechSynthesisUtterance(urgentMessage);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'warning': return 'orange';
      case 'watch': return 'yellow';
      default: return 'blue';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <Zap className="w-5 h-5 text-orange-600" />;
      case 'watch': return <Eye className="w-5 h-5 text-yellow-600" />;
      default: return <Shield className="w-5 h-5 text-blue-600" />;
    }
  };

  if (!currentAlert) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed inset-4 z-50 flex items-center justify-center"
        >
          <Card className={`w-full max-w-4xl max-h-[90vh] overflow-auto glass-card p-6 shadow-2xl border-3 border-${getSeverityColor(currentAlert.severity)}-400 intense-neon-pulse`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    y: [-5, 5, -5],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArkoAvatar 
                    size={64} 
                    animated={true}
                    severity={currentAlert.severity === 'extreme' ? 'critical' : currentAlert.severity as any}
                    isSpeaking={isSpeaking}
                    showSparkles={true}
                  />
                </motion.div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getSeverityIcon(currentAlert.severity)}
                    <h2 className="m-0 neon-text-glow">ARKO EMERGENCY ALERT</h2>
                    <Badge 
                      variant="outline" 
                      className={`bg-${getSeverityColor(currentAlert.severity)}-50 border-${getSeverityColor(currentAlert.severity)}-300 text-${getSeverityColor(currentAlert.severity)}-700 font-bold`}
                    >
                      {currentAlert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-lg m-0">
                    {currentAlert.type.replace('_', ' ').toUpperCase()} in {currentAlert.location}
                  </p>
                  <p className="text-sm text-muted-foreground m-0">
                    Time to Impact: {currentAlert.timeToImpact} minutes
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="h-10 w-10 p-0"
                >
                  {voiceEnabled ? (
                    <Volume2 className="w-5 h-5 text-blue-500" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b">
              {[
                { id: 'overview', label: 'Storm Info', icon: Target },
                { id: 'routes', label: 'Evacuation', icon: Route },
                { id: 'prepare', label: 'Preparations', icon: Shield },
                { id: 'contacts', label: 'Emergency', icon: Phone }
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={activeTab === id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(id as any)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Storm Center Information */}
                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-red-600" />
                      <h3 className="m-0">Storm Center Location</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="m-0"><strong>Position:</strong> {currentAlert.stormData.center.location}</p>
                      <p className="m-0"><strong>Coordinates:</strong> {currentAlert.stormData.center.latitude}°N, {currentAlert.stormData.center.longitude}°E</p>
                      <p className="m-0"><strong>Distance from you:</strong> ~15km Northwest</p>
                    </div>
                  </Card>

                  {/* Storm Intensity */}
                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Wind className="w-5 h-5 text-orange-600" />
                      <h3 className="m-0">Storm Intensity</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="m-0"><strong>Wind Speed:</strong> {currentAlert.stormData.intensity.windSpeed} km/h</p>
                      <p className="m-0"><strong>Category:</strong> {currentAlert.stormData.intensity.category > 0 ? `Category ${currentAlert.stormData.intensity.category}` : 'Tropical Storm'}</p>
                      <p className="m-0"><strong>Movement:</strong> {currentAlert.stormData.intensity.movement.direction} at {currentAlert.stormData.intensity.movement.speed} km/h</p>
                      <p className="m-0"><strong>Pressure:</strong> {currentAlert.stormData.intensity.pressure} hPa</p>
                    </div>
                  </Card>

                  {/* Forecast */}
                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <h3 className="m-0">Landfall Prediction</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="m-0"><strong>Estimated Time:</strong> {currentAlert.stormData.forecast.landfallTime} hours</p>
                      <p className="m-0"><strong>Affected Radius:</strong> {currentAlert.stormData.forecast.affectedRadius} km</p>
                      <p className="m-0"><strong>Risk Level:</strong> {currentAlert.stormData.forecast.riskLevel.toUpperCase()}</p>
                    </div>
                  </Card>

                  {/* Blocked Areas */}
                  {currentAlert.blockedAreas.length > 0 && (
                    <Card className="p-4 bg-red-50 border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Construction className="w-5 h-5 text-red-600" />
                        <h3 className="m-0">Blocked/Dangerous Areas</h3>
                      </div>
                      <div className="space-y-2">
                        {currentAlert.blockedAreas.map((area, index) => (
                          <div key={index} className="text-sm">
                            <p className="m-0 font-semibold text-red-700">{area.location}</p>
                            <p className="m-0 text-red-600">{area.reason}</p>
                            {area.alternativeRoute && (
                              <p className="m-0 text-green-600">Alternative: {area.alternativeRoute}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'routes' && (
                <div className="space-y-4">
                  {/* Primary Route */}
                  <Card className={`p-4 ${currentAlert.evacuationRoutes.primary.status === 'clear' ? 'bg-green-50 border-green-200' : 
                                            currentAlert.evacuationRoutes.primary.status === 'congested' ? 'bg-yellow-50 border-yellow-200' : 
                                            'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-green-600" />
                        <h3 className="m-0">Primary Evacuation Route</h3>
                        <Badge variant={currentAlert.evacuationRoutes.primary.status === 'clear' ? 'default' : 'destructive'}>
                          {currentAlert.evacuationRoutes.primary.status.toUpperCase()}
                        </Badge>
                      </div>
                      <Button size="sm" onClick={() => window.location.href = `tel:${currentAlert.evacuationRoutes.primary.contact}`}>
                        <Phone className="w-4 h-4 mr-1" />
                        Call Center
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="m-0 font-semibold">{currentAlert.evacuationRoutes.primary.destination}</p>
                        <p className="m-0">Distance: {currentAlert.evacuationRoutes.primary.distance} km</p>
                        <p className="m-0">ETA: {currentAlert.evacuationRoutes.primary.estimatedTime} minutes</p>
                      </div>
                      <div className="col-span-2">
                        <p className="m-0 font-semibold">Route:</p>
                        <p className="m-0">{currentAlert.evacuationRoutes.primary.route.join(' → ')}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Alternative Routes */}
                  <div className="space-y-3">
                    <h4>Alternative Evacuation Centers</h4>
                    {currentAlert.evacuationRoutes.alternatives.map((route, index) => (
                      <Card key={index} className={`p-3 ${route.status === 'clear' ? 'bg-green-50 border-green-200' : 
                                                              route.status === 'congested' ? 'bg-yellow-50 border-yellow-200' : 
                                                              'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Route className="w-4 h-4" />
                            <span className="font-semibold">{route.destination}</span>
                            <Badge variant={route.status === 'clear' ? 'default' : 'destructive'} size="sm">
                              {route.status}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => window.location.href = `tel:${route.contact}`}>
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="m-0">Distance: {route.distance} km</p>
                            <p className="m-0">ETA: {route.estimatedTime} min</p>
                          </div>
                          <div className="col-span-2">
                            <p className="m-0">Route: {route.route.join(' → ')}</p>
                            {route.reason && <p className="m-0 text-red-600">{route.reason}</p>}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'prepare' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-red-50 border-red-200">
                    <h3 className="m-0 mb-3 text-red-700">Essential Items</h3>
                    <ul className="text-sm space-y-1">
                      {currentAlert.preparations.essential.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <h3 className="m-0 mb-3 text-yellow-700">Recommended</h3>
                    <ul className="text-sm space-y-1">
                      {currentAlert.preparations.recommended.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <h3 className="m-0 mb-3 text-orange-700">Emergency Only</h3>
                    <ul className="text-sm space-y-1">
                      {currentAlert.preparations.emergency.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-red-50 border-red-200">
                    <h3 className="m-0 mb-3 text-red-700">Primary Emergency</h3>
                    <div className="space-y-2">
                      {currentAlert.emergencyContacts.primary.map((contact, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs border-red-300 text-red-700 hover:bg-red-100"
                          onClick={() => window.location.href = `tel:${contact.split(': ')[1]}`}
                        >
                          <Phone className="w-3 h-3 mr-2" />
                          {contact}
                        </Button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h3 className="m-0 mb-3 text-blue-700">Medical Emergency</h3>
                    <div className="space-y-2">
                      {currentAlert.emergencyContacts.medical.map((contact, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                          onClick={() => window.location.href = `tel:${contact.split(': ')[1]}`}
                        >
                          <Phone className="w-3 h-3 mr-2" />
                          {contact}
                        </Button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4 bg-green-50 border-green-200">
                    <h3 className="m-0 mb-3 text-green-700">Search & Rescue</h3>
                    <div className="space-y-2">
                      {currentAlert.emergencyContacts.rescue.map((contact, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs border-green-300 text-green-700 hover:bg-green-100"
                          onClick={() => window.location.href = `tel:${contact.split(': ')[1]}`}
                        >
                          <Phone className="w-3 h-3 mr-2" />
                          {contact}
                        </Button>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.location.href = `tel:${currentAlert.evacuationRoutes.primary.contact}`}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Evacuation Center
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  const message = `EMERGENCY: Need evacuation assistance at ${userLocation.latitude}, ${userLocation.longitude}. ${currentAlert.type} alert in Valencia City.`;
                  window.location.href = `sms:${currentAlert.emergencyContacts.primary[0].split(': ')[1]}?body=${encodeURIComponent(message)}`;
                }}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Send Emergency SMS
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}