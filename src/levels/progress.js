import { clamp } from './geometry.js';
export const PROGRESS_KEY = 'motionforge_progress';
export const calculateStars = score => score >= 90 ? 3 : score >= 70 ? 2 : 1;
export const percentage = (success, attempts) => attempts > 0 ? clamp(success / attempts * 100) : 0;
export function scoreRun(state) {
  const actionAccuracy = percentage(state.success, state.success + state.errors);
  const accuracy = state.id===9 ? percentage(state.tracking?.simultaneous||0,state.tracking?.time||0)
    : state.id===7 ? percentage(state.pathInside||0,state.pathTime||0)
    : state.id===8 ? percentage(state.sequenceCorrect||0,(state.sequenceCorrect||0)+(state.sequenceErrors||0)) : actionAccuracy;
  return { accuracy: Math.round(accuracy), score: Math.round(accuracy), stars: calculateStars(accuracy), time: state.elapsed / 1000, errors: state.errors };
}
export function readProgress(storage) {
  try {
    const raw = JSON.parse(storage.getItem(PROGRESS_KEY) || '{}');
    const clean = {};
    for (let id = 1; id <= 10; id++) {
      const p = raw?.[id];
      if (p?.completed === true && Number.isFinite(p.bestScore) && Number.isFinite(p.bestTime) && p.bestTime >= 0) {
        clean[id] = { completed: true, bestScore: clamp(p.bestScore), bestTime: p.bestTime, stars: calculateStars(clamp(p.bestScore)) };
      }
    }
    return clean;
  } catch { return {}; }
}
export const isUnlocked = (progress, id) => id === 1 || Array.from({ length: id - 1 }, (_, i) => i + 1).every(i => progress[i]?.completed);
export function saveCompletion(progress, id, result, storage) {
  const old = progress[id];
  const bestScore = Math.max(old?.bestScore ?? 0, clamp(result.score));
  const next = { ...progress, [id]: { completed: true, bestScore, bestTime: Math.min(old?.bestTime ?? Infinity, Math.max(0, result.time)), stars: calculateStars(bestScore) } };
  try { storage.setItem(PROGRESS_KEY, JSON.stringify(next)); return { progress: next, saved: true }; }
  catch { return { progress: next, saved: false }; }
}
