
import { GameMode } from '@/services/playerService';

/**
 * Helper function to convert a display game mode string to the correct GameMode enum casing
 */
export function toGameMode(displayMode: string): GameMode {
  // Map visible game mode names to the correct casing
  const modeMap: Record<string, GameMode> = {
    'Crystal': 'Crystal' as GameMode,
    'Sword': 'Sword' as GameMode,
    'Axe': 'Axe' as GameMode,
    'Mace': 'Mace' as GameMode,
    'SMP': 'SMP' as GameMode,
    'UHC': 'UHC' as GameMode,
    'NethPot': 'NethPot' as GameMode,
    'Bedwars': 'Bedwars' as GameMode,
    // Lowercase variations
    'crystal': 'Crystal' as GameMode,
    'sword': 'Sword' as GameMode,
    'axe': 'Axe' as GameMode,
    'mace': 'Mace' as GameMode,
    'smp': 'SMP' as GameMode,
    'uhc': 'UHC' as GameMode,
    'nethpot': 'NethPot' as GameMode,
    'bedwars': 'Bedwars' as GameMode
  };
  
  return modeMap[displayMode] || (displayMode as GameMode);
}

/**
 * Helper function to convert a GameMode enum to a display string
 */
export function toDisplayGameMode(gamemode: GameMode): string {
  // Handle potential undefined gamemode
  if (!gamemode) return '';

  // For lowercase game modes, use this approach
  const lowerCaseModes: Record<string, string> = {
    'crystal': 'Crystal',
    'sword': 'Sword',
    'axe': 'Axe',
    'mace': 'Mace',
    'smp': 'SMP',
    'uhc': 'UHC',
    'nethpot': 'NethPot',
    'bedwars': 'Bedwars'
  };
  
  // First try as is (for standard GameModes)
  const displayMap: Record<string, string> = {
    'Crystal': 'Crystal',
    'Sword': 'Sword',
    'Axe': 'Axe',
    'Mace': 'Mace',
    'SMP': 'SMP',
    'UHC': 'UHC',
    'NethPot': 'NethPot',
    'Bedwars': 'Bedwars'
  };
  
  // Check both maps
  return displayMap[gamemode] || lowerCaseModes[gamemode.toLowerCase()] || String(gamemode);
}
