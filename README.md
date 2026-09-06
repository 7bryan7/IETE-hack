# MotionForge 🖐️

### Webcam-Controlled Motor Coordination & Movement Planning Game for Children

---

## 1. Problem Statement

Children may experience difficulties with:
* Hand-eye coordination
* Motor planning
* Coordinating both hands (bilateral coordination)
* Completing sequential physical movements
* Movement accuracy
* Completing physical tasks within reasonable timeframe

**Note:** MotionForge is **NOT** a medical diagnostic tool. It provides game-performance metrics only to encourage motor practice and coordination improvement through fun interactive gameplay.

---

## 2. Solution

MotionForge is a browser-based webcam game where children control virtual game objects using real hand gestures. 
Using real-time AI computer vision (`@mediapipe/tasks-vision`), MotionForge tracks hand landmarks, pinch gestures, and spatial movements directly in the browser—with zero external hardware or controllers.

---

## 3. Key Features

- 📹 **Live Webcam Integration**: Mirrored camera preview for natural selfie interaction.
- 🖐️ **Dual Hand Tracking**: Detects up to 2 hands, skeletons, fingertip positions, and Left/Right hand orientation in real-time.
- 🤏 **Pinch Gesture Control**: Hysteresis-supported pinch detection for pinching, grabbing, and dropping objects.
- 🎯 **Game 1 — Reach Challenge**: Touch dynamic circular targets with your index fingertip.
- 🖐️ **Game 2 — Catch Challenge**: Pinch and grab floating stars, fruits, balls, and bubbles and deposit them into target collectors.
- 🔄 **Game 3 — Hand Transfer**: Grab an object with one hand, bring hands together, pass it over to the other hand, and deliver to a target.
- 🧩 **Game 4 — Sequence Challenge**: State-machine driven 5-step spatial motor planning challenge.
- 📊 **Performance Analytics**: Calculates Accuracy %, Completion Time (sec), Errors count, and Coordination Score (0–100 with 5-star ratings).
- 🔊 **Web Audio Synthesizer**: Native browser synthesized sound effects for catches, pops, transfers, and fanfare.
- ⚙️ **Adaptive Difficulty**: Adjustable Easy, Medium, and Hard difficulty levels.

---

## 4. Technology Stack

- **Frontend Framework**: React.js (v18+)
- **Build Tool**: Vite
- **Computer Vision**: MediaPipe Tasks Vision (`@mediapipe/tasks-vision` HandLandmarker)
- **Game Rendering**: HTML5 Canvas overlay
- **Icons**: Lucide React
- **Audio**: Native Web Audio API Synthesizer

---

## 5. Installation & Usage

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Webcam connected to computer

### Installation Steps

```bash
# Navigate to project directory
cd "c:/Users/Home/Desktop/IETE hack"

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:3000` (or the URL shown in your terminal). Allow webcam permissions when prompted.

---

## 6. Project Structure

```
src/
├── components/
│   ├── Camera.jsx          # MediaDevices camera feed & permission handling
│   ├── HandTracker.jsx      # Tracking display helpers
│   ├── GameCanvas.jsx      # Canvas overlay for hand skeleton, trails & game objects
│   ├── GameMenu.jsx        # 4 Game cards selector & difficulty settings
│   ├── Header.jsx          # Top HUD navigation bar with stats
│   ├── Instructions.jsx    # Pre-game tutorial overlay
│   ├── ResultScreen.jsx    # Celebration, stars, and performance breakdown
│   ├── Calibration.jsx     # Pre-game camera setup & 2-hand detection check
│   └── LandingPage.jsx     # Hero section, feature breakdown, and disclaimers
│
├── games/
│   ├── ReachGame.jsx       # Game 1: Touch circular targets with index fingertip
│   ├── CatchGame.jsx       # Game 2: Pinch & catch floating virtual objects
│   ├── TransferGame.jsx    # Game 3: Hand-to-hand transfer coordination
│   └── SequenceGame.jsx    # Game 4: Step-by-step motor planning sequence
│
├── hooks/
│   └── useHandTracking.js  # Custom hook wrapping MediaPipe HandLandmarker
│
├── utils/
│   ├── collision.js        # Circle & rectangle collision formulas
│   ├── gestures.js         # Pinch detection with hysteresis & distance helpers
│   ├── scoring.js          # Coordination score, accuracy %, & star rating math
│   ├── movement.js         # Fingertip trail tracking & canvas drawing
│   └── sound.js            # Web Audio API audio synthesizer
│
├── App.jsx                 # App routing & state coordinator
├── main.jsx                # Entry point
└── App.css                 # Custom child-friendly dark navy theme styles
```

---

## 7. How Each Game Works

### 🎯 Reach Challenge (Game 1)
Dynamic circular targets appear on screen. The child moves their index fingertip into the target area before time runs out. Measures speed, accuracy, and trajectory.

### 🖐️ Catch Challenge (Game 2)
Virtual objects (stars, balls, fruits, bubbles) drift across the screen. The child performs a pinch gesture (thumb tip + index tip) to catch the object, drags it, and drops it into a collector zone.

### 🔄 Hand Transfer (Game 3)
Focuses on bilateral coordination. An orb spawns for one hand (e.g. Right hand). The child pinches with their Right hand, brings both hands close, releases Right pinch while pinching with their Left hand to execute the transfer, then places it inside the target zone.

### 🧩 Sequence Challenge (Game 4)
A state-machine guides the child through a 5-step spatial motor sequence:
1. Pinch ball with Right hand
2. Move ball Right
3. Transfer to Left hand
4. Move ball Upward
5. Drop into Target Goal

---

## 8. Game Metrics & Scoring

- **Accuracy (%)**: `(Successful Actions / Total Attempts) * 100`
- **Completion Time**: Seconds elapsed from start to mission completion.
- **Errors**: Count of missed targets, dropped items, or out-of-sequence moves.
- **Coordination Score (0–100)**: Weighted score evaluating accuracy (45%), error penalty (35%), and time performance (20%).
  - **80–100**: Excellent (5 Stars ⭐⭐⭐⭐⭐)
  - **60–79**: Good (4 Stars ⭐⭐⭐⭐)
  - **40–59**: Developing (3 Stars ⭐⭐⭐)
  - **Below 40**: Keep Practicing (2 Stars ⭐⭐)

---

## 9. Limitations & Future Scope

### Limitations
- Requires sufficient lighting for webcam hand detection.
- WebAssembly MediaPipe assets require initial internet access to fetch CDN model files.

### Future Scope
- Multiplayer / co-op motor coordination modes.
- Save historical progress in local storage or remote database.
- Dynamic custom levels and downloadable performance reports for parents/educators.

---

## 10. Safety Disclaimer

> MotionForge provides game-based movement activities and performance metrics. It is **not** a medical diagnostic tool or treatment device.

