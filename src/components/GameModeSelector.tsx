
import React from 'react';
import { cn } from '@/lib/utils';
import { GameModeIcon } from './GameModeIcon';

interface GameModeSelectorProps {
  selectedMode: string;
  onSelectMode: (mode: string) => void;
}

export function GameModeSelector({ selectedMode = 'overall', onSelectMode }: GameModeSelectorProps) {
  // Define all game modes
  const gameModes = [
    { id: 'overall', label: 'Overall' },
    { id: 'crystal', label: 'Crystal' },
    { id: 'sword', label: 'Sword' },
    { id: 'axe', label: 'Axe' },
    { id: 'mace', label: 'Mace' },
    { id: 'smp', label: 'SMP' },
    { id: 'nethpot', label: 'NethPot' },
    { id: 'bedwars', label: 'Bedwars' },
    { id: 'uhc', label: 'UHC' }
  ];
  
  const currentMode = selectedMode?.toLowerCase() || 'overall';
  
  return (
    <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
      {gameModes.map(mode => (
        <button
          key={mode.id}
          onClick={() => onSelectMode(mode.id)}
          className={cn(
            // Responsive px/py/font for mobile, tablet (md), desktop (lg)
            "flex items-center justify-center rounded-lg whitespace-nowrap border transition-colors duration-150",
            "text-xs px-3 py-1.5", // default: mobile
            "md:text-base md:px-4 md:py-2", // tablet
            "lg:text-lg lg:px-5 lg:py-2.5", // desktop
            "font-semibold",
            mode.id === 'overall' ? "" : "",
            currentMode === mode.id 
              ? "bg-white/10 border-white/20 text-white" 
              : "bg-white/5 border-white/5 text-white/60 hover:bg-white/8 hover:text-white/80"
          )}
        >
          {mode.id !== 'overall' && (
            <GameModeIcon 
              mode={mode.id} 
              // Icon 20px mobile, 28px tablet, 32px desktop
              className="h-4 w-4 mr-1 md:h-7 md:w-7 md:mr-2 lg:h-8 lg:w-8 lg:mr-2.5" 
            />
          )}
          {mode.label}
        </button>
      ))}
    </div>
  );
}

