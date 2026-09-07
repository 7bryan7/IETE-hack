import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Trees, Hand, MousePointer2, Check, Compass, Pause, Play, Bug, Sparkles, Star, MapPin, Map } from 'lucide-react';
import { forestLevels, checkpoints } from './forestLevels.js';
import { forestInstruction } from './forestLogic.js';
import { getClosestUndiscovered } from './forestAdventure.js';
import ForestJourneyMap from './ForestJourneyMap.jsx';

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
      <div>Level: <b style={{ color: '#ffe' }}>{s.level} / 12</b></div>
      <div>State: <b style={{ color: '#ffe' }}>{s.status}</b></div>
      <div>Progress: <b style={{ color: '#ffe' }}>{s.progress}</b></div>
      <div>Held: <b style={{ color: s.held ? '#ffd86d' : '#aaa' }}>{s.held ? s.held.objectId : 'none'}</b></div>
      <div>Yaw: <b style={{ color: '#ffe' }}>{s.control?.yaw?.toFixed(3)}</b></div>
      {trackingStatus ? <div style={{ color: '#ff9' }}>⚠ {trackingStatus}</div> : null}
    </div>
  );
}

export default function ForestHUD({ snapshot: s, mode, paused, onPause, onExit, onRestart, onMode, onSelectLevel, unlockedLevel = 1, trackingStatus }) {
  const [showMap, setShowMap] = useState(false);
  const level = forestLevels[s.level - 1] || forestLevels[0];
  const closest = s.adventure ? getClosestUndiscovered(s.adventure, s.control?.yaw) : null;
  const stars = s.adventure?.stars ?? s.stars ?? 0;
  const discoveredCount = s.adventure?.discovered?.length ?? 0;

  const progressLabel = () => {
    if (s.level === 1) return 'Trail markers discovered';
    if (s.level === 5) return 'Fireflies caught';
    if (s.level === 6) return 'Blue fruits harvested';
    if (s.level === 7) return 'Bridge planks placed';
    if (s.level === 8) return `Round ${Math.min(3, (s.memoryRound || 0) + 1)} / 3`;
    if (s.level === 9) return 'Ancient gate energy';
    if (s.level === 10) return 'Floral rings passed';
    if (s.level === 11) return 'Orb celestial power';
    if (s.level === 12) return `Tree restore: Stage ${Math.min(6, (s.stage || 0) + 1)} / 6`;
    return 'Mission progress';
  };

  const progressValueString = () => {
    if (s.level === 9 || s.level === 11) return `${s.progress}% / 100%`;
    return `${s.progress} / ${level.total}`;
  };

  return <>
    <header className="forest-topbar">
      <button className="forest-icon-button" aria-label="Exit forest" onClick={onExit}><ArrowLeft size={20} /></button>
      <div className="forest-title">
        <Trees size={25} />
        <div><span>MOTIONFORGE / OPEN WORLDS</span><h1>Forest World</h1></div>
      </div>
      <div className="forest-compass-pill" aria-label="Exploration compass">
        <Compass size={14} className="forest-compass-icon" />
        <span>{closest ? `${closest.name} · ${closest.direction === 'left' ? '← Look Left' : closest.direction === 'right' ? 'Look Right →' : 'Straight Ahead ↑'}` : 'All 5 Landmarks Discovered! ✨'}</span>
      </div>
      <div className="forest-top-actions">
        <div className="forest-stars-badge" title="Forest Stars collected">
          <Star size={15} fill="#ffd700" color="#f59e0b" />
          <span>{stars}</span>
        </div>
        <button className="forest-button subtle" onClick={() => setShowMap(true)} title="Open Journey Map">
          <Map size={16} /> Map
        </button>
        <button className="forest-button subtle" onClick={onMode}>{mode === 'camera' ? <MousePointer2 size={16} /> : <Hand size={16} />}{mode === 'camera' ? 'Use mouse' : 'Use camera'}</button>
        <button className="forest-icon-button" aria-label={paused ? 'Resume forest' : 'Pause forest'} onClick={onPause}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
        <button className="forest-icon-button" aria-label="Restart this level" onClick={onRestart}><RotateCcw size={18} /></button>
      </div>
    </header>

    <aside className="forest-mission forest-glass">
      <div className="forest-eyebrow">
        <span>{level.area || 'YOUR ADVENTURE'}</span>
        <span>LEVEL {s.level} / 12</span>
      </div>
      <h2>{level.title}</h2>
      <p aria-live="polite">{forestInstruction(s, mode === 'mouse')}</p>
      
      {/* 12-level interactive progression dots */}
      <div className="forest-level-dots" aria-label={`Level ${s.level} of 12`}>
        {forestLevels.map((l, i) => {
          const isDone = i + 1 < s.level || i + 1 <= unlockedLevel;
          const isCur = i + 1 === s.level;
          const isLocked = i + 1 > Math.max(unlockedLevel + 1, s.level);
          return (
            <span
              key={l.id}
              className={`${isDone ? 'done' : ''} ${isCur ? 'current' : ''}`}
              style={{ cursor: !isLocked ? 'pointer' : 'default', opacity: isLocked ? 0.45 : 1 }}
              onClick={() => { if (!isLocked && onSelectLevel) onSelectLevel(i + 1); }}
              title={`Level ${i + 1}: ${l.title}`}
            >
              {isDone && !isCur ? <Check size={12} /> : i + 1}
            </span>
          );
        })}
      </div>

      <progress value={s.progress} max={level.total} aria-label="Forest level progress" />
      <div className="forest-progress-copy">
        <span>{progressLabel()}</span>
        <strong>{progressValueString()}</strong>
      </div>
      <div className="forest-discovery-tracker">
        <span><MapPin size={12} /> Exploration</span>
        <strong>{discoveredCount} / 5 Found</strong>
      </div>
      {s.level === 1 && <ul className="forest-checkpoints">{checkpoints.map(p => <li key={p.id} className={s.viewed.includes(p.id) ? 'found' : ''}><span>{s.viewed.includes(p.id) ? '✓' : '◇'}</span>{p.name}</li>)}</ul>}
    </aside>

    {/* Nova Spirit Companion Dialogue */}
    {s.status === 'playing' && (
      <div className="forest-nova-card forest-glass" role="status" aria-live="polite">
        <div className="forest-nova-avatar">
          <Sparkles size={18} />
        </div>
        <div className="forest-nova-body">
          <span className="forest-nova-title">NOVA · FOREST SPIRIT</span>
          <p>{s.adventure?.novaMessage || 'Raise both hands to look around the forest!'}</p>
        </div>
      </div>
    )}

    {/* Discovery Celebration Banner */}
    {s.adventure?.newlyDiscovered && (
      <div className="forest-discovery-banner forest-glass celebrate" role="alert">
        <div className="forest-discovery-icon">✨</div>
        <div className="forest-discovery-info">
          <span className="forest-discovery-eyebrow">NEW PLACE DISCOVERED!</span>
          <h3>{s.adventure.newlyDiscovered.name}</h3>
          <p>{s.adventure.newlyDiscovered.hint}</p>
        </div>
        <div className="forest-discovery-reward">
          <Star size={18} fill="#ffd700" color="#f59e0b" />
          <span>+1</span>
        </div>
      </div>
    )}

    {/* Dual Hand Activation Guide for Level 9 (Ancient Gate) */}
    {s.status === 'playing' && s.level === 9 && (
      <div className="forest-dual-guide" aria-hidden="true">
        <div className="forest-guide-zone">
          <span style={{ fontSize: '28px' }}>✋</span>
          <span>LEFT RUNE</span>
        </div>
        <div className="forest-charge-bar-wrap">
          <div className="top-row">
            <span>ANCIENT GATE ENERGY</span>
            <span>{s.progress}%</span>
          </div>
          <progress value={s.progress} max={100} />
        </div>
        <div className="forest-guide-zone">
          <span style={{ fontSize: '28px' }}>🤚</span>
          <span>RIGHT RUNE</span>
        </div>
      </div>
    )}

    {/* Dual Hand Balance Guide for Level 11 (Energy Orb) */}
    {s.status === 'playing' && s.level === 11 && (
      <div className="forest-dual-guide" aria-hidden="true">
        <div className="forest-guide-zone">
          <span style={{ fontSize: '28px' }}>✋</span>
          <span>LEFT BALANCE</span>
        </div>
        <div className="forest-charge-bar-wrap">
          <div className="top-row">
            <span>ORB POWER</span>
            <span>{s.progress}%</span>
          </div>
          <progress value={s.progress} max={100} />
        </div>
        <div className="forest-guide-zone">
          <span style={{ fontSize: '28px' }}>🤚</span>
          <span>RIGHT BALANCE</span>
        </div>
      </div>
    )}

    <div className="forest-navigation forest-glass" role="status">
      <span className={`forest-status-dot ${s.control.active ? 'active' : ''}`} />
      {paused
        ? 'Paused — take your time'
        : s.held
        ? `Holding ${s.held.objectId} · release over target`
        : s.control.active
        ? 'Navigation Mode Active'
        : mode === 'camera'
        ? trackingStatus || 'Raise both hands to explore'
        : 'Arrow keys to explore · click and hold to interact'}
    </div>

    <div className="forest-reticle" aria-hidden="true"><i /><i /></div>
    
    {s.status === 'playing' && s.level > 1 && s.level <= 4 && ['objects', 'targets'].map(kind => {
      const id = s.level === 4 ? 'leaf' : 'crystal', point = s.projections?.[kind]?.[id];
      if (!point?.visible || (kind === 'targets' && s.level === 2)) return null;
      return <span key={kind} className="forest-object-label" data-forest-item={`${kind}-${id}`} style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}>{kind === 'targets' ? 'Place here' : s.level === 2 ? '◇' : id === 'leaf' ? 'Magical leaf' : 'Forest crystal'}</span>;
    })}

    {s.pointers.map(p => <div key={p.id} className={`forest-hand-pointer ${p.pinch ? 'pinching' : ''}`} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }} aria-hidden="true">{p.pinch ? '●' : '+'}</div>)}
    {s.status === 'playing' && s.feedbackUntil > s.elapsed && <div className="forest-toast" role="status"><Check size={18} />{s.feedback}</div>}
    <DebugPanel snapshot={s} mode={mode} trackingStatus={trackingStatus} />
    <footer className="forest-footer"><span><Compass size={15} /> THE WHISPERING WOODS</span><span>{mode === 'camera' ? 'Two open hands to look · one hand to pinch & carry' : '← → Look around · ↑ ↓ Tilt · click objects to interact'}</span></footer>

    {/* Forest Journey Level Map Modal */}
    {showMap && (
      <ForestJourneyMap
        currentLevel={s.level}
        unlockedLevel={unlockedLevel}
        onSelectLevel={lvl => {
          onSelectLevel?.(lvl);
          setShowMap(false);
        }}
        onClose={() => setShowMap(false)}
      />
    )}
  </>;
}

