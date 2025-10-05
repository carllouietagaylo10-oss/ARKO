import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Users, Navigation, X, Phone, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArkoAvatar } from './ArkoAvatar';
import { toast } from 'sonner@2.0.3';

interface CapacityAlert {
  id: string;
  centerName: string;
  currentOccupancy: number;
  capacity: number;
  severity: 'warning' | 'critical' | 'full';
  alternatives: {
    name: string;
    capacity: number;
    currentOccupancy: number;
    travelTime: string;
    coordinates: { lat: number; lng: number };
    contact: string;
  }[];
  timestamp: Date;
}

interface EvacuationCapacityAlertProps {
  alert: CapacityAlert | null;
  onDismiss: () => void;
  onRedirect: (center: any) => void;
}

export function EvacuationCapacityAlert({ 
  alert, 
  onDismiss, 
  onRedirect 
}: EvacuationCapacityAlertProps) {
  const [autoHide, setAutoHide] = useState(true);

  useEffect(() => {
    if (alert && autoHide) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 15000); // Auto-hide after 15 seconds

      return () => clearTimeout(timer);
    }
  }, [alert, autoHide, onDismiss]);

  if (!alert) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'critical': return 'from-orange-500 to-red-500';
      case 'full': return 'from-red-500 to-red-700';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'full': return '🚨';
      case 'critical': return '⚠️';
      case 'warning': return '📢';
      default: return 'ℹ️';
    }
  };

  const capacityPercentage = Math.round((alert.currentOccupancy / alert.capacity) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="fixed top-20 right-4 z-50 max-w-md"
      >
        <Card className={`bg-gradient-to-br ${getSeverityColor(alert.severity)} text-white shadow-2xl border-0`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getSeverityIcon(alert.severity)}</div>
                <ArkoAvatar 
                  size={36} 
                  animated={true} 
                  severity={alert.severity === 'full' ? 'critical' : alert.severity === 'critical' ? 'high' : 'medium'} 
                  showSparkles={true} 
                />
                <div>
                  <h3 className="m-0 font-bold">
                    {alert.severity === 'full' ? 'EVACUATION CENTER FULL' :
                     alert.severity === 'critical' ? 'CAPACITY CRITICAL' :
                     'CAPACITY WARNING'}
                  </h3>
                  <p className="text-sm opacity-90 m-0">
                    Arko Emergency Alert System
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoHide(!autoHide)}
                  className="text-white/70 hover:text-white text-xs"
                  title={autoHide ? 'Disable auto-hide' : 'Enable auto-hide'}
                >
                  {autoHide ? '⏱️' : '📌'}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Center Info */}
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="m-0 font-semibold">{alert.centerName}</h4>
                <Badge className="bg-white/20 text-white border-white/30">
                  {capacityPercentage}% Full
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} />
                <span>{alert.currentOccupancy}/{alert.capacity} people</span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${capacityPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-3 rounded-full ${
                    capacityPercentage >= 100 ? 'bg-red-300' :
                    capacityPercentage >= 90 ? 'bg-orange-300' :
                    'bg-yellow-300'
                  }`}
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <p className="text-sm leading-relaxed m-0">
                {alert.severity === 'full' ? 
                  `${alert.centerName} has reached maximum capacity and cannot accept more evacuees. Please proceed to one of the alternative centers below.` :
                  alert.severity === 'critical' ?
                  `${alert.centerName} is critically full (${capacityPercentage}% capacity). Consider alternative centers to avoid overcrowding.` :
                  `${alert.centerName} is approaching capacity (${capacityPercentage}% full). You may want to consider alternative centers.`
                }
              </p>
            </div>

            {/* Alternative Centers */}
            {alert.alternatives.length > 0 && (
              <div className="space-y-3">
                <h5 className="m-0 font-semibold flex items-center gap-2">
                  <Navigation size={16} />
                  Alternative Centers
                </h5>
                
                {alert.alternatives.slice(0, 2).map((alt, index) => {
                  const altPercentage = Math.round((alt.currentOccupancy / alt.capacity) * 100);
                  return (
                    <div key={index} className="bg-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h6 className="m-0 font-medium text-sm">{alt.name}</h6>
                          <div className="flex items-center gap-3 text-xs opacity-90">
                            <div className="flex items-center gap-1">
                              <Users size={12} />
                              <span>{alt.currentOccupancy}/{alt.capacity}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{alt.travelTime}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          altPercentage < 60 ? 'bg-green-500' :
                          altPercentage < 80 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        } text-white`}>
                          {altPercentage}%
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs h-8"
                          onClick={() => {
                            const coords = `${alt.coordinates.lat},${alt.coordinates.lng}`;
                            const url = `https://www.google.com/maps/dir//${coords}`;
                            window.open(url, '_blank');
                            toast.success(`Navigation started to ${alt.name}`);
                            onRedirect(alt);
                          }}
                        >
                          <Navigation size={12} className="mr-1" />
                          Directions
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20 text-xs h-8 px-3"
                          onClick={() => {
                            window.location.href = `tel:${alt.contact}`;
                          }}
                        >
                          <Phone size={12} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs opacity-70 mt-4 text-center">
              Alert issued at {alert.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}