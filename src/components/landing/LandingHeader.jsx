import React from 'react';
import Brand from '../Brand';

export default function Header({ onNavToggle, onStartGame }) {
  return (
    <header className="c-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <a href="#home" className="c-header_button" aria-label="MotionForge 2.5D Playground">
        <Brand />
      </a>

      <nav className="u-none@to-medium" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <a href="#challenges" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#4A4643', letterSpacing: '0.04em' }}>
          Challenges
        </a>
        <a href="#camera" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#4A4643', letterSpacing: '0.04em' }}>
          Camera AI
        </a>
        <a href="#how-it-works" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#4A4643', letterSpacing: '0.04em' }}>
          How It Works
        </a>
        <a href="#assistive-tech" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#4A4643', letterSpacing: '0.04em' }}>
          Assistive Tech
        </a>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onStartGame && (
          <button
            type="button"
            className="u-none@to-medium"
            style={{
              background: '#EA9F0E',
              color: '#FFFFFF',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.04em',
              padding: '0.65rem 1.35rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 159, 14, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => onStartGame('menu')}
          >
            <span>🎮</span> Play Now
          </button>
        )}

        <button className="c-header_button -nav" type="button" onClick={onNavToggle} aria-label="Toggle navigation menu">
          <span className="c-header_button_icon -logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '16px' }}>✨</span>
          </span>
          <span className="c-header_button_label u-label">
            <span className="c-header_button_label_inner -main">Menu</span>
            <span className="c-header_button_label_inner -hover">Close</span>
          </span>
          <span className="c-header_button_burger" />
        </button>
      </div>
    </header>
  );
}
