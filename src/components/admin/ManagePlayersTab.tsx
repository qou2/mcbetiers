import React, { useEffect, useState } from 'react';
import { Player, GameMode, TierLevel } from '@/services/playerService';
import { useAdminPanel } from '@/hooks/useAdminPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Search, Edit, Save, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GAME_MODES, TIER_LEVELS } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

interface EditingPlayer {
  playerId: string;
  field: 'ign' | 'java_username';
  value: string;
}

export function ManagePlayersTab() {
  const {
    players,
    loading,
    error,
    updatePlayerTier,
    refreshPlayers,
    deletePlayer
  } = useAdminPanel();

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGamemode, setEditingGamemode] = useState<{
    playerId: string;
    gamemode: GameMode;
    currentTier: TierLevel;
  } | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<EditingPlayer | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingPlayer, setIsUpdatingPlayer] = useState(false);

  useEffect(() => {
    console.log('ManagePlayersTab mounted, loading initial players...');
    refreshPlayers();
  }, []);

  const filteredPlayers = players.filter(player =>
    player.ign.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.java_username && player.java_username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUpdatePlayerInfo = async (playerId: string, field: 'ign' | 'java_username', newValue: string) => {
    if (!newValue.trim()) {
      toast({
        title: "Invalid Value",
        description: `${field === 'ign' ? 'IGN' : 'Java Username'} cannot be empty`,
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingPlayer(true);
    
    try {
      console.log(`Updating player ${playerId} ${field} to: ${newValue}`);
      
      const updateData = { [field]: newValue.trim() };
      
      const { error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', playerId);

      if (error) {
        console.error('Error updating player info:', error);
        toast({
          title: "Update Failed",
          description: `Failed to update ${field === 'ign' ? 'IGN' : 'Java Username'}: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `${field === 'ign' ? 'IGN' : 'Java Username'} updated successfully`,
      });

      // Refresh players to show updated data
      await handleRefresh();
      setEditingPlayer(null);
      
    } catch (error: any) {
      console.error('Exception updating player info:', error);
      toast({
        title: "Update Error",
        description: `Failed to update ${field === 'ign' ? 'IGN' : 'Java Username'}: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPlayer(false);
    }
  };

  const handleDeletePlayer = async (playerId: string, playerIGN: string) => {
    console.log(`Delete button clicked for player: ${playerId} (${playerIGN})`);
    
    if (window.confirm(`Are you sure you want to delete player "${playerIGN}"? This action cannot be undone.`)) {
      setIsDeleting(playerId);
      
      try {
        console.log(`Starting deletion process for player: ${playerId} (${playerIGN})`);
        
        const result = await deletePlayer(playerId);
        console.log('Delete result:', result);
        
        if (result?.success) {
          console.log(`Player ${playerIGN} deleted successfully, refreshing list...`);
          
          toast({
            title: "Player Deleted",
            description: `Player "${playerIGN}" has been successfully deleted.`,
          });
          
          // Force a complete refresh to ensure UI is updated
          console.log('Forcing complete refresh after deletion...');
          await handleRefresh();
          
          console.log(`Current players count after deletion: ${players.length}`);
        } else {
          console.error('Delete failed:', result?.error);
          toast({
            title: "Delete Failed",
            description: result?.error || "Failed to delete player",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Exception during delete operation:', error);
        toast({
          title: "Delete Error",
          description: "An unexpected error occurred while deleting the player",
          variant: "destructive"
        });
      } finally {
        setIsDeleting(null);
        console.log('Delete operation completed, clearing loading state');
      }
    } else {
      console.log('User cancelled deletion');
    }
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    setIsRefreshing(true);
    
    try {
      console.log('Calling refreshPlayers...');
      await refreshPlayers();
      console.log(`Players refreshed successfully. Current count: ${players.length}`);
      
      toast({
        title: "Data Refreshed",
        description: "Player data has been updated successfully.",
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh player data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
      console.log('Refresh operation completed');
    }
  };

  const handleUpdateTier = async (playerId: string, gamemode: GameMode, newTier: TierLevel) => {
    const result = await updatePlayerTier(playerId, gamemode, newTier);
    if (result?.success) {
      setEditingGamemode(null);
      await handleRefresh();
    }
  };

  const getPlayerTier = (player: Player, gamemode: GameMode): TierLevel => {
    // Find the tier for this gamemode from the player's tier assignments
    const tierAssignment = player.tierAssignments?.find(assignment => assignment.gamemode === gamemode);
    return tierAssignment?.tier || 'Not Ranked';
  };

  const renderEditableCell = (value: string, playerId: string, field: 'ign' | 'java_username') => {
    const isEditing = editingPlayer?.playerId === playerId && editingPlayer?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={editingPlayer.value}
            onChange={(e) => setEditingPlayer({ ...editingPlayer, value: e.target.value })}
            className="h-6 text-xs bg-gray-700 border-gray-600 text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUpdatePlayerInfo(playerId, field, editingPlayer.value);
              } else if (e.key === 'Escape') {
                setEditingPlayer(null);
              }
            }}
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-green-400 hover:bg-green-400/20"
            onClick={() => handleUpdatePlayerInfo(playerId, field, editingPlayer.value)}
            disabled={isUpdatingPlayer}
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-400 hover:bg-red-400/20"
            onClick={() => setEditingPlayer(null)}
            disabled={isUpdatingPlayer}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div 
        className="flex items-center gap-1 cursor-pointer hover:bg-gray-700/50 rounded px-1 group"
        onClick={() => setEditingPlayer({ playerId, field, value: value || '' })}
      >
        <span className="text-white">{value || (field === 'java_username' ? 'N/A' : '')}</span>
        <Edit className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  if (loading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-white">Loading players...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        <p>Error: {error}</p>
        <Button onClick={handleRefresh} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  console.log(`Rendering ManagePlayersTab with ${players.length} total players, ${filteredPlayers.length} filtered`);

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Player Management</CardTitle>
          <CardDescription className="text-gray-400">
            Manage player accounts, tiers, and information. Click on IGN or Java Username to edit. Search works with Enter key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search players by IGN or Java username... (Press Enter to search)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      console.log('Search triggered for:', searchTerm);
                    }
                  }}
                  className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                />
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            {/* Players Table */}
            <div className="rounded-md border border-gray-700/50 bg-gray-800/30">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50 hover:bg-gray-800/50">
                    <TableHead className="text-gray-300">Global Rank</TableHead>
                    <TableHead className="text-gray-300">IGN</TableHead>
                    <TableHead className="text-gray-300">Java Username</TableHead>
                    <TableHead className="text-gray-300">Region</TableHead>
                    <TableHead className="text-gray-300">Device</TableHead>
                    <TableHead className="text-gray-300">Global Points</TableHead>
                    <TableHead className="text-gray-300">Gamemode Tiers</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.id} className="border-gray-700/50 hover:bg-gray-800/30">
                      <TableCell className="font-medium">
                        <span className="text-white">#{player.overall_rank || 'N/A'}</span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {renderEditableCell(player.ign, player.id, 'ign')}
                      </TableCell>
                      <TableCell>
                        {renderEditableCell(player.java_username || '', player.id, 'java_username')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">{player.region}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-700 text-gray-300">{player.device}</Badge>
                      </TableCell>
                      <TableCell className="text-white">{player.global_points || 0}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {GAME_MODES.map((gamemode) => {
                            const isEditing = editingGamemode?.playerId === player.id && 
                                            editingGamemode?.gamemode === gamemode;
                            const currentTier = getPlayerTier(player, gamemode);
                            
                            return (
                              <div key={gamemode} className="flex items-center gap-1">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <Select
                                      value={editingGamemode.currentTier}
                                      onValueChange={(value) => 
                                        setEditingGamemode({
                                          ...editingGamemode,
                                          currentTier: value as TierLevel
                                        })
                                      }
                                    >
                                      <SelectTrigger className="w-20 h-6 text-xs bg-gray-700 border-gray-600 text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-gray-800 border-gray-600">
                                        {TIER_LEVELS.filter(tier => tier !== 'Not Ranked').map((tier) => (
                                          <SelectItem key={tier} value={tier} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                            {tier}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-green-400 hover:bg-green-400/20"
                                      onClick={() => handleUpdateTier(
                                        player.id, 
                                        gamemode, 
                                        editingGamemode.currentTier
                                      )}
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-red-400 hover:bg-red-400/20"
                                      onClick={() => setEditingGamemode(null)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-xs cursor-pointer hover:bg-gray-700 border-gray-600 text-gray-300"
                                    onClick={() => setEditingGamemode({
                                      playerId: player.id,
                                      gamemode,
                                      currentTier: currentTier !== 'Not Ranked' ? currentTier : 'HT1'
                                    })}
                                  >
                                    {gamemode}: {currentTier}
                                    <Edit className="h-2 w-2 ml-1" />
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isDeleting === player.id}
                          className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 disabled:opacity-50"
                          onClick={() => handleDeletePlayer(player.id, player.ign)}
                        >
                          {isDeleting === player.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPlayers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? 'No players found matching your search' : 'No players found'}
              </div>
            )}

            {/* Debug Info */}
            <div className="text-xs text-gray-500 mt-4">
              Total players: {players.length} | Filtered: {filteredPlayers.length}
              {isDeleting && (
                <span className="ml-2 text-red-400">Deleting player: {isDeleting}</span>
              )}
              {isUpdatingPlayer && (
                <span className="ml-2 text-blue-400">Updating player info...</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
