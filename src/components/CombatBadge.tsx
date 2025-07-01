
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Shield, Sword, Award, Gem, Trophy, Zap } from 'lucide-react';
import { getPlayerRank } from '@/utils/rankUtils';

interface CombatBadgeProps {
  points: number;
  className?: string;
  showAnimation?: boolean;
  enhanced?: boolean;
}

const CombatBadge: React.FC<CombatBadgeProps> = ({ 
  points, 
  className = '', 
  showAnimation = true,
  enhanced = false
}) => {
  const rank = getPlayerRank(points);
  
  // Get icon and enhanced styling based on rank with vibrant colors
  const getIconAndStyle = () => {
    if (points >= 400) return { 
      icon: Gem, 
      glow: 'shadow-purple-400/60', 
      pulse: true,
      gradient: 'from-purple-600 via-pink-500 to-purple-700',
      borderGlow: '0 0 15px rgba(168, 85, 247, 0.8)'
    };
    if (points >= 250) return { 
      icon: Crown, 
      glow: 'shadow-yellow-400/60', 
      pulse: true,
      gradient: 'from-yellow-400 via-amber-500 to-orange-500',
      borderGlow: '0 0 15px rgba(251, 191, 36, 0.8)'
    };
    if (points >= 100) return { 
      icon: Star, 
      glow: 'shadow-blue-400/50', 
      pulse: false,
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      borderGlow: '0 0 12px rgba(59, 130, 246, 0.6)'
    };
    if (points >= 50) return { 
      icon: Shield, 
      glow: 'shadow-emerald-400/50', 
      pulse: false,
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      borderGlow: '0 0 12px rgba(16, 185, 129, 0.6)'
    };
    if (points >= 20) return { 
      icon: Sword, 
      glow: 'shadow-orange-400/50', 
      pulse: false,
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      borderGlow: '0 0 12px rgba(249, 115, 22, 0.6)'
    };
    if (points >= 10) return { 
      icon: Award, 
      glow: 'shadow-slate-400/40', 
      pulse: false,
      gradient: 'from-slate-500 via-gray-500 to-slate-600',
      borderGlow: '0 0 10px rgba(148, 163, 184, 0.5)'
    };
    return { 
      icon: Trophy, 
      glow: 'shadow-gray-400/40', 
      pulse: false,
      gradient: 'from-gray-500 via-slate-500 to-gray-600',
      borderGlow: '0 0 10px rgba(156, 163, 175, 0.5)'
    };
  };

  const { icon: Icon, glow, pulse, gradient, borderGlow } = getIconAndStyle();

  // Reduced size significantly
  const baseSize = enhanced ? 'px-2.5 py-1.5 text-xs' : 'px-2 py-1 text-xs';
  const iconSize = enhanced ? 'w-3.5 h-3.5' : 'w-3 h-3';

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 rounded-full border-2 font-bold relative overflow-hidden ${baseSize} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${gradient.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').join(', ')})`,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        color: 'white',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        boxShadow: borderGlow
      }}
      initial={showAnimation ? { scale: 0.8, opacity: 0 } : {}}
      animate={showAnimation ? { 
        scale: 1, 
        opacity: 1,
        boxShadow: enhanced ? `${borderGlow}, 0 4px 15px rgba(0,0,0,0.3)` : `${borderGlow}, 0 2px 8px rgba(0,0,0,0.2)`
      } : {}}
      whileHover={showAnimation ? { 
        scale: enhanced ? 1.08 : 1.05,
        boxShadow: `${borderGlow.replace('0.8)', '1)')}, 0 6px 20px rgba(0,0,0,0.4)`,
        filter: 'brightness(1.1)'
      } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }}
    >
      {/* Enhanced background glow effect - smaller */}
      {enhanced && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${gradient.split(' ')[1]?.replace('via-', '') || 'rgba(255,255,255,0.2)'} 0%, transparent 70%)`
          }}
          animate={pulse ? { 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <motion.div
        animate={showAnimation ? { 
          rotate: pulse ? [0, 10, -10, 0] : [0, 5, -5, 0],
          scale: pulse ? [1, 1.15, 1] : [1, 1.1, 1]
        } : {}}
        transition={{ 
          duration: pulse ? 3.5 : 2.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative z-10"
      >
        <Icon className={`${iconSize} drop-shadow-sm`} />
      </motion.div>

      {/* Smaller sparkle effects for high ranks */}
      {(points >= 250 && enhanced) && (
        <>
          <motion.div
            className="absolute top-0 right-1"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 0.5
            }}
          >
            <Zap className="w-2 h-2 text-yellow-200 drop-shadow-sm" />
          </motion.div>
          <motion.div
            className="absolute bottom-0 left-1"
            animate={{
              scale: [0, 1, 0],
              rotate: [360, 180, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 1.2
            }}
          >
            <Zap className="w-2 h-2 text-yellow-200 drop-shadow-sm" />
          </motion.div>
          {/* Additional sparkle for grandmaster - smaller */}
          {points >= 400 && (
            <motion.div
              className="absolute top-1/2 left-0 transform -translate-y-1/2"
              animate={{
                scale: [0, 0.8, 0],
                x: [-3, 3, -3],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 0.8
              }}
            >
              <Zap className="w-1.5 h-1.5 text-pink-200 drop-shadow-sm" />
            </motion.div>
          )}
        </>
      )}

      <span className="uppercase tracking-wide relative z-10 font-bold drop-shadow-sm">
        {rank.title}
      </span>
    </motion.div>
  );
};

export default CombatBadge;
