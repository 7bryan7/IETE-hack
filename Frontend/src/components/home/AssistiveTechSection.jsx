import React from 'react';

export default function AssistiveTechSection({ onOpenFacts, onStartGame }) {
  return (
    <section className="mf-section" id="assistive-tech">
      <div className="mf-assistive-card">
        <div>
          <div className="mf-assistive-eyebrow">Healthcare & Assistive Technology</div>
          <h2 className="mf-assistive-title">
            Empowering Motor Growth & Rehabilitation
          </h2>
          <p className="mf-assistive-desc">
            Created for the IETE Hackathon 2026 by Team Bug Eaters, MotionForge bridges modern
            browser-based computer vision with pediatric motor development, stroke recovery, and occupational therapy.
          </p>

          <div className="mf-assistive-bullets">
            <div className="mf-assistive-bullet">
              <span>🌟</span> Bimanual integration exercises coordination across both brain hemispheres.
            </div>
            <div className="mf-assistive-bullet">
              <span>🎯</span> Real-time path tracking reveals tremor dampening and movement fluidity.
            </div>
            <div className="mf-assistive-bullet">
              <span>🧸</span> Zero frustration: Grace periods and hysteresis prevent accidental drops.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '2.5rem', borderRadius: '28px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            Ready to Play?
          </h3>
          <p style={{ color: '#D1CFCB', fontSize: '1rem', marginBottom: '1.75rem' }}>
            Start with Reach, Catch, or calibrate your camera in under 2 minutes.
          </p>

          <button
            type="button"
            className="mf-btn-primary"
            onClick={() => onStartGame('menu')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Launch Playground 🚀
          </button>
        </div>
      </div>
    </section>
  );
}
