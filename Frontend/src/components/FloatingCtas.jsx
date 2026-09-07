import { Icon } from './Icons.jsx';

export default function FloatingCtas({ onOpenFacts }) {
  return (
    <>
      <button type="button" className="c-facts-cta" onClick={onOpenFacts} aria-label="Learn facts about MotionForge">
        <span className="c-facts-cta_icon">
          <Icon id="i-fact" viewBox="0 0 144 144" />
        </span>
        <span className="c-facts-cta_label u-label">Did you know?</span>
      </button>
      <button type="button" className="c-quiz-cta" onClick={onOpenFacts} aria-label="Explore motor practice insights">
        <span className="c-quiz-cta_label u-label">Motor Insights</span>
        <span className="c-quiz-cta_icon">
          <Icon id="i-quiz" />
        </span>
      </button>
    </>
  );
}