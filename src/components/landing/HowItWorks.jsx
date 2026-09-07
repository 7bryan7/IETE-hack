import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Turn on Camera',
      desc: 'No apps or downloads. Just allow webcam access in your browser. All frames stay private on your machine.'
    },
    {
      num: '02',
      title: 'Calibrate Hands',
      desc: 'Raise one or both hands. The AI model locks onto your fingertips and joint landmarks in under 2 seconds.'
    },
    {
      num: '03',
      title: 'Play & Pinch',
      desc: 'Reach for targets, pinch your thumb and index finger to grab stars, and pass objects between hands.'
    },
    {
      num: '04',
      title: 'Review Progress',
      desc: 'Get immediate positive feedback on precision, movement efficiency, accuracy, and coordination score.'
    }
  ];

  return (
    <section className="mf-section" id="how-it-works">
      <div className="mf-section-header">
        <div className="mf-section-eyebrow">The Practice Loop</div>
        <h2 className="mf-section-title">How MotionForge Works</h2>
        <p className="mf-section-subtitle">
          Turn fine motor rehabilitation and pediatric coordination practice into an engaging,
          rewarding video game experience.
        </p>
      </div>

      <div className="mf-steps-grid">
        {steps.map((s) => (
          <div key={s.num} className="mf-step-card">
            <div className="mf-step-num">{s.num}</div>
            <h3 className="mf-step-title">{s.title}</h3>
            <p className="mf-step-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
