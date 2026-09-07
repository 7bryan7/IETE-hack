import { useEffect, useState } from 'react';
import { Icon } from './Icons.jsx';
import { FACTS } from '../../data/content.js';

export default function FactsModal({ open, onClose }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % FACTS.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + FACTS.length) % FACTS.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <aside id="c-facts-modal" className={`c-facts${open ? ' is-open' : ''}`} aria-hidden={open ? 'false' : 'true'}>
      <div className="c-facts_background" onClick={onClose} />
      <button id="c-facts-modal-close" className="c-facts_close c-button-wrap" type="button" onClick={onClose} aria-label="Close modal">
        <span className="c-button-round -white">
          <Icon id="i-close" />
        </span>
        <span className="c-facts_close_label">Close</span>
      </button>
      <div className="c-facts_container">
        <div className="o-container">
          <section className="c-facts_inner c-slider -facts">
            <header className="c-slider_header">
              <h2 className="u-label">Did you know?</h2>
            </header>
            <p className="c-slider_counter">
              <span className="c-slider_counter_value">{index + 1}</span>
              {' / '}
              <span className="c-slider_counter_length">{FACTS.length}</span>
            </p>
            <div className="c-slider_slider">
              <div className="c-slider_track" style={{ transform: `translateX(${-index * 100}%)` }}>
                {FACTS.map((fact, i) => (
                  <article key={i} className="c-slider_slide">
                    <div className="c-slider_slide_inner">
                      <img role="presentation" className="c-slider_slide_icon" src="assets/fact.svg" alt="" />
                      <p className="c-slider_slide_text">{fact}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="c-circle-button c-slider_prev c-slider_controls_button">
              <button
                id="c-facts-slider-prev"
                className="c-circle-button_button"
                type="button"
                onClick={() => setIndex((i) => (i - 1 + FACTS.length) % FACTS.length)}
                aria-label="Previous fact"
              >
                <span className="c-circle-button_wrap">
                  <span className="c-circle-button_icon">
                    <Icon id="i-arrow-left" />
                  </span>
                </span>
              </button>
            </div>
            <div className="c-circle-button c-slider_next c-slider_controls_button">
              <button
                id="c-facts-slider-next"
                className="c-circle-button_button"
                type="button"
                onClick={() => setIndex((i) => (i + 1) % FACTS.length)}
                aria-label="Next fact"
              >
                <span className="c-circle-button_wrap">
                  <span className="c-circle-button_icon">
                    <Icon id="i-arrow-right" />
                  </span>
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}