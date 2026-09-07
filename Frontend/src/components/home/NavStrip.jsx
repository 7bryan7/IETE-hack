import SlideContent from './SlideContent.jsx';
import { SLIDES } from '../../data/content.js';

/**
 * Button rows per list item, matching the original DOM exactly.
 * Each li renders its own slide button plus buttons for the other
 * slides (hidden on mobile via u-none@to-medium). The data-id values
 * are rotated exactly like the original; the home module uses them to
 * decide which buttons carry .is-active after a goto().
 */
const NAV_BUTTONS = [
  [{ label: 'Playroom', goto: 'c-home-section-12', id: null, cls: 'u-bg-green' }],
  [
    { label: 'Tracking', goto: 'c-home-section-14', id: 'c-home-section-12', cls: 'u-bg-red' },
    { label: 'Playroom', goto: 'c-home-section-12', id: 'c-home-section-16', cls: 'u-bg-green' },
    { label: 'Feedback', goto: 'c-home-section-16', id: 'c-home-section-14', cls: 'u-bg-yellow' },
  ],
  [
    { label: 'Feedback', goto: 'c-home-section-16', id: 'c-home-section-12', cls: 'u-bg-yellow' },
    { label: 'Playroom', goto: 'c-home-section-12', id: 'c-home-section-14', cls: 'u-bg-green' },
    { label: 'Tracking', goto: 'c-home-section-14', id: 'c-home-section-16', cls: 'u-bg-red' },
  ],
];

function AccordionContent({ slide, open, forceInview }) {
  return (
    <div className={`c-accordion_content ${slide.contentClass}${open ? ' is-open' : ''}`}>
      <div className="c-accordion_content_inner">
        <div className="c-home_nav_accordion_inner">
          <div className="u-text-right">
            <img role="presentation" className="c-home_slide_image" src={slide.imageDark} alt="" />
          </div>
          <div className="c-home_nav_accordion_inner_content">
            <SlideContent slide={slide} forceInview={forceInview} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Right-edge navigation strip (desktop) + accordion (mobile).
 * Mirrors the original home module:
 *  - button click: launch (first time) then goto(target)
 *  - titles area click: close (back to hero)
 */
export default function NavStrip({ launched, activeId, openId, onButtonClick, onTitlesClick }) {
  return (
    <nav className="c-home_nav">
      <div
        className="c-home_nav_titles"
        data-home="titleHandler"
        aria-hidden="true"
        onClick={onTitlesClick}
        style={{ backgroundColor: launched ? 'rgba(0,0,0,0.05)' : 'transparent' }}
      >
        {SLIDES.map((slide) => (
          <p
            key={slide.id}
            className={`c-home_nav_titles_item c-heading -h1${activeId === slide.id ? ' is-active' : ''}`}
            data-home="title"
            data-id={slide.id}
          >
            {slide.label}
          </p>
        ))}
      </div>
      <ul className="c-home_nav_list" data-module-accordion="home-carousel">
        {NAV_BUTTONS.map((buttons, liIndex) => {
          const slide = SLIDES[liIndex];
          const isOpen = openId === slide.id;
          return (
            <li key={slide.id} className={`c-home_nav_list_item${isOpen ? ' is-open' : ''}`} data-accordion="item">
              {buttons.map((button, i) => (
                <button
                  key={i}
                  className={`c-home_nav_list_button ${button.cls}${!launched || button.id === activeId ? ' is-active' : ''}`}
                  type="button"
                  data-home="button"
                  data-accordion="toggler"
                  data-goto={button.goto}
                  data-id={button.id || undefined}
                  onClick={() => onButtonClick(button.goto, slide.id)}
                >
                  <span className="c-home_nav_list_button_label">{button.label}</span>
                </button>
              ))}
              <AccordionContent slide={slide} open={isOpen} forceInview={isOpen} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}