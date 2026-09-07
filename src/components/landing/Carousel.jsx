import { Icon } from './Icons.jsx';
import Drops from './Drops.jsx';
import SlideContent from './SlideContent.jsx';
import { SLIDES } from '../../data/content.js';

/**
 * Desktop carousel (hidden on mobile via u-none@to-medium).
 * The active slide carries .is-active; the container background follows
 * the active slide's data-background, exactly like the original module.
 */
export default function Carousel({ launched, activeId, onStartGame, onOpenFacts }) {
  const activeSlide = SLIDES.find((s) => s.id === activeId) || null;
  const backgroundColor = launched && activeSlide ? activeSlide.background : 'transparent';

  return (
    <div className="c-home_carousel u-none@to-medium" style={{ backgroundColor }}>
      {SLIDES.map((slide) => (
        <div
          key={slide.id}
          className={`c-home_carousel_slide${activeId === slide.id ? ' is-active' : ''}`}
          data-home="slide"
          data-id={slide.id}
          data-background={slide.background}
          data-foreground={slide.foreground}
        >
          <div className="c-home_carousel_slide_inner o-container">
            <div className="o-layout -gutter -middle">
              <div className="o-layout_item u-2/5@from-medium">
                <SlideContent
                  slide={slide}
                  forceInview={activeId === slide.id}
                  onStartGame={onStartGame}
                  onOpenFacts={onOpenFacts}
                />
              </div>
              <div className="o-layout_item u-3/5@from-medium u-relative" aria-hidden="true">
                <span className="c-home_carousel_slide_drops">
                  <Drops items={slide.drops} />
                </span>
                <img role="presentation" className="c-home_slide_image" src={slide.image} alt="" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}