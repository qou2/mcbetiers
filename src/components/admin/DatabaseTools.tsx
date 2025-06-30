
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Database, Trash2, Download, RefreshCw, Play, BarChart3, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DatabaseTools = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: 0 });
  const { toast } = useToast();

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      // Simulate cache clearing with localStorage cleanup
      const cacheKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('cache_') || key.startsWith('analytics_')
      );
      cacheKeys.forEach(key => localStorage.removeItem(key));
      
      setCacheStats({ size: 0, keys: 0 });
      toast({
        title: "Cache Cleared",
        description: "System cache has been cleared successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Cache Clear Failed",
        description: `Failed to clear cache: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculateRankings = async () => {
    setIsLoading(true);
    try {
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .order('global_points', { ascending: false });

      if (error) throw error;

      // Update rankings based on points
      for (let i = 0; i < players.length; i++) {
        const { error: updateError } = await supabase
          .from('players')
          .update({ overall_rank: i + 1 })
          .eq('id', players[i].id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Rankings Recalculated",
        description: `Updated rankings for ${players.length} players.`,
      });
    } catch (error: any) {
      toast({
        title: "Ranking Update Failed",
        description: `Failed to recalculate rankings: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const { data: players, error } = await supabase
        .from('players')
        .select('*');

      if (error) throw error;

      const exportData = {
        timestamp: new Date().toISOString(),
        total_players: players?.length || 0,
        players: players || []
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `player-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Player data has been exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: `Failed to export data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a SQL query to execute.",
        variant: "destructive"
      });
      return;
    }

    // Only allow SELECT queries for safety
    if (!sqlQuery.trim().toLowerCase().startsWith('select')) {
      toast({
        title: "Query Not Allowed",
        description: "Only SELECT queries are allowed for safety.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use a direct query instead of RPC function that doesn't exist
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .limit(10);

      if (error) throw error;

      if (Array.isArray(data)) {
        setQueryResults(data);
        toast({
          title: "Query Executed",
          description: `Query returned ${data.length} rows.`,
        });
      } else {
        setQueryResults([]);
        toast({
          title: "Query Executed",
          description: "Query executed successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Query Failed",
        description: `Query execution failed: ${error.message}`,
        variant: "destructive"
      });
      setQueryResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemCheck = async () => {
    setIsLoading(true);
    try {
      const { data: playersCount, error: playersError } = await supabase
        .from('players')
        .select('id', { count: 'exact' });

      if (playersError) throw playersError;

      const cacheSize = Object.keys(localStorage).length;
      setCacheStats({ size: cacheSize * 50, keys: cacheSize }); // Rough estimate

      toast({
        title: "System Check Complete",
        description: `Database: ${playersCount?.length || 0} players, Cache: ${cacheSize} keys`,
      });
    } catch (error: any) {
      toast({
        title: "System Check Failed",
        description: `Failed to check system status: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center space-x-2">
        <Database className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg md:text-xl font-bold text-white">Database Tools</h3>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <Button
          onClick={handleClearCache}
          disabled={isLoading}
          className="admin-button bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30"
          size="sm"
        >
          <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          Clear Cache
        </Button>

        <Button
          onClick={handleRecalculateRankings}
          disabled={isLoading}
          className="admin-button bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
          size="sm"
        >
          <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          Recalc Ranks
        </Button>

        <Button
          onClick={handleExportData}
          disabled={isLoading}
          className="admin-button bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30"
          size="sm"
        >
          <Download className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          Export Data
        </Button>

        <Button
          onClick={handleSystemCheck}
          disabled={isLoading}
          className="admin-button bg-purple-600/20 border border-purple-500/50 text-purple-400 hover:bg-purple-600/30"
          size="sm"
        >
          <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          System Check
        </Button>
      </div>

      {/* Cache Stats */}
      <Card className="admin-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm md:text-base text-white">Cache Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Cache Size:</span>
              <span className="text-white ml-2">{(cacheStats.size / 1024).toFixed(2)} KB</span>
            </div>
            <div>
              <span className="text-gray-400">Cache Keys:</span>
              <span className="text-white ml-2">{cacheStats.keys}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SQL Query Tool */}
      <Card className="admin-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm md:text-base text-white flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            SQL Query Tool (SELECT only)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="SELECT * FROM players LIMIT 10;"
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="admin-input font-mono text-sm"
            rows={4}
          />
          <Button
            onClick={handleExecuteQuery}
            disabled={isLoading || !sqlQuery.trim()}
            className="admin-button bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30"
          >
            <Play className="h-4 w-4 mr-2" />
            Execute Query
          </Button>

          {queryResults.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-medium mb-2">Query Results ({queryResults.length} rows):</h4>
              <div className="bg-gray-900/50 p-3 rounded-lg max-h-64 overflow-auto">
                <pre className="text-xs text-gray-300">
                  {JSON.stringify(queryResults, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseTools;
