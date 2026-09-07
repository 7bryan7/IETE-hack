import { useEffect, useRef, useState } from 'react';

/**
 * Splits text into one block-level div per word, exactly like the
 * original site's split module:
 *   <div style="display:block; text-align:start; position:relative">word</div>
 * The CSS (html.has-dom-ready .is-active …) drives the entrance animation.
 */
export default function SplitText({ as: Tag = 'div', className = '', text, forceInview = false }) {
  const ref = useRef(null);
  const [inview, setInview] = useState(false);

  useEffect(() => {
    if (forceInview) {
      setInview(true);
      return undefined;
    }
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInview(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [forceInview]);

  const words = text.split(' ');

  return (
    <Tag ref={ref} className={`${className}${inview ? ' is-inview' : ''}`}>
      {words.map((word, i) => (
        <div key={i} style={{ display: 'block', textAlign: 'start', position: 'relative' }}>
          {word}
        </div>
      ))}
    </Tag>
  );
}