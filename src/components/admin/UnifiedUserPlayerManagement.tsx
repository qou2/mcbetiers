
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ManagePlayersTab } from './ManagePlayersTab';
import UserManagement from './UserManagement';
import { 
  Users, 
  Search, 
  UserPlus, 
  Trash2, 
  Shield, 
  ShieldOff, 
  User,
  UserCheck,
  Crown,
  Award
} from 'lucide-react';
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

const UnifiedUserPlayerManagement = () => {
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

  const topPlayers = filteredPlayers.slice(0, 10);
  const bannedPlayers = filteredPlayers.filter(player => player.banned);
  const recentPlayers = filteredPlayers.slice(-10).reverse();

  const PlayerCard = ({ player, showRank = true }: { player: Player; showRank?: boolean }) => (
    <div className="group flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/40 hover:border-gray-600/50 transition-all duration-300 hover:bg-gray-800/60">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
          {player.overall_rank && player.overall_rank <= 3 ? (
            <Crown className="h-4 w-4 text-yellow-400" />
          ) : (
            <User className="h-4 w-4 text-blue-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate text-sm">
            {player.ign || 'Unknown Player'}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            {showRank && <span>#{player.overall_rank || 'Unranked'}</span>}
            {showRank && <span>•</span>}
            <span>{player.global_points || 0} pts</span>
            {player.banned && (
              <>
                <span>•</span>
                <span className="text-red-400 font-medium">BANNED</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 flex-shrink-0">
        <Button
          onClick={() => handleToggleBan(player.id, player.banned)}
          disabled={isLoading}
          className={`${
            player.banned
              ? 'bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30'
              : 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-600/30'
          } transition-all duration-200`}
          size="sm"
        >
          {player.banned ? (
            <Shield className="h-3 w-3" />
          ) : (
            <ShieldOff className="h-3 w-3" />
          )}
        </Button>
        
        <Button
          onClick={() => handleDeletePlayer(player.id)}
          disabled={isLoading}
          className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 transition-all duration-200"
          size="sm"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30">
          <Users className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">User & Player Management</h3>
          <p className="text-gray-400 text-sm">Unified player accounts and user moderation</p>
        </div>
      </div>

      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Management Console</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="players" className="text-xs md:text-sm">
                <Users className="h-4 w-4 mr-1 md:mr-2" />
                <span>Players</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs md:text-sm">
                <Shield className="h-4 w-4 mr-1 md:mr-2" />
                <span>Users</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="players" className="mt-4">
              <ManagePlayersTab />
            </TabsContent>
            
            <TabsContent value="users" className="mt-4">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedUserPlayerManagement;
