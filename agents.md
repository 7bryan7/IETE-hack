# MotionForge agent guide

This file defines ownership and collaboration rules for the three MotionForge development agents. Product scope, contracts, metric definitions, architecture, and implementation milestones are authoritative in `README.md`; they are not duplicated here.

## Shared objective

Deliver one reliable vertical slice:

```text
camera permission
  → calibration
  → tracked hand pointer
  → pinch to grab
  → move and place an object in a 2.5D playroom
  → complete one optional mission
  → show continuous and final performance metrics
```

The mouse adapter must remain usable throughout development and in the final build as a fallback.

## Shared rules

1. Build only the README MVP until the complete vertical slice is stable.
2. Treat `src/core/contracts.ts` as a shared integration boundary.
3. Contract changes require agreement from all three agents before implementation.
4. Keep MediaPipe isolated from world, mission, and UI state.
5. Keep the interaction engine independent of its input source.
6. Keep missions data-driven and independent of rendering components.
7. Do not add authentication, a backend, pose tracking, physics, charts, or full 3D depth interaction during the initial build.
8. Never store webcam frames or video.
9. Preserve non-clinical language for all metrics and scores.
10. Make small commits and keep the integration branch runnable.
11. Add automated tests for pure mission, metric, tracking-transform, and persistence logic.
12. Optional polish must not weaken the working interaction path.

## Balanced ownership

The work is divided into three comparable streams. Each agent owns implementation and tests for its stream, plus one-third of integration and demo verification.

### Agent 1 — Experience, local data, accessibility, and verification

Owns:

- Vite application shell and navigation
- Home, permission, and calibration screens
- Camera permission, denial, and recovery UX
- Playroom HUD and mission instructions
- Live metric presentation
- Results, restart, recovery, and continue-exploring flows
- Browser-local IndexedDB repository and schema
- Batched persistence of movement samples, interaction events, task records, and performance snapshots
- Lightweight `localStorage` preferences and recovery metadata
- Local performance history, previous-task comparison, and personal-best presentation
- Local-data retention and reset controls
- Visual feedback for hover, grabbed, tracking loss, and mission completion
- Keyboard/mouse-accessible controls and readable presentation
- Persistence tests, including refresh recovery and offline operation
- Playwright smoke path and demo checklist
- Deployment configuration and deployed-build verification

Primary areas:

```text
src/app/
src/components/calibration/
src/components/hud/
src/components/results/
src/storage/
src/styles/
```

Deliverable: a complete user journey and offline local history that work first with mock data and mouse input, then with integrated tracking, interaction events, and metrics.

### Agent 2 — Camera, tracking, and input quality

Owns:

- Webcam lifecycle and cleanup
- MediaPipe Hand Landmarker initialization
- Landmark extraction and timestamp handling
- Mirroring and normalized coordinate mapping
- Calibration logic
- Index-finger/palm pointer selection
- Palm-normalized pinch calculation
- Grab/release hysteresis
- Pointer smoothing and confidence handling
- Short tracking-loss grace behavior
- `HandPointer` production
- Mouse-to-`HandPointer` adapter contract support
- Tracking debug panel and performance tuning
- Unit tests for pinch classification and coordinate transforms

Primary areas:

```text
src/components/camera/
src/tracking/
src/core/contracts.ts
```

Deliverable: a stable `HandPointer` stream with the coordinate and gesture behavior defined in the README.

### Agent 3 — Playroom, interaction, missions, and performance

Owns:

- Orthographic 2.5D playroom rendering
- Data-driven world object definitions
- Object hit testing and deterministic selection
- Hover, grab, drag, drop, and place state machine
- Interaction target zones
- World state updates
- `InteractionEvent` production
- Optional mission state and evaluator
- Continuous performance accumulator
- Score calculation
- Metric reset and finalization hooks for session lifecycle events
- Vitest coverage for interactions, missions, and metrics

Primary areas:

```text
src/components/playroom/
src/core/interaction/
src/core/missions/
src/core/performance/
src/data/
src/state/
```

Deliverable: the mouse-controlled interaction, mission, and metric-calculation flow first, followed by integration with Agent 2's `HandPointer` and Agent 1's UI and persistence repository.

## Shared integration responsibilities

Ownership does not mean isolation. Each agent must reserve time for the following shared work:

| Integration checkpoint | Lead | Required participants |
|---|---|---|
| Contract review and app scaffold | Agent 1 | Agents 2 and 3 |
| `HandPointer` into interaction engine | Agent 2 | Agents 1 and 3 |
| Interactions, mission events, and metric calculation | Agent 3 | Agents 1 and 2 |
| Local persistence, results, recovery, and restart | Agent 1 | Agents 2 and 3 |
| Device, lighting, browser, and deployment test | Rotating | All agents |

If one stream finishes early, that agent moves to integration tests, debugging, accessibility, or demo hardening rather than beginning post-MVP features.

## Recommended working sequence

### Checkpoint 1 — Contract and scaffold

All agents agree on the contracts in the README. Agent 1 creates the application shell while Agents 2 and 3 create compile-safe adapters against those contracts.

### Checkpoint 2 — Independent foundations

- Agent 1 uses mock snapshots and events to finish the user flow, local repository, and performance-history flow.
- Agent 2 proves camera → pointer → pinch with a visible debug overlay.
- Agent 3 proves mouse → grab → move → place → mission → metrics.

### Checkpoint 3 — Vertical integration

Replace mouse input with live `HandPointer` data without changing the interaction engine. Connect real movement samples, interaction events, task records, and performance snapshots to Agent 1's local repository, HUD, and results screen.

### Checkpoint 4 — Reliability

Test the deployed build on the actual demonstration hardware. Fix reliability problems before adding rewards or scene polish.

### Checkpoint 5 — Feature freeze

Stop adding features. Rehearse permission handling, calibration, the mission, results, restart, and mouse fallback.

## Git and coordination

- Use one short-lived branch per bounded change.
- Rebase or merge from the integration branch before handoff.
- Prefer small pull requests that preserve a runnable app.
- Record breaking contract decisions in the pull request and README.
- Do not use this file as an append-only change log; Git history is the change record.
- Report blockers immediately when they affect another agent's integration boundary.

Suggested checkpoints:

```text
chore/app-scaffold
feat/camera-tracking
feat/playroom-interaction
feat/mission-metrics
test/demo-hardening
```

## Completion gate

The three streams are complete only when their work functions together in the deployed MVP. A component working in isolation is an intermediate result, not project completion.

Post-MVP work may begin only after all agents confirm:

- Webcam and mouse input both work.
- Pinch grab/release is stable.
- Objects can be placed reliably.
- The mission completes correctly.
- Continuous and final metrics agree.
- Movement samples, actions, task records, and summaries persist locally and survive a refresh.
- Local tracking and history work without a network connection.
- Restart works without refreshing.
- No webcam frames or video are stored or transmitted.
- The demo succeeds on the target laptop and browser.
