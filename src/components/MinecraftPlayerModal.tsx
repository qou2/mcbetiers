
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, Crown } from 'lucide-react';
import { Player, GameMode } from '@/services/playerService';
import { GameModeIcon } from './GameModeIcon';
import { getPlayerRank } from '@/utils/rankUtils';
import { supabase } from '@/integrations/supabase/client';

interface MinecraftPlayerModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

export const MinecraftPlayerModal: React.FC<MinecraftPlayerModalProps> = ({
  player,
  isOpen,
  onClose,
}) => {
  const [playerTiers, setPlayerTiers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && player) {
      loadPlayerTiers();
    }
  }, [isOpen, player]);

  const loadPlayerTiers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gamemode_scores')
        .select('*')
        .eq('player_id', player.id);

      if (error) {
        console.error('Error loading player tiers:', error);
        return;
      }

      const tiers: Record<string, any> = {};
      data?.forEach(tier => {
        tiers[tier.gamemode] = tier.internal_tier;
      });

      setPlayerTiers(tiers);
    } catch (error) {
      console.error('Error loading player tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !player) return null;

  const gameModes: GameMode[] = ['Crystal', 'Sword', 'Mace', 'Axe', 'SMP', 'UHC', 'NethPot', 'Bedwars'];
  const playerPoints = player.global_points || 0;
  const playerRank = getPlayerRank(playerPoints);
  const currentRank = player.overall_rank || 1;

  const getTierColor = (tier: string) => {
    if (tier?.startsWith('HT')) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    if (tier?.startsWith('LT')) return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    return 'bg-gray-600 text-gray-100';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-2xl w-full max-w-xs relative overflow-hidden shadow-2xl border border-slate-600/50"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.4 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 hover:bg-white/10 rounded-full transition-colors z-10 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-white/80 group-hover:text-white" />
            </motion.button>

            {/* Content */}
            <div className="relative p-6 text-center">
              {/* Avatar with Enhanced Effects */}
              <motion.div 
                className="flex justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-gradient-to-r from-yellow-400 to-orange-500 overflow-hidden bg-slate-700 shadow-xl">
                    <img
                      src={`https://visage.surgeplay.com/bust/128/${player.ign}`}
                      alt={`${player.ign}'s skin`}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.src = `https://crafatar.com/avatars/${player.ign}?size=128&overlay=true`;
                      }}
                    />
                  </div>
                  {/* Rank Crown for high-tier players */}
                  {playerPoints >= 150 && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <Crown className="w-4 h-4 text-black" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Player Name with Animation */}
              <motion.h3 
                className="text-xl font-bold text-white mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {player.ign}
              </motion.h3>

              {/* Enhanced Rank Badge */}
              <motion.div 
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${playerRank.gradient} mb-4 text-sm font-bold shadow-lg`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-lg">{playerRank.icon}</span>
                <span className="text-white">{playerRank.title}</span>
              </motion.div>

              {/* Region with Enhanced Styling */}
              <motion.div 
                className="flex items-center justify-center gap-2 text-slate-300 mb-4 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <MapPin className="w-4 h-4" />
                <span>{player.region || 'North America'}</span>
              </motion.div>

              {/* Enhanced Position Section */}
              <motion.div 
                className="mb-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-semibold">
                  GLOBAL POSITION
                </h4>
                <div className={`bg-gradient-to-r ${playerRank.gradient} rounded-xl p-3 flex items-center justify-between shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 text-white rounded-lg px-2 py-1 font-bold text-sm backdrop-blur-sm">
                      #{currentRank}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-white" />
                      <span className="text-white font-bold text-sm">OVERALL</span>
                    </div>
                  </div>
                  <span className="text-white/90 text-sm font-medium">
                    {playerPoints} pts
                  </span>
                </div>
              </motion.div>

              {/* Enhanced Tiers Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-semibold">
                  GAMEMODE TIERS
                </h4>
                {loading ? (
                  <div className="text-slate-400 text-sm">Loading tiers...</div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {gameModes.map((mode, index) => {
                      const tier = playerTiers[mode] || 'LT1';
                      
                      return (
                        <motion.div
                          key={mode}
                          className="flex flex-col items-center p-2 bg-slate-700/50 rounded-lg border border-slate-600/30 hover:bg-slate-600/50 transition-all"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="mb-2">
                            <GameModeIcon mode={mode.toLowerCase()} className="w-5 h-5" />
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-md font-bold ${getTierColor(tier)} shadow-sm`}>
                            {tier}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
