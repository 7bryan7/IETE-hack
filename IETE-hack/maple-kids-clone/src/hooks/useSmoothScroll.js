import { useEffect } from 'react';

/**
 * Locomotive-style lerp smooth scroll (same as the original site).
 * Enabled only on desktop (>= 1024px), non-touch, and when the user
 * does not prefer reduced motion. Falls back to native scrolling.
 */
export default function useSmoothScroll(scrollRef, thumbRef) {
  useEffect(() => {
    const el = scrollRef.current;
    const thumb = thumbRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isDesktop = () => window.innerWidth >= 1024;

    let current = 0;
    let target = 0;
    let limit = 0;
    let rafId = null;

    const computeLimit = () => {
      limit = Math.max(0, el.scrollHeight - window.innerHeight);
    };

    const clamp = () => {
      if (target < 0) target = 0;
      if (target > limit) target = limit;
    };

    const raf = () => {
      current += (target - current) * 0.1;
      if (Math.abs(target - current) < 0.05) current = target;
      el.style.transform = `translate3d(0, ${-current}px, 0)`;
      if (thumb) {
        const progress = limit > 0 ? current / limit : 0;
        thumb.style.transform = `scaleY(${progress})`;
      }
      rafId = requestAnimationFrame(raf);
    };

    const onWheel = (e) => {
      e.preventDefault();
      target += e.deltaY;
      clamp();
    };

    const onKeydown = (e) => {
      const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const step = window.innerHeight * 0.85;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') target += step;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') target -= step;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = limit;
      clamp();
    };

    const onResize = () => {
      computeLimit();
      clamp();
    };

    const onNativeScroll = () => {
      const progress =
        window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (thumb) thumb.style.transform = `scaleY(${progress})`;
    };

    if (prefersReducedMotion || isTouch || !isDesktop()) {
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      onNativeScroll();
      return () => window.removeEventListener('scroll', onNativeScroll);
    }

    document.documentElement.classList.add('has-scroll-smooth');
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    el.style.willChange = 'transform';
    computeLimit();
    target = 0;
    current = 0;
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', onResize);
    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('resize', onResize);
      document.documentElement.classList.remove('has-scroll-smooth');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      el.style.transform = '';
      el.style.willChange = '';
    };
  }, [scrollRef, thumbRef]);
}