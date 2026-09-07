import { TRACKING_CONFIG } from './config.js';
import { getPinchMidpoint, getPinchRatio, isPinching } from '../utils/gestures.js';

// Orientation convention is independent of CSS/display-coordinate mirroring.
export function normalizeHandedness(label, swap = TRACKING_CONFIG.swapHandedness) {
  if (label !== 'Left' && label !== 'Right') return null;
  return swap ? (label === 'Left' ? 'Right' : 'Left') : label;
}

export function smoothLandmarks(previous, current, alpha = TRACKING_CONFIG.smoothingAlpha) {
  return current.map((point, i) => ({
    x: previous ? alpha * previous[i].x + (1 - alpha) * point.x : point.x,
    y: previous ? alpha * previous[i].y + (1 - alpha) * point.y : point.y,
    z: previous ? alpha * previous[i].z + (1 - alpha) * (point.z || 0) : (point.z || 0),
  }));
}

// Match the existing centered object-fit: cover video, including its cropped edges.
export function toDisplayLandmarks(points, { videoWidth = 1, videoHeight = 1, width = videoWidth, height = videoHeight } = {}) {
  const scale = Math.max(width / videoWidth, height / videoHeight);
  const drawnWidth = videoWidth * scale;
  const drawnHeight = videoHeight * scale;
  return points.map(p => ({ ...p,
    x: ((1 - p.x) * drawnWidth - (drawnWidth - width) / 2) / width,
    y: (p.y * drawnHeight - (drawnHeight - height) / 2) / height,
  }));
}

export function createHandTracker(overrides = {}) {
  const config = { ...TRACKING_CONFIG, ...overrides };
  let tracks = [];
  let nextId = 0;
  return {
    reset() { tracks = []; },
    update(results, now, viewport = {}) {
      tracks = tracks.filter(t => now - t.seen <= config.identityTimeoutMs);
      const detections = (results.landmarks || []).map((points, index) => {
        const category = results.handednesses?.[index]?.[0];
        const confidence = category?.score ?? 0;
        return { points, index, raw: category?.categoryName ?? null, confidence,
          label: confidence >= config.minHandednessConfidence
            ? normalizeHandedness(category?.categoryName, config.swapHandedness) : null };
      }).filter(d => d.points.length === 21 && d.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));

      // Global one-to-one association, independent of detection order. Position is
      // used only for continuity, never to infer Left/Right. Velocity helps crossing.
      let best = { cost: Infinity, assignment: [] };
      function assign(i, used, assignment, cost) {
        if (i === detections.length) {
          if (cost < best.cost) best = { cost, assignment: [...assignment] };
          return;
        }
        assign(i + 1, used, [...assignment, null], cost + 0.6);
        tracks.forEach(t => {
          if (used.has(t.id)) return;
          const dt = Math.min(now - t.seen, 80);
          const p = detections[i].points[0];
          const distance = Math.hypot(p.x - t.wrist.x - t.velocity.x * dt, p.y - t.wrist.y - t.velocity.y * dt);
          if (distance > 0.45) return;
          const mismatch = detections[i].label && t.label && detections[i].label !== t.label ? 0.12 : 0;
          assign(i + 1, new Set([...used, t.id]), [...assignment, t], cost + distance + mismatch);
        });
      }
      assign(0, new Set(), [], 0);
      const hands = [];
      const debugHands = [];
      detections.forEach((d, i) => {
        let t = best.assignment[i];
        if (!t) {
          t = { id: nextId++, label: null, candidate: null, count: 0, seen: now,
            wrist: d.points[0], velocity: { x: 0, y: 0 }, smoothed: null, pinching: false };
          tracks.push(t);
        }
        if (d.label && d.label !== t.label) {
          t.count = t.candidate === d.label ? t.count + 1 : 1;
          t.candidate = d.label;
        } else { t.candidate = null; t.count = 0; }
        if (t.count >= config.labelConfirmationFrames) {
          t.label = t.candidate;
          t.candidate = null;
          t.count = 0;
          t.smoothed = null;
          t.pinching = false;
        }
        const dt = Math.max(1, now - t.seen);
        t.velocity = { x: (d.points[0].x - t.wrist.x) / dt, y: (d.points[0].y - t.wrist.y) / dt };
        t.wrist = d.points[0];
        t.seen = now;
        // Each persistent hand owns its own EMA and pinch history.
        t.smoothed = smoothLandmarks(t.smoothed, d.points, config.smoothingAlpha);
        const aspect = (viewport.videoWidth || 1) / (viewport.videoHeight || 1);
        const ratio = getPinchRatio(t.smoothed, aspect);
        t.pinching = isPinching(t.smoothed, t.pinching, config.grabThreshold, config.releaseThreshold, aspect);
        const landmarks = toDisplayLandmarks(t.smoothed, viewport);
        const hand = { id: t.id, index: d.index, landmarks, rawLandmarks: d.points,
          handedness: t.label, rawHandedness: d.raw, normalizedHandedness: normalizeHandedness(d.raw, config.swapHandedness),
          handednessConfidence: d.confidence, pinchRatio: ratio, isPinching: t.pinching,
          pinchMidpoint: getPinchMidpoint(landmarks), indexTip: landmarks[8], thumbTip: landmarks[4], wrist: landmarks[0],
          trackingStatus: !d.label ? 'Low confidence' : (!t.label || t.candidate ? 'Stabilizing' : 'Stable') };
        debugHands.push(hand);
        if (t.label) hands.push(hand);
      });
      // Never expose two competing physical labels to games during ambiguity.
      const uniqueHands = hands.filter(h => hands.filter(other => other.handedness === h.handedness).length === 1);
      return { hands: uniqueHands, handCount: uniqueHands.length, debugHands };
    },
  };
}
