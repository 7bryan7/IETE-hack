import React from 'react';
import { Play, Sparkles, Target, Hand, ArrowRightLeft, ShieldAlert, Award } from 'lucide-react';

export default function LandingPage({ onStartClick, onCalibrateClick }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>Interactive Computer Vision Gaming</span>
        </div>

        <h1 className="hero-title">
          MotionForge <span className="hand-emoji">🖐️</span>
        </h1>
        <p className="hero-subtitle">Turn Movement Into Play.</p>

        <p className="hero-description">
          An interactive webcam-based game that helps children practice hand-eye coordination, 
          motor planning, hand-to-hand transfer, and sequential physical activities through fun real-time challenges.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-hero" onClick={onStartClick}>
            <Sparkles size={22} /> Explore Open Worlds
          </button>
          <button className="btn btn-primary btn-hero" onClick={onCalibrateClick}>
            <Play size={22} fill="currentColor" /> Start Playing Now
          </button>
          <a href="#how-it-works" className="btn btn-secondary btn-hero">
            How It Works
          </a>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="how-it-works" className="features-section">
        <h2 className="section-title">Designed for Fun & Coordination 🚀</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon cyan">
              <Hand size={32} />
            </div>
            <h3>Real-Time Hand Tracking</h3>
            <p>
              Tracks up to two hands simultaneously using browser AI computer vision. 
              No controllers or extra sensors required!
            </p>
          </div>

          <div className="feature-card purple">
            <div className="feature-icon purple">
              <Target size={32} />
            </div>
            <h3>Interactive Movement Games</h3>
            <p>
              Engaging missions: reach dynamic targets, pinch & catch virtual objects, 
              transfer items between hands, and solve spatial sequences.
            </p>
          </div>

          <div className="feature-card emerald">
            <div className="feature-icon emerald">
              <Award size={32} />
            </div>
            <h3>Performance Insights</h3>
            <p>
              Calculates accuracy %, completion time, movement trails, and coordination scores 
              after every round to encourage steady improvement.
            </p>
          </div>
        </div>
      </section>

      {/* Game Cards Preview */}
      <section className="games-preview-section">
        <h2 className="section-title">Explore 4 Active Missions 🎮</h2>
        <div className="preview-grid">
          <div className="preview-card">
            <div className="preview-badge">Mission 1</div>
            <h4>🎯 Reach Challenge</h4>
            <p>Touch random targets quickly with your index fingertip.</p>
          </div>
          <div className="preview-card">
            <div className="preview-badge">Mission 2</div>
            <h4>🖐️ Catch Challenge</h4>
            <p>Pinch fingers together to catch floating stars, fruits, and bubbles.</p>
          </div>
          <div className="preview-card">
            <div className="preview-badge">Mission 3</div>
            <h4>🔄 Hand Transfer</h4>
            <p>Grab an object with one hand and pass it smoothly to the other hand.</p>
          </div>
          <div className="preview-card">
            <div className="preview-badge">Mission 4</div>
            <h4>🧩 Sequence Challenge</h4>
            <p>Follow step-by-step motor planning tasks in exact order.</p>
          </div>
        </div>
      </section>

      {/* Safety Disclaimer Banner */}
      <section className="disclaimer-banner">
        <ShieldAlert size={20} className="disclaimer-icon" />
        <p>
          <strong>Safety & Usage Disclaimer:</strong> MotionForge provides game-based movement activities 
          and performance metrics. It is not a medical diagnostic or rehabilitation tool.
        </p>
      </section>
    </div>
  );
}

