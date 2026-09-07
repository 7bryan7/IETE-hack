export default function Header({ onNavToggle }) {
  return (
    <header className="c-header">
      <a href="#home" className="c-header_button" aria-label="MotionForge 2.5D Playground">
        <span className="c-header_button_icon -logo-maple" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🖐️</span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '15px', letterSpacing: '0.04em', color: '#2A2B2A' }}>
            MOTION<span style={{ color: '#02AE90' }}>FORGE</span>
          </span>
        </span>
      </a>
      <button className="c-header_button -nav" type="button" onClick={onNavToggle} aria-label="Toggle navigation menu">
        <span className="c-header_button_icon -logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '16px' }}>✨</span>
        </span>
        <span className="c-header_button_label u-label">
          <span className="c-header_button_label_inner -main">Menu</span>
          <span className="c-header_button_label_inner -hover">Close</span>
        </span>
        <span className="c-header_button_burger" />
      </button>
    </header>
  );
}