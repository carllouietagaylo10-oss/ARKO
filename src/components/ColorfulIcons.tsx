import React from 'react';
import { 
  Waves, Map, MessageSquare, Database, Settings, Bell, 
  Zap, Shield, Phone, AlertTriangle, MapPin, Home, 
  Navigation, Droplets, Clock, Wind, Eye, Target, 
  Route, Siren, Compass, Layers, Box, RotateCcw, 
  ZoomIn, ZoomOut, Move3D, Volume2, VolumeX, X 
} from 'lucide-react';

// Jellyfish-themed icon component
export function JellyfishIcon({ 
  size = 24, 
  className = "", 
  animated = false,
  color = "text-blue-500",
  type = "default"
}: {
  size?: number;
  className?: string;
  animated?: boolean;
  color?: string;
  type?: "default" | "alert" | "navigation" | "shield" | "data" | "settings" | "phone";
}) {
  const jellyTypes = {
    default: {
      body: "M12 4C8 4 4 6 4 10C4 12 5 14 7 15C9 16 11 16 12 16C13 16 15 16 17 15C19 14 20 12 20 10C20 6 16 4 12 4Z",
      tentacles: ["M8 16C8 18 8 20 7 22", "M10 16C10 18 10 20 10 22", "M14 16C14 18 14 20 14 22", "M16 16C16 18 16 20 17 22"],
      glow: "drop-shadow-[0_0_15px_rgba(0,255,255,0.9)] drop-shadow-[0_0_25px_rgba(255,0,255,0.6)]"
    },
    alert: {
      body: "M12 4C8 4 4 6 4 10C4 12 5 14 7 15C9 16 11 16 12 16C13 16 15 16 17 15C19 14 20 12 20 10C20 6 16 4 12 4Z",
      tentacles: ["M8 16C8 18 8 20 7 22", "M10 16C10 18 10 20 10 22", "M14 16C14 18 14 20 14 22", "M16 16C16 18 16 20 17 22"],
      glow: "drop-shadow-[0_0_20px_rgba(255,0,127,1)] drop-shadow-[0_0_35px_rgba(255,69,0,0.8)]"
    },
    navigation: {
      body: "M12 4C8 4 4 6 4 10C4 12 5 14 7 15C9 16 11 16 12 16C13 16 15 16 17 15C19 14 20 12 20 10C20 6 16 4 12 4Z",
      tentacles: ["M8 16C8 18 8 20 7 22", "M10 16C10 18 10 20 10.5 22", "M14 16C14 18 14 20 13.5 22", "M16 16C16 18 16 20 17 22"],
      glow: "drop-shadow-[0_0_18px_rgba(0,255,127,1)] drop-shadow-[0_0_30px_rgba(127,255,0,0.7)]"
    },
    shield: {
      body: "M12 4C8 4 4 6 4 10C4 12 5 14 7 15C9 16 11 16 12 16C13 16 15 16 17 15C19 14 20 12 20 10C20 6 16 4 12 4Z",
      tentacles: ["M8 16C8 18 8 20 7 22", "M10 16C10 18 10 20 10 22", "M14 16C14 18 14 20 14 22", "M16 16C16 18 16 20 17 22"],
      glow: "drop-shadow-[0_0_16px_rgba(0,255,127,0.9)] drop-shadow-[0_0_28px_rgba(255,255,0,0.6)]"
    },
    data: {
      body: "M12 4C8 4 4 6 4 10C4 12 5 14 7 15C9 16 11 16 12 16C13 16 15 16 17 15C19 14 20 12 20 10C20 6 16 4 12 4Z",
      tentacles: ["M8 16C8 18 8 20 7 22", "M10 16C10 18 10 20 10 22", "M14 16C14 18 14 20 14 22", "M16 16C16 18 16 20 17 22"],
      glow: "drop-shadow-[0_0_20px_rgba(147,51,234,1)] drop-shadow-[0_0_35px_rgba(255,0,255,0.8)]"
    },
    settings: {
      body: "M12 4C8 4 4 6 4 10C4 12 5 14 7 15C9 16 11 16 12 16C13 16 15 16 17 15C19 14 20 12 20 10C20 6 16 4 12 4Z",
      tentacles: ["M8 16C8 18 8 20 7 22", "M10 16C10 18 10 20 10 22", "M14 16C14 18 14 20 14 22", "M16 16C16 18 16 20 17 22"],
      glow: "drop-shadow-[0_0_14px_rgba(156,163,175,0.8)] drop-shadow-[0_0_22px_rgba(255,255,255,0.5)]"
    },
    phone: {
      body: "M12 4C8 4 4 6 4 10C4 12 5 14 7 15C9 16 11 16 12 16C13 16 15 16 17 15C19 14 20 12 20 10C20 6 16 4 12 4Z",
      tentacles: ["M8 16C8 18 8 20 7 22", "M10 16C10 18 10 20 10 22", "M14 16C14 18 14 20 14 22", "M16 16C16 18 16 20 17 22"],
      glow: "drop-shadow-[0_0_22px_rgba(255,0,0,1)] drop-shadow-[0_0_40px_rgba(255,69,0,0.8)]"
    }
  };

  const jellyfish = jellyTypes[type];
  
  return (
    <div className={`relative inline-flex items-center justify-center ${animated ? 'arko-jellyfish-float' : ''} ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        className={`${color} ${jellyfish.glow} ${animated ? 'bioluminescent-glow' : ''}`}
      >
        {/* Jellyfish body */}
        <path
          d={jellyfish.body}
          fill="currentColor"
          className={animated ? 'animate-pulse' : ''}
          opacity="0.8"
        />
        
        {/* Tentacles */}
        {jellyfish.tentacles.map((tentacle, index) => (
          <path
            key={index}
            d={tentacle}
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            className={animated ? 'jellyfish-tentacle electric-tentacle' : ''}
            style={{
              animationDelay: animated ? `${index * 0.2}s` : '0s',
              filter: 'drop-shadow(0 0 8px currentColor)'
            }}
            opacity="0.8"
          />
        ))}
        
        {/* Eyes for cute factor */}
        <circle cx="10" cy="9" r="1.5" fill="white" opacity="0.9" />
        <circle cx="14" cy="9" r="1.5" fill="white" opacity="0.9" />
        <circle cx="10" cy="9" r="0.8" fill="currentColor" opacity="0.7" />
        <circle cx="14" cy="9" r="0.8" fill="currentColor" opacity="0.7" />
        
        {/* Mouth */}
        <path
          d="M10 11C10 12 11 12.5 12 12.5C13 12.5 14 12 14 11"
          stroke="white"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
      
      {/* Enhanced Bioluminescent particles */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full animate-ping intense-neon-pulse`}
              style={{
                top: `${15 + i * 8}%`,
                left: `${25 + i * 6}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s',
                background: i % 3 === 0 ? 'rgba(0, 255, 255, 0.9)' : 
                           i % 3 === 1 ? 'rgba(255, 0, 255, 0.9)' : 
                           'rgba(0, 255, 127, 0.9)',
                boxShadow: i % 3 === 0 ? '0 0 15px rgba(0, 255, 255, 1)' :
                          i % 3 === 1 ? '0 0 15px rgba(255, 0, 255, 1)' :
                          '0 0 15px rgba(0, 255, 127, 1)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ColorfulIconProps {
  name: string;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function ColorfulIcon({ name, size = 24, className = "", animated = false }: ColorfulIconProps) {
  const iconMap: Record<string, { 
    Icon: React.ComponentType<any>, 
    colors: string, 
    bgColors: string,
    animation?: string 
  }> = {
    waves: { 
      Icon: Waves, 
      colors: 'text-blue-600', 
      bgColors: 'bg-gradient-to-br from-blue-400 to-cyan-500',
      animation: 'animate-pulse'
    },
    map: { 
      Icon: Map, 
      colors: 'text-emerald-600', 
      bgColors: 'bg-gradient-to-br from-emerald-400 to-green-500',
      animation: 'hover:animate-bounce'
    },
    message: { 
      Icon: MessageSquare, 
      colors: 'text-purple-600', 
      bgColors: 'bg-gradient-to-br from-purple-400 to-violet-500',
      animation: 'hover:animate-pulse'
    },
    database: { 
      Icon: Database, 
      colors: 'text-indigo-600', 
      bgColors: 'bg-gradient-to-br from-indigo-400 to-blue-500',
      animation: 'animate-pulse'
    },
    settings: { 
      Icon: Settings, 
      colors: 'text-gray-600', 
      bgColors: 'bg-gradient-to-br from-gray-400 to-slate-500',
      animation: 'hover:animate-spin'
    },
    bell: { 
      Icon: Bell, 
      colors: 'text-red-600', 
      bgColors: 'bg-gradient-to-br from-red-400 to-rose-500',
      animation: 'animate-bounce'
    },
    zap: { 
      Icon: Zap, 
      colors: 'text-yellow-600', 
      bgColors: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      animation: 'animate-pulse'
    },
    shield: { 
      Icon: Shield, 
      colors: 'text-green-600', 
      bgColors: 'bg-gradient-to-br from-green-400 to-emerald-500',
      animation: 'hover:animate-pulse'
    },
    phone: { 
      Icon: Phone, 
      colors: 'text-red-600', 
      bgColors: 'bg-gradient-to-br from-red-500 to-red-700',
      animation: 'animate-bounce'
    },
    alert: { 
      Icon: AlertTriangle, 
      colors: 'text-orange-600', 
      bgColors: 'bg-gradient-to-br from-orange-400 to-red-500',
      animation: 'animate-pulse'
    },
    mappin: { 
      Icon: MapPin, 
      colors: 'text-red-600', 
      bgColors: 'bg-gradient-to-br from-red-400 to-pink-500',
      animation: 'animate-bounce'
    },
    home: { 
      Icon: Home, 
      colors: 'text-blue-600', 
      bgColors: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      animation: 'hover:animate-pulse'
    },
    navigation: { 
      Icon: Navigation, 
      colors: 'text-cyan-600', 
      bgColors: 'bg-gradient-to-br from-cyan-400 to-teal-500',
      animation: 'hover:animate-spin'
    },
    droplets: { 
      Icon: Droplets, 
      colors: 'text-blue-600', 
      bgColors: 'bg-gradient-to-br from-blue-400 to-sky-500',
      animation: 'animate-bounce'
    },
    clock: { 
      Icon: Clock, 
      colors: 'text-gray-600', 
      bgColors: 'bg-gradient-to-br from-gray-400 to-slate-600',
      animation: 'animate-pulse'
    },
    wind: { 
      Icon: Wind, 
      colors: 'text-teal-600', 
      bgColors: 'bg-gradient-to-br from-teal-400 to-cyan-500',
      animation: 'hover:animate-bounce'
    },
    eye: { 
      Icon: Eye, 
      colors: 'text-indigo-600', 
      bgColors: 'bg-gradient-to-br from-indigo-400 to-purple-500',
      animation: 'hover:animate-pulse'
    },
    target: { 
      Icon: Target, 
      colors: 'text-red-600', 
      bgColors: 'bg-gradient-to-br from-red-400 to-rose-500',
      animation: 'animate-pulse'
    },
    route: { 
      Icon: Route, 
      colors: 'text-green-600', 
      bgColors: 'bg-gradient-to-br from-green-400 to-lime-500',
      animation: 'hover:animate-bounce'
    },
    siren: { 
      Icon: Siren, 
      colors: 'text-red-600', 
      bgColors: 'bg-gradient-to-br from-red-500 to-red-700',
      animation: 'animate-pulse'
    },
    compass: { 
      Icon: Compass, 
      colors: 'text-blue-600', 
      bgColors: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      animation: 'hover:animate-spin'
    },
    layers: { 
      Icon: Layers, 
      colors: 'text-purple-600', 
      bgColors: 'bg-gradient-to-br from-purple-400 to-violet-500',
      animation: 'hover:animate-pulse'
    },
    box: { 
      Icon: Box, 
      colors: 'text-gray-600', 
      bgColors: 'bg-gradient-to-br from-gray-400 to-slate-500',
      animation: 'animate-bounce'
    },
    rotate: { 
      Icon: RotateCcw, 
      colors: 'text-cyan-600', 
      bgColors: 'bg-gradient-to-br from-cyan-400 to-blue-500',
      animation: 'hover:animate-spin'
    },
    zoomin: { 
      Icon: ZoomIn, 
      colors: 'text-green-600', 
      bgColors: 'bg-gradient-to-br from-green-400 to-emerald-500',
      animation: 'hover:animate-pulse'
    },
    zoomout: { 
      Icon: ZoomOut, 
      colors: 'text-red-600', 
      bgColors: 'bg-gradient-to-br from-red-400 to-rose-500',
      animation: 'hover:animate-pulse'
    },
    move3d: { 
      Icon: Move3D, 
      colors: 'text-indigo-600', 
      bgColors: 'bg-gradient-to-br from-indigo-400 to-purple-500',
      animation: 'hover:animate-bounce'
    },
    volume2: { 
      Icon: Volume2, 
      colors: 'text-green-600', 
      bgColors: 'bg-gradient-to-br from-green-400 to-emerald-500',
      animation: 'animate-pulse'
    },
    volumex: { 
      Icon: VolumeX, 
      colors: 'text-red-600', 
      bgColors: 'bg-gradient-to-br from-red-400 to-rose-500',
      animation: 'hover:animate-pulse'
    },
    x: { 
      Icon: X, 
      colors: 'text-gray-600', 
      bgColors: 'bg-gradient-to-br from-gray-400 to-slate-500',
      animation: 'hover:animate-spin'
    }
  };

  const iconData = iconMap[name.toLowerCase()];
  
  if (!iconData) {
    // Fallback for unknown icons
    return <Box size={size} className={`text-gray-400 ${className}`} />;
  }

  const { Icon, colors, bgColors, animation } = iconData;

  return (
    <div className={`
      relative inline-flex items-center justify-center
      ${animated && animation ? animation : ''}
      ${className}
    `}>
      {/* Colorful background with gradient */}
      <div className={`
        absolute inset-0 ${bgColors} rounded-lg opacity-20 blur-sm
        ${animated ? 'group-hover:opacity-30 transition-opacity duration-300' : ''}
      `} />
      
      {/* Main icon */}
      <Icon 
        size={size} 
        className={`
          relative z-10 ${colors} drop-shadow-sm
          ${animated ? 'transition-all duration-300 group-hover:scale-110' : ''}
        `} 
      />
      
      {/* Subtle glow effect */}
      <div className={`
        absolute inset-0 ${bgColors} rounded-lg opacity-10 animate-pulse
        ${animated ? 'group-hover:opacity-20' : ''}
      `} />
    </div>
  );
}

// Pre-configured colorful icons for common use cases
export const ColorfulWaves = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="waves" {...props} />;

export const ColorfulMap = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="map" {...props} />;

export const ColorfulMessage = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="message" {...props} />;

export const ColorfulDatabase = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="database" {...props} />;

export const ColorfulSettings = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="settings" {...props} />;

export const ColorfulBell = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="bell" {...props} />;

export const ColorfulZap = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="zap" {...props} />;

export const ColorfulShield = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="shield" {...props} />;

export const ColorfulPhone = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="phone" {...props} />;

export const ColorfulAlert = (props: Omit<ColorfulIconProps, 'name'>) => 
  <ColorfulIcon name="alert" {...props} />;

// Jellyfish-themed icon exports
export const JellyfishWaves = (props: Omit<Parameters<typeof JellyfishIcon>[0], 'type'>) => 
  <JellyfishIcon type="default" color="text-blue-500" {...props} />;

export const JellyfishMap = (props: Omit<Parameters<typeof JellyfishIcon>[0], 'type'>) => 
  <JellyfishIcon type="navigation" color="text-emerald-500" {...props} />;

export const JellyfishMessage = (props: Omit<Parameters<typeof JellyfishIcon>[0], 'type'>) => 
  <JellyfishIcon type="default" color="text-purple-500" {...props} />;

export const JellyfishDatabase = (props: Omit<Parameters<typeof JellyfishIcon>[0], 'type'>) => 
  <JellyfishIcon type="data" color="text-indigo-500" {...props} />;

export const JellyfishSettings = (props: Omit<Parameters<typeof JellyfishIcon>[0], 'type'>) => 
  <JellyfishIcon type="settings" color="text-gray-500" {...props} />;

export const JellyfishBell = (props: Omit<Parameters<typeof JellyfishIcon>[0], 'type'>) => 
  <JellyfishIcon type="alert" color="text-red-500" {...props} />;

export const JellyfishShield = (props: Omit<Parameters<typeof JellyfishIcon>[0], 'type'>) => 
  <JellyfishIcon type="shield" color="text-green-500" {...props} />;

export const JellyfishPhone = (props: Omit<Parameters<typeof JellyfishIcon>[0], 'type'>) => 
  <JellyfishIcon type="phone" color="text-red-600" {...props} />;