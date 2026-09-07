/**
 * Collision detection utilities for MotionForge game objects
 */

/**
 * Check if a normalized point (x, y) is inside a target circle
 * @param {Object} point - { x: 0..1, y: 0..1 }
 * @param {Object} target - { x: 0..1, y: 0..1, radius: 0..1 }
 */
export function isPointInCircle(point, target) {
  if (!point || !target) return false;
  const dx = point.x - target.x;
  const dy = point.y - target.y;
  const distance = Math.hypot(dx, dy);
  return distance <= target.radius;
}

/**
 * Check collision in pixel space
 */
export function isPointInCirclePx(px, py, cx, cy, radius) {
  const dx = px - cx;
  const dy = py - cy;
  return (dx * dx + dy * dy) <= (radius * radius);
}

/**
 * Check if a point is within a rectangular target zone (normalized 0..1)
 */
export function isPointInRect(point, rect) {
  if (!point || !rect) return false;
  return (
    point.x >= rect.x - rect.width / 2 &&
    point.x <= rect.x + rect.width / 2 &&
    point.y >= rect.y - rect.height / 2 &&
    point.y <= rect.y + rect.height / 2
  );
}

/**
 * Check if two circles overlap (useful for hand transfer & object dropping)
 */
export function doCirclesOverlap(c1, c2) {
  if (!c1 || !c2) return false;
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  const distance = Math.hypot(dx, dy);
  return distance <= (c1.radius + c2.radius);
}

