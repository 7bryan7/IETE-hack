# Forest World

## Run

`npm install` then `npm run dev`. From the landing page choose **Explore Open Worlds → Forest World**. Direct links are `/#worlds` and `/#forest`. **Classic missions** opens the existing ten-level map. House World is a disabled Coming Soon card.

## Controls

- **Hands:** choose Play with hands and allow the camera. The existing `CameraView` and `useHandTracking` supply two stable hand identities, mirrored/crop-corrected positions, smoothed landmarks, and the existing pinch hysteresis. No second detector, webcam implementation, or gesture classifier is introduced.
- Raise two open hands with fingertips above wrists. Their initial palm midpoint becomes neutral. Move both hands left/right to look around, or up/down to tilt. Lower a hand to reset neutral. Pinching or holding an object takes priority over navigation.
- Point near a treasure, open the hand, then pinch to pick it up. Keep pinching to carry; release over its golden target. The original hand keeps ownership even if the other hand crosses it.
- **Mouse:** choose Mouse & keyboard. Focus the forest and use arrow keys to look/tilt. Hover, press and hold the primary mouse button, carry, and release over the target. This is an explicit fallback, not simulated camera input.
- Pause, lost window focus, hidden tabs, input changes, and restart clear active input. A missing grab owner freezes the object for 180 ms, then releases it safely without placement credit. A stalled video is rejected after 400 ms.

## Levels

1. Explore: navigate in both horizontal directions and dwell on each of three visible trail markers for 450 ms. The center reticle helps aim.
2. Discover: point near the crystal by the left-hand rocks.
3. Place: grab the crystal and release over its altar.
4. Quest: navigate, find the leaf, grab, carry, and release at the shrine. Instructions advance one step at a time.

`forestLevels.js` defines level copy, objects and targets. `forestLogic.js` evaluates normalized screen projections without React, Three.js, or MediaPipe. `worldControls.js` adapts existing tracking output and bounds/damps navigation. `ForestScene.jsx` owns presentation and converts pointers through a ray onto each object's fixed drag plane; users do not need to estimate webcam depth. The scene uses local procedural meshes with no downloaded 3D assets or physics, capped pixel ratio, and throttled HUD snapshots. Decorative motion respects reduced-motion preferences.

## Storage and network

Only the highest completed forest level is stored in `motionforge_forest_v1`, separate from classic mission progress. Reload offers to continue at the next unfinished level. An incomplete level restarts; no in-flight object position or hand sample is persisted. Storage failure keeps the current visit playable. No video or camera frames are stored or uploaded.

The unchanged tracking hook downloads its MediaPipe model from Google's existing model URL. A fresh camera session therefore still needs that resource/network cache; this extension does not claim fresh-install offline camera support. Model errors and camera denial retain a mouse fallback. Forest assets require no third-party downloads once the application is loaded.

## Automated verification

- `npm test`: existing tracking/mission tests plus forest navigation, tracking-loss, ownership, pinch/release, quest ordering, persistence and restart tests.
- `npm run build`: production bundle.
- `npm run test:forest`: headless Chrome browser smoke tests. Chrome must be installed; adjust `channel` in `playwright.config.js` for another supported browser. Tests start Vite on 127.0.0.1:3100 with browser auto-open disabled. They use ordinary mouse/keyboard events for the complete four-level journey, check classic-menu access, refresh/resume, pause/restart, blocked-model fallback, and narrow-screen layout. Screenshots/traces go to ignored `test-results/`.

## Physical device checks still required

- Use the target laptop/browser with a real person; check both physical hand labels, comfortable raised-hand position, neutral entry, left/right direction, tilt limits and pinch sensitivity in normal and dim lighting.
- Complete all four levels with the webcam, including hand crossing, one-hand disappearance, both-hand disappearance, and reconnecting a camera after permission denial.
- Verify frame rate and tracking responsiveness together on the actual GPU; automated browser tests use software WebGL and do not establish hardware performance.
- Verify the deployed HTTPS build and camera permissions on the demonstration device. No deployment is performed by this change.
