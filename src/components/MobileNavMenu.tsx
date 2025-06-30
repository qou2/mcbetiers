
import React from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileNavMenuProps {
  currentMode: string;
}

export function MobileNavMenu({ currentMode = 'overall' }: MobileNavMenuProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const gameModes = [
    { value: 'overall', label: 'Overall' },
    { value: 'crystal', label: 'Crystal' },
    { value: 'sword', label: 'Sword' },
    { value: 'smp', label: 'SMP' },
    { value: 'uhc', label: 'UHC' },
    { value: 'axe', label: 'Axe' },
    { value: 'nethpot', label: 'NethPot' },
    { value: 'bedwars', label: 'Bedwars' },
    { value: 'mace', label: 'Mace' },
  ];

  const handleModeChange = (mode: string) => {
    if (mode === 'overall') {
      navigate('/');
    } else {
      navigate(`/${mode}`);
    }
  };

  const getCurrentModeLabel = () => {
    const mode = currentMode?.toLowerCase() || 'overall';
    const found = gameModes.find(gameMode => gameMode.value === mode);
    return found ? found.label : 'Select Mode';
  };

  if (!isMobile) return null;

  return (
    <div className="w-full flex justify-center my-3 px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full max-w-xs flex items-center justify-between bg-dark-surface/60 border-white/20 text-white hover:bg-dark-surface/80 hover:text-white py-3 h-12"
          >
            <div className="flex items-center gap-2">
              <Menu size={18} />
              <span className="text-base font-medium">{getCurrentModeLabel()}</span>
            </div>
            <ChevronDown size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center" 
          className="w-[calc(100vw-2rem)] max-w-xs bg-dark-surface/95 border-white/20 backdrop-blur-md"
        >
          {gameModes.map((mode) => (
            <DropdownMenuItem 
              key={mode.value}
              className={`text-white hover:bg-white/10 focus:bg-white/10 py-3 text-base cursor-pointer ${
                (currentMode?.toLowerCase() || 'overall') === mode.value 
                  ? "bg-white/20 font-semibold" 
                  : ""
              }`}
              onClick={() => handleModeChange(mode.value)}
            >
              {mode.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
