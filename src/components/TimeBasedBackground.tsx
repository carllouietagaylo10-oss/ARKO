import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface TimeBasedBackgroundProps {
  children: React.ReactNode;
}

type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

export function TimeBasedBackground({ children }: TimeBasedBackgroundProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [currentTime, setCurrentTime] = useState(new Date());

  const getTimeOfDay = (hour: number): TimeOfDay => {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 14) return 'noon';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 19) return 'evening';
    return 'night';
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setTimeOfDay(getTimeOfDay(now.getHours()));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const timeThemes = {
    dawn: {
      gradient: 'from-purple-900 via-pink-800 to-orange-500',
      particles: '🌅',
      clouds: 'from-pink-200/30 to-orange-200/30',
      atmosphere: 'rgba(255, 94, 77, 0.1)'
    },
    morning: {
      gradient: 'from-blue-400 via-cyan-300 to-yellow-200',
      particles: '☀️',
      clouds: 'from-white/40 to-blue-100/40',
      atmosphere: 'rgba(59, 130, 246, 0.1)'
    },
    noon: {
      gradient: 'from-blue-300 via-cyan-200 to-yellow-100',
      particles: '☀️',
      clouds: 'from-white/50 to-blue-50/50',
      atmosphere: 'rgba(34, 197, 94, 0.1)'
    },
    afternoon: {
      gradient: 'from-yellow-300 via-orange-300 to-red-300',
      particles: '🌤️',
      clouds: 'from-yellow-100/40 to-orange-100/40',
      atmosphere: 'rgba(251, 146, 60, 0.1)'
    },
    evening: {
      gradient: 'from-orange-500 via-red-500 to-purple-600',
      particles: '🌇',
      clouds: 'from-orange-200/30 to-purple-200/30',
      atmosphere: 'rgba(239, 68, 68, 0.1)'
    },
    night: {
      gradient: 'from-purple-900 via-blue-900 to-indigo-900',
      particles: '🌙',
      clouds: 'from-purple-100/20 to-blue-100/20',
      atmosphere: 'rgba(99, 102, 241, 0.1)'
    }
  };

  const theme = timeThemes[timeOfDay];

  const timeEmojis = {
    dawn: ['🌅', '🐦', '✨', '🌸', '🦋', '💫', '🌺', '🌿'],
    morning: ['☀️', '🌤️', '🦋', '🌸', '🌻', '🐝', '🌺', '🌈', '🦅', '🌿'],
    noon: ['☀️', '🌞', '🏝️', '🌊', '🌴', '🐚', '🦜', '🌺', '☁️', '🌈'],
    afternoon: ['🌤️', '🌻', '🦜', '🍃', '🌺', '🦋', '🌸', '🐝', '🌿', '☁️'],
    evening: ['🌇', '⭐', '🌙', '🦋', '🌸', '✨', '🌺', '💫', '🦉', '🌿'],
    night: ['🌙', '⭐', '🦉', '✨', '💫', '🌌', '🦇', '🌺', '🍃', '☁️']
  };

  const FloatingParticles = () => {
    const particles = timeEmojis[timeOfDay];
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`${timeOfDay}-${i}`}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
              opacity: 0,
              rotate: 0,
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{
              x: Math.random() * (window.innerWidth - 100),
              y: -50,
              opacity: [0, 0.8, 0],
              rotate: [0, 360],
              scale: [0.5 + Math.random() * 0.5, 1, 0.3]
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
            className="absolute text-2xl filter drop-shadow-lg"
          >
            {particles[Math.floor(Math.random() * particles.length)]}
          </motion.div>
        ))}
        
        {/* Additional cheerful floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`cheerful-${timeOfDay}-${i}`}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut"
            }}
            className="absolute text-xl opacity-60"
            style={{
              top: `${20 + (i * 10)}%`,
              left: `${10 + (i * 10)}%`
            }}
          >
            {['💖', '🌟', '💫', '🌈', '🎈', '🎀', '🦄', '✨'][i]}
          </motion.div>
        ))}
      </div>
    );
  };

  const CloudLayer = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`cloud-${timeOfDay}-${i}`}
          animate={{
            x: [-150, window.innerWidth + 150],
            y: [0, -20, 0],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{
            duration: 25 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2
          }}
          className={`absolute w-40 h-20 bg-gradient-to-r ${theme.clouds} rounded-full blur-sm opacity-70`}
          style={{
            top: `${5 + i * 12}%`,
            transform: `scale(${0.6 + Math.random() * 0.6})`
          }}
        >
          {/* Add cute cloud faces occasionally */}
          {i % 3 === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/30 text-lg">
              {['☁️', '🌤️', '⛅'][Math.floor(Math.random() * 3)]}
            </div>
          )}
        </motion.div>
      ))}
      
      {/* Rainbow arcs */}
      {(timeOfDay === 'morning' || timeOfDay === 'afternoon') && (
        <motion.div
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-1/4 w-96 h-48 bg-gradient-to-r from-red-400/20 via-yellow-400/20 via-green-400/20 via-blue-400/20 via-indigo-400/20 to-purple-400/20 rounded-full blur-lg"
        />
      )}
    </div>
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeGreeting = () => {
    const greetings = {
      dawn: 'Early Dawn',
      morning: 'Good Morning',
      noon: 'High Noon',
      afternoon: 'Good Afternoon', 
      evening: 'Beautiful Evening',
      night: 'Peaceful Night'
    };
    return greetings[timeOfDay];
  };

  return (
    <motion.div 
      key={timeOfDay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className={`min-h-screen bg-gradient-to-br ${theme.gradient} relative overflow-hidden`}
    >
      {/* Animated background atmosphere */}
      <motion.div
        animate={{
          background: [
            `radial-gradient(circle at 20% 80%, ${theme.atmosphere} 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 20%, ${theme.atmosphere} 0%, transparent 50%)`,
            `radial-gradient(circle at 40% 40%, ${theme.atmosphere} 0%, transparent 50%)`
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0"
      />

      {/* Cloud layer */}
      <CloudLayer />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Time indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 z-10"
      >
        <div className="glass-card p-3 rounded-xl border border-white/30">
          <div className="flex items-center gap-2 text-white">
            <span className="text-lg">{theme.particles}</span>
            <div>
              <p className="text-sm font-medium m-0">{getTimeGreeting()}</p>
              <p className="text-xs opacity-80 m-0">{formatTime(currentTime)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content with enhanced overlay */}
      <div className="relative z-10 bg-black/5 backdrop-blur-[1px]">
        {children}
      </div>

      {/* Atmospheric overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
    </motion.div>
  );
}