"use client"

import type React from "react"
import type { Player } from "@/services/playerService"
import { PlayerRow } from "./PlayerRow"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LeaderboardTableProps {
  players: Player[]
  onPlayerClick: (player: Player) => void
  gameMode?: string
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ players, onPlayerClick, gameMode = "overall" }) => {
  // Sort players by points in descending order
  const sortedPlayers = [...players].sort((a, b) => (b.global_points || 0) - (a.global_points || 0))

  const gameModes = gameMode === "overall" ? ["SkyWars", "BedWars"] : [gameMode]

  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-white/5">
            <TableHead className="w-12 text-white/70">#</TableHead>
            <TableHead className="text-white/70">Player</TableHead>
            <TableHead className="text-center text-white/70">Region</TableHead>
            <TableHead className="text-center text-white/70">Device</TableHead>
            {gameMode === "overall" &&
              gameModes.map((mode) => (
                <TableHead key={mode} className="text-center text-white/70">
                  {mode}
                </TableHead>
              ))}
            <TableHead className="text-right text-white/70">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPlayers.map((player, index) => (
            <TableRow
              key={player.id}
              className="border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => onPlayerClick(player)}
            >
              <PlayerRow
                position={index + 1}
                displayName={player.ign}
                avatar={player.avatar_url || undefined}
                points={player.global_points || 0}
                country={player.region || undefined}
                device={player.device || undefined}
                onClick={() => onPlayerClick(player)}
                gameModes={gameMode === "overall" ? gameModes : []}
                tierAssignments={player.tier_assignments || []}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
