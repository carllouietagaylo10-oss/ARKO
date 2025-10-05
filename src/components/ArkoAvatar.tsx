import React from 'react';
import { motion } from 'motion/react';

// Using the direct avatar URL from ImgBB
const arkoAvatarImage = 'https://i.ibb.co/9LxD4mm/Screenshot-2025-09-30-210011.png';

interface ArkoAvatarProps {
  size?: number;
  animated?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  isSpeaking?: boolean;
  showSparkles?: boolean;
  className?: string;
}

export function ArkoAvatar({ 
  size = 48, 
  animated = true, 
  severity = 'low',
  isSpeaking = false,
  showSparkles = true,
  className = ''
}: ArkoAvatarProps) {
  
  const getSeverityEffects = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8)) drop-shadow(0 0 35px rgba(251, 146, 60, 0.6)) brightness(1.1) saturate(1.3)',
          sparkleColor: 'bg-red-400',
          glowColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'border-red-500'
        };
      case 'high':
        return {
          filter: 'drop-shadow(0 0 15px rgba(251, 146, 60, 0.7)) drop-shadow(0 0 25px rgba(245, 158, 11, 0.5)) brightness(1.05) saturate(1.2)',
          sparkleColor: 'bg-orange-400',
          glowColor: 'rgba(251, 146, 60, 0.5)',
          borderColor: 'border-orange-500'
        };
      case 'medium':
        return {
          filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.6)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.4)) brightness(1.02) saturate(1.1)',
          sparkleColor: 'bg-yellow-400',
          glowColor: 'rgba(245, 158, 11, 0.5)',
          borderColor: 'border-yellow-500'
        };
      default:
        return {
          filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5)) drop-shadow(0 0 15px rgba(147, 51, 234, 0.3)) brightness(1)',
          sparkleColor: 'bg-cyan-400',
          glowColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'border-blue-500'
        };
    }
  };

  const effects = getSeverityEffects(severity);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Main Avatar Container */}
      <motion.div
        animate={animated ? {
          y: [-2, 2, -2],
          rotate: [-1, 1, -1],
          scale: isSpeaking ? [1, 1.05, 1] : [1, 1.02, 1]
        } : {}}
        transition={{
          duration: isSpeaking ? 0.6 : 4,
          repeat: animated ? Infinity : 0,
          ease: "easeInOut"
        }}
        className="relative w-full h-full"
      >
        {/* Avatar Image */}
        <img
          src={arkoAvatarImage}
          alt="Arko - Your Flood Guardian"
          className="w-full h-full object-contain transition-all duration-300"
          style={{
            filter: effects.filter
          }}
        />
        
        {/* Speaking animation overlay */}
        {isSpeaking && (
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20"
          />
        )}
      </motion.div>
      
      {/* Floating sparkle effects */}
      {showSparkles && [...Array(4)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          animate={animated ? {
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0],
            x: [0, Math.sin(i * 60) * (size * 0.2), 0],
            y: [0, Math.cos(i * 60) * (size * 0.2), 0]
          } : {}}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: animated ? Infinity : 0,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
          className={`absolute w-2 h-2 rounded-full ${effects.sparkleColor} bioluminescent-glow`}
          style={{
            top: `${30 + Math.sin(i * 45) * 25}%`,
            left: `${30 + Math.cos(i * 45) * 25}%`,
          }}
        />
      ))}
      
      {/* Alert severity glow ring for medium+ severity */}
      {(severity === 'medium' || severity === 'high' || severity === 'critical') && (
        <motion.div
          animate={animated ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          } : {}}
          transition={{
            duration: 2,
            repeat: animated ? Infinity : 0,
            ease: "easeInOut"
          }}
          className={`absolute inset-0 rounded-full border-4 ${effects.borderColor}`}
          style={{
            boxShadow: `0 0 20px ${effects.glowColor}`
          }}
        />
      )}
      
      {/* Status indicator dot */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-lg" />
    </div>
  );
}