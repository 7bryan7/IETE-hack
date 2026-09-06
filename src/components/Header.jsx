import React from 'react';
import { Home, Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function Header({
  gameTitle,
  elapsedTime = 0,
  score = 0,
  errors = 0,
  difficulty = 'Medium',
  onHomeClick
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="game-header">
      <div className="header-brand" onClick={onHomeClick} title="Return to Menu">
        <span className="brand-logo">🖐️</span>
        <span className="brand-title">MotionForge</span>
        {gameTitle && <span className="game-title-tag">| {gameTitle}</span>}
      </div>

      <div className="header-stats">
        <div className="stat-pill timer" title="Elapsed Time">
          <Clock size={18} className="stat-icon" />
          <span>{formatTime(elapsedTime)}</span>
        </div>

        <div className="stat-pill score" title="Current Score">
          <Zap size={18} className="stat-icon" />
          <span>{score} pts</span>
        </div>

        <div className="stat-pill errors" title="Errors / Misses">
          <AlertTriangle size={18} className="stat-icon" />
          <span>{errors} err</span>
        </div>

        <div className={`stat-pill difficulty ${difficulty.toLowerCase()}`}>
          <ShieldCheck size={16} />
          <span>{difficulty}</span>
        </div>
      </div>

      <div className="header-actions">
        <button className="btn-icon" onClick={onHomeClick} title="Back to Main Menu">
          <Home size={20} />
        </button>
      </div>
    </header>
  );
}

