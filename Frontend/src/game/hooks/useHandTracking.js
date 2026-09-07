import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import {
  isPinching,
  getPinchMidpoint,
  getPinchRatio,
  normalizeHandedness,
  DEFAULT_GRAB_THRESHOLD,
  DEFAULT_RELEASE_THRESHOLD
} from '../utils/gestures';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export const DEBUG_HAND_TRACKING = true;

const DEFAULT_OPTIONS = {
  numHands: 2,
  runningMode: 'VIDEO',
  minHandDetectionConfidence: 0.70,
  minHandPresenceConfidence: 0.70,
  minTrackingConfidence: 0.70,
  smoothingAlpha: 0.70,
  grabThreshold: DEFAULT_GRAB_THRESHOLD,
  releaseThreshold: DEFAULT_RELEASE_THRESHOLD
};

export function useHandTracking(videoRef, options = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const {
    numHands,
    runningMode,
    minHandDetectionConfidence,
    minHandPresenceConfidence,
    minTrackingConfidence,
    smoothingAlpha,
    grabThreshold,
    releaseThreshold
  } = mergedOptions;

  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const pinchStateRef = useRef({});
  
  // Independent landmark smoothing state per hand identity: { Right: [...21 pts], Left: [...21 pts] }
  const smoothingStateRef = useRef({ Right: null, Left: null });
  // Frame counter for missing hand tracking reset
  const missingFrameCountRef = useRef({ Right: 0, Left: 0 });
  // Temporal history buffer for handedness majority voting
  const handednessHistoryRef = useRef({ Right: [], Left: [] });
  // Spatial position of wrists from previous frame to preserve hand identity
  const previousHandPosRef = useRef({ Right: null, Left: null });

  const [isLoaded, setIsLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  
  const trackingDataRef = useRef({
    hands: [],
    handCount: 0
  });

  const [handCount, setHandCount] = useState(0);

  // Initialize MediaPipe HandLandmarker with 0.70 confidence options
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
          minHandDetectionConfidence: minHandDetectionConfidence,
          minHandPresenceConfidence: minHandPresenceConfidence,
          minTrackingConfidence: minTrackingConfidence
        });

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setIsLoaded(true);
          console.log('MediaPipe HandLandmarker initialized with 0.70 confidence thresholds');
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
  }, [
    numHands,
    runningMode,
    minHandDetectionConfidence,
    minHandPresenceConfidence,
    minTrackingConfidence
  ]);

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
            const seenHands = { Right: false, Left: false };

            // Step 1: Filter raw detections by handedness confidence & normalize handedness
            const rawCandidates = [];
            results.landmarks.forEach((landmarks, index) => {
              let rawCategoryName = 'Right';
              let score = 1.0;

              if (results.handednesses && results.handednesses[index] && results.handednesses[index][0]) {
                const category = results.handednesses[index][0];
                rawCategoryName = category.categoryName || category.displayName || 'Right';
                score = category.score !== undefined ? category.score : 1.0;
              }

              // Ignore handedness predictions with low confidence (< 0.70)
              if (score < 0.70) return;

              const normalizedLabel = normalizeHandedness(rawCategoryName);
              const wristPos = landmarks[0];

              rawCandidates.push({
                index,
                landmarks,
                rawCategoryName,
                normalizedLabel,
                score,
                wristPos
              });
            });

            // Step 2: Temporal stabilization & spatial hand identity correlation
            rawCandidates.forEach(cand => {
              let assignedHandedness = cand.normalizedLabel;

              const prevRight = previousHandPosRef.current.Right;
              const prevLeft = previousHandPosRef.current.Left;

              if (prevRight || prevLeft) {
                const distToRight = prevRight ? Math.hypot(cand.wristPos.x - prevRight.x, cand.wristPos.y - prevRight.y) : Infinity;
                const distToLeft = prevLeft ? Math.hypot(cand.wristPos.x - prevLeft.x, cand.wristPos.y - prevLeft.y) : Infinity;

                if (distToRight < 0.25 && distToRight < distToLeft && !seenHands.Right) {
                  assignedHandedness = 'Right';
                } else if (distToLeft < 0.25 && distToLeft < distToRight && !seenHands.Left) {
                  assignedHandedness = 'Left';
                }
              }

              // Majority voting over recent 5 frames
              if (!handednessHistoryRef.current[assignedHandedness]) {
                handednessHistoryRef.current[assignedHandedness] = [];
              }
              const history = handednessHistoryRef.current[assignedHandedness];
              history.push(cand.normalizedLabel);
              if (history.length > 5) history.shift();

              const rightVotes = history.filter(v => v === 'Right').length;
              const leftVotes = history.filter(v => v === 'Left').length;
              const stabilizedHandedness = rightVotes >= leftVotes ? 'Right' : 'Left';

              seenHands[stabilizedHandedness] = true;
              missingFrameCountRef.current[stabilizedHandedness] = 0;
              previousHandPosRef.current[stabilizedHandedness] = { x: cand.wristPos.x, y: cand.wristPos.y };

              // Step 3: Mirror X coordinate for canvas drawing (displayX = 1 - landmark.x)
              const mirroredLandmarks = cand.landmarks.map(pt => ({
                x: 1 - pt.x,
                y: pt.y,
                z: pt.z
              }));

              // Step 4: EMA Landmark Smoothing (alpha = 0.7) for all 21 landmarks
              let prevSmooth = smoothingStateRef.current[stabilizedHandedness];
              let smoothedLandmarks = [];

              if (!prevSmooth || prevSmooth.length !== mirroredLandmarks.length) {
                smoothedLandmarks = mirroredLandmarks;
              } else {
                smoothedLandmarks = mirroredLandmarks.map((curr, idx) => {
                  const prev = prevSmooth[idx];
                  return {
                    x: smoothingAlpha * prev.x + (1 - smoothingAlpha) * curr.x,
                    y: smoothingAlpha * prev.y + (1 - smoothingAlpha) * curr.y,
                    z: smoothingAlpha * prev.z + (1 - smoothingAlpha) * curr.z
                  };
                });
              }
              smoothingStateRef.current[stabilizedHandedness] = smoothedLandmarks;

              // Step 5: Pinch gesture calculation with hand-size normalization & hysteresis
              const prevPinch = pinchStateRef.current[stabilizedHandedness] || false;
              const pinchRatio = getPinchRatio(smoothedLandmarks);
              const pinching = isPinching(smoothedLandmarks, prevPinch, grabThreshold, releaseThreshold);
              pinchStateRef.current[stabilizedHandedness] = pinching;

              const pinchMidpoint = getPinchMidpoint(smoothedLandmarks);

              detectedHands.push({
                index: cand.index,
                landmarks: smoothedLandmarks,
                rawLandmarks: cand.landmarks,
                rawHandedness: cand.rawCategoryName,
                handedness: stabilizedHandedness,
                handednessScore: cand.score,
                pinchRatio: pinchRatio,
                isPinching: pinching,
                pinchMidpoint: pinchMidpoint,
                indexTip: smoothedLandmarks[8],
                thumbTip: smoothedLandmarks[4],
                wrist: smoothedLandmarks[0],
                trackingStatus: 'Stable'
              });
            });

            // Reset smoothing & identity tracking for missing hands
            ['Right', 'Left'].forEach(side => {
              if (!seenHands[side]) {
                missingFrameCountRef.current[side] += 1;
                if (missingFrameCountRef.current[side] > 5) {
                  smoothingStateRef.current[side] = null;
                  previousHandPosRef.current[side] = null;
                  handednessHistoryRef.current[side] = [];
                  pinchStateRef.current[side] = false;
                }
              }
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
  }, [
    videoRef,
    smoothingAlpha,
    grabThreshold,
    releaseThreshold
  ]);

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

