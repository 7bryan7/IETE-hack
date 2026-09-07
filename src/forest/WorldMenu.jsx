import React from 'react';
import { ArrowRight, Trees, Lock, Compass } from 'lucide-react';
import ExperienceHeader from '../components/ExperienceHeader';

function ForestPreview() {
  return <svg viewBox="0 0 600 300" className="forest-preview" role="img" aria-label="A sunny forest with a winding path and glowing crystal">
    <rect width="600" height="300" fill="#dcebd9" /><circle cx="455" cy="62" r="35" fill="#fff8ce" />
    <path d="M0 180Q100 65 245 150T600 145V300H0Z" fill="#aac89d" /><path d="M0 214Q200 133 390 207T600 190V300H0Z" fill="#98b77d" />
    <path d="M270 300Q415 245 325 215T355 166" fill="none" stroke="#e9d9aa" strokeWidth="40" />
    {[[-5, 88, 1.3], [75, 95, 1], [170, 95, 0.8], [410, 96, 0.85], [495, 55, 1.4], [555, 106, 1]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path d="M40 65V150" stroke="#a0825c" strokeWidth="12" /><path d="M40 0L0 83H15L-5 116H85L65 83H80Z" fill={i % 2 ? '#5d9368' : '#739e6d'} /><path d="M40 0L0 83H80Z" fill="#7dac78" /></g>)}
    <ellipse cx="222" cy="255" rx="40" ry="12" fill="#829f69" /><path d="M193 247L200 225L224 218L249 236L251 250Z" fill="#aeb5a1" />
    <circle cx="269" cy="220" r="30" fill="#d7fff1" opacity=".35" /><path d="M269 192L284 215L269 242L254 215Z" fill="#a8f3e4" /><path d="M269 192V242L254 215Z" fill="#e4fff1" />
    <g fill="#fff3bc"><circle cx="120" cy="263" r="4" /><circle cx="441" cy="247" r="4" /><circle cx="468" cy="258" r="3" /></g>
  </svg>;
}
export default function WorldMenu({ onForest, onMissions, onHome }) {
  return <main className="world-menu">
    <ExperienceHeader active="worlds" onHome={onHome} onMissions={onMissions} />
    <div className="world-menu-heading"><span className="forest-eyebrow"><Compass size={16} /> A LITTLE MOVEMENT. A WORLD OF DISCOVERY.</span><h1>Where shall we explore?</h1><p>Step into a world of wonder. Your hands lead the way.</p></div>
    <div className="world-cards"><article className="world-card"><div className="world-card-art"><ForestPreview /><span className="world-card-badge">WORLD 01 · READY TO EXPLORE</span></div><div className="world-card-body"><div className="world-card-heading"><h2><Trees size={25} />Forest World</h2><span>4 levels</span></div><p>Follow the sunlight, discover glowing treasures, and bring a little magic to the woods.</p><div className="world-card-tags"><span>Explore</span><span>Discover</span><span>Grab & place</span></div><button className="forest-button primary" onClick={onForest}>Enter the forest<ArrowRight size={18} /></button></div></article>
    <article className="world-card locked"><div className="world-locked-art"><Lock size={38} /><span>NEW ADVENTURES ARE GROWING</span></div><div className="world-card-body"><div className="world-card-heading"><h2>House World</h2><Lock size={17} /></div><p>A cozy place for your next adventure. There’s more to discover another day.</p><button className="forest-button" disabled>Coming soon</button></div></article></div>
    <p className="world-menu-note">Webcam gestures or mouse & keyboard · Explore at your own pace</p>
  </main>;
}
