import React from 'react';
import { Trophy, RotateCcw, ArrowRight, Home, Star, Award, Clock, AlertTriangle, Target } from 'lucide-react';
import { getPerformanceCategory } from '../utils/scoring';

export default function ResultScreen({
  metrics,
  onPlayAgain,
  onNextChallenge,
  onHome
}) {
  const {
    gameName = 'Mission',
    accuracy = 85,
    timeSeconds = 12.4,
    errors = 2,
    coordinationScore = 82
  } = metrics || {};

  const category = getPerformanceCategory(coordinationScore);

  return (
    <div className="result-screen-overlay">
      <div className="result-card animate-pop">
        <div className="result-header">
          <div className="trophy-wrapper">
            <Trophy size={56} style={{ color: '#EA9F0E' }} className="icon-bounce" />
          </div>
          <div style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 800,
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#EA9F0E',
            marginTop: '8px',
            marginBottom: '2px'
          }}>
            Challenge Complete
          </div>
          <h2>MISSION COMPLETE 🎉</h2>
          <p className="game-name-sub">{gameName}</p>
        </div>

        {/* Star Rating */}
        <div className="stars-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={36}
              className={`star-icon ${star <= category.stars ? 'active' : 'inactive'}`}
              fill={star <= category.stars ? '#EA9F0E' : '#FFF3E5'}
              stroke={star <= category.stars ? '#D48C07' : '#EAD8C7'}
            />
          ))}
        </div>

        {/* Coordination Performance Badge */}
        <div className="performance-badge" style={{ backgroundColor: category.bg || '#FFF7EE', borderColor: category.color || '#F5B26B' }}>
          <Award size={24} style={{ color: category.color || '#EA9F0E' }} />
          <div>
            <span className="perf-label" style={{ color: category.color || '#EA9F0E' }}>
              {category.label} ({coordinationScore} / 100)
            </span>
            <p className="perf-message">{category.message}</p>
          </div>
        </div>

        {/* Key Metrics Breakdown Grid */}
        <div className="metrics-grid">
          <div className="metric-box">
            <Target size={22} style={{ color: '#02AE90' }} />
            <div className="metric-val">{accuracy}%</div>
            <div className="metric-name">Accuracy</div>
          </div>

          <div className="metric-box">
            <Clock size={22} style={{ color: '#EA9F0E' }} />
            <div className="metric-val">{timeSeconds.toFixed(1)}s</div>
            <div className="metric-name">Time Taken</div>
          </div>

          <div className="metric-box">
            <AlertTriangle size={22} style={{ color: '#FF7673' }} />
            <div className="metric-val">{errors}</div>
            <div className="metric-name">Errors</div>
          </div>

          <div className="metric-box">
            <Award size={22} style={{ color: '#02AE90' }} />
            <div className="metric-val">{coordinationScore}</div>
            <div className="metric-name">Coordination</div>
          </div>
        </div>

        {/* Non-medical Disclaimer */}
        <p className="result-disclaimer">
          *Performance metrics are calculated for game feedback only and are not medical diagnostic values.
        </p>

        {/* Actions */}
        <div className="result-actions">
          <button className="btn btn-secondary" onClick={onPlayAgain}>
            <RotateCcw size={18} /> Play Again
          </button>

          <button className="btn btn-primary btn-pulse" onClick={onNextChallenge}>
            Next Challenge <ArrowRight size={18} />
          </button>

          <button className="btn btn-icon-text" onClick={onHome} title="Home">
            <Home size={18} /> Menu
          </button>
        </div>
      </div>
    </div>
  );
}

