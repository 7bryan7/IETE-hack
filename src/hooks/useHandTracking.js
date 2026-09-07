import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { TRACKING_CONFIG } from '../tracking/config.js';
import { createHandTracker } from '../tracking/handTracking.js';
import wasmLoader from '@mediapipe/tasks-vision/vision_wasm_internal.js?url';
import wasmBinary from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url';
import wasmFallbackLoader from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js?url';
import wasmFallbackBinary from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm?url';

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export function useHandTracking(videoRef, options = {}) {
  const {
    numHands = TRACKING_CONFIG.numHands,
    runningMode = TRACKING_CONFIG.runningMode,
    pinchThreshold = TRACKING_CONFIG.grabThreshold
  } = options;

  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const trackerRef = useRef(null);
  const countRef = useRef(0);
  const frameErrorRef = useRef(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  
  // Real-time output data stored in Ref for 60fps canvas loop performance, plus state for React components
  const trackingDataRef = useRef({
    hands: [], // Stable physical handedness and mirrored, crop-corrected landmarks
    handCount: 0
  });

  const [handCount, setHandCount] = useState(0);

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    let isMounted = true;
    setIsLoaded(false);
    lastVideoTimeRef.current = -1;

    async function initHandLandmarker() {
      try {
        // Bundle the runtime from the installed package so JS and WASM versions agree.
        const simd = await FilesetResolver.isSimdSupported();
        const vision = {
          wasmLoaderPath: simd ? wasmLoader : wasmFallbackLoader,
          wasmBinaryPath: simd ? wasmBinary : wasmFallbackBinary,
        };
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU'
          },
          runningMode: runningMode,
          numHands: numHands,
          minHandDetectionConfidence: TRACKING_CONFIG.minHandDetectionConfidence,
          minHandPresenceConfidence: TRACKING_CONFIG.minHandPresenceConfidence,
          minTrackingConfidence: TRACKING_CONFIG.minTrackingConfidence
        });

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setIsLoaded(true);
          console.log('MediaPipe HandLandmarker initialized successfully');
        } else {
          landmarker.close();
        }
      } catch (err) {
        console.error('Failed to initialize MediaPipe HandLandmarker:', err);
        if (isMounted) {
          setError('Failed to load hand tracking model. Please check internet connection.');
        }
      }
    }

    initHandLandmarker();

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [numHands, runningMode]);

  // Detection loop using requestAnimationFrame
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (video && landmarker && video.readyState >= 2 && !video.paused) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const now = performance.now();

        try {
          const results = landmarker.detectForVideo(video, now);

          const data = trackerRef.current.update(results, now, {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            width: video.clientWidth || video.videoWidth,
            height: video.clientHeight || video.videoHeight,
          });
          trackingDataRef.current = data;
          if (countRef.current !== data.handCount) {
            countRef.current = data.handCount;
            setIsTracking(data.handCount > 0);
            setHandCount(data.handCount);
          }
          if (frameErrorRef.current) {
            frameErrorRef.current = false;
            setError(null);
          }
        } catch (e) {
          frameErrorRef.current = true;
          trackerRef.current.reset();
          trackingDataRef.current = { hands: [], handCount: 0, debugHands: [], status: 'Tracking error' };
          countRef.current = 0;
          setHandCount(0);
          setIsTracking(false);
          setError('Hand tracking interrupted. Please check the camera feed.');
        }
      }
    }

    if (!video || video.paused || video.readyState < 2) {
      trackerRef.current.reset();
      trackingDataRef.current = { hands: [], handCount: 0, debugHands: [], status: 'Waiting for camera' };
      if (countRef.current !== 0) {
        countRef.current = 0;
        setHandCount(0);
        setIsTracking(false);
      }
    }
    animFrameIdRef.current = requestAnimationFrame(processFrame);
  }, [videoRef, pinchThreshold]);

  // Start / stop frame loop when video & model ready
  useEffect(() => {
    if (isLoaded) {
      trackerRef.current = createHandTracker({ grabThreshold: pinchThreshold });
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isLoaded, processFrame]);

  return {
    isLoaded,
    isTracking,
    handCount,
    error,
    trackingDataRef
  };
}

