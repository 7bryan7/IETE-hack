import { clamp } from './geometry.js';
import { percentage } from './progress.js';
export function levelMetrics(s) {
  const sync = (s.syncTotal || 0) / (s.syncCount || 1);
  const coordination = clamp(100 * (1 - sync / 2000));
  const pct = (a,b) => `${percentage(a,b).toFixed(0)}%`;
  const common = {
    1: [['Successful targets',s.success],['Misses',s.misses],['Average center distance',`${(s.distanceSum/(s.distanceTime||1)).toFixed(1)} game units`]],
    2: [['Correct-hand accuracy',pct(s.success,s.success+s.wrongHand)],['Other-hand attempts',s.wrongHand]],
    3: [['Stars caught',s.success],['Stars missed',s.misses],['Grab attempts',s.attempts],['Catch accuracy',pct(s.success,s.attempts+s.misses)]],
    4: [['Placements',s.placements],['Drops outside target',s.drops],['Movement path',`${s.travel.toFixed(0)} game units`],['Path efficiency',pct(s.ideal,s.travel)]],
    5: [['Successful transfers',`${s.transfers} / ${s.transferAttempts}`],['Transfer success',pct(s.transfers,s.transferAttempts)],['Other-hand attempts',s.wrongHand],['Drops',s.drops]],
    6: [['Simultaneous holds',s.syncCount||0],['Average arrival gap',`${(sync/1000).toFixed(2)}s`],['Game synchronization',`${coordination.toFixed(0)} / 100`],['Other-side attempts',s.wrongHand]],
    7: [['Paths completed',s.success],['Deviations',s.deviations||0],['Path accuracy',pct(s.pathInside||0,s.pathTime||0)],['Smoothness approximation',`${clamp(100/(1+(s.speedChange||0)/(s.speedSamples||1)*10)).toFixed(0)} / 100`]],
    8: [['Correct sequence steps',s.sequenceCorrect||0],['Sequence errors',s.sequenceErrors||0],['Sequence accuracy',pct(s.sequenceCorrect||0,(s.sequenceCorrect||0)+(s.sequenceErrors||0))]],
    10: [['Hand transfer success',pct(s.transfers,s.transferAttempts)],['Sequence accuracy',pct(s.success,s.success+s.errors)],['Game synchronization',`${coordination.toFixed(0)} / 100`]],
  };
  if(s.id!==9)return common[s.id]||[];
  const t=s.tracking, time=t?.time||0;
  return ['Left','Right'].flatMap(label=>[
    [`${label} tracking accuracy`,pct(t?.[label].inside||0,time)],
    [`${label} average target distance`,`${((t?.[label].distance||0)/(time||1)).toFixed(1)} game units`],
    [`${label} lost tracking time`,`${((t?.[label].lost||0)/1000).toFixed(1)}s`],
  ]).concat([['Simultaneous tracking',pct(t?.simultaneous||0,time)]]);
}
