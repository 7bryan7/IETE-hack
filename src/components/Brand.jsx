import React from 'react';

export default function Brand() {
  return <span className="mf-brand">
    <img
      className="mf-brand-image"
      src={`${import.meta.env.BASE_URL}assets/motionforge-logo.png`}
      alt="MotionForge — Move, Play, Grow"
      width="659"
      height="652"
    />
  </span>;
}
