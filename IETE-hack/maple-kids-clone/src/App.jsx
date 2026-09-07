import { useCallback, useEffect, useRef, useState } from 'react';
import Icons from './components/Icons.jsx';
import Header from './components/Header.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/home/Hero.jsx';
import HomeNav from './components/home/HomeNav.jsx';
import FactsModal from './components/FactsModal.jsx';
import Popup from './components/Popup.jsx';
import CookieConsent from './components/CookieConsent.jsx';
import FloatingCtas from './components/FloatingCtas.jsx';
import useSmoothScroll from './hooks/useSmoothScroll.js';

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [factsOpen, setFactsOpen] = useState(false);
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);

  const scrollRef = useRef(null);
  const thumbRef = useRef(null);
  const homeRef = useRef(null);

  useSmoothScroll(scrollRef, thumbRef);

  // Body lock + nav classes
  useEffect(() => {
    const locked = navOpen || popupOpen || factsOpen;
    document.body.classList.toggle('is-locked', locked);
    document.body.classList.toggle('is-nav-open', navOpen);
  }, [navOpen, popupOpen, factsOpen]);

  // has-dom-ready on <html> (drives all entrance animations)
  useEffect(() => {
    document.documentElement.classList.add('has-dom-ready');
    return () => {
      document.documentElement.classList.remove('has-dom-ready');
    };
  }, []);

  // is-mobile on <html> (original site uses it for accordion hover states)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 999px)');
    const onChange = (e) => document.documentElement.classList.toggle('is-mobile', e.matches);
    onChange(mq);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Load fade-in
  useEffect(() => {
    document.body.style.opacity = '0';
    const raf = requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.6s ease';
      document.body.style.opacity = '1';
    });
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.opacity = '';
      document.body.style.transition = '';
    };
  }, []);

  const openFacts = useCallback(() => setFactsOpen(true), []);
  const openVideo = useCallback(() => setPopupOpen(true), []);

  return (
    <>
      <div className="c-transition" aria-hidden="true" />

      <Popup open={popupOpen} onClose={() => setPopupOpen(false)} />
      <FactsModal open={factsOpen} onClose={() => setFactsOpen(false)} />

      <Header onNavToggle={() => setNavOpen((v) => !v)} />
      <Nav
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onShowCookiePrefs={() => setCookiePrefsOpen(true)}
        onOpenFacts={openFacts}
      />

      <FloatingCtas onOpenFacts={openFacts} />

      <div className="o-scroll" ref={scrollRef}>
        <main>
          <div className="c-home" ref={homeRef}>
            <div className="c-home_shape c-liquid-shape -top" aria-hidden="true" />
            <div className="c-home_shape c-liquid-shape -bottom" aria-hidden="true" />

            <Hero onOpenVideo={openVideo} />
            <HomeNav homeRef={homeRef} />
          </div>
        </main>
      </div>

      <CookieConsent open={cookiePrefsOpen} onClose={() => setCookiePrefsOpen(false)} />

      <span className="c-scrollbar">
        <span className="c-scrollbar_thumb" ref={thumbRef} />
      </span>

      <Icons />
    </>
  );
}