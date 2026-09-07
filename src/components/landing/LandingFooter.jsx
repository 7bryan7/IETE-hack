import React from 'react';

export default function LandingFooter({ onStartGame, onOpenFacts, onShowCookiePrefs }) {
  return (
    <footer className="mf-footer">
      <div className="mf-footer-inner">
        <div>
          <div className="mf-footer-brand">
            <span>🖐️</span> MOTION<span style={{ color: '#02AE90' }}>FORGE</span>
          </div>
          <p className="mf-footer-tagline">
            2.5D Motor-Practice Playground • Play, Move, Improve
          </p>
        </div>

        <div className="mf-footer-actions">
          <button
            type="button"
            className="mf-btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            onClick={() => onStartGame('menu')}
          >
            🎮 Play Games
          </button>
          <button
            type="button"
            className="mf-btn-secondary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            onClick={onOpenFacts}
          >
            💡 Did You Know?
          </button>
        </div>
      </div>

      <div className="mf-footer-bottom">
        <div>
          Built with care by <strong>Team Bug Eaters</strong> for IETE Hackathon 2026.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#challenges">Challenges</a>
          <a href="#camera">Camera Setup</a>
          <a href="#how-it-works">How It Works</a>
          <button
            type="button"
            style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={onShowCookiePrefs}
          >
            Privacy
          </button>
        </div>
      </div>
    </footer>
  );
}
