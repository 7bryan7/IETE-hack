import { useCallback, useEffect, useRef, useState } from 'react';
import NavStrip from './NavStrip.jsx';
import Carousel from './Carousel.jsx';
import { SLIDES } from '../../data/content.js';

/**
 * Home carousel module, mirroring the original site's home module:
 *  - init only on desktop (>= 1000px); mobile uses the accordion
 *  - first button click: launch (is-launched + has-carousel-launched),
 *    then goto(target) after 300ms
 *  - later clicks: goto(target) immediately
 *  - goto(targetId): .is-active moves to buttons/titles/slides whose
 *    data-id matches; carousel background follows the target slide
 *  - clicking the titles area closes the carousel (back to hero)
 */
export default function HomeNav({ homeRef, onStartGame, onOpenFacts }) {
  const [launched, setLaunched] = useState(false);
  const [activeId, setActiveId] = useState(SLIDES[0].id);
  const [openId, setOpenId] = useState(null); // mobile accordion
  const launchTimer = useRef(null);

  // has-carousel-launched on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('has-carousel-launched', launched);
  }, [launched]);

  // is-launched on .c-home
  useEffect(() => {
    homeRef.current?.classList.toggle('is-launched', launched);
  }, [launched, homeRef]);

  useEffect(() => () => {
    if (launchTimer.current) clearTimeout(launchTimer.current);
  }, []);

  const handleButtonClick = useCallback(
    (gotoId, liSlideId) => {
      if (window.innerWidth >= 1000) {
        // Desktop: home module behaviour
        if (!launched) {
          setLaunched(true);
          launchTimer.current = setTimeout(() => setActiveId(gotoId), 300);
        } else {
          setActiveId(gotoId);
        }
      } else {
        // Mobile: accordion behaviour (toggle the tapped item)
        setOpenId((prev) => (prev === liSlideId ? null : liSlideId));
      }
    },
    [launched],
  );

  const handleTitlesClick = useCallback(() => {
    if (window.innerWidth < 1000) return;
    setLaunched(false);
    setActiveId(null);
  }, []);

  return (
    <>
      <NavStrip
        launched={launched}
        activeId={activeId}
        openId={openId}
        onButtonClick={handleButtonClick}
        onTitlesClick={handleTitlesClick}
        onStartGame={onStartGame}
        onOpenFacts={onOpenFacts}
      />
      <Carousel
        launched={launched}
        activeId={activeId}
        onStartGame={onStartGame}
        onOpenFacts={onOpenFacts}
      />
    </>
  );
}