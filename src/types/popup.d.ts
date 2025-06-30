
import { GameMode, TierLevel, Player } from '@/services/playerService';

declare global {
  interface TierAssignment {
    gamemode: GameMode;
    tier: TierLevel;
    score: number;
  }
  
  interface ResultPopupData {
    player: Player;
    tierAssignments: TierAssignment[];
    combatRank: {
      title: string;
      points: number;
      color: string;
      effectType: 'general';
      rankNumber: number;
      borderColor: string;
    };
    timestamp: string;
  }
}
