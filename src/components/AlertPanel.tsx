import React, { useState } from 'react';
import { AlertTriangle, Clock, MapPin, Droplets, Navigation, Loader2, Phone, Radio, Share2, ExternalLink, Zap, Shield } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useWeatherData } from './hooks/useWeatherData';
import { toast } from 'sonner';

interface AlertPanelProps {
  latitude?: number;
  longitude?: number;
  selectedAlert?: any | null;
}

export function AlertPanel({ latitude = 7.9125, longitude = 125.0864, selectedAlert = null }: AlertPanelProps) {
  const { floodAlert, weatherData, loading, error, lastUpdate, isRealTime } = useWeatherData(latitude, longitude);
  // top-level hooks (must not be called conditionally)
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [selectedAlertLocal, setSelectedAlertLocal] = useState<any | null>(null);

  // prefer explicit selectedAlert prop, then local selection, then the hook-provided floodAlert
  const rawDisplayed = selectedAlert ?? selectedAlertLocal ?? floodAlert;

  const normalizeAlert = (a: any) => {
    if (!a) return null;
    // If already in hook format (has level), assume it's normalized
    if ((a as any).level) return a;

    const severity: string = (a.severity as string) || (a.priority as string) || 'low';
    const level = severity === 'critical' ? 'red' : severity === 'high' ? 'orange' : severity === 'medium' ? 'yellow' : 'green';

    let riskScore: number;
    if (typeof a.riskScore === 'number') {
      riskScore = a.riskScore;
    } else {
      const wl = (a.water_level_cm !== undefined && a.water_level_cm !== null) ? a.water_level_cm : (a.waterLevel !== undefined && a.waterLevel !== null ? a.waterLevel : 0);
      riskScore = Math.min(100, wl * 2);
      if (!riskScore) riskScore = 30;
    }

    const cause = a.cause ?? (a.instructions && a.instructions.length ? `REAL ALERT: ${a.instructions[0]}` : (a.location || a.barangay || 'Flood warning'));

    let recedingTime: string;
    if (a.recedingTime) {
      recedingTime = a.recedingTime;
    } else if (a.time_to_impact_minutes) {
      recedingTime = `${a.time_to_impact_minutes} minutes to impact`;
    } else if (a.timeToImpact) {
      recedingTime = a.timeToImpact;
    } else {
      recedingTime = '30min-2hrs estimated';
    }
    return {
      level,
      riskScore,
      cause,
      recedingTime,
      issuedAt: a.created_at ?? a.issuedAt ?? new Date().toISOString(),
      priority: severity as any,
      severity: a.severity ?? severity,
      location: a.location ?? a.barangay,
      instructions: a.instructions ?? a.instructionList ?? [],
      evacuation_center: a.evacuation_center ?? a.evacuationCenter,
      avoid_areas: a.avoid_areas ?? a.avoidAreas ?? []
    } as any;
  };

  const displayedAlert = normalizeAlert(rawDisplayed);
  const getAlertColor = (level: string) => {
    switch (level) {
      case 'red': return 'border-red-500 bg-red-50';
      case 'orange': return 'border-orange-500 bg-orange-50';
      case 'yellow': return 'border-yellow-500 bg-yellow-50';
      case 'green': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'red': return 'bg-red-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'yellow': return 'bg-yellow-500 text-white';
      case 'green': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading && !displayedAlert) {
    return (
      <Card className="p-6 border-2 border-gray-300 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-700 mb-1">Loading Alert System</p>
            <p className="text-sm text-gray-600">Fetching real-time flood data...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error && !displayedAlert) {
    return (
      <Card className="p-4 border-2 border-yellow-500 bg-yellow-50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="m-0">Unable to load live weather data</p>
            <p className="text-sm text-muted-foreground m-0">Using backup emergency data</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!displayedAlert) return null;

  // Interactive functions
  const handleEmergencyAction = () => {
  if (displayedAlert.level === 'red' || displayedAlert.level === 'orange') {
      // Show evacuation route
      const coordinates = `${latitude},${longitude}`;
      const evacuationCenter = "Valencia City Gymnasium, Valencia, Bukidnon";
      const googleMapsUrl = `https://www.google.com/maps/dir/${coordinates}/${encodeURIComponent(evacuationCenter)}`;
      window.open(googleMapsUrl, '_blank');
      toast.success("Opening evacuation route to Valencia City Gym", {
        description: "Safe evacuation route calculated based on current flood conditions"
      });
    } else {
      toast.info("Safety tips accessed", {
        description: "Review emergency preparedness guidelines"
      });
    }
  };

  const handleReportSituation = async () => {
    setReportSent(true);
    
    // Simulate sending report
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Situation report sent successfully!", {
      description: "Your report helps keep the community informed. Thank you!"
    });
    
    setTimeout(() => setReportSent(false), 3000);
  };

  const handleShareAlert = async () => {
    setIsSharing(true);
    
    const shareData = {
      title: `Arko Alert: ${getTitle(displayedAlert.level)}`,
      text: `${displayedAlert.cause}\nRisk Score: ${displayedAlert.riskScore}%\nEstimated Duration: ${displayedAlert.recedingTime}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Alert shared successfully!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast.success("Alert copied to clipboard!");
      }
    } catch (error) {
      console.log('Share cancelled or failed');
    } finally {
      setIsSharing(false);
    }
  };

  const handleEmergencyCall = () => {
    const phoneNumber = "tel:+63880000000"; // CDRRMO Valencia City
    window.location.href = phoneNumber;
    toast.info("Calling CDRRMO Valencia City Emergency Hotline");
  };

  const getTitle = (level: string) => {
    switch (level) {
      case 'red': return 'CRITICAL FLOOD WARNING';
      case 'orange': return 'FLOOD WATCH ALERT';
      case 'yellow': return 'WEATHER ADVISORY';
      case 'green': return 'NORMAL CONDITIONS';
      default: return 'WEATHER UPDATE';
    }
  };

  const getInstructions = (level: string) => {
    switch (level) {
      case 'red':
        return [
          'Evacuate immediately to Valencia City Gym',
          'Avoid flooded roads and bridges',
          'Bring essential items and documents',
          'Stay updated via radio or mobile alerts'
        ];
      case 'orange':
        return [
          'Monitor conditions closely',
          'Prepare emergency supplies',
          'Avoid low-lying areas',
          'Check on neighbors and family'
        ];
      case 'yellow':
        return [
          'Stay alert to changing conditions',
          'Keep emergency contacts ready',
          'Monitor local weather updates',
          'Secure outdoor items'
        ];
      case 'green':
        return [
          'Normal activities can continue',
          'Stay informed of weather updates',
          'Review emergency preparedness',
          'Report any unusual conditions'
        ];
      default:
        return ['Stay safe and monitor conditions'];
    }
  };

  return (
  <Card className={`p-4 border-2 ${getAlertColor(displayedAlert.level)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-6 h-6 ${displayedAlert.level === 'red' ? 'text-red-600' : displayedAlert.level === 'orange' ? 'text-orange-600' : displayedAlert.level === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`} />
          <div>
            <h2 className="m-0">{getTitle(displayedAlert.level)}</h2>
            <p className="text-sm text-muted-foreground m-0">Updated: {lastUpdate || 'Just now'}</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <p className="text-xs text-muted-foreground m-0">
                {isRealTime ? 'Live API data' : 'Simulation mode'}
              </p>
            </div>
          </div>
        </div>
        <Badge className={getBadgeColor(displayedAlert.level)}>
          {displayedAlert.level.toUpperCase()} LEVEL
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Current Weather Info */}
        {weatherData && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="m-0">Current Weather Conditions</h4>
              <Badge variant="outline" className="text-xs">
                {weatherData.realTimeSource === 'api' ? 'Real-time' : 'Simulated'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Temp: {weatherData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Humidity: {weatherData.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Wind: {weatherData.windSpeed.toFixed(1)} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${weatherData.precipitation > 5 ? 'bg-red-500' : weatherData.precipitation > 2 ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                <span>Rain: {weatherData.precipitation.toFixed(1)} mm/hr</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Pressure: {weatherData.pressure.toFixed(0)} hPa</span>
                <span>Visibility: {weatherData.visibility.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="m-0">Risk Assessment: Valencia City area</p>
            <p className="text-sm text-muted-foreground m-0">Risk Score: {displayedAlert.riskScore}%</p>
          </div>
        </div>

        {/* Cause */}
        <div className="flex items-start gap-2">
          <Droplets className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="m-0">Cause: {displayedAlert.cause}</p>
          </div>
        </div>

        {/* Receding Time */}
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="m-0">Estimated Duration: {displayedAlert.recedingTime}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white p-3 rounded-lg border">
          <h4 className="mb-2 flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            {displayedAlert.level === 'green' ? 'Current Status:' : 'Emergency Instructions:'}
          </h4>
          <ul className="space-y-1 text-sm">
            {getInstructions(displayedAlert.level).map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  displayedAlert.level === 'red' ? 'bg-red-500' : 
                  displayedAlert.level === 'orange' ? 'bg-orange-500' :
                  displayedAlert.level === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></span>
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        {/* Priority Alert Actions */}
  {displayedAlert.level === 'red' && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-red-600 animate-pulse" />
              <span className="text-red-800 font-medium">EMERGENCY ACTIONS REQUIRED</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="destructive" onClick={handleEmergencyCall}>
                <Phone className="w-3 h-3 mr-1" />
                Call CDRRMO
              </Button>
              <Button size="sm" variant="outline" onClick={handleShareAlert} disabled={isSharing}>
                <Share2 className="w-3 h-3 mr-1" />
                {isSharing ? 'Sharing...' : 'Alert Family'}
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              className={`flex-1 ${
                displayedAlert.level === 'red' ? 'bg-red-600 hover:bg-red-700' :
                displayedAlert.level === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                displayedAlert.level === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleEmergencyAction}
            >
              <Navigation className="w-4 h-4 mr-2" />
                {displayedAlert.level === 'green' ? 'View Safety Tips' : 'Get Evacuation Route'}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleReportSituation}
              disabled={reportSent}
            >
              <Radio className="w-4 h-4 mr-2" />
              {reportSent ? 'Report Sent!' : 'Report Situation'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleShareAlert}
              disabled={isSharing}
            >
              <Share2 className="w-3 h-3 mr-1" />
              {isSharing ? 'Sharing...' : 'Share Alert'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                toast.info("Live updates enabled", {
                  description: "You'll receive notifications for weather changes"
                });
              }}
            >
              <Shield className="w-3 h-3 mr-1" />
              Enable Alerts
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}