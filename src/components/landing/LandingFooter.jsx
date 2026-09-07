import React from 'react';
import Brand from '../Brand';

export default function LandingFooter({ onStartGame, onOpenFacts, onShowCookiePrefs }) {
  return (
    <footer className="mf-footer">
      <div className="mf-footer-inner">
        <div>
          <div className="mf-footer-brand">
            <Brand />
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
        <div className="mf-footer-credit-block">
          <div>
            Built with care by <strong>Team Bug Eaters</strong> for IETE Hackathon 2026.
          </div>
          <div className="mf-footer-contributors">
            {[
              { username: 'yugindhanam' },
              { username: 'hackerjose25' },
              { username: '7bryan7' },
            ].map((user) => (
              <a
                key={user.username}
                href={`https://github.com/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mf-contributor-chip"
                title={`GitHub: @${user.username}`}
              >
                <img
                  src={`https://github.com/${user.username}.png?size=64`}
                  alt={user.username}
                  className="mf-contributor-avatar"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span>@{user.username}</span>
              </a>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#challenges">Challenges</a>
          <a href="#camera">Camera Setup</a>
          <a href="#how-it-works">How It Works</a>
          <button
            type="button"
            style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', font: 'inherit', padding: 0 }}
            onClick={onShowCookiePrefs}
          >
            Privacy
          </button>
        </div>
      </div>
    </footer>
  );
}
