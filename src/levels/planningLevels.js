import { registerLevel, advance, error } from './engine.js';
import { distance, nearestPath, positions } from './geometry.js';
export const paths = [
  [{x:180,y:300},{x:820,y:300}],
  Array.from({length:33},(_,i)=>({x:180+i*20,y:340-Math.sin(i/32*Math.PI)*160})),
  Array.from({length:33},(_,i)=>({x:180+i*20,y:300-Math.sin(i/32*Math.PI*2)*130})),
  [{x:180,y:400},{x:340,y:200},{x:500,y:400},{x:660,y:200},{x:820,y:400}],
];
export const pathFor = s => paths[s.round % 4];
export function tracePath(s, frame, done = () => advance(s), path = pathFor(s), pointOverride) {
  if (!s.pathStarted) {
    const h = frame.find(h => distance(pointOverride || h.point,path[0]) <= s.config.radius);
    if (h) { s.pathStarted = true; s.pathOwner = h.id; s.pathProgress = 0; s.previousPoint = null; }
    return;
  }
  const h = frame.find(h => h.id === s.pathOwner);
  if (!h) return;
  const point = pointOverride || h.point, near = nearestPath(point,path);
  s.pathTime = (s.pathTime || 0) + s.dt;
  const inside = near.distance <= s.config.pathWidth / 2;
  if (inside) { s.pathInside = (s.pathInside || 0) + s.dt; s.offPathMs = 0; s.deviationLatched = false; }
  else {
    s.offPathMs = (s.offPathMs || 0) + s.dt;
    if (s.offPathMs >= 350 && !s.deviationLatched) { error(s,'Stay on the path'); s.deviations = (s.deviations || 0) + 1; s.deviationLatched = true; }
  }
  // Progress must be continuous: touching only START and END cannot finish a trail.
  if (inside && near.progress <= s.pathProgress + .12) s.pathProgress = Math.max(s.pathProgress,near.progress);
  if (s.previousPoint && s.dt > 0) {
    const speed = distance(point,s.previousPoint) / s.dt;
    s.speedChange = (s.speedChange || 0) + Math.abs(speed - (s.previousSpeed ?? speed));
    s.speedSamples = (s.speedSamples || 0) + 1; s.previousSpeed = speed;
  }
  s.previousPoint = {...point};
  if (inside && s.pathProgress > .94 && distance(point,path.at(-1)) <= s.config.radius) {
    s.pathStarted = false; s.pathOwner = null; s.pathProgress = 0; done();
  }
}
export function sequenceFor(s) {
  const length = s.config.sequenceLength + (s.round > 0 ? 1 : 0);
  return Array.from({length},(_,i)=>({target:(i*2+s.round)%3,hand:i===1?null:i%2?'Left':'Right'}));
}
export const sequenceTargets = [positions[0],positions[2],positions[1]];
export function remember(s, frame) {
  if (s.phase === 'WAITING') { s.phase = 'SHOW_SEQUENCE'; s.showUntil = s.elapsed + 2700; s.sequenceStep = 0; }
  if (s.phase === 'SHOW_SEQUENCE') { if(s.elapsed >= s.showUntil) s.phase = 'WAITING_STEP'; return; }
  const sequence = sequenceFor(s), expected = sequence[s.sequenceStep];
  const contacts = frame.flatMap(h => sequenceTargets.map((p,i)=>({h,i,inside:distance(h.point,p)<=s.config.radius}))).filter(c=>c.inside);
  if (!contacts.length) { s.sequenceContact = false; s.hold = 0; return; }
  if (s.sequenceContact) return;
  const valid = contacts.find(c=>c.i===expected.target && (!expected.hand || c.h.handedness===expected.hand));
  if (!valid) { s.sequenceErrors=(s.sequenceErrors||0)+1; error(s,contacts.some(c=>c.i===expected.target)?'Try your other hand':'Try the next target you remember'); s.sequenceContact=true; s.hold=0; return; }
  s.hold += s.dt;
  if(s.hold >= s.config.holdMs) {
    s.phase='STEP_COMPLETE'; s.sequenceStep++; s.sequenceCorrect=(s.sequenceCorrect||0)+1; s.sequenceContact=true; s.hold=0;
    if(s.sequenceStep===sequence.length) { s.phase='SEQUENCE_COMPLETE'; advance(s); s.sequenceContact=false; }
    else s.phase='WAITING_STEP';
  }
}
registerLevel(7,tracePath);
registerLevel(8,remember);
