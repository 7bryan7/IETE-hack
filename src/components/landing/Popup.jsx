import { useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { VIDEO_EMBED_HTML } from '../../data/content.js';

export default function Popup({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <aside id="c-modal" className={`c-popup${open ? ' is-open' : ''}`} aria-hidden={open ? 'false' : 'true'}>
      <div className="c-popup_background" onClick={onClose} />
      <button
        id="c-modal-close"
        className="c-popup_close c-button-round -yellow -big"
        type="button"
        onClick={onClose}
        aria-label="Close modal"
      >
        <Icon id="i-close" />
      </button>
      <div className="c-popup_container">
        {open ? <div dangerouslySetInnerHTML={{ __html: VIDEO_EMBED_HTML }} /> : null}
      </div>
    </aside>
  );
}