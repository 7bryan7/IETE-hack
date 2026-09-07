import React, { useEffect, useState } from 'react';
import CameraView from './Camera';
import GameCanvas from './GameCanvas';
import { useHandTracking } from '../hooks/useHandTracking';
import { CheckCircle2, Hand, Sparkles, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

export default function Calibration({ videoRef, onCalibrationComplete, onSkip }) {
  const { isLoaded, isTracking, handCount, trackingDataRef, error } = useHandTracking(videoRef, { numHands: 2 });
  const [bothHandsDetected, setBothHandsDetected] = useState(false);
  const [holdTimer, setHoldTimer] = useState(2); // 2 second hold countdown once 2 hands are seen

  useEffect(() => {
    let interval = null;

    if (handCount >= 2) {
      sound.playPop();
      interval = setInterval(() => {
        setHoldTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setBothHandsDetected(true);
            sound.playSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 800);
    } else {
      setHoldTimer(2);
      setBothHandsDetected(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [handCount]);

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>Camera & Hand Setup 🖐️🖐️</h2>
        <p>Get ready for MotionForge by calibrating your hands!</p>
      </div>

      <div className="calibration-view-wrapper">
        <CameraView videoRef={videoRef} />
        <GameCanvas trackingDataRef={trackingDataRef} showSkeleton={true} />

        <div className="calibration-overlay-card">
          {!isLoaded ? (
            <div className="calib-status loading">
              <div className="spinner"></div>
              <span>Loading AI Vision Model...</span>
            </div>
          ) : bothHandsDetected ? (
            <div className="calib-status ready animate-bounce">
              <CheckCircle2 size={42} className="text-emerald" />
              <div>
                <h3>Ready! ✅</h3>
                <p>Both hands tracked successfully!</p>
              </div>
            </div>
          ) : (
            <div className="calib-status prompt">
              <Hand size={36} className="text-cyan icon-pulse" />
              <div>
                <h3>Raise Both Hands</h3>
                <p>Ensure upper body and both hands are clearly visible in the camera frame.</p>
                <div className="hand-badge-status">
                  Hands Detected: <strong className={handCount > 0 ? 'text-cyan' : 'text-amber'}>{handCount} / 2</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="calibration-actions">
        {error && <p role="alert">{error}</p>}
        <button className="btn btn-secondary" onClick={onSkip}>View level map</button>
        <button
          className={`btn btn-primary btn-large ${bothHandsDetected ? 'pulse-glow' : ''}`}
          onClick={onCalibrationComplete}
          disabled={!isLoaded}
        >
          {bothHandsDetected ? 'Start Playing Game 🚀' : 'Continue to Menu'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

