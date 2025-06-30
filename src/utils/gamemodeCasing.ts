
import { GameMode } from '@/services/playerService';

/**
 * Utility functions to manage GameMode casing differences between UI display and database
 */

// Map from display case to database case
export const displayToDatabaseGameMode: Record<string, GameMode> = {
  'Crystal': 'Crystal' as GameMode,
  'Sword': 'Sword' as GameMode,
  'Axe': 'Axe' as GameMode,
  'Mace': 'Mace' as GameMode,
  'SMP': 'SMP' as GameMode,
  'UHC': 'UHC' as GameMode,
  'NethPot': 'NethPot' as GameMode,
  'Bedwars': 'Bedwars' as GameMode,
  // Also accept lowercase versions
  'crystal': 'Crystal' as GameMode,
  'sword': 'Sword' as GameMode,
  'axe': 'Axe' as GameMode,
  'mace': 'Mace' as GameMode,
  'smp': 'SMP' as GameMode,
  'uhc': 'UHC' as GameMode,
  'nethpot': 'NethPot' as GameMode,
  'bedwars': 'Bedwars' as GameMode
};

// Map from database case to display case (standard cases)
export const databaseToDisplayGameMode: Record<string, string> = {
  'Crystal': 'Crystal',
  'Sword': 'Sword',
  'Axe': 'Axe',
  'Mace': 'Mace',
  'SMP': 'SMP',
  'UHC': 'UHC',
  'NethPot': 'NethPot',
  'Bedwars': 'Bedwars'
};

// Additional map for lowercase versions
const lowerCaseModeToDisplay: Record<string, string> = {
  'crystal': 'Crystal',
  'sword': 'Sword',
  'axe': 'Axe',
  'mace': 'Mace',
  'smp': 'SMP',
  'uhc': 'UHC',
  'nethpot': 'NethPot',
  'bedwars': 'Bedwars'
};

/**
 * Convert display format GameMode to database format
 */
export function toDatabaseGameMode(displayMode: string): GameMode {
  return displayToDatabaseGameMode[displayMode] || (displayMode as GameMode);
}

/**
 * Convert database format GameMode to display format
 */
export function toDisplayGameMode(dbGameMode: GameMode): string {
  if (!dbGameMode) return '';
  
  return databaseToDisplayGameMode[dbGameMode] || 
         lowerCaseModeToDisplay[dbGameMode.toLowerCase()] || 
         String(dbGameMode);
}

/**
 * Safe cast for GameMode values when working with arrays
 */
export function asGameModeArray(modes: string[]): GameMode[] {
  return modes.map(mode => toDatabaseGameMode(mode));
}
