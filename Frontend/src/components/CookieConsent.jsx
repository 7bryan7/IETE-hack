import { useEffect, useState } from 'react';

export default function CookieConsent({ open, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('cc-choice')) return;
    const t = setTimeout(() => setVisible(true), 1600);
    return () => clearTimeout(t);
  }, []);

  const choose = (choice) => {
    localStorage.setItem('cc-choice', choice);
    setVisible(false);
    onClose();
  };

  const isOpen = visible || open;

  return (
    <div id="cc-main" className={`cc-main${isOpen ? ' is-open' : ''}`} role="dialog" aria-label="Cookie consent" aria-hidden={isOpen ? 'false' : 'true'}>
      <div className="cc-overlay" onClick={() => choose('declined')} />
      <div className="cc-modal">
        <div className="cc-modal_texts">
          <h2 className="cc-modal_title">We use cookies</h2>
          <p className="cc-modal_desc">
            We use cookies to ensure you get the best experience on our website. By continuing to browse, you agree to
            our use of cookies.
          </p>
        </div>
        <div className="cc-modal_btns">
          <button type="button" className="cc-btn cc-btn--primary" onClick={() => choose('accepted')}>
            Accept all
          </button>
          <button type="button" className="cc-btn cc-btn--secondary" onClick={() => choose('declined')}>
            Decline
          </button>
          <button type="button" className="cc-btn cc-btn--secondary" onClick={() => choose('declined')}>
            Manage preferences
          </button>
        </div>
      </div>
    </div>
  );
}