/**
 * Movement trail & motion tracking helper functions
 */

export class TrailTracker {
  constructor(maxPoints = 15) {
    this.maxPoints = maxPoints;
    this.points = [];
  }

  addPoint(x, y, hand = 'right') {
    this.points.push({
      x,
      y,
      hand,
      timestamp: Date.now()
    });
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
  }

  clear() {
    this.points = [];
  }

  getPoints() {
    return this.points;
  }
}

/**
 * Draw movement trail on canvas
 */
export function drawTrail(ctx, points, width, height, color = 'rgba(6, 182, 212, 0.6)') {
  if (!points || points.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const alpha = (i / points.length) * 0.8;
    const lineWidth = (i / points.length) * 8 + 2;

    ctx.beginPath();
    ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${alpha})`);
    ctx.lineWidth = lineWidth;
    ctx.moveTo(p1.x * width, p1.y * height);
    ctx.lineTo(p2.x * width, p2.y * height);
    ctx.stroke();
  }

  ctx.restore();
}

