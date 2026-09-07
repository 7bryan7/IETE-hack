import { difficultyConfig, levels } from './config.js';
import { distance, positions, toWorld } from './geometry.js';

export function createRun(id, difficulty = 'Easy', random = Math.random) {
  const hands = [];
  for (let i = 0; i < 8; i++) hands.push(i >= 2 && hands[i - 1] === hands[i - 2] ? (hands[i - 1] === 'Right' ? 'Left' : 'Right') : random() < .5 ? 'Left' : 'Right');
  return { id, config: difficultyConfig[difficulty], status: 'READY', phase: 'WAITING', round: 0, total: levels[id - 1].rounds,
    elapsed: 0, success: 0, errors: 0, hold: 0, previous: {}, contacts: {}, hands, feedback: '', feedbackUntil: 0,
    distanceSum: 0, distanceTime: 0, misses: 0, attempts: 0, travel: 0, ideal: 0, placements: 0, transfers: 0, transferAttempts: 0, wrongHand: 0, drops: 0,
    object: { x: 220, y: 300 }, owner: null, ownerId: null, paused: '', metrics: {} };
}
export function startRun(s) { s.status = 'PLAYING'; return s; }
export function error(s, message = 'Almost! Try again', key = 'error') {
  if ((s.contacts[key] ?? -Infinity) + 800 > s.elapsed) return;
  s.contacts[key] = s.elapsed; s.errors++; s.feedback = message; s.feedbackUntil = s.elapsed + 1400;
}
export function advance(s) {
  s.success++; s.round++; s.hold = 0; s.phase = 'WAITING'; s.owner = null; s.ownerId = null;
  s.object = { ...positions[s.round % 2] }; s.feedback = 'Nice move!'; s.feedbackUntil = s.elapsed + 1000;
  if (s.round >= s.total) s.status = 'COMPLETE';
}
export const targetFor = s => positions[s.round % positions.length];
export function touch(s, frame, requested) {
  const target = targetFor(s);
  const near = frame.filter(h => distance(h.point, target) <= s.config.radius);
  const hand = near.find(h => !requested || h.handedness === requested);
  if (near.some(h => requested && h.handedness !== requested)) {
    if (!s.wrongContact) { error(s, 'Try your other hand'); s.wrongHand++; }
    s.wrongContact = true;
  } else s.wrongContact = false;
  if (hand) {
    s.distanceSum += distance(hand.point, target) * s.dt; s.distanceTime += s.dt;
    if (s.holdHand !== hand.id) s.hold = 0;
    s.holdHand = hand.id; s.hold += s.dt;
    if (s.hold >= s.config.holdMs) advance(s);
  } else { if (s.hold > 0) { s.misses++; error(s); } s.hold = 0; }
}
const handlers = { 1: (s, f) => touch(s, f), 2: (s, f) => touch(s, f, s.hands[s.round]) };
export function registerLevel(id, handler) { handlers[id] = handler; }
export function stepRun(s, hands, dt) {
  if (s.status !== 'PLAYING') return s;
  const frame = hands.filter(h => h.trackingStatus === undefined || h.trackingStatus === 'Stable').map(h => ({ ...h, point: toWorld(h.indexTip), started: h.isPinching && s.previous[h.id] === false, released: !h.isPinching && s.previous[h.id] === true }));
  const both = [5, 6, 9, 10].includes(s.id);
  const ready = both ? ['Left', 'Right'].every(label => frame.some(h => h.handedness === label)) : frame.length > 0;
  const ownerPresent = (!s.owner || frame.some(h => h.id === s.ownerId && h.handedness === s.owner))
    && (!s.pathStarted || frame.some(h=>h.id===s.pathOwner));
  s.dt = Math.max(0, Math.min(dt, 100));
  s.paused = !ready || !ownerPresent ? (both ? 'Show both hands to continue' : 'Show your hand to continue') : '';
  if (s.paused) {
    s.lossMs=(s.lossMs||0)+s.dt;
    if(s.lossMs>=1500) {
      s.pathStarted=false;s.pathOwner=null;
      if(s.owner) {
        s.owner=null;s.ownerId=null;s.phase='WAITING';
        if(s.quest==='DUAL_HAND')s.quest='RECOVER_DUAL';
        s.feedback='Pinch the crystal again to continue';s.feedbackUntil=s.elapsed+1800;
      }
    }
    if(s.id===9) {
      s.tracking ||= { Left:{inside:0,distance:0,lost:0}, Right:{inside:0,distance:0,lost:0}, simultaneous:0, time:0 };
      for(const label of ['Left','Right']) if(!frame.some(h=>h.handedness===label)) s.tracking[label].lost+=s.dt;
    }
    s.hold = 0; s.arrivals = [null,null]; s.previous = {}; return s;
  }
  if(s.lossMs && s.owner) {
    const h=frame.find(h=>h.id===s.ownerId);
    s.offset={x:s.object.x-h.point.x,y:s.object.y-h.point.y};
    if(!h.isPinching) {
      s.owner=null;s.ownerId=null;s.phase='WAITING';
      if(s.quest==='DUAL_HAND')s.quest='RECOVER_DUAL';
    }
  }
  s.lossMs=0;
  s.elapsed += s.dt;
  handlers[s.id]?.(s, frame);
  s.previous = Object.fromEntries(frame.map(h => [h.id, h.isPinching]));
  return s;
}
