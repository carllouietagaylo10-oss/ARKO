import React, { useState } from 'react';
import { 
  Settings, 
  Globe, 
  Bell, 
  Palette, 
  Ruler, 
  Info,
  Check,
  Volume2,
  VolumeX,
  Radio,
  User,
  Brain,
  X
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useLanguage } from './hooks/useLanguage';
import { useTheme } from './hooks/useTheme';
import { JellyfishSettings } from './ColorfulIcons';
import { AIConfigPanel } from './AIConfigPanel';
import { aiService } from '../services/aiService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: any;
  onLogout?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, userData, onLogout }) => {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const { actualTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [units, setUnits] = useState('metric');
  const [dataSource, setDataSource] = useState('simulation');
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiStatus, setAiStatus] = useState(aiService.getStatus());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center intense-neon-pulse">
                <JellyfishSettings size={24} animated color="text-white" />
              </div>
              <div>
                <h2 className="m-0 font-bold">{t('settings')}</h2>
                <p className="text-sm text-muted-foreground m-0">Customize your Arko experience</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="hover:bg-red-50 hover:text-red-600">
          <X className="w-4 h-4" />
        </Button>
          </div>

          <div className="space-y-6">
            {/* User Profile Section */}
            {userData && (
              <Card className="p-4 glass-card border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center intense-neon-pulse">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="m-0 font-semibold">User Profile</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="font-medium">{userData.name}</span>
                  </div>
                  {userData.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="font-medium text-sm">{userData.email}</span>
                    </div>
                  )}
                  {userData.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span className="font-medium">{userData.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Access Type:</span>
                    <Badge className={
                      userData.isEmergencyAccess ? 'bg-red-500' :
                      userData.isGuest ? 'bg-gray-500' : 'bg-green-500'
                    }>
                      {userData.isEmergencyAccess ? 'Emergency' : 
                       userData.isGuest ? 'Guest' : 'Registered'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Login Time:</span>
                    <span className="font-medium text-sm">
                      {new Date(userData.loginTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="font-medium text-sm">{userData.location}</span>
                  </div>
                  
                  {onLogout && (
                    <div className="pt-3 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        onClick={onLogout}
                        className="w-full bg-gradient-to-r from-red-50 to-pink-50 border-red-300 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 text-red-700 hover:text-red-800"
                      >
                        <Radio className="w-4 h-4 mr-2" />
                        Logout from Arko
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* AI Configuration */}
            <Card className="p-4 glass-card border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center intense-neon-pulse">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="m-0 font-semibold">AI Assistant</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground m-0">
                  Configure Arko's AI capabilities for enhanced conversations
                </p>
                
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Mode:</span>
                    <Badge className={
                      aiStatus.enabled 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                    }>
                      {aiStatus.enabled ? (
                        <><Brain className="w-3 h-3 mr-1" />Enhanced AI</>
                      ) : (
                        <>📚 Local Knowledge</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {aiStatus.enabled 
                      ? 'Dynamic AI conversations with real-time responses' 
                      : 'Using built-in knowledge base for responses'}
                  </p>
                  <Button 
                    onClick={() => setShowAIConfig(true)}
                    className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure AI Settings
                  </Button>
                </div>
                
                {aiStatus.enabled && (
                  <div className="text-xs bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="m-0 text-green-700">
                      🧠 <strong>AI Enhanced!</strong> Arko can now have dynamic conversations and provide contextual responses.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Language Settings */}
            <Card className="p-4 glass-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center intense-neon-pulse">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="m-0 font-semibold">{t('language')}</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground m-0">
                  Choose your preferred language for the interface
                </p>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full h-12 bg-gradient-to-r from-green-50 to-teal-50 border-green-200 hover:border-green-300 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                              {lang.code.toUpperCase()}
                            </div>
                            <span className="font-medium">{lang.nativeName}</span>
                          </div>
                          <span className="text-muted-foreground ml-2">({lang.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-lg border border-green-200">
                  <p className="m-0 text-green-700">
                    🌍 <strong>Current:</strong> {availableLanguages.find(l => l.code === language)?.nativeName} 
                    ({availableLanguages.find(l => l.code === language)?.name})
                  </p>
                </div>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-orange-600" />
                <h3 className="m-0">{t('notifications')}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>Push Notifications</span>
                      <Badge variant={notifications ? "default" : "secondary"}>
                        {notifications ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground m-0">
                      Receive flood alerts and emergency notifications
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <span>Sound Alerts</span>
                    </div>
                    <p className="text-sm text-muted-foreground m-0">
                      Play alert sounds for emergency notifications
                    </p>
                  </div>
                  <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
                </div>
              </div>
            </Card>

            {/* App Appearance Settings */}
            <Card className="p-4 glass-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center intense-neon-pulse">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h3 className="m-0 font-semibold">App Appearance</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground m-0">
                  Arko uses a bright, vibrant design optimized for emergency situations
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="font-medium text-blue-700">Valencia City Optimized</span>
                  </div>
                  <p className="text-sm text-blue-600 m-0">
                    The interface is designed with high contrast and bright colors for maximum visibility during floods and emergencies.
                  </p>
                </div>
              </div>
            </Card>

            {/* Units Settings */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Ruler className="w-5 h-5 text-green-600" />
                <h3 className="m-0">{t('units')}</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground m-0">
                  Choose measurement units for weather data
                </p>
                <Select value={units} onValueChange={setUnits}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">
                      <div className="flex flex-col items-start">
                        <span>Metric</span>
                        <span className="text-xs text-muted-foreground">°C, km/h, mm</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="imperial">
                      <div className="flex flex-col items-start">
                        <span>Imperial</span>
                        <span className="text-xs text-muted-foreground">°F, mph, inches</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Data Source Settings */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="w-5 h-5 text-blue-600" />
                <h3 className="m-0">{t('dataSource')}</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground m-0">
                  Choose how weather data is obtained
                </p>
                <div className="space-y-3">
                  <div 
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      dataSource === 'simulation' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDataSource('simulation')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        dataSource === 'simulation' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {dataSource === 'simulation' && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t('simulationMode')}</div>
                        <div className="text-xs text-muted-foreground">{t('simulationDesc')}</div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Recommended
                      </Badge>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      dataSource === 'api' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDataSource('api')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        dataSource === 'api' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {dataSource === 'api' && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t('apiMode')}</div>
                        <div className="text-xs text-muted-foreground">{t('apiDesc')}</div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        Experimental
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                  💡 Simulation mode provides reliable, realistic weather data specifically calibrated for Valencia City. 
                  API mode may experience connectivity issues but will fallback to simulation when needed.
                </div>
              </div>
            </Card>

            {/* About Section */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-gray-600" />
                <h3 className="m-0">{t('about')}</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Version:</span>
                    <div className="font-medium">2.1.0</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated:</span>
                    <div className="font-medium">Dec 2024</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Developer:</span>
                    <div className="font-medium">Team Astrobyte</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <div className="font-medium">Valencia City</div>
                  </div>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  <p className="m-0">
                    Arko is a community-driven flood alert system designed to protect residents 
                    of Valencia City and surrounding barangays through real-time monitoring and alerts.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onClose}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
      
      {/* AI Configuration Panel */}
      <AIConfigPanel 
        isOpen={showAIConfig} 
        onClose={() => {
          setShowAIConfig(false);
          setAiStatus(aiService.getStatus());
        }} 
      />
    </div>
  );
};