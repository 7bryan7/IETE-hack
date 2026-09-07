import SplitText from '../SplitText.jsx';
import CircleButton from './CircleButton.jsx';
import Drops from './Drops.jsx';
import { HERO_DROPS } from '../../data/content.js';

/**
 * Hero: split title + rotating circle CTA + mascot + floating drops.
 * Entrance/exit animations are driven by html.has-dom-ready and
 * html.has-carousel-launched (see styles/home.css).
 */
export default function Hero({ onOpenVideo }) {
  return (
    <div className="c-home_main">
      <div className="c-home_main_content">
        <SplitText
          as="h1"
          className="c-home_main_title c-heading -h1"
          text="Move Your Hand. Grab Objects. Get Real Feedback!"
        />
        <CircleButton onOpenVideo={onOpenVideo} />
        <div className="c-home_main_mascot">
          <img src="assets/mascot.svg" alt="MotionForge Playground Mascot" />
        </div>
        <div className="c-home_main_drops">
          <Drops items={HERO_DROPS} />
        </div>
      </div>
    </div>
  );
}