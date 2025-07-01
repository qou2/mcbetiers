
import React from 'react';

interface GameModeIconProps {
  mode: string;
  className?: string;
}

export function GameModeIcon({ mode, className = "h-4 w-4" }: GameModeIconProps) {
  const getIconPath = () => {
    switch (mode.toLowerCase()) {
      case 'skywars':
        return '/lovable-uploads/pngegg.png';
      case 'crystal':
        return '/lovable-uploads/80633d42-7f02-40c2-899e-9b4f53453c4e.png';
      case 'midfight':
        return '/lovable-uploads/09743052-7a91-4b8b-a703-3fbaddbbfbe6.png';
      case 'uhc':
        return '/lovable-uploads/afc839db-dab2-4fd5-b5e6-f9e9e33c0cdc.png';
      case 'nodebuff':
        return '/lovable-uploads/pot.png';
      case 'bedfight':
        return '/lovable-uploads/b099b583-75a2-44b4-bede-18b063e47d28.png';
      case 'axe':
        return '/lovable-uploads/25e85709-efba-496e-b54c-8fa9f45f88c4.png';
      case 'smp':
        return '/lovable-uploads/cce7c84c-7797-415f-a07b-7ccb735c0a5f.png';
      default:
        return '';
    }
  };

  const iconPath = getIconPath();

  if (!iconPath) return null;

  return (
    <img 
      src={iconPath}
      alt={`${mode} icon`}
      className={className}
      style={{ objectFit: "contain" }} // ensures no weird stretching
    />
  );
}

