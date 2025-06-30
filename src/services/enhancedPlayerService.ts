import { supabase } from '@/integrations/supabase/client';
import { Player, GameMode, TierLevel, searchPlayers } from './playerService';

export async function getEnhancedPlayers(): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .limit(50);

    if (error) {
      console.error('Error fetching players:', error);
      throw error;
    }

    return data.map(player => ({
      id: player.id,
      ign: player.ign,
      region: player.region,
      device: player.device,
      global_points: player.global_points,
      overall_rank: 0, // Set a default value or fetch it if needed
    }));
  } catch (error) {
    console.error('Error in getEnhancedPlayers:', error);
    return [];
  }
}

export async function getEnhancedPlayerData(playerId: string): Promise<Player | null> {
  try {
    const players = await searchPlayers(playerId);
    return players.length > 0 ? players[0] : null;
  } catch (error) {
    console.error('Error fetching enhanced player data:', error);
    return null;
  }
}
