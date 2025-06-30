
import { useQuery } from '@tanstack/react-query';
import { getLeaderboard, Player } from '@/services/playerService';

export function useLeaderboard() {
  const { data: players = [], isLoading: loading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      try {
        const data = await getLeaderboard();
        return data;
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        throw new Error(err.message || 'Failed to load leaderboard');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - increased for mobile performance
    gcTime: 20 * 60 * 1000, // 20 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false, // Disable automatic refetching
    refetchOnReconnect: false, // Disable refetch on reconnect
  });
  
  return { players, loading, error: error ? (error as Error).message : null };
}
