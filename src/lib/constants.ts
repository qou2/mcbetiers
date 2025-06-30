
import { GameMode, TierLevel } from '@/services/playerService';
import { Gem, Sword, Server, Heart, Axe, FlaskConical, BedDouble, BowArrow } from 'lucide-react';

export const GAMEMODES: { name: GameMode; icon: React.ElementType }[] = [
  { name: 'Crystal', icon: Gem },
  { name: 'Mifight', icon: Sword },
  { name: 'Skywars', icon: BowArrow },
  { name: 'UHC', icon: Heart },
  { name: 'Bridge', icon: Axe },
  { name: 'Nodebuff', icon: FlaskConical },
  { name: 'Bedfight', icon: BedDouble },
  { name: 'Sumo', icon: Axe },
];

export const GAME_MODES: GameMode[] = ['Crystal', 'Mifight', 'Skywars', 'UHC', 'Bridge', 'Nodebuff', 'Bedfight', 'Sumo'];

export const TIER_LEVELS: TierLevel[] = ['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5', 'Retired', 'Not Ranked'];

export const REGIONS = ['NA', 'EU', 'AS', 'OC', 'SA', 'AF'] as const;

export const DEVICES = ['PC', 'Mobile', 'Console'] as const;
