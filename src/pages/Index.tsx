"use client"

import React, { useState, useCallback, useMemo } from "react"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useLeaderboard } from "../hooks/useLeaderboard"
import { TierGrid } from "../components/TierGrid"
import { usePopup } from "../contexts/PopupContext"
import { useNavigate } from "react-router-dom"
import type { GameMode, Player } from "../services/playerService"
import { toDatabaseGameMode } from "@/utils/gamemodeCasing"
import { getPlayerRank } from "@/utils/rankUtils"
import { usePointsCalculation } from "@/hooks/usePointsCalculation"
import { FloatingChatButton } from "../components/FloatingChatButton"
import WelcomePopup from "../components/WelcomePopup"
import { useWelcomePopup } from "../hooks/useWelcomePopup"
import { GameModeIcon } from "../components/GameModeIcon"

const Index = () => {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState<GameMode | "overall">("overall")

  const { players, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard()
  const { openPopup } = usePopup()
  const { showWelcome, visitorNumber, closeWelcome } = useWelcomePopup()

  // Enable automatic points calculation
  usePointsCalculation()

  // New gamemodes list
  const gameModes = [
    { id: "overall", label: "Overall" },
    { id: "skywars", label: "Skywars" },
    { id: "midfight", label: "Midfight" },
    { id: "bridge", label: "Bridge" },
    { id: "crystal", label: "Crystal" },
    { id: "sumo", label: "Sumo" },
    { id: "nodebuff", label: "Nodebuff" },
    { id: "bedfight", label: "Bedfight" },
  ]

  // Memoize the player click handler to prevent unnecessary re-renders
  const handlePlayerClick = useCallback(
    (player: Player) => {
      const rankInfo = getPlayerRank(player.global_points || 0)

      const tierAssignments = (player.tierAssignments || []).map((assignment) => ({
        gamemode: assignment.gamemode,
        tier: assignment.tier,
        score: assignment.score,
      }))

      openPopup({
        player,
        tierAssignments,
        combatRank: {
          title: rankInfo.title,
          points: player.global_points || 0,
          color: rankInfo.color,
          effectType: "general",
          rankNumber: player.overall_rank || 1,
          borderColor: rankInfo.borderColor,
        },
        timestamp: new Date().toISOString(),
      })
    },
    [openPopup],
  )

  // Memoize the mode selection handler
  const handleSelectMode = useCallback((mode: string) => {
    setSelectedMode(mode as GameMode | "overall")
  }, [])

  // Memoize the loading and error states
  const loading = leaderboardLoading
  const error = leaderboardError

  // Custom overall leaderboard component
  const OverallLeaderboard = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-white">Loading...</div>
        </div>
      )
    }

    if (error) {
      return <div className="text-red-500 text-center py-8">Error: {error}</div>
    }

    return (
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">#</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">PLAYER</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">REGION</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">TIERS</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr
                  key={player.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors"
                  onClick={() => handlePlayerClick(player)}
                >
                  <td className="py-4 px-4">
                    <span className="text-white font-bold">{index + 1}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {player.ign.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{player.ign}</div>
                        <div className="text-sm text-gray-400">
                          ◆ {player.global_points > 0 ? `${player.global_points} points` : "Rookie (0 points)"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
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
                                    : "bg-gray-800/30 text-gray-400"
                      }`}
                    >
                      {player.region || "NA"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {gameModes.slice(1).map((mode) => {
                        // Find tier for this gamemode
                        const tierAssignment = player.tierAssignments?.find(
                          (assignment) => assignment.gamemode.toLowerCase() === mode.id.toLowerCase(),
                        )

                        const tier = tierAssignment?.tier
                        let displayTier = "NR" // Not Ranked
                        let tierColor = "text-gray-500"

                        if (tier && tier !== "Not Ranked") {
                          if (tier === "Retired") {
                            displayTier = "R"
                            tierColor = "text-gray-400"
                          } else if (tier.startsWith("HT") || tier.startsWith("LT")) {
                            const tierNum = tier.substring(2)
                            displayTier = `T${tierNum}`
                            // Color based on tier level
                            if (tierNum === "5") tierColor = "text-red-400"
                            else if (tierNum === "4") tierColor = "text-orange-400"
                            else if (tierNum === "3") tierColor = "text-yellow-400"
                            else if (tierNum === "2") tierColor = "text-green-400"
                            else if (tierNum === "1") tierColor = "text-blue-400"
                          }
                        }

                        return (
                          <div key={mode.id} className="flex flex-col items-center gap-1 min-w-[32px]">
                            <GameModeIcon mode={mode.id} size={20} />
                            <span className={`text-xs font-bold ${tierColor}`}>{displayTier}</span>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }, [loading, error, players, handlePlayerClick, gameModes])

  // Memoize the main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => {
    if (selectedMode === "overall") {
      return <div className="w-full simple-animation">{OverallLeaderboard}</div>
    }

    return (
      <div className="w-full simple-animation">
        <TierGrid selectedMode={toDatabaseGameMode(selectedMode)} onPlayerClick={handlePlayerClick} />
      </div>
    )
  }, [selectedMode, OverallLeaderboard, handlePlayerClick])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-dark">
      <Navbar selectedMode={selectedMode} onSelectMode={handleSelectMode} navigate={navigate} />

      <main className="flex-grow w-full">
        <div className="w-full px-2 py-3">{mainContent}</div>
      </main>

      <Footer />

      {/* Floating Chat Button */}
      <FloatingChatButton />

      {/* Welcome Popup - One time only */}
      <WelcomePopup isOpen={showWelcome} onClose={closeWelcome} visitorNumber={visitorNumber} />
    </div>
  )
}

export default React.memo(Index)
