
import React from 'react';
import { Player } from '@/services/playerService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { GameModeIcon } from './GameModeIcon';
import { Monitor, Smartphone, Gamepad } from 'lucide-react';
import { getPlayerRank } from '@/utils/rankUtils';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarUtils';
import { useIsMobile } from '@/hooks/use-mobile';

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

const getRankBadgeStyle = (position: number) => {
  if (position === 1) {
    return {
      gradient: 'bg-yellow-500',
      text: 'text-black'
    };
  } else if (position === 2) {
    return {
      gradient: 'bg-gray-400',
      text: 'text-black'
    };
  } else if (position === 3) {
    return {
      gradient: 'bg-orange-600',
      text: 'text-white'
    };
  } else {
    return {
      gradient: 'bg-gray-600',
      text: 'text-white'
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
      <div className="w-full space-y-2">
        {players.map((player, index) => {
          const playerPoints = player.global_points || 0;
          const rankInfo = getPlayerRank(playerPoints);
          const regionStyle = getRegionStyling(player.region);
          const rankBadge = getRankBadgeStyle(index + 1);
          
          return (
            <div
              key={player.id}
              className="relative w-full bg-dark-surface/70 rounded-lg p-3 border border-white/20 cursor-pointer transform-none"
              onClick={() => handlePlayerRowClick(player)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`
                  w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold
                  ${rankBadge.gradient} ${rankBadge.text}
                `}>
                  {index + 1}
                </div>

                <Avatar className="w-10 h-10 border border-white/20">
                  <AvatarImage 
                    src={player.avatar_url || getAvatarUrl(player.ign, player.java_username)}
                    alt={player.ign}
                    onError={(e) => handleAvatarError(e, player.ign, player.java_username)}
                  />
                  <AvatarFallback className="bg-gray-700 text-white text-sm font-bold">
                    {player.ign.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getDeviceIcon(player.device)}
                    <span className="font-bold text-white text-sm truncate">
                      {player.ign}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-bold ${rankInfo.color}`}>
                      ◆ {rankInfo.title}
                    </span>
                    <span className="text-white/60 font-medium">({playerPoints})</span>
                  </div>
                </div>

                <span className={`
                  px-2 py-1 rounded-full text-xs font-bold
                  ${regionStyle.bgGradient} ${regionStyle.textColor}
                `}>
                  {player.region || 'NA'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-white/10">
                {[
                  { mode: 'mace', gamemode: 'Mace' },
                  { mode: 'sword', gamemode: 'Sword' },
                  { mode: 'crystal', gamemode: 'Crystal' },
                  { mode: 'axe', gamemode: 'Axe' },
                  { mode: 'uhc', gamemode: 'UHC' },
                  { mode: 'smp', gamemode: 'SMP' },
                  { mode: 'nethpot', gamemode: 'NethPot' },
                  { mode: 'bedwars', gamemode: 'Bedwars' }
                ].map(({ mode, gamemode }) => {
                  const tier = getPlayerTierForGamemode(player, gamemode);
                  
                  return (
                    <div 
                      key={mode} 
                      className="flex flex-col items-center"
                    >
                      <div className="w-6 h-6 rounded bg-gray-700/70 border border-gray-500/20 flex items-center justify-center mb-1">
                        <GameModeIcon mode={mode} className="w-3 h-3" />
                      </div>
                      <div className={`px-1 py-0.5 rounded text-xs font-bold ${getTierBadgeColor(tier)} min-w-[20px] text-center`}>
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
    <div className="w-full bg-dark-surface/50 rounded-xl overflow-hidden border border-white/20">
      <div className="grid grid-cols-12 gap-6 px-6 py-4 text-sm font-bold text-white/80 border-b border-white/10 bg-dark-surface/70">
        <div className="col-span-1"></div>
        <div className="col-span-4">PLAYER</div>
        <div className="col-span-2 text-center">REGION</div>
        <div className="col-span-5 text-center">TIERS</div>
      </div>

      <div className="divide-y divide-white/5">
        {players.map((player, index) => {
          const playerPoints = player.global_points || 0;
          const rankInfo = getPlayerRank(playerPoints);
          const regionStyle = getRegionStyling(player.region);
          const rankBadge = getRankBadgeStyle(index + 1);
          
          return (
            <div
              key={player.id}
              className="grid grid-cols-12 gap-6 px-6 py-4 cursor-pointer hover:bg-white/5 transform-none"
              onClick={() => handlePlayerRowClick(player)}
            >
              <div className="col-span-1 flex items-center">
                <div className={`
                  w-12 h-12 flex items-center justify-center rounded-xl text-base font-bold
                  ${rankBadge.gradient} ${rankBadge.text}
                `}>
                  {index + 1}
                </div>
              </div>

              <div className="col-span-4 flex items-center gap-4">
                <Avatar className="w-14 h-14 border-2 border-white/20">
                  <AvatarImage 
                    src={player.avatar_url || getAvatarUrl(player.ign, player.java_username)}
                    alt={player.ign}
                    onError={(e) => handleAvatarError(e, player.ign, player.java_username)}
                  />
                  <AvatarFallback className="bg-gray-700 text-white font-bold">
                    {player.ign.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    {getDeviceIcon(player.device)}
                    <span className="text-white font-bold text-lg">
                      {player.ign}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${rankInfo.color}`}>
                      ◆ {rankInfo.title}
                    </span>
                    <span className="text-white/60 text-sm font-medium">({playerPoints} points)</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <span className={`
                  px-4 py-2 rounded-full text-sm font-bold
                  ${regionStyle.bgGradient} ${regionStyle.textColor}
                `}>
                  {player.region || 'NA'}
                </span>
              </div>

              <div className="col-span-5 flex items-center justify-center">
                <div className="flex items-center gap-4">
                  {[
                    { mode: 'mace', gamemode: 'Mace' },
                    { mode: 'sword', gamemode: 'Sword' },
                    { mode: 'crystal', gamemode: 'Crystal' },
                    { mode: 'axe', gamemode: 'Axe' },
                    { mode: 'uhc', gamemode: 'UHC' },
                    { mode: 'smp', gamemode: 'SMP' },
                    { mode: 'nethpot', gamemode: 'NethPot' },
                    { mode: 'bedwars', gamemode: 'Bedwars' }
                  ].map(({ mode, gamemode }) => {
                    const tier = getPlayerTierForGamemode(player, gamemode);
                    
                    return (
                      <div 
                        key={mode} 
                        className="flex flex-col items-center"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-700/70 border border-gray-500/20 flex items-center justify-center mb-1.5">
                          <GameModeIcon mode={mode} className="w-4 h-4" />
                        </div>
                        <div className={`px-2 py-0.5 rounded text-xs font-bold ${getTierBadgeColor(tier)} min-w-[32px] text-center`}>
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
