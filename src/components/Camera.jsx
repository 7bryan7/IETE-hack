import React, { useEffect, useState } from 'react';
import { Camera, CameraOff, AlertCircle, RefreshCw } from 'lucide-react';

export default function CameraView({ videoRef, onVideoReady }) {
  const [cameraState, setCameraState] = useState('initializing'); // initializing, active, denied, missing, error
  const [errorMessage, setErrorMessage] = useState('');

  const startCamera = async () => {
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
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraState('active');
            if (onVideoReady) onVideoReady();
          }).catch(err => {
            console.error('Video play error:', err);
            setCameraState('error');
            setErrorMessage('Unable to play webcam video feed.');
          });
        };
      }
    } catch (err) {
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
    startCamera();

    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
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

