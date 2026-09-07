import { TRACKING_CONFIG } from '../tracking/config.js';

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
export const DEFAULT_PINCH_THRESHOLD = TRACKING_CONFIG.grabThreshold;

export function getPinchRatio(landmarks, aspect = 1) {
  if (!landmarks || landmarks.length < 10) return Infinity;
  const distance = (a, b) => Math.hypot((a.x - b.x) * aspect, a.y - b.y);
  const handSize = distance(landmarks[0], landmarks[9]);
  return handSize > 1e-6 ? distance(landmarks[4], landmarks[8]) / handSize : Infinity;
}

export function isPinching(landmarks, currentPinchState = false,
  grabThreshold = DEFAULT_PINCH_THRESHOLD, releaseThreshold = TRACKING_CONFIG.releaseThreshold, aspect = 1) {
  const ratio = getPinchRatio(landmarks, aspect);
  return Number.isFinite(ratio) && (currentPinchState ? ratio <= releaseThreshold : ratio < grabThreshold);
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

