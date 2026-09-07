export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const deadzone = value => Math.abs(value) < 0.035 ? 0 : Math.sign(value) * (Math.abs(value) - 0.035);

// Consume the existing tracker's mirrored landmarks, stable identities and pinch state.
// "Raised" means fingertips above wrists within the camera frame; no pose inference.
export function readForestHands(hands) {
  return hands.filter(h => h.trackingStatus === 'Stable' && h.indexTip && h.wrist).map(h => ({
    id: h.id, x: h.indexTip.x, y: h.indexTip.y, pinch: h.isPinching,
    raised: h.wrist.y < 0.82 && h.indexTip.y < h.wrist.y - 0.035,
    palmX: h.landmarks[9].x, palmY: h.landmarks[9].y,
  })).filter(h => Number.isFinite(h.x) && Number.isFinite(h.y));
}

export function updateNavigation(control, pointers, keyboard, dt, blocked = false) {
  const raised = pointers.length === 2 && pointers.every(h => h.raised && !h.pinch);
  const active = !blocked && (keyboard ? !!(keyboard.x || keyboard.y) : raised);
  let x = 0, y = 0;
  if (active && keyboard) { x = keyboard.x * 0.42; y = keyboard.y * 0.7; }
  else if (active) {
    const midpoint = { x: (pointers[0].palmX + pointers[1].palmX) / 2, y: (pointers[0].palmY + pointers[1].palmY) / 2 };
    const ids = pointers.map(h => h.id).sort().join(',');
    if (!control.anchor || control.ids !== ids) { control.anchor = midpoint; control.ids = ids; }
    x = clamp(deadzone(midpoint.x - control.anchor.x) * 3, -0.45, 0.45);
    y = clamp(deadzone(control.anchor.y - midpoint.y) * 5, -0.8, 0.8);
  } else { control.anchor = null; }
  // Stop immediately on tracking loss; damp only while an intentional input exists.
  const damping = 1 - Math.exp(-6 * dt);
  control.vx = active ? control.vx + (x - control.vx) * damping : 0;
  control.vy = active ? control.vy + (y - control.vy) * damping : 0;
  const previous = control.yaw;
  control.yaw = clamp(control.yaw + control.vx * dt, -0.9, 0.9);
  control.tilt = clamp(control.tilt + control.vy * dt, -1.2, 1.8);
  control.active = active;
  return control.yaw - previous;
}
