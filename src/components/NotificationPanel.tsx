import React from 'react';
import { X, Bell, Volume2, VolumeX, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNotifications } from './hooks/useNotifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    removeNotification,
    clearAll,
    markAsRead,
    soundEnabled,
    setSoundEnabled,
    unreadCount
  } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <Zap className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <div>
              <h3 className="m-0">Notifications</h3>
              <p className="text-sm text-blue-100 m-0">Real-time alerts for Valencia City</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white hover:bg-blue-600"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-blue-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        {notifications.length > 0 && (
          <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              {unreadCount} active alert{unreadCount !== 1 ? 's' : ''}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="m-0">No active notifications</p>
              <p className="text-sm m-0">You'll be notified of any flood alerts or weather updates</p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 border transition-all duration-300 hover:shadow-md ${getBackgroundColor(notification.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="m-0 text-sm font-semibold truncate">{notification.title}</h4>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="w-6 h-6 p-0 hover:bg-gray-200"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mt-1 m-0">{notification.message}</p>
                      
                      {notification.location && (
                        <p className="text-xs text-muted-foreground mt-1 m-0">
                          📍 {notification.location}
                        </p>
                      )}

                      {/* Action Buttons */}
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {notification.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant={notification.type === 'critical' ? 'default' : 'outline'}
                              onClick={() => {
                                action.action();
                                markAsRead(notification.id);
                              }}
                              className="text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Persistent alert indicator */}
                      {!notification.duration && (
                        <div className="mt-2">
                          <Badge variant="destructive" className="text-xs">
                            Persistent Alert
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 text-center">
          <p className="text-xs text-muted-foreground m-0">
            Powered by Valencia City CDRRMO • Updated every 90 seconds
          </p>
        </div>
      </Card>
    </div>
  );
};