import { Icon } from './Icons.jsx';

export default function FloatingCtas({ onOpenFacts }) {
  return (
    <>
      <button type="button" className="c-facts-cta" onClick={onOpenFacts} aria-label="Learn the facts of maple">
        <span className="c-facts-cta_icon">
          <Icon id="i-fact" viewBox="0 0 144 144" />
        </span>
        <span className="c-facts-cta_label u-label">Did you know?</span>
      </button>
      <a href="https://kids.maplefromcanada.ca/quiz/" className="c-quiz-cta" aria-label="Take the maple quiz">
        <span className="c-quiz-cta_label u-label">Maple Quiz</span>
        <span className="c-quiz-cta_icon">
          <Icon id="i-quiz" />
        </span>
      </a>
    </>
  );
}