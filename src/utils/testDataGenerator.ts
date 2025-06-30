
import { supabase } from '@/integrations/supabase/client';
import { Player, GameMode, TierLevel, PlayerRegion, DeviceType } from '@/services/playerService';
import { toGameMode } from './gamemodeUtils';

// Function to generate a random username with game-style naming
function generateRandomUsername(): string {
  const prefixes = ['Shadow', 'Epic', 'Pro', 'Dark', 'Ninja', 'Sniper', 'Thunder', 'Storm', 'Dragon', 'Pixel', 'Plasma', 'Gold', 'Silver', 'Diamond', 'Iron', 'Emerald'];
  const suffixes = ['Gamer', 'Player', 'Master', 'Killer', 'Hunter', 'Warrior', 'King', 'Queen', 'Legend', 'God', 'Knight', 'Slayer', 'Assassin', 'Defender'];
  const numbers = ['', '123', '69', '420', '007', '99', '777', '666', '101', '404', '808', '1337', '999', '2023'];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = Math.random() > 0.5 ? numbers[Math.floor(Math.random() * numbers.length)] : '';
  
  const username = `${prefix}${suffix}${number}`;
  return username;
}

// Generate a random Java username (most will have the same as IGN)
function generateJavaUsername(ign: string): string {
  // 80% chance to have the same username, 20% chance to be different
  if (Math.random() < 0.8) {
    return ign;
  }
  return generateRandomUsername();
}

// Generate a random region
function generateRandomRegion(): PlayerRegion {
  const regions: PlayerRegion[] = ['NA', 'EU', 'ASIA', 'OCE', 'SA', 'AF'];
  return regions[Math.floor(Math.random() * regions.length)];
}

// Generate a random device
function generateRandomDevice(): DeviceType {
  const devices: DeviceType[] = ['Mobile', 'PC', 'Console'];
  return devices[Math.floor(Math.random() * devices.length)];
}

// Generate random tier level
function generateRandomTier(): TierLevel {
  const tiers: TierLevel[] = [
    'HT1', 'LT1',
    'HT2', 'LT2',
    'HT3', 'LT3',
    'HT4', 'LT4',
    'HT5', 'LT5',
    'Retired'
  ];
  
  // Weight the distribution to have fewer top tier players
  const rand = Math.random();
  if (rand < 0.05) return 'HT1';
  if (rand < 0.15) return 'LT1';
  if (rand < 0.25) return 'HT2';
  if (rand < 0.35) return 'LT2';
  if (rand < 0.5) return 'HT3';
  if (rand < 0.65) return 'LT3';
  if (rand < 0.75) return 'HT4';
  if (rand < 0.85) return 'LT4';
  if (rand < 0.95) return 'HT5';
  return 'LT5';
}

// Calculate points for a tier
function calculatePointsForTier(tier: TierLevel): number {
  switch (tier) {
    case 'HT1': return 50;
    case 'LT1': return 45;
    case 'HT2': return 40;
    case 'LT2': return 35;
    case 'HT3': return 30;
    case 'LT3': return 25;
    case 'HT4': return 20;
    case 'LT4': return 15;
    case 'HT5': return 10;
    case 'LT5': return 5;
    case 'Retired': return 0;
    default: return 0;
  }
}

// Generate test players
export async function injectTestPlayers(count: number = 100): Promise<boolean> {
  try {
    const players: any[] = [];
    const gamemodeScores: any[] = [];
    
    // Define all game modes
    const gameModes = ['Crystal', 'Sword', 'SMP', 'UHC', 'Axe', 'NethPot', 'Bedwars', 'Mace'].map(mode => toGameMode(mode));
    
    // Generate players
    for (let i = 0; i < count; i++) {
      const ign = generateRandomUsername();
      const java_username = generateJavaUsername(ign);
      const region = generateRandomRegion();
      const device = generateRandomDevice();
      
      // Choose a primary gamemode for the player
      const primaryGamemode = gameModes[Math.floor(Math.random() * gameModes.length)];
      const tier_level = generateRandomTier();
      
      // Insert player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          ign,
          java_username,
          region,
          device,
          gamemode: primaryGamemode,
          tier_number: tier_level
        })
        .select('id');
      
      if (playerError) {
        console.error('Error creating test player:', playerError);
        continue;
      }
      
      if (!playerData || playerData.length === 0) {
        console.error('No player data returned after insert');
        continue;
      }
      
      const playerId = playerData[0].id;
      
      // Generate scores for each game mode (with varying probabilities)
      for (const gamemode of gameModes) {
        // 30% chance to have a ranking in each gamemode (except primary which is guaranteed)
        if (gamemode !== primaryGamemode && Math.random() > 0.3) {
          continue;
        }
        
        const tier = gamemode === primaryGamemode ? tier_level : generateRandomTier();
        const score = calculatePointsForTier(tier);
        
        gamemodeScores.push({
          player_id: playerId,
          gamemode,
          internal_tier: tier,
          display_tier: tier,
          score
        });
      }
    }
    
    // Batch insert scores
    if (gamemodeScores.length > 0) {
      const { error: scoresError } = await supabase
        .from('gamemode_scores')
        .insert(gamemodeScores);
      
      if (scoresError) {
        console.error('Error creating test scores:', scoresError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error injecting test data:', error);
    return false;
  }
}

// Get the current player count
export async function getPlayerCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error getting player count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting player count:', error);
    return 0;
  }
}

// Note: For multiple distinct test data injections, we should consider implementing
// a way to mark test data so it can be purged easily during development.
