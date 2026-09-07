import { registerLevel, advance, error } from './engine.js';
import { distance } from './geometry.js';
import { grab, follow, goalFor } from './objectLevels.js';
export const sourceFor = s => s.round % 2 ? 'Left' : 'Right';
export const otherHand = name => name === 'Right' ? 'Left' : 'Right';
export function transfer(s, frame, done = () => advance(s), source = sourceFor(s), transferOnly = false) {
  const destination = otherHand(source);
  const a = frame.find(h => h.handedness === source), b = frame.find(h => h.handedness === destination);
  if (!a || !b) return;
  const reset = () => { s.owner = null; s.ownerId = null; s.phase = 'WAITING'; };
  switch (s.phase) {
    case 'WAITING':
      for (const h of frame.filter(h => h.started)) {
        if (distance(h.point, s.object) > s.config.radius) { error(s, 'Move closer to the crystal'); continue; }
        s.transferAttempts++;
        if (h.handedness !== source) { s.wrongHand++; error(s, 'Try your other hand'); }
        else grab(s, h);
      }
      break;
    case 'SOURCE_GRABBED':
    case 'HANDS_NEAR': {
      follow(s, a);
      const near = distance(a.point, b.point) <= 125 && distance(b.point, s.object) <= s.config.radius + 30;
      s.phase = near ? 'HANDS_NEAR' : 'SOURCE_GRABBED';
      if (b.started) error(s, 'Open the receiving hand, then release the source hand');
      if (!a.isPinching) {
        if (near && !b.isPinching) { s.phase = 'SOURCE_RELEASED'; s.owner = null; s.ownerId = null; s.releasedAt = s.elapsed; s.destinationId = b.id; }
        else { s.drops++; error(s, 'Bring open hands close before releasing'); reset(); }
      }
      break;
    }
    case 'SOURCE_RELEASED':
      // The receiving pinch must occur on a later frame, with the same physical hand.
      if (b.started && b.id === s.destinationId && distance(b.point, s.object) <= s.config.radius + 30) {
        s.phase = 'DESTINATION_PINCHED'; grab(s, b); s.phase = 'TRANSFER_COMPLETE'; s.transfers++;
        if (transferOnly) done();
      } else if (a.started || b.started || s.elapsed - s.releasedAt > 4000) {
        if (a.started) s.wrongHand++;
        s.drops++; error(s, `Pinch with your ${destination.toUpperCase()} hand after release`); reset();
      }
      break;
    case 'TRANSFER_COMPLETE':
      follow(s, b);
      if (!b.isPinching) {
        if (distance(s.object, goalFor(s)) <= s.config.radius) { s.placements++; done(); }
        else { s.drops++; error(s, 'Release inside the glowing target'); reset(); }
      }
      break;
  }
}
export const dualTargets = s => [
  [{x:220,y:300},{x:780,y:300}], [{x:390,y:300},{x:610,y:300}],
  [{x:260,y:150},{x:740,y:150}], [{x:280,y:150},{x:720,y:440}], [{x:280,y:430},{x:720,y:430}],
][s.round % 5];
export function dualHold(s, frame, done = () => advance(s), targets = dualTargets(s)) {
  const good = ['Left','Right'].map((label, i) => distance(frame.find(h => h.handedness === label)?.point, targets[i]) <= s.config.radius);
  s.arrivals ||= [null,null];
  good.forEach((inside,i) => { if (!inside) s.arrivals[i] = null; else if (s.arrivals[i] === null) s.arrivals[i] = s.elapsed; });
  const wrong = frame.some(h => distance(h.point, targets[h.handedness === 'Left' ? 1 : 0]) <= s.config.radius);
  if (wrong && !s.wrongSide) { s.wrongHand++; error(s, 'Match each hand to its own target'); }
  s.wrongSide = wrong;
  s.hold = good.every(Boolean) ? s.hold + s.dt : 0;
  if (s.hold >= s.config.dualHoldMs) {
    s.syncTotal = (s.syncTotal || 0) + Math.abs(s.arrivals[0] - s.arrivals[1]); s.syncCount = (s.syncCount || 0) + 1;
    s.arrivals = [null,null]; done();
  }
}
registerLevel(5, transfer);
registerLevel(6, dualHold);
