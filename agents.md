# MotionForge — agents.md

This file defines the three development agents working on MotionForge, their responsibilities, integration boundaries, and the permanent change history of the project.

MotionForge is a browser-based, webcam-controlled **open-world motor coordination environment**. The user should be able to enter an environment containing many objects and freely grab, move, place, drop, throw or activate them. Missions exist inside the environment, but free interaction must remain possible.

---

# Team

Three members / three development agents are working on the project.

| Agent | Role | Main Ownership |
|---|---|---|
| Agent 1 | Frontend & UX | Screens, HUD, calibration UI, environment selection, mission display, results |
| Agent 2 | Tracking, Logic & Data | Webcam, MediaPipe, calibration, mission logic, scoring, metrics, session state |
| Agent 3 | Open World, 3D & Interactions | Environments, objects, grabbing, placement, physics, Three.js, 3D assets |

The workload should remain approximately equally divided.

---

# Agent 1 — Frontend & UX

## Responsibilities

- React/Next.js app structure
- Home/start page
- Calibration screen
- Environment selection screen
- Game HUD
- Mission instructions
- Object interaction prompts
- Reward UI
- Results screen
- Performance summary
- Recharts dashboard if added
- Responsive UI
- Accessibility-oriented presentation
- Integration of data from Agents 2 and 3 into the interface

## Primary files/modules

```text
app/
components/ui/
components/hud/
components/results/
components/calibration/
```

## Must coordinate before changing

- MediaPipe tracking
- Mission scoring formulas
- Physics
- 3D world state

---

# Agent 2 — Tracking, Logic & Data

## Responsibilities

- `getUserMedia()` webcam integration
- MediaPipe Hand Landmarker
- MediaPipe Pose Landmarker when required
- Hand landmark processing
- Pose landmark processing
- Calibration logic
- Coordinate normalization
- Screen/world coordinate mapping
- Hand visibility state
- Mission state machine
- Timer
- Action tracking
- Accuracy calculation
- Error calculation
- Score calculation
- Session result structure
- Zustand state if required
- Supabase persistence if later added

## Primary files/modules

```text
components/camera/
components/tracking/
lib/mediapipe/
lib/missions/
lib/scoring/
types/
```

## Core output

```ts
type TrackingPoint = {
  x: number;
  y: number;
  visible: boolean;
};
```

## Mission result

```ts
type MissionResult = {
  missionId: string;
  durationMs: number;
  successfulActions: number;
  totalActions: number;
  errors: number;
  accuracy: number;
  score: number;
};
```

---

# Agent 3 — Open World, 3D & Interactions

## Responsibilities

- Build open-world environment
- Render many objects simultaneously
- Maintain world object states
- Object hitboxes
- Hover/proximity detection
- Grab logic
- Held-object state
- Move logic
- Drop logic
- Placement zones
- Throw interaction
- Stack interaction
- Push/pull if added
- Interaction zones
- Three.js
- React Three Fiber
- GLTF/GLB asset integration
- Asset optimization
- Rapier physics
- Collision detection
- Lightweight environment design

## Primary files/modules

```text
components/environment/
components/objects/
lib/interactions/
lib/physics/
data/environments/
data/objects/
public/models/
```

## Core rule

Do not build a visually complex 3D scene before the following works:

```text
Hand Coordinate
→ Detect Object
→ Grab
→ Move
→ Drop / Place
```

The first environment may use simple geometry or lightweight assets.

---

# Open-World Design Rules

All agents must preserve the following behavior:

1. The environment contains many objects at the same time.
2. The user is not locked to a single object.
3. The user may choose which object to interact with.
4. Missions are optional structures inside the world.
5. Non-mission objects should still remain interactable where practical.
6. The same interaction engine should support many objects.
7. New missions should reuse existing object and interaction systems.
8. Do not create each mission as a completely separate game unless necessary.

---

# Shared Development Rules

1. Build the MVP before advanced features.
2. Do not prioritize login/register.
3. Do not create unnecessary backend complexity.
4. Keep camera processing browser-side.
5. Keep modules independent.
6. Avoid unnecessary edits to another agent's files.
7. Commit small working changes.
8. Keep the integration branch runnable.
9. Update this file after every meaningful change.
10. Never remove existing history entries.
11. Record integration-breaking changes immediately.
12. Optional features must not break the working prototype.

---

# Shared Data Contracts

## Tracking point

```ts
type TrackingPoint = {
  x: number;
  y: number;
  visible: boolean;
};
```

## World object

```ts
type WorldObject = {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  movable: boolean;
  grabbable: boolean;
  interactionType: string[];
};
```

## Interaction event

```ts
type InteractionEvent = {
  objectId: string;
  action:
    | "touch"
    | "grab"
    | "move"
    | "drop"
    | "place"
    | "throw";
  timestamp: number;
};
```

## Mission result

```ts
type MissionResult = {
  missionId: string;
  durationMs: number;
  successfulActions: number;
  totalActions: number;
  errors: number;
  accuracy: number;
  score: number;
};
```

---

# Parallel Development Plan

## Phase 1 — Basic Working Model

### Agent 1

Build:

- Home screen
- Calibration UI
- Environment selection
- Environment HUD
- Mission display
- Results UI

### Agent 2

Build:

- Webcam
- MediaPipe Hand
- Tracking coordinates
- Calibration
- Mission state
- Timer
- Scoring

### Agent 3

Build:

- One open-world room
- Several objects
- Object hitboxes
- Mock-pointer interaction
- Grab
- Move
- Drop
- Place

---

# First Integration Milestone

```text
Agent 2
Hand Tracking
↓
TrackingPoint

Agent 3
Open-World Interaction
↓
InteractionEvent

Agent 2
Mission + Score
↓
MissionResult

Agent 1
HUD + Results
```

This is the highest-priority integration milestone.

---

# Phase 2 — Expansion

## Agent 1

- Reward animations
- Better HUD
- Environment cards
- Progress UI
- Charts

## Agent 2

- Pose tracking
- Better scoring
- Additional mission rules
- Session history
- Adaptive difficulty logic

## Agent 3

- More objects
- More interactions
- Three.js environment
- GLTF/GLB assets
- Rapier physics
- Throwing
- Stacking
- Multiple environments

---

# Change History

Every agent must append changes using the following format.

```md
### [Date/Time] — Agent X — Change title

- **Module:** affected module
- **Files:** files/directories changed
- **Changes:** what was implemented or modified
- **Reason:** why the change was needed
- **Integration impact:** anything the other agents must know
- **Status:** Complete / In Progress / Needs Testing
```

Do not rewrite previous entries.

---

# Initial History

### Project Planning — Shared

- **Module:** Architecture and development planning
- **Files:** `README.md`, `agents.md`
- **Changes:** Defined MotionForge as a browser-based webcam-controlled open-world motor coordination environment. Added project problem context, target users, innovation gap, existing solutions, complete proposed technology stack, feasibility, risks, expected impact, limitations and future scope from the idea presentation.
- **Reason:** Keep implementation aligned with the hackathon proposal.
- **Integration impact:** All three agents must follow the same open-world interaction model.
- **Status:** Complete

### Open-World Requirement — Shared

- **Module:** Product behavior
- **Files:** `README.md`, `agents.md`
- **Changes:** Added the requirement that environments contain many objects and users can freely choose, grab and interact with objects rather than only following rigid mission steps.
- **Reason:** MotionForge should feel like a free interactive environment, not only a sequence of mini-games.
- **Integration impact:** Mission logic must not disable unrelated object interaction. Object systems must be reusable across missions.
- **Status:** Complete

### Initial Assignment — Agent 1

- **Module:** Frontend & UX
- **Files:** To be created
- **Changes:** Assigned UI, calibration, environment selection, HUD, mission display, rewards and results.
- **Reason:** Allow frontend development to proceed independently.
- **Integration impact:** Must consume shared tracking/mission state without duplicating tracking or scoring logic.
- **Status:** Assigned

### Initial Assignment — Agent 2

- **Module:** Tracking, Logic & Data
- **Files:** To be created
- **Changes:** Assigned webcam, MediaPipe, coordinate mapping, mission engine, timer, accuracy, errors, scoring and session state.
- **Reason:** Centralize tracking and measurement logic.
- **Integration impact:** Must expose stable hand coordinates to Agent 3 and mission results to Agent 1.
- **Status:** Assigned

### Initial Assignment — Agent 3

- **Module:** Open World, 3D & Interactions
- **Files:** To be created
- **Changes:** Assigned environment rendering, many-object world state, grabbing, moving, placement, Three.js, assets and physics.
- **Reason:** Separate world/interaction development from tracking and frontend work.
- **Integration impact:** Initially support mock pointer coordinates, then switch to Agent 2's tracking output.
- **Status:** Assigned

---

# Current Priority

The three agents are working toward this single milestone:

```text
Open browser
↓
Allow webcam
↓
Calibrate hand
↓
Enter environment
↓
See many objects
↓
Choose any supported object
↓
Grab it
↓
Move / Drop / Place it
↓
Optional mission completes
↓
Performance is calculated
↓
Results are shown
```

If this works smoothly, MotionForge has demonstrated its core innovation.

Everything else is an enhancement.
