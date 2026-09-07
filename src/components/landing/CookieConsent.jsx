import { useEffect, useState } from 'react';

export default function CookieConsent({ open, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('mf-privacy-ack')) return;
    const t = setTimeout(() => setVisible(true), 1600);
    return () => clearTimeout(t);
  }, []);

  const choose = (choice) => {
    localStorage.setItem('mf-privacy-ack', choice);
    setVisible(false);
    onClose();
  };

  const isOpen = visible || open;

  return (
    <div id="cc-main" className={`cc-main${isOpen ? ' is-open' : ''}`} role="dialog" aria-label="Privacy notice" aria-hidden={isOpen ? 'false' : 'true'}>
      <div className="cc-overlay" onClick={() => choose('acknowledged')} />
      <div className="cc-modal">
        <div className="cc-modal_texts">
          <h2 className="cc-modal_title">🔒 100% In-Browser Privacy</h2>
          <p className="cc-modal_desc">
            MotionForge runs all computer vision directly in your browser. <strong>No webcam video or frames are ever recorded or uploaded.</strong> Practice history is stored purely on your local device.
          </p>
        </div>
        <div className="cc-modal_btns">
          <button type="button" className="cc-btn cc-btn--primary" onClick={() => choose('acknowledged')}>
            Got it, Let's Play!
          </button>
          <button type="button" className="cc-btn cc-btn--secondary" onClick={() => choose('acknowledged')}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}