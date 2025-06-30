
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, UserPlus, Trash2, Shield, ShieldOff, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id: string;
  ign: string;
  java_username?: string;
  uuid?: string;
  avatar_url?: string;
  region?: string;
  device?: string;
  global_points: number;
  overall_rank?: number;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    ign: '',
    java_username: '',
    region: '',
    device: ''
  });
  const { toast } = useToast();

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('overall_rank', { ascending: true });

      if (error) throw error;

      setPlayers(data || []);
    } catch (error: any) {
      toast({
        title: "Fetch Failed",
        description: `Failed to fetch players: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAddPlayer = async () => {
    if (!newPlayer.ign.trim()) {
      toast({
        title: "Validation Error",
        description: "Player IGN is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const playerData: any = {
        ign: newPlayer.ign.trim(),
        global_points: 0,
        banned: false
      };

      if (newPlayer.java_username.trim()) {
        playerData.java_username = newPlayer.java_username.trim();
      }
      if (newPlayer.region.trim()) {
        playerData.region = newPlayer.region.trim();
      }
      if (newPlayer.device.trim()) {
        playerData.device = newPlayer.device.trim();
      }

      const { error } = await supabase
        .from('players')
        .insert(playerData);

      if (error) throw error;

      await fetchPlayers();
      setIsAddDialogOpen(false);
      setNewPlayer({ ign: '', java_username: '', region: '', device: '' });
      
      toast({
        title: "Player Added",
        description: `Player ${newPlayer.ign} has been added successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Add Failed",
        description: `Failed to add player: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      await fetchPlayers();
      toast({
        title: "Player Deleted",
        description: "Player has been removed from the system.",
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: `Failed to delete player: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBan = async (playerId: string, currentBanned: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('players')
        .update({ 
          banned: !currentBanned
        })
        .eq('id', playerId);

      if (error) throw error;

      await fetchPlayers();
      toast({
        title: currentBanned ? "Player Unbanned" : "Player Banned",
        description: `Player has been ${currentBanned ? 'unbanned' : 'banned'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Ban Toggle Failed",
        description: `Failed to ${currentBanned ? 'unban' : 'ban'} player: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.ign?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg border border-blue-500/30">
          <Users className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">User Management</h3>
          <p className="text-gray-400 text-sm">Manage player accounts and moderation</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search players by IGN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-400 pl-10 focus:border-blue-500/50 focus:ring-blue-500/20"
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30 hover:border-green-400/60 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-green-400" />
                <span>Add New Player</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ign" className="text-gray-300 font-medium">IGN (Required)</Label>
                <Input
                  id="ign"
                  value={newPlayer.ign}
                  onChange={(e) => setNewPlayer({ ...newPlayer, ign: e.target.value })}
                  placeholder="Enter player IGN"
                  className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-green-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="java_username" className="text-gray-300 font-medium">Java Username</Label>
                <Input
                  id="java_username"
                  value={newPlayer.java_username}
                  onChange={(e) => setNewPlayer({ ...newPlayer, java_username: e.target.value })}
                  placeholder="Enter Java username"
                  className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-green-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region" className="text-gray-300 font-medium">Region</Label>
                <Input
                  id="region"
                  value={newPlayer.region}
                  onChange={(e) => setNewPlayer({ ...newPlayer, region: e.target.value })}
                  placeholder="Enter region"
                  className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-green-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device" className="text-gray-300 font-medium">Device</Label>
                <Input
                  id="device"
                  value={newPlayer.device}
                  onChange={(e) => setNewPlayer({ ...newPlayer, device: e.target.value })}
                  placeholder="Enter device type"
                  className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-green-500/20"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddPlayer}
                  disabled={isLoading}
                  className="flex-1 bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30 hover:border-green-400/60"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
                <Button
                  onClick={() => setIsAddDialogOpen(false)}
                  variant="outline"
                  className="flex-1 border-gray-600/50 text-gray-300 hover:bg-gray-800/60 hover:border-gray-500/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Players List */}
      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span>Players ({filteredPlayers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPlayers.map((player) => (
              <div 
                key={player.id} 
                className="group flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/40 hover:border-gray-600/50 transition-all duration-300 hover:bg-gray-800/60"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {player.ign || 'Unknown Player'}
                    </p>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      <span>Rank: #{player.overall_rank || 'Unranked'}</span>
                      <span>•</span>
                      <span>{player.global_points || 0} points</span>
                      {player.banned && (
                        <>
                          <span>•</span>
                          <span className="text-red-400 font-medium">BANNED</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button
                    onClick={() => handleToggleBan(player.id, player.banned)}
                    disabled={isLoading}
                    className={`${
                      player.banned
                        ? 'bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30 hover:border-green-400/60'
                        : 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-600/30 hover:border-yellow-400/60'
                    } transition-all duration-200 shadow-lg`}
                    size="sm"
                  >
                    {player.banned ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <ShieldOff className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => handleDeletePlayer(player.id)}
                    disabled={isLoading}
                    className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-400/60 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredPlayers.length === 0 && (
              <div className="text-center py-12">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 inline-block">
                    <Users className="h-12 w-12 text-gray-500 mx-auto" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-400 mb-2">No Players Found</h4>
                    <p className="text-gray-500">
                      {searchTerm ? 'No players found matching your search.' : 'No players have been added yet.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
