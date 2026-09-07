import { useEffect, useRef } from 'react';

/**
 * Canvas-based liquid blob fill on hover (same as the original site).
 * Renders a <canvas class="liquid-canvas"> inside the button.
 */
export default function LiquidButton({ children, className = '', color = '#029C82', ...rest }) {
  const btnRef = useRef(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'liquid-canvas';
    btn.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let dpr = 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const r = btn.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let radius = 0;
    let target = 0;
    let cx = 0;
    let cy = 0;
    let anim = null;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      radius += (target - radius) * 0.14;
      if (radius > 0.5) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      if (Math.abs(target - radius) > 0.5) {
        anim = requestAnimationFrame(draw);
      } else {
        anim = null;
      }
    }

    const onEnter = (e) => {
      const r = btn.getBoundingClientRect();
      cx = e.clientX - r.left;
      cy = e.clientY - r.top;
      target = Math.max(w, h) * 1.5;
      if (!anim) draw();
    };
    const onLeave = () => {
      target = 0;
      if (!anim) draw();
    };

    btn.addEventListener('pointerenter', onEnter);
    btn.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);

    return () => {
      if (anim) cancelAnimationFrame(anim);
      btn.removeEventListener('pointerenter', onEnter);
      btn.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
      if (canvas.parentNode === btn) btn.removeChild(canvas);
    };
  }, [color]);

  return (
    <button ref={btnRef} className={className} {...rest}>
      {children}
    </button>
  );
}