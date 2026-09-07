# Tracking validation

Run `node --test src/tracking/handTracking.test.js` and `npm run build`.
The Node tests use synthetic landmarks; they do not measure model accuracy.

`config.js` centralizes confidence, smoothing, pinch hysteresis, label confirmation,
and the temporary `DEBUG_HAND_TRACKING` switch. All games consume `hand.handedness`
from the shared hook. `normalizedHandedness` in debug is the current prediction;
`handedness` is the temporally confirmed physical label.

The existing pipeline sends the video element directly to `detectForVideo`.
CSS mirrors only its presentation. The previous unconditional label swap has
been removed based on the reported inverted physical labels. Validate this on
the target webcam: CSS mirroring alone is not evidence that labels need swapping.
If raw labels consistently oppose known physical hands, set `swapHandedness`
to true in this single config; do not modify the coordinate transform or games.

## Target webcam checks (require a person; pending)

1. Enter calibration with only the physical right hand. Confirm Physical Hand
   becomes Right after three confident frames. Note Raw, Normalized and confidence.
2. Repeat with only the physical left hand.
3. Raise both hands, rotate slightly, and change their detection order by briefly
   removing one. Confirm the labels and smoothing remain independent.
4. Cross hands slowly and quickly. A single incorrect classification must not
   immediately swap labels. Full occlusion can still require reacquisition.
5. Pinch near and far from the camera: grab below 0.32, hold in the hysteresis
   band, release above 0.42. Keep the wrist and middle MCP visible.
6. Test all four games. Fingertips, pinch midpoint and held objects should follow
   the mirrored video, including after resizing to wide and narrow viewports.
7. Leave and re-enter games; verify camera restarts and the camera indicator turns
   off on returning to the menu. Check camera permission denial/retry.

EMA alpha 0.7 intentionally trades some motion latency for stability. Tune only
after these physical tests. Runtime assets are bundled from the installed
MediaPipe package; the existing remote model URL still requires network access.
