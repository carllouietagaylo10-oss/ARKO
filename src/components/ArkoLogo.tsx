import React from 'react';
import { motion } from 'motion/react';

// Using the direct logo URL from ImgBB
const arkoLogoImage = 'https://i.ibb.co/5hCvby8d/logo-astrobyte.png';

interface ArkoLogoProps {
  size?: number;
  animated?: boolean;
  showText?: boolean;
}

export function ArkoLogo({ size = 48, animated = true, showText = false }: ArkoLogoProps) {
  // Calculate the appropriate height based on the logo's aspect ratio
  // The logo appears to be roughly 3:4 ratio (width:height)
  const logoWidth = size;
  const logoHeight = size * 1.3; // Adjust based on the actual logo proportions

  if (!animated) {
    return (
      <div className="relative flex items-center gap-3">
        <img
          src={arkoLogoImage}
          alt="Arko - Flood Monitoring"
          className="object-contain filter drop-shadow-lg"
          style={{ 
            width: logoWidth, 
            height: logoHeight,
            maxWidth: logoWidth,
            maxHeight: logoHeight
          }}
        />
        
        {showText && (
          <div>
            <h1 className="m-0 font-bold text-lg text-blue-600">ARKO</h1>
            <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-semibold text-center">
              Flood Guardian
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-3">
      {/* Animated Arko Official Logo */}
      <motion.div
        animate={animated ? {
          y: [-2, 2, -2],
          rotate: [-0.5, 0.5, -0.5],
          scale: [1, 1.02, 1]
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
        style={{ width: logoWidth, height: logoHeight }}
      >
        <img
          src={arkoLogoImage}
          alt="Arko - Flood Monitoring by Team Astrobyte"
          className="object-contain filter drop-shadow-xl transition-all duration-300"
          style={{ 
            width: logoWidth, 
            height: logoHeight,
            maxWidth: logoWidth,
            maxHeight: logoHeight
          }}
        />
        
        {/* Enhanced glow effect overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 50% 50%, 
                rgba(59, 130, 246, 0.1) 0%, 
                rgba(59, 130, 246, 0.05) 40%, 
                transparent 70%
              )
            `,
            filter: 'blur(8px)',
            animation: animated ? 'arkoGlow 3s ease-in-out infinite' : 'none'
          }}
        />
      </motion.div>
      
      {/* Arko Text Logo */}
      {showText && (
        <motion.div
          animate={animated ? {
            opacity: [0.9, 1, 0.9]
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <h1 className="m-0 font-bold text-xl text-blue-600 arko-title">
            ARKO
          </h1>
          <div className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full font-semibold text-center shadow-lg">
            Flood Guardian
          </div>
        </motion.div>
      )}
    </div>
  );
}