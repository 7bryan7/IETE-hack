import React from 'react';
import { Home, Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function Header({
  gameTitle,
  elapsedTime = 0,
  score = 0,
  errors = 0,
  difficulty = 'Medium',
  onHomeClick,
  onExitToLanding
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="game-header">
      <div className="header-brand" onClick={onExitToLanding || onHomeClick} title="Exit to Landing Page" style={{ cursor: 'pointer' }}>
        <span className="brand-logo">🖐️</span>
        <span className="brand-title">
          MOTION<span className="brand-title-accent">FORGE</span>
        </span>
        {gameTitle && <span className="game-title-tag">🎮 {gameTitle}</span>}
      </div>

      <div className="header-stats">
        <div className="stat-pill timer" title="Elapsed Time">
          <Clock size={16} className="stat-icon" />
          <span>{formatTime(elapsedTime)}</span>
        </div>

        <div className="stat-pill score" title="Current Score">
          <Zap size={16} className="stat-icon" />
          <span>{score} pts</span>
        </div>

        <div className="stat-pill errors" title="Errors / Misses">
          <AlertTriangle size={16} className="stat-icon" />
          <span>{errors} err</span>
        </div>

        <div className={`stat-pill difficulty ${difficulty.toLowerCase()}`}>
          <ShieldCheck size={15} />
          <span>{difficulty}</span>
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="btn-icon" onClick={onHomeClick} title="Back to Game Menu">
          <Home size={18} />
        </button>
        {onExitToLanding && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '7px 14px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}
            onClick={onExitToLanding}
            title="Exit to Landing Page"
          >
            ← Exit to Home
          </button>
        )}
      </div>
    </header>
  );
}
