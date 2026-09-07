import { targetFor } from './engine.js';
import { goalFor } from './objectLevels.js';
import { sourceFor, otherHand, dualTargets } from './bilateralLevels.js';
import { pathFor, sequenceFor, sequenceTargets } from './planningLevels.js';
import { movingTargets, questPath, activationTargets, finalTarget } from './questLevels.js';
export function circle(ctx, p, radius, label, color = '#38bdf8') {
  ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = `${color}44`; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 23px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, p.x, p.y);
}
export function renderLevel(ctx, s) {
  if(s.id===9) { movingTargets(s).forEach((p,i)=>circle(ctx,p,s.config.radius,i?'RIGHT':'LEFT',i?'#38bdf8':'#c084fc'));return; }
  if(s.id===10) {
    const stage=s.quest||'REACH';
    if(stage==='REACH')circle(ctx,targetFor(s),s.config.radius,'RIGHT');
    else {
      if(stage==='PATH')drawPath(ctx,s,questPath);
      if(stage==='DUAL_HAND' || stage==='RECOVER_DUAL')activationTargets.forEach((p,i)=>circle(ctx,p,s.config.radius,i?'RIGHT':'LEFT'));
      if(stage==='DROP')circle(ctx,finalTarget,s.config.radius,'NOVA');
      circle(ctx,s.object,30,'◆','#fbbf24');
    }
    return;
  }
  if (s.id === 7) { drawPath(ctx,s,pathFor(s)); return; }
  if (s.id === 8) {
    sequenceTargets.forEach((p,i)=>circle(ctx,p,s.config.radius,String(i+1),['#fb7185','#38bdf8','#34d399'][i]));
    if(s.phase === 'SHOW_SEQUENCE') { ctx.fillStyle='#101c30';ctx.fillRect(100,490,800,75);ctx.fillStyle='#fff';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText(sequenceFor(s).map(step=>`${step.target+1} (${step.hand || 'either'})`).join(' → '),500,530); }
    return;
  }
  if (s.id === 6) { dualTargets(s).forEach((p,i) => circle(ctx,p,s.config.radius,i ? 'RIGHT' : 'LEFT',i ? '#38bdf8' : '#c084fc')); return; }
  if (s.id === 5) { circle(ctx,goalFor(s),s.config.radius,'DROP'); circle(ctx,s.object,30,'◆','#fbbf24'); return; }
  if (s.id === 3) { circle(ctx, s.object, s.config.radius, '★', '#fbbf24'); return; }
  if (s.id === 4) { circle(ctx, goalFor(s), s.config.radius, 'DROP'); circle(ctx, s.object, 30, '◆', '#fbbf24'); return; }
  circle(ctx, targetFor(s), s.config.radius, s.id === 2 ? s.hands[s.round] : 'TOUCH');
}
export function instruction(s) {
  if(s.id===9)return 'Follow each moving target with its matching index finger';
  if(s.id===10)return {REACH:'Touch the portal with your RIGHT index finger',CATCH:'Catch the Energy Crystal with your RIGHT pinch',PATH:s.pathStarted?'Keep pinching and follow the path':'Carry the crystal to START',TRANSFER:transferInstruction(s,'Right'),DUAL_HAND:'Keep the LEFT pinch held; touch both activation points',RECOVER_DUAL:'Pinch the crystal with your LEFT hand to continue',DROP:'Place the crystal inside Nova’s target and release',COMPLETE:'You helped Nova!'}[s.quest||'REACH'];
  if (s.id === 7) return s.pathStarted ? 'Follow the trail all the way to END' : 'Touch START with your index finger';
  if (s.id === 8) return s.phase === 'SHOW_SEQUENCE' ? 'Remember the target numbers and hands' : `Repeat the sequence · Step ${(s.sequenceStep || 0)+1} of ${sequenceFor(s).length}. Move out between touches.`;
  if (s.id === 6) return 'Hold both index fingertips in their matching targets';
  if (s.id === 5) return transferInstruction(s);
  if (s.id === 3) return 'Move close to the star, then pinch to catch it';
  if (s.id === 4) return s.owner ? 'Move to the glowing target, then open your fingers' : 'Pinch the crystal to pick it up';
  return s.id === 2 ? `Touch with your ${s.hands[s.round]?.toUpperCase()} hand` : 'Keep your index finger inside the target';
}
export function drawPath(ctx,s,path) {
  ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='#38bdf855';ctx.lineWidth=s.config.pathWidth;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.strokeStyle='#e0f2fe';ctx.lineWidth=3;ctx.stroke();
  circle(ctx,path[0],35,'START');circle(ctx,path.at(-1),35,'END','#34d399');
}
export function transferInstruction(s, source = sourceFor(s)) {
  return { WAITING: `Grab with your ${source.toUpperCase()} hand`, SOURCE_GRABBED: 'Bring your hands close; keep the receiving hand open', HANDS_NEAR: `Release your ${source.toUpperCase()} hand first`, SOURCE_RELEASED: `Now pinch with your ${otherHand(source).toUpperCase()} hand`, TRANSFER_COMPLETE: 'Move the crystal to the target, then release' }[s.phase] || 'Bring your hands close';
}
