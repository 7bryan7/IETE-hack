import React from 'react';
import { Target, Hand, ArrowRightLeft, Puzzle, Play, Settings, Sparkles } from 'lucide-react';

export default function GameMenu({ onSelectGame, difficulty, setDifficulty, onBackToLanding }) {
  const games = [
    {
      id: 'reach',
      name: 'Reach Challenge',
      icon: Target,
      emoji: '🎯',
      color: 'green',
      description: 'Touch circular targets as fast as you can using your index fingertip!',
      badge: 'Game 1 • Speed'
    },
    {
      id: 'catch',
      name: 'Catch Challenge',
      icon: Hand,
      emoji: '🖐️',
      color: 'coral',
      description: 'Pinch your thumb & finger together to grab stars, fruits, and bubbles!',
      badge: 'Game 2 • Pinch'
    },
    {
      id: 'transfer',
      name: 'Hand Transfer',
      icon: ArrowRightLeft,
      emoji: '🔄',
      color: 'yellow',
      description: 'Pick up an object with one hand and pass it over to your other hand!',
      badge: 'Game 3 • Bimanual'
    },
    {
      id: 'sequence',
      name: 'Sequence Challenge',
      icon: Puzzle,
      emoji: '🧩',
      color: 'purple',
      description: 'Follow multi-step movement orders to test your spatial motor planning!',
      badge: 'Game 4 • Planning'
    }
  ];

  return (
    <div className="game-menu">
      <div className="menu-header">
        {onBackToLanding && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginBottom: '16px', alignSelf: 'center', padding: '8px 18px', fontSize: '13px' }}
            onClick={onBackToLanding}
          >
            ← Back to Landing Page
          </button>
        )}
        <div style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 800,
          fontSize: '0.82rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#EA9F0E',
          marginBottom: '0.5rem'
        }}>
          Play & Practice Arena
        </div>
        <h1 className="menu-title">
          Motion<span style={{ color: '#02AE90' }}>Forge</span> 🖐️
        </h1>
        <p className="menu-subtitle">Move Your Hands • Master Motor Skills • Have Fun!</p>
      </div>

      {/* Difficulty selector bar */}
      <div className="difficulty-bar">
        <span className="diff-label"><Settings size={16} /> Difficulty:</span>
        {['Easy', 'Medium', 'Hard'].map((diff) => (
          <button
            key={diff}
            className={`btn-diff ${difficulty === diff ? 'active' : ''}`}
            onClick={() => setDifficulty(diff)}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* 4 Main Game Cards */}
      <div className="menu-grid">
        {games.map((game) => {
          const IconComp = game.icon;
          return (
            <div key={game.id} className={`game-card ${game.color}`}>
              <div className="card-top">
                <span className="card-badge">{game.badge}</span>
                <span className="card-emoji">{game.emoji}</span>
              </div>

              <div className={`card-icon-wrapper ${game.color}`}>
                <IconComp size={40} />
              </div>

              <h3 className="card-title">{game.name}</h3>
              <p className="card-desc">{game.description}</p>

              <button
                className="btn btn-primary btn-card"
                onClick={() => onSelectGame(game.id)}
              >
                <Play size={18} fill="currentColor" /> Start Mission
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

