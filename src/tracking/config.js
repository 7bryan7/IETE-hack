export const DEBUG_HAND_TRACKING = true;

export const TRACKING_CONFIG = Object.freeze({
  numHands: 2,
  runningMode: 'VIDEO',
  minHandDetectionConfidence: 0.70,
  minHandPresenceConfidence: 0.70,
  minTrackingConfidence: 0.70,
  minHandednessConfidence: 0.70,
  labelConfirmationFrames: 3,
  smoothingAlpha: 0.7,
  grabThreshold: 0.32,
  releaseThreshold: 0.42,
  identityTimeoutMs: 250,
  // The previous unconditional swap inverted the user's physical labels.
  // Change only after checking a known physical hand against the raw debug label.
  swapHandedness: false,
});
