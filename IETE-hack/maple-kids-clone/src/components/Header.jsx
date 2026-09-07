import { Icon } from './Icons.jsx';

export default function Header({ onNavToggle }) {
  return (
    <header className="c-header">
      <a href="https://maplefromcanada.ca/" className="c-header_button" aria-label="Back to Maple from Canada">
        <span className="c-header_button_arrow">
          <Icon id="i-arrow-small-left" />
        </span>
        <span className="c-header_button_icon -logo-maple">
          <img src="assets/erableduquebec.en.svg" alt="Logo of Maple from Canada" />
        </span>
      </a>
      <button className="c-header_button -nav" type="button" onClick={onNavToggle}>
        <a href="index.html" className="c-header_button_icon -logo" aria-label="Kids | Maple from Canada">
          <Icon id="i-logo-jeunesse" viewBox="0 0 120 40" />
        </a>
        <span className="c-header_button_label u-label">
          <span className="c-header_button_label_inner -main">Kids</span>
          <span className="c-header_button_label_inner -hover">Close</span>
        </span>
        <span className="c-header_button_burger" />
      </button>
    </header>
  );
}