import test from 'node:test';
import assert from 'node:assert/strict';
import { createForestRun, stepForest, pauseForest, near } from './forestLogic.js';
import { readForestHands, updateNavigation } from './worldControls.js';
import { readForestProgress, saveForestProgress, FOREST_PROGRESS_KEY } from './progress.js';
import { createAdventureState, updateAdventure, getClosestUndiscovered, FOREST_LANDMARKS } from './forestAdventure.js';
const point = (x = 0.4, y = 0.5, pinch = false, id = 1) => ({ x, y, pinch, id });
const play = level => Object.assign(createForestRun(level), { status: 'playing' });
const frame = (s, pointers, extra = {}, ms = 50) => stepForest(s, { pointers, aspect: 1.6, objects: { crystal: point(), leaf: point() }, targets: { crystal: point(0.7), leaf: point(0.7) }, dragPoint: () => [2, 2, 0], ...extra }, ms);
const navHands = (x = 0.5, y = 0.4) => [1, 2].map(id => ({ ...point(x, y, false, id), raised: true, palmX: x, palmY: y }));

test('forest uses stable existing mirrored fingertips and existing pinch classification', () => {
  const hand = { id: 8, indexTip: { x: 0.2, y: 0.3 }, wrist: { x: 0.2, y: 0.6 }, landmarks: Array(21).fill({ x: 0.25, y: 0.45 }), isPinching: true, trackingStatus: 'Stable' };
  const [p] = readForestHands([hand]);
  assert.equal(p.x, 0.2); assert.equal(p.pinch, true); assert.equal(p.raised, true); assert.equal(p.id, 8);
  assert.deepEqual(readForestHands([{ ...hand, trackingStatus: 'Low confidence' }]), []);
});
test('both raised open hands activate without an entry jump; right and up motion follow intent', () => {
  const c = createForestRun().control;
  updateNavigation(c, navHands(), null, .05); assert.equal(c.active, true); assert.equal(c.yaw, 0);
  for (let i = 0; i < 20; i++) updateNavigation(c, navHands(.7, .2), null, .05);
  assert.ok(c.yaw > .2 && c.yaw < .45); assert.ok(c.tilt > 0);
  const yaw = c.yaw; updateNavigation(c, [navHands()[0]], null, .05);
  assert.equal(c.yaw, yaw); assert.equal(c.active, false);
  updateNavigation(c, navHands(.2), null, .05); assert.equal(c.yaw, yaw);
});
test('lowered hands, pinching, a held object, and new identities cannot jerk the camera', () => {
  const c = createForestRun().control;
  updateNavigation(c, navHands().map(p => ({ ...p, raised: false })), null, .05); assert.equal(c.active, false);
  updateNavigation(c, navHands().map(p => ({ ...p, pinch: true })), null, .05); assert.equal(c.active, false);
  updateNavigation(c, navHands(), null, .05, true); assert.equal(c.active, false);
  updateNavigation(c, navHands(), null, .05);
  updateNavigation(c, navHands(.9).map(p => ({ ...p, id: p.id + 10 })), null, .05); assert.equal(c.yaw, 0);
});
test('camera yaw and tilt are bounded even after sustained input', () => {
  const s = play(1);
  for (let i = 0; i < 200; i++) frame(s, [], { keyboard: { x: 1, y: 1 } });
  assert.equal(s.control.yaw, .9); assert.equal(s.control.tilt, 1.8);
});
test('checkpoints require dwell, real navigation, all three markers and both directions', () => {
  const s = play(1), checkpoints = { a: { ...point(.5), visible: true }, b: { ...point(.5), visible: true }, c: { ...point(.5), visible: true } };
  for (let i = 0; i < 20; i++) frame(s, [point()], { checkpoints });
  assert.equal(s.progress, 0);
  for (let i = 0; i < 20; i++) frame(s, [], { checkpoints, keyboard: { x: -1, y: 0 } });
  assert.equal(s.progress, 3); assert.equal(s.status, 'playing');
  for (let i = 0; i < 20; i++) frame(s, [], { checkpoints, keyboard: { x: 1, y: 0 } });
  assert.equal(s.status, 'complete');
});
test('off-screen objects and a distant pointer cannot complete discovery', () => {
  const s = play(2); frame(s, [point(.9)]); assert.equal(s.status, 'playing');
  frame(s, [point()], { objects: { crystal: { ...point(), visible: false } } }); assert.equal(s.status, 'playing');
  frame(s, [point()]); assert.equal(s.status, 'complete');
});
test('pinch must follow an open hand; owner moves object and release places it', () => {
  const s = play(3); frame(s, [point(.4, .5, true)]); assert.equal(s.held, null);
  frame(s, [point()]); frame(s, [point(.4, .5, true)]); assert.equal(s.held.handId, 1);
  const x = s.objects.crystal[0]; frame(s, [point(.6, .5, true)]); assert.ok(s.objects.crystal[0] > x);
  frame(s, [point(.7)]); assert.equal(s.status, 'complete'); assert.equal(s.attempts, 1); assert.deepEqual(s.placed, ['crystal']);
});
test('wrong drop stays playable and can be retried', () => {
  const s = play(3); frame(s, [point()]); frame(s, [point(.4, .5, true)]); frame(s, [point(.1)]);
  assert.equal(s.status, 'playing'); assert.equal(s.held, null); assert.equal(s.attempts, 1);
  frame(s, [point()]); frame(s, [point(.4, .5, true)]); frame(s, [point(.7)]); assert.equal(s.status, 'complete');
});
test('tracking loss freezes a held object, then releases safely without mission credit', () => {
  const s = play(3); frame(s, [point()]); frame(s, [point(.4, .5, true)]);
  const position = [...s.objects.crystal]; frame(s, []); frame(s, []); assert.ok(s.held);
  assert.deepEqual(s.objects.crystal, position); frame(s, []); frame(s, []);
  assert.equal(s.held, null); assert.equal(s.attempts, 0); assert.equal(s.status, 'playing');
  frame(s, [point(.4, .5, true)]); assert.equal(s.held, null);
});
test('another hand cannot release or take over the held object', () => {
  const s = play(3); frame(s, [point()]); frame(s, [point(.4, .5, true)]);
  frame(s, [point(.7, .5, false, 2)]); assert.equal(s.held.handId, 1); assert.equal(s.status, 'playing');
});
test('pause prevents movement, clears held state and requires a fresh pinch', () => {
  const s = play(3); frame(s, [point()]); frame(s, [point(.4, .5, true)]); const elapsed = s.elapsed;
  frame(s, [point(.7)], { paused: true }); assert.equal(s.elapsed, elapsed); assert.equal(s.status, 'playing'); assert.equal(s.held, null);
  frame(s, [point(.4, .5, true)]); assert.equal(s.held, null);
});
test('quest enforces explore, find, grab, carry and release in order', () => {
  const s = play(4); frame(s, [point()]); assert.equal(s.stage, 0); frame(s, [point(.4, .5, true)]); assert.equal(s.held, null);
  for (let i = 0; i < 16; i++) frame(s, [], { keyboard: { x: 1, y: 0 } });
  assert.equal(s.stage, 1); frame(s, [point()]); assert.equal(s.stage, 2);
  frame(s, [point(.4, .5, true)]); assert.equal(s.stage, 3);
  frame(s, [point(.7, .5, true)]); assert.equal(s.stage, 4);
  frame(s, [point(.7)]); assert.equal(s.status, 'complete'); assert.equal(s.progress, 5);
});
test('screen distances respect aspect ratio and invisible targets are ineligible', () => {
  assert.equal(near(point(.4), point(.5), .12, 2), false);
  assert.equal(near(point(.4), { ...point(.4), visible: false }, .12), false);
});
test('completion persistence survives a reload, never regresses and tolerates unavailable storage', () => {
  const data = new Map(), storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  assert.equal(readForestProgress(storage), 0); assert.equal(saveForestProgress(storage, 3), true);
  assert.equal(readForestProgress(storage), 3); saveForestProgress(storage, 1); assert.equal(readForestProgress(storage), 3);
  storage.setItem(FOREST_PROGRESS_KEY, '{broken'); assert.equal(readForestProgress(storage), 0);
  storage.setItem(FOREST_PROGRESS_KEY, '{"completed":99}'); assert.equal(readForestProgress(storage), 0);
  assert.equal(saveForestProgress(null, 2), false); assert.equal(saveForestProgress(storage, 6), false);
});
test('restart returns fresh objects, progression, navigation, and gesture state', () => {
  const s = play(3); frame(s, [point()]); frame(s, [point(.4, .5, true)]); pauseForest(s);
  const restarted = createForestRun(3); assert.equal(restarted.status, 'intro'); assert.equal(restarted.held, null); assert.deepEqual(restarted.armed, {}); assert.equal(restarted.control.yaw, 0);
});

test('adventure state initializes with 5 undiscovered landmarks, zero stars, and Nova greeting', () => {
  const adv = createAdventureState();
  assert.equal(adv.discovered.length, 0);
  assert.equal(adv.stars, 0);
  assert.ok(adv.novaMessage.includes('Nova'));
  assert.equal(FOREST_LANDMARKS.length, 5);
});

test('looking towards a landmark for 400ms discovers it, awards a star, and updates Nova dialogue', () => {
  const s = play(1);
  const landmarks = { crystal_grove: { x: 0.5, y: 0.5, visible: true } };
  for (let i = 0; i < 4; i++) frame(s, [point()], { projections: { landmarks } }, 50);
  assert.equal(s.adventure.discovered.length, 0);
  for (let i = 0; i < 6; i++) frame(s, [point()], { projections: { landmarks } }, 50);
  assert.equal(s.adventure.discovered.length, 1);
  assert.equal(s.adventure.discovered[0], 'crystal_grove');
  assert.equal(s.adventure.stars, 1);
  assert.equal(s.stars, 1);
  assert.ok(s.adventure.novaMessage.includes('Crystal Grove'));
});

test('getClosestUndiscovered points to nearest undiscovered landmark with direction', () => {
  const adv = createAdventureState();
  const closest = getClosestUndiscovered(adv, 0);
  assert.ok(closest);
  assert.ok(['left', 'right', 'forward'].includes(closest.direction));
  assert.ok(closest.distance > 0);
});

test('discovering all 5 landmarks completes the explorer quest and awards bonus stars', () => {
  const adv = createAdventureState();
  for (const landmark of FOREST_LANDMARKS) {
    const projections = { landmarks: { [landmark.id]: { x: 0.5, y: 0.5, visible: true } } };
    for (let i = 0; i < 10; i++) updateAdventure(adv, { projections }, 50);
  }
  assert.equal(adv.discovered.length, 5);
  // 5 individual stars + 5 quest completion bonus stars = 10 stars
  assert.equal(adv.stars, 10);
  assert.equal(adv.novaMood, 'celebrating');
});

