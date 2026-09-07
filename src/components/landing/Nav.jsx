import { useEffect, useState } from 'react';
import { Icon } from './Icons.jsx';
import { EXPLORE_LINKS, ASSISTIVE_TECH_LINKS } from '../../data/content.js';

const SUBMENUS = [
  {
    id: 'c-menu-section-14',
    eyebrow: 'Explore',
    titleLines: ['Playroom &', 'Interaction'],
    backClass: '-red-dark',
    links: EXPLORE_LINKS,
  },
  {
    id: 'c-menu-section-16',
    eyebrow: 'Skills',
    titleLines: ['Assistive Tech &', 'Coordination'],
    backClass: '-red',
    links: ASSISTIVE_TECH_LINKS,
  },
];

export default function Nav({ open, onClose, onShowCookiePrefs, onOpenFacts, onStartGame }) {
  const [submenu, setSubmenu] = useState(null);

  useEffect(() => {
    if (!open) setSubmenu(null);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <nav className="c-nav" aria-hidden={open ? 'false' : 'true'}>
      <div className="c-nav_background" />
      <ul className="c-nav_list">
        <li className="c-nav_list_item">
          <button
            className="c-nav_list_item_button"
            type="button"
            onClick={() => {
              onClose();
              if (onStartGame) onStartGame('menu');
            }}
          >
            <span>Playground</span>2.5D Motor
            <br />Playground
          </button>
        </li>
        <li className="c-nav_list_item">
          <button
            className="c-nav_list_item_button"
            type="button"
            onClick={() => setSubmenu('c-menu-section-14')}
          >
            <span>Explore</span>Game Arena &
            <br />Challenges
          </button>
        </li>
        <li className="c-nav_list_item">
          <button
            className="c-nav_list_item_button"
            type="button"
            onClick={() => setSubmenu('c-menu-section-16')}
          >
            <span>Skills</span>Assistive Tech &
            <br />Coordination
          </button>
        </li>
      </ul>
      <div className="c-nav_footer">
        <aside className="c-nav_lang_list">
          <span className="c-nav_lang u-label" title="IETE Hackathon 2026">
            IETE
          </span>
        </aside>
        <aside className="c-nav_cookie-consent_list">
          <button type="button" className="c-nav_cookie-consent" onClick={onShowCookiePrefs}>
            Privacy & Local Storage Info
          </button>
        </aside>
        <div className="c-nav_footer_ctas">
          <button type="button" className="c-nav_footer_ctas_item" onClick={onOpenFacts} aria-label="Learn facts about MotionForge">
            <span className="c-nav_footer_icon">
              <Icon id="i-fact" viewBox="0 0 144 144" />
            </span>
            <span className="u-label">Did you know?</span>
          </button>
          <button
            type="button"
            className="c-nav_footer_ctas_item"
            onClick={() => {
              onClose();
              onOpenFacts();
            }}
            aria-label="Assistive tech insights"
          >
            <span className="c-nav_footer_icon">
              <Icon id="i-quiz" />
            </span>
            <span className="u-label">Motor Insights</span>
          </button>
        </div>
      </div>
      <div className="c-nav_secondary">
        {SUBMENUS.map((menu) => (
          <div
            key={menu.id}
            className={`c-nav_secondary_item${submenu === menu.id ? ' is-open' : ''}`}
          >
            <div className="c-nav_secondary_infos">
              <button
                className={`c-nav_secondary_back c-button-round -arrow ${menu.backClass}`}
                type="button"
                onClick={() => setSubmenu(null)}
                aria-label="Close sub-menu"
              >
                <Icon id="i-arrow-left" />
              </button>
              <h2 className="c-nav_secondary_infos_heading">
                <span>{menu.eyebrow}</span>
                {menu.titleLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < menu.titleLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </h2>
            </div>
            <div className="c-nav_secondary_menu">
              <ul className="c-nav_secondary_menu_list">
                {menu.links.map((link) => (
                  <li key={link.label} className="c-nav_secondary_menu_list_item">
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        font: 'inherit',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                      }}
                      onClick={() => {
                        onClose();
                        if (link.gameView && onStartGame) {
                          onStartGame(link.gameView);
                        } else if (onOpenFacts) {
                          onOpenFacts();
                        }
                      }}
                    >
                      <span>{link.label}</span>
                      <span className="c-nav_secondary_menu_list_arrow">
                        <Icon id="i-arrow-long-right" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}