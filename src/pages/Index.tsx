"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { TierGrid } from "@/components/TierGrid"
import { PlayerModal } from "@/components/PlayerModal"
import { WelcomePopup } from "@/components/WelcomePopup"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { useWelcomePopup } from "@/hooks/useWelcomePopup"
import type { Player } from "@/services/playerService"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GameModeIcon } from "@/components/GameModeIcon"

const Index = () => {
  const [selectedMode, setSelectedMode] = useState("Overall")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const { players, loading, error } = useLeaderboard()
  const { showWelcome, hideWelcome } = useWelcomePopup()

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player)
  }

  const handleCloseModal = () => {
    setSelectedPlayer(null)
  }

  // New gamemodes list
  const gameModes = [
    { id: "Overall", label: "Overall" },
    { id: "Skywars", label: "Skywars" },
    { id: "Midfight", label: "Midfight" },
    { id: "Bridge", label: "Bridge" },
    { id: "Crystal", label: "Crystal" },
    { id: "Sumo", label: "Sumo" },
    { id: "Nodebuff", label: "Nodebuff" },
    { id: "Bedfight", label: "Bedfight" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
            MCBE TIERS
          </h1>
          <p className="text-lg text-gray-300 mb-8">Rankings</p>
        </div>

        <Tabs value={selectedMode} onValueChange={setSelectedMode} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 mb-8 bg-dark-surface/50">
            {gameModes.map((mode) => (
              <TabsTrigger
                key={mode.id}
                value={mode.id}
                className="flex items-center gap-1 text-xs md:text-sm data-[state=active]:bg-white/10"
              >
                {mode.id !== "Overall" && <GameModeIcon mode={mode.id.toLowerCase()} size={16} className="mr-1" />}
                {mode.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Overall" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-white">Loading leaderboard...</div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">Error loading leaderboard: {error}</div>
            ) : (
              <div className="bg-dark-surface/30 rounded-xl p-6 border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-white/80 font-medium">#</th>
                        <th className="text-left py-3 px-4 text-white/80 font-medium">PLAYER</th>
                        <th className="text-center py-3 px-4 text-white/80 font-medium">REGION</th>
                        <th className="text-center py-3 px-4 text-white/80 font-medium">TIERS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player, index) => (
                        <tr
                          key={player.id}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
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
                            <div className="flex items-center justify-center gap-1 flex-wrap">
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
                                    tierColor = `text-tier-${tierNum}`
                                  }
                                }

                                return (
                                  <div key={mode.id} className="flex flex-col items-center gap-1">
                                    <GameModeIcon mode={mode.id.toLowerCase()} size={16} className="" />
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
            )}
          </TabsContent>

          {gameModes.slice(1).map((mode) => (
            <TabsContent key={mode.id} value={mode.id} className="space-y-6">
              <TierGrid selectedMode={mode.id} onPlayerClick={handlePlayerClick} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Footer />

      {selectedPlayer && <PlayerModal isOpen={!!selectedPlayer} onClose={handleCloseModal} player={selectedPlayer} />}

      {showWelcome && <WelcomePopup onClose={hideWelcome} />}
    </div>
  )
}

export default Index
