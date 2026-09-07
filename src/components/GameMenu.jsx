import React from 'react';
import { Target, Hand, ArrowRightLeft, Puzzle, Play, Settings, Sparkles } from 'lucide-react';

export default function GameMenu({ onSelectGame, difficulty, setDifficulty }) {
  const games = [
    {
      id: 'reach',
      name: 'Reach Challenge',
      icon: Target,
      emoji: '🎯',
      color: 'cyan',
      description: 'Touch circular targets as fast as you can using your index fingertip!',
      badge: 'Game 1'
    },
    {
      id: 'catch',
      name: 'Catch Challenge',
      icon: Hand,
      emoji: '🖐️',
      color: 'purple',
      description: 'Pinch your thumb & finger together to grab stars, fruits, and bubbles!',
      badge: 'Game 2'
    },
    {
      id: 'transfer',
      name: 'Hand Transfer',
      icon: ArrowRightLeft,
      emoji: '🔄',
      color: 'emerald',
      description: 'Pick up an object with one hand and pass it over to your other hand!',
      badge: 'Game 3 • Core'
    },
    {
      id: 'sequence',
      name: 'Sequence Challenge',
      icon: Puzzle,
      emoji: '🧩',
      color: 'amber',
      description: 'Follow multi-step movement orders to test your spatial motor planning!',
      badge: 'Game 4'
    }
  ];

  return (
    <div className="game-menu">
      <div className="menu-header">
        <h1 className="menu-title">MotionForge 🖐️</h1>
        <p className="menu-subtitle">Play • Move • Improve</p>
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

