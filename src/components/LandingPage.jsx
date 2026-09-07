import React, { useCallback, useEffect, useState } from 'react';
import Icons from './landing/Icons.jsx';
import LandingHeader from './landing/LandingHeader.jsx';
import Nav from './landing/Nav.jsx';
import Hero from './landing/Hero.jsx';
import GameChallenges from './landing/GameChallenges.jsx';
import CameraSpotlight from './landing/CameraSpotlight.jsx';
import HowItWorks from './landing/HowItWorks.jsx';
import AssistiveTechSection from './landing/AssistiveTechSection.jsx';
import LandingFooter from './landing/LandingFooter.jsx';
import FactsModal from './landing/FactsModal.jsx';
import Popup from './landing/Popup.jsx';
import CookieConsent from './landing/CookieConsent.jsx';
import FloatingCtas from './landing/FloatingCtas.jsx';

export default function LandingPage({ onStartClick, onCalibrateClick, onSelectLevel, onOpenMap }) {
  const [navOpen, setNavOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [factsOpen, setFactsOpen] = useState(false);
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);

  // Body lock + nav classes
  useEffect(() => {
    const locked = navOpen || popupOpen || factsOpen;
    document.body.classList.toggle('is-locked', locked);
    document.body.classList.toggle('is-nav-open', navOpen);
    return () => {
      document.body.classList.remove('is-locked', 'is-nav-open');
    };
  }, [navOpen, popupOpen, factsOpen]);

  // has-dom-ready on <html> for animations
  useEffect(() => {
    document.documentElement.classList.add('has-dom-ready');
    return () => {
      document.documentElement.classList.remove('has-dom-ready');
    };
  }, []);

  const openFacts = useCallback(() => setFactsOpen(true), []);
  const openVideo = useCallback(() => setPopupOpen(true), []);

  const handleStartGame = useCallback((target = 'menu') => {
    if (target === 'worlds' || target === 'forest') {
      if (onStartClick) onStartClick();
    } else if (target === 'calibration') {
      if (onCalibrateClick) onCalibrateClick();
    } else if (target === 'game_reach') {
      if (onSelectLevel) onSelectLevel(1);
      else if (onCalibrateClick) onCalibrateClick();
    } else if (target === 'game_catch') {
      if (onSelectLevel) onSelectLevel(2);
      else if (onCalibrateClick) onCalibrateClick();
    } else if (target === 'game_transfer') {
      if (onSelectLevel) onSelectLevel(3);
      else if (onCalibrateClick) onCalibrateClick();
    } else if (target === 'game_sequence') {
      if (onSelectLevel) onSelectLevel(4);
      else if (onCalibrateClick) onCalibrateClick();
    } else {
      if (onOpenMap) onOpenMap();
      else if (onCalibrateClick) onCalibrateClick();
    }
  }, [onStartClick, onCalibrateClick, onSelectLevel, onOpenMap]);

  return (
    <div className="mf-landing">
      {/* Liquid morphing background blobs */}
      <div className="mf-blob-bg mf-blob-1" aria-hidden="true" />
      <div className="mf-blob-bg mf-blob-2" aria-hidden="true" />
      <div className="mf-blob-bg mf-blob-3" aria-hidden="true" />

      {/* Modals & Popups */}
      <Popup open={popupOpen} onClose={() => setPopupOpen(false)} />
      <FactsModal open={factsOpen} onClose={() => setFactsOpen(false)} />
      <CookieConsent open={cookiePrefsOpen} onClose={() => setCookiePrefsOpen(false)} />

      {/* Top Header */}
      <LandingHeader
        onNavToggle={() => setNavOpen((v) => !v)}
        onStartGame={handleStartGame}
      />

      {/* Slide Navigation Drawer */}
      <Nav
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onShowCookiePrefs={() => setCookiePrefsOpen(true)}
        onOpenFacts={openFacts}
        onStartGame={handleStartGame}
      />

      {/* Floating Action Buttons */}
      <FloatingCtas onOpenFacts={openFacts} />

      {/* Main Landing Content */}
      <main>
        <Hero
          onStartGame={handleStartGame}
          onOpenFacts={openFacts}
        />

        <GameChallenges onStartGame={handleStartGame} />

        <CameraSpotlight onStartGame={handleStartGame} />

        <HowItWorks />

        <AssistiveTechSection
          onStartGame={handleStartGame}
          onOpenFacts={openFacts}
        />
      </main>

      {/* Cheerful Kids Footer */}
      <LandingFooter
        onStartGame={handleStartGame}
        onOpenFacts={openFacts}
        onShowCookiePrefs={() => setCookiePrefsOpen(true)}
      />

      {/* SVG Icon Sprite */}
      <Icons />
    </div>
  );
}
