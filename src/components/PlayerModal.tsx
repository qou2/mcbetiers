"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Monitor, Smartphone, Gamepad, Award } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { GameMode, TierLevel } from "@/services/playerService"
import { getPlayerRank, formatPointsRange } from "@/utils/rankUtils"
import { GameModeIcon } from "./GameModeIcon"
import { toDisplayGameMode } from "@/utils/gamemodeCasing"

interface PlayerModalProps {
  isOpen: boolean
  onClose: () => void
  player: any
}

export function PlayerModal({ isOpen, onClose, player }: PlayerModalProps) {
  const [playerTiers, setPlayerTiers] = useState<Record<GameMode, { tier: TierLevel; score: number }>>({} as any)

  // Calculate player rank based on points
  const playerPoints = Number(player?.global_points || player?.points || 0)
  const rankInfo = getPlayerRank(playerPoints)

  // Function to get device icon
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "PC":
        return <Monitor size={16} className="mr-1" />
      case "Mobile":
        return <Smartphone size={16} className="mr-1" />
      case "Console":
        return <Gamepad size={16} className="mr-1" />
      default:
        return <Monitor size={16} className="mr-1" />
    }
  }

  // Fetch player's tiers across all gamemodes
  useEffect(() => {
    if (isOpen && player && player.id) {
      console.log("Player tier assignments:", player.tierAssignments)
    }
  }, [isOpen, player])

  // NEW GAMEMODES - Updated to use the new 7 gamemodes
  const allGamemodes: GameMode[] = ["Skywars", "Midfight", "Bridge", "Crystal", "Sumo", "Nodebuff", "Bedfight"]

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  }

  if (!player) return null

  // Safely check badge includes with fallback
  const getBadgeColor = () => {
    const badge = player.badge || ""

    if (badge.includes("Master")) return "text-yellow-400"
    if (badge.includes("Ace")) return "text-orange-400"
    return "text-purple-400"
  }

  // Function to get tier color based on tier level
  const getTierColor = (tier: TierLevel) => {
    if (tier === "Not Ranked") return "text-gray-400"
    if (tier === "Retired") return "text-gray-500"

    // Extract tier number for coloring
    if (tier.includes("1")) return "text-blue-400" // T1
    if (tier.includes("2")) return "text-green-400" // T2
    if (tier.includes("3")) return "text-yellow-400" // T3
    if (tier.includes("4")) return "text-orange-400" // T4
    if (tier.includes("5")) return "text-red-400" // T5

    return "text-gray-400"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0B0B0F] border-white/10 max-w-md">
        <motion.div initial="hidden" animate="visible" variants={modalVariants} className="animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Player Profile</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center pt-2">
            <Avatar className="h-24 w-24 border-4 border-white/10">
              <AvatarImage src={player.avatar_url || player.avatar} alt={player.ign || player.name} />
              <AvatarFallback>{(player.ign || player.name || "").slice(0, 2)}</AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-bold mt-3">{player.displayName || player.ign || player.name}</h2>

            <div className="flex items-center mt-1 space-x-2">
              {player.region && (
                <span
                  className={cn(
                    "text-sm px-2 py-0.5 rounded-full",
                    player.region === "NA"
                      ? "bg-red-900/30 text-red-400"
                      : player.region === "EU"
                        ? "bg-green-900/30 text-green-400"
                        : player.region === "ASIA"
                          ? "bg-blue-900/30 text-blue-400"
                          : player.region === "OCE"
                            ? "bg-purple-900/30 text-purple-400"
                            : player.region === "SA"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : player.region === "AF"
                                ? "bg-orange-900/30 text-orange-400"
                                : "bg-gray-800/30 text-gray-400",
                  )}
                >
                  {player.region}
                </span>
              )}

              <span className="text-white/60 text-sm flex items-center">
                <Trophy size={14} className="mr-1 text-yellow-400" />
                {playerPoints} points
              </span>
            </div>

            {/* Player Rank Badge */}
            <div className="mt-3 px-3 py-1 rounded-full bg-gradient-to-r from-black/40 to-black/20 border border-white/10">
              <span className={`text-sm font-medium ${rankInfo.color}`}>
                {rankInfo.title} • {formatPointsRange(rankInfo.minPoints, rankInfo.maxPoints)}
              </span>
            </div>

            <div className="mt-1 flex items-center">
              <Award size={16} className={cn("mr-1", getBadgeColor())} />
              <span className={cn("text-sm font-medium", getBadgeColor())}>{player.badge || "No Badge"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 rounded-lg p-3 flex flex-col">
              <span className="text-xs text-white/40">Rank</span>
              <span className="text-lg font-bold">#{player.overall_rank || player.position || "?"}</span>
            </div>

            <div className="bg-white/5 rounded-lg p-3 flex flex-col">
              <span className="text-xs text-white/40">Device</span>
              <span className="text-lg font-bold flex items-center">
                {getDeviceIcon(player.device || "PC")}
                {player.device || "PC"}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-md font-medium mb-3">Gamemode Tiers</h3>
            <div className="grid grid-cols-4 gap-2">
              {allGamemodes.map((mode, index) => {
                // Find tier assignment for this gamemode from player data
                // Check multiple variations to ensure compatibility
                const tierAssignment = player.tierAssignments?.find((assignment: any) => {
                  const assignmentMode = assignment.gamemode?.toLowerCase()
                  const targetMode = mode.toLowerCase()

                  // Direct match
                  if (assignmentMode === targetMode) return true

                  // Handle specific gamemode mappings
                  const gamemodeMap: Record<string, string[]> = {
                    skywars: ["skywars", "skywar"],
                    midfight: ["midfight", "mid"],
                    bridge: ["bridge"],
                    crystal: ["crystal", "crystalpvp"],
                    sumo: ["sumo"],
                    nodebuff: ["nodebuff", "nb"],
                    bedfight: ["bedfight", "bed"],
                  }

                  const possibleNames = gamemodeMap[targetMode] || [targetMode]
                  return possibleNames.includes(assignmentMode)
                })

                const tier = tierAssignment?.tier || "Not Ranked"
                const displayTier = tier === "Not Ranked" ? "NR" : tier

                return (
                  <motion.div
                    key={mode}
                    className="bg-white/5 p-2 rounded flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="mb-1">
                      <GameModeIcon mode={mode.toLowerCase()} />
                    </div>
                    <span className="text-xs text-white/60 mb-1">{toDisplayGameMode(mode)}</span>
                    <span className={cn("text-xs font-bold", getTierColor(tier))}>{displayTier}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
