import React, { useRef, useState } from 'react';
import LandingPage from './components/LandingPage';
import { lazy, Suspense, useEffect } from 'react';
import WorldMenu from './forest/WorldMenu';
const ForestWorld = lazy(() => import('./forest/ForestWorld'));
import Calibration from './components/Calibration';
import LevelGame from './levels/LevelGame';
import { levels } from './levels/config.js';
import { readProgress, saveCompletion, isUnlocked } from './levels/progress.js';
import './App.css';
import './levels/levels.css';
export default function App() {
  const videoRef = useRef(null);
  const [view, setView] = useState(() => window.location.hash === '#forest' ? 'forest' : window.location.hash === '#worlds' ? 'worlds' : 'landing');
  useEffect(() => {
    const route = () => setView(window.location.hash === '#forest' ? 'forest' : window.location.hash === '#worlds' ? 'worlds' : 'landing');
    window.addEventListener('hashchange', route);
    window.addEventListener('popstate', route);
    return () => { window.removeEventListener('hashchange', route); window.removeEventListener('popstate', route); };
  }, []);
  const navigate = next => {
    window.history.pushState(null, '', next === 'forest' || next === 'worlds' ? `#${next}` : window.location.pathname + window.location.search);
    setView(next);
  };
  const [difficulty, setDifficulty] = useState('Easy');
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(() => { try { return readProgress(window.localStorage); } catch { return {}; } });
  const [saved, setSaved] = useState(true);
  const select = id => { if (isUnlocked(progress, id)) { setLevel(id); setView('game'); } };
  const complete = result => {
    let storage; try { storage = window.localStorage; } catch {}
    const update = saveCompletion(progress, level, result, storage);
    setProgress(update.progress); setSaved(update.saved);
  };
  return <div className="app-shell">
    {view === 'landing' && <LandingPage onStartClick={() => navigate('worlds')} onCalibrateClick={() => setView('calibration')} onSelectLevel={select} onOpenMap={() => setView('map')} />}
    {view === 'worlds' && <WorldMenu onForest={() => navigate('forest')} onMissions={() => navigate('map')} onHome={() => navigate('landing')} />}
    {view === 'forest' && <Suspense fallback={<main className="world-menu"><p role="status">Opening the forest…</p></main>}><ForestWorld onExit={() => navigate('worlds')} /></Suspense>}
    {view === 'calibration' && <Calibration videoRef={videoRef} onCalibrationComplete={() => setView('map')} onSkip={() => setView('map')} />}
    {view === 'map' && <main className="level-map">
      <p className="level-brand">MOTIONFORGE</p><h1>Choose Your Mission</h1><p>Every completed mission opens the next!</p>
      <div className="level-toolbar"><label>Difficulty <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>{['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}</select></label><button className="btn btn-secondary" onClick={() => setView('calibration')}>Camera setup</button></div>
      {!saved && <p role="status">Progress is available for this visit. Browser storage could not save it.</p>}
      <button className="btn btn-secondary" onClick={() => navigate('worlds')}>Explore open worlds</button>
      <div className="level-grid">{levels.map(l => {
        const unlocked = isUnlocked(progress, l.id), done = progress[l.id];
        return <button key={l.id} className={`level-card ${unlocked && !done ? 'current' : ''}`} disabled={!unlocked} onClick={() => select(l.id)}>
          <span className="level-number">{l.id}</span><span className="level-skill">{l.skill}</span><h2>{l.name}</h2><p>{l.description}</p><strong>{done ? `Completed ${'★'.repeat(done.stars)}` : unlocked ? `${difficulty} · Let's play →` : '🔒 Locked'}</strong>
          {done && <small>Best: {done.bestScore}/100 · {done.bestTime.toFixed(1)}s</small>}
        </button>;
      })}</div>
    </main>}
    {view === 'game' && <LevelGame key={`${level}-${difficulty}`} level={level} difficulty={difficulty} videoRef={videoRef} onComplete={complete} saved={saved} onMap={() => setView('map')} onNext={() => level < 10 ? select(level + 1) : setView('map')} />}
  </div>;
}
