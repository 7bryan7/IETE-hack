import React, { useEffect, useState, useRef } from 'react';
import { Camera, CameraOff, AlertCircle, RefreshCw } from 'lucide-react';

export default function CameraView({ videoRef, onVideoReady }) {
  const [cameraState, setCameraState] = useState('initializing'); // initializing, active, denied, missing, error
  const [errorMessage, setErrorMessage] = useState('');

  const streamRef = useRef(null);
  const requestRef = useRef(0);
  const stopStream = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    const request = ++requestRef.current;
    stopStream();
    setCameraState('initializing');
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('missing');
      setErrorMessage('Webcam access is not supported by your browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: { ideal: 'user' }
        },
        audio: false
      });

      if (request !== requestRef.current || !videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          if (request !== requestRef.current) return;
          video.play().then(() => {
            if (request !== requestRef.current) return;
            setCameraState('active');
            if (onVideoReady) onVideoReady();
          }).catch(err => {
            if (request !== requestRef.current) return;
            stopStream();
            console.error('Video play error:', err);
            setCameraState('error');
            setErrorMessage('Unable to play webcam video feed.');
          });
        };
      }
    } catch (err) {
      if (request !== requestRef.current) return;
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings to play MotionForge.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('missing');
        setErrorMessage('No camera detected. Please connect a webcam to play MotionForge.');
      } else {
        setCameraState('error');
        setErrorMessage(`Camera error: ${err.message || 'Could not start camera feed.'}`);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    startCamera();

    return () => {
      ++requestRef.current;
      stopStream();
      if (video) {
        video.onloadedmetadata = null;
        video.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        playsInline
        muted
        className={`camera-feed ${cameraState === 'active' ? 'active' : 'hidden'}`}
      />

      {cameraState === 'initializing' && (
        <div className="camera-overlay-state">
          <div className="spinner"></div>
          <p>Connecting to Webcam...</p>
        </div>
      )}

      {cameraState === 'denied' && (
        <div className="camera-overlay-state error">
          <AlertCircle size={48} className="icon-pulse" />
          <h3>Camera Access Required 🔒</h3>
          <p>{errorMessage}</p>
          <button className="btn btn-primary" onClick={startCamera}>
            <RefreshCw size={18} /> Retry Permission
          </button>
        </div>
      )}

      {cameraState === 'missing' && (
        <div className="camera-overlay-state error">
          <CameraOff size={48} />
          <h3>No Camera Detected 📷</h3>
          <p>{errorMessage}</p>
          <button className="btn btn-secondary" onClick={startCamera}>
            <RefreshCw size={18} /> Check Again
          </button>
        </div>
      )}

      {cameraState === 'error' && (
        <div className="camera-overlay-state error">
          <AlertCircle size={48} />
          <h3>Camera Error</h3>
          <p>{errorMessage}</p>
          <button className="btn btn-primary" onClick={startCamera}>
            <RefreshCw size={18} /> Try Again
          </button>
        </div>
      )}
    </div>
  );
}

