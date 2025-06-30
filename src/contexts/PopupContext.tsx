
import React, { createContext, useContext, useState } from 'react';
import { GameMode, TierLevel, Player } from '@/services/playerService';

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
    effectType: string;
    rankNumber: number;
    borderColor: string;
  };
  timestamp: string;
}

interface PopupContextType {
  showPopup: boolean;
  popupData: ResultPopupData | null;
  openPopup: (data: ResultPopupData) => void;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<ResultPopupData | null>(null);

  const openPopup = (data: ResultPopupData) => {
    setPopupData(data);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupData(null);
  };

  return (
    <PopupContext.Provider value={{ showPopup, popupData, openPopup, closePopup }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}
