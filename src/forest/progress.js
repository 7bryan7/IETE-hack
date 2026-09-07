export const FOREST_PROGRESS_KEY = 'motionforge_forest_v1';
export function readForestProgress(storage) {
  try {
    const value = JSON.parse(storage.getItem(FOREST_PROGRESS_KEY));
    return Number.isInteger(value?.completed) && value.completed >= 0 && value.completed <= 4 ? value.completed : 0;
  } catch { return 0; }
}
export function saveForestProgress(storage, level) {
  try {
    if (!Number.isInteger(level) || level < 1 || level > 4) return false;
    storage.setItem(FOREST_PROGRESS_KEY, JSON.stringify({ completed: Math.max(readForestProgress(storage), level) }));
    return true;
  } catch { return false; }
}
