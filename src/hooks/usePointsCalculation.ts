
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { updatePlayerGlobalPoints } from '@/services/playerService';

export function usePointsCalculation() {
  useEffect(() => {
    // Listen for changes in gamemode_scores table
    const channel = supabase
      .channel('gamemode-scores-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gamemode_scores'
        },
        async (payload) => {
          console.log('Gamemode score changed:', payload);
          
          // Type-safe payload handling
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          // Update global points for the affected player
          if (newRecord?.player_id) {
            await updatePlayerGlobalPoints(newRecord.player_id);
          } else if (oldRecord?.player_id) {
            await updatePlayerGlobalPoints(oldRecord.player_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
