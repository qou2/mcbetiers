
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Shield, Sword, Award, Gem, Trophy } from 'lucide-react';

interface RankBadgeEffectsProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Get rank configuration based on points
const getRankConfig = (points: number) => {
  if (points >= 400) {
    return {
      title: 'Combat Grandmaster',
      icon: Gem,
      gradient: 'from-purple-600 via-violet-500 to-fuchsia-600',
      shadowColor: 'rgba(147,51,234,0.8)',
      glowColor: '#a855f7',
      particleColors: ['#a855f7', '#c084fc', '#d8b4fe', '#8b5cf6'],
      borderGlow: 'shadow-[0_0_30px_rgba(147,51,234,0.8)]',
      textGlow: 'drop-shadow-[0_0_15px_rgba(147,51,234,1)]',
      effectType: 'legendary'
    };
  } else if (points >= 250) {
    return {
      title: 'Combat Master',
      icon: Crown,
      gradient: 'from-yellow-600 via-amber-500 to-orange-600',
      shadowColor: 'rgba(251,191,36,0.8)',
      glowColor: '#fbbf24',
      particleColors: ['#fbbf24', '#f59e0b', '#f97316', '#ea580c'],
      borderGlow: 'shadow-[0_0_25px_rgba(251,191,36,0.8)]',
      textGlow: 'drop-shadow-[0_0_12px_rgba(251,191,36,1)]',
      effectType: 'royal'
    };
  } else if (points >= 100) {
    return {
      title: 'Combat Ace',
      icon: Star,
      gradient: 'from-blue-600 via-cyan-500 to-indigo-600',
      shadowColor: 'rgba(59,130,246,0.7)',
      glowColor: '#3b82f6',
      particleColors: ['#3b82f6', '#06b6d4', '#6366f1', '#8b5cf6'],
      borderGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.7)]',
      textGlow: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]',
      effectType: 'stellar'
    };
  } else if (points >= 50) {
    return {
      title: 'Combat Specialist',
      icon: Shield,
      gradient: 'from-green-600 via-emerald-500 to-teal-600',
      shadowColor: 'rgba(34,197,94,0.6)',
      glowColor: '#22c55e',
      particleColors: ['#22c55e', '#10b981', '#14b8a6', '#06b6d4'],
      borderGlow: 'shadow-[0_0_18px_rgba(34,197,94,0.6)]',
      textGlow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]',
      effectType: 'guardian'
    };
  } else if (points >= 20) {
    return {
      title: 'Combat Cadet',
      icon: Sword,
      gradient: 'from-orange-600 via-amber-500 to-yellow-600',
      shadowColor: 'rgba(249,115,22,0.6)',
      glowColor: '#f97316',
      particleColors: ['#f97316', '#f59e0b', '#eab308', '#ca8a04'],
      borderGlow: 'shadow-[0_0_15px_rgba(249,115,22,0.6)]',
      textGlow: 'drop-shadow-[0_0_6px_rgba(249,115,22,0.7)]',
      effectType: 'warrior'
    };
  } else if (points >= 10) {
    return {
      title: 'Combat Novice',
      icon: Award,
      gradient: 'from-slate-600 via-gray-500 to-slate-700',
      shadowColor: 'rgba(100,116,139,0.5)',
      glowColor: '#64748b',
      particleColors: ['#64748b', '#6b7280', '#9ca3af', '#d1d5db'],
      borderGlow: 'shadow-[0_0_12px_rgba(100,116,139,0.5)]',
      textGlow: 'drop-shadow-[0_0_4px_rgba(100,116,139,0.6)]',
      effectType: 'apprentice'
    };
  } else {
    return {
      title: 'Rookie',
      icon: Trophy,
      gradient: 'from-gray-600 via-slate-500 to-gray-700',
      shadowColor: 'rgba(107,114,128,0.4)',
      glowColor: '#6b7280',
      particleColors: ['#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6'],
      borderGlow: 'shadow-[0_0_10px_rgba(107,114,128,0.4)]',
      textGlow: 'drop-shadow-[0_0_3px_rgba(107,114,128,0.5)]',
      effectType: 'novice'
    };
  }
};

// Floating particles effect
const FloatingParticles = ({ colors, effectType }: { colors: string[], effectType: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
      opacity: number;
    }> = [];

    const createParticle = () => {
      if (particles.length > 15) return;
      
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 2 - 0.5,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.6 + Math.random() * 0.4
      });
    };

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.1) {
        createParticle();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (effectType === 'legendary') {
          p.x += Math.sin(p.life * 0.05) * 0.3;
        }

        const alpha = p.opacity * (1 - (p.life / p.maxLife));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife || p.y < -10) {
          particles.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [colors, effectType]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export function RankBadgeEffects({ points, size = 'md', animated = true, className = '', children }: RankBadgeEffectsProps) {
  const rankConfig = getRankConfig(points);
  const RankIcon = rankConfig.icon;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center rounded-full border-2 border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${rankConfig.gradient.replace('from-', '').replace('via-', '').replace('to-', '')})`
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={animated ? { scale: 1.1 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Floating particles effect */}
      {animated && (
        <FloatingParticles colors={rankConfig.particleColors} effectType={rankConfig.effectType} />
      )}

      {/* Glow effect background */}
      <div 
        className={`absolute inset-0 rounded-full ${rankConfig.borderGlow} opacity-60`}
        style={{
          background: `radial-gradient(circle, ${rankConfig.glowColor}40 0%, transparent 70%)`
        }}
      />

      {/* Icon */}
      <motion.div
        className="relative z-10 flex items-center justify-center text-white"
        animate={animated ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {children || <RankIcon className="w-1/2 h-1/2" />}
      </motion.div>

      {/* Inner glow */}
      <div 
        className="absolute inset-1 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${rankConfig.glowColor}60 0%, transparent 50%)`
        }}
      />

      {/* Shine effect */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${rankConfig.glowColor}40 50%, transparent 70%)`
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

// Enhanced rank text with effects
export function RankText({ points, className = '' }: { points: number, className?: string }) {
  const rankConfig = getRankConfig(points);

  return (
    <motion.span
      className={`font-bold ${rankConfig.textGlow} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {rankConfig.title}
    </motion.span>
  );
}

// Position badge with enhanced effects
export function PositionBadge({ position, points, className = '' }: { position: number, points: number, className?: string }) {
  const rankConfig = getRankConfig(points);

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl border-2 border-white/20 ${rankConfig.borderGlow} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${rankConfig.gradient.replace('from-', '').replace('via-', '').replace('to-', '')})`
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, rotate: 2 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <span className={`text-2xl font-black text-white ${rankConfig.textGlow}`}>
        {position}
      </span>
      
      {/* Corner decoration */}
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
        <Trophy className="w-3 h-3 text-white" />
      </div>
    </motion.div>
  );
}
