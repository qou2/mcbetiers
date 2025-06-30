import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, GameMode, TierLevel, updatePlayerGlobalPoints } from '@/services/playerService';
import { useToast } from '@/hooks/use-toast';
import { deepSeekService } from '@/services/deepSeekService';

interface PlayerResult {
  gamemode: GameMode;
  tier: TierLevel;
  points: number;
}

export const useAdminPanel = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshPlayers = async () => {
    const startTime = Date.now();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting refreshPlayers...');
      deepSeekService.logDatabaseOperation('SELECT', 'players', null, null, null);
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('global_points', { ascending: false });

      const duration = Date.now() - startTime;

      if (error) {
        console.error('Error fetching players:', error);
        setError(error.message);
        deepSeekService.logDatabaseOperation('SELECT', 'players', null, null, error, duration);
      } else {
        console.log(`Fetched ${data?.length || 0} players successfully`);
        setPlayers(data || []);
        deepSeekService.logDatabaseOperation('SELECT', 'players', null, { data }, null, duration);
      }
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error('Exception in refreshPlayers:', err);
      setError(err.message);
      deepSeekService.logError(err, { operation: 'refreshPlayers' });
      deepSeekService.logDatabaseOperation('SELECT', 'players', null, null, err, duration);
    } finally {
      setLoading(false);
    }
  };

  const findPlayerByIGN = async (ign: string): Promise<{ id: string; ign: string } | null> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, ign')
        .ilike('ign', ign)
        .single();

      if (error || !data) {
        console.log(`Player not found: ${ign}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error finding player by IGN:', error);
      return null;
    }
  };

  const updatePlayerTier = async (playerIdOrIGN: number | string, gamemode: GameMode, tier: TierLevel) => {
    const startTime = Date.now();
    
    let playerId: string;
    
    if (typeof playerIdOrIGN === 'string' && isNaN(Number(playerIdOrIGN))) {
      const player = await findPlayerByIGN(playerIdOrIGN);
      if (!player) {
        toast({
          title: "Player Not Found",
          description: `Could not find player with IGN: ${playerIdOrIGN}`,
          variant: "destructive"
        });
        return { success: false, error: "Player not found" };
      }
      playerId = player.id;
    } else {
      const numericId = typeof playerIdOrIGN === 'string' ? parseInt(playerIdOrIGN) : playerIdOrIGN;
      if (!numericId || isNaN(numericId)) {
        toast({
          title: "Invalid Player ID",
          description: "Player ID must be a valid number",
          variant: "destructive"
        });
        return { success: false, error: "Invalid player ID" };
      }
      playerId = numericId.toString();
    }

    if (tier === 'Not Ranked') {
      toast({
        title: "Invalid Tier",
        description: "Cannot set tier to 'Not Ranked'",
        variant: "destructive"
      });
      return { success: false, error: "Invalid tier" };
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`Updating player ${playerId} tier for ${gamemode} to ${tier}`);
      deepSeekService.logUserAction('update_tier', 'player', { playerId, gamemode, tier });
      
      const upsertData = { 
        player_id: playerId, 
        gamemode: gamemode, 
        display_tier: tier,
        internal_tier: tier,
        score: 0
      };
      
      deepSeekService.logDatabaseOperation('UPSERT', 'gamemode_scores', upsertData);
      
      const { error } = await supabase
        .from('gamemode_scores')
        .upsert(upsertData, { onConflict: 'player_id,gamemode' });

      const duration = Date.now() - startTime;

      if (error) {
        console.error('Error updating tier:', error);
        setError(error.message);
        deepSeekService.logDatabaseOperation('UPSERT', 'gamemode_scores', upsertData, null, error, duration);
        toast({
          title: "Error",
          description: `Failed to update tier: ${error.message}`,
          variant: "destructive"
        });
        return { success: false, error: error.message };
      } else {
        await updatePlayerGlobalPoints(playerId);
        deepSeekService.logDatabaseOperation('UPSERT', 'gamemode_scores', upsertData, { success: true }, null, duration);
        toast({
          title: "Success",
          description: `Tier updated successfully for player ${playerId} in ${gamemode}. Global points recalculated.`,
        });
        return { success: true };
      }
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error('Exception in updatePlayerTier:', err);
      setError(err.message);
      deepSeekService.logError(err, { operation: 'updatePlayerTier', playerId, gamemode, tier });
      toast({
        title: "Error",
        description: `Failed to update tier: ${err.message}`,
        variant: "destructive"
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (playerId: string) => {
    const startTime = Date.now();
    
    // Get player info for logging before deletion
    const playerData = players.find(p => p.id === playerId);
    const playerIGN = playerData?.ign || 'Unknown';
    
    if (!playerData) {
      toast({
        title: "Player Not Found",
        description: `Could not find player in current list`,
        variant: "destructive"
      });
      return { success: false, error: "Player not found in current list" };
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`Starting deletion process for player ID: ${playerId} (IGN: ${playerIGN})`);
      deepSeekService.logUserAction('delete_player', 'player', { playerId, playerIGN });
      
      // Step 1: Delete gamemode scores first
      console.log('Step 1: Deleting gamemode scores...');
      deepSeekService.logDatabaseOperation('DELETE', 'gamemode_scores', { player_id: playerId });
      
      const { error: scoresError, count: deletedScoresCount } = await supabase
        .from('gamemode_scores')
        .delete({ count: 'exact' })
        .eq('player_id', playerId);

      if (scoresError) {
        console.error('Error deleting gamemode scores:', scoresError);
        deepSeekService.logDatabaseOperation('DELETE', 'gamemode_scores', { player_id: playerId }, null, scoresError);
        throw new Error(`Failed to delete gamemode scores: ${scoresError.message}`);
      }

      console.log(`Successfully deleted ${deletedScoresCount} gamemode score records`);

      // Step 2: Delete the player record
      console.log('Step 2: Deleting player record...');
      deepSeekService.logDatabaseOperation('DELETE', 'players', { id: playerId });
      
      const { error: playerError, count: deletedPlayerCount } = await supabase
        .from('players')
        .delete({ count: 'exact' })
        .eq('id', playerId);

      const duration = Date.now() - startTime;

      if (playerError) {
        console.error('Error deleting player:', playerError);
        deepSeekService.logDatabaseOperation('DELETE', 'players', { id: playerId }, null, playerError, duration);
        throw new Error(`Failed to delete player: ${playerError.message}`);
      }

      if (deletedPlayerCount === 0) {
        console.warn('No player was deleted - player may not exist');
        throw new Error('Player not found in database');
      }

      console.log(`Successfully deleted player record. Total deleted: ${deletedPlayerCount}`);

      // Step 3: Update local state immediately
      console.log('Step 3: Updating local state...');
      setPlayers(prevPlayers => {
        const newPlayers = prevPlayers.filter(player => player.id !== playerId);
        console.log(`Local state updated: removed player ${playerId}, ${newPlayers.length} players remaining`);
        return newPlayers;
      });

      deepSeekService.logDatabaseOperation('DELETE', 'players', { id: playerId }, { 
        success: true, 
        deletedScores: deletedScoresCount,
        deletedPlayer: deletedPlayerCount 
      }, null, duration);
      
      console.log(`✅ Player ${playerIGN} (${playerId}) successfully deleted from database and UI`);
      return { success: true };
      
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error('❌ Exception in deletePlayer:', err);
      setError(err.message);
      deepSeekService.logError(err, { operation: 'deletePlayer', playerId, playerIGN });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      console.log('Delete operation completed, loading state cleared');
    }
  };

  const submitPlayerResults = async (
    ign: string,
    region: string,
    device: string,
    java_username?: string,
    results?: Array<{ gamemode: GameMode; tier: TierLevel; points: number }>
  ) => {
    const startTime = Date.now();
    
    try {
      setLoading(true);
      console.log('Submitting player results:', { ign, region, device, java_username, results });
      deepSeekService.logUserAction('submit_results', 'player', { ign, region, device, resultsCount: results?.length });

      if (!ign || !ign.trim()) {
        throw new Error('IGN is required');
      }

      const deviceAllowed = ['PC', 'Mobile', 'Console'] as const;
      const regionAllowed = ['NA', 'EU', 'ASIA', 'OCE', 'SA', 'AF'] as const;

      const safeDevice = deviceAllowed.includes(device as typeof deviceAllowed[number])
        ? (device as typeof deviceAllowed[number])
        : 'PC';

      const safeRegion = regionAllowed.includes(region as typeof regionAllowed[number])
        ? (region as typeof regionAllowed[number])
        : 'NA';

      // Auto-fill java_username with "itzrealme" if not provided
      const finalJavaUsername = java_username && java_username.trim() 
        ? java_username.trim() 
        : "itzrealme";

      const playerInsertObj = {
        ign: ign.trim(),
        region: safeRegion,
        device: safeDevice,
        java_username: finalJavaUsername
      };

      console.log('Upserting player:', playerInsertObj);
      deepSeekService.logDatabaseOperation('UPSERT', 'players', playerInsertObj);

      const { data: playerData, error: playerUpsertError } = await supabase
        .from('players')
        .upsert(playerInsertObj, { onConflict: 'ign' })
        .select()
        .single();

      if (playerUpsertError) {
        console.error('Player upsert error:', playerUpsertError);
        deepSeekService.logDatabaseOperation('UPSERT', 'players', playerInsertObj, null, playerUpsertError);
        throw new Error(`Failed to upsert player: ${playerUpsertError.message}`);
      }

      if (!playerData) {
        throw new Error('No player data returned from upsert');
      }

      console.log('Player upserted successfully:', playerData);
      deepSeekService.logDatabaseOperation('UPSERT', 'players', playerInsertObj, { data: playerData });
      const playerId = playerData.id;

      if (results && results.length > 0) {
        console.log('Processing gamemode results:', results);
        
        for (const result of results) {
          const { gamemode, tier } = result;
          if (tier !== 'Not Ranked') {
            console.log(`Upserting gamemode score: ${gamemode} - ${tier}`);
            
            const gamemodeData = { 
              player_id: playerId, 
              gamemode, 
              display_tier: tier,
              internal_tier: tier,
              score: 0
            };
            
            deepSeekService.logDatabaseOperation('UPSERT', 'gamemode_scores', gamemodeData);
            
            const { error: gamemodeUpsertError } = await supabase
              .from('gamemode_scores')
              .upsert(gamemodeData, { onConflict: 'player_id,gamemode' });

            if (gamemodeUpsertError) {
              console.error(`Gamemode ${gamemode} upsert error:`, gamemodeUpsertError);
              deepSeekService.logDatabaseOperation('UPSERT', 'gamemode_scores', gamemodeData, null, gamemodeUpsertError);
              throw new Error(`Failed to upsert gamemode ${gamemode}: ${gamemodeUpsertError.message}`);
            }
            
            deepSeekService.logDatabaseOperation('UPSERT', 'gamemode_scores', gamemodeData, { success: true });
          }
        }
        
        console.log('Updating global points for player:', playerId);
        await updatePlayerGlobalPoints(playerId);
      }

      const duration = Date.now() - startTime;
      deepSeekService.logApiCall('POST', '/admin/submit-results', { ign, resultsCount: results?.length }, { success: true }, null, duration);

      toast({
        title: "Success",
        description: `Player ${ign} results submitted successfully. Global points calculated automatically.`,
      });

      // Refresh players list to show updated data
      await refreshPlayers();

      return { success: true, player: playerData };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('Submission error:', error);
      setError(error.message);
      deepSeekService.logError(error, { operation: 'submitPlayerResults', ign });
      deepSeekService.logApiCall('POST', '/admin/submit-results', { ign }, null, error, duration);
      toast({
        title: "Error",
        description: `Failed to submit player results: ${error.message}`,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    players,
    loading,
    error,
    submitPlayerResults,
    updatePlayerTier,
    refreshPlayers,
    deletePlayer,
    findPlayerByIGN
  };
};
