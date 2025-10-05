import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, ZoomIn, ZoomOut, RotateCcw, Satellite, Map as MapIcon, RefreshCw, Navigation, Wifi, WifiOff, Layers, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { floodService } from '../services/floodService';
import { type FloodAlert } from '../services/supabaseClient';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletFloodMapProps {
  latitude: number;
  longitude: number;
}

export function LeafletFloodMap({ latitude, longitude }: LeafletFloodMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'streets'>('satellite');
  const [showFloodLayers, setShowFloodLayers] = useState(true);
  const [showEvacuationCenters, setShowEvacuationCenters] = useState(true);
  const [floodAlerts, setFloodAlerts] = useState<FloodAlert[]>([]);
  const [showCustomImage, setShowCustomImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customImageOpacity, setCustomImageOpacity] = useState(0.85);
  const [settingBounds, setSettingBounds] = useState(false);
  const [customImageBounds, setCustomImageBounds] = useState<L.LatLngBoundsExpression | null>(null);
  const boundsPointsRef = useRef<L.LatLngLiteral[]>([]);
  const [zoom, setZoom] = useState(13);
  const [controlsSide, setControlsSide] = useState<'right' | 'left'>('right');
  const [lastDataUpdate, setLastDataUpdate] = useState<Date | null>(null);
  const [mapLayers, setMapLayers] = useState<{
    floods: any[];
    baseLayer: any;
  }>({
    floods: [],
    baseLayer: null
  });

  // Mutable ref for fast layer management (avoid stale closures)
  const mapLayersRef = useRef<Record<string, L.Layer>>({});
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);

  const attemptsRef = useRef(0);
  const initTimerRef = useRef<number | null>(null);

  // Initialize map using the installed Leaflet package
  useEffect(() => {
    console.log('🗺️ Using imported Leaflet to initialize map. mapRef.current =', mapRef.current);
    // cleanup any existing instance
    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove(); } catch (e) { console.warn('cleanup remove failed', e); }
      mapInstanceRef.current = null;
    }

    // Attempt initialization immediately, then retry a few times if it fails
    attemptsRef.current = 0;
    initializeMap();

    if (!mapInstanceRef.current) {
      initTimerRef.current = window.setInterval(() => {
        attemptsRef.current = (attemptsRef.current || 0) + 1;
        console.log('🗺️ retry initializeMap attempt', attemptsRef.current, 'mapRef.current=', mapRef.current);
        try {
          initializeMap();
        } catch (e) {
          console.warn('initializeMap retry error', e);
        }
        if (mapInstanceRef.current) {
          if (initTimerRef.current) { clearInterval(initTimerRef.current); initTimerRef.current = null; }
        }
        if (attemptsRef.current >= 12) {
          console.warn('🗺️ initializeMap failed after max attempts');
          if (initTimerRef.current) { clearInterval(initTimerRef.current); initTimerRef.current = null; }
          setMapError('Failed to initialize map after multiple attempts');
        }
      }, 500);
    }

    return () => {
      if (initTimerRef.current) { clearInterval(initTimerRef.current); initTimerRef.current = null; }
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) { /* ignore */ }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Decide whether to place controls on the right or left side of the map
  useEffect(() => {
    const computeSide = () => {
      try {
        const el = mapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const spaceRight = window.innerWidth - rect.right; // pixels to right
        const spaceLeft = rect.left; // pixels to left
        // Prefer right if there's at least 320px space, else use left if it has space
        if (spaceRight > 320) setControlsSide('right');
        else if (spaceLeft > 320) setControlsSide('left');
        else setControlsSide('right'); // fallback
      } catch (e) {
        setControlsSide('right');
      }
    };

    computeSide();
    window.addEventListener('resize', computeSide);
    const obs = new MutationObserver(computeSide);
    if (mapRef.current) obs.observe(mapRef.current, { attributes: true, childList: false, subtree: false });
    return () => { window.removeEventListener('resize', computeSide); obs.disconnect(); };
  }, [mapRef.current]);

  // Initialize the Leaflet map using standard approach
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      // Create map instance using imported L
      const map = L.map(mapRef.current, {
        center: [latitude, longitude],
        zoom: zoom,
        zoomControl: false,
        attributionControl: true
      });

      // Add base layer
      const baseLayer = getBaseLayer();
      if (baseLayer) {
        baseLayer.addTo(map);
        setMapLayers(prev => ({ ...prev, baseLayer }));
      }

      mapInstanceRef.current = map;
      setMapLoaded(true);
      setMapError(null);
      console.log('✅ Leaflet map initialized (imported L)');

      map.on('zoomend', () => setZoom(map.getZoom()));

    } catch (error) {
      console.error('❌ Failed to initialize Leaflet map:', error);
      setMapError('Failed to initialize map');
    }
  };

  // Get base layer based on style (use imported L)
  const getBaseLayer = () => {
    console.log('🗺️ getBaseLayer ->', mapStyle);
    if (mapStyle === 'satellite') {
      return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
      });
    } else {
      return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      });
    }
  };

  // Load flood alerts from floodService
  const loadFloodAlerts = async () => {
    try {
      console.log('🔄 Loading flood alerts for Leaflet map...', {
        latitude,
        longitude
      });

      const alerts = await floodService.getActiveAlerts(latitude, longitude, 10);

      setFloodAlerts(alerts);
      setLastDataUpdate(new Date());

  // Update map markers with the loaded alerts
  updateMapMarkers(alerts);

      console.log('✅ Flood alerts loaded for Leaflet:', {
        alerts: alerts.length
      });

    } catch (error) {
      console.error('❌ Failed to load flood alerts:', error);
      setFloodAlerts([]);
    }
  };

  // Update map markers based on flood alerts
  const updateMapMarkers = (alerts: FloodAlert[]) => {
    if (!mapInstanceRef.current) {
      console.warn('⚠️ Map not ready for marker updates');
      return;
    }

    const map = mapInstanceRef.current as L.Map;

    try {
      console.log('🗺️ Updating map markers:', {
        alerts: alerts.length
      });

      // Clear existing flood & evac layers safely (use mapLayersRef)
      Object.keys(mapLayersRef.current).forEach(key => {
        if (key.startsWith('flood_') || key.startsWith('evac_')) {
          const layer = mapLayersRef.current[key];
          try {
            if (map.hasLayer(layer)) map.removeLayer(layer);
          } catch (e) {
            console.warn('Warning removing layer', key, e);
          }
          delete mapLayersRef.current[key];
        }
      });

      const newFloodLayers: any[] = [];

      // Add flood alert markers and zones
      if (showFloodLayers && alerts.length > 0) {
        console.log('⚠️ Adding flood alert markers:', alerts.length);

        alerts.forEach((alert, index) => {
          try {
            const alertColor = alert.severity === 'critical' ? '#dc2626' : // Red
                              alert.severity === 'high' ? '#ea580c' : // Orange
                              alert.severity === 'medium' ? '#ca8a04' : // Yellow
                              '#16a34a'; // Green

            // Add alert marker
            const alertMarker = L.marker([alert.latitude, alert.longitude], {
              icon: L.divIcon({
                className: 'leaflet-div-icon custom-div-icon',
                html: `
                  <div style="
                    width: 28px;
                    height: 28px;
                    background-color: ${alertColor};
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                    font-size: 14px;
                    color: white;
                    animation: pulse 2s infinite;
                    z-index: 1001;
                  ">⚠️</div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              })
            });

            // Add popup with alert info
            const alertPopupContent = `
              <div style="font-family: system-ui; max-width: 220px;">
                <h3 style="margin: 0 0 8px 0; color: #dc2626; font-size: 14px; font-weight: bold;">
                  🚨 ${alert.location || 'Flood Alert'}
                </h3>
                <div style="font-size: 12px; line-height: 1.4; color: #374151;">
                  <p style="margin: 4px 0;"><strong>Severity:</strong>
                    <span style="color: ${alertColor}; text-transform: uppercase; font-weight: bold;">
                      ${alert.severity}
                    </span>
                  </p>
                  <p style="margin: 4px 0;"><strong>Area:</strong> ${alert.barangay || alert.location}</p>
                  <p style="margin: 4px 0;">Water level: ${alert.water_level_cm || 0}cm</p>
                  <p style="margin: 4px 0;">${alert.instructions ? alert.instructions.join('. ') : 'Monitor conditions closely.'}</p>
                </div>
              </div>
            `;

            alertMarker.bindPopup(alertPopupContent);
            alertMarker.addTo(map);
            // dispatch an event when marker clicked so other UI can react
            alertMarker.on('click', () => {
              try { window.dispatchEvent(new CustomEvent('map:alert:click', { detail: alert })); } catch (e) { /* ignore */ }
            });
            newFloodLayers.push(alertMarker);
            mapLayersRef.current[`flood_${alert.id}`] = alertMarker;

            // Add circular flood zone
            const floodZone = L.circle([alert.latitude, alert.longitude], {
              color: alertColor,
              fillColor: alertColor,
              fillOpacity: 0.2,
              radius: 1000, // 1km radius
              weight: 2
            });

            floodZone.addTo(map);
            newFloodLayers.push(floodZone);
            mapLayersRef.current[`floodzone_${alert.id}`] = floodZone;
            // make the flood zone clickable: open the marker popup and dispatch the alert event
            try {
              floodZone.on('click', () => {
                try {
                  if (alertMarker && (alertMarker as any).openPopup) (alertMarker as any).openPopup();
                  window.dispatchEvent(new CustomEvent('map:alert:click', { detail: alert }));
                } catch (e) { /* ignore */ }
              });
            } catch (e) { console.warn('Failed to attach click to flood zone', e); }

            console.log(`⚠️ Added flood alert ${index + 1}:`, alert.location);
          } catch (alertError) {
            console.error(`❌ Failed to add flood alert ${alert.location}:`, alertError);
          }
        });
      }

      // Add user location marker
      try {
  const userMarker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'leaflet-div-icon custom-div-icon',
            html: `
              <div style="
                width: 20px;
                height: 20px;
                background-color: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                animation: pulse 2s infinite;
                z-index: 1002;
              "></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        });

  userMarker.bindPopup(`
          <div style="font-family: system-ui; text-align: center;">
            <h3 style="margin: 0 0 4px 0; color: #3b82f6; font-size: 12px; font-weight: bold;">
              📍 Your Location
            </h3>
            <p style="margin: 0; font-size: 11px; color: #6b7280;">
              Valencia City, Bukidnon
            </p>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #9ca3af;">
              Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}
            </p>
          </div>
        `);
        userMarker.addTo(map);
        // bind a small tooltip on hover for quick info
        try { userMarker.bindTooltip('Your Location', { permanent: false, direction: 'top' }); } catch (e) {}
        newFloodLayers.push(userMarker);
        mapLayersRef.current[`user_marker`] = userMarker;
        userMarker.on('click', () => {
          try { window.dispatchEvent(new CustomEvent('map:user:click', { detail: { latitude, longitude } })); } catch (e) {}
        });
        console.log('📍 Added user location marker');
      } catch (userMarkerError) {
        console.error('❌ Failed to add user location marker:', userMarkerError);
      }

      // Update layers state (for UI) and keep mapLayersRef in sync
      setMapLayers(prev => ({ ...prev, floods: newFloodLayers }));

      console.log('✅ Map markers updated successfully:', {
        floodMarkers: newFloodLayers.length,
        total: newFloodLayers.length
      });

    } catch (error) {
      console.error('❌ Error updating map markers:', error);
    }
  };

  // Initialize flood alerts when component mounts
  useEffect(() => {
    if (mapLoaded) {
      // Initial load
      loadFloodAlerts();

      // Set up periodic data refresh (every 2 minutes)
      const refreshInterval = setInterval(() => {
        loadFloodAlerts();
      }, 2 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [mapLoaded, latitude, longitude]);

  // Subscribe to real-time alerts via floodService
  useEffect(() => {
    let channel: any = null;
    try {
      channel = floodService.subscribeToAlerts((alert: FloodAlert) => {
        console.log('📡 Real-time alert received:', alert);
        setFloodAlerts(prev => {
          const next = [alert, ...prev];
          // update markers immediately
          try { updateMapMarkers(next); } catch (e) { console.warn('updateMapMarkers failed on realtime', e); }
          return next;
        });
      });
    } catch (e) {
      console.warn('Failed to subscribe to floodService alerts', e);
    }

    return () => {
      try {
        if (channel?.unsubscribe) channel.unsubscribe();
        else if (channel?.remove) channel.remove();
      } catch (e) { /* ignore */ }
    };
  }, []);

  // Manage custom image overlay (toggleable & interactive)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current as L.Map;

    // Click-to-set-bounds handler (when user enables bounds mode)
    const onMapClickForBounds = (ev: L.LeafletMouseEvent) => {
      try {
        boundsPointsRef.current.push(ev.latlng as L.LatLngLiteral);
        const pts = boundsPointsRef.current;
        if (pts.length === 2) {
          const sw = L.latLng(Math.min(pts[0].lat, pts[1].lat), Math.min(pts[0].lng, pts[1].lng));
          const ne = L.latLng(Math.max(pts[0].lat, pts[1].lat), Math.max(pts[0].lng, pts[1].lng));
          setCustomImageBounds([ [sw.lat, sw.lng], [ne.lat, ne.lng] ]);
          // enable overlay automatically
          setShowCustomImage(true);
          setSettingBounds(false);
          // clear ref
          boundsPointsRef.current = [];
        }
      } catch (e) { console.warn('bounds click handler failed', e); }
    };

    if (settingBounds) {
      // start listening
      map.getContainer().style.cursor = 'crosshair';
      map.on('click', onMapClickForBounds);
    }

    return () => {
      try {
        map.getContainer().style.cursor = '';
        map.off('click', onMapClickForBounds);
      } catch (e) {}
    };

    // Helper to remove existing overlay
    const removeOverlay = () => {
      if (imageOverlayRef.current) {
        try { if (map.hasLayer(imageOverlayRef.current)) map.removeLayer(imageOverlayRef.current); } catch (e) { /* ignore */ }
        imageOverlayRef.current = null;
      }
    };

    if (showCustomImage && customImageUrl) {
      try {
        // Place overlay centered at the user's lat/lng with a small bounds box
        const delta = 0.01; // ~1km depending on latitude
        const bounds: L.LatLngBoundsExpression = [
          [latitude - delta, longitude - delta],
          [latitude + delta, longitude + delta]
        ];

        // Remove any existing overlay first
        removeOverlay();

        // Create overlay as non-interactive and place it explicitly into Leaflet's overlay pane
        const overlay = L.imageOverlay(customImageUrl, bounds, { opacity: customImageOpacity, interactive: false, pane: 'overlayPane' });
        overlay.addTo(map);

        // Ensure underlying elements remain clickable by disabling pointer events on the overlay element
        try {
          // Prefer the public API getElement(), fallback to internal _image
          const imgEl = (overlay as any)?.getElement ? (overlay as any).getElement() : (overlay as any)?._image;
          if (imgEl) {
            (imgEl as HTMLImageElement).style.pointerEvents = 'none';
            (imgEl as HTMLImageElement).style.zIndex = '350';
          }
          // also set zIndex via API if available
          if ((overlay as any).setZIndex) (overlay as any).setZIndex(350);
        } catch (e) {
          // non-fatal
        }

        imageOverlayRef.current = overlay;
        mapLayersRef.current['custom_image_overlay'] = overlay;

        // During map zoom/pan interactions, reduce overlay opacity so map features remain visible
        const originalOpacity = customImageOpacity;
        const onZoomStart = () => {
          try {
            if (imageOverlayRef.current && (imageOverlayRef.current as any).setOpacity) (imageOverlayRef.current as any).setOpacity(Math.max(0.05, originalOpacity * 0.2));
            const imgEl = (imageOverlayRef.current as any)?.getElement ? (imageOverlayRef.current as any).getElement() : (imageOverlayRef.current as any)?._image;
            if (imgEl) (imgEl as HTMLImageElement).style.pointerEvents = 'none';
          } catch (e) {}
        };
        const onZoomEnd = () => {
          try {
            if (imageOverlayRef.current && (imageOverlayRef.current as any).setOpacity) (imageOverlayRef.current as any).setOpacity(originalOpacity);
            const imgEl = (imageOverlayRef.current as any)?.getElement ? (imageOverlayRef.current as any).getElement() : (imageOverlayRef.current as any)?._image;
            if (imgEl) (imgEl as HTMLImageElement).style.pointerEvents = 'none';
          } catch (e) {}
        };

        try {
          map.on('zoomstart', onZoomStart);
          map.on('zoomend', onZoomEnd);
        } catch (e) {}

        // store handlers for cleanup by attaching to overlayRef
        (imageOverlayRef as any)._zoomHandlers = { onZoomStart, onZoomEnd };
      } catch (e) {
        console.error('Failed to add custom image overlay', e);
      }
    } else {
      // Remove overlay if toggled off or no URL
      try { removeOverlay(); delete mapLayersRef.current['custom_image_overlay']; } catch (e) {}
    }

    // Cleanup when component unmounts or dependencies change
    return () => {
      try { removeOverlay(); } catch (e) {}
    };
  }, [showCustomImage, customImageUrl, customImageOpacity, mapInstanceRef.current, latitude, longitude, settingBounds, customImageBounds]);

  // Update map style
  useEffect(() => {
    if (mapInstanceRef.current && mapLayersRef.current['baseLayer']) {
      const map = mapInstanceRef.current as L.Map;

      // Remove current base layer
      try { map.removeLayer(mapLayersRef.current['baseLayer']); } catch (e) { /* ignore */ }

      // Add new base layer
      const newBaseLayer = getBaseLayer();
      if (newBaseLayer) {
        newBaseLayer.addTo(map);
        mapLayersRef.current['baseLayer'] = newBaseLayer;
        setMapLayers(prev => ({ ...prev, baseLayer: newBaseLayer }));
      }
    }
  }, [mapStyle]);

  // Handle zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 13);
      setZoom(13);
    }
  };

  // Handle style change
  const changeMapStyle = (newStyle: 'satellite' | 'streets') => {
    setMapStyle(newStyle);
  };

  // Handle manual data refresh
  const handleRefreshData = () => {
    loadFloodAlerts();
  };

  // Toggle flood layers visibility
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    mapLayers.floods.forEach(layer => {
      if (showFloodLayers) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
    });
  }, [showFloodLayers]);

  // Get flood risk level based on alert data
  const getFloodRiskLevel = () => {
    if (floodAlerts.length === 0) return 'low';

    const highestSeverity = floodAlerts.reduce((max, alert) => {
      const severityLevels: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
      const currentLevel = severityLevels[alert.severity] || 0;
      const maxLevel = severityLevels[max] || 0;
      return currentLevel > maxLevel ? alert.severity : max;
    }, 'low');

    return highestSeverity;
  };

  const floodRiskLevel = getFloodRiskLevel();

  // Note: Do not short-circuit rendering here. The main render below contains the map container
  // and overlays for loading / error. We keep the DOM node mounted so initialization can run.

  // Main map render
  // compute panel styles based on chosen side
  const controlPanelStyle: React.CSSProperties = controlsSide === 'right'
    ? { left: 'calc(100% + 16px)', top: '1rem' }
    : { right: 'calc(100% + 16px)', top: '1rem' };

  const zoomStyle: React.CSSProperties = controlsSide === 'right'
    ? { left: 'calc(100% + 16px)', bottom: '1rem' }
    : { right: 'calc(100% + 16px)', bottom: '1rem' };

  const legendStyle: React.CSSProperties = controlsSide === 'right'
    ? { left: 'calc(100% + 16px)', bottom: '4rem' }
    : { right: 'calc(100% + 16px)', bottom: '4rem' };

  return (
    <div className="w-full relative bg-gray-100 rounded-xl overflow-visible border-2 border-blue-200">
      {/* Responsive map height: large screens 500px, medium 420px, small 60vh */}
      <div className="w-full h-[60vh] md:h-[420px] lg:h-[500px] relative rounded-xl overflow-hidden" style={{ boxSizing: 'border-box' }}>
        {/* Leaflet Map Container */}
        <div
          ref={mapRef}
          className="relative w-full h-full"
          style={{ minHeight: '200px' }}
        />

        {/* Flood Risk Overlay stays inside the map container */}
        {showFloodLayers && (
          <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
            floodRiskLevel === 'critical' ? 'bg-red-500/30 border-2 border-red-400' :
            floodRiskLevel === 'high' ? 'bg-orange-500/25 border-2 border-orange-400' :
            floodRiskLevel === 'medium' ? 'bg-yellow-500/20 border-2 border-yellow-400' :
            'bg-green-500/10 border-2 border-green-300'
          }`}>
            <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
              🌊 Live Risk: {floodRiskLevel.toUpperCase()}
              {floodAlerts.length > 0 && (
                <span className="block text-xs opacity-90">{floodAlerts.length} active alert{floodAlerts.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Leaflet Map Container */}
      <div
        ref={mapRef}
        className="relative w-full h-full"
        style={{ minHeight: '500px' }}
      />

      {/* Flood Risk Overlay */}
      {showFloodLayers && (
        <div
          className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
            floodRiskLevel === 'critical' ? 'bg-red-500/30 border-2 border-red-400' :
            floodRiskLevel === 'high' ? 'bg-orange-500/25 border-2 border-orange-400' :
            floodRiskLevel === 'medium' ? 'bg-yellow-500/20 border-2 border-yellow-400' :
            'bg-green-500/10 border-2 border-green-300'
          }`}
        >
          <div className="absolute top-6 left-6 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
            🌊 Live Risk: {floodRiskLevel.toUpperCase()}
            {floodAlerts.length > 0 && (
              <span className="block text-xs opacity-90">
                {floodAlerts.length} active alert{floodAlerts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

  {/* Map Controls (moved outside the map area to avoid covering features) */}
  {/* Desktop controls (visible on md+) */}
  <div className="hidden md:block absolute z-20 space-y-2" style={controlPanelStyle}>
        {/* Data Status */}
        <Card className="p-2 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-500" />
            <div className="text-xs">
              <div className="text-green-600 font-medium">Flood Service</div>
              <div className="text-gray-500">{floodAlerts.length}⚠️</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefreshData}
              className="h-6 w-6 p-0"
              title={`Refresh Data (Last: ${lastDataUpdate ? lastDataUpdate.toLocaleTimeString() : 'Never'})`}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </Card>

        {/* Style Switcher */}
        <Card className="p-2 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={mapStyle === 'satellite' ? 'default' : 'outline'}
              onClick={() => changeMapStyle('satellite')}
              className="h-8 px-2"
            >
              <Satellite size={14} className="mr-1" />
              Satellite
            </Button>
            <Button
              size="sm"
              variant={mapStyle === 'streets' ? 'default' : 'outline'}
              onClick={() => changeMapStyle('streets')}
              className="h-8 px-2"
            >
              <MapIcon size={14} className="mr-1" />
              Streets
            </Button>
          </div>
        </Card>

        {/* Layer Controls */}
        <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Flood Zones</span>
              <Switch
                checked={showFloodLayers}
                onCheckedChange={setShowFloodLayers}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Evacuation Centers</span>
              <Switch
                checked={showEvacuationCenters}
                onCheckedChange={setShowEvacuationCenters}
              />
            </div>
            <div className="pt-2 border-t border-gray-100 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Custom Image Overlay</span>
                <Switch checked={showCustomImage} onCheckedChange={(v: any) => setShowCustomImage(!!v)} />
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste image URL here"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="w-full text-xs p-2 border rounded-md"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs">Opacity</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={customImageOpacity}
                    onChange={(e) => setCustomImageOpacity(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{Math.round(customImageOpacity * 100)}%</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowCustomImage(true)} className="w-full">Show</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCustomImage(false)} className="w-full">Hide</Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant={settingBounds ? 'destructive' : 'outline'} onClick={() => { setSettingBounds(v => !v); boundsPointsRef.current = []; setCustomImageBounds(null); }} className="w-full">
                    {settingBounds ? 'Cancel Bounds' : 'Set Bounds (click 2 points)'}
                  </Button>
                  <Button size="sm" onClick={() => { setShowCustomImage(true); }} className="w-full">Apply</Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => {
                    if (!mapInstanceRef.current || !customImageUrl) return;
                    try {
                      const map = mapInstanceRef.current as L.Map;
                      const center = map.getCenter();
                      const popupHtml = `<div style=\"max-width:320px\"><img src=\"${customImageUrl}\" style=\"width:100%;height:auto;border-radius:6px;display:block;margin-bottom:6px;\" /><div style=\\\"font-size:12px;color:#374151\\\">Custom overlay preview</div></div>`;
                      L.popup({ maxWidth: 340 }).setLatLng(center).setContent(popupHtml).openOn(map);
                    } catch (e) { console.warn('Failed to show preview popup', e); }
                  }} className="w-full">Preview</Button>
                </div>
                {settingBounds && (
                  <div className="text-xs text-gray-600 mt-1">Click two points on the map to define the overlay corners.</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

  {/* Zoom Controls (moved outside map) */}
  <div className="hidden md:flex absolute z-20 flex space-x-1" style={zoomStyle}>
        <Button size="sm" onClick={handleZoomIn} className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm">
          <ZoomIn size={14} />
        </Button>
        <Button size="sm" onClick={handleZoomOut} className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm">
          <ZoomOut size={14} />
        </Button>
        <Button size="sm" onClick={handleResetView} className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm">
          <RotateCcw size={14} />
        </Button>
        <Button
          size="sm"
          onClick={() => window.open(`https://www.google.com/maps/@${latitude},${longitude},${zoom}z/data=!3m1!1e3`, '_blank')}
          className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm"
          title="Open in Google Maps"
        >
          <Navigation size={14} />
        </Button>
      </div>

  {/* Map Legend (moved outside map) */}
  <div className="hidden md:block absolute z-20" style={legendStyle}>
        <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-lg">
          <h4 className="text-sm font-semibold mb-2 text-center">Valencia City Live Map (Leaflet)</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Safe Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Flood Alerts</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Alerts */}
      {floodAlerts.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="text-center">
              <h4 className="text-sm font-semibold mb-1">🚨 Active Flood Alerts</h4>
              <div className="text-xs space-y-1">
                {floodAlerts.slice(0, 2).map(alert => (
                  <Badge
                    key={alert.id}
                    className={`text-xs mt-1 ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    } text-white block`}
                  >
                    {alert.severity.toUpperCase()}: {alert.barangay || alert.location}
                  </Badge>
                ))}
                {floodAlerts.length > 2 && (
                  <div className="text-xs text-gray-600">
                    +{floodAlerts.length - 2} more alerts
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Mobile controls: a bottom sheet for small screens */}
      <div className="md:hidden fixed left-0 right-0 bottom-0 z-30">
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-t-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Map Controls</div>
            <div className="text-xs text-gray-500">Tap items to toggle</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="p-2 bg-blue-50 rounded text-xs" onClick={() => changeMapStyle('satellite')}>Satellite</button>
            <button className="p-2 bg-blue-50 rounded text-xs" onClick={() => changeMapStyle('streets')}>Streets</button>
            <button className="p-2 bg-blue-50 rounded text-xs" onClick={() => setShowFloodLayers(v => !v)}>{showFloodLayers ? 'Hide Flood' : 'Show Flood'}</button>
            <button className="p-2 bg-blue-50 rounded text-xs" onClick={() => setShowCustomImage(v => !v)}>{showCustomImage ? 'Hide Image' : 'Show Image'}</button>
            <button className="p-2 bg-blue-50 rounded text-xs" onClick={handleRefreshData}>Refresh</button>
            <button className="p-2 bg-blue-50 rounded text-xs" onClick={handleResetView}>Center</button>
          </div>
          <div className="mt-2 text-xs text-gray-600">Use the preview or set bounds on desktop for precise overlay placement.</div>
        </div>
      </div>

  {/* Leaflet Styles - inline for better integration */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.1);
            }
          }

          .leaflet-div-icon {
            background: transparent !important;
            border: none !important;
          }

          .custom-div-icon {
            background: transparent !important;
            border: none !important;
          }

          .leaflet-popup-content-wrapper {
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          }

          .leaflet-popup-tip {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }

          .leaflet-container {
            font-family: system-ui, -apple-system, sans-serif;
          }
        `
      }} />
    </div>
  );
}
