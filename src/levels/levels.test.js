import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startRun, stepRun, targetFor } from './engine.js';
import { readProgress, saveCompletion, isUnlocked, scoreRun, calculateStars } from './progress.js';
import './objectLevels.js';
import { goalFor } from './objectLevels.js';
import './bilateralLevels.js';
import { dualTargets } from './bilateralLevels.js';
import './planningLevels.js';
import { paths, sequenceFor, sequenceTargets } from './planningLevels.js';
import './questLevels.js';
import { movingTargets, questPath, activationTargets, finalTarget } from './questLevels.js';
import { levelMetrics } from './metrics.js';
export const hand = (p, handedness = 'Right', isPinching = false) => ({ id: handedness, handedness, isPinching, indexTip: { x: p.x / 1000, y: p.y / 600 } });
test('reach requires continuous dwell and completes five varied targets', () => {
  const s = startRun(createRun(1));
  stepRun(s, [hand(targetFor(s))], 100); stepRun(s, [], 1000); assert.equal(s.hold, 0); assert.equal(s.elapsed, 100);
  for(let i=0;i<5;i++) { const p=targetFor(s); for(let j=0;j<3;j++) stepRun(s,[hand(p)],100); }
  assert.equal(s.status,'COMPLETE'); assert.equal(s.success,5);
});
test('dual motion tracks each hand independently and pauses active time on loss', () => {
  const s=startRun(createRun(9));
  stepRun(s,[hand({x:0,y:0},'Left')],100); assert.equal(s.elapsed,0); assert.equal(s.tracking.Right.lost,100);
  for(let i=0;i<180;i++) stepRun(s,movingTargets(s).map((p,j)=>hand(p,j?'Right':'Left')),100);
  assert.equal(s.status,'COMPLETE'); assert.ok(scoreRun(s).accuracy>95);
});
test('quest completes its ordered reach, catch, path, transfer, dual hold and drop', () => {
  const s=startRun(createRun(10));
  const tick=(r,l,rp=false,lp=false)=>stepRun(s,[hand(r,'Right',rp),hand(l,'Left',lp)],100);
  const away={x:80,y:80};
  for(let i=0;i<3;i++)tick(targetFor(s),away);
  assert.equal(s.quest,'CATCH'); tick(s.object,away); tick(s.object,away,true);
  assert.equal(s.quest,'PATH');
  // Respect the grab offset while tracing the complete curved path.
  for(const p of [questPath[0],...questPath])tick({x:p.x-s.offset.x,y:p.y-s.offset.y},away,true);
  assert.equal(s.quest,'TRANSFER');
  const r={x:s.object.x-s.offset.x,y:s.object.y-s.offset.y}, l={...s.object};
  tick(r,l,true);tick(r,l,false);tick(r,l,false,true);assert.equal(s.quest,'DUAL_HAND');
  for(let i=0;i<5;i++)tick(activationTargets[1],activationTargets[0],false,true);
  assert.equal(s.quest,'DROP');tick(away,finalTarget,false,true);tick(away,finalTarget,false,false);
  assert.equal(s.status,'COMPLETE');assert.equal(s.success,6);
});
test('path rejects shortcuts and counts an extended deviation once', () => {
  const s=startRun(createRun(7)); stepRun(s,[hand(paths[0][0])],100);
  stepRun(s,[hand(paths[0].at(-1))],100); assert.equal(s.round,0);
  for(let i=0;i<100;i++) stepRun(s,[hand({x:500,y:50})],100);
  assert.equal(s.deviations,1);
  for(let x=180;x<=820;x+=10) stepRun(s,[hand({x,y:300})],30);
  assert.equal(s.round,1);
});
test('sequence hides preview, rejects out of order, and preserves prior steps', () => {
  const s=startRun(createRun(8));
  for(let i=0;i<29;i++) stepRun(s,[hand({x:50,y:50})],100);
  assert.equal(s.phase,'WAITING_STEP');
  stepRun(s,[hand(sequenceTargets[1])],100); assert.equal(s.sequenceStep,0); assert.equal(s.sequenceErrors,1);
  for(const step of sequenceFor(s)) {
    stepRun(s,[hand({x:50,y:50})],100);
    for(let i=0;i<3;i++) stepRun(s,[hand(sequenceTargets[step.target],step.hand||'Right')],100);
  }
  assert.equal(s.round,1);
});
test('transfer enforces release then destination pinch in both directions', () => {
  const s=startRun(createRun(5));
  for(let round=0;round<4;round++) {
    const a=round%2?'Left':'Right', b=round%2?'Right':'Left', p={...s.object};
    const tick=(ap,bp,pos=p)=>stepRun(s,[hand(pos,a,ap),hand(pos,b,bp)],100);
    tick(false,false); tick(true,false); tick(true,false); assert.equal(s.phase,'HANDS_NEAR');
    tick(false,false); assert.equal(s.phase,'SOURCE_RELEASED'); tick(false,true); assert.equal(s.phase,'TRANSFER_COMPLETE');
    tick(false,true,goalFor(s)); tick(false,false,goalFor(s)); assert.equal(s.round,round+1);
  }
  assert.equal(s.transfers,4); assert.equal(s.status,'COMPLETE');
});
test('overlap and an already pinched receiving hand cannot transfer', () => {
  const s=startRun(createRun(5)), p=s.object;
  const tick=(a,b)=>stepRun(s,[hand(p,'Right',a),hand(p,'Left',b)],100);
  tick(false,false); tick(true,false); tick(true,true); tick(false,true);
  assert.equal(s.transfers,0); assert.equal(s.phase,'WAITING');
});
test('two-hand hold resets when either hand leaves', () => {
  const s=startRun(createRun(6)), targets=dualTargets(s);
  const both=targets.map((p,i)=>hand(p,i?'Right':'Left'));
  for(let i=0;i<4;i++) stepRun(s,both,100);
  stepRun(s,[both[0]],100); assert.equal(s.hold,0); assert.equal(s.elapsed,400);
  for(let i=0;i<5;i++) stepRun(s,both,100);
  assert.equal(s.round,1);
});
test('correct-hand rounds do not accept the other hand', () => {
  const s=startRun(createRun(2,'Easy',()=>0));
  for(let i=0;i<6;i++) stepRun(s,[hand(targetFor(s),'Right')],100);
  assert.equal(s.round,0); assert.equal(s.errors,1);
  for(let i=0;i<3;i++) stepRun(s,[hand(targetFor(s),'Left')],100);
  assert.equal(s.round,1); assert.ok(s.hands.every((h,i)=>i<2 || h!==s.hands[i-1] || h!==s.hands[i-2]));
});
test('catch requires a new pinch near the object', () => {
  const s=startRun(createRun(3));
  stepRun(s,[hand(s.object,'Right',true)],0); assert.equal(s.round,0);
  stepRun(s,[hand(s.object)],0); stepRun(s,[hand(s.object,'Right',true)],0); assert.equal(s.round,1);
});
test('placement preserves grab offset and owner, and only succeeds on release', () => {
  const s=startRun(createRun(4)), p={x:230,y:300};
  stepRun(s,[hand(p)],0); stepRun(s,[hand(p,'Right',true)],0); assert.equal(s.owner,'Right'); assert.equal(s.object.x,220);
  stepRun(s,[hand(goalFor(s),'Left',true)],100); assert.equal(s.elapsed,0);
  stepRun(s,[hand(p,'Right',true)],100); assert.equal(s.object.x,220);
  const goal={x:goalFor(s).x+10,y:300};
  stepRun(s,[hand(goal,'Right',true)],100); assert.equal(s.round,0);
  stepRun(s,[hand(goal)],100); assert.equal(s.round,1);
});
test('completion saves best results and unlocks irrespective of stars', () => {
  let value; const storage={getItem:()=>value,setItem:(k,v)=>{value=v;}};
  let p=saveCompletion({},1,{score:50,time:20},storage).progress;
  p=saveCompletion(p,1,{score:30,time:30},storage).progress;
  assert.equal(p[1].bestScore,50); assert.equal(p[1].bestTime,20); assert.equal(isUnlocked(readProgress(storage),2),true); assert.equal(isUnlocked(p,3),false);
  assert.equal(calculateStars(90),3); assert.equal(calculateStars(70),2); assert.equal(calculateStars(0),1);
  assert.deepEqual(readProgress({getItem:()=>'{broken'}),{}); assert.ok(Number.isFinite(scoreRun(createRun(1)).score));
});
test('long tracking loss releases ownership without errors and allows reacquisition', () => {
  const s=startRun(createRun(4)), p={...s.object};
  stepRun(s,[hand(p)],100);stepRun(s,[hand(p,'Right',true)],100);
  for(let i=0;i<16;i++)stepRun(s,[],100);
  assert.equal(s.owner,null);assert.equal(s.errors,0);assert.equal(s.elapsed,200);
  const h=hand(p);h.id='new-right';stepRun(s,[h],100);stepRun(s,[{...h,isPinching:true}],100);
  assert.equal(s.ownerId,'new-right');
});
test('all empty level metrics and scores stay finite; corrupt and unavailable storage is safe', () => {
  for(let id=1;id<=10;id++) {
    const s=createRun(id);const output=JSON.stringify(levelMetrics(s));
    assert.ok(!output.includes('NaN')&&!output.includes('Infinity'));
    assert.ok(scoreRun(s).score>=0&&scoreRun(s).score<=100);
  }
  assert.equal(saveCompletion({},1,{score:80,time:10},{setItem(){throw new Error('quota');}}).saved,false);
  assert.deepEqual(readProgress({getItem:()=>JSON.stringify({1:{completed:true,bestScore:'bad',bestTime:1}})}),{});
});
for(const difficulty of ['Easy','Medium','Hard'])test(`all reach, catch, place, hold, path and sequence rounds complete on ${difficulty}`,()=>{
  for(const id of [1,2,3,4,6,7,8]) {
    const s=startRun(createRun(id,difficulty,()=>0.6));
    const ticks=(hands,count)=>{for(let j=0;j<count;j++)stepRun(s,hands,100);};
    const dwell=Math.ceil(s.config.holdMs/100);
    for(let round=0;round<s.total;round++) {
      if(id===1||id===2)ticks([hand(targetFor(s),id===2?s.hands[round]:'Right')],dwell);
      if(id===3) {stepRun(s,[hand(s.object)],0);stepRun(s,[hand(s.object,'Right',true)],0);}
      if(id===4) {stepRun(s,[hand(s.object)],0);stepRun(s,[hand(s.object,'Right',true)],0);stepRun(s,[hand(goalFor(s),'Right',true)],0);stepRun(s,[hand(goalFor(s))],0);}
      if(id===6)ticks(dualTargets(s).map((p,i)=>hand(p,i?'Right':'Left')),Math.ceil(s.config.dualHoldMs/100));
      if(id===7) {
        const path=paths[round];stepRun(s,[hand(path[0])],100);
        for(let i=1;i<path.length;i++) {
          const a=path[i-1],b=path[i];
          for(let j=0;j<=20;j++)stepRun(s,[hand({x:a.x+(b.x-a.x)*j/20,y:a.y+(b.y-a.y)*j/20})],20);
          if(s.round!==round)break;
        }
      }
      if(id===8) {
        ticks([hand({x:20,y:20})],29);
        for(const action of sequenceFor(s)) {stepRun(s,[hand({x:20,y:20})],100);ticks([hand(sequenceTargets[action.target],action.hand||'Right')],dwell);}
      }
      assert.equal(s.round,round+1,`level ${id}, round ${round}`);
    }
    assert.equal(s.status,'COMPLETE',`level ${id}`);
  }
});
