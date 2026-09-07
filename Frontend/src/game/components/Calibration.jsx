import React, { useEffect, useState } from 'react';
import CameraView from './Camera';
import GameCanvas from './GameCanvas';
import { useHandTracking } from '../hooks/useHandTracking';
import { CheckCircle2, Hand, Sparkles, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

export default function Calibration({ videoRef, onCalibrationComplete, onSkip, onBackToLanding }) {
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
        {onBackToLanding && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginBottom: '14px', alignSelf: 'center', padding: '8px 18px', fontSize: '13px' }}
            onClick={onBackToLanding}
          >
            ← Back to Landing Page
          </button>
        )}
        <div style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 800,
          fontSize: '0.82rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#EA9F0E',
          marginBottom: '0.5rem'
        }}>
          Webcam Vision Setup
        </div>
        <h2>Camera & Hand Setup 🖐️🖐️</h2>
        <p>Ensure both hands are visible in the camera frame to calibrate tracking.</p>
      </div>

      <div className="calibration-view-wrapper">
        <CameraView videoRef={videoRef} />
        <GameCanvas trackingDataRef={trackingDataRef} showSkeleton={true} />

        <div className="calibration-overlay-card">
          {!isLoaded ? (
            <div className="calib-status loading">
              <div className="spinner"></div>
              <span>Connecting AI Vision Model...</span>
            </div>
          ) : bothHandsDetected ? (
            <div className="calib-status ready animate-bounce">
              <CheckCircle2 size={38} style={{ color: '#02AE90' }} />
              <div>
                <h3>Hands Ready! ✅</h3>
                <p>Both hands detected and calibrated successfully!</p>
              </div>
            </div>
          ) : (
            <div className="calib-status prompt">
              <Hand size={36} style={{ color: '#EA9F0E' }} className="icon-pulse" />
              <div>
                <h3>Raise Both Hands</h3>
                <p>Position your hands in front of the camera.</p>
                <div className="hand-badge-status">
                  Hands Detected: <strong style={{ color: handCount > 0 ? '#02AE90' : '#EA9F0E', fontSize: '15px' }}>{handCount} / 2</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="calibration-actions">
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

