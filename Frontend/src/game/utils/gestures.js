/**
 * Gesture detection utilities for MotionForge
 */

/**
 * Calculates 2D Euclidean distance between two landmark points
 * Normalized coordinates are typically (0..1)
 */
export function getDistance(p1, p2) {
  if (!p1 || !p2) return Infinity;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

/**
 * Calculate distance in pixel space given canvas dimensions
 */
export function getPixelDistance(p1, p2, width, height) {
  if (!p1 || !p2) return Infinity;
  const dx = (p1.x - p2.x) * width;
  const dy = (p1.y - p2.y) * height;
  return Math.hypot(dx, dy);
}

/**
 * Maps raw MediaPipe handedness ('Left'/'Right') from camera perspective
 * to normalized physical handedness ('Right'/'Left') for selfie-view user perception.
 */
export function normalizeHandedness(rawCategoryName) {
  if (rawCategoryName === 'Left') return 'Right';
  if (rawCategoryName === 'Right') return 'Left';
  return rawCategoryName || 'Right';
}

/**
 * Pinch gesture detector with configurable thresholds and hysteresis
 * Landmark 4: Thumb Tip
 * Landmark 8: Index Finger Tip
 * Landmark 0: Wrist
 * Landmark 9: Middle Finger MCP
 */
export const DEFAULT_GRAB_THRESHOLD = 0.32;
export const DEFAULT_RELEASE_THRESHOLD = 0.42;

/**
 * Calculates normalized pinch ratio between Thumb Tip (4) and Index Tip (8)
 * relative to hand scale (Wrist 0 to Middle MCP 9).
 */
export function getPinchRatio(handLandmarks) {
  if (!handLandmarks || handLandmarks.length < 21) return 1.0;
  const thumbTip = handLandmarks[4];
  const indexTip = handLandmarks[8];
  const wrist = handLandmarks[0];
  const middleMCP = handLandmarks[9];

  if (!thumbTip || !indexTip || !wrist || !middleMCP) return 1.0;

  const pinchDistance = getDistance(thumbTip, indexTip);
  const handSize = getDistance(wrist, middleMCP);

  if (handSize === 0 || !isFinite(handSize)) return 1.0;
  return pinchDistance / handSize;
}

export function isPinching(
  handLandmarks,
  currentPinchState = false,
  grabThreshold = DEFAULT_GRAB_THRESHOLD,
  releaseThreshold = DEFAULT_RELEASE_THRESHOLD
) {
  if (!handLandmarks || handLandmarks.length < 21) {
    return false;
  }

  const ratio = getPinchRatio(handLandmarks);

  if (currentPinchState) {
    return ratio < releaseThreshold;
  } else {
    return ratio < grabThreshold;
  }
}

/**
 * Get midpoint between index finger tip and thumb tip (useful for grabbed item positioning)
 */
export function getPinchMidpoint(handLandmarks) {
  if (!handLandmarks || handLandmarks.length < 9) return null;
  const thumb = handLandmarks[4];
  const index = handLandmarks[8];
  return {
    x: (thumb.x + index.x) / 2,
    y: (thumb.y + index.y) / 2,
    z: ((thumb.z || 0) + (index.z || 0)) / 2
  };
}

/**
 * Detect open hand palm (fingers extended vs closed)
 */
export function isOpenHand(handLandmarks) {
  if (!handLandmarks || handLandmarks.length < 21) return false;
  const wrist = handLandmarks[0];
  
  // Check if fingertips are farther from wrist than MCP joints
  const tips = [8, 12, 16, 20];
  const mcps = [5, 9, 13, 17];
  
  let extendedCount = 0;
  for (let i = 0; i < 4; i++) {
    const tipDist = getDistance(handLandmarks[tips[i]], wrist);
    const mcpDist = getDistance(handLandmarks[mcps[i]], wrist);
    if (tipDist > mcpDist) extendedCount++;
  }
  
  return extendedCount >= 3;
}

