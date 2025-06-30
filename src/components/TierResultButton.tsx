
import React from 'react';
import { Player } from '@/services/playerService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronRight, Trophy, Monitor, Smartphone, Gamepad } from 'lucide-react';
import { usePopup } from '@/contexts/PopupContext';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarUtils';

interface TierResultButtonProps {
  player: Player;
  onClick?: (player: Player) => void;
}

// Helper to get device icon
const getDeviceIcon = (device: string = 'PC') => {
  switch(device?.toLowerCase()) {
    case 'mobile':
    case 'bedrock':
      return <Smartphone className="w-2 h-2 text-blue-400" />;
    case 'console':
      return <Gamepad className="w-2 h-2 text-green-400" />;
    case 'pc':
    case 'java':
    default:
      return <Monitor className="w-2 h-2 text-white/80" />;
  }
};

export function TierResultButton({ player, onClick }: TierResultButtonProps) {
  const { openPopup } = usePopup();
  const playerPoints = player.global_points || 0;

  const handleClick = () => {
    if (onClick) {
      onClick(player);
    }
    
    // Convert tierAssignments to match expected interface
    const tierAssignments = (player.tierAssignments || []).map(assignment => ({
      gamemode: assignment.gamemode,
      tier: assignment.tier,
      score: assignment.score
    }));
    
    openPopup({
      player,
      tierAssignments,
      combatRank: {
        title: 'Combat Rank',
        points: playerPoints,
        color: 'text-white',
        effectType: 'general',
        rankNumber: player.overall_rank || 1,
        borderColor: 'border-white'
      },
      timestamp: new Date().toISOString()
    });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-slate-800/70 hover:bg-slate-700/70 border border-slate-600/40 rounded-md px-2 py-1 transition-colors duration-150"
    >
      <div className="flex items-center gap-1.5">
        {/* Compact Avatar */}
        <Avatar className="w-5 h-5 border border-slate-500/40">
          <AvatarImage 
            src={player.avatar_url || getAvatarUrl(player.ign, player.java_username)}
            alt={player.ign}
            className="object-cover"
            onError={(e) => handleAvatarError(e, player.ign, player.java_username)}
          />
          <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">
            {player.ign.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        {/* Player info */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            {getDeviceIcon(player.device)}
            <span className="text-white font-medium text-xs truncate">
              {player.ign}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Trophy className="w-1.5 h-1.5" />
            <span className="font-medium">{playerPoints}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-slate-500 mx-0.5" />
            <div className={`w-1 h-1 rounded-full ${
              player.region === 'NA' ? 'bg-red-500' :
              player.region === 'EU' ? 'bg-green-500' :
              player.region === 'ASIA' ? 'bg-blue-500' :
              'bg-gray-500'
            }`} />
            <span>{player.region || 'NA'}</span>
          </div>
        </div>
        
        {/* Arrow indicator */}
        <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
      </div>
    </button>
  );
}
