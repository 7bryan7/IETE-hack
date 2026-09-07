# Progressive missions

Run `npm test` and `npm run build` from the project root. Tests exercise normalized hand inputs at the engine boundary; they do not validate a real webcam.

The app uses the existing camera, MediaPipe hook, and normalized tracker. No new gesture detector, handedness swap, video persistence, framework, or package was added. Old mini-game components remain in source; App routes the ten progressive missions.

## Manual laptop acceptance

- Allow the camera and check known physical left and right hands in calibration. Cross hands; confirm labels stay physical. Repeat after denial and camera retry.
- Level 1: hold each target for 300 ms on Easy. Leave early and verify a miss; hide your hand and verify time pauses.
- Level 2: use the other hand, stay inside, then leave. Count one error per entry; complete eight requested-hand rounds.
- Level 3: start with open fingers, pinch near a star, then pinch away. Let a star pass and confirm a replacement appears. Catch six.
- Level 4: grab slightly off-center; verify no snap. Move and release inside/outside the target. Cross hands while holding.
- Level 5: complete Right → Left and Left → Right. Try receiving pinch before source release and simultaneous pinch/release: neither should transfer. Then release first, pinch the receiving hand, and place.
- Level 6: arrive at different times, leave before the hold completes, and then hold both points together.
- Level 7: trace all four paths. Skip directly to END and confirm it does not complete. Stay outside the trail and check errors do not accumulate each frame.
- Level 8: watch the preview, try an out-of-order target and other hand, then complete remaining steps without losing earlier progress. Move out between touches.
- Level 9: follow both targets for 18 active seconds; hide one hand, confirm pause and lost-time measurement.
- Level 10: reach → catch → carry to START and trace → controlled transfer → hold crystal while activating both points → place. Recover after a dropped crystal.
- During a grab, briefly hide the owning hand: the object stays still. After 1.5 seconds it unlocks for a fresh grab without counting an error. Repeat after camera interruption.
- Restart, replay, Next Level, Level Map, and refresh. Only completion unlocks the next mission, even with one star; best score/time survive refresh. Unfinished runs restart after refresh.
- Resize the browser; camera crop, fingertip overlay, and targets must remain aligned. HUD and instructions remain outside the play area.
- Repeat representative missions on Medium and Hard. Verify browser storage contains only aggregate progress, no video or images.

## Metric definitions

Coordinates use a 1000 × 600 logical canvas fitted at 5:3. Distances and movement lengths use game units. Dwell is active elapsed time. General accuracy is successful actions / (successful actions + errors). Path accuracy uses time within the trail; sequence accuracy uses correct steps / step attempts; dual tracking accuracy uses simultaneous in-target time / active tracking time. Performance Score equals applicable accuracy, clamped 0–100; stars use 90/70 thresholds and do not gate unlocking.

Path efficiency uses ideal successful placement distance / total object travel, clamped 0–1. Synchronization maps average arrival gap linearly from 0–2 seconds to 100–0. Smoothness approximates changes in sampled speed. Tracking-loss time is separate from active playtime. Progress stores completion, best score, best active time and stars, across difficulties.

## Verification limits

Automated state tests and production compilation do not certify physical hand recognition, camera permission prompts, lighting, or browser interactions. Perform this checklist on the demonstration laptop. The unchanged tracker downloads its model from Google's model host; a first offline camera session still needs that asset. This change does not introduce offline model caching.
