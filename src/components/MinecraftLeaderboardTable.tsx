
import React from 'react';
import { Player } from '@/services/playerService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { GameModeIcon } from './GameModeIcon';
import { Monitor, Smartphone, Gamepad, Crown, Trophy, Medal } from 'lucide-react';
import { getPlayerRank } from '@/utils/rankUtils';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import CombatBadge from './CombatBadge';

interface MinecraftLeaderboardTableProps {
  players: Player[];
  onPlayerClick: (player: Player) => void;
}

const getDeviceIcon = (device: string = 'PC') => {
  const iconProps = "w-3 h-3";
  switch(device?.toLowerCase()) {
    case 'mobile':
    case 'bedrock':
      return <Smartphone className={`${iconProps} text-blue-400`} />;
    case 'console':
      return <Gamepad className={`${iconProps} text-green-400`} />;
    case 'pc':
    case 'java':
    default:
      return <Monitor className={`${iconProps} text-white/90`} />;
  }
};

const getRegionStyling = (regionCode: string = 'NA') => {
  const regions: Record<string, { 
    bgGradient: string;
    textColor: string;
  }> = {
    'NA': { 
      bgGradient: 'bg-emerald-500',
      textColor: 'text-white'
    },
    'EU': { 
      bgGradient: 'bg-purple-500',
      textColor: 'text-white'
    },
    'ASIA': { 
      bgGradient: 'bg-red-500',
      textColor: 'text-white'
    },
    'SA': { 
      bgGradient: 'bg-orange-500',
      textColor: 'text-white'
    },
    'AF': { 
      bgGradient: 'bg-fuchsia-500',
      textColor: 'text-white'
    },
    'OCE': { 
      bgGradient: 'bg-teal-500',
      textColor: 'text-white'
    }
  };
  
  return regions[regionCode] || regions['NA'];
};

const getEnhancedRankBadge = (position: number) => {
  if (position === 1) {
    return {
      icon: <Crown className="w-6 h-6 text-yellow-200" />,
      gradient: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500',
      text: 'text-yellow-900',
      border: 'border-4 border-yellow-200/60 shadow-lg shadow-yellow-400/40',
      size: 'w-16 h-16',
      textSize: 'text-xl font-black',
      number: position
    };
  } else if (position === 2) {
    return {
      icon: <Trophy className="w-5 h-5 text-gray-100" />,
      gradient: 'bg-gradient-to-br from-gray-200 via-gray-300 to-slate-400',
      text: 'text-gray-900',
      border: 'border-4 border-gray-200/60 shadow-lg shadow-gray-400/40',
      size: 'w-14 h-14',
      textSize: 'text-lg font-bold',
      number: position
    };
  } else if (position === 3) {
    return {
      icon: <Medal className="w-4 h-4 text-orange-100" />,
      gradient: 'bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600',
      text: 'text-orange-900',
      border: 'border-4 border-orange-200/60 shadow-lg shadow-orange-500/40',
      size: 'w-12 h-12',
      textSize: 'text-base font-bold',
      number: position
    };
  } else {
    return {
      icon: null,
      gradient: 'bg-gray-600',
      text: 'text-white',
      border: '',
      size: 'w-10 h-10',
      textSize: 'text-sm font-medium',
      number: position
    };
  }
};

export const MinecraftLeaderboardTable: React.FC<MinecraftLeaderboardTableProps> = ({
  players,
  onPlayerClick,
}) => {
  const isMobile = useIsMobile();

  const getTierBadgeColor = (tier: string) => {
    const tierStyles = {
      'HT1': 'bg-yellow-500 text-black',
      'HT2': 'bg-orange-500 text-white',
      'HT3': 'bg-red-500 text-white',
      'LT1': 'bg-green-500 text-white',
      'LT2': 'bg-blue-500 text-white',
      'LT3': 'bg-purple-500 text-white'
    };
    
    for (const [key, style] of Object.entries(tierStyles)) {
      if (tier.includes(key)) return style;
    }
    return 'bg-gray-500 text-white';
  };

  const getPlayerTierForGamemode = (player: Player, gamemode: string): string => {
    if (!player.tierAssignments) return 'Not Ranked';
    
    const assignment = player.tierAssignments.find(
      t => t.gamemode.toLowerCase() === gamemode.toLowerCase()
    );
    
    return assignment?.tier || 'Not Ranked';
  };

  const handlePlayerRowClick = (player: Player) => {
    onPlayerClick(player);
  };

  if (isMobile) {
    return (
      <div className="w-full space-y-4">
        {players.map((player, index) => {
          const playerPoints = player.global_points || 0;
          const rankInfo = getPlayerRank(playerPoints);
          const regionStyle = getRegionStyling(player.region);
          const rankBadge = getEnhancedRankBadge(index + 1);
          const isTopThree = index < 3;
          
          return (
            <div
              key={player.id}
              className={`relative w-full rounded-xl p-6 border cursor-pointer transform-none ${
                isTopThree 
                  ? 'bg-gradient-to-r from-dark-surface/95 via-dark-surface/90 to-dark-surface/95 border-white/40 shadow-xl backdrop-blur-sm' 
                  : 'bg-dark-surface/70 border-white/20'
              } ${isTopThree ? 'ring-2 ring-white/20' : ''}`}
              onClick={() => handlePlayerRowClick(player)}
            >
              {/* Top 3 Enhanced Background Effect */}
              {isTopThree && (
                <div className="absolute inset-0 rounded-xl opacity-10 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className={`
                  ${rankBadge.size} flex items-center justify-center rounded-2xl relative
                  ${rankBadge.gradient} ${rankBadge.text} ${rankBadge.border}
                  transition-all duration-300 hover:scale-105
                `}>
                  {rankBadge.icon ? (
                    <div className="flex flex-col items-center justify-center">
                      {rankBadge.icon}
                      <span className="text-xs font-bold mt-0.5">{rankBadge.number}</span>
                    </div>
                  ) : (
                    <span className={rankBadge.textSize}>{rankBadge.number}</span>
                  )}
                </div>

                <Avatar className={`border-4 ${isTopThree ? 'w-16 h-16 border-white/50' : 'w-12 h-12 border-white/30'} ${isTopThree ? 'shadow-lg' : ''}`}>
                  <AvatarImage 
                    src={player.avatar_url || getAvatarUrl(player.ign, player.java_username)}
                    alt={player.ign}
                    onError={(e) => handleAvatarError(e, player.ign, player.java_username)}
                  />
                  <AvatarFallback className="bg-gray-700 text-white text-lg font-bold">
                    {player.ign.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getDeviceIcon(player.device)}
                    <span className={`font-bold text-white ${isTopThree ? 'text-xl' : 'text-lg'} truncate`}>
                      {player.ign}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <CombatBadge points={playerPoints} className={isTopThree ? 'scale-110' : 'scale-100'} enhanced={isTopThree} />
                    <span className="text-white/70 font-semibold">({playerPoints} pts)</span>
                  </div>
                </div>

                <span className={`
                  px-3 py-2 rounded-full text-sm font-bold
                  ${regionStyle.bgGradient} ${regionStyle.textColor} shadow-lg
                `}>
                  {player.region || 'NA'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/20">
                {[
                  { mode: 'bridge', gamemode: 'Bridge' },
                  { mode: 'skywars', gamemode: 'Skywars' },
                  { mode: 'crystal', gamemode: 'Crystal' },
                  { mode: 'midfight', gamemode: 'Midfight' },
                  { mode: 'uhc', gamemode: 'UHC' },
                  { mode: 'nodebuff', gamemode: 'Nodebuff' },
                  { mode: 'bedfight', gamemode: 'Bedfight' },
                  { mode: 'sumo', gamemode: 'Sumo' }
                ].map(({ mode, gamemode }) => {
                  const tier = getPlayerTierForGamemode(player, gamemode);
                  
                  return (
                    <div 
                      key={mode} 
                      className="flex flex-col items-center"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-700/80 border border-gray-500/30 flex items-center justify-center mb-1 shadow-sm">
                        <GameModeIcon mode={mode} className="w-4 h-4" />
                      </div>
                      <div className={`px-1.5 py-0.5 rounded text-xs font-bold ${getTierBadgeColor(tier)} min-w-[24px] text-center shadow-sm`}>
                        {tier === 'Not Ranked' ? 'NR' : tier}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full bg-dark-surface/60 rounded-2xl overflow-hidden border border-white/30 shadow-2xl backdrop-blur-sm">
      <div className="grid grid-cols-12 gap-6 px-8 py-6 text-base font-bold text-white/90 border-b border-white/20 bg-dark-surface/80">
        <div className="col-span-1 text-center">RANK</div>
        <div className="col-span-4">PLAYER</div>
        <div className="col-span-2 text-center">REGION</div>
        <div className="col-span-5 text-center">TIERS</div>
      </div>

      <div className="divide-y divide-white/10">
        {players.map((player, index) => {
          const playerPoints = player.global_points || 0;
          const rankInfo = getPlayerRank(playerPoints);
          const regionStyle = getRegionStyling(player.region);
          const rankBadge = getEnhancedRankBadge(index + 1);
          const isTopThree = index < 3;
          
          return (
            <div
              key={player.id}
              className={`grid grid-cols-12 gap-6 px-8 py-8 cursor-pointer transform-none relative ${
                isTopThree 
                  ? 'bg-gradient-to-r from-dark-surface/95 via-dark-surface/85 to-dark-surface/95 hover:from-dark-surface/100 hover:via-dark-surface/90 hover:to-dark-surface/100 ring-1 ring-white/20' 
                  : 'hover:bg-white/5'
              }`}
              onClick={() => handlePlayerRowClick(player)}
            >
              {/* Enhanced background for top 3 */}
              {isTopThree && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent pointer-events-none" />
              )}

              <div className="col-span-1 flex items-center justify-center">
                <div className={`
                  ${rankBadge.size} flex items-center justify-center rounded-2xl relative
                  ${rankBadge.gradient} ${rankBadge.text} ${rankBadge.border}
                  transition-all duration-300 hover:scale-110
                `}>
                  {rankBadge.icon ? (
                    <div className="flex flex-col items-center justify-center">
                      {rankBadge.icon}
                      <span className="text-xs font-bold mt-0.5">{rankBadge.number}</span>
                    </div>
                  ) : (
                    <span className={rankBadge.textSize}>{rankBadge.number}</span>
                  )}
                </div>
              </div>

              <div className="col-span-4 flex items-center gap-6">
                <Avatar className={`border-4 ${isTopThree ? 'w-20 h-20 border-white/50 shadow-xl' : 'w-16 h-16 border-white/30'}`}>
                  <AvatarImage 
                    src={player.avatar_url || getAvatarUrl(player.ign, player.java_username)}
                    alt={player.ign}
                    onError={(e) => handleAvatarError(e, player.ign, player.java_username)}
                  />
                  <AvatarFallback className="bg-gray-700 text-white text-xl font-bold">
                    {player.ign.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-4 mb-2">
                    {getDeviceIcon(player.device)}
                    <span className={`text-white font-bold ${isTopThree ? 'text-2xl' : 'text-xl'}`}>
                      {player.ign}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <CombatBadge points={playerPoints} className={isTopThree ? 'scale-125' : 'scale-110'} enhanced={isTopThree} />
                    <span className="text-white/70 text-base font-semibold">({playerPoints} points)</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <span className={`
                  px-5 py-3 rounded-full text-base font-bold shadow-lg
                  ${regionStyle.bgGradient} ${regionStyle.textColor}
                `}>
                  {player.region || 'NA'}
                </span>
              </div>

              <div className="col-span-5 flex items-center justify-center">
                <div className="flex items-center gap-5">
                  {[
                  { mode: 'bridge', gamemode: 'Bridge' },
                  { mode: 'skywars', gamemode: 'Skywars' },
                  { mode: 'crystal', gamemode: 'Crystal' },
                  { mode: 'midfight', gamemode: 'Midfight' },
                  { mode: 'uhc', gamemode: 'UHC' },
                  { mode: 'nodebuff', gamemode: 'Nodebuff' },
                  { mode: 'bedfight', gamemode: 'Bedfight' },
                  { mode: 'sumo', gamemode: 'Sumo' }
                  ].map(({ mode, gamemode }) => {
                    const tier = getPlayerTierForGamemode(player, gamemode);
                    
                    return (
                      <div 
                        key={mode} 
                        className="flex flex-col items-center"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-700/80 border border-gray-500/30 flex items-center justify-center mb-2 shadow-lg">
                          <GameModeIcon mode={mode} className="w-6 h-6" />
                        </div>
                        <div className={`px-3 py-1 rounded-md text-sm font-bold ${getTierBadgeColor(tier)} min-w-[40px] text-center shadow-md`}>
                          {tier === 'Not Ranked' ? 'NR' : tier}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
