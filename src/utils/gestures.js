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
 * Pinch gesture detector with configurable thresholds and hysteresis
 * Landmark 4: Thumb Tip
 * Landmark 8: Index Finger Tip
 */
export const DEFAULT_PINCH_THRESHOLD = 0.08; // Normalized threshold (~8% of screen width)

export function isPinching(handLandmarks, currentPinchState = false, customThreshold = DEFAULT_PINCH_THRESHOLD) {
  if (!handLandmarks || handLandmarks.length < 9) {
    return false;
  }

  const thumbTip = handLandmarks[4];
  const indexTip = handLandmarks[8];

  const dist = getDistance(thumbTip, indexTip);
  
  // Apply hysteresis to prevent rapid flickering between grab and release
  const grabThreshold = customThreshold;
  const releaseThreshold = customThreshold * 1.35;

  if (currentPinchState) {
    return dist < releaseThreshold;
  } else {
    return dist < grabThreshold;
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

