import { useEffect, useState } from 'react';
import { Icon } from './Icons.jsx';
import { PUPILS_LINKS, CHEFS_LINKS } from '../data/content.js';

const SUBMENUS = [
  {
    id: 'c-menu-section-14',
    eyebrow: 'Pupils',
    titleLines: ['The Encyclopedia', 'of Maple'],
    backClass: '-red-dark',
    links: PUPILS_LINKS,
  },
  {
    id: 'c-menu-section-16',
    eyebrow: 'Junior Chefs',
    titleLines: ['Recipes', 'for Kids'],
    backClass: '-red',
    links: CHEFS_LINKS,
  },
];

export default function Nav({ open, onClose, onShowCookiePrefs, onOpenFacts }) {
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
          <a href="https://kids.maplefromcanada.ca/teach/" className="c-nav_list_item_button">
            <span>Educators</span>Educational
            <br />Kit
          </a>
        </li>
        <li className="c-nav_list_item">
          <button
            className="c-nav_list_item_button"
            type="button"
            onClick={() => setSubmenu('c-menu-section-14')}
          >
            <span>Pupils</span>The Encyclopedia
            <br />of Maple
          </button>
        </li>
        <li className="c-nav_list_item">
          <button
            className="c-nav_list_item_button"
            type="button"
            onClick={() => setSubmenu('c-menu-section-16')}
          >
            <span>Junior Chefs</span>Recipes
            <br />for Kids
          </button>
        </li>
      </ul>
      <div className="c-nav_footer">
        <aside className="c-nav_lang_list">
          <a href="https://jeunesse.erableduquebec.ca/" className="c-nav_lang u-label" aria-label="Français">
            fr
          </a>
        </aside>
        <aside className="c-nav_cookie-consent_list">
          <button type="button" className="c-nav_cookie-consent" onClick={onShowCookiePrefs}>
            Manage my cookie preferences
          </button>
        </aside>
        <div className="c-nav_footer_ctas">
          <button type="button" className="c-nav_footer_ctas_item" onClick={onOpenFacts} aria-label="Learn the facts of maple">
            <span className="c-nav_footer_icon">
              <Icon id="i-fact" viewBox="0 0 144 144" />
            </span>
            <span className="u-label">Did you know?</span>
          </button>
          <a href="https://kids.maplefromcanada.ca/quiz/" className="c-nav_footer_ctas_item" aria-label="Take the maple quiz">
            <span className="c-nav_footer_icon">
              <Icon id="i-quiz" />
            </span>
            <span className="u-label">Maple Quiz</span>
          </a>
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
                  <li key={link.href} className="c-nav_secondary_menu_list_item">
                    <a href={link.href}>
                      {link.label}
                      <span className="c-nav_secondary_menu_list_arrow">
                        <Icon id="i-arrow-long-right" />
                      </span>
                    </a>
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