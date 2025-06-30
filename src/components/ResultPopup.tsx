import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Monitor, Smartphone, Gamepad } from 'lucide-react';
import { GameModeIcon } from './GameModeIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RankBadgeEffects, RankText, PositionBadge } from './RankBadgeEffects';
import { usePopup } from '@/contexts/PopupContext';
import { GameMode } from '@/services/playerService';
import { toDisplayGameMode } from '@/utils/gamemodeUtils';

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

// Helper to get region colors and styling with proper hex colors for borders
const getRegionStyling = (regionCode: string = 'NA') => {
  const regions: Record<string, { 
    name: string, 
    borderColor: string, 
    gradientFrom: string, 
    gradientTo: string,
    glowColor: string,
    hexColor: string
  }> = {
    'NA': { 
      name: 'North America', 
      borderColor: 'border-green-500',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-emerald-500/10',
      glowColor: 'shadow-green-500/30',
      hexColor: '#10b981'
    },
    'EU': { 
      name: 'Europe', 
      borderColor: 'border-purple-500',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-violet-500/10',
      glowColor: 'shadow-purple-500/30',
      hexColor: '#8b5cf6'
    },
    'ASIA': { 
      name: 'Asia', 
      borderColor: 'border-red-500',
      gradientFrom: 'from-red-500/20',
      gradientTo: 'to-rose-500/10',
      glowColor: 'shadow-red-500/30',
      hexColor: '#ef4444'
    },
    'SA': { 
      name: 'South America', 
      borderColor: 'border-orange-500',
      gradientFrom: 'from-orange-500/20',
      gradientTo: 'to-amber-500/10',
      glowColor: 'shadow-orange-500/30',
      hexColor: '#f97316'
    },
    'AF': { 
      name: 'Africa', 
      borderColor: 'border-fuchsia-500',
      gradientFrom: 'from-fuchsia-500/20',
      gradientTo: 'to-pink-500/10',
      glowColor: 'shadow-fuchsia-500/30',
      hexColor: '#ec4899'
    },
    'OCE': { 
      name: 'Oceania', 
      borderColor: 'border-teal-500',
      gradientFrom: 'from-teal-500/20',
      gradientTo: 'to-cyan-500/10',
      glowColor: 'shadow-teal-500/30',
      hexColor: '#06b6d4'
    }
  };
  
  return regions[regionCode] || regions['NA'];
};

// Get device icon component
const DeviceInfo = ({ device }: { device?: string }) => {
  return (
    <div className="flex items-center justify-center">
      <span className="text-white text-sm">{device || 'PC'}</span>
    </div>
  );
};

// Format tier for display
const formatTierDisplay = (tier: string): { code: string, label: string } => {
  let code = 'T?';
  let label = '';
  
  if (tier === 'Retired') return { code: 'RT', label: '' };
  
  // Extract tier number (T1-T5)
  if (tier.includes('T1')) code = 'T1';
  else if (tier.includes('T2')) code = 'T2';
  else if (tier.includes('T3')) code = 'T3';
  else if (tier.includes('T4')) code = 'T4';
  else if (tier.includes('T5')) code = 'T5';
  
  // Extract High/Low label
  if (tier.includes('H')) label = 'High';
  else if (tier.includes('L')) label = 'Low';
  
  return { code, label };
};

export function ResultPopup() {
  const { popupData, showPopup, closePopup } = usePopup();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };
  
  if (!showPopup || !popupData) return null;
  
  // Get region styling
  const region = popupData.player.region || 'NA';
  const regionStyling = getRegionStyling(region);
  const playerPoints = popupData.player.global_points || 0;
  const position = popupData.player.overall_rank || 1;
  
  // Ordered gamemode layout
  const orderedGamemodes: GameMode[] = [
    'Crystal', 'Sword', 'Bedwars',
    'Mace', 'SMP', 'UHC',
    'NethPot', 'Axe'
  ];
  
  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div 
            className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl w-full max-w-md border-2 ${regionStyling.borderColor} shadow-2xl overflow-hidden`}
            style={{
              boxShadow: `0 0 30px ${regionStyling.hexColor}40, 0 8px 32px rgba(0, 0, 0, 0.4)`
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Region-based gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${regionStyling.gradientFrom} ${regionStyling.gradientTo} opacity-50`}></div>
            
            {/* Header bar */}
            <div className="relative py-4 text-center border-b border-white/10 bg-black/30">
              <h2 className="text-xl font-bold text-white">Player Profile</h2>
              
              {/* Close button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  closePopup();
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-white/80" />
              </button>
            </div>
            
            <div className="p-6 relative z-20">
              {/* Avatar section with enhanced rank badge */}
              <div className="flex flex-col sm:flex-row items-center mb-6">
                <div className="relative mb-4 sm:mb-0 sm:mr-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg">
                      <AvatarImage 
                        src={`https://crafatar.com/avatars/${popupData.player.ign}?size=128&overlay=true`}
                        alt={popupData.player.ign}
                      />
                      <AvatarFallback>{popupData.player.ign.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    {/* Enhanced rank badge positioned at bottom right of avatar */}
                    <div className="absolute -bottom-2 -right-2">
                      <RankBadgeEffects 
                        points={playerPoints} 
                        size="md" 
                        animated={true}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span 
                            className={`px-3 py-0.5 rounded-full text-xs font-medium border ${regionStyling.borderColor} bg-gradient-to-r ${regionStyling.gradientFrom} ${regionStyling.gradientTo}`}
                            style={{
                              borderColor: regionStyling.hexColor,
                              boxShadow: `0 0 10px ${regionStyling.hexColor}30`
                            }}
                          >
                            {region}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{regionStyling.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {getDeviceIcon(popupData.player.device)}
                    <h3 className="text-xl font-bold text-white">{popupData.player.ign}</h3>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-200 font-medium">{playerPoints} points</span>
                  </div>
                  
                  <div className="mb-3">
                    <RankText points={playerPoints} className="text-white text-lg" />
                  </div>
                </div>
              </div>
              
              {/* Enhanced Rank & Device information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center justify-center">
                  <PositionBadge position={position} points={playerPoints} />
                </div>
                
                <div className="bg-black/40 border border-white/10 rounded-lg p-3 text-center">
                  <span className="text-gray-400 text-xs block mb-1">Device</span>
                  <DeviceInfo device={popupData.player.device} />
                </div>
              </div>
              
              {/* Gamemode Grid */}
              <div className="w-full mb-3">
                <h3 className="text-white/80 text-sm font-medium">Gamemode Rankings</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {orderedGamemodes.map((mode, index) => {
                  const assignment = popupData.tierAssignments.find(a => a.gamemode === mode);
                  const tier = assignment?.tier || 'Not Ranked';
                  const { code, label } = formatTierDisplay(tier);
                  
                  return (
                    <motion.div
                      key={mode}
                      className="gamemode-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`flex flex-col items-center p-3 bg-black/40 rounded-lg border hover:border-white/20 transition-all cursor-help`}
                              style={{
                                borderColor: `${regionStyling.hexColor}60`,
                                boxShadow: `0 0 5px ${regionStyling.hexColor}20`
                              }}
                            >
                              <div className="mb-2">
                                <GameModeIcon mode={mode.toLowerCase()} className="h-8 w-8" />
                              </div>
                              <div className="text-center">
                                {tier !== 'Not Ranked' ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-white font-bold text-sm">{code}</span>
                                    {label && <span className="text-xs text-white/60">{label}</span>}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-xs">Unranked</span>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-center">
                              <p className="font-medium">{toDisplayGameMode(mode)}</p>
                              {tier !== 'Not Ranked' ? (
                                <p className="text-sm">{assignment?.score || 0} points</p>
                              ) : (
                                <p className="text-sm">Not Ranked</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
