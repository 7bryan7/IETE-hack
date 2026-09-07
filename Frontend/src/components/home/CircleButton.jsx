import { Icon } from '../Icons.jsx';
import LiquidButton from '../LiquidButton.jsx';

/**
 * Rotating-text circular CTA ("Explore the 2.5D Motor Playground · MotionForge").
 * Structure matches the original: button > wrap > icon (text path + play).
 */
export default function CircleButton({ onOpenVideo }) {
  return (
    <div className="c-circle-button c-home_main_button">
      <LiquidButton
        className="c-circle-button_button"
        color="#EA9F0E"
        type="button"
        onClick={onOpenVideo}
        aria-label="Explore the 2.5D Motor Playground · MotionForge"
      >
        <span className="c-circle-button_wrap">
          <span className="c-circle-button_icon">
            <span className="c-circle-button_icon_inner -in">
              <svg role="presentation" viewBox="0 0 220 220">
                <defs>
                  <path
                    id="circle-text-path"
                    d="M110,110 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0"
                  />
                </defs>
                <text className="c-circle-button_text">
                  <textPath href="#circle-text-path">EXPLORE THE 2.5D MOTOR PLAYGROUND · MOTIONFORGE · </textPath>
                </text>
              </svg>
            </span>
            <span className="c-circle-button_icon_inner -out">
              <Icon id="i-play" />
            </span>
          </span>
        </span>
      </LiquidButton>
    </div>
  );
}