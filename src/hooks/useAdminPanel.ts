"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { Player, GameMode, TierLevel } from "@/services/playerService"
import { useToast } from "@/hooks/use-toast"

export interface PlayerResult {
  gamemode: GameMode
  tier: TierLevel
  points: number
}

export interface AdminPanelState {
  players: Player[]
  loading: boolean
  error: string | null
}

export function useAdminPanel() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const refreshPlayers = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching all players for admin panel...")

      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .order("global_points", { ascending: false })

      if (playersError) {
        console.error("Error fetching players:", playersError)
        setError(playersError.message)
        return
      }

      if (!playersData) {
        setPlayers([])
        return
      }

      // Get tier assignments for all players
      const playerIds = playersData.map((p) => p.id)
      const { data: tierData, error: tierError } = await supabase
        .from("gamemode_scores")
        .select("player_id, gamemode, internal_tier, score")
        .in("player_id", playerIds)

      if (tierError) {
        console.error("Error fetching tier data:", tierError)
      }

      // Group tier assignments by player
      const tiersByPlayer = new Map<string, { gamemode: GameMode; tier: TierLevel; score: number }[]>()

      if (tierData) {
        tierData.forEach((tier) => {
          if (!tiersByPlayer.has(tier.player_id)) {
            tiersByPlayer.set(tier.player_id, [])
          }
          tiersByPlayer.get(tier.player_id)!.push({
            gamemode: tier.gamemode as GameMode,
            tier: tier.internal_tier as TierLevel,
            score: tier.score || 0,
          })
        })
      }

      const processedPlayers: Player[] = playersData.map((player, index) => ({
        id: player.id,
        ign: player.ign,
        region: player.region || "NA",
        device: player.device || "PC",
        global_points: player.global_points || 0,
        overall_rank: index + 1,
        java_username: player.java_username,
        avatar_url: player.avatar_url,
        tierAssignments: tiersByPlayer.get(player.id) || [],
      }))

      setPlayers(processedPlayers)
      console.log(`Loaded ${processedPlayers.length} players for admin panel`)
    } catch (error: any) {
      console.error("Exception in refreshPlayers:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const submitPlayerResults = async (
    ign: string,
    region: string,
    device: string,
    javaUsername?: string,
    results: PlayerResult[] = [],
  ) => {
    setLoading(true)

    try {
      console.log("Submitting player results:", { ign, region, device, javaUsername, results })

      // Check if player exists
      const { data: existingPlayer, error: searchError } = await supabase
        .from("players")
        .select("id")
        .eq("ign", ign)
        .single()

      let playerId: string

      if (existingPlayer) {
        playerId = existingPlayer.id
        console.log("Player exists, updating:", playerId)

        // Update existing player
        const { error: updateError } = await supabase
          .from("players")
          .update({
            region,
            device,
            java_username: javaUsername || ign,
            updated_at: new Date().toISOString(),
          })
          .eq("id", playerId)

        if (updateError) {
          console.error("Error updating player:", updateError)
          throw updateError
        }
      } else {
        console.log("Creating new player")

        // Create new player
        const { data: newPlayer, error: createError } = await supabase
          .from("players")
          .insert({
            ign,
            region,
            device,
            java_username: javaUsername || ign,
            global_points: 0,
            banned: false,
          })
          .select("id")
          .single()

        if (createError) {
          console.error("Error creating player:", createError)
          throw createError
        }

        playerId = newPlayer.id
      }

      // Update tier assignments
      for (const result of results) {
        console.log(`Processing tier assignment: ${result.gamemode} -> ${result.tier}`)

        // Check if assignment exists
        const { data: existingAssignment } = await supabase
          .from("gamemode_scores")
          .select("id")
          .eq("player_id", playerId)
          .eq("gamemode", result.gamemode.toLowerCase())
          .single()

        if (existingAssignment) {
          // Update existing assignment
          const { error: updateError } = await supabase
            .from("gamemode_scores")
            .update({
              internal_tier: result.tier,
              display_tier: result.tier,
              score: result.points,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingAssignment.id)

          if (updateError) {
            console.error("Error updating tier assignment:", updateError)
            throw updateError
          }
        } else {
          // Create new assignment
          const { error: createError } = await supabase.from("gamemode_scores").insert({
            player_id: playerId,
            gamemode: result.gamemode.toLowerCase(),
            internal_tier: result.tier,
            display_tier: result.tier,
            score: result.points,
          })

          if (createError) {
            console.error("Error creating tier assignment:", createError)
            throw createError
          }
        }
      }

      // Recalculate global points
      await updatePlayerGlobalPoints(playerId)

      toast({
        title: "Success",
        description: `Player ${ign} has been successfully ${existingPlayer ? "updated" : "added"}.`,
      })

      await refreshPlayers()

      return { success: true }
    } catch (error: any) {
      console.error("Error submitting player results:", error)
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      })

      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const updatePlayerTier = async (playerId: string, gamemode: GameMode, newTier: TierLevel) => {
    try {
      console.log(`Updating player ${playerId} tier for ${gamemode} to ${newTier}`)

      // Check if assignment exists
      const { data: existingAssignment } = await supabase
        .from("gamemode_scores")
        .select("id")
        .eq("player_id", playerId)
        .eq("gamemode", gamemode.toLowerCase())
        .single()

      if (existingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from("gamemode_scores")
          .update({
            internal_tier: newTier,
            display_tier: newTier,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAssignment.id)

        if (error) throw error
      } else {
        // Create new assignment
        const { error } = await supabase.from("gamemode_scores").insert({
          player_id: playerId,
          gamemode: gamemode.toLowerCase(),
          internal_tier: newTier,
          display_tier: newTier,
          score: 0,
        })

        if (error) throw error
      }

      // Recalculate global points
      await updatePlayerGlobalPoints(playerId)

      toast({
        title: "Tier Updated",
        description: `Player tier for ${gamemode} updated to ${newTier}`,
      })

      return { success: true }
    } catch (error: any) {
      console.error("Error updating player tier:", error)
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      })

      return { success: false, error: error.message }
    }
  }

  const deletePlayer = async (playerId: string) => {
    try {
      console.log(`Deleting player: ${playerId}`)

      // Delete tier assignments first
      const { error: tierError } = await supabase.from("gamemode_scores").delete().eq("player_id", playerId)

      if (tierError) {
        console.error("Error deleting tier assignments:", tierError)
        throw tierError
      }

      // Delete player
      const { error: playerError } = await supabase.from("players").delete().eq("id", playerId)

      if (playerError) {
        console.error("Error deleting player:", playerError)
        throw playerError
      }

      toast({
        title: "Player Deleted",
        description: "Player and all associated data have been deleted.",
      })

      return { success: true }
    } catch (error: any) {
      console.error("Error deleting player:", error)
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      })

      return { success: false, error: error.message }
    }
  }

  const updatePlayerGlobalPoints = async (playerId: string) => {
    try {
      // Get all tier assignments for the player
      const { data: tierAssignments, error } = await supabase
        .from("gamemode_scores")
        .select("internal_tier, score")
        .eq("player_id", playerId)
        .not("internal_tier", "is", null)

      if (error) {
        console.error("Error fetching tier assignments:", error)
        return
      }

      // Calculate total points
      const tierPoints: Record<TierLevel, number> = {
        HT1: 50,
        LT1: 45,
        HT2: 40,
        LT2: 35,
        HT3: 30,
        LT3: 25,
        HT4: 20,
        LT4: 15,
        HT5: 10,
        LT5: 5,
        Retired: 0,
        "Not Ranked": 0,
      }

      let totalPoints = 0
      if (tierAssignments) {
        tierAssignments.forEach((assignment) => {
          const points = tierPoints[assignment.internal_tier as TierLevel] || 0
          totalPoints += points
        })
      }

      // Update player's global points
      const { error: updateError } = await supabase
        .from("players")
        .update({
          global_points: totalPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("id", playerId)

      if (updateError) {
        console.error("Error updating global points:", updateError)
      }
    } catch (error) {
      console.error("Error in updatePlayerGlobalPoints:", error)
    }
  }

  useEffect(() => {
    refreshPlayers()
  }, [])

  return {
    players,
    loading,
    error,
    refreshPlayers,
    submitPlayerResults,
    updatePlayerTier,
    deletePlayer,
  }
}
