// Fixed logical canvas; rendering and all hit tests share this space.
export const WORLD = { width: 1000, height: 600 };
export const clamp = (n, min = 0, max = 100) => Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
export const distance = (a, b) => a && b ? Math.hypot(a.x - b.x, a.y - b.y) : Infinity;
export const toWorld = p => ({ x: p.x * WORLD.width, y: p.y * WORLD.height });
export const positions = [{ x: 220, y: 300 }, { x: 780, y: 300 }, { x: 500, y: 140 }, { x: 500, y: 460 }, { x: 500, y: 300 }];
export function nearestPath(point, path) {
  let best = { distance: Infinity, progress: 0 };
  path.slice(1).forEach((b, i) => {
    const a = path[i], dx = b.x - a.x, dy = b.y - a.y;
    const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy), 0, 1);
    const d = distance(point, { x: a.x + t * dx, y: a.y + t * dy });
    if (d < best.distance) best = { distance: d, progress: (i + t) / (path.length - 1) };
  });
  return best;
}
