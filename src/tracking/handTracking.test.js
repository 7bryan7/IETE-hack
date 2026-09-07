import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandTracker, normalizeHandedness, smoothLandmarks, toDisplayLandmarks } from './handTracking.js';
import { getPinchRatio, isPinching } from '../utils/gestures.js';

function points(x = 0.3, scale = 1, ratio = 0.27) {
  const p = Array.from({ length: 21 }, () => ({ x, y: 0.5, z: 0 }));
  p[9].y -= 0.2 * scale;
  p[4] = { x, y: 0.3, z: 0 };
  p[8] = { x: x + ratio * 0.2 * scale, y: 0.3, z: 0 };
  return p;
}
const result = (...hands) => ({ landmarks: hands.map(h => points(h.x)),
  handednesses: hands.map(h => [{ categoryName: h.label, score: h.score ?? 0.96 }]) });

test('normalization is explicit, independent of screen position and display mirroring', () => {
  assert.equal(normalizeHandedness('Right'), 'Right');
  assert.equal(normalizeHandedness('Left'), 'Left');
  assert.equal(normalizeHandedness('Left', true), 'Right');
  assert.equal(normalizeHandedness('Right', true), 'Left');
  assert.equal(normalizeHandedness(undefined), null);
  assert.equal(toDisplayLandmarks(points(0.2))[0].x, 0.8);
});
for (const label of ['Left', 'Right']) test(`${label} alone requires three confident frames`, () => {
  const tracker = createHandTracker();
  assert.equal(tracker.update(result({ label, x: 0.5, score: 0.2 }), 0).handCount, 0);
  assert.equal(tracker.update(result({ label, x: 0.5 }), 33).handCount, 0);
  assert.equal(tracker.update(result({ label, x: 0.5 }), 66).handCount, 0);
  assert.equal(tracker.update(result({ label, x: 0.5 }), 99).hands[0].handedness, label);
});
test('both hands retain identity through detection reordering and crossing', () => {
  const tracker = createHandTracker();
  let data;
  for (let i = 0; i < 3; i++) data = tracker.update(result({ label: 'Left', x: 0.3 }, { label: 'Right', x: 0.7 }), i * 33);
  const ids = Object.fromEntries(data.hands.map(h => [h.handedness, h.id]));
  for (let i = 1; i <= 8; i++) {
    const hands = [{ label: 'Left', x: 0.3 + i * 0.05 }, { label: 'Right', x: 0.7 - i * 0.05 }];
    if (i % 2) hands.reverse();
    data = tracker.update(result(...hands), (i + 2) * 33);
    assert.equal(data.handCount, 2);
    for (const hand of data.hands) assert.equal(hand.id, ids[hand.handedness]);
  }
});
test('one wrong label or low-confidence label cannot flip a tracked hand', () => {
  const tracker = createHandTracker();
  for (let i = 0; i < 3; i++) tracker.update(result({ label: 'Right', x: 0.3 }), i * 33);
  assert.equal(tracker.update(result({ label: 'Left', x: 0.3 }), 99).hands[0].handedness, 'Right');
  assert.equal(tracker.update(result({ label: 'Left', x: 0.3, score: 0.2 }), 132).hands[0].handedness, 'Right');
  tracker.update(result({ label: 'Left', x: 0.3 }), 165);
  assert.equal(tracker.update(result({ label: 'Left', x: 0.3 }), 198).hands[0].handedness, 'Right');
  assert.equal(tracker.update(result({ label: 'Left', x: 0.3 }), 231).hands[0].handedness, 'Left');
});
test('EMA smooths all coordinates without modifying raw points or the other hand', () => {
  const raw = points(0.8);
  const smoothed = smoothLandmarks(points(0.2), raw);
  assert.ok(Math.abs(smoothed[0].x - 0.38) < 1e-10);
  assert.equal(raw[0].x, 0.8);
  const tracker = createHandTracker();
  for (let i = 0; i < 3; i++) tracker.update(result({ label: 'Left', x: 0.3 }, { label: 'Right', x: 0.7 }), i * 33);
  const data = tracker.update(result({ label: 'Right', x: 0.7 }, { label: 'Left', x: 0.4 }), 99);
  assert.ok(Math.abs(data.hands.find(h => h.handedness === 'Right').wrist.x - 0.3) < 1e-10);
  assert.ok(Math.abs(data.hands.find(h => h.handedness === 'Left').wrist.x - 0.67) < 1e-10);
});
test('pinch is scale-independent, aspect-corrected and uses hysteresis', () => {
  for (const scale of [0.25, 1, 2]) {
    assert.ok(Math.abs(getPinchRatio(points(0.3, scale)) - 0.27) < 1e-10);
    assert.equal(isPinching(points(0.3, scale)), true);
    assert.equal(isPinching(points(0.3, scale, 0.37), false), false);
    assert.equal(isPinching(points(0.3, scale, 0.37), true), true);
    assert.equal(isPinching(points(0.3, scale, 0.45), true), false);
  }
  assert.equal(isPinching(points(0.3, 0), true), false);
  assert.ok(Math.abs(getPinchRatio(points(), 2) - 0.54) < 1e-10);
});
test('crop-aware coordinates align with a centered mirrored cover video', () => {
  const [p] = toDisplayLandmarks(points(0.25), { videoWidth: 1280, videoHeight: 720, width: 720, height: 720 });
  assert.ok(Math.abs(p.x - (960 - 280) / 720) < 1e-10);
  assert.equal(p.y, 0.5);
});
test('lost hands are not emitted and expired identity/pinch history resets', () => {
  const tracker = createHandTracker();
  let data;
  for (let i = 0; i < 3; i++) data = tracker.update(result({ label: 'Right', x: 0.3 }), i * 33);
  const id = data.hands[0].id;
  assert.equal(tracker.update(result(), 99).handCount, 0);
  assert.equal(tracker.update(result({ label: 'Right', x: 0.3 }), 132).hands[0].id, id);
  assert.equal(tracker.update(result({ label: 'Right', x: 0.3 }), 500).handCount, 0);
  tracker.reset();
  assert.equal(tracker.update(result({ label: 'Right', x: 0.3 }), 533).handCount, 0);
});
