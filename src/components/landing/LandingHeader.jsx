import React from 'react';
import { Gamepad2 } from 'lucide-react';
import Brand from '../Brand';

export default function LandingHeader({ onStartGame }) {
  return (
    <header className="mf-navbar">
      <a href="#home" className="mf-navbar-brand" aria-label="MotionForge home">
        <Brand />
      </a>
      <nav className="mf-navbar-links" aria-label="Main navigation">
        <a href="#challenges">Challenges</a>
        <a href="#camera">Camera AI</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#assistive-tech">Assistive Tech</a>
      </nav>
      {onStartGame && (
        <button className="mf-navbar-play" type="button" onClick={() => onStartGame('menu')}>
          <Gamepad2 size={18} aria-hidden="true" />
          Play Now
        </button>
      )}
    </header>
  );
}
