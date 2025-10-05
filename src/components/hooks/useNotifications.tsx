import { useState, useEffect, useRef } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // milliseconds, null for persistent
  location?: string;
  actions?: {
    label: string;
    action: () => void;
  }[];
  sound?: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    if (soundEnabled) {
      // Create audio elements for different notification types
      audioRef.current = new Audio();
      // Using data URLs for simple notification sounds
      audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXLPr8aJQEw5OpeLxwGkdCXyy2/DZfS8Qql9VSUU=';
    }
  }, [soundEnabled]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!isEnabled) return;

    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      duration: notification.duration || (notification.type === 'critical' ? null : 5000),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play sound for critical alerts
    if (soundEnabled && notification.sound !== false && notification.type === 'critical' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
    }

    // Auto-remove non-persistent notifications
    if (newNotification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    // In a real app, this would mark as read in persistence
    removeNotification(id);
  };

  // Flood-specific notification helpers
  const notifyFloodAlert = (level: 'green' | 'yellow' | 'orange' | 'red', riskScore: number, location: string) => {
    const alertMessages = {
      red: {
        title: '🚨 CRITICAL FLOOD WARNING',
        message: `Immediate evacuation required for ${location}. Risk score: ${riskScore}%`,
        type: 'critical' as const,
        sound: true,
        actions: [
          { label: 'View Evacuation Routes', action: () => console.log('Navigate to evacuation') },
          { label: 'Call Emergency', action: () => window.open('tel:911') }
        ]
      },
      orange: {
        title: '⚠️ FLOOD WATCH ALERT',
        message: `High flood risk detected in ${location}. Prepare for evacuation. Risk: ${riskScore}%`,
        type: 'warning' as const,
        sound: true,
        actions: [
          { label: 'View Safety Tips', action: () => console.log('Show safety tips') }
        ]
      },
      yellow: {
        title: '💛 WEATHER ADVISORY',
        message: `Moderate flood risk in ${location}. Stay alert. Risk: ${riskScore}%`,
        type: 'warning' as const,
        actions: [
          { label: 'Monitor Conditions', action: () => console.log('Monitor weather') }
        ]
      },
      green: {
        title: '✅ CONDITIONS NORMAL',
        message: `Flood risk has decreased in ${location}. Risk: ${riskScore}%`,
        type: 'success' as const
      }
    };

    return addNotification({
      ...alertMessages[level],
      location,
      duration: level === 'red' ? null : 8000
    });
  };

  const notifyWeatherUpdate = (condition: string, precipitation: number, location: string) => {
    if (precipitation > 15) {
      return addNotification({
        type: 'warning',
        title: '🌧️ HEAVY RAINFALL DETECTED',
        message: `${precipitation.toFixed(1)}mm/hr rainfall in ${location}. Monitor flood conditions.`,
        location,
        duration: 6000
      });
    } else if (precipitation > 8) {
      return addNotification({
        type: 'info',
        title: '🌦️ Moderate Rain',
        message: `${precipitation.toFixed(1)}mm/hr rainfall in ${location}. Stay updated.`,
        location,
        duration: 4000
      });
    }
  };

  const notifySystemUpdate = (message: string, type: 'info' | 'warning' = 'info') => {
    return addNotification({
      type,
      title: '🔄 System Update',
      message,
      duration: 3000
    });
  };

  const notifyCommunityReport = (reportType: string, location: string) => {
    return addNotification({
      type: 'info',
      title: '📍 Community Report',
      message: `New ${reportType} report from ${location}`,
      location,
      duration: 5000,
      actions: [
        { label: 'View Details', action: () => console.log('View report details') }
      ]
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    markAsRead,
    isEnabled,
    setIsEnabled,
    soundEnabled,
    setSoundEnabled,
    // Flood-specific helpers
    notifyFloodAlert,
    notifyWeatherUpdate,
    notifySystemUpdate,
    notifyCommunityReport,
    unreadCount: notifications.length
  };
}