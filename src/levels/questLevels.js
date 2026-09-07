import { registerLevel, advance, error, touch } from './engine.js';
import { distance } from './geometry.js';
import { catchObject, grab, follow } from './objectLevels.js';
import { transfer, dualHold } from './bilateralLevels.js';
import { tracePath, paths } from './planningLevels.js';
export const movingTargets = s => [{x:300+Math.sin(s.elapsed/2600*s.config.speed/45)*140,y:280},{x:710,y:300+Math.sin(s.elapsed/2900*s.config.speed/45)*130}];
export function dualMotion(s,frame) {
  const targets=movingTargets(s);
  s.tracking ||= { Left:{inside:0,distance:0,lost:0}, Right:{inside:0,distance:0,lost:0}, simultaneous:0, time:0 };
  const inside=['Left','Right'].map((label,i)=>{
    const d=distance(frame.find(h=>h.handedness===label)?.point,targets[i]);
    s.tracking[label].distance+=d*s.dt;
    if(d<=s.config.radius) s.tracking[label].inside+=s.dt;
    return d<=s.config.radius;
  });
  s.tracking.time+=s.dt;
  if(inside.every(Boolean)) s.tracking.simultaneous+=s.dt;
  s.round=Math.min(18,Math.floor(s.elapsed/1000));
  if(s.elapsed>=18000) { s.success=18; s.status='COMPLETE'; }
}
export const QUEST_STATES=['REACH','CATCH','PATH','TRANSFER','DUAL_HAND','DROP','COMPLETE'];
export const questPath=paths[1];
export const activationTargets=[{x:700,y:300},{x:300,y:300}];
export const finalTarget={x:800,y:440};
function questAdvance(s) { s.success++;s.round++;s.hold=0;s.phase='WAITING';s.quest=QUEST_STATES[s.round];if(s.quest==='COMPLETE')s.status='COMPLETE'; }
export function quest(s,frame) {
  s.quest ||= 'REACH';
  const right=frame.find(h=>h.handedness==='Right'), left=frame.find(h=>h.handedness==='Left');
  switch(s.quest) {
    case 'REACH': {
      const before=s.round; touch(s,frame,'Right');
      if(s.round>before) { s.quest='CATCH';s.object={x:180,y:300}; }
      break;
    }
    case 'CATCH':
      catchObject(s,frame,h=>{
        if(h.handedness!=='Right') { s.wrongHand++;error(s,'Catch with your RIGHT hand');return; }
        grab(s,h);questAdvance(s);
      });
      break;
    case 'PATH':
      if(!s.owner) {
        if(right.started && distance(right.point,s.object)<=s.config.radius) grab(s,right);
        return;
      }
      follow(s,right);
      if(!right.isPinching) { s.owner=null;s.ownerId=null;s.pathStarted=false;s.drops++;error(s,'Pinch the crystal again to continue');return; }
      tracePath(s,[right],()=>{questAdvance(s);s.phase='SOURCE_GRABBED';},questPath,s.object);
      break;
    case 'TRANSFER':
      transfer(s,frame,()=>questAdvance(s),'Right',true);
      break;
    case 'DUAL_HAND':
      follow(s,left);
      if(!left.isPinching) { s.drops++;error(s,'Pick up the crystal with your LEFT hand');s.quest='RECOVER_DUAL';s.owner=null;s.ownerId=null;s.hold=0;return; }
      dualHold(s,frame,()=>questAdvance(s),activationTargets);
      break;
    case 'RECOVER_DUAL':
      if(left.started && distance(left.point,s.object)<=s.config.radius) {grab(s,left);s.quest='DUAL_HAND';}
      break;
    case 'DROP':
      if(!s.owner) {if(left.started && distance(left.point,s.object)<=s.config.radius)grab(s,left);return;}
      follow(s,left);
      if(!left.isPinching) {
        if(distance(s.object,finalTarget)<=s.config.radius) {s.placements++;questAdvance(s);}
        else {s.drops++;error(s,'Move to the final target before releasing');s.owner=null;s.ownerId=null;}
      }
      break;
  }
}
registerLevel(9,dualMotion);
registerLevel(10,quest);
