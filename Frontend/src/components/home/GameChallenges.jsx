import React from 'react';

export default function GameChallenges({ onStartGame }) {
  const challenges = [
    {
      id: 'game_reach',
      badge: 'Challenge 01 • Speed & Accuracy',
      emoji: '🎯',
      title: 'Target Reach Challenge',
      desc: 'Touch circular targets as fast as you can using your index fingertip! Measures movement path accuracy and reaction response times.',
      tags: ['Index Fingertip', 'Visual Reaction', 'Path Deviation'],
      colorClass: 'card-green',
      btnLabel: 'Play Reach Challenge'
    },
    {
      id: 'game_catch',
      badge: 'Challenge 02 • Pinch Gestures',
      emoji: '🖐️',
      title: 'Star & Bubble Catch',
      desc: 'Bring your thumb and index finger together to catch falling stars and floating bubbles! Includes smart hysteresis to prevent accidental drops.',
      tags: ['Pinch Detection', 'Grip Hysteresis', 'Timing Practice'],
      colorClass: 'card-coral',
      btnLabel: 'Play Catch Challenge'
    },
    {
      id: 'game_transfer',
      badge: 'Challenge 03 • Bimanual Coordination',
      emoji: '🔄',
      title: 'Two-Hand Object Transfer',
      desc: 'Pick up an object with your left hand, lift it, and smoothly pass it over to your right hand in mid-air. Exercises bilateral brain & motor sync.',
      tags: ['Two-Hand Sync', 'Mid-Air Transfer', 'Bilateral Therapy'],
      colorClass: 'card-yellow',
      btnLabel: 'Play Transfer Challenge'
    },
    {
      id: 'game_sequence',
      badge: 'Challenge 04 • Spatial Motor Planning',
      emoji: '🧩',
      title: 'Motor Sequence Challenge',
      desc: 'Remember and execute multi-step movement orders to complete spatial goals. Tests motor memory, action planning, and spatial precision.',
      tags: ['Motor Planning', 'Sequential Action', 'Working Memory'],
      colorClass: 'card-purple',
      btnLabel: 'Play Sequence Challenge'
    }
  ];

  return (
    <section className="mf-section" id="challenges">
      <div className="mf-section-header">
        <div className="mf-section-eyebrow">Play & Practice Arena</div>
        <h2 className="mf-section-title">4 Dynamic Motor Challenges</h2>
        <p className="mf-section-subtitle">
          Designed for children and individuals practicing fine-motor coordination,
          rehabilitation, and bilateral hand control. Click any challenge to play!
        </p>
      </div>

      <div className="mf-cards-grid">
        {challenges.map((c) => (
          <div key={c.id} className={`mf-card ${c.colorClass}`}>
            <div>
              <div className="mf-card-top">
                <span className="mf-card-badge">{c.badge}</span>
                <span className="mf-card-emoji">{c.emoji}</span>
              </div>

              <h3 className="mf-card-title">{c.title}</h3>
              <p className="mf-card-desc">{c.desc}</p>

              <div className="mf-card-features">
                {c.tags.map((tag) => (
                  <span key={tag} className="mf-card-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="mf-card-btn"
              onClick={() => onStartGame(c.id)}
            >
              <span>▶</span> {c.btnLabel} <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
