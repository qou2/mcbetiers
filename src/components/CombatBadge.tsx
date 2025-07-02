
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
  
  // Get icon and enhanced styling based on rank
  const getIconAndStyle = () => {
    if (points >= 400) return { icon: Gem, glow: 'shadow-purple-500/50', pulse: true };
    if (points >= 250) return { icon: Crown, glow: 'shadow-yellow-500/50', pulse: true };
    if (points >= 100) return { icon: Star, glow: 'shadow-blue-500/40', pulse: false };
    if (points >= 50) return { icon: Shield, glow: 'shadow-green-500/40', pulse: false };
    if (points >= 20) return { icon: Sword, glow: 'shadow-orange-500/40', pulse: false };
    if (points >= 10) return { icon: Award, glow: 'shadow-slate-500/30', pulse: false };
    return { icon: Trophy, glow: 'shadow-gray-500/30', pulse: false };
  };

  const { icon: Icon, glow, pulse } = getIconAndStyle();

  const baseSize = enhanced ? 'px-4 py-2 text-base' : 'px-3 py-1.5 text-sm';
  const iconSize = enhanced ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <motion.div
      className={`inline-flex items-center gap-2 rounded-full border-2 font-bold relative overflow-hidden ${baseSize} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${rank.gradient})`,
        borderColor: rank.borderColor.replace('border-', ''),
        color: 'white',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
      }}
      initial={showAnimation ? { scale: 0.8, opacity: 0 } : {}}
      animate={showAnimation ? { 
        scale: 1, 
        opacity: 1,
        boxShadow: enhanced ? `0 0 30px ${glow.replace('shadow-', '').replace('/50', '80').replace('/40', '60').replace('/30', '40')}` : `0 0 15px ${glow.replace('shadow-', '').replace('/50', '60').replace('/40', '40').replace('/30', '30')}`
      } : {}}
      whileHover={showAnimation ? { 
        scale: enhanced ? 1.1 : 1.05,
        boxShadow: `0 0 ${enhanced ? '40px' : '25px'} ${glow.replace('shadow-', '').replace('/50', '90').replace('/40', '70').replace('/30', '50')}`
      } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      {/* Background glow effect */}
      {enhanced && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${rank.gradient.split(' ')[1]} 0%, transparent 70%)`
          }}
          animate={pulse ? { 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <motion.div
        animate={showAnimation ? { 
          rotate: pulse ? [0, 10, -10, 0] : [0, 5, -5, 0],
          scale: pulse ? [1, 1.2, 1] : [1, 1.1, 1]
        } : {}}
        transition={{ 
          duration: pulse ? 3 : 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <Icon className={iconSize} />
      </motion.div>

      {/* Sparkle effects for high ranks */}
      {(points >= 250 && enhanced) && (
        <>
          <motion.div
            className="absolute top-0 right-2"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
          >
            <Zap className="w-2 h-2 text-yellow-300" />
          </motion.div>
          <motion.div
            className="absolute bottom-1 left-1"
            animate={{
              scale: [0, 1, 0],
              rotate: [360, 180, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1
            }}
          >
            <Zap className="w-2 h-2 text-yellow-300" />
          </motion.div>
        </>
      )}

      <span className="uppercase tracking-wide relative z-10">
        {rank.title}
      </span>
    </motion.div>
  );
};

export default CombatBadge;
