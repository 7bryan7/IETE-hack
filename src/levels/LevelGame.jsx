import React, { useCallback, useRef, useState } from 'react';
import CameraView from '../components/Camera';
import GameCanvas from '../components/GameCanvas';
import { useHandTracking } from '../hooks/useHandTracking';
import { sound } from '../utils/sound';
import { levels } from './config.js';
import { createRun, startRun, stepRun } from './engine.js';
import { renderLevel, instruction } from './render.js';
import { scoreRun } from './progress.js';
import './objectLevels.js';
import './bilateralLevels.js';
import './planningLevels.js';
import './questLevels.js';
import { levelMetrics } from './metrics.js';
export default function LevelGame({ level, difficulty, videoRef, onMap, onNext, onComplete, saved }) {
  const tracking = useHandTracking(videoRef, { numHands: 2 });
  const run = useRef(createRun(level, difficulty));
  const last = useRef(0), publish = useRef(0), completed = useRef(false);
  const videoFrame = useRef({ time: -1, changed: 0 });
  const [snapshot, setSnapshot] = useState({ ...run.current });
  const callback = useRef(onComplete); callback.current = onComplete;
  const restart = () => { run.current = createRun(level, difficulty); completed.current = false; last.current = 0; setSnapshot({ ...run.current }); };
  const render = useCallback((ctx, width, height) => {
    const now = performance.now(), s = run.current;
    const video=videoRef.current;
    if(video && video.currentTime!==videoFrame.current.time)videoFrame.current={time:video.currentTime,changed:now};
    const stale=!video || video.paused || video.ended || now-videoFrame.current.changed>500;
    stepRun(s, document.hidden || stale ? [] : tracking.trackingDataRef.current.hands || [], last.current ? now - last.current : 0);
    last.current = now;
    ctx.save(); ctx.scale(width / 1000, height / 600); renderLevel(ctx, s); ctx.restore();
    if (s.status === 'COMPLETE' && !completed.current) { completed.current = true; callback.current(scoreRun(s)); sound.playSuccess(); }
    if (now - publish.current > 80) { publish.current = now; setSnapshot({ ...s }); }
  }, [tracking.trackingDataRef]);
  const l = levels[level - 1], result = scoreRun(snapshot);
  return <main className="level-player">
    <header className="level-toolbar"><button className="btn btn-secondary" onClick={onMap}>← Level Map</button><strong>Level {level} · {l.name}</strong><button className="btn btn-secondary" onClick={restart}>Restart</button></header>
    <GameHUD state={snapshot} />
    {snapshot.status !== 'COMPLETE' && <div className="level-stage"><CameraView videoRef={videoRef} /><GameCanvas trackingDataRef={tracking.trackingDataRef} onRenderFrame={render} showDebug={false} /></div>}
    <p className="level-prompt" role="status">{snapshot.status === 'COMPLETE' ? 'Great job!' : tracking.error || (!tracking.isLoaded ? 'Loading hand tracking…' : snapshot.paused || (snapshot.feedbackUntil > snapshot.elapsed ? snapshot.feedback : instruction(snapshot)))}</p>
    {snapshot.status === 'READY' && <section className="level-intro"><h2>{l.name}</h2><p>{l.description}</p><p>Open your fingers before beginning a pinch. Keep your hands visible.</p><button className="btn btn-primary" disabled={!tracking.isLoaded} onClick={() => { sound.init(); startRun(run.current); setSnapshot({ ...run.current }); }}>Start mission</button></section>}
    {snapshot.status === 'COMPLETE' && <section className="level-results" aria-live="polite"><h2>LEVEL COMPLETE 🎉</h2><p className="level-stars">{'★'.repeat(result.stars)}</p><h3>Performance Score: {result.score} / 100</h3><p>Accuracy {result.accuracy}% · Time {result.time.toFixed(1)}s · Errors {result.errors}</p><MetricDetails state={snapshot} />{!saved && <p>Progress could not be saved. Keep this page open to continue.</p>}<div className="level-toolbar"><button className="btn btn-secondary" onClick={restart}>Play Again</button><button className="btn btn-primary" onClick={onNext}>{level < 10 ? 'Next Level →' : 'Finish Quest'}</button><button className="btn btn-secondary" onClick={onMap}>Level Map</button></div><small>Game feedback for your practice.</small></section>}
  </main>;
}
export function GameHUD({ state: s }) {
  const seconds = Math.floor(s.elapsed / 1000);
  return <div className="level-hud"><span>Progress <strong>{Math.min(s.round, s.total)} / {s.total}</strong></span><span>Time <strong>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</strong></span><span>Errors <strong>{s.errors}</strong></span><span>Accuracy <strong>{scoreRun(s).accuracy}%</strong></span><progress value={s.round} max={s.total} aria-label="Mission progress" /></div>;
}
export function MetricDetails({ state: s }) { return <dl className="level-metrics">{levelMetrics(s).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>; }
