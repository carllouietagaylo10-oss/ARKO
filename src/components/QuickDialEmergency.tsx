import React, { useState } from 'react';
import { Phone, MapPin, Clock, AlertTriangle, CheckCircle, X, PhoneCall } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { JellyfishPhone } from './ColorfulIcons';
import { ArkoAvatar } from './ArkoAvatar';
import { toast } from 'sonner@2.0.3';

interface QuickDialEmergencyProps {
  isVisible: boolean;
  onClose: () => void;
}

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  description: string;
  type: 'primary' | 'fire' | 'police' | 'medical' | 'rescue' | 'support';
  icon: string;
  priority: number;
  isAvailable24h: boolean;
}

const valenciaEmergencyContacts: EmergencyContact[] = [
  {
    id: 'drrmc-mobile',
    name: 'City Rescue / DRRMC',
    number: '+63956-135-2663',
    description: '24/7 Emergency Response & Rescue',
    type: 'primary',
    icon: '🚨',
    priority: 1,
    isAvailable24h: true
  },
  {
    id: 'drrmc-landline',
    name: 'City Rescue / DRRMC',
    number: '088-828-2411',
    description: 'Emergency Rescue Landline',
    type: 'primary',
    icon: '📞',
    priority: 2,
    isAvailable24h: true
  },
  {
    id: 'medical-emergency',
    name: 'Adventist Medical Center',
    number: '+63965-192-4530',
    description: '24/7 Medical Emergency',
    type: 'medical',
    icon: '🏥',
    priority: 3,
    isAvailable24h: true
  },
  {
    id: 'fire-landline',
    name: 'Fire Department',
    number: '088-828-1481',
    description: 'Bureau of Fire Protection',
    type: 'fire',
    icon: '🚒',
    priority: 4,
    isAvailable24h: true
  },
  {
    id: 'fire-mobile',
    name: 'Fire Department Mobile',
    number: '+63926-190-3020',
    description: 'Mobile Fire Response Unit',
    type: 'fire',
    icon: '🔥',
    priority: 5,
    isAvailable24h: true
  },
  {
    id: 'police-landline',
    name: 'Valencia Police Station',
    number: '088-828-3721',
    description: 'Valencia City Police',
    type: 'police',
    icon: '👮',
    priority: 6,
    isAvailable24h: true
  },
  {
    id: 'police-mobile',
    name: 'Police Mobile Unit',
    number: '+63917-718-9191',
    description: 'Police Mobile Response',
    type: 'police',
    icon: '🚔',
    priority: 7,
    isAvailable24h: true
  }
];

export function QuickDialEmergency({ isVisible, onClose }: QuickDialEmergencyProps) {
  const [calling, setCalling] = useState<string | null>(null);
  const [lastCalled, setLastCalled] = useState<string | null>(null);

  const handleEmergencyCall = async (contact: EmergencyContact) => {
    setCalling(contact.id);
    
    // Show confirmation for critical calls
    if (contact.type === 'primary' || contact.type === 'medical') {
      const confirmed = window.confirm(
        `🚨 EMERGENCY CALL\n\nYou are about to call:\n${contact.name}\n${contact.number}\n\n${contact.description}\n\nProceed with emergency call?`
      );
      
      if (!confirmed) {
        setCalling(null);
        return;
      }
    }
    
    // Simulate call preparation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Format number for tel: link
      const formattedNumber = contact.number.replace(/\s+/g, '');
      window.location.href = `tel:${formattedNumber}`;
      
      setLastCalled(contact.id);
      
      toast.success(`Emergency Call Initiated`, {
        description: `Calling ${contact.name} - ${contact.number}`,
        duration: 5000,
        action: {
          label: 'End Call',
          onClick: () => {
            toast.dismiss();
            toast.info('Remember to provide your location and emergency details clearly');
          }
        }
      });
      
      // Log the emergency call for record keeping
      console.log(`🚨 EMERGENCY CALL: ${contact.name} (${contact.number}) at ${new Date().toISOString()}`);
      
    } catch (error) {
      console.error('Failed to initiate emergency call:', error);
      toast.error(`Failed to call ${contact.name}`, {
        description: 'Please try dialing manually or use alternative contact'
      });
    } finally {
      setCalling(null);
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-red-600 hover:bg-red-700';
      case 'medical': return 'bg-blue-600 hover:bg-blue-700';
      case 'fire': return 'bg-orange-600 hover:bg-orange-700';
      case 'police': return 'bg-indigo-600 hover:bg-indigo-700';
      case 'rescue': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'primary': return 'PRIMARY';
      case 'medical': return 'MEDICAL';
      case 'fire': return 'FIRE';
      case 'police': return 'POLICE';
      case 'rescue': return 'RESCUE';
      default: return 'SUPPORT';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border-2 border-red-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArkoAvatar size={36} animated={true} severity="high" showSparkles={true} />
              <div>
                <h2 className="text-lg font-bold m-0">🚨 Emergency Contacts</h2>
                <p className="text-sm opacity-90 m-0">Valencia City 24/7 Hotlines</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20 p-2">
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Emergency Instruction Banner */}
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-800 m-0 mb-1">When calling emergency services:</p>
              <ul className="text-yellow-700 text-xs space-y-1 m-0">
                <li>• State your location clearly</li>
                <li>• Describe the emergency</li>
                <li>• Stay on the line for instructions</li>
                <li>• Have your phone charged and ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Contacts List */}
        <div className="p-4 overflow-y-auto max-h-96">
          <div className="space-y-3">
            {valenciaEmergencyContacts.map((contact) => (
              <Card 
                key={contact.id} 
                className={`p-4 border-2 transition-all hover:shadow-lg ${
                  lastCalled === contact.id ? 'border-green-400 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{contact.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm m-0 truncate">{contact.name}</h3>
                        <Badge className={`text-xs px-2 py-0.5 ${
                          contact.type === 'primary' ? 'bg-red-500' :
                          contact.type === 'medical' ? 'bg-blue-500' :
                          contact.type === 'fire' ? 'bg-orange-500' :
                          contact.type === 'police' ? 'bg-indigo-500' :
                          'bg-gray-500'
                        } text-white`}>
                          {getTypeLabel(contact.type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 m-0 mb-1">{contact.description}</p>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-gray-500" />
                        <span className="text-sm font-mono font-medium text-gray-800">{contact.number}</span>
                        {contact.isAvailable24h && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            24/7
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call Button */}
                <Button
                  className={`w-full ${getContactTypeColor(contact.type)} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200`}
                  onClick={() => handleEmergencyCall(contact)}
                  disabled={calling === contact.id}
                >
                  {calling === contact.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Calling...
                    </>
                  ) : (
                    <>
                      <PhoneCall size={16} className="mr-2" />
                      Call Now
                    </>
                  )}
                </Button>

                {/* Last Called Indicator */}
                {lastCalled === contact.id && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                    <CheckCircle size={12} />
                    <span>Last called - Call log recorded</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Footer with Additional Info */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <JellyfishPhone size={16} animated color="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Emergency Response Network</span>
            </div>
            <p className="text-xs text-gray-600 m-0">
              All numbers are direct lines to Valencia City emergency services
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Services Active 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}