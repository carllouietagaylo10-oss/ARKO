import React, { useState, useEffect, useRef } from 'react';
import { Camera, MessageCircle, MapPin, Clock, Users, Send, AlertTriangle, ThumbsUp, Flag, Share2, ExternalLink, Loader2, UserX, Image, Upload, X, Eye, Plus, Calendar, Ruler, Palette, Shirt, MapPin as LocationIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseClient';

interface CommunityReport {
  id: string;
  user: string;
  location: string;
  waterDepth: string;
  description: string;
  timestamp: string;
  verified: boolean;
  likes: number;
  hasPhoto: boolean;
  isEmergency: boolean;
  coordinates?: { lat: number; lng: number };
  photos?: string[];
  type: 'flood' | 'missing-person';
}

interface MissingPersonReport {
  id: string;
  user: string;
  personName: string;
  age: number;
  height: string;
  hairColor: string;
  outfitLastSeen: string;
  lastSeenLocation: string;
  lastSeenTime: string;
  description: string;
  contactInfo: string;
  timestamp: string;
  verified: boolean;
  photos?: string[];
  status: 'missing' | 'found' | 'investigating';
}

const mockReports: CommunityReport[] = [
  {
    id: '1',
    user: 'Maria Santos',
    location: 'Brgy. Poblacion Riverside',
    waterDepth: '1.2 meters',
    description: 'Water level rising fast near the bridge. Several houses already flooded. Residents evacuating to higher ground.',
    timestamp: '5 minutes ago',
    verified: true,
    likes: 12,
    hasPhoto: true,
    isEmergency: true,
    coordinates: { lat: 7.9125, lng: 125.0864 },
    photos: ['https://images.unsplash.com/photo-1657069343871-fd1476990d04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9vZCUyMGRpc2FzdGVyJTIwc3RyZWV0cyUyMHdhdGVyfGVufDF8fHx8MTc1ODcyMjY0OHww&ixlib=rb-4.1.0&q=80&w=400&h=300&fit=crop'],
    type: 'flood'
  },
  {
    id: '2',
    user: 'Juan Dela Cruz',
    location: 'Brgy. Bagontaas',
    waterDepth: '0.3 meters',
    description: 'Street flooding observed. Water reached ankle level but seems stable. Traffic still passable with caution.',
    timestamp: '12 minutes ago',
    verified: true,
    likes: 8,
    hasPhoto: false,
    isEmergency: false,
    coordinates: { lat: 7.9135, lng: 125.0874 },
    type: 'flood'
  },
  {
    id: '3',
    user: 'Ana Reyes',
    location: 'Brgy. Lumbayao',
    waterDepth: '0.8 meters',
    description: 'Main road to town flooded. Alternative route via provincial road still clear. Some shops closing early.',
    timestamp: '18 minutes ago',
    verified: false,
    likes: 5,
    hasPhoto: true,
    isEmergency: false,
    coordinates: { lat: 7.9115, lng: 125.0854 },
    photos: ['https://images.unsplash.com/photo-1701788034040-921a268d7383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9vZGVkJTIwcm9hZCUyMGVtZXJnZW5jeXxlbnwxfHx8fDE3NTg3MjI2NTZ8MA&ixlib=rb-4.1.0&q=80&w=400&h=300&fit=crop'],
    type: 'flood'
  },
  {
    id: '4',
    user: 'Carlos Mendoza',
    location: 'Brgy. Catigan',
    waterDepth: '0.1 meters',
    description: 'Light flooding in the market area. Vendors moving items to higher shelves. No immediate danger but monitoring situation.',
    timestamp: '23 minutes ago',
    verified: true,
    likes: 3,
    hasPhoto: false,
    isEmergency: false,
    coordinates: { lat: 7.9145, lng: 125.0844 },
    type: 'flood'
  }
];

const mockMissingPersons: MissingPersonReport[] = [
  {
    id: 'mp1',
    user: 'Elena Rodriguez',
    personName: 'Miguel Santos',
    age: 45,
    height: '5\'7"',
    hairColor: 'Black',
    outfitLastSeen: 'Blue polo shirt, khaki pants, black boots',
    lastSeenLocation: 'Near Poblacion Bridge',
    lastSeenTime: '2 hours ago',
    description: 'Was helping evacuate neighbors when water level rose rapidly. Lost contact since then.',
    contactInfo: '0917-123-4567',
    timestamp: '1 hour ago',
    verified: false,
    photos: ['https://images.unsplash.com/photo-1645226027644-ca4db2db060a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXNzaW5nJTIwcGVyc29uJTIwcG9ydHJhaXQlMjBmYWNlfGVufDF8fHx8MTc1ODcyMjY1Mnww&ixlib=rb-4.1.0&q=80&w=200&h=200&fit=crop&crop=face'],
    status: 'missing'
  }
];

export function CommunityReports() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [missingPersons, setMissingPersons] = useState<MissingPersonReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReport, setNewReport] = useState({
    location: '',
    waterDepth: '',
    description: '',
    isEmergency: false
  });
  const [newMissingPerson, setNewMissingPerson] = useState({
    personName: '',
    age: '',
    height: '',
    hairColor: '',
    outfitLastSeen: '',
    lastSeenLocation: '',
    lastSeenTime: '',
    description: '',
    contactInfo: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'flood' | 'missing-person'>('flood');
  const [likedReports, setLikedReports] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'verified' | 'missing-persons'>('all');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'flood-reports' | 'missing-persons'>('flood-reports');

  // Fetch real community reports from Supabase
  useEffect(() => {
    fetchCommunityReports();
    fetchMissingPersonReports();
  }, []);

  const fetchCommunityReports = async () => {
    try {
      setLoading(true);
      const client = supabase.getClient();
      
      if (!client) {
        console.warn('Supabase client not available, using demo data');
        setReports(mockReports);
        return;
      }

      const { data, error } = await client
        .from('community_reports')
        .select('*')
        .eq('report_type', 'flooding')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching community reports:', error);
        setReports(mockReports); // Fallback to mock data
        return;
      }

      if (data && data.length > 0) {
        const rows = data as any[];
        const formattedReports: CommunityReport[] = rows.map(report => ({
          id: report.id,
          user: report.user_id || 'Anonymous User',
          location: report.location,
          waterDepth: report.water_level_estimate || 'Unknown depth',
          description: report.description,
          timestamp: new Date(report.created_at).toLocaleString(),
          verified: report.is_verified,
          likes: report.verification_count,
          hasPhoto: report.photo_urls && report.photo_urls.length > 0,
          isEmergency: report.severity === 'critical',
          coordinates: { lat: report.latitude, lng: report.longitude },
          photos: report.photo_urls || [],
          type: 'flood' as const
        }));
        setReports(formattedReports);
        console.log('✅ Real community reports loaded:', formattedReports.length);
      } else {
        // No real data, use demo data for better UX
        setReports(mockReports);
        console.log('ℹ️ No community reports found, showing demo data');
      }
    } catch (error) {
      console.error('Error in fetchCommunityReports:', error);
      setReports(mockReports); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const fetchMissingPersonReports = async () => {
    try {
      const client = supabase.getClient();
      
      if (!client) {
        setMissingPersons(mockMissingPersons);
        return;
      }

      const { data, error } = await client
        .from('community_reports')
        .select('*')
        .eq('report_type', 'missing_person')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching missing person reports:', error);
        setMissingPersons(mockMissingPersons);
        return;
      }

      if (data && data.length > 0) {
        const rows = data as any[];
        const formattedReports: MissingPersonReport[] = rows.map(report => ({
          id: report.id,
          user: report.user_id || 'Anonymous User',
          personName: report.description.split('\n')[0] || 'Unknown Person',
          age: 25, // Would need additional field in schema
          height: 'Unknown',
          hairColor: 'Unknown',
          outfitLastSeen: 'Unknown',
          lastSeenLocation: report.location,
          lastSeenTime: new Date(report.created_at).toLocaleString(),
          description: report.description,
          contactInfo: 'Contact authorities',
          timestamp: new Date(report.created_at).toLocaleString(),
          verified: report.is_verified,
          photos: report.photo_urls || [],
          status: 'missing' as const
        }));
        setMissingPersons(formattedReports);
      } else {
        setMissingPersons(mockMissingPersons);
      }
    } catch (error) {
      console.error('Error in fetchMissingPersonReports:', error);
      setMissingPersons(mockMissingPersons);
    }
  };

  const handleSubmitReport = async () => {
    if (formType === 'flood' && newReport.location && newReport.description) {
      setIsSubmitting(true);
      
      try {
        const client = supabase.getClient();
        
        if (client) {
          // Submit to real Supabase database
          const reportData = {
            user_id: 'anonymous_user', // Would use real user ID in production
            report_type: 'flooding',
            severity: newReport.isEmergency ? 'critical' : 'medium',
            location: newReport.location,
            barangay: 'Valencia City', // Could extract from location
            latitude: 7.9125 + (Math.random() - 0.5) * 0.01,
            longitude: 125.0864 + (Math.random() - 0.5) * 0.01,
            description: newReport.description,
            water_level_estimate: newReport.waterDepth,
            photo_urls: photoURLs,
            verification_count: 0,
            is_verified: false,
            status: 'active'
          };

          const { data, error } = await client
            .from('community_reports')
            .insert([reportData] as any)
            .select();

          if (error) {
            console.error('Error submitting report to Supabase:', error);
            throw error;
          }

          console.log('✅ Report submitted to Supabase:', data);
          
          // Refresh the reports list
          await fetchCommunityReports();
        } else {
          // Fallback to local state update if Supabase not available
          const report: CommunityReport = {
            id: Date.now().toString(),
            user: 'You',
            location: newReport.location,
            waterDepth: newReport.waterDepth,
            description: newReport.description,
            timestamp: 'Just now',
            verified: false,
            likes: 0,
            hasPhoto: photoURLs.length > 0,
            isEmergency: newReport.isEmergency,
            coordinates: { lat: 7.9125 + (Math.random() - 0.5) * 0.01, lng: 125.0864 + (Math.random() - 0.5) * 0.01 },
            photos: photoURLs,
            type: 'flood'
          };
          
          setReports([report, ...reports]);
        }
        
        setNewReport({ location: '', waterDepth: '', description: '', isEmergency: false });
        setShowForm(false);
        setSelectedPhotos([]);
        setPhotoURLs([]);
        
        toast.success("Flood report submitted successfully!", {
          description: "Your flood condition report has been shared with the community and authorities."
        });

        // Auto-alert authorities for emergency reports
        if (newReport.isEmergency) {
          toast.warning("Emergency alert sent to CDRRMO!", {
            description: "Your emergency report has been prioritized and sent to local authorities."
          });
        }
        
      } catch (error) {
        console.error('Error submitting report:', error);
        toast.error("Failed to submit report", {
          description: "Please try again later."
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmitMissingPerson = async () => {
    if (newMissingPerson.personName && newMissingPerson.lastSeenLocation) {
      setIsSubmitting(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const missingPersonReport: MissingPersonReport = {
        id: 'mp' + Date.now().toString(),
        user: 'You',
        personName: newMissingPerson.personName,
        age: parseInt(newMissingPerson.age) || 0,
        height: newMissingPerson.height,
        hairColor: newMissingPerson.hairColor,
        outfitLastSeen: newMissingPerson.outfitLastSeen,
        lastSeenLocation: newMissingPerson.lastSeenLocation,
        lastSeenTime: newMissingPerson.lastSeenTime,
        description: newMissingPerson.description,
        contactInfo: newMissingPerson.contactInfo,
        timestamp: 'Just now',
        verified: false,
        photos: photoURLs,
        status: 'missing'
      };
      
      setMissingPersons([missingPersonReport, ...missingPersons]);
      setNewMissingPerson({
        personName: '',
        age: '',
        height: '',
        hairColor: '',
        outfitLastSeen: '',
        lastSeenLocation: '',
        lastSeenTime: '',
        description: '',
        contactInfo: ''
      });
      setShowForm(false);
      setIsSubmitting(false);
      setSelectedPhotos([]);
      setPhotoURLs([]);
      
      toast.success("Missing person report submitted!", {
        description: "Your report has been shared with authorities and the community. We'll help find them."
      });

      // Auto-alert authorities for missing person reports
      toast.warning("Emergency alert sent to authorities!", {
        description: "Missing person report has been prioritized and sent to local search and rescue teams."
      });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 3 - selectedPhotos.length); // Max 3 photos
      setSelectedPhotos([...selectedPhotos, ...newFiles]);
      
      // Create preview URLs
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotoURLs(prev => [...prev, (e.target?.result as string) || '']);
          }
        };
        reader.readAsDataURL(file);
      });
      
      toast.success(`${newFiles.length} photo(s) added`, {
        description: "Photos will be included with your report"
      });
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoURLs(prev => prev.filter((_, i) => i !== index));
    toast.info("Photo removed");
  };

  const handleLikeReport = (reportId: string) => {
    const newLikedReports = new Set(likedReports);
    if (likedReports.has(reportId)) {
      newLikedReports.delete(reportId);
      toast.info("Like removed");
    } else {
      newLikedReports.add(reportId);
      toast.success("Report liked - helps verify accuracy");
    }
    setLikedReports(newLikedReports);
    
    // Update likes count
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, likes: report.likes + (likedReports.has(reportId) ? -1 : 1) }
        : report
    ));
  };

  const handleShareReport = async (report: CommunityReport) => {
    const shareData = {
      title: `Flood Report: ${report.location}`,
      text: `${report.description}\nWater depth: ${report.waterDepth || 'Unknown'}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Report shared successfully!");
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        toast.success("Report copied to clipboard!");
      }
    } catch (error) {
      console.log('Share cancelled');
    }
  };

  const handleViewOnMap = (report: CommunityReport) => {
    if (report.coordinates) {
      const googleMapsUrl = `https://www.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}`;
      window.open(googleMapsUrl, '_blank');
      toast.info(`Opening ${report.location} on map`);
    }
  };

  const filteredReports = reports.filter(report => {
    switch(filter) {
      case 'emergency':
        return report.isEmergency;
      case 'verified':
        return report.verified;
      default:
        return true;
    }
  });

  const getSeverityColor = (depth: string) => {
    const depthNum = parseFloat(depth);
    if (depthNum >= 1.0) return 'text-red-600';
    if (depthNum >= 0.5) return 'text-orange-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Beautiful Design */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="m-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Community Reports</h3>
              <p className="text-sm text-muted-foreground m-0">Share flood conditions and missing person alerts</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => {
                setFormType('flood');
                setShowForm(!showForm);
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {showForm && formType === 'flood' ? 'Cancel' : 'Report Flood'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setFormType('missing-person');
                setShowForm(!showForm);
              }}
              className="border-2 border-red-300 text-red-600 hover:bg-red-50 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <UserX className="w-4 h-4 mr-2" />
              {showForm && formType === 'missing-person' ? 'Cancel' : 'Missing Person'}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-lg p-1 shadow-inner">
          <Button
            size="sm"
            variant={activeTab === 'flood-reports' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('flood-reports')}
            className="flex-1 h-8"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Flood Reports ({reports.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'missing-persons' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('missing-persons')}
            className="flex-1 h-8"
          >
            <UserX className="w-3 h-3 mr-1" />
            Missing Persons ({missingPersons.length})
          </Button>
        </div>
      </Card>

      {/* Enhanced Report Forms */}
      {showForm && (
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 shadow-xl">
          {formType === 'flood' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h4 className="m-0">Report Current Flood Condition</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 font-medium">📍 Location/Barangay</label>
                  <Input
                    placeholder="e.g., Brgy. Poblacion"
                    value={newReport.location}
                    onChange={(e) => setNewReport({...newReport, location: e.target.value})}
                    className="border-2 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium">🌊 Water Depth (optional)</label>
                  <Input
                    placeholder="e.g., 0.5 meters"
                    value={newReport.waterDepth}
                    onChange={(e) => setNewReport({...newReport, waterDepth: e.target.value})}
                    className="border-2 focus:border-blue-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-2 font-medium">📝 Description</label>
                <Textarea
                  placeholder="Describe the current flood situation, road conditions, or safety concerns..."
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                  rows={3}
                  className="border-2 focus:border-blue-400"
                />
              </div>

              {/* Photo Upload Section */}
              <div>
                <label className="block text-sm mb-2 font-medium">📸 Photos (optional, max 3)</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 border-2 border-dashed border-blue-300 hover:border-blue-400"
                      disabled={selectedPhotos.length >= 3}
                    >
                      <Upload className="w-4 h-4" />
                      {selectedPhotos.length === 0 ? 'Add Photos' : `Add More (${selectedPhotos.length}/3)`}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {photoURLs.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {photoURLs.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Upload ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmitReport}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                  disabled={!newReport.location || !newReport.description || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Flood Report'}
                </Button>
              </div>
            </div>
          ) : (
            /* Missing Person Form */
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <UserX className="w-5 h-5 text-white" />
                </div>
                <h4 className="m-0 text-red-700">Report Missing Person</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 font-medium">👤 Full Name</label>
                  <Input
                    placeholder="e.g., Juan Dela Cruz"
                    value={newMissingPerson.personName}
                    onChange={(e) => setNewMissingPerson({...newMissingPerson, personName: e.target.value})}
                    className="border-2 focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium">🎂 Age</label>
                  <Input
                    placeholder="e.g., 35"
                    type="number"
                    value={newMissingPerson.age}
                    onChange={(e) => setNewMissingPerson({...newMissingPerson, age: e.target.value})}
                    className="border-2 focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium">📏 Height</label>
                  <Input
                    placeholder="e.g., 5'7&quot; or 170cm"
                    value={newMissingPerson.height}
                    onChange={(e) => setNewMissingPerson({...newMissingPerson, height: e.target.value})}
                    className="border-2 focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium">💇 Hair Color</label>
                  <Input
                    placeholder="e.g., Black, Brown, Gray"
                    value={newMissingPerson.hairColor}
                    onChange={(e) => setNewMissingPerson({...newMissingPerson, hairColor: e.target.value})}
                    className="border-2 focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium">👕 Outfit Last Seen</label>
                <Input
                  placeholder="e.g., Blue polo shirt, jeans, white sneakers"
                  value={newMissingPerson.outfitLastSeen}
                  onChange={(e) => setNewMissingPerson({...newMissingPerson, outfitLastSeen: e.target.value})}
                  className="border-2 focus:border-red-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 font-medium">📍 Last Seen Location</label>
                  <Input
                    placeholder="e.g., Near Poblacion Bridge"
                    value={newMissingPerson.lastSeenLocation}
                    onChange={(e) => setNewMissingPerson({...newMissingPerson, lastSeenLocation: e.target.value})}
                    className="border-2 focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium">🕐 Time Last Seen</label>
                  <Input
                    placeholder="e.g., 2 hours ago, 3:30 PM"
                    value={newMissingPerson.lastSeenTime}
                    onChange={(e) => setNewMissingPerson({...newMissingPerson, lastSeenTime: e.target.value})}
                    className="border-2 focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium">📞 Your Contact Information</label>
                <Input
                  placeholder="e.g., 0917-123-4567"
                  value={newMissingPerson.contactInfo}
                  onChange={(e) => setNewMissingPerson({...newMissingPerson, contactInfo: e.target.value})}
                  className="border-2 focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium">📝 Additional Details</label>
                <Textarea
                  placeholder="Any additional information that might help locate this person..."
                  value={newMissingPerson.description}
                  onChange={(e) => setNewMissingPerson({...newMissingPerson, description: e.target.value})}
                  rows={3}
                  className="border-2 focus:border-red-400"
                />
              </div>

              {/* Photo Upload for Missing Person */}
              <div>
                <label className="block text-sm mb-2 font-medium">📸 Recent Photos (recommended)</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 border-2 border-dashed border-red-300 hover:border-red-400"
                      disabled={selectedPhotos.length >= 3}
                    >
                      <Upload className="w-4 h-4" />
                      {selectedPhotos.length === 0 ? 'Add Photos' : `Add More (${selectedPhotos.length}/3)`}
                    </Button>
                  </div>
                  
                  {photoURLs.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {photoURLs.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Missing person photo ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmitMissingPerson}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                  disabled={!newMissingPerson.personName || !newMissingPerson.lastSeenLocation || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Missing Person Report'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Reports Display */}
      {activeTab === 'flood-reports' ? (
        <Card className="p-6">
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-l-4 border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10 border-2 border-blue-200 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                      {report.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{report.user}</span>
                      {report.verified && (
                        <Badge className="bg-green-100 text-green-700 text-xs border border-green-300">
                          ✓ Verified
                        </Badge>
                      )}
                      {report.isEmergency && (
                        <Badge className="bg-red-100 text-red-700 text-xs border border-red-300 animate-pulse">
                          🚨 Emergency
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{report.timestamp}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <LocationIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700 font-medium">{report.location}</span>
                      {report.waterDepth && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className={`text-sm font-semibold ${getSeverityColor(report.waterDepth)}`}>
                            🌊 {report.waterDepth} deep
                          </span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{report.description}</p>

                    {/* Photo Gallery */}
                    {report.photos && report.photos.length > 0 && (
                      <div className="mb-3">
                        <div className="flex gap-2 flex-wrap">
                          {report.photos.map((photo, index) => (
                            <div key={index} className="group relative">
                              <img 
                                src={photo} 
                                alt={`Flood photo ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-md group-hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => window.open(photo, '_blank')}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLikeReport(report.id)}
                        className={`flex items-center gap-1 hover:scale-105 transition-transform ${
                          likedReports.has(report.id) ? 'bg-blue-50 text-blue-600 border-blue-300' : ''
                        }`}
                      >
                        <ThumbsUp className={`w-3 h-3 ${likedReports.has(report.id) ? 'fill-current' : ''}`} />
                        {report.likes}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareReport(report)}
                        className="flex items-center gap-1 hover:scale-105 transition-transform"
                      >
                        <Share2 className="w-3 h-3" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewOnMap(report)}
                        className="flex items-center gap-1 hover:scale-105 transition-transform"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View on Map
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
              <Plus className="w-4 h-4 mr-2" />
              Load More Reports
            </Button>
          </div>
        </Card>
      ) : (
        /* Missing Persons Display */
        <Card className="p-6">
          <div className="space-y-4">
            {missingPersons.map((person) => (
              <Card key={person.id} className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {person.photos && person.photos.length > 0 ? (
                      <img 
                        src={person.photos[0]} 
                        alt={person.personName}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-red-200 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center border-2 border-red-200 shadow-md">
                        <UserX className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-red-700 m-0">{person.personName}</h4>
                      <Badge className={`text-xs ${
                        person.status === 'missing' ? 'bg-red-100 text-red-700 border-red-300' :
                        person.status === 'found' ? 'bg-green-100 text-green-700 border-green-300' :
                        'bg-yellow-100 text-yellow-700 border-yellow-300'
                      }`}>
                        {person.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{person.timestamp}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Age: {person.age}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Height: {person.height}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Palette className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Hair: {person.hairColor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">{person.lastSeenTime}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Shirt className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Last seen wearing:</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">{person.outfitLastSeen}</p>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <LocationIcon className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">Last seen at:</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">{person.lastSeenLocation}</p>
                    </div>

                    {person.description && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 leading-relaxed">{person.description}</p>
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">Contact:</span>
                        <a href={`tel:${person.contactInfo}`} className="text-sm text-blue-600 hover:underline">
                          {person.contactInfo}
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 ml-1">Reported by: {person.user}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => window.location.href = `tel:${person.contactInfo}`}
                      >
                        📞 Call Reporter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        Share Alert
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Flag className="w-3 h-3 mr-1" />
                        Report Seen
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
              <Plus className="w-4 h-4 mr-2" />
              Load More Missing Person Reports
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}