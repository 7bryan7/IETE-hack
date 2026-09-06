import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { isPinching, getPinchMidpoint } from '../utils/gestures';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export function useHandTracking(videoRef, options = {}) {
  const {
    numHands = 2,
    runningMode = 'VIDEO',
    pinchThreshold = 0.08
  } = options;

  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const pinchStateRef = useRef({});

  const [isLoaded, setIsLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  
  // Real-time output data stored in Ref for 60fps canvas loop performance, plus state for React components
  const trackingDataRef = useRef({
    hands: [], // array of { landmarks (mirrored x), originalLandmarks, handedness ('Left'/'Right'), isPinching, pinchMidpoint, indexTip, thumbTip }
    handCount: 0
  });

  const [handCount, setHandCount] = useState(0);

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    let isMounted = true;

    async function initHandLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU'
          },
          runningMode: runningMode,
          numHands: numHands,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setIsLoaded(true);
          console.log('MediaPipe HandLandmarker initialized successfully');
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

          if (results && results.landmarks) {
            const detectedHands = [];

            results.landmarks.forEach((landmarks, index) => {
              // Get handedness label ('Left' or 'Right')
              let rawHandedness = 'Right';
              if (results.handednesses && results.handednesses[index]) {
                const category = results.handednesses[index][0];
                rawHandedness = category.categoryName || category.displayName || 'Right';
              }

              // Since the camera is mirrored horizontally (CSS scaleX(-1)),
              // MediaPipe's 'Left' hand appears on the RIGHT side of the video preview.
              // To align user perception (selfie view), we swap 'Left' and 'Right' labels!
              const mirroredHandedness = rawHandedness === 'Left' ? 'Right' : 'Left';

              // Mirror X coordinates for canvas drawing so points match mirrored video!
              const mirroredLandmarks = landmarks.map(pt => ({
                x: 1 - pt.x,
                y: pt.y,
                z: pt.z
              }));

              // Check pinch status using mirrored landmarks
              const handId = `${mirroredHandedness}_${index}`;
              const prevPinch = pinchStateRef.current[handId] || false;
              const pinching = isPinching(mirroredLandmarks, prevPinch, pinchThreshold);
              pinchStateRef.current[handId] = pinching;

              const pinchMidpoint = getPinchMidpoint(mirroredLandmarks);

              detectedHands.push({
                index,
                landmarks: mirroredLandmarks,
                rawLandmarks: landmarks,
                handedness: mirroredHandedness,
                isPinching: pinching,
                pinchMidpoint: pinchMidpoint,
                indexTip: mirroredLandmarks[8],
                thumbTip: mirroredLandmarks[4],
                wrist: mirroredLandmarks[0]
              });
            });

            trackingDataRef.current = {
              hands: detectedHands,
              handCount: detectedHands.length
            };

            setIsTracking(detectedHands.length > 0);
            setHandCount(detectedHands.length);
          }
        } catch (e) {
          // Process frame error catch
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(processFrame);
  }, [videoRef, pinchThreshold]);

  // Start / stop frame loop when video & model ready
  useEffect(() => {
    if (isLoaded) {
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

