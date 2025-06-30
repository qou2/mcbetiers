import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Smartphone, Gamepad } from 'lucide-react';
import { GameModeIcon } from './GameModeIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePopup } from '@/contexts/PopupContext';
import { GameMode } from '@/services/playerService';
import { getAvatarUrl, handleAvatarError } from '@/utils/avatarUtils';
import { useIsMobile } from '@/hooks/use-mobile';

// Helper to get device icon
const getDeviceIcon = (device: string = 'PC', isMobile: boolean = false) => {
  const iconSize = isMobile ? 'w-4 h-4' : 'w-4 h-4';
  
  switch(device?.toLowerCase()) {
    case 'mobile':
    case 'bedrock':
      return <Smartphone className={`${iconSize} text-blue-400`} />;
    case 'console':
      return <Gamepad className={`${iconSize} text-green-400`} />;
    case 'pc':
    case 'java':
    default:
      return <Monitor className={`${iconSize} text-white/80`} />;
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
      gradientFrom: '#10b981',
      gradientTo: '#059669',
      hexColor: '#10b981'
    },
    'EU': { 
      name: 'Europe', 
      borderColor: '#8b5cf6',
      gradientFrom: '#8b5cf6',
      gradientTo: '#7c3aed',
      hexColor: '#8b5cf6'
    },
    'ASIA': { 
      name: 'Asia', 
      borderColor: '#ef4444',
      gradientFrom: '#ef4444',
      gradientTo: '#dc2626',
      hexColor: '#ef4444'
    },
    'SA': { 
      name: 'South America', 
      borderColor: '#f97316',
      gradientFrom: '#f97316',
      gradientTo: '#ea580c',
      hexColor: '#f97316'
    },
    'AF': { 
      name: 'Africa', 
      borderColor: '#ec4899',
      gradientFrom: '#ec4899',
      gradientTo: '#db2777',
      hexColor: '#ec4899'
    },
    'OCE': { 
      name: 'Oceania', 
      borderColor: '#06b6d4',
      gradientFrom: '#06b6d4',
      gradientTo: '#0891b2',
      hexColor: '#06b6d4'
    }
  };
  
  return regions[regionCode] || regions['NA'];
};

export function ModernResultPopup() {
  const { popupData, showPopup, closePopup } = usePopup();
  const isMobile = useIsMobile();

  if (!showPopup || !popupData) return null;

  const playerPoints = popupData.player.global_points || 390;
  const position = popupData.player.overall_rank || 1;
  const region = popupData.player.region || 'NA';
  const regionStyling = getRegionStyling(region);

  const orderedGamemodes: GameMode[] = [
    'Mace', 'Sword', 'Crystal', 'Axe',
    'SMP', 'UHC', 'NethPot', 'Bedwars'
  ];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  const getTierData = (mode: GameMode) => {
    // Find the actual tier for this gamemode from player data
    const playerTier = popupData.tierAssignments.find(assignment => 
      assignment.gamemode === mode
    );
    
    console.log(`Getting tier data for ${mode}:`, playerTier);
    
    if (playerTier && playerTier.tier && playerTier.tier !== 'Not Ranked') {
      const tierMap: Record<string, { code: string, color: string, gradient: string }> = {
        'HT1': { code: 'HT1', color: '#fde047', gradient: 'linear-gradient(135deg, #fef9c3 0%, #fde047 90%)' },
        'LT1': { code: 'LT1', color: '#7cffad', gradient: 'linear-gradient(135deg, #e6fff6 0%, #7cffad 90%)' },
        'HT2': { code: 'HT2', color: '#a78bfa', gradient: 'linear-gradient(135deg, #f5f3ff 0%, #a78bfa 90%)' },
        'LT2': { code: 'LT2', color: '#fda4af', gradient: 'linear-gradient(135deg, #fff1fc 0%, #fda4af 100%)' },
        'HT3': { code: 'HT3', color: '#f472b6', gradient: 'linear-gradient(135deg, #fff1fa 0%, #f472b6 90%)' },
        'LT3': { code: 'LT3', color: '#38bdf8', gradient: 'linear-gradient(135deg, #f0faff 0%, #38bdf8 90%)' },
        'HT4': { code: 'HT4', color: '#fb7185', gradient: 'linear-gradient(135deg, #fef2f2 0%, #fb7185 90%)' },
        'LT4': { code: 'LT4', color: '#60a5fa', gradient: 'linear-gradient(135deg, #eff6ff 0%, #60a5fa 90%)' },
        'HT5': { code: 'HT5', color: '#34d399', gradient: 'linear-gradient(135deg, #ecfdf5 0%, #34d399 90%)' },
        'LT5': { code: 'LT5', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fffbeb 0%, #fbbf24 90%)' },
        'Retired': { code: 'RT', color: '#6b7280', gradient: 'linear-gradient(135deg, #f9fafb 0%, #6b7280 90%)' }
      };
      
      const tierInfo = tierMap[playerTier.tier];
      if (tierInfo) {
        console.log(`Found tier info for ${mode}:`, tierInfo);
        return tierInfo;
      }
    }
    
    console.log(`No tier found for ${mode}, returning NR`);
    return { code: 'NR', color: '#e5e7eb', gradient: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)' };
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.90)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className={`relative w-full rounded-2xl overflow-hidden shadow-2xl ${
              isMobile ? 'max-w-[340px] mx-2' : 'max-w-[360px]'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
              border: `2px solid ${regionStyling.borderColor}`,
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px ${regionStyling.hexColor}60`
            }}
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closePopup}
              className={`absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 rounded-full z-30 transition-all duration-200 flex items-center justify-center shadow-lg hover:scale-110 ${
                isMobile ? 'w-10 h-10' : 'w-8 h-8'
              }`}
              aria-label="Close"
            >
              <X className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
            </button>
            
            {/* Main Content */}
            <div className={`flex flex-col items-center pb-4 pt-5 ${isMobile ? 'px-4' : 'px-5'}`}>
              {/* Avatar */}
              <div className="relative mb-3">
                <div
                  className={`rounded-full overflow-hidden flex items-center justify-center shadow-xl ${
                    isMobile ? 'w-20 h-20' : 'w-18 h-18'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${regionStyling.gradientFrom} 0%, ${regionStyling.gradientTo} 100%)`,
                    border: `3px solid ${regionStyling.borderColor}`,
                    boxShadow: `0 0 20px ${regionStyling.hexColor}40`
                  }}
                >
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={popupData.player.avatar_url || getAvatarUrl(popupData.player.ign, popupData.player.java_username)}
                      alt={popupData.player.ign}
                      className="object-cover object-center scale-110"
                      onError={(e) => handleAvatarError(e, popupData.player.ign, popupData.player.java_username)}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-800 font-bold text-lg">
                      {popupData.player.ign.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              {/* username section, divider, and tiers section */}
              <div className="flex flex-col items-center gap-1 mb-4 w-full">
                <div className={`flex items-center gap-2 font-bold text-white drop-shadow-lg text-center ${
                  isMobile ? 'text-lg' : 'text-xl'
                }`}>
                  {getDeviceIcon(popupData.player.device, isMobile)}
                  <span>{popupData.player.ign}</span>
                </div>
                <div 
                  className={`inline-flex items-center gap-2 rounded-xl border shadow-lg ${
                    isMobile ? 'px-2.5 py-1' : 'px-3 py-1.5'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${regionStyling.gradientFrom}80 0%, ${regionStyling.gradientTo}60 100%)`,
                    borderColor: regionStyling.borderColor,
                    boxShadow: `0 0 15px ${regionStyling.hexColor}30`
                  }}
                >
                  <span className={`font-semibold text-white tracking-wide ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    {popupData.combatRank?.title || "Combat Master"}
                  </span>
                </div>
                <div className={`flex items-center gap-2 text-white/90 mt-2 ${
                  isMobile ? 'text-xs flex-wrap justify-center' : 'text-sm gap-3'
                }`}>
                  <div 
                    className={`rounded-lg bg-black/20 border ${
                      isMobile ? 'px-1.5 py-0.5' : 'px-2 py-1'
                    }`}
                    style={{
                      borderColor: `${regionStyling.borderColor}60`
                    }}
                  >
                    {popupData.player.region ?? 'NA'}
                  </div>
                  <div className="text-white/90">#{position} overall</div>
                  <div className="text-white/90">
                    <span className="font-bold">{playerPoints}</span> pts
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <div 
                className="w-full my-3 h-px"
                style={{
                  background: `linear-gradient(to right, transparent, ${regionStyling.borderColor}80, transparent)`
                }}
              />
              
              {/* Tiers */}
              <div className="w-full">
                <div 
                  className={`uppercase tracking-widest font-bold text-center mb-3 ${
                    isMobile ? 'text-xs' : 'text-xs'
                  }`}
                  style={{ color: regionStyling.borderColor }}
                >
                  Gamemode Tiers
                </div>
                <div className={`grid gap-2 ${
                  isMobile ? 'grid-cols-4 gap-1.5' : 'grid-cols-4 gap-2.5'
                }`}>
                  {orderedGamemodes.map((mode, index) => {
                    const tier = getTierData(mode);
                    return (
                      <motion.div
                        key={mode}
                        className="group flex flex-col items-center gap-1.5 relative transition-transform hover:scale-105 duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div
                          className="flex items-center justify-center rounded-full shadow-lg"
                          style={{
                            width: isMobile ? 36 : 44,
                            height: isMobile ? 36 : 44,
                            border: `2px solid ${regionStyling.borderColor}`,
                            background: `rgba(255,255,255,0.1)`,
                            backdropFilter: 'blur(4px)',
                            boxShadow: `0 0 15px ${regionStyling.hexColor}40, 0 4px 8px rgba(0, 0, 0, 0.3)`
                          }}
                        >
                          <GameModeIcon mode={mode.toLowerCase()} className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
                        </div>
                        <div
                          className={`font-bold rounded-md py-1 px-2 border shadow-sm backdrop-blur-sm ${
                            isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
                          }`}
                          style={{
                            color: tier.color,
                            fontSize: isMobile ? '0.6rem' : '0.65rem',
                            letterSpacing: '0.05em',
                            background: `rgba(255,255,255,0.1)`,
                            borderColor: `${regionStyling.borderColor}60`,
                            boxShadow: `0 0 8px ${regionStyling.hexColor}20`
                          }}
                        >
                          {tier.code}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              
              {/* Footer */}
              <div className={`w-full text-center text-white/70 pt-3 border-t mt-4 ${
                isMobile ? 'text-xs' : 'text-xs'
              }`}
              style={{
                borderColor: `${regionStyling.borderColor}40`
              }}
              >
                <span>Tap outside to close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
