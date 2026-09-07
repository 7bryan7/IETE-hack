import React, { Component, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Trees, Hand, MousePointer2, ArrowRight, Sparkles, Check } from 'lucide-react';
import CameraView from '../components/Camera';
import { useHandTracking } from '../hooks/useHandTracking';
import ForestScene from './ForestScene';
import ForestHUD from './ForestHUD';
import { createForestRun, pauseForest } from './forestLogic.js';
import { forestLevels } from './forestLevels.js';
import { readForestHands } from './worldControls.js';
import { readForestProgress, saveForestProgress } from './progress.js';

function ForestCamera({ source, onStatus }) {
  const videoRef = useRef(null);
  const tracking = useHandTracking(videoRef, { numHands: 2 });
  useEffect(() => {
    let lastTime = -1, changed = 0;
    source.current = () => {
      const video = videoRef.current, now = performance.now();
      if (video && video.currentTime !== lastTime) { lastTime = video.currentTime; changed = now; }
      if (!video || video.paused || video.ended || video.readyState < 2 || now - changed > 400) return [];
      return readForestHands(tracking.trackingDataRef.current.hands || []);
    };
    return () => { source.current = () => []; };
  }, [source, tracking.trackingDataRef]);
  useEffect(() => { onStatus(tracking.error || (!tracking.isLoaded ? 'Preparing hand tracking…' : '')); }, [tracking.error, tracking.isLoaded, onStatus]);
  return <div className="forest-camera"><CameraView videoRef={videoRef} /><span className="forest-camera-label">{tracking.handCount} / 2 hands · mirrored preview</span></div>;
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="forest-render-error" role="alert"><h2>The forest needs WebGL</h2><p>Enable hardware acceleration or try another browser, then reopen Forest World.</p><button className="forest-button" onClick={this.props.onExit}>Back to worlds</button></div> : this.props.children; }
}

export default function ForestWorld({ onExit }) {
  const run = useRef(createForestRun()), stage = useRef(), dialog = useRef(), cameraSource = useRef(() => []);
  const mouse = useRef({ id: 'mouse', x: 0.5, y: 0.5, pinch: false, visible: false });
  const keys = useRef(new Set()), flags = useRef({ mode: 'mouse', paused: false });
  const [snapshot, setSnapshot] = useState(() => ({ ...run.current }));
  const [mode, setMode] = useState('mouse'), [paused, setPaused] = useState(false), [chosen, setChosen] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState(''), [aspect, setAspect] = useState(16 / 9);
  const [saved, setSaved] = useState(true), [cameraKey, setCameraKey] = useState(0);
  const [contextLost, setContextLost] = useState(false);
  const [previous] = useState(() => { try { return readForestProgress(window.localStorage); } catch { return 0; } });
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const recorded = useRef('');
  flags.current = { mode, paused: paused || contextLost };
  const clearInput = useCallback(() => { keys.current.clear(); mouse.current.pinch = false; mouse.current.visible = false; pauseForest(run.current); }, []);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setAspect(entry.contentRect.width / entry.contentRect.height));
    observer.observe(stage.current);
    const blur = () => { clearInput(); setPaused(true); };
    const visibility = () => { if (document.hidden) blur(); };
    window.addEventListener('blur', blur); document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); };
  }, [clearInput]);
  useEffect(() => {
    if (snapshot.status === 'complete' && recorded.current !== String(snapshot.level)) {
      recorded.current = String(snapshot.level);
      try { setSaved(saveForestProgress(window.localStorage, snapshot.level)); } catch { setSaved(false); }
    }
  }, [snapshot.status, snapshot.level]);
  useEffect(() => {
    if (snapshot.status !== 'playing' || paused) dialog.current?.querySelector('button:not(:disabled)')?.focus();
  }, [snapshot.status, snapshot.level, paused]);
  const readInput = useCallback(() => {
    const options = flags.current;
    return { paused: options.paused || document.hidden,
      pointers: options.mode === 'camera' ? cameraSource.current() : mouse.current.visible ? [{ ...mouse.current }] : [],
      keyboard: options.mode === 'mouse' ? { x: Number(keys.current.has('ArrowRight')) - Number(keys.current.has('ArrowLeft')), y: Number(keys.current.has('ArrowUp')) - Number(keys.current.has('ArrowDown')) } : null,
    };
  }, []);
  const reset = (level = run.current.level, start = false) => {
    clearInput(); run.current = createForestRun(level); run.current.status = start ? 'playing' : 'intro';
    recorded.current = ''; setPaused(false); setSnapshot({ ...run.current });
    if (start) requestAnimationFrame(() => stage.current?.focus());
  };
  const chooseMode = next => { clearInput(); setMode(next); setChosen(true); setPaused(false); };
  const start = () => { run.current.status = 'playing'; setPaused(false); setSnapshot({ ...run.current }); stage.current.focus(); };
  const updateMouse = e => {
    if (mode !== 'mouse' || e.target.closest('button, aside, header, footer, .forest-dialog')) return;
    const rect = stage.current.getBoundingClientRect();
    mouse.current.x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    mouse.current.y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)); mouse.current.visible = true;
  };
  const finished = snapshot.status === 'complete', intro = snapshot.status === 'intro';
  return <main ref={stage} className="forest-world" tabIndex={0} aria-label="Forest World play area. Use arrow keys to explore and mouse drag to carry objects." style={{ '--forest-aspect': aspect }}
    onKeyDown={e => {
      if (e.target !== stage.current) return;
      if (e.key.startsWith('Arrow')) { e.preventDefault(); keys.current.add(e.key); }
      if (e.code === 'Escape') { clearInput(); setPaused(p => !p); }
    }} onKeyUp={e => keys.current.delete(e.key)}
    onPointerMove={updateMouse} onPointerDown={e => {
      if (mode !== 'mouse' || e.button !== 0 || e.target.closest('button, aside, header, footer, .forest-dialog')) return;
      updateMouse(e); mouse.current.pinch = true; stage.current.setPointerCapture(e.pointerId); stage.current.focus();
    }} onPointerUp={e => { mouse.current.pinch = false; if (stage.current.hasPointerCapture(e.pointerId)) stage.current.releasePointerCapture(e.pointerId); }}
    onPointerCancel={clearInput} onPointerLeave={() => { if (!mouse.current.pinch) mouse.current.visible = false; }}>
    <SceneBoundary onExit={onExit}><Canvas dpr={[1, 1.5]} camera={{ position: [0, 4.8, 12], fov: 52, near: 0.1, far: 80 }} gl={{ antialias: true, powerPreference: 'high-performance' }} fallback={<div className="forest-render-error"><p>WebGL is unavailable. Try a browser with hardware acceleration.</p><button className="forest-button" onClick={onExit}>Back to worlds</button></div>} onCreated={({ gl }) => {
      gl.domElement.addEventListener('webglcontextlost', () => { clearInput(); setContextLost(true); });
      gl.domElement.addEventListener('webglcontextrestored', () => { setContextLost(false); setPaused(true); });
    }}><ForestScene run={run} readInput={readInput} onSnapshot={setSnapshot} reducedMotion={reducedMotion} /></Canvas></SceneBoundary>
    <ForestHUD snapshot={snapshot} mode={mode} paused={paused} onExit={onExit} onRestart={() => reset()} onMode={() => chooseMode(mode === 'camera' ? 'mouse' : 'camera')} onPause={() => { clearInput(); setPaused(p => !p); stage.current.focus(); }} trackingStatus={trackingStatus} />
    {mode === 'camera' && <ForestCamera key={cameraKey} source={cameraSource} onStatus={setTrackingStatus} />}
    {mode === 'camera' && trackingStatus && <div className="forest-tracking-help forest-glass"><p>{trackingStatus}</p><button className="forest-button subtle" onClick={() => setCameraKey(k => k + 1)}>Retry tracking</button><button className="forest-button subtle" onClick={() => chooseMode('mouse')}>Use mouse</button></div>}
    {contextLost && <div className="forest-render-error" role="alert"><h2>Let’s reopen the forest</h2><p>The graphics connection was interrupted. Your completed levels are saved.</p><button className="forest-button" onClick={onExit}>Back to worlds</button></div>}
    {(intro || finished || (paused && !intro && !finished)) && <div className="forest-shade"><section ref={dialog} className="forest-dialog forest-glass" role="dialog" aria-modal="true" aria-labelledby="forest-dialog-title" onKeyDown={e => {
      if (e.key !== 'Tab') return;
      const buttons = [...e.currentTarget.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }}>
      <div className={`forest-dialog-icon ${finished ? 'celebrate' : ''}`}>{finished ? <Sparkles size={34} /> : <Trees size={36} />}</div>
      <span className="forest-eyebrow">{finished ? snapshot.level === 4 ? 'ALL FOUR LEVELS COMPLETE' : `LEVEL ${snapshot.level} COMPLETE` : paused && !intro ? 'A MOMENT TO REST' : `WELCOME, EXPLORER · LEVEL ${snapshot.level}`}</span>
      <h2 id="forest-dialog-title">{finished ? snapshot.level === 4 ? 'Forest completed!' : snapshot.feedback : paused && !intro ? 'Your forest is waiting' : snapshot.level === 1 ? 'A little wonder.\nA new adventure.' : forestLevels[snapshot.level - 1].title}</h2>
      <p>{finished ? snapshot.level === 4 ? 'You explored the woods, discovered its treasures, and brought the magical leaf home. Great job!' : 'Great job! Your next woodland adventure is ready.' : paused && !intro ? 'Take your time. Continue whenever you’re ready.' : forestLevels[snapshot.level - 1].detail}</p>
      {intro && <>
        <div className="forest-control-choices"><button className={`forest-control-choice ${chosen && mode === 'camera' ? 'selected' : ''}`} onClick={() => chooseMode('camera')}><Hand size={23} /><strong>Play with hands</strong><small>Webcam + pinch gestures</small></button><button className={`forest-control-choice ${chosen && mode === 'mouse' ? 'selected' : ''}`} onClick={() => chooseMode('mouse')}><MousePointer2 size={23} /><strong>Mouse & keyboard</strong><small>Arrow keys + click and drag</small></button></div>
        {chosen && <p className="forest-small">{mode === 'camera' ? 'Raise two open hands. Move together to look around; lower one hand to grab. Camera frames stay in your browser.' : 'Click the forest, then use the arrow keys. Point at a treasure, hold the mouse button to carry it, and release at its target.'}</p>}
        <button className="forest-button primary" disabled={!chosen} onClick={start}>Start level {snapshot.level}<ArrowRight size={18} /></button>
        {snapshot.level === 1 && previous > 0 && previous < 4 && <button className="forest-button subtle" onClick={() => reset(previous + 1)}>Continue at level {previous + 1}</button>}
        <button className="forest-button subtle" onClick={onExit}>Back to worlds</button>
      </>}
      {finished && <><div className="forest-result-strip"><span><Check size={16} />{snapshot.level === 4 ? '4 levels explored' : 'Mission complete'}</span><span>{Math.round(snapshot.elapsed / 1000)}s this level</span></div>{!saved && <p role="status">Progress could not be saved. You can keep playing this visit.</p>}<button className="forest-button primary" onClick={() => reset(snapshot.level === 4 ? 1 : snapshot.level + 1)}>{snapshot.level === 4 ? 'Explore again' : 'Next level'}<ArrowRight size={18} /></button><button className="forest-button subtle" onClick={onExit}>Back to worlds</button></>}
      {paused && !intro && !finished && <><button className="forest-button primary" onClick={() => { setPaused(false); stage.current.focus(); }}>Continue exploring<ArrowRight size={18} /></button><button className="forest-button subtle" onClick={onExit}>Back to worlds</button></>}
    </section></div>}
  </main>;
}
