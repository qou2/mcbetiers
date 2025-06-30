
import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { searchPlayers, Player } from '@/services/playerService';

export function usePlayerSearch() {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce(query, 800); // Increased debounce for mobile performance
  const [results, setResults] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize the search function to prevent unnecessary re-renders
  const performSearch = useMemo(() => async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) { // Increased minimum length
      setResults([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await searchPlayers(searchQuery);
      setResults(data || []);
    } catch (err) {
      console.error('Player search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    // Skip search on mobile if query is too short to improve performance
    if (window.innerWidth <= 768 && debouncedQuery.length < 3) {
      return;
    }
    
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);
  
  return {
    query,
    setQuery,
    results,
    isLoading,
    error
  };
}
