import React from 'react';
import CircleButton from './CircleButton.jsx';
import Drops from './Drops.jsx';
import { HERO_DROPS } from '../../data/content.js';

export default function Hero({ onStartGame, onOpenFacts }) {
  return (
    <section className="mf-hero" id="home">
      <div className="mf-hero-grid">
        <div className="mf-hero-content">
          <div className="mf-badge">
            <span>✨</span> 2.5D Motor Practice Playground • IETE 2026
          </div>

          <h1 className="mf-hero-title">
            Move Your Hands. <br />
            <span className="highlight-coral">Grab Objects.</span> <br />
            Level Up <span className="highlight-green">Motor Skills!</span>
          </h1>

          <p className="mf-hero-subtitle">
            A playful, webcam-powered 2.5D motor playground for hand-eye coordination,
            pinch gestures, and bimanual transfer. 100% private in your browser with zero installation!
          </p>

          <div className="mf-hero-actions">
            <button
              type="button"
              className="mf-btn-primary"
              onClick={() => onStartGame('menu')}
              id="hero-play-games-btn"
            >
              <span>🎮</span> Play All Games <span>→</span>
            </button>

            <button
              type="button"
              className="mf-btn-secondary"
              onClick={() => onStartGame('calibration')}
              id="hero-calibrate-btn"
            >
              <span>📷</span> Calibrate Camera
            </button>
          </div>

          <div className="mf-quick-challenges">
            <span className="mf-quick-label">Direct Play:</span>
            <button
              type="button"
              className="mf-chip"
              onClick={() => onStartGame('game_reach')}
              title="Launch Reach Challenge"
            >
              🎯 Reach
            </button>
            <button
              type="button"
              className="mf-chip"
              onClick={() => onStartGame('game_catch')}
              title="Launch Catch Challenge"
            >
              🖐️ Catch
            </button>
            <button
              type="button"
              className="mf-chip"
              onClick={() => onStartGame('game_transfer')}
              title="Launch Hand Transfer Challenge"
            >
              🔄 Transfer
            </button>
            <button
              type="button"
              className="mf-chip"
              onClick={() => onStartGame('game_sequence')}
              title="Launch Sequence Challenge"
            >
              🧩 Sequence
            </button>
          </div>
        </div>

        <div className="mf-hero-visual">
          <div className="mf-mascot-wrapper">
            <img
              src="assets/mascot.svg"
              alt="MotionForge Superhero Mascot"
              className="mf-mascot-img"
            />
            <div className="mf-hero-circle-btn">
              <CircleButton onOpenVideo={() => onStartGame('calibration')} />
            </div>
          </div>
          <div className="c-home_main_drops" aria-hidden="true">
            <Drops items={HERO_DROPS} />
          </div>
        </div>
      </div>

      {/* Feature stats pills */}
      <div className="mf-stats-bar">
        <div className="mf-stat-item">
          <div className="mf-stat-icon-wrap green">🎯</div>
          <div>
            <div className="mf-stat-num">4 Challenges</div>
            <div className="mf-stat-desc">Target, Catch, Transfer & Sequence</div>
          </div>
        </div>

        <div className="mf-stat-item">
          <div className="mf-stat-icon-wrap coral">🖐️</div>
          <div>
            <div className="mf-stat-num">21-Pt Dual AI</div>
            <div className="mf-stat-desc">MediaPipe sub-50ms hand tracking</div>
          </div>
        </div>

        <div className="mf-stat-item">
          <div className="mf-stat-icon-wrap yellow">🤏</div>
          <div>
            <div className="mf-stat-num">Smart Pinch</div>
            <div className="mf-stat-desc">Dual threshold hysteresis & grace window</div>
          </div>
        </div>

        <div className="mf-stat-item">
          <div className="mf-stat-icon-wrap purple">🔒</div>
          <div>
            <div className="mf-stat-num">100% Private</div>
            <div className="mf-stat-desc">All vision processed locally in browser</div>
          </div>
        </div>
      </div>
    </section>
  );
}