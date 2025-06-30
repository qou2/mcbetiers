
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameModeIcon } from './GameModeIcon';
import { TableCell, TableRow } from '@/components/ui/table';

interface PlayerRowProps {
  id?: string;
  position?: number;
  displayName: string;
  avatar?: string;
  gameMode?: string;
  tier?: number | string;
  badge?: string;
  points?: number;
  country?: string;
  device?: string;
  compact?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function PlayerRow({ 
  id,
  position, 
  displayName, 
  avatar, 
  gameMode, 
  tier, 
  badge, 
  points, 
  country, 
  device, 
  compact = false, 
  onClick, 
  delay = 0 
}: PlayerRowProps) {
  return (
    <TableRow
      className="hover:bg-white/5 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {position && (
        <TableCell className="w-12">
          <span className="text-white/40 text-sm font-mono">
            {position}
          </span>
        </TableCell>
      )}
      
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className={cn("border-2 border-white/10", compact ? "h-8 w-8" : "h-10 w-10")}>
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback>
              {displayName ? displayName.charAt(0) : "?"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={cn("font-medium", compact ? "text-sm" : "text-base")}>
                {displayName}
              </span>
              
              {gameMode && (
                <span className="text-xs text-white/60 bg-white/10 px-1.5 py-0.5 rounded flex items-center">
                  <GameModeIcon mode={gameMode} className="h-3 w-3 mr-1" />
                  {gameMode}
                </span>
              )}
            </div>
            
            {badge && (
              <div className="flex items-center text-xs">
                <span className={cn(
                  tier === 1 || badge.includes('T1') ? "text-tier-1" :
                  tier === 2 || badge.includes('T2') ? "text-tier-2" :
                  tier === 3 || badge.includes('T3') ? "text-tier-3" :
                  tier === 4 || badge.includes('T4') ? "text-tier-4" :
                  tier === 5 || badge.includes('T5') ? "text-tier-5" :
                  "text-white/50"
                )}>
                  {badge}
                </span>
              </div>
            )}
          </div>
        </div>
      </TableCell>
      
      {country && (
        <TableCell className="text-center">
          <span className="text-sm">{country}</span>
        </TableCell>
      )}
      
      {device && (
        <TableCell className="text-center">
          <span className="text-sm">{device}</span>
        </TableCell>
      )}
      
      <TableCell className="text-right">
        {points !== undefined && (
          <div className={cn(
            "flex items-center justify-end",
            compact ? "text-xs" : "text-sm"
          )}>
            <Trophy size={compact ? 12 : 14} className="mr-1 text-yellow-400" />
            <span>{points}</span>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
