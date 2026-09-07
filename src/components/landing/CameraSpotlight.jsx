import React from 'react';

export default function CameraSpotlight({ onStartGame }) {
  return (
    <section className="mf-section" id="camera">
      <div className="mf-camera-spotlight">
        <div>
          <div className="mf-section-eyebrow">Webcam Vision AI</div>
          <h2 className="mf-section-title">Zero Plugins. 100% In-Browser.</h2>
          <p className="mf-section-subtitle" style={{ marginBottom: '1.75rem' }}>
            MotionForge uses state-of-the-art MediaPipe hand tracking models right in your browser.
            Your webcam feed never leaves your device — complete privacy guaranteed.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
              <span style={{ color: '#02AE90' }}>✔</span> 21 3D hand coordinates tracked in real time
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
              <span style={{ color: '#02AE90' }}>✔</span> Dynamic pinch distance hysteresis prevents jitter
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
              <span style={{ color: '#02AE90' }}>✔</span> Universal mouse fallback if lighting is low
            </div>
          </div>

          <button
            type="button"
            className="mf-btn-secondary"
            onClick={() => onStartGame('calibration')}
          >
            <span>📷</span> Calibrate Your Hands Now <span>→</span>
          </button>
        </div>

        <div className="mf-camera-mockup">
          <div className="mf-camera-screen">
            <span className="mf-camera-hand-icon">🖐️</span>
            <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '10px', fontFamily: 'Montserrat, sans-serif' }}>
              MediaPipe Vision Ready
            </div>
            <span className="mf-camera-pill">● Local Camera Stream Secure</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '0.8rem', color: '#94A3B8' }}>
            <span>Dual Hand: Supported</span>
            <span>Latency: &lt; 35ms</span>
          </div>
        </div>
      </div>
    </section>
  );
}
