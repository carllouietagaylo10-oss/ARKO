import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Database, Key, CheckCircle, XCircle, Eye, EyeOff, 
  Settings, Zap, Shield, AlertTriangle, RefreshCw, 
  ExternalLink, HelpCircle, Sparkles, Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { realApiService } from '../services/realApiService';

interface ApiConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiConfigPanel({ isOpen, onClose }: ApiConfigPanelProps) {
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [savedUrl, setSavedUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const config = realApiService.getConfig();
      const existingUrl = config.baseUrl !== 'YOUR_API_BASE_URL_HERE' ? config.baseUrl : '';
      
      if (existingUrl) {
        setSavedUrl(existingUrl);
        setApiBaseUrl(existingUrl);
        setConnectionStatus('connected');
      }
    }
  }, [isOpen]);

  const handleSaveApiUrl = () => {
    if (!apiBaseUrl.trim()) {
      toast.error('Please enter an API base URL');
      return;
    }

    if (!isValidUrl(apiBaseUrl)) {
      toast.error('Please enter a valid URL (e.g., https://your-api.com)');
      return;
    }

    realApiService.setApiBaseUrl(apiBaseUrl.trim());
    setSavedUrl(apiBaseUrl.trim());
    
    toast.success('🌐 API configured! Map will now load live data.');
    setConnectionStatus('connected');
  };

  const handleRemoveApiUrl = () => {
    realApiService.setApiBaseUrl('YOUR_API_BASE_URL_HERE');
    setApiBaseUrl('');
    setSavedUrl('');
    setConnectionStatus('unknown');
    
    toast.info('API configuration removed. Using fallback data.');
  };

  const testConnection = async () => {
    if (!apiBaseUrl.trim()) {
      toast.error('Please enter an API URL first');
      return;
    }

    if (!isValidUrl(apiBaseUrl)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // Temporarily set the URL for testing
      const originalUrl = realApiService.getConfig().baseUrl;
      realApiService.setApiBaseUrl(apiBaseUrl.trim());
      
      // Test the connection
      const isHealthy = await realApiService.checkHealth();
      
      if (isHealthy) {
        setConnectionStatus('connected');
        toast.success('✅ API connection successful!');
      } else {
        setConnectionStatus('error');
        toast.warning('⚠️ API responded but health check failed');
        // Restore original URL if test failed
        realApiService.setApiBaseUrl(originalUrl);
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('❌ Connection test failed. Check your API URL.');
      console.error('API connection test failed:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const maskUrl = (url: string) => {
    if (!url) return '';
    if (url.length <= 20) return url;
    const parts = url.split('/');
    if (parts.length >= 3) {
      return parts[0] + '//' + parts[2] + '/••••••';
    }
    return url.slice(0, 15) + '••••••';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md mx-4"
          >
            <Card className="glass-card shadow-2xl border-2 border-blue-300 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Database size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold m-0">API Configuration</h2>
                      <p className="text-sm opacity-90 m-0">Connect to your live data endpoints</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Current Status */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Globe size={18} className="text-blue-600" />
                    Connection Status
                  </h3>
                  
                  <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">API Status:</span>
                      <Badge className={`${
                        connectionStatus === 'connected' 
                          ? 'bg-green-500 text-white' 
                          : connectionStatus === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-orange-500 text-white'
                      }`}>
                        {connectionStatus === 'connected' ? (
                          <>
                            <CheckCircle size={12} className="mr-1" />
                            Connected
                          </>
                        ) : connectionStatus === 'error' ? (
                          <>
                            <XCircle size={12} className="mr-1" />
                            Error
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={12} className="mr-1" />
                            Not Configured
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current URL:</span>
                        <span className="font-medium">
                          {savedUrl ? maskUrl(savedUrl) : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Endpoints:</span>
                        <span className="font-medium">/api/locations, /api/alerts</span>
                      </div>
                    </div>

                    {connectionStatus === 'connected' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={testConnection}
                          disabled={isTestingConnection}
                          className="w-full"
                        >
                          {isTestingConnection ? (
                            <>
                              <RefreshCw size={14} className="mr-2 animate-spin" />
                              Testing Connection...
                            </>
                          ) : (
                            <>
                              <Zap size={14} className="mr-2" />
                              Test Connection
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* API URL Configuration */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Key size={18} className="text-blue-600" />
                    API Base URL
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-url" className="text-sm font-medium text-gray-700">
                        Your API Base URL
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="api-url"
                          type="url"
                          placeholder="https://your-api-domain.com"
                          value={apiBaseUrl}
                          onChange={(e) => setApiBaseUrl(e.target.value)}
                          className="pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Globe size={16} className="text-gray-400" />
                        </div>
                      </div>
                      {savedUrl && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current: {maskUrl(savedUrl)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveApiUrl}
                        disabled={!apiBaseUrl.trim() || apiBaseUrl === savedUrl}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Save & Connect
                      </Button>
                      
                      {savedUrl && (
                        <Button
                          variant="outline"
                          onClick={handleRemoveApiUrl}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={16} />
                        </Button>
                      )}
                    </div>

                    {!connectionStatus || connectionStatus === 'unknown' ? (
                      <Button
                        variant="outline"
                        onClick={testConnection}
                        disabled={!apiBaseUrl.trim() || isTestingConnection}
                        className="w-full"
                      >
                        {isTestingConnection ? (
                          <>
                            <RefreshCw size={16} className="mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Zap size={16} className="mr-2" />
                            Test Connection
                          </>
                        )}
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* API Endpoints Documentation */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <HelpCircle size={18} className="text-blue-600" />
                    Required Endpoints
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Badge className="bg-blue-500 text-white text-xs px-2 py-1">GET</Badge>
                        <div className="flex-1">
                          <code className="text-sm font-mono text-blue-800">/api/locations</code>
                          <p className="text-xs text-blue-600 mt-1">Returns coordinates and data for map markers</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Parameters: lat, lng, radius, type, limit, page
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Badge className="bg-green-500 text-white text-xs px-2 py-1">GET</Badge>
                        <div className="flex-1">
                          <code className="text-sm font-mono text-green-800">/api/alerts</code>
                          <p className="text-xs text-green-600 mt-1">Returns flood and event information for map overlays</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Parameters: lat, lng, radius, type, severity, status, limit, page
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Badge className="bg-purple-500 text-white text-xs px-2 py-1">GET</Badge>
                        <div className="flex-1">
                          <code className="text-sm font-mono text-purple-800">/api/health</code>
                          <p className="text-xs text-purple-600 mt-1">Health check endpoint (optional)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-600" />
                    Live Data Integration
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Database size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Real-time Map Data</p>
                        <p className="text-xs text-blue-600">Live locations, alerts, and flood zones from your API</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <RefreshCw size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Auto-refresh</p>
                        <p className="text-xs text-green-600">Map data updates every 2 minutes automatically</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">Fallback Protection</p>
                        <p className="text-xs text-purple-600">Continues working even if API is temporarily unavailable</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example URL */}
                <div className="p-4 bg-gray-50 rounded-lg text-sm">
                  <p className="font-semibold text-gray-800 mb-2">Example API Base URL:</p>
                  <code className="text-blue-600">https://api.your-domain.com</code>
                  <p className="text-gray-600 mt-2">
                    Don't include the endpoint paths (/api/locations) - just the base domain.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}