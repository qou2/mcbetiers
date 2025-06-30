"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface Player {
  id: string
  username: string
  uuid: string
  created_at: string
  gamemode_scores?: GamemodeScore[]
}

export interface GamemodeScore {
  id: string
  player_id: string
  gamemode: string
  display_tier: string
  internal_tier: string
  score?: number
  created_at: string
  updated_at: string
}

export interface TierData {
  [gamemode: string]: {
    [tier: string]: Player[]
  }
}

const GAMEMODES = ["skywars", "midfight", "bridge", "crystal", "sumo", "nodebuff", "bedfight"]

const TIERS = ["Not Ranked", "HT1", "LT1", "HT2", "LT2", "HT3", "LT3", "HT4", "LT4", "HT5", "LT5", "Retired"]

export const useAdminPanel = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const [tierData, setTierData] = useState<TierData>({})
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Initialize tier data structure
  useEffect(() => {
    const initialTierData: TierData = {}
    GAMEMODES.forEach((gamemode) => {
      initialTierData[gamemode] = {}
      TIERS.forEach((tier) => {
        initialTierData[gamemode][tier] = []
      })
    })
    setTierData(initialTierData)
  }, [])

  const fetchPlayers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("players")
        .select(`
          *,
          gamemode_scores (*)
        `)
        .order("username")

      if (error) throw error

      setPlayers(data || [])
      organizeTierData(data || [])
    } catch (error) {
      console.error("Error fetching players:", error)
      toast({
        title: "Error",
        description: "Failed to fetch players",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const organizeTierData = (playersData: Player[]) => {
    const newTierData: TierData = {}

    // Initialize structure
    GAMEMODES.forEach((gamemode) => {
      newTierData[gamemode] = {}
      TIERS.forEach((tier) => {
        newTierData[gamemode][tier] = []
      })
    })

    // Organize players by gamemode and tier
    playersData.forEach((player) => {
      if (player.gamemode_scores) {
        player.gamemode_scores.forEach((score) => {
          const gamemode = score.gamemode
          const tier = score.display_tier || "Not Ranked"

          if (newTierData[gamemode] && newTierData[gamemode][tier]) {
            newTierData[gamemode][tier].push(player)
          }
        })
      }
    })

    setTierData(newTierData)
  }

  const addPlayer = async (username: string, uuid: string) => {
    try {
      const { data, error } = await supabase.from("players").insert([{ username, uuid }]).select().single()

      if (error) throw error

      toast({
        title: "Success",
        description: `Player ${username} added successfully`,
      })

      fetchPlayers()
      return data
    } catch (error) {
      console.error("Error adding player:", error)
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive",
      })
      throw error
    }
  }

  const updatePlayerTier = async (playerId: string, gamemode: string, tier: string) => {
    try {
      // Check if player already has a score for this gamemode
      const { data: existingScore } = await supabase
        .from("gamemode_scores")
        .select("id")
        .eq("player_id", playerId)
        .eq("gamemode", gamemode.toLowerCase())
        .single()

      if (existingScore) {
        // Update existing score
        const { error } = await supabase
          .from("gamemode_scores")
          .update({
            display_tier: tier,
            internal_tier: tier,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingScore.id)

        if (error) throw error
      } else {
        // Create new score
        const { error } = await supabase.from("gamemode_scores").insert([
          {
            player_id: playerId,
            gamemode: gamemode.toLowerCase(),
            display_tier: tier,
            internal_tier: tier,
          },
        ])

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Player tier updated to ${tier} for ${gamemode}`,
      })

      fetchPlayers()
    } catch (error) {
      console.error("Error updating player tier:", error)
      toast({
        title: "Error",
        description: "Failed to update player tier",
        variant: "destructive",
      })
    }
  }

  const deletePlayer = async (playerId: string) => {
    try {
      // First delete all gamemode scores for this player
      const { error: scoresError } = await supabase.from("gamemode_scores").delete().eq("player_id", playerId)

      if (scoresError) throw scoresError

      // Then delete the player
      const { error: playerError } = await supabase.from("players").delete().eq("id", playerId)

      if (playerError) throw playerError

      toast({
        title: "Success",
        description: "Player deleted successfully",
      })

      fetchPlayers()
    } catch (error) {
      console.error("Error deleting player:", error)
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive",
      })
    }
  }

  const filteredPlayers = players.filter(
    (player) =>
      player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.uuid.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    fetchPlayers()
  }, [])

  return {
    players: filteredPlayers,
    tierData,
    loading,
    searchTerm,
    setSearchTerm,
    addPlayer,
    updatePlayerTier,
    deletePlayer,
    fetchPlayers,
    gamemodes: GAMEMODES,
    tiers: TIERS,
  }
}
