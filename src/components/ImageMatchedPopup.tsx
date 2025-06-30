import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Monitor, Smartphone, Gamepad } from 'lucide-react';
import { GameModeIcon } from './GameModeIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePopup } from '@/contexts/PopupContext';
import { GameMode } from '@/services/playerService';

// Helper to get device icon
const getDeviceIcon = (device: string = 'PC') => {
  switch(device?.toLowerCase()) {
    case 'mobile':
    case 'bedrock':
      return <Smartphone className="w-4 h-4 text-blue-400" />;
    case 'console':
      return <Gamepad className="w-4 h-4 text-green-400" />;
    case 'pc':
    case 'java':
    default:
      return <Monitor className="w-4 h-4 text-white/80" />;
  }
};

// Helper to get region styling with proper hex colors
const getRegionStyling = (regionCode: string = 'NA') => {
  const regions: Record<string, { 
    name: string, 
    borderColor: string, 
    gradientFrom: string, 
    gradientTo: string,
    hexColor: string
  }> = {
    'NA': { 
      name: 'North America', 
      borderColor: '#10b981',
      gradientFrom: '#2a3441',
      gradientTo: '#1e2530',
      hexColor: '#10b981'
    },
    'EU': { 
      name: 'Europe', 
      borderColor: '#8b5cf6',
      gradientFrom: '#2a3441',
      gradientTo: '#1e2530',
      hexColor: '#8b5cf6'
    },
    'ASIA': { 
      name: 'Asia', 
      borderColor: '#ef4444',
      gradientFrom: '#2a3441',
      gradientTo: '#1e2530',
      hexColor: '#ef4444'
    },
    'SA': { 
      name: 'South America', 
      borderColor: '#f97316',
      gradientFrom: '#2a3441',
      gradientTo: '#1e2530',
      hexColor: '#f97316'
    },
    'AF': { 
      name: 'Africa', 
      borderColor: '#ec4899',
      gradientFrom: '#2a3441',
      gradientTo: '#1e2530',
      hexColor: '#ec4899'
    },
    'OCE': { 
      name: 'Oceania', 
      borderColor: '#06b6d4',
      gradientFrom: '#2a3441',
      gradientTo: '#1e2530',
      hexColor: '#06b6d4'
    }
  };
  
  return regions[regionCode] || regions['NA'];
};

export function ImageMatchedPopup() {
  const { popupData, showPopup, closePopup } = usePopup();
  
  if (!showPopup || !popupData) return null;

  const playerPoints = popupData.player.global_points || 390;
  const position = popupData.player.overall_rank || 1;
  const region = popupData.player.region || 'NA';
  const regionStyling = getRegionStyling(region);

  // Exact gamemode order from image: 2 rows of 4
  const orderedGamemodes: GameMode[] = [
    'Crystal', 'Sword', 'Bedwars', 'Mace',
    'SMP', 'UHC', 'NethPot', 'Axe'
  ];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="relative w-full max-w-[320px] rounded-xl overflow-hidden border-2"
            style={{
              background: `linear-gradient(180deg, ${regionStyling.gradientFrom} 0%, ${regionStyling.gradientTo} 100%)`,
              borderColor: regionStyling.borderColor,
              boxShadow: `0 0 30px ${regionStyling.hexColor}60, 0 8px 32px rgba(0, 0, 0, 0.4)`
            }}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="p-5 text-center">
              {/* Avatar Section */}
              <div className="mb-4">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <div 
                    className="w-full h-full rounded-full border-3 overflow-hidden"
                    style={{ 
                      borderColor: regionStyling.borderColor,
                      boxShadow: `0 0 15px ${regionStyling.hexColor}40`
                    }}
                  >
                    <Avatar className="w-full h-full">
                      <AvatarImage 
                        src={`https://visage.surgeplay.com/bust/128/${popupData.player.ign}`}
                        alt={popupData.player.ign}
                        className="object-cover object-center scale-110"
                      />
                      <AvatarFallback className="bg-slate-700 text-white font-bold text-sm">
                        {popupData.player.ign.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Player Name with Device Icon */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getDeviceIcon(popupData.player.device)}
                  <h3 className="text-lg font-bold text-white">
                    {popupData.player.ign}
                  </h3>
                </div>

                {/* Combat Master Badge */}
                <div 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2 text-xs border"
                  style={{ 
                    background: `linear-gradient(90deg, ${regionStyling.borderColor}60 0%, ${regionStyling.borderColor}40 100%)`,
                    borderColor: regionStyling.borderColor,
                    boxShadow: `0 0 10px ${regionStyling.hexColor}30`
                  }}
                >
                  <span className="w-2.5 h-2.5 text-yellow-200 text-xs">♦</span>
                  <span className="text-white font-bold">Combat Master</span>
                </div>

                {/* Region */}
                <div className="text-slate-400 text-xs mb-2">
                  {regionStyling.name}
                </div>

                {/* NameMC Link */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">n</span>
                  </div>
                  <span className="text-blue-400 text-xs">NameMC ↗</span>
                </div>
              </div>

              {/* Position Section */}
              <div className="mb-4">
                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold text-left">
                  POSITION
                </h4>
                <div 
                  className="rounded-lg p-2.5 flex items-center justify-between border"
                  style={{ 
                    background: `linear-gradient(90deg, ${regionStyling.borderColor}80 0%, ${regionStyling.borderColor}60 100%)`,
                    borderColor: regionStyling.borderColor,
                    boxShadow: `0 0 10px ${regionStyling.hexColor}30`
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-7 h-7 rounded-md flex items-center justify-center text-white font-black text-sm"
                      style={{ backgroundColor: regionStyling.borderColor }}
                    >
                      {position}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-white font-bold text-xs">OVERALL</span>
                    </div>
                  </div>
                  <span className="text-white/90 text-xs font-medium">
                    ({playerPoints} points)
                  </span>
                </div>
              </div>

              {/* Tiers Section */}
              <div>
                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold text-left">
                  TIERS
                </h4>
                <div 
                  className="rounded-lg p-2.5 border"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.6)',
                    borderColor: regionStyling.borderColor + '60',
                    boxShadow: `0 0 5px ${regionStyling.hexColor}20`
                  }}
                >
                  <div className="grid grid-cols-4 gap-2.5">
                    {orderedGamemodes.map((mode) => {
                      // Mock tiers exactly as shown in image
                      const tierMap: Record<string, { code: string, color: string }> = {
                        'Crystal': { code: 'HT1', color: 'text-yellow-400' },
                        'Sword': { code: 'HT1', color: 'text-yellow-400' }, 
                        'Bedwars': { code: 'HT1', color: 'text-yellow-400' },
                        'Mace': { code: 'LT1', color: 'text-yellow-600' },
                        'SMP': { code: 'LT1', color: 'text-yellow-600' },
                        'UHC': { code: 'LT1', color: 'text-yellow-600' },
                        'NethPot': { code: 'HT2', color: 'text-purple-400' },
                        'Axe': { code: 'LT1', color: 'text-yellow-600' }
                      };
                      
                      const tier = tierMap[mode] || { code: 'LT1', color: 'text-yellow-600' };
                      
                      return (
                        <div
                          key={mode}
                          className="flex flex-col items-center"
                        >
                          <div className="mb-1">
                            <GameModeIcon mode={mode.toLowerCase()} className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <span className={`text-xs font-bold ${tier.color}`}>{tier.code}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
