"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, Star, Crown, Zap, Shield, Sword } from "lucide-react"
import type { Player, GameMode, TierLevel } from "@/services/playerService"
import { getPlayerRank } from "@/utils/rankUtils"
import "./ResultPopup.css"

interface TierAssignment {
  gamemode: GameMode
  tier: TierLevel
  score: number
}

interface CombatRank {
  title: string
  points: number
  color: string
  effectType: string
  rankNumber: number
  borderColor: string
}

interface ResultPopupProps {
  isOpen: boolean
  onClose: () => void
  player: Player
  tierAssignments: TierAssignment[]
  combatRank: CombatRank
  timestamp: string
}

export const ResultPopup: React.FC<ResultPopupProps> = ({
  isOpen,
  onClose,
  player,
  tierAssignments,
  combatRank,
  timestamp,
}) => {
  if (!isOpen) return null

  // NEW GAMEMODES - Updated to use the new 7 gamemodes
  const gameModes: GameMode[] = ["Skywars", "Midfight", "Bridge", "Crystal", "Sumo", "Nodebuff", "Bedfight"]

  const getTierData = (gamemode: GameMode) => {
    const assignment = tierAssignments.find((a) => a.gamemode === gamemode)
    console.log(`Getting tier data for ${gamemode}:`, assignment)

    if (assignment && assignment.tier && assignment.tier !== "Not Ranked") {
      const tierInfo = {
        HT1: { code: "HT1", color: "#fde047", gradient: "linear-gradient(135deg, #fef9c3 0%, #fde047 90%)" },
        LT1: { code: "LT1", color: "#7cffad", gradient: "linear-gradient(135deg, #e6fff6 0%, #7cffad 90%)" },
        HT2: { code: "HT2", color: "#a78bfa", gradient: "linear-gradient(135deg, #f5f3ff 0%, #a78bfa 90%)" },
        LT2: { code: "LT2", color: "#fda4af", gradient: "linear-gradient(135deg, #fff1fc 0%, #fda4af 100%)" },
        HT3: { code: "HT3", color: "#f472b6", gradient: "linear-gradient(135deg, #fff1fa 0%, #f472b6 90%)" },
        LT3: { code: "LT3", color: "#38bdf8", gradient: "linear-gradient(135deg, #f0faff 0%, #38bdf8 90%)" },
        HT4: { code: "HT4", color: "#fb7185", gradient: "linear-gradient(135deg, #fef2f2 0%, #fb7185 90%)" },
        LT4: { code: "LT4", color: "#60a5fa", gradient: "linear-gradient(135deg, #eff6ff 0%, #60a5fa 90%)" },
        HT5: { code: "HT5", color: "#34d399", gradient: "linear-gradient(135deg, #ecfdf5 0%, #34d399 90%)" },
        LT5: { code: "LT5", color: "#fbbf24", gradient: "linear-gradient(135deg, #fffbeb 0%, #fbbf24 90%)" },
        Retired: { code: "RT", color: "#6b7280", gradient: "linear-gradient(135deg, #f9fafb 0%, #6b7280 90%)" },
      }[assignment.tier as keyof typeof tierInfo]

      if (tierInfo) {
        console.log(`Found tier info for ${gamemode}:`, tierInfo)
        return tierInfo
      }
    }

    console.log(`No tier found for ${gamemode}, returning NR`)
    return {
      code: "NR",
      color: "#e5e7eb",
      gradient: "linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)",
    }
  }

  const getGamemodeIcon = (gamemode: GameMode) => {
    const icons = {
      Skywars: Star,
      Midfight: Sword,
      Bridge: Shield,
      Crystal: Zap,
      Sumo: Crown,
      Nodebuff: Trophy,
      Bedfight: Star,
    }
    return icons[gamemode] || Star
  }

  const playerRank = getPlayerRank(player.global_points || 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-slate-700/50">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{player.ign?.charAt(0).toUpperCase() || "P"}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{player.ign}</h2>
                  <p className="text-slate-400">Combat Assessment Complete</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Combat Rank */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Combat Rank
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold" style={{ color: combatRank.color }}>
                      {combatRank.title}
                    </div>
                    <div className="text-slate-400">
                      {combatRank.points.toLocaleString()} points • Rank #{combatRank.rankNumber}
                    </div>
                  </div>
                  <div
                    className="px-6 py-3 rounded-lg font-bold text-lg border-2"
                    style={{
                      backgroundColor: combatRank.color + "20",
                      borderColor: combatRank.borderColor,
                      color: combatRank.color,
                    }}
                  >
                    {combatRank.title}
                  </div>
                </div>
              </div>

              {/* Gamemode Tiers */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Sword className="w-6 h-6 text-red-400" />
                  Gamemode Tiers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gameModes.map((gamemode) => {
                    const tierData = getTierData(gamemode)
                    const IconComponent = getGamemodeIcon(gamemode)

                    return (
                      <motion.div
                        key={gamemode}
                        className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5 text-slate-300" />
                            <span className="font-medium text-white">{gamemode}</span>
                          </div>
                        </div>

                        <div
                          className="text-center py-2 px-3 rounded-md font-bold text-sm border"
                          style={{
                            background: tierData.gradient,
                            borderColor: tierData.color,
                            color: tierData.code === "NR" ? "#6b7280" : "#000",
                          }}
                        >
                          {tierData.code}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-slate-400 text-sm">
                Assessment completed on {new Date(timestamp).toLocaleString()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
