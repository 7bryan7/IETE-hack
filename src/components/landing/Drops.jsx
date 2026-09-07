import { Icon } from './Icons.jsx';

/**
 * Floating maple drops. Used in the hero (c-home_main_drops) and in the
 * carousel slides (c-home_carousel_slide_drops).
 */
export default function Drops({ items, className = 'c-drops' }) {
  return (
    <div className={className}>
      {items.map((drop, i) => (
        <span
          key={i}
          className={`c-drops_item${drop.front ? ' -front' : ''}${drop.dark ? ' u-text-yellow-dark' : ''}`}
          style={drop.style}
        >
          <span className="c-drops_item_inner" style={{ transform: `rotate(${drop.rotate || '0deg'})` }}>
            <Icon id="i-drop" />
          </span>
        </span>
      ))}
    </div>
  );
}