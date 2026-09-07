import React, { useRef, useState } from 'react';
import LandingPage from './components/LandingPage';
import Calibration from './components/Calibration';
import GameMenu from './components/GameMenu';
import ReachGame from './games/ReachGame';
import CatchGame from './games/CatchGame';
import TransferGame from './games/TransferGame';
import SequenceGame from './games/SequenceGame';
import './App.css';

export default function GameApp({ onExitToLanding, initialView = 'menu' }) {
  const videoRef = useRef(null);

  const [currentView, setCurrentView] = useState(initialView); // calibration, menu, game_reach, game_catch, game_transfer, game_sequence
  const [difficulty, setDifficulty] = useState('Medium');

  // Navigation handlers
  const handleStartLanding = () => setCurrentView('calibration');
  const handleCalibrationDone = () => setCurrentView('menu');

  const handleSelectGame = (gameId) => {
    switch (gameId) {
      case 'reach':
        setCurrentView('game_reach');
        break;
      case 'catch':
        setCurrentView('game_catch');
        break;
      case 'transfer':
        setCurrentView('game_transfer');
        break;
      case 'sequence':
        setCurrentView('game_sequence');
        break;
      default:
        setCurrentView('menu');
    }
  };

  const handleNextGame = () => {
    if (currentView === 'game_reach') setCurrentView('game_catch');
    else if (currentView === 'game_catch') setCurrentView('game_transfer');
    else if (currentView === 'game_transfer') setCurrentView('game_sequence');
    else setCurrentView('menu');
  };

  const handleHome = () => setCurrentView('menu');

  return (
    <div className="app-shell">
      {currentView === 'calibration' && (
        <Calibration
          videoRef={videoRef}
          onCalibrationComplete={handleCalibrationDone}
          onSkip={handleCalibrationDone}
          onBackToLanding={onExitToLanding}
        />
      )}

      {currentView === 'menu' && (
        <GameMenu
          onSelectGame={handleSelectGame}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onBackToLanding={onExitToLanding}
        />
      )}

      {currentView === 'game_reach' && (
        <ReachGame
          videoRef={videoRef}
          difficulty={difficulty}
          onHome={handleHome}
          onNextGame={handleNextGame}
          onExitToLanding={onExitToLanding}
        />
      )}

      {currentView === 'game_catch' && (
        <CatchGame
          videoRef={videoRef}
          difficulty={difficulty}
          onHome={handleHome}
          onNextGame={handleNextGame}
          onExitToLanding={onExitToLanding}
        />
      )}

      {currentView === 'game_transfer' && (
        <TransferGame
          videoRef={videoRef}
          difficulty={difficulty}
          onHome={handleHome}
          onNextGame={handleNextGame}
          onExitToLanding={onExitToLanding}
        />
      )}

      {currentView === 'game_sequence' && (
        <SequenceGame
          videoRef={videoRef}
          difficulty={difficulty}
          onHome={handleHome}
          onNextGame={handleNextGame}
          onExitToLanding={onExitToLanding}
        />
      )}
    </div>
  );
}
