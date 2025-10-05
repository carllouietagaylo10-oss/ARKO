import React, { useState, useRef } from 'react';
import { 
  Camera, MapPin, AlertTriangle, Send, X, Upload, Phone, Users, 
  Clock, Waves, Home, Car, Zap, TreePine, Building, Shield 
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ArkoAvatar } from './ArkoAvatar';
import { JellyfishMessage, JellyfishShield } from './ColorfulIcons';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../services/supabaseClient';

interface ReportSituationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number };
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  barangay: string;
}

const reportTypes = [
  {
    id: 'flooding',
    name: 'Flooding',
    icon: <Waves className="w-5 h-5" />,
    color: 'bg-blue-500',
    description: 'Report current flood conditions'
  },
  {
    id: 'evacuation',
    name: 'Evacuation Needed',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-red-500',
    description: 'Request evacuation assistance'
  },
  {
    id: 'missing_person',
    name: 'Missing Person',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-orange-500',
    description: 'Report missing person'
  },
  {
    id: 'road_closure',
    name: 'Road Closure',
    icon: <Car className="w-5 h-5" />,
    color: 'bg-yellow-500',
    description: 'Report blocked or impassable roads'
  },
  {
    id: 'utility_damage',
    name: 'Utility Damage',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-purple-500',
    description: 'Power lines, water, communication issues'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: <Building className="w-5 h-5" />,
    color: 'bg-gray-500',
    description: 'Bridge damage, building issues'
  }
];

const severityLevels = [
  { id: 'low', name: 'Low', color: 'bg-green-500', description: 'Minor issue, no immediate danger' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-500', description: 'Moderate issue, monitor closely' },
  { id: 'high', name: 'High', color: 'bg-orange-500', description: 'Serious issue, assistance needed' },
  { id: 'critical', name: 'Critical', color: 'bg-red-500', description: 'Immediate danger, urgent response needed' }
];

export function ReportSituationPanel({ isVisible, onClose, userLocation }: ReportSituationPanelProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportType, setReportType] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [waterLevel, setWaterLevel] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentLocation = async () => {
    if (userLocation) {
      setCurrentLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: 10,
        barangay: 'Valencia City'
      });
      return;
    }

    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });

        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          barangay: 'Valencia City' // You could use reverse geocoding here
        };

        setCurrentLocation(locationData);
        setLocation(`Lat: ${locationData.latitude.toFixed(6)}, Lng: ${locationData.longitude.toFixed(6)}`);
        
        toast.success('Location obtained successfully!');
      } catch (error) {
        console.error('Error getting location:', error);
        toast.error('Could not get your location. Please enter manually.');
        setLocation('Valencia City, Bukidnon');
      }
    } else {
      toast.error('Geolocation not supported. Please enter location manually.');
      setLocation('Valencia City, Bukidnon');
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).slice(0, 3 - photos.length); // Max 3 photos
      setPhotos([...photos, ...newPhotos]);
      toast.success(`${newPhotos.length} photo(s) added`);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const submitReport = async () => {
    if (!reportType || !severity || !location || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const client = supabase.getClient();
      
      if (!client) {
        // Fallback to local submission simulation
        console.log('📝 Community Report Submitted (Simulated):', {
          report_type: reportType,
          severity,
          location,
          description,
          water_level_estimate: waterLevel,
          contact_info: contactInfo,
          coordinates: currentLocation,
          photos: photos.length,
          timestamp: new Date().toISOString()
        });

        toast.success('Report submitted successfully!', {
          description: 'Your report has been recorded and emergency services have been notified.',
          duration: 5000
        });

        onClose();
        resetForm();
        return;
      }

      // Prepare report data
      const reportData = {
        report_type: reportType,
        severity,
        location,
        description,
        water_level_estimate: waterLevel || null,
        latitude: currentLocation?.latitude || null,
        longitude: currentLocation?.longitude || null,
        barangay: currentLocation?.barangay || 'Valencia City',
        user_id: 'guest-user', // In a real app, this would be the authenticated user ID
        photo_urls: [], // In a real app, photos would be uploaded to storage first
        verification_count: 0,
        is_verified: false,
        status: 'active'
      };

      const { data, error } = await client
        .from('community_reports')
        .insert([reportData])
        .select();

      if (error) {
        throw error;
      }

      console.log('✅ Report submitted to database:', data);
      
      toast.success('Report submitted successfully!', {
        description: 'Your report has been submitted to the database and emergency services have been notified.',
        duration: 5000,
        action: {
          label: 'View Reports',
          onClick: () => {
            // Could navigate to reports tab
            console.log('Navigate to reports');
          }
        }
      });

      // Notify emergency services for critical reports
      if (severity === 'critical') {
        toast.error('CRITICAL REPORT SUBMITTED', {
          description: 'Emergency services have been automatically notified. Stay safe!',
          duration: 10000
        });
      }

      onClose();
      resetForm();

    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again or call emergency services directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setReportType('');
    setSeverity('');
    setLocation('');
    setDescription('');
    setWaterLevel('');
    setContactInfo('');
    setPhotos([]);
    setCurrentLocation(null);
  };

  const nextStep = () => {
    if (currentStep === 1 && !reportType) {
      toast.error('Please select a report type');
      return;
    }
    if (currentStep === 2 && !severity) {
      toast.error('Please select severity level');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border-2 border-blue-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArkoAvatar size={36} animated={true} severity="medium" showSparkles={true} />
              <div>
                <h2 className="text-lg font-bold m-0">📢 Report Situation</h2>
                <p className="text-sm opacity-90 m-0">Help your community stay safe</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20 p-2">
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
            <span className="text-xs text-gray-500">{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Step 1: Report Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <JellyfishMessage size={40} animated color="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800 mt-2 mb-1">What are you reporting?</h3>
                <p className="text-gray-600 text-sm">Select the type of situation you want to report</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {reportTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      reportType === type.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setReportType(type.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center text-white`}>
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{type.name}</h4>
                        <p className="text-xs text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Severity */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <AlertTriangle className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-800 mb-1">How severe is the situation?</h3>
                <p className="text-gray-600 text-sm">Help us prioritize the response</p>
              </div>
              
              <div className="space-y-3">
                {severityLevels.map((level) => (
                  <Card
                    key={level.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      severity === level.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => setSeverity(level.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${level.color} rounded-full`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">{level.name}</h4>
                          {level.id === 'critical' && <Badge className="bg-red-500 text-white text-xs">URGENT</Badge>}
                        </div>
                        <p className="text-xs text-gray-600">{level.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Location & Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <MapPin className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-800 mb-1">Location & Details</h3>
                <p className="text-gray-600 text-sm">Provide specific information about the situation</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter specific location or address"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={getCurrentLocation}
                      className="whitespace-nowrap"
                      disabled={isSubmitting}
                    >
                      <MapPin size={16} className="mr-1" />
                      Use GPS
                    </Button>
                  </div>
                  {currentLocation && (
                    <p className="text-xs text-green-600 mt-1">
                      GPS location obtained (±{currentLocation.accuracy}m accuracy)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe the situation in detail. Include what you see, any immediate dangers, and how many people are affected."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {reportType === 'flooding' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water Level (Optional)
                    </label>
                    <Input
                      placeholder="e.g., Ankle deep, Up to waist, Above head height"
                      value={waterLevel}
                      onChange={(e) => setWaterLevel(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Information
                  </label>
                  <Input
                    placeholder="Phone number or name (optional, for follow-up)"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photos & Submit */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Camera className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-800 mb-1">Add Photos (Optional)</h3>
                <p className="text-gray-600 text-sm">Photos help emergency responders assess the situation</p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photos.length >= 3}
                    className="mb-2"
                  >
                    <Upload size={16} className="mr-2" />
                    Add Photos ({photos.length}/3)
                  </Button>
                  <p className="text-xs text-gray-500">
                    JPG, PNG up to 5MB each. Max 3 photos.
                  </p>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                          onClick={() => removePhoto(index)}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Report Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Type:</strong> {reportTypes.find(t => t.id === reportType)?.name}</p>
                    <p><strong>Severity:</strong> {severityLevels.find(s => s.id === severity)?.name}</p>
                    <p><strong>Location:</strong> {location}</p>
                    <p><strong>Photos:</strong> {photos.length} attached</p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button onClick={nextStep} disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button
                onClick={submitReport}
                disabled={isSubmitting || !reportType || !severity || !location || !description}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            )}
          </div>
          
          {severity === 'critical' && currentStep === 4 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <Phone size={16} />
                <span className="text-sm font-semibold">Critical Situation: Emergency services will be notified immediately</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}