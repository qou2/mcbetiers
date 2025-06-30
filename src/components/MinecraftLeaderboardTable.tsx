"use client"

import type React from "react"
import type { Player } from "@/services/playerService"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { GameModeIcon } from "./GameModeIcon"
import { Monitor, Smartphone, Gamepad } from "lucide-react"
import { getPlayerRank } from "@/utils/rankUtils"
import { getAvatarUrl, handleAvatarError } from "@/utils/avatarUtils"
import { useIsMobile } from "@/hooks/use-mobile"
import { PlayerRow } from "./PlayerRow"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface MinecraftLeaderboardTableProps {
  players: Player[]
  onPlayerClick: (player: Player) => void
}

const getDeviceIcon = (device = "PC") => {
  const iconProps = "w-3 h-3"
  switch (device?.toLowerCase()) {
    case "mobile":
    case "bedrock":
      return <Smartphone className={`${iconProps} text-blue-400`} />
    case "console":
      return <Gamepad className={`${iconProps} text-green-400`} />
    case "pc":
    case "java":
    default:
      return <Monitor className={`${iconProps} text-white/90`} />
  }
}

const getRegionStyling = (regionCode = "NA") => {
  const regions: Record<
    string,
    {
      bgGradient: string
      textColor: string
    }
  > = {
    NA: {
      bgGradient: "bg-emerald-500",
      textColor: "text-white",
    },
    EU: {
      bgGradient: "bg-purple-500",
      textColor: "text-white",
    },
    ASIA: {
      bgGradient: "bg-red-500",
      textColor: "text-white",
    },
    SA: {
      bgGradient: "bg-orange-500",
      textColor: "text-white",
    },
    AF: {
      bgGradient: "bg-fuchsia-500",
      textColor: "text-white",
    },
    OCE: {
      bgGradient: "bg-teal-500",
      textColor: "text-white",
    },
  }

  return regions[regionCode] || regions["NA"]
}

const getRankBadgeStyle = (position: number) => {
  if (position === 1) {
    return {
      gradient: "bg-yellow-500",
      text: "text-black",
    }
  } else if (position === 2) {
    return {
      gradient: "bg-gray-400",
      text: "text-black",
    }
  } else if (position === 3) {
    return {
      gradient: "bg-orange-600",
      text: "text-white",
    }
  } else {
    return {
      gradient: "bg-gray-600",
      text: "text-white",
    }
  }
}

export const MinecraftLeaderboardTable: React.FC<MinecraftLeaderboardTableProps> = ({ players, onPlayerClick }) => {
  const isMobile = useIsMobile()

  const getTierBadgeColor = (tier: string) => {
    const tierStyles = {
      HT1: "bg-yellow-500 text-black",
      HT2: "bg-orange-500 text-white",
      HT3: "bg-red-500 text-white",
      LT1: "bg-green-500 text-white",
      LT2: "bg-blue-500 text-white",
      LT3: "bg-purple-500 text-white",
    }

    for (const [key, style] of Object.entries(tierStyles)) {
      if (tier.includes(key)) return style
    }
    return "bg-gray-500 text-white"
  }

  const getPlayerTierForGamemode = (player: Player, gamemode: string): string => {
    if (!player.tierAssignments) return "Not Ranked"

    const assignment = player.tierAssignments.find((t) => t.gamemode.toLowerCase() === gamemode.toLowerCase())

    return assignment?.tier || "Not Ranked"
  }

  const handlePlayerRowClick = (player: Player) => {
    onPlayerClick(player)
  }

  // New gamemodes list
  const gameModes = ["Skywars", "Midfight", "Bridge", "Crystal", "Sumo", "Nodebuff", "Bedfight"]

  if (isMobile) {
    return (
      <div className="w-full space-y-2">
        {players.map((player, index) => {
          const playerPoints = player.global_points || 0
          const rankInfo = getPlayerRank(playerPoints)
          const regionStyle = getRegionStyling(player.region)
          const rankBadge = getRankBadgeStyle(index + 1)

          return (
            <div
              key={player.id}
              className="relative w-full bg-dark-surface/70 rounded-lg p-3 border border-white/20 cursor-pointer transform-none"
              onClick={() => handlePlayerRowClick(player)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`
                  w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold
                  ${rankBadge.gradient} ${rankBadge.text}
                `}
                >
                  {index + 1}
                </div>

                <Avatar className="w-10 h-10 border border-white/20">
                  <AvatarImage
                    src={player.avatar_url || getAvatarUrl(player.ign, player.java_username)}
                    alt={player.ign}
                    onError={(e) => handleAvatarError(e, player.ign, player.java_username)}
                  />
                  <AvatarFallback className="bg-gray-700 text-white text-sm font-bold">
                    {player.ign.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getDeviceIcon(player.device)}
                    <span className="font-bold text-white text-sm truncate">{player.ign}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-bold ${rankInfo.color}`}>◆ {rankInfo.title}</span>
                    <span className="text-white/60 font-medium">({playerPoints})</span>
                  </div>
                </div>

                <span
                  className={`
                  px-2 py-1 rounded-full text-xs font-bold
                  ${regionStyle.bgGradient} ${regionStyle.textColor}
                `}
                >
                  {player.region || "NA"}
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-white/10">
                {gameModes.map((mode) => {
                  const tier = getPlayerTierForGamemode(player, mode)

                  return (
                    <div key={mode} className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded bg-gray-700/70 border border-gray-500/20 flex items-center justify-center mb-1">
                        <GameModeIcon mode={mode.toLowerCase()} className="w-3 h-3" />
                      </div>
                      <div
                        className={`px-1 py-0.5 rounded text-xs font-bold ${getTierBadgeColor(tier)} min-w-[20px] text-center`}
                      >
                        {tier === "Not Ranked" ? "NR" : tier}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/60 font-medium w-12">#</TableHead>
            <TableHead className="text-white/60 font-medium">Player</TableHead>
            <TableHead className="text-white/60 font-medium text-center">Country</TableHead>
            <TableHead className="text-white/60 font-medium text-center">Device</TableHead>
            {gameModes.map((mode) => (
              <TableHead key={mode} className="text-white/60 font-medium text-center min-w-[80px]">
                <div className="flex flex-col items-center gap-1">
                  <GameModeIcon mode={mode.toLowerCase()} className="h-6 w-6" />
                  <span className="text-xs">{mode}</span>
                </div>
              </TableHead>
            ))}
            <TableHead className="text-white/60 font-medium text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, index) => (
            <TableRow
              key={player.id}
              className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => onPlayerClick(player)}
            >
              <PlayerRow
                position={index + 1}
                displayName={player.ign}
                avatar={player.avatar_url}
                country={player.region}
                device={player.device}
                points={player.global_points}
                onClick={() => onPlayerClick(player)}
                gameModes={gameModes}
                tierAssignments={player.tierAssignments || []}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
