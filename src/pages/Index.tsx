
import React, { useState, useCallback, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MinecraftLeaderboardTable } from '../components/MinecraftLeaderboardTable';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { TierGrid } from '../components/TierGrid';
import { usePopup } from '../contexts/PopupContext';
import { useNavigate } from 'react-router-dom';
import { GameMode, Player } from '../services/playerService';
import { toDatabaseGameMode } from '@/utils/gamemodeCasing';
import { getPlayerRank } from '@/utils/rankUtils';
import { usePointsCalculation } from '@/hooks/usePointsCalculation';
import { FloatingChatButton } from '../components/FloatingChatButton';
import WelcomePopup from '../components/WelcomePopup';
import { useWelcomePopup } from '../hooks/useWelcomePopup';

const Index = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode | 'overall'>('overall');
  
  const { players, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard();
  const { openPopup } = usePopup();
  const { showWelcome, visitorNumber, closeWelcome } = useWelcomePopup();
  
  // Enable automatic points calculation
  usePointsCalculation();

  // Memoize the player click handler to prevent unnecessary re-renders
  const handlePlayerClick = useCallback((player: Player) => {
    const rankInfo = getPlayerRank(player.global_points || 0);
    
    const tierAssignments = (player.tierAssignments || []).map(assignment => ({
      gamemode: assignment.gamemode,
      tier: assignment.tier,
      score: assignment.score
    }));
    
    openPopup({
      player,
      tierAssignments,
      combatRank: {
        title: rankInfo.title,
        points: player.global_points || 0,
        color: rankInfo.color,
        effectType: 'general',
        rankNumber: player.overall_rank || 1,
        borderColor: rankInfo.borderColor
      },
      timestamp: new Date().toISOString()
    });
  }, [openPopup]);

  // Memoize the mode selection handler
  const handleSelectMode = useCallback((mode: string) => {
    setSelectedMode(mode as GameMode | 'overall');
  }, []);

  // Memoize the loading and error states
  const loading = leaderboardLoading;
  const error = leaderboardError;

  // Memoize the main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-white">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 text-center py-8">
          Error: {error}
        </div>
      );
    }

    if (selectedMode === 'overall') {
      return (
        <div className="w-full simple-animation">
          <MinecraftLeaderboardTable 
            players={players}
            onPlayerClick={handlePlayerClick} 
          />
        </div>
      );
    }

    return (
      <div className="w-full simple-animation">
        <TierGrid 
          selectedMode={toDatabaseGameMode(selectedMode)}
          onPlayerClick={handlePlayerClick} 
        />
      </div>
    );
  }, [loading, error, selectedMode, players, handlePlayerClick]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-dark">
      <Navbar 
        selectedMode={selectedMode} 
        onSelectMode={handleSelectMode} 
        navigate={navigate} 
      />
      
      <main className="flex-grow w-full">
        <div className="w-full px-2 py-3">
          {mainContent}
        </div>
      </main>
      
      <Footer />
      
      {/* Floating Chat Button */}
      <FloatingChatButton />
      
      {/* Welcome Popup - One time only */}
      <WelcomePopup 
        isOpen={showWelcome}
        onClose={closeWelcome}
        visitorNumber={visitorNumber}
      />
    </div>
  );
};

export default React.memo(Index);
