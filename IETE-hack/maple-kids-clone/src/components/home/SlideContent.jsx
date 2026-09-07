import { Icon } from '../Icons.jsx';
import SplitText from '../SplitText.jsx';
import LiquidButton from '../LiquidButton.jsx';

/**
 * Slide content block: split title + description + arrow CTA.
 * Used in the desktop carousel and the mobile accordion.
 */
export default function SlideContent({ slide, forceInview }) {
  return (
    <>
      <SplitText
        as="h2"
        className="c-home_slide_title c-heading -h2"
        text={slide.title}
        forceInview={forceInview}
      />
      <div className="c-home_slide_content">{slide.content}</div>
      <LiquidButton
        className={`c-home_slide_button c-button-icon ${slide.ctaClass}`}
        color={slide.foreground}
      >
        <a href={slide.cta.href} className="c-button-icon_label">
          {slide.cta.label}
        </a>
        <span className="c-button-icon_icon" aria-hidden="true">
          <span className="c-button-icon_icon_inner">
            <span className="c-button-icon_icon_item -main">
              <Icon id="i-arrow-right" />
            </span>
            <span className="c-button-icon_icon_item -hover">
              <Icon id="i-arrow-right" />
            </span>
          </span>
        </span>
      </LiquidButton>
    </>
  );
}