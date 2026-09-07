import React from 'react';
import { ArrowLeft, RotateCcw, Trees, Hand, MousePointer2, Check, Compass, Pause, Play, Bug } from 'lucide-react';
import { forestLevels, checkpoints } from './forestLevels.js';
import { forestInstruction } from './forestLogic.js';

// Set to true to show the developer debug panel during development.
const DEBUG_FOREST = false;

function DebugPanel({ snapshot: s, mode, trackingStatus }) {
  if (!DEBUG_FOREST) return null;
  const pointers = s.pointers || [];
  const left = pointers.find(p => p.id === 'left' || pointers.indexOf(p) === 0);
  const right = pointers.find(p => p.id === 'right' || pointers.indexOf(p) === 1);
  const hasLeft = pointers.length >= 1;
  const hasRight = pointers.length >= 2;
  return (
    <div style={{
      position: 'absolute', top: 110, right: 28, zIndex: 10,
      background: 'rgba(0,0,0,0.82)', color: '#b6ffb6', fontFamily: 'monospace',
      fontSize: 11, padding: '12px 16px', borderRadius: 10, minWidth: 210,
      lineHeight: 1.9, pointerEvents: 'none', border: '1px solid #33ff3366',
    }}>
      <div style={{ color: '#fff', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Bug size={13} /> DEBUG_FOREST
      </div>
      <div>Mode: <b style={{ color: '#ffe' }}>{mode}</b></div>
      <div>Left Hand: <b style={{ color: hasLeft ? '#6dff8e' : '#ff6d6d' }}>{hasLeft ? 'detected' : 'missing'}</b></div>
      <div>Right Hand: <b style={{ color: hasRight ? '#6dff8e' : '#ff6d6d' }}>{hasRight ? 'detected' : 'missing'}</b></div>
      <div>Navigation: <b style={{ color: s.control?.active ? '#6dff8e' : '#aaa' }}>{s.control?.active ? 'active' : 'inactive'}</b></div>
      <div>Pinch L: <b style={{ color: left?.pinch ? '#ffd86d' : '#aaa' }}>{left?.pinch ? 'true' : 'false'}</b></div>
      <div>Pinch R: <b style={{ color: right?.pinch ? '#ffd86d' : '#aaa' }}>{right?.pinch ? 'true' : 'false'}</b></div>
      <div>Level: <b style={{ color: '#ffe' }}>{s.level} / 4</b></div>
      <div>State: <b style={{ color: '#ffe' }}>{s.status}</b></div>
      {s.level === 4 && <div>Quest stage: <b style={{ color: '#ffe' }}>{s.stage} / 4</b></div>}
      <div>Held: <b style={{ color: s.held ? '#ffd86d' : '#aaa' }}>{s.held ? s.held.objectId : 'none'}</b></div>
      <div>Yaw: <b style={{ color: '#ffe' }}>{s.control?.yaw?.toFixed(3)}</b></div>
      {trackingStatus ? <div style={{ color: '#ff9' }}>⚠ {trackingStatus}</div> : null}
    </div>
  );
}

export default function ForestHUD({ snapshot: s, mode, paused, onPause, onExit, onRestart, onMode, trackingStatus }) {
  const level = forestLevels[s.level - 1];
  return <>
    <header className="forest-topbar">
      <button className="forest-icon-button" aria-label="Exit forest" onClick={onExit}><ArrowLeft size={20} /></button>
      <div className="forest-title"><Trees size={25} /><div><span>MOTIONFORGE / OPEN WORLDS</span><h1>Forest World</h1></div></div>
      <div className="forest-top-actions"><button className="forest-button subtle" onClick={onMode}>{mode === 'camera' ? <MousePointer2 size={16} /> : <Hand size={16} />}{mode === 'camera' ? 'Use mouse' : 'Use camera'}</button><button className="forest-icon-button" aria-label={paused ? 'Resume forest' : 'Pause forest'} onClick={onPause}>{paused ? <Play size={18} /> : <Pause size={18} />}</button><button className="forest-icon-button" aria-label="Restart this level" onClick={onRestart}><RotateCcw size={18} /></button></div>
    </header>
    <aside className="forest-mission forest-glass">
      <div className="forest-eyebrow"><span>YOUR ADVENTURE</span><span>LEVEL {s.level} / 4</span></div>
      <h2>{level.title}</h2>
      <p aria-live="polite">{forestInstruction(s, mode === 'mouse')}</p>
      <div className="forest-level-dots" aria-label={`Level ${s.level} of 4`}>{forestLevels.map((l, i) => <span key={l.title} className={i + 1 < s.level ? 'done' : i + 1 === s.level ? 'current' : ''}>{i + 1 < s.level ? <Check size={13} /> : i + 1}</span>)}</div>
      <progress value={s.progress} max={level.total} aria-label="Forest level progress" />
      <div className="forest-progress-copy"><span>{s.level === 1 ? 'Trail markers discovered' : 'Mission progress'}</span><strong>{s.progress} / {level.total}</strong></div>
      {s.level === 1 && <ul className="forest-checkpoints">{checkpoints.map(p => <li key={p.id} className={s.viewed.includes(p.id) ? 'found' : ''}><span>{s.viewed.includes(p.id) ? '✓' : '◇'}</span>{p.name}</li>)}</ul>}
    </aside>
    <div className="forest-navigation forest-glass" role="status"><span className={`forest-status-dot ${s.control.active ? 'active' : ''}`} />{paused ? 'Paused — take your time' : s.held ? 'Object held · release over the golden circle' : s.control.active ? 'Navigation Mode Active' : mode === 'camera' ? trackingStatus || 'Raise both hands to explore' : 'Arrow keys to explore · click and hold to grab'}</div>
    <div className="forest-reticle" aria-hidden="true"><i /><i /></div>
    {s.status === 'playing' && s.level > 1 && ['objects', 'targets'].map(kind => {
      const id = s.level === 4 ? 'leaf' : 'crystal', point = s.projections?.[kind]?.[id];
      if (!point?.visible || (kind === 'targets' && s.level === 2)) return null;
      return <span key={kind} className="forest-object-label" data-forest-item={`${kind}-${id}`} style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}>{kind === 'targets' ? 'Place here' : s.level === 2 ? '◇' : id === 'leaf' ? 'Magical leaf' : 'Forest crystal'}</span>;
    })}
    {s.pointers.map(p => <div key={p.id} className={`forest-hand-pointer ${p.pinch ? 'pinching' : ''}`} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }} aria-hidden="true">{p.pinch ? '●' : '+'}</div>)}
    {s.status === 'playing' && s.feedbackUntil > s.elapsed && <div className="forest-toast" role="status"><Check size={18} />{s.feedback}</div>}
    <DebugPanel snapshot={s} mode={mode} trackingStatus={trackingStatus} />
    <footer className="forest-footer"><span><Compass size={15} /> THE WHISPERING WOODS</span><span>{mode === 'camera' ? 'Two open hands to look · one hand to pinch & carry' : '← → Look around · ↑ ↓ Tilt · drag objects to golden circles'}</span></footer>
  </>;
}
