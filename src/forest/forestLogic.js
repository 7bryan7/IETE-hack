import { forestLevels, objectDefinitions } from './forestLevels.js';
import { updateNavigation, clamp } from './worldControls.js';

export function createForestRun(level = 1) {
  return { level, status: 'intro', elapsed: 0, progress: 0, stage: 0, navigationMs: 0,
    control: { yaw: 0, tilt: 0, vx: 0, vy: 0, anchor: null, active: false },
    viewed: [], dwell: {}, left: 0, right: 0, hover: null, held: null, lostMs: 0,
    armed: {}, objects: Object.fromEntries(objectDefinitions.map(o => [o.id, [...o.position]])),
    placed: [], attempts: 0, feedback: '', feedbackUntil: 0, pointers: [],
  };
}
export const near = (a, b, radius, aspect = 1) => !!a && !!b && b.visible !== false && Math.hypot((a.x - b.x) * aspect, a.y - b.y) < radius;
export function forestInstruction(s, mouse = false) {
  if (s.level === 4) return [mouse ? 'Use the arrow keys to explore' : 'Raise both hands to explore', 'Find and point at the magical leaf', mouse ? 'Click and hold the magical leaf' : 'Pinch to pick up the magical leaf', 'Carry the leaf to the golden shrine', 'Release the leaf over the shrine'][s.stage];
  if (s.level === 1 && mouse) return 'Use the arrow keys and look at all three trail markers';
  return forestLevels[s.level - 1].instruction;
}
function feedback(s, text) { s.feedback = text; s.feedbackUntil = s.elapsed + 2400; }
function finish(s, text) { s.status = 'complete'; s.control.active = false; s.progress = forestLevels[s.level - 1].total; feedback(s, text); }
export function pauseForest(s) {
  s.control.active = false; s.control.anchor = null; s.control.vx = 0; s.control.vy = 0;
  if (s.held && s.level === 4 && s.status === 'playing') { s.stage = 2; s.progress = 2; }
  s.held = null; s.armed = {}; s.hover = null; s.pointers = [];
}

// Renderer supplies screen projections and a ray/drag-plane mapping. No webcam or
// Three.js dependencies: mission and interaction behavior are input-source agnostic.
export function stepForest(s, input, deltaMs) {
  if (s.status !== 'playing' || input.paused) { pauseForest(s); return; }
  const ms = clamp(deltaMs, 0, 250), dt = Math.min(ms, 50) / 1000;
  const pointers = input.pointers || [];
  s.pointers = pointers;
  const movement = updateNavigation(s.control, pointers, input.keyboard, dt, !!s.held);
  if (!pointers.length && !input.keyboard) { s.hover = null; }
  else s.elapsed += ms;
  if (s.control.active) { s.navigationMs += ms; s.left += Math.max(0, -movement); s.right += Math.max(0, movement); }
  if (s.level === 1) {
    if (s.navigationMs > 100) for (const [id, point] of Object.entries(input.checkpoints || {})) {
      const viewing = point.visible && Math.abs(point.x - 0.5) < 0.13 && Math.abs(point.y - 0.5) < 0.28;
      s.dwell[id] = viewing && (pointers.length || input.keyboard) ? (s.dwell[id] || 0) + ms : 0;
      if (s.dwell[id] >= 450 && !s.viewed.includes(id)) { s.viewed.push(id); feedback(s, 'Trail marker discovered!'); }
    }
    s.progress = s.viewed.length;
    if (s.viewed.length === 3 && s.left > 0.12 && s.right > 0.12) finish(s, 'Great job! You explored the forest.');
  }
  if (s.level === 4 && s.stage === 0 && s.navigationMs >= 600 && s.left + s.right > 0.08) { s.stage = 1; s.progress = 1; }
  const objectId = s.level === 4 ? 'leaf' : 'crystal';
  const eligible = s.level > 1 && (s.level !== 4 || s.stage > 0);
  const candidates = pointers.filter(p => near(p, input.objects?.[objectId], 0.115, input.aspect));
  s.hover = eligible && candidates.length && !s.placed.includes(objectId) ? objectId : null;
  if (s.level === 2 && s.hover) finish(s, 'Crystal found!');
  if (s.level === 4 && s.stage === 1 && s.hover) { s.stage = 2; s.progress = 2; feedback(s, 'You found the magical leaf!'); }
  const currentIds = new Set(pointers.map(p => p.id));
  for (const id of Object.keys(s.armed)) if (!currentIds.has(Number(id)) && !currentIds.has(id)) delete s.armed[id];
  if (s.held) {
    const holder = pointers.find(p => p.id === s.held.handId);
    if (!holder) {
      s.lostMs += ms;
      if (s.lostMs > 180) { s.held = null; if (s.level === 4) { s.stage = 2; s.progress = 2; } feedback(s, 'Object is waiting for you. Open your hand, then pinch again.'); }
    } else {
      s.lostMs = 0;
      const destination = input.dragPoint?.(holder, objectId);
      if (holder.pinch && destination?.every(Number.isFinite)) {
        const pos = s.objects[objectId], alpha = 1 - Math.exp(-14 * dt);
        for (let i = 0; i < 3; i++) pos[i] += (destination[i] - pos[i]) * alpha;
        if (s.level === 4 && near(holder, input.targets?.[objectId], 0.16, input.aspect)) { s.stage = 4; s.progress = 4; }
      }
      if (!holder.pinch) {
        s.attempts++;
        if (near(holder, input.targets?.[objectId], 0.16, input.aspect)) {
          const target = objectDefinitions.find(o => o.id === objectId).target;
          s.objects[objectId] = [target[0], target[1] + 0.8, target[2]];
          s.placed.push(objectId); finish(s, s.level === 4 ? 'Forest quest complete!' : 'Beautifully placed!');
        } else { feedback(s, 'Try releasing over the golden circle.'); if (s.level === 4) { s.stage = 2; s.progress = 2; } }
        s.held = null;
      }
    }
  } else if (eligible && s.status === 'playing' && s.level >= 3 && !s.control.active) {
    const grabber = candidates.find(p => p.pinch && s.armed[p.id]);
    if (grabber) {
      s.held = { objectId, handId: grabber.id }; s.lostMs = 0;
      if (s.level === 4) { s.stage = 3; s.progress = 3; }
      feedback(s, 'Got it! Carry it to the golden circle.');
    }
  }
  for (const p of pointers) s.armed[p.id] = !p.pinch;
}
