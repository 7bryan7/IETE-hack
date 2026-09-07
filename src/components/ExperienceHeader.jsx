import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Brand from './Brand';

export default function ExperienceHeader({ active, onHome, onWorlds, onMissions, onCalibrate }) {
  return <header className="experience-header">
    <button className="experience-brand" onClick={onHome} aria-label="MotionForge home"><Brand /></button>
    <nav aria-label="Playground navigation">
      <button className="experience-nav-link" onClick={onHome}><ArrowLeft size={16} />Home</button>
      {onWorlds && <button className="experience-nav-link" aria-current={active === 'worlds' ? 'page' : undefined} onClick={onWorlds}>Open worlds</button>}
      {onMissions && <button className="experience-nav-link" aria-current={active === 'map' ? 'page' : undefined} onClick={onMissions}>Classic missions</button>}
      {onCalibrate && <button className="experience-nav-link" aria-current={active === 'calibration' ? 'page' : undefined} onClick={onCalibrate}>Camera setup</button>}
    </nav>
  </header>;
}
