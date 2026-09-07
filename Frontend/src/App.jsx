import { useCallback, useEffect, useState } from 'react';
import Icons from './components/Icons.jsx';
import Header from './components/Header.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/home/Hero.jsx';
import GameChallenges from './components/home/GameChallenges.jsx';
import CameraSpotlight from './components/home/CameraSpotlight.jsx';
import HowItWorks from './components/home/HowItWorks.jsx';
import AssistiveTechSection from './components/home/AssistiveTechSection.jsx';
import LandingFooter from './components/home/LandingFooter.jsx';
import FactsModal from './components/FactsModal.jsx';
import Popup from './components/Popup.jsx';
import CookieConsent from './components/CookieConsent.jsx';
import FloatingCtas from './components/FloatingCtas.jsx';
import GameApp from './game/GameApp.jsx';
import './styles/landing.css';

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [gameInitialView, setGameInitialView] = useState('menu');
  const [navOpen, setNavOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [factsOpen, setFactsOpen] = useState(false);
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);

  // Body lock + nav classes
  useEffect(() => {
    const locked = navOpen || popupOpen || factsOpen;
    document.body.classList.toggle('is-locked', locked);
    document.body.classList.toggle('is-nav-open', navOpen);
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

  const handleStartGame = useCallback((view = 'menu') => {
    setGameInitialView(view);
    setInGame(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleExitGame = useCallback(() => {
    setInGame(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (inGame) {
    return (
      <GameApp
        initialView={gameInitialView}
        onExitToLanding={handleExitGame}
      />
    );
  }

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
      <Header
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

      {/* Cheerful Maple Kids Footer */}
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