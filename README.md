# MotionForge

MotionForge is a **completely web-based, webcam-controlled AR gamified environment** designed to help children and adults practice motor coordination and movement planning through physical interaction with virtual objects.

The core idea is not a sequence of rigid mini-games. MotionForge is designed as an **open-world interactive environment** containing many objects. The user can freely explore the scene, reach for objects, grab them, move them, place them, throw them, combine them, or use them to complete optional missions. The system observes how the user moves and interacts, measures performance, and summarizes progress.

**Core loop:**  
**Learn → Move → Play → Get Rewarded → Improve**

---

# 1. Hackathon Context

- **Team Name:** Bug Eaters
- **Domain:** Healthcare and Assistive Technology
- **Problem Statement:** Motor Coordination & Movement Planning
- **Solution Type:** Software
- **Project Name:** MotionForge

---

# 2. Problem Statement

Some children may experience difficulty with:

- Hand-eye coordination
- Simultaneous physical movements
- Sequential and accurate movements
- Movement planning
- Completing physical actions in the correct order

### Target users

- Children with autism
- Children or adults with movement-related disabilities
- Parents
- Teachers
- Therapists

### Background research from the idea PPT

- About **1 in 127 people globally were estimated to have autism in 2021**.
- In some poorer countries, **as low as 3% of assistive-technology needs are met**.

---

# 3. Innovation Gap

Existing solutions commonly provide interactive games or therapeutic activities, but several gaps remain:

- Many systems are limited to predefined movements and fixed tasks.
- Some require desktop software or installation.
- Some require special hardware or AR devices.
- Many solutions provide only trial access or subscription-based usage.
- Existing experiences often behave like separate mini-games instead of a persistent interactive environment.
- There is room for a browser-based platform where users can interact freely with many objects in a real-world-like environment.

### Existing examples referenced in the idea PPT

- WonderTree
- HandCity
- InclusionGames
- Timocco
- MotionInput Games

These are useful references, but MotionForge aims to differentiate itself through a **browser-based open-world interaction model** rather than only fixed game screens.

---

# 4. MotionForge Solution

MotionForge is a webcam-controlled interactive environment where the user uses their **hands and body movements** to interact with virtual objects.

The platform should eventually provide multiple environments such as:

- Playroom
- Park
- Beach
- Space

Inside each environment, many objects are placed around the user.

Examples:

- Balls
- Blocks
- Stars
- Boxes
- Baskets
- Rings
- Toys
- Bottles
- Cubes
- Targets
- Doors
- Buttons
- Levers
- Collectibles

The user is **not forced to follow one rigid action path**.

They may:

- Grab any available object
- Move it
- Drop it
- Throw it
- Place it inside another object
- Stack objects
- Touch or activate objects
- Move objects from one area to another
- Complete optional missions
- Ignore a mission temporarily and explore the environment

The system evaluates the user's movements during these interactions.

---

# 5. Open-World Interaction Model

This is a major design requirement.

MotionForge should behave like an **open-world motor activity playground**, not only a collection of separate mini-games.

### Environment model

Each environment contains:

- Many visible interactive objects
- Several possible actions
- Optional mission objectives
- Reward objects
- Interactive zones
- Free exploration

### Example: Playroom

Objects:

- Ball
- Toy blocks
- Basket
- Shelf
- Ring
- Star
- Box
- Toy car

Possible free actions:

- Pick up ball
- Throw ball
- Place ball in basket
- Move block
- Stack block
- Touch star
- Move ring
- Put toy inside box

Possible missions:

- Put the red ball in the basket
- Move three blocks to the shelf
- Touch the star with the right hand
- Pick up the ring and move it across the body
- Stack two blocks
- Throw the ball toward the target

The important point is that **objects remain freely interactable even when a mission exists**.

---

# 6. Web Application Workflow

**Open MotionForge → Allow Camera → Calibrate → Choose Environment → Enter Open World → Explore Objects → Grab / Move / Throw / Place → Optional Mission Completion → Performance Measurement → Feedback & Rewards → Progress Summary**

### Detailed workflow

1. User opens MotionForge.
2. Browser requests webcam access.
3. Calibration verifies that the user's hand/body is visible.
4. User chooses an environment.
5. The selected open-world environment loads.
6. Webcam remains visible or blended with the environment.
7. MediaPipe tracks hand/body landmarks locally in the browser.
8. Tracking coordinates are mapped to interaction coordinates.
9. User can freely move around the available interaction space.
10. User can grab any supported object.
11. Object interaction logic reacts to hand movement.
12. Mission engine optionally detects whether a goal has been completed.
13. System records:
   - movement accuracy
   - completion time
   - errors
   - successful actions
   - coordination
14. User receives reward/feedback.
15. Session performance is summarized.
16. User can continue exploring or choose another mission/environment.

---

# 7. Development Strategy

The project must be developed in two stages.

## Stage A — Basic Working Model First

The first version should prove the central technical idea.

### Required first prototype

- Browser application
- Webcam access
- MediaPipe hand tracking
- One open-world room/environment
- Several interactive objects visible at the same time
- User can freely choose an object
- User can grab at least one object type
- User can move/drop/place the object
- One optional mission
- Timer
- Success/error tracking
- Basic score/result screen

### MVP success condition

A judge should be able to:

1. Open the browser.
2. Allow webcam.
3. Enter one environment.
4. See multiple objects.
5. Move their hand.
6. Grab any supported object.
7. Move or place it.
8. Complete an optional mission.
9. Receive a performance result.

Do not begin with login/register or complex backend features.

---

# 8. Step-by-Step Build Process

## Module 1 — Project Setup

Goal: Create the basic web application.

Tasks:

1. Create React + TypeScript + Next.js project.
2. Create simple navigation.
3. Add:
   - Home
   - Calibration
   - Environment
   - Results
4. Configure GitHub.
5. Keep the project runnable for all three members.

Output: Browser application opens and reaches the environment page.

---

## Module 2 — Webcam

Goal: Display live webcam feed.

Tasks:

1. Use `getUserMedia()`.
2. Ask for webcam permission.
3. Display mirrored webcam.
4. Handle camera errors.
5. Keep processing browser-side.

Output: Stable webcam feed.

---

## Module 3 — Hand Tracking

Goal: Detect hand position.

Technology:

- MediaPipe Hand Landmarker

Tasks:

1. Detect at least one hand.
2. Extract hand/palm/index-finger coordinates.
3. Draw a debug marker.
4. Convert normalized coordinates into interaction-space coordinates.
5. Smooth noisy movement if necessary.

Output: Virtual pointer follows the user's hand.

---

## Module 4 — Open-World Environment

Goal: Build one environment containing many objects.

Start with a simple room or playroom.

Do not begin with a highly detailed 3D world.

Tasks:

1. Create one environment.
2. Add multiple objects at once.
3. Assign every object:
   - ID
   - position
   - size
   - interaction type
   - movable/non-movable state
4. Render all objects together.
5. Allow user to approach any object freely.

Output: One open world with many interactable objects.

---

## Module 5 — Object Interaction System

Goal: Allow users to interact freely.

Initial interactions:

- Touch
- Grab
- Move
- Drop
- Place

Later interactions:

- Throw
- Stack
- Push
- Pull
- Activate
- Insert object into container

### Suggested interaction state

```text
IDLE
↓
HOVER / NEAR OBJECT
↓
GRAB
↓
HELD
↓
MOVE
↓
DROP / PLACE / THROW
```

Output: User can choose an object and manipulate it.

---

## Module 6 — Interaction Zones

Goal: Make webcam-based interaction practical.

Because true depth estimation is difficult, use constrained interaction zones.

Examples:

- Object hitbox
- Grab radius
- Drop zone
- Basket area
- Target zone
- Shelf zone

Use simplified depth estimation where needed.

Output: Reliable interaction without requiring precise 3D depth sensing.

---

## Module 7 — Mission Engine

Goal: Add optional structured objectives without removing free exploration.

Example mission:

**"Place the red ball inside the basket."**

Mission states:

```text
AVAILABLE
→ ACTIVE
→ PROGRESS
→ COMPLETED
```

Possible mission types:

- Reach
- Grab
- Move
- Place
- Throw
- Touch in sequence
- Use left/right hand
- Cross-body movement
- Stack objects

The user should still be free to interact with unrelated objects.

Output: Open-world interaction + mission completion.

---

## Module 8 — Scoring & Performance

Measure simple, understandable metrics.

Track:

- Completion time
- Successful actions
- Errors
- Wrong-object selections
- Missed targets
- Movement accuracy
- Mission completion
- Final score

Example:

```text
Accuracy = Successful Required Actions / Total Required Actions × 100
```

Avoid medically claiming that this is a diagnostic score.

Output: Session metrics.

---

## Module 9 — Feedback & Rewards

Show:

- Mission Complete
- Stars/reward
- Time taken
- Accuracy
- Errors
- Score
- Try Again
- Continue Exploring
- Next Mission

Output: Rewarding feedback loop.

---

# 9. Basic Working Model Complete

The minimum complete technical pipeline is:

```text
Webcam
↓
MediaPipe Hand Tracking
↓
Hand Coordinates
↓
Open-World Interaction Space
↓
Object Selection
↓
Grab / Move / Place
↓
Mission Detection
↓
Performance Metrics
↓
Feedback
```

Create a stable Git checkpoint before adding advanced features.

---

# 10. Additional Functionalities

Only implement these after the first working model is stable.

## Priority 1 — More Objects

Add more object types with different interactions.

## Priority 2 — More Missions

Add distinctive movement challenges.

## Priority 3 — Pose Tracking

Technology:

- MediaPipe Pose Landmarker

Use it for:

- Arms
- Shoulders
- Torso
- Larger movements
- Two-hand activities

## Priority 4 — 3D Environment

Technology:

- Three.js
- React Three Fiber

Add:

- 3D rooms
- GLTF/GLB models
- Environment lighting
- Camera setup
- Object animations

## Priority 5 — Physics

Technology:

- Rapier
- `@react-three/rapier`

Use only where required:

- Gravity
- Throwing
- Bouncing
- Collision

## Priority 6 — Multiple Environments

Possible environments:

- Playroom
- Park
- Beach
- Space

## Priority 7 — Performance Dashboard

Technology:

- Recharts

Show:

- Missions completed
- Average accuracy
- Total score
- Improvement over sessions

## Priority 8 — Data Persistence

Technology:

- Supabase

Use for:

- Session results
- Performance history

Authentication is not a hackathon priority.

## Priority 9 — Adaptive Difficulty

Future functionality:

- Smaller/larger targets
- Different object distances
- More complex sequences
- Longer missions
- Different allowed times
- Different hand requirements

---

# 11. Planned Technology Stack

### Frontend

- React
- TypeScript
- Next.js

### 3D Engine

- Three.js
- React Three Fiber

### Hand Tracking

- MediaPipe Hand Landmarker

### Body Tracking

- MediaPipe Pose Landmarker

### Webcam

- WebRTC
- `getUserMedia()`

### Physics

- Rapier
- `@react-three/rapier`

### 3D Assets

- GLTF
- GLB

### Free Asset Sources

- Sketchfab
- Poly Pizza
- Kenney

### State Management

- Zustand

Use for:

- Missions
- Scores
- Object states
- Held object
- Current environment

### Database

- Supabase

Use later for session/results storage.

### Charts

- Recharts

### Deployment & Version Control

- Vercel
- GitHub

---

# 12. Suggested Project Structure

```text
motionforge/
├── app/
│   ├── page.tsx
│   ├── calibration/
│   ├── environment/
│   └── results/
│
├── components/
│   ├── camera/
│   ├── tracking/
│   ├── environment/
│   ├── objects/
│   ├── missions/
│   ├── hud/
│   └── results/
│
├── lib/
│   ├── mediapipe/
│   ├── interactions/
│   ├── scoring/
│   ├── missions/
│   └── physics/
│
├── data/
│   ├── environments/
│   ├── objects/
│   └── missions/
│
├── public/
│   ├── models/
│   └── assets/
│
├── types/
├── agents.md
└── README.md
```

---

# 13. Three-Person / Three-Agent Development Plan

Three members are working on MotionForge.

## Agent 1 — Frontend & UX

Owns:

- App pages
- Calibration UI
- Environment selection
- HUD
- Mission instructions
- Results
- Rewards
- Charts
- Responsive design

## Agent 2 — Tracking, Logic & Data

Owns:

- Webcam
- MediaPipe Hand
- MediaPipe Pose
- Calibration logic
- Coordinate mapping
- Mission engine
- Timer
- Accuracy
- Errors
- Score
- Session data
- Zustand/Supabase integration when needed

## Agent 3 — Open World, 3D & Interactions

Owns:

- Environment rendering
- Multiple objects
- Object states
- Grab/drop/place
- Drag/throw
- Interaction zones
- Three.js
- GLTF/GLB assets
- Rapier physics
- Object collision logic

---

# 14. Integration Contracts

## Tracking output

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
  position: { x: number; y: number; z?: number };
  movable: boolean;
  grabbable: boolean;
  interactionType: string[];
};
```

## Interaction event

```ts
type InteractionEvent = {
  objectId: string;
  action: "touch" | "grab" | "move" | "drop" | "place" | "throw";
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

# 15. Parallel Development Plan

## Phase 1

### Agent 1

- Build main UI
- Calibration
- Environment selector
- HUD
- Results screen

### Agent 2

- Webcam
- MediaPipe Hand
- Tracking coordinates
- Calibration
- Mission/scoring state

### Agent 3

- Build first environment
- Add multiple objects
- Build mock-pointer grabbing
- Build drop/place interaction

## First integration milestone

```text
Agent 2 hand coordinates
↓
Agent 3 open-world object interaction
↓
Agent 2 mission/scoring engine
↓
Agent 1 HUD/results
```

This is the most important milestone.

---

# 16. 10-Hour Hackathon Build Order

```text
Project Setup
↓
Webcam
↓
Hand Tracking
↓
Coordinate Mapping
↓
One Open-World Room
↓
Multiple Objects
↓
Grab / Move / Drop
↓
One Optional Mission
↓
Scoring
↓
Results
↓
TEST MVP
↓
More Objects
↓
3D Polish
↓
Physics
↓
Pose Tracking
↓
Dashboard
↓
Deployment
```

If advanced functionality breaks the working prototype, remove it.

---

# 17. Feasibility

MotionForge is practical because:

- It runs directly in the browser.
- Browser-side processing reduces server-side complexity.
- Local webcam processing reduces latency.
- Local processing improves privacy.
- Open-source libraries and tools are available.
- Standard laptop webcams can be used.
- No dedicated AR headset is required.

---

# 18. Challenges

Expected challenges include:

- Poor lighting
- Unclear background
- Tracking instability
- Camera quality differences
- Depth estimation limitations
- Complex 3D scenes reducing performance
- Low-end device limitations
- Webcam privacy concerns
- Difficulty making free interaction reliable

---

# 19. Risk Management

Use:

- Camera calibration
- Lighting guidance
- Simplified depth estimation
- Constrained interaction zones
- Lightweight 3D assets
- Limited world size
- Local webcam processing
- Store performance metrics rather than webcam footage
- Graceful fallback from complex physics to simpler interactions

---

# 20. Required Resources

Main resources:

- Laptops
- Webcam
- Browser
- Internet for development/deployment
- React/Next.js
- MediaPipe
- Three.js
- React Three Fiber
- Rapier
- GLTF/GLB assets
- GitHub
- Vercel
- Supabase if persistence is added

---

# 21. Expected Impact & Beneficiaries

MotionForge aims to:

- Help children practice motor coordination
- Help practice movement planning
- Make physical activity more engaging
- Encourage repeated practice through gamification
- Provide measurable performance feedback
- Support children, parents, teachers and therapists

---

# 22. Expected Outcomes

Potential outcomes:

- Better hand-eye coordination
- Improved movement accuracy
- Improved movement control
- Better ability to perform sequential actions
- Easier tracking of performance and progress
- More engaging practice compared with static exercises

---

# 23. Key Limitations

- Tracking can be affected by background and camera quality.
- Webcam-based systems have limited depth perception.
- MotionForge is not a replacement for professional medical assessment.
- Performance metrics should not be presented as clinical diagnosis.
- Open-world interaction may initially support only a subset of object actions.

---

# 24. Future Improvements

- AI-based adaptive difficulty
- More distinctive games and movement challenges
- More open-world environments
- Larger object libraries
- Therapist/parent dashboard
- Mobile support
- Wearable-device integration
- Better depth estimation
- Personalized mission generation
- Long-term progress tracking

---

# 25. Definition of Done

The hackathon prototype is successful if a judge can:

1. Open MotionForge in a browser.
2. Allow camera access.
3. Calibrate their hand.
4. Enter an environment.
5. See several virtual objects.
6. Freely choose an object.
7. Grab and move it.
8. Place/drop it.
9. Complete at least one mission.
10. Receive time, accuracy/error and score feedback.

The experience should feel like an **interactive open-world motor playground**, not a sequence of disconnected buttons or rigid mini-games.

# Core Principle

**Build the interaction engine first. Build the world around it second.**

The project should always maintain one reliable path:

**Webcam → Tracking → Free Object Interaction → Mission → Measurement → Feedback**
