import React from 'react';
import { Play, Sparkles } from 'lucide-react';

export default function Instructions({ title, steps, emoji = '🎯', onStart }) {
  return (
    <div className="instructions-overlay">
      <div className="instructions-card animate-pop">
        <div className="instructions-header">
          <span className="inst-emoji">{emoji}</span>
          <h2>{title}</h2>
          <p className="inst-sub">Read instructions below and start when ready!</p>
        </div>

        <div className="instructions-steps">
          {steps.map((step, idx) => (
            <div key={idx} className="step-item">
              <div className="step-num">{idx + 1}</div>
              <div className="step-text">{step}</div>
            </div>
          ))}
        </div>

        <div className="instructions-footer">
          <button className="btn btn-primary btn-large pulse-glow" onClick={onStart}>
            <Play size={22} fill="currentColor" /> Ready, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
}

