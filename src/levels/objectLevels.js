import { registerLevel, advance, error } from './engine.js';
import { distance, positions } from './geometry.js';
export const goalFor = s => positions[(s.round % 2) ? 0 : 1];
export function catchObject(s, frame, done = () => advance(s)) {
  s.object.x += s.config.speed * s.dt / 1000;
  s.object.y = 300 + Math.sin(s.elapsed / 1800) * 90;
  for (const h of frame.filter(h => h.started)) {
    s.attempts++;
    if (distance(h.point, s.object) <= s.config.radius) { done(h); return; }
    error(s, 'Move closer before you pinch', `catch-${h.id}`);
  }
  if (s.object.x > 940) { s.misses++; error(s, 'Another star is coming!'); s.object = { x: 100, y: 300 }; }
}
export function grab(s, h) {
  s.owner = h.handedness; s.ownerId = h.id;
  s.offset = { x: s.object.x - h.point.x, y: s.object.y - h.point.y };
  s.phase = 'SOURCE_GRABBED'; s.grabStart = { ...s.object }; s.roundTravel = 0;
}
export function follow(s, h) {
  const next = { x: h.point.x + s.offset.x, y: h.point.y + s.offset.y };
  const travel = distance(next, s.object); s.travel += travel; s.roundTravel += travel;
  s.object = next;
}
export function placeObject(s, frame, done = () => advance(s)) {
  if (!s.owner) {
    for (const h of frame.filter(h => h.started)) {
      s.attempts++;
      if (distance(h.point, s.object) <= s.config.radius) { grab(s, h); return; }
      error(s, 'Move closer before you pinch');
    }
    return;
  }
  const h = frame.find(h => h.id === s.ownerId && h.handedness === s.owner);
  if (!h) return;
  follow(s, h);
  if (!h.isPinching) {
    if (distance(s.object, goalFor(s)) <= s.config.radius) {
      s.ideal += distance(s.grabStart, goalFor(s)); s.placements++; done();
    } else { s.drops++; error(s, 'Release inside the glowing target'); s.owner = null; s.ownerId = null; s.phase = 'WAITING'; }
  }
}
registerLevel(3, catchObject);
registerLevel(4, placeObject);
