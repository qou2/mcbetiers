
import { useQuery } from '@tanstack/react-query';
import { getPlayersByTierAndGamemode, GameMode, Player, TierLevel } from '@/services/playerService';

export function useGamemodeTiers(gamemode: GameMode) {
  const { 
    data: tierData = {
      'HT1': [], 'LT1': [],
      'HT2': [], 'LT2': [],
      'HT3': [], 'LT3': [],
      'HT4': [], 'LT4': [],
      'HT5': [], 'LT5': [],
      'Retired': []
    }, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['tierData', gamemode],
    queryFn: async () => {
      try {
        const data = await getPlayersByTierAndGamemode(gamemode);
        return data;
      } catch (err: any) {
        console.error(`Error fetching ${gamemode} tier data:`, err);
        throw new Error(err.message || 'Failed to load tier data');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - increased for mobile performance
    gcTime: 20 * 60 * 1000, // 20 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false, // Disable automatic refetching
    refetchOnReconnect: false, // Disable refetch on reconnect
  });
  
  return { tierData, loading, error: error ? (error as Error).message : null };
}
