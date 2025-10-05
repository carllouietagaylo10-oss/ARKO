import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  Waves,
  Map,
  MessageSquare,
  Database,
  Settings,
  Bell,
  Zap,
  Shield,
  Phone,
  Loader2,
} from "lucide-react";
import { LocationService } from "./components/LocationService";
import { TimeBasedBackground } from "./components/TimeBasedBackground";
import { ArkoLogo } from "./components/ArkoLogo";
import { ArkoAvatar } from "./components/ArkoAvatar";
import { LoginInterface } from "./components/LoginInterface";
import { 
  JellyfishWaves, JellyfishMap, JellyfishMessage, JellyfishDatabase,
  JellyfishSettings, JellyfishBell, JellyfishShield, JellyfishPhone
} from "./components/ColorfulIcons";
import { LanguageProvider, useLanguage } from "./components/hooks/useLanguage";
import { ThemeProvider } from "./components/hooks/useTheme";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Import real-time data services
import { weatherService } from "./services/weatherService";
import { floodService } from "./services/floodService";
import { supabase } from "./services/supabaseClient";
import { dataAggregationService } from "./services/dataAggregationService";
import { nasaService } from "./services/nasaService";
import { pagasaService } from "./services/pagasaService";

// Lazy load heavy components to prevent timeout
const AlertPanel = lazy(() => import("./components/AlertPanel").then(module => ({ default: module.AlertPanel })));
const LeafletFloodMap = lazy(() => import("./components/LeafletFloodMap").then(module => ({ default: module.LeafletFloodMap })));
const CommunityReports = lazy(() => import("./components/CommunityReports").then(module => ({ default: module.CommunityReports })));
const DataSources = lazy(() => import("./components/DataSources").then(module => ({ default: module.DataSources })));
const WeatherDisplay = lazy(() => import("./components/WeatherDisplay").then(module => ({ default: module.WeatherDisplay })));
const SettingsPanel = lazy(() => import("./components/SettingsPanel").then(module => ({ default: module.SettingsPanel })));
const VirtualAssistant = lazy(() => import("./components/VirtualAssistant").then(module => ({ default: module.VirtualAssistant })));
const EmergencyContacts = lazy(() => import("./components/EmergencyContacts").then(module => ({ default: module.EmergencyContacts })));
const QuickDialEmergency = lazy(() => import("./components/QuickDialEmergency").then(module => ({ default: module.QuickDialEmergency })));
const SOSEmergencyTracker = lazy(() => import("./components/SOSEmergencyTracker").then(module => ({ default: module.SOSEmergencyTracker })));
const ReportSituationPanel = lazy(() => import("./components/ReportSituationPanel").then(module => ({ default: module.ReportSituationPanel })));
const EvacuationRouteFinder = lazy(() => import("./components/EvacuationRouteFinder").then(module => ({ default: module.EvacuationRouteFinder })));
const EvacuationCenterTracker = lazy(() => import("./components/EvacuationCenterTracker").then(module => ({ default: module.EvacuationCenterTracker })));
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { toast } from "sonner";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("alerts");
  const [showSettings, setShowSettings] = useState(false);
  const [mapboxStyleMode, setMapboxStyleMode] = useState<'satellite' | 'streets'>('satellite');
  const [showArko, setShowArko] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showQuickDial, setShowQuickDial] = useState(false);
  const [showReportSituation, setShowReportSituation] = useState(false);
  const [showEvacuationRoute, setShowEvacuationRoute] = useState(false);
  const [showSOSTracker, setShowSOSTracker] = useState(false);
  const [isSOSLongPress, setIsSOSLongPress] = useState(false);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [appInitialized, setAppInitialized] = useState(false);
  const { t } = useLanguage();
  
  // Valencia City coordinates for real-time weather data
  const coordinates = {
    latitude: 7.9125,
    longitude: 125.0864
  };

  // Listen for map events (markers clicked) and open the alert UI
  useEffect(() => {
    const onMapAlertClick = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail as any;
        if (!detail) return;

        const topAlert = detail;
        setCurrentAlert({
          severity: topAlert.severity,
          location: topAlert.location || topAlert.barangay || 'Unknown',
          timeToImpact: topAlert.time_to_impact_minutes || 25,
          waterLevel: topAlert.water_level_cm ? `${topAlert.water_level_cm}cm expected` : '30-50cm expected',
          instructions: topAlert.instructions || [
            'Move valuable items to higher ground',
            'Prepare emergency supplies',
            'Monitor weather updates'
          ],
          evacuationCenter: topAlert.evacuation_center || 'Valencia City Hall',
          avoidAreas: topAlert.avoid_areas || []
        });

        // Switch to alerts tab so user sees details
        setActiveTab('alerts');
        // ensure panels are visible
        setShowArko(true);
      } catch (e) {
        console.warn('Error handling map:alert:click', e);
      }
    };

    const onMapUserClick = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail as any;
        // For now just log; future: open user-location panel
        console.log('map:user:click detail=', detail);
      } catch (e) {
        console.warn('Error handling map:user:click', e);
      }
    };

    window.addEventListener('map:alert:click', onMapAlertClick as EventListener);
    window.addEventListener('map:user:click', onMapUserClick as EventListener);

    return () => {
      window.removeEventListener('map:alert:click', onMapAlertClick as EventListener);
      window.removeEventListener('map:user:click', onMapUserClick as EventListener);
    };
  }, []);

  // Handle login
  const handleLogin = async (user: any) => {
    setUserData(user);
    setIsLoggedIn(true);
    
    // Fetch comprehensive aggregated data from all sources
    try {
      console.log('🌐 Fetching data from all sources (OpenWeather, NASA, PAGASA, Supabase)...');
      
      const aggregatedWeather = await dataAggregationService.getAggregatedWeather(
        coordinates.latitude,
        coordinates.longitude
      );
      
      setWeatherData(aggregatedWeather);
      
      console.log('✅ Multi-source weather data loaded:', {
        temperature: aggregatedWeather.temperature,
        sources: aggregatedWeather.sources,
        confidence: aggregatedWeather.confidence + '%',
        warnings: aggregatedWeather.warnings
      });
      
    } catch (error) {
      console.error('Error loading aggregated data:', error);
      // Fallback to single source
      try {
        const fallbackWeather = await weatherService.getCurrentWeather(
          coordinates.latitude,
          coordinates.longitude
        );
        setWeatherData(fallbackWeather);
        console.log('⚠️ Using fallback OpenWeather data');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
    
    setIsLoading(false);
  };

  // Initialize app and handle loading with timeout protection
  useEffect(() => {
    let isMounted = true;
    
    // Add loading class to body to disable animations
    document.body.classList.add('loading');
    
    // Force initialization after maximum timeout to prevent infinite loading
    const maxTimeout = setTimeout(() => {
      if (isMounted) {
        setAppInitialized(true);
        if (!isLoggedIn) {
          setIsLoading(false);
        }
        document.body.classList.remove('loading');
      }
    }, 2000); // Maximum 2 seconds

    const initTimer = setTimeout(() => {
      if (isMounted) {
        setAppInitialized(true);
        if (!isLoggedIn) {
          setIsLoading(false);
        }
        document.body.classList.remove('loading');
      }
    }, 500); // Faster initialization

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      clearTimeout(maxTimeout);
      document.body.classList.remove('loading');
    };
  }, [isLoggedIn]);

  // Fetch real flood alerts - only after app is initialized
  useEffect(() => {
    if (!appInitialized || isLoading || !isLoggedIn) return;
    
    let isMounted = true;
    
    const fetchAlerts = async () => {
      if (!isMounted) return;
      
      try {
        const alerts = await floodService.getActiveAlerts(
          coordinates.latitude,
          coordinates.longitude,
          10 // 10km radius
        );
        
        if (alerts.length > 0 && isMounted) {
          // Convert to format expected by UI
          const topAlert = alerts[0];
          setCurrentAlert({
            severity: topAlert.severity,
            location: topAlert.location,
            timeToImpact: topAlert.time_to_impact_minutes || 25,
            waterLevel: topAlert.water_level_cm ? `${topAlert.water_level_cm}cm expected` : '30-50cm expected',
            instructions: topAlert.instructions || [
              'Move valuable items to higher ground',
              'Prepare emergency supplies',
              'Monitor weather updates'
            ],
            evacuationCenter: topAlert.evacuation_center || 'Valencia City Hall',
            avoidAreas: topAlert.avoid_areas || ['Riverside Road', 'Lower Bridge Area']
          });
          console.log('✅ Real flood alert loaded:', topAlert);
        }
      } catch (error) {
        console.error('Error fetching flood alerts:', error);
      }
    };

    // Initial fetch
    const alertTimer = setTimeout(fetchAlerts, 2000);
    
    // Set up periodic updates every 2 minutes
    const alertInterval = setInterval(fetchAlerts, 2 * 60 * 1000);

    return () => {
      isMounted = false;
      clearTimeout(alertTimer);
      clearInterval(alertInterval);
    };
  }, [appInitialized, isLoading, isLoggedIn, coordinates.latitude, coordinates.longitude]);

  const handleArkoClose = () => {
    setShowArko(false);
    setCurrentAlert(null);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setCurrentAlert(null);
    setShowArko(false);
    setShowSettings(false);
    setShowEmergencyContacts(false);
    setShowQuickDial(false);
    setShowReportSituation(false);
    setShowEvacuationRoute(false);
    setShowSOSTracker(false);
    setIsSOSLongPress(false);
  };

  // Periodic multi-source weather updates (every 5 minutes)
  useEffect(() => {
    if (!isLoggedIn) return;

    const updateWeather = async () => {
      try {
        const aggregatedWeather = await dataAggregationService.getAggregatedWeather(
          coordinates.latitude,
          coordinates.longitude
        );
        setWeatherData(aggregatedWeather);
        console.log('🔄 Multi-source weather updated:', {
          temp: aggregatedWeather.temperature + '°C',
          sources: Object.entries(aggregatedWeather.sources)
            .filter(([_, active]) => active)
            .map(([name]) => name)
            .join(', '),
          confidence: aggregatedWeather.confidence + '%'
        });
      } catch (error) {
        console.error('Error updating aggregated weather:', error);
      }
    };

    // Update every 5 minutes
    const weatherInterval = setInterval(updateWeather, 5 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, [isLoggedIn, coordinates.latitude, coordinates.longitude]);

  // Loading component for lazy-loaded sections
  const LoadingComponent = ({ text = "Loading..." }: { text?: string }) => (
    <Card className="p-6 border-2 border-gray-300 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-gray-700 mb-1">{text}</p>
          <p className="text-sm text-gray-600">Please wait...</p>
        </div>
      </div>
    </Card>
  );

  // Force show login after 3 seconds to prevent infinite loading
  useEffect(() => {
    const forceShowLogin = setTimeout(() => {
      if (isLoading && !isLoggedIn) {
        console.info('Forcing login screen to prevent timeout');
        setIsLoading(false);
      }
    }, 3000);

    return () => clearTimeout(forceShowLogin);
  }, [isLoading, isLoggedIn]);

  // Show loading state with timeout protection
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Arko</h2>
          <p className="text-gray-500">Initializing flood monitoring system...</p>
          <p className="text-xs text-gray-400 mt-2">
            {appInitialized ? 'Almost ready...' : 'Starting up...'}
          </p>
        </div>
      </div>
    );
  }

  // Show login interface if not logged in
  if (!isLoggedIn) {
    return <LoginInterface onLogin={handleLogin} />;
  }

  return (
    <TimeBasedBackground>
      <div className="min-h-screen">
        {/* Professional Fixed Header with Improved Layout */}
        <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-lg border-b border-gray-200 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="py-3 sm:py-4">
              
              {/* Main Header Row */}
              <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                {/* Logo and Title - Always Left */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
                  <div className="relative">
                    <div className="transform hover:scale-105 transition-all duration-200 p-1.5 sm:p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <ErrorBoundary>
                        <ArkoLogo size={32} animated={true} />
                      </ErrorBoundary>
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white animate-pulse"></div>
                  </div>
                  
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                      {t('appName')}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 leading-tight hidden sm:block">
                      {t('appSubtitle')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Always Right */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowArko(true)}
                    className="relative group bg-gradient-to-r from-red-50 to-orange-50 border-red-300 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 transition-all duration-200 shadow-sm hover:shadow-md px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9"
                  >
                    <ErrorBoundary>
                      <ArkoAvatar size={16} animated={true} severity="medium" showSparkles={false} />
                    </ErrorBoundary>
                    <span className="ml-1 sm:ml-2 font-medium text-red-700 text-xs sm:text-sm">Talk to Arko</span>
                    <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs bg-red-500 text-white flex items-center justify-center rounded-full font-bold animate-pulse">
                      3
                    </Badge>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSettings(true)}
                    className="group bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-200 shadow-sm hover:shadow-md px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9"
                  >
                    <JellyfishSettings size={14} animated color="text-blue-600" />
                    <span className="ml-1 sm:ml-2 font-medium text-blue-700 text-xs sm:text-sm hidden sm:inline">Settings</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="bg-gray-50 border-gray-300 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9"
                    title="Logout"
                  >
                    <span className="text-gray-600 hover:text-red-600 font-medium text-xs sm:text-sm">Logout</span>
                  </Button>
                </div>
              </div>

              {/* Status Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 text-blue-700 text-xs px-2 py-0.5 font-medium">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    <span className="whitespace-nowrap">Valencia Active</span>
                  </Badge>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-0.5 font-bold animate-pulse">
                    LIVE
                  </Badge>
                  {userData && userData.isEmergencyAccess && (
                    <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs px-2 py-0.5 font-bold animate-pulse">
                      EMERGENCY
                    </Badge>
                  )}
                </div>
                
                {/* User Info - Mobile/Desktop */}
                {userData && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="bg-gray-50 rounded-md px-2 py-1 border border-gray-200">
                      <span className="font-medium text-gray-700">Welcome, </span>
                      <span className="font-semibold text-gray-800">{userData.name}</span>
                      <span className="ml-1 text-gray-500">
                        ({userData.isGuest ? 'Guest' : userData.isEmergencyAccess ? 'Emergency' : 'Registered'})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

      {/* Main Content with Improved Spacing */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          
          {/* Emergency Alert Banner - Professional Design */}
          {currentAlert && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-4 sm:p-5 shadow-lg border border-red-500">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <JellyfishBell size={20} animated color="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
                      <h3 className="font-bold text-base sm:text-lg leading-tight">
                        🚨 FLOOD ALERT - {currentAlert.location}
                      </h3>
                      <Badge className="bg-white/25 text-white font-bold text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit whitespace-nowrap border border-white/20">
                        {currentAlert.timeToImpact} min to impact
                      </Badge>
                    </div>
                    <p className="text-white/95 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                      Expected water level: <strong>{currentAlert.waterLevel}</strong>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button 
                        onClick={() => setShowArko(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 sm:h-10 px-3 sm:px-4 py-2 min-w-0 transition-all duration-200"
                      >
                        <ArkoAvatar size={18} animated={true} severity="high" showSparkles={false} />
                        <span className="ml-2 font-medium text-sm">Get Evacuation Help</span>
                      </Button>
                      <Button 
                        onClick={() => setShowQuickDial(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-9 sm:h-10 px-3 sm:px-4 py-2 min-w-0 transition-all duration-200"
                      >
                        <JellyfishPhone size={18} animated color="text-white" />
                        <span className="ml-2 font-medium text-sm">Quick Emergency Dial</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location Service */}
          <ErrorBoundary>
            <LocationService />
          </ErrorBoundary>

          {/* Enhanced Navigation Tabs with Better Spacing */}
          <Card className="p-4 sm:p-6 bg-white/95 shadow-xl border-2 border-blue-200 rounded-xl overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex w-full flex-row bg-white rounded-lg p-2 shadow-sm border border-gray-200 gap-3 mb-6">
                <TabsTrigger
                  value="alerts"
                  className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-bold hover:bg-red-50 transition-all duration-200 rounded-md py-3 px-3 sm:px-4 h-11 sm:h-12 text-center min-w-0"
                >
                  <JellyfishBell
                    size={20}
                    animated={activeTab === 'alerts'}
                    color={activeTab === 'alerts' ? 'text-white' : 'text-gray-500'}
                    className="flex-shrink-0 w-5 h-5"
                  />
                  <span className="font-medium data-[state=active]:font-bold text-gray-500 data-[state=active]:text-white text-xs sm:text-sm leading-tight text-center whitespace-nowrap">{t('alerts')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-bold hover:bg-blue-50 transition-all duration-200 rounded-md py-3 px-3 sm:px-4 h-11 sm:h-12 text-center min-w-0"
                >
                  <JellyfishMap
                    size={20}
                    animated={activeTab === 'map'}
                    color={activeTab === 'map' ? 'text-white' : 'text-gray-500'}
                    className="flex-shrink-0 w-5 h-5"
                  />
                  <span className="font-medium data-[state=active]:font-bold text-gray-500 data-[state=active]:text-white text-xs sm:text-sm leading-tight text-center whitespace-nowrap">{t('map')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-bold hover:bg-green-50 transition-all duration-200 rounded-md py-3 px-3 sm:px-4 h-11 sm:h-12 text-center min-w-0"
                >
                  <JellyfishMessage
                    size={20}
                    animated={activeTab === 'reports'}
                    color={activeTab === 'reports' ? 'text-white' : 'text-gray-500'}
                    className="flex-shrink-0 w-5 h-5"
                  />
                  <span className="font-medium data-[state=active]:font-bold text-gray-500 data-[state=active]:text-white text-xs sm:text-sm leading-tight text-center whitespace-nowrap">{t('reports')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-bold hover:bg-purple-50 transition-all duration-200 rounded-md py-3 px-3 sm:px-4 h-11 sm:h-12 text-center min-w-0"
                >
                  <JellyfishDatabase
                    size={20}
                    animated={activeTab === 'data'}
                    color={activeTab === 'data' ? 'text-white' : 'text-gray-500'}
                    className="flex-shrink-0 w-5 h-5"
                  />
                  <span className="font-medium data-[state=active]:font-bold text-gray-500 data-[state=active]:text-white text-xs sm:text-sm leading-tight text-center whitespace-nowrap">{t('data')}</span>
                </TabsTrigger>
              </TabsList>

            <TabsContent value="alerts" className="space-y-6">
              <ErrorBoundary>
                <Suspense fallback={<LoadingComponent text="Loading Alert System" />}>
                  <AlertPanel latitude={coordinates.latitude} longitude={coordinates.longitude} selectedAlert={currentAlert} />
                </Suspense>
              </ErrorBoundary>
              
              {/* Live Weather Display */}
              <ErrorBoundary>
                <Suspense fallback={<LoadingComponent text="Loading Weather Data" />}>
                  <WeatherDisplay latitude={coordinates.latitude} longitude={coordinates.longitude} />
                </Suspense>
              </ErrorBoundary>

              {/* Quick Actions with Professional Design */}
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-white to-blue-50 shadow-lg border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <Zap size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 leading-tight">{t('quickActions')}</h3>
                    <p className="text-gray-600 text-sm leading-tight">Emergency response and navigation tools</p>
                  </div>
                </div>
                
                {/* Featured Arko Button */}
                <Button 
                  className="w-full flex items-center justify-between gap-3 sm:gap-4 h-auto py-4 sm:py-5 mb-4 sm:mb-5 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:from-blue-700 hover:via-purple-700 hover:to-teal-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setShowArko(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative p-2 sm:p-2.5 bg-white/10 rounded-md flex-shrink-0">
                      <ErrorBoundary>
                        <ArkoAvatar size={24} animated={true} severity="low" showSparkles={false} />
                      </ErrorBoundary>
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="text-sm sm:text-lg font-bold leading-tight">Talk to Arko</div>
                      <div className="text-xs sm:text-sm opacity-90 leading-tight">Your AI Flood Assistant</div>
                    </div>
                  </div>
                  <Badge className="bg-orange-500 text-white font-bold px-2 py-1 rounded-md flex-shrink-0 text-xs">
                    NEW
                  </Badge>
                </Button>
                
                {/* Action Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <Button 
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 h-20 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-3 sm:p-4"
                    onClick={() => setShowEvacuationRoute(true)}
                  >
                    <JellyfishMap size={20} animated color="text-white" />
                    <span className="text-xs sm:text-sm font-medium text-center leading-tight">{t('findEvacuationRoute')}</span>
                  </Button>
                  <Button 
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 h-20 sm:h-24 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-3 sm:p-4"
                    onClick={() => setShowReportSituation(true)}
                  >
                    <JellyfishMessage size={20} animated color="text-white" />
                    <span className="text-xs sm:text-sm font-medium text-center leading-tight">{t('reportSituation')}</span>
                  </Button>
                </div>
                
                {/* Emergency Contacts Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    className="flex items-center justify-center gap-2 h-11 sm:h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => setShowQuickDial(true)}
                  >
                    <JellyfishPhone size={18} animated color="text-white" />
                    <span className="font-medium text-sm sm:text-base">Quick Emergency Dial</span>
                  </Button>
                  <Button 
                    className="flex items-center justify-center gap-2 h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => setShowEmergencyContacts(true)}
                  >
                    <JellyfishPhone size={18} animated color="text-white" />
                    <span className="font-medium text-sm sm:text-base">Evacuation Centers</span>
                  </Button>
                </div>
              </Card>
              
              {/* Enhanced Emergency Contact Card */}
              <Card className="p-6 sm:p-8 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <JellyfishShield size={28} animated color="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-red-900 mb-1 leading-tight">{t('emergency')}</h3>
                    <p className="text-sm sm:text-base text-red-700 leading-tight">24/7 Emergency Hotline Available</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setShowEmergencyContacts(true)}
                  >
                    <JellyfishPhone size={20} className="mr-3" animated color="text-white" />
                    View All Emergency Contacts
                  </Button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50 h-12 rounded-xl font-semibold transition-all duration-300"
                      onClick={() => window.location.href = 'tel:088-828-1481'}
                    >
                      🚒 Fire Department
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50 h-12 rounded-xl font-semibold transition-all duration-300"
                      onClick={() => window.location.href = 'tel:+63965-192-4530'}
                    >
                      🚑 Medical Emergency
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              {/* Leaflet Map Header */}
              <Card className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <JellyfishShield size={28} animated color="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-green-700 mb-1 leading-tight">Professional Interactive Mapping</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-tight">
                      Real-time flood monitoring powered by Leaflet with simplified loading and enhanced reliability
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-500 text-white font-medium px-2 py-1 text-xs">
                        Leaflet Standard
                      </Badge>
                      <Badge className="bg-blue-500 text-white font-medium px-2 py-1 text-xs">
                        Real-time API
                      </Badge>
                      <Badge className="bg-purple-500 text-white font-medium px-2 py-1 text-xs">
                        Auto-refresh
                      </Badge>
                      <Badge className="bg-orange-500 text-white font-medium px-2 py-1 text-xs">
                        FREE
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Leaflet Map Container */}
              <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-green-200">
                <ErrorBoundary>
                  <Suspense fallback={<LoadingComponent text="Loading Interactive Leaflet Map" />}>
                    <LeafletFloodMap latitude={coordinates.latitude} longitude={coordinates.longitude} />
                  </Suspense>
                </ErrorBoundary>
              </div>

              {/* Leaflet Map Instructions */}
              <Card className="p-6 sm:p-8 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Map size={24} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xl font-bold text-green-700 mb-1 leading-tight">Professional Leaflet Guide</h4>
                    <p className="text-sm sm:text-base text-gray-600 leading-tight">Learn how to use the professional flood monitoring map (simplified loading)</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Map Legend */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-green-800 mb-3 text-lg">Map Legend</h5>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></span>
                        <span className="text-green-700 leading-relaxed">Critical flood risk zones (immediate danger)</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0 mt-0.5"></span>
                        <span className="text-green-700 leading-relaxed">High flood risk zones (evacuation recommended)</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="w-4 h-4 bg-yellow-500 rounded-full flex-shrink-0 mt-0.5"></span>
                        <span className="text-green-700 leading-relaxed">Medium flood risk zones (monitor conditions)</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></span>
                        <span className="text-green-700 leading-relaxed">Low risk zones (safe areas)</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-0.5"></span>
                        <span className="text-green-700 leading-relaxed">Your current location</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="text-lg flex-shrink-0">🏠</span>
                        <span className="text-green-700 leading-relaxed">Evacuation centers (click for details)</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Interactive Features */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-green-800 mb-3 text-lg">Interactive Features</h5>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="text-lg flex-shrink-0">🛰️</span>
                        <span className="text-green-700 leading-relaxed">Switch between satellite and street view modes</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="text-lg flex-shrink-0">🎛️</span>
                        <span className="text-green-700 leading-relaxed">Toggle flood zones and evacuation centers on/off</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="text-lg flex-shrink-0">🔍</span>
                        <span className="text-green-700 leading-relaxed">Interactive zoom controls and navigation</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="text-lg flex-shrink-0">📊</span>
                        <span className="text-green-700 leading-relaxed">Live weather conditions with popup details</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="text-lg flex-shrink-0">🖱️</span>
                        <span className="text-green-700 leading-relaxed">Click and drag to pan, scroll to zoom, click markers for info</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 bg-white rounded-lg">
                        <span className="text-lg flex-shrink-0">⚡</span>
                        <span className="text-green-700 leading-relaxed">Real-time updates with simplified loading (faster & more reliable)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <ErrorBoundary>
                <Suspense fallback={<LoadingComponent text="Loading Community Reports" />}>
                  <CommunityReports />
                </Suspense>
              </ErrorBoundary>

              {/* Community Guidelines with Better Layout */}
              <Card className="p-6 sm:p-8 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <MessageSquare size={28} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xl font-bold text-green-700 mb-1 leading-tight">{t('reportingGuidelines')}</h4>
                    <p className="text-sm sm:text-base text-gray-600 leading-tight">Help your community by reporting accurate information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                      <span className="text-lg flex-shrink-0">✅</span>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-semibold text-green-800 mb-1">Accurate Reporting</h5>
                        <p className="text-sm text-green-700 leading-relaxed">{t('reportAccurate')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                      <span className="text-lg flex-shrink-0">📍</span>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-semibold text-green-800 mb-1">Location Details</h5>
                        <p className="text-sm text-green-700 leading-relaxed">{t('includeLocation')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                      <span className="text-lg flex-shrink-0">🚫</span>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-semibold text-green-800 mb-1">Avoid Rumors</h5>
                        <p className="text-sm text-green-700 leading-relaxed">{t('avoidUnverified')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                      <span className="text-lg flex-shrink-0">📸</span>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-semibold text-green-800 mb-1">Visual Evidence</h5>
                        <p className="text-sm text-green-700 leading-relaxed">{t('photosHelp')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Report Button */}
                <div className="mt-6 pt-6 border-t border-green-200">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setShowArko(true)}
                  >
                    <JellyfishMessage size={20} className="mr-3" animated color="text-white" />
                    Submit New Report
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <ErrorBoundary>
                <Suspense fallback={<LoadingComponent text="Loading Data Sources" />}>
                  <DataSources latitude={coordinates.latitude} longitude={coordinates.longitude} />
                </Suspense>
              </ErrorBoundary>

              {/* Data Sources Information with Better Layout */}
              <Card className="p-6 sm:p-8 bg-white shadow-xl border-2 border-gray-200 rounded-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Database size={28} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 leading-tight">Valencia City Weather Data</h4>
                    <p className="text-sm sm:text-base text-gray-600 leading-tight">Advanced weather simulation calibrated for local conditions</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    Arko uses advanced weather simulation specifically calibrated for Valencia City conditions to provide accurate flood predictions and warnings.
                  </p>
                  
                  {/* Data Features Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h5 className="font-bold text-gray-800 text-lg mb-3">Weather Patterns</h5>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-lg flex-shrink-0">🌧️</span>
                          <div className="min-w-0 flex-1">
                            <strong className="text-gray-800">Seasonal Patterns:</strong>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">Wet season (June-Nov) and dry season (Dec-May) patterns</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-lg flex-shrink-0">⏰</span>
                          <div className="min-w-0 flex-1">
                            <strong className="text-gray-800">Daily Cycles:</strong>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">Afternoon thunderstorms and evening showers</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-lg flex-shrink-0">🏔️</span>
                          <div className="min-w-0 flex-1">
                            <strong className="text-gray-800">Local Geography:</strong>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">Bukidnon highland weather characteristics</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h5 className="font-bold text-gray-800 text-lg mb-3">Analysis Features</h5>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-lg flex-shrink-0">⚡</span>
                          <div className="min-w-0 flex-1">
                            <strong className="text-gray-800">Flood Risk Analysis:</strong>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">Real-time calculations based on precipitation data</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-lg flex-shrink-0">👥</span>
                          <div className="min-w-0 flex-1">
                            <strong className="text-gray-800">Community Reports:</strong>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">Ground-truth conditions from local residents</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <span className="text-lg flex-shrink-0">🛰️</span>
                          <div className="min-w-0 flex-1">
                            <strong className="text-gray-800">Satellite Data:</strong>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">NASA Earth observations and PAGASA integration</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">✅</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-green-700 font-semibold mb-1">Weather Simulation Active!</p>
                          <p className="text-sm text-green-600 leading-relaxed">Data updates every 2 minutes with realistic patterns optimized for Valencia City flood monitoring.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">🌦️</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-blue-700 font-semibold mb-1">Current Mode: High-Fidelity Simulation</p>
                          <p className="text-sm text-blue-600 leading-relaxed">
                            Optimized for Valencia City flood monitoring. 
                            <br className="hidden sm:block" />
                            Go to Settings → Data Source to enable experimental live API connections.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-r from-white to-blue-50 border-t border-gray-200 mt-8 sm:mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center space-y-4 sm:space-y-5">
            {/* Logo and Title Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <JellyfishWaves size={20} animated color="text-blue-600" className="hidden sm:block" />
              
              <div className="flex items-center gap-3">
                <ErrorBoundary>
                  <ArkoLogo size={32} animated={true} />
                </ErrorBoundary>
                <ErrorBoundary>
                  <ArkoAvatar size={28} animated={true} severity="low" showSparkles={true} />
                </ErrorBoundary>
              </div>
              
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-1 leading-tight">
                  {t('appName')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                  {t('appSubtitle')}
                </p>
              </div>
              
              <JellyfishWaves size={20} animated color="text-blue-600" className="hidden sm:block" />
            </div>
            
            {/* Team and Contact Info */}
            <div className="space-y-3 sm:space-y-4">
              <div className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
                <p className="font-medium">
                  Team Astrobyte • Professional Flood Monitoring Interface
                </p>
                <p className="leading-relaxed">
                  {t('contactCDRRMO')}
                </p>
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge className="bg-green-500 text-white font-medium px-3 py-1 rounded-full text-xs">
                  LIVE MONITORING
                </Badge>
                <Badge variant="outline" className="border border-blue-300 text-blue-600 font-medium px-3 py-1 rounded-full text-xs">
                  Valencia City Ready
                </Badge>
                <Badge variant="outline" className="border border-purple-300 text-purple-600 font-medium px-3 py-1 rounded-full text-xs">
                  24/7 Emergency
                </Badge>
              </div>
              
              {/* Copyright and Version */}
              <div className="text-xs text-gray-500 pt-3 border-t border-gray-200 space-y-1">
                <p>© 2024 Team Astrobyte. All rights reserved. • Version 3.0 Professional</p>
                <p>Designed for Valencia City, Bukidnon flood monitoring and emergency response.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

        {/* Virtual Assistant - Arko */}
        {showArko && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <VirtualAssistant 
                isVisible={showArko} 
                onClose={handleArkoClose}
                alert={currentAlert}
                userLocation={coordinates}
                weatherData={weatherData}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <SettingsPanel 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
                userData={userData}
                onLogout={handleLogout}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Emergency Contacts Panel */}
        {showEmergencyContacts && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <EmergencyContacts isOpen={showEmergencyContacts} onClose={() => setShowEmergencyContacts(false)} />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Quick Dial Emergency Panel */}
        {showQuickDial && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <QuickDialEmergency isVisible={showQuickDial} onClose={() => setShowQuickDial(false)} />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Report Situation Panel */}
        {showReportSituation && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <ReportSituationPanel 
                isVisible={showReportSituation} 
                onClose={() => setShowReportSituation(false)}
                userLocation={coordinates}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Evacuation Route Finder */}
        {showEvacuationRoute && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <EvacuationRouteFinder 
                isVisible={showEvacuationRoute} 
                onClose={() => setShowEvacuationRoute(false)}
                userLocation={coordinates}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* SOS Emergency Tracker */}
        {showSOSTracker && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <SOSEmergencyTracker 
                isActive={showSOSTracker} 
                onClose={() => setShowSOSTracker(false)}
                userLocation={coordinates}
                onEmergencyCall={() => setShowEmergencyContacts(true)}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Enhanced Floating Emergency Button with SOS Long Press */}
        {isLoggedIn && (
          <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2">
            {/* SOS Instructions */}
            <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm animate-pulse">
              Tap: Quick Dial • Hold: SOS Tracker
            </div>
            
            {/* Main SOS Button */}
            <Button
              className={`w-16 h-16 rounded-full ${
                isSOSLongPress 
                  ? 'bg-gradient-to-r from-red-800 to-red-900 scale-125 animate-none' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse'
              } text-white shadow-2xl hover:shadow-3xl border-4 border-white hover:scale-110 transition-all duration-300`}
              onClick={() => {
                if (!isSOSLongPress) {
                  setShowQuickDial(true);
                }
              }}
              onMouseDown={() => {
                // Start long press detection
                const timer = setTimeout(() => {
                  setIsSOSLongPress(true);
                  // Vibrate if available
                  if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                  }
                  // Show SOS activation
                  toast.error('🚨 SOS MODE ACTIVATED', {
                    description: 'Release to start emergency location tracking',
                    duration: 3000
                  });
                }, 1000); // 1 second hold
                
                const handleMouseUp = () => {
                  clearTimeout(timer);
                  if (isSOSLongPress) {
                    // Activate SOS tracker
                    setShowSOSTracker(true);
                    setIsSOSLongPress(false);
                  }
                  document.removeEventListener('mouseup', handleMouseUp);
                  document.removeEventListener('touchend', handleMouseUp);
                };
                
                document.addEventListener('mouseup', handleMouseUp);
                document.addEventListener('touchend', handleMouseUp);
              }}
              onTouchStart={() => {
                // Same logic for touch devices
                const timer = setTimeout(() => {
                  setIsSOSLongPress(true);
                  if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                  }
                  toast.error('🚨 SOS MODE ACTIVATED', {
                    description: 'Release to start emergency location tracking',
                    duration: 3000
                  });
                }, 1000);
                
                const handleTouchEnd = () => {
                  clearTimeout(timer);
                  if (isSOSLongPress) {
                    setShowSOSTracker(true);
                    setIsSOSLongPress(false);
                  }
                  document.removeEventListener('touchend', handleTouchEnd);
                };
                
                document.addEventListener('touchend', handleTouchEnd);
              }}
              title={isSOSLongPress ? "Release to activate SOS Emergency Tracking" : "Tap for Quick Dial • Hold for SOS Tracker"}
            >
              <div className="flex flex-col items-center justify-center">
                {isSOSLongPress ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold mt-1">HOLD</span>
                  </>
                ) : showSOSTracker ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mb-1"></div>
                    <JellyfishPhone size={16} animated color="text-white" />
                    <span className="text-xs font-bold">LIVE</span>
                  </>
                ) : (
                  <>
                    <JellyfishPhone size={20} animated color="text-white" />
                    <span className="text-xs font-bold mt-0.5">SOS</span>
                  </>
                )}
              </div>
            </Button>
            
            {/* SOS Status Indicator */}
            {showSOSTracker && (
              <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                🚨 TRACKING ACTIVE
              </div>
            )}
          </div>
        )}

        {/* Evacuation Center Tracker */}
        <ErrorBoundary>
          <Suspense fallback={null}>
            <EvacuationCenterTracker 
              isVisible={isLoggedIn} 
              onEmergencyCall={() => setShowEmergencyContacts(true)}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </TimeBasedBackground>
  );
}

export default function App() {
  // Global error handling for unhandled promise rejections
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection:', event.reason);
      
      // Prevent the default browser behavior for timeout errors
      if (event.reason?.message?.includes('timeout') || 
          event.reason?.message?.includes('getPage')) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      console.warn('Global error:', event.error);
      
      // Prevent crashes from timeout-related errors
      if (event.error?.message?.includes('timeout') || 
          event.error?.message?.includes('getPage')) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
