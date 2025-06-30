
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, User, Globe, Smartphone, Sparkles } from 'lucide-react';
import { useAdminPanel } from '@/hooks/useAdminPanel';
import { GameMode, TierLevel } from '@/services/playerService';
import { TIER_LEVELS, REGIONS, DEVICES } from '@/lib/constants';
import { GameModeIcon } from '@/components/GameModeIcon';

interface TierRankings {
  [key: string]: TierLevel;
}

const gameModes = [
  { key: 'Crystal', name: 'Crystal', color: 'from-purple-500 to-purple-600', textColor: 'text-purple-400' },
  { key: 'Sword', name: 'Sword', color: 'from-blue-500 to-blue-600', textColor: 'text-blue-400' },
  { key: 'SMP', name: 'SMP', color: 'from-green-500 to-green-600', textColor: 'text-green-400' },
  { key: 'UHC', name: 'UHC', color: 'from-red-500 to-red-600', textColor: 'text-red-400' },
  { key: 'Axe', name: 'Axe', color: 'from-cyan-500 to-cyan-600', textColor: 'text-cyan-400' },
  { key: 'NethPot', name: 'NethPot', color: 'from-orange-500 to-orange-600', textColor: 'text-orange-400' },
  { key: 'Bedwars', name: 'Bedwars', color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-400' },
  { key: 'Mace', name: 'Mace', color: 'from-gray-500 to-gray-600', textColor: 'text-gray-400' }
];

export function SubmitResultsForm() {
  const { submitPlayerResults, loading } = useAdminPanel();
  
  const [playerData, setPlayerData] = useState({
    ign: '',
    region: 'NA' as string,
    device: 'PC' as string,
    java_username: ''
  });
  
  const [tierRankings, setTierRankings] = useState<TierRankings>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerData.ign.trim()) {
      alert('IGN is required');
      return;
    }

    const results = Object.entries(tierRankings)
      .filter(([_, tier]) => tier && tier !== 'Not Ranked')
      .map(([gamemode, tier]) => ({
        gamemode: gamemode as GameMode,
        tier: tier as TierLevel,
        points: 0
      }));

    const response = await submitPlayerResults(
      playerData.ign,
      playerData.region,
      playerData.device,
      playerData.java_username || undefined,
      results
    );

    if (response.success) {
      setPlayerData({
        ign: '',
        region: 'NA',
        device: 'PC',
        java_username: ''
      });
      setTierRankings({});
    }
  };

  const handleTierChange = (gamemode: string, tier: string) => {
    setTierRankings(prev => ({
      ...prev,
      [gamemode]: tier as TierLevel
    }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Submit Player Results
          </h2>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Add or update player tier rankings with our streamlined submission system
        </p>
      </div>

      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-2xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Player Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Player Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="ign" className="text-white font-medium flex items-center space-x-2">
                    <span>Player IGN</span>
                    <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="ign"
                    value={playerData.ign}
                    onChange={(e) => setPlayerData({...playerData, ign: e.target.value})}
                    placeholder="Enter Minecraft username"
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl h-12 transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="java_username" className="text-white font-medium">
                    Java Username 
                    <span className="text-gray-400 text-sm ml-2">(auto-fills with IGN if empty)</span>
                  </Label>
                  <Input
                    id="java_username"
                    value={playerData.java_username}
                    onChange={(e) => setPlayerData({...playerData, java_username: e.target.value})}
                    placeholder="For avatar lookup (optional)"
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-12 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="region" className="text-white font-medium flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Region</span>
                    <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={playerData.region}
                    onValueChange={(value) => setPlayerData({...playerData, region: value})}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white h-12 rounded-xl focus:border-green-500 focus:ring-green-500/20">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 rounded-xl">
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="device" className="text-white font-medium flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Device</span>
                  </Label>
                  <Select
                    value={playerData.device}
                    onValueChange={(value) => setPlayerData({...playerData, device: value})}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20">
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 rounded-xl">
                      {DEVICES.map((device) => (
                        <SelectItem key={device} value={device} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          {device}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tier Rankings Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Tier Rankings</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {gameModes.map((mode) => (
                  <div key={mode.key} className="group">
                    <div className="space-y-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <GameModeIcon mode={mode.key.toLowerCase()} className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm ${mode.textColor} truncate`}>
                            {mode.name}
                          </h4>
                        </div>
                      </div>
                      
                      <Select
                        value={tierRankings[mode.key] || 'Not Ranked'}
                        onValueChange={(value) => handleTierChange(mode.key, value)}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white h-10 rounded-lg hover:bg-gray-700/70 transition-all duration-300 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 rounded-xl">
                          {TIER_LEVELS.map((tier) => (
                            <SelectItem 
                              key={tier} 
                              value={tier} 
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              {tier}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Trophy className="h-6 w-6 mr-3" />
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting Results...</span>
                  </div>
                ) : (
                  'Submit Player Results'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
