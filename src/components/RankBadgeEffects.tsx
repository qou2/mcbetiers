"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Crown, Star, Shield, Sword, Award, Gem, Trophy } from "lucide-react"

interface RankBadgeEffectsProps {
  points: number
  size?: "sm" | "md" | "lg"
  animated?: boolean
  className?: string
  children?: React.ReactNode
}

// Get rank configuration based on points
const getRankConfig = (points: number) => {
  if (points >= 400) {
    return {
      title: "Combat Grandmaster",
      icon: Gem,
      gradient: "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)",
      shadowColor: "rgba(147,51,234,0.8)",
      glowColor: "#a855f7",
      particleColors: ["#a855f7", "#c084fc", "#d8b4fe", "#8b5cf6"],
      borderGlow: "shadow-[0_0_30px_rgba(147,51,234,0.8)]",
      textGlow: "drop-shadow-[0_0_15px_rgba(147,51,234,1)]",
      effectType: "legendary",
    }
  } else if (points >= 250) {
    return {
      title: "Combat Master",
      icon: Crown,
      gradient: "linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)",
      shadowColor: "rgba(251,191,36,0.8)",
      glowColor: "#fbbf24",
      particleColors: ["#fbbf24", "#f59e0b", "#f97316", "#ea580c"],
      borderGlow: "shadow-[0_0_25px_rgba(251,191,36,0.8)]",
      textGlow: "drop-shadow-[0_0_12px_rgba(251,191,36,1)]",
      effectType: "royal",
    }
  } else if (points >= 100) {
    return {
      title: "Combat Ace",
      icon: Star,
      gradient: "linear-gradient(135deg, #2563eb, #3b82f6, #06b6d4)",
      shadowColor: "rgba(59,130,246,0.7)",
      glowColor: "#3b82f6",
      particleColors: ["#3b82f6", "#06b6d4", "#6366f1", "#8b5cf6"],
      borderGlow: "shadow-[0_0_20px_rgba(59,130,246,0.7)]",
      textGlow: "drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]",
      effectType: "stellar",
    }
  } else if (points >= 50) {
    return {
      title: "Combat Specialist",
      icon: Shield,
      gradient: "linear-gradient(135deg, #059669, #10b981, #22c55e)",
      shadowColor: "rgba(34,197,94,0.6)",
      glowColor: "#22c55e",
      particleColors: ["#22c55e", "#10b981", "#14b8a6", "#06b6d4"],
      borderGlow: "shadow-[0_0_18px_rgba(34,197,94,0.6)]",
      textGlow: "drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]",
      effectType: "guardian",
    }
  } else if (points >= 20) {
    return {
      title: "Combat Cadet",
      icon: Sword,
      gradient: "linear-gradient(135deg, #ea580c, #f97316, #fb923c)",
      shadowColor: "rgba(249,115,22,0.6)",
      glowColor: "#f97316",
      particleColors: ["#f97316", "#f59e0b", "#eab308", "#ca8a04"],
      borderGlow: "shadow-[0_0_15px_rgba(249,115,22,0.6)]",
      textGlow: "drop-shadow-[0_0_6px_rgba(249,115,22,0.7)]",
      effectType: "warrior",
    }
  } else if (points >= 10) {
    return {
      title: "Combat Novice",
      icon: Award,
      gradient: "linear-gradient(135deg, #475569, #64748b, #94a3b8)",
      shadowColor: "rgba(100,116,139,0.5)",
      glowColor: "#64748b",
      particleColors: ["#64748b", "#6b7280", "#9ca3af", "#d1d5db"],
      borderGlow: "shadow-[0_0_12px_rgba(100,116,139,0.5)]",
      textGlow: "drop-shadow-[0_0_4px_rgba(100,116,139,0.6)]",
      effectType: "apprentice",
    }
  } else {
    return {
      title: "Rookie",
      icon: Trophy,
      gradient: "linear-gradient(135deg, #4b5563, #6b7280, #9ca3af)",
      shadowColor: "rgba(107,114,128,0.4)",
      glowColor: "#6b7280",
      particleColors: ["#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6"],
      borderGlow: "shadow-[0_0_10px_rgba(107,114,128,0.4)]",
      textGlow: "drop-shadow-[0_0_3px_rgba(107,114,128,0.5)]",
      effectType: "novice",
    }
  }
}

// Floating particles effect
const FloatingParticles = ({ colors, effectType }: { colors: string[]; effectType: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    updateCanvasSize()

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number
      size: number
      color: string
      opacity: number
    }> = []

    const createParticle = () => {
      if (particles.length > 8) return

      const rect = canvas.getBoundingClientRect()
      particles.push({
        x: Math.random() * rect.width,
        y: rect.height + 5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 1 - 0.3,
        life: 0,
        maxLife: 40 + Math.random() * 20,
        size: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.4 + Math.random() * 0.3,
      })
    }

    let animationId: number
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      if (Math.random() < 0.15) {
        createParticle()
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy
        p.life++

        if (effectType === "legendary") {
          p.x += Math.sin(p.life * 0.08) * 0.2
        }

        const alpha = p.opacity * (1 - p.life / p.maxLife)

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.shadowBlur = 4
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        if (p.life >= p.maxLife || p.y < -5) {
          particles.splice(i, 1)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [colors, effectType])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  )
}

export function RankBadgeEffects({
  points,
  size = "md",
  animated = true,
  className = "",
  children,
}: RankBadgeEffectsProps) {
  const rankConfig = getRankConfig(points)
  const RankIcon = rankConfig.icon

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg",
  }

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center rounded-full border border-white/30 overflow-hidden ${sizeClasses[size]} ${className}`}
      style={{
        background: rankConfig.gradient,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={animated ? { scale: 1.15 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Floating particles effect */}
      {animated && points >= 100 && (
        <FloatingParticles colors={rankConfig.particleColors} effectType={rankConfig.effectType} />
      )}

      {/* Glow effect background */}
      <div
        className="absolute inset-0 rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, ${rankConfig.glowColor}60 0%, transparent 70%)`,
          filter: `drop-shadow(0 0 8px ${rankConfig.glowColor}40)`,
        }}
      />

      {/* Icon */}
      <motion.div
        className="relative z-10 flex items-center justify-center text-white"
        animate={animated && points >= 250 ? { rotate: [0, 3, -3, 0] } : {}}
        transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        {children || <RankIcon className="w-1/2 h-1/2" />}
      </motion.div>

      {/* Shine effect for high ranks */}
      {animated && points >= 250 && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${rankConfig.glowColor}60 50%, transparent 70%)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      )}
    </motion.div>
  )
}

// Enhanced rank text with effects
export function RankText({ points, className = "" }: { points: number; className?: string }) {
  const rankConfig = getRankConfig(points)

  return (
    <motion.span
      className={`font-bold text-white ${className}`}
      style={{ filter: rankConfig.textGlow }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {rankConfig.title}
    </motion.span>
  )
}

// Position badge with enhanced effects
export function PositionBadge({
  position,
  points,
  size = "md",
  className = "",
}: { position: number; points: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const rankConfig = getRankConfig(points)

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
  }

  const positionColors = {
    1: "linear-gradient(135deg, #ffd700, #ffed4e, #fbbf24)", // Gold
    2: "linear-gradient(135deg, #c0c0c0, #d1d5db, #9ca3af)", // Silver
    3: "linear-gradient(135deg, #cd7f32, #f97316, #ea580c)", // Bronze
  }

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center rounded-xl border border-white/30 ${sizeClasses[size]} ${className}`}
      style={{
        background: position <= 3 ? positionColors[position as keyof typeof positionColors] : rankConfig.gradient,
      }}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <span className="text-white font-black drop-shadow-lg">{position}</span>

      {/* Crown for top 3 */}
      {position <= 3 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
          <Crown className="w-2 h-2 text-yellow-800" />
        </div>
      )}
    </motion.div>
  )
}
