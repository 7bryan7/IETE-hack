import React, { useEffect, useRef, useState } from 'react';
import CameraView from '../components/Camera';
import GameCanvas from '../components/GameCanvas';
import Header from '../components/Header';
import Instructions from '../components/Instructions';
import ResultScreen from '../components/ResultScreen';
import { useHandTracking } from '../hooks/useHandTracking';
import { getDistance } from '../utils/gestures';
import { calculateAccuracy, calculateCoordinationScore } from '../utils/scoring';
import { sound } from '../utils/sound';

export default function SequenceGame({ videoRef, difficulty = 'Medium', onHome, onNextGame }) {
  const { isLoaded, isTracking, trackingDataRef } = useHandTracking(videoRef, { numHands: 2 });

  const [gameState, setGameState] = useState('instructions');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [metrics, setMetrics] = useState(null);

  // 5-step spatial motor planning sequence
  const sequenceSteps = [
    {
      id: 'grab',
      title: 'Pinch & Grab the Blue Ball',
      instruction: '1️⃣ Pinch the Blue Ball with your RIGHT hand',
      targetHand: 'Right'
    },
    {
      id: 'moveRight',
      title: 'Move Hand Right',
      instruction: '2️⃣ Move the ball to the RIGHT side of the screen ➡️',
      targetZone: { xMin: 0.65, xMax: 0.95, yMin: 0.2, yMax: 0.8 }
    },
    {
      id: 'transfer',
      title: 'Transfer to Left Hand',
      instruction: '3️⃣ Bring hands close and TRANSFER to your LEFT hand 🔄',
      targetHand: 'Left'
    },
    {
      id: 'moveUp',
      title: 'Move Hand Upward',
      instruction: '4️⃣ Move the ball UPWARD to the top area ⬆️',
      targetZone: { xMin: 0.1, xMax: 0.9, yMin: 0.05, yMax: 0.3 }
    },
    {
      id: 'drop',
      title: 'Drop inside Target',
      instruction: '5️⃣ Release & DROP the ball inside the Gold Target 🎯',
      targetZone: { x: 0.5, y: 0.7, radius: 0.1 }
    }
  ];

  const objectStateRef = useRef({
    x: 0.3,
    y: 0.5,
    radius: 0.06,
    isHeldBy: null, // 'Right', 'Left', or null
    initialX: 0.3,
    initialY: 0.5
  });

  const targetGoalRef = useRef({ x: 0.5, y: 0.7, radius: 0.1 });
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const hitsRef = useRef(0);
  const errorsRef = useRef(0);

  const startGame = () => {
    setGameState('playing');
    setCurrentStepIdx(0);
    setScore(0);
    setErrors(0);
    setElapsedTime(0);
    hitsRef.current = 0;
    errorsRef.current = 0;

    objectStateRef.current = {
      x: 0.3,
      y: 0.5,
      radius: 0.06,
      isHeldBy: null,
      initialX: 0.3,
      initialY: 0.5
    };

    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  };

  const finishGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const totalTime = (Date.now() - startTimeRef.current) / 1000;

    const totalSteps = sequenceSteps.length;
    const accuracy = calculateAccuracy(totalSteps, totalSteps + errorsRef.current);
    const coordScore = calculateCoordinationScore({
      accuracy,
      errors: errorsRef.current,
      timeSeconds: totalTime,
      targetTimeSeconds: 25
    });

    const finalMetrics = {
      gameName: 'Sequence Challenge 🧩',
      accuracy,
      timeSeconds: totalTime,
      errors: errorsRef.current,
      coordinationScore: coordScore
    };

    setMetrics(finalMetrics);
    setGameState('result');
    sound.playSuccess();
  };

  const advanceStep = () => {
    sound.playPop();
    setScore(prev => prev + 150);
    if (currentStepIdx + 1 >= sequenceSteps.length) {
      finishGame();
    } else {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  // Render loop
  const handleRenderFrame = (ctx, width, height) => {
    if (gameState !== 'playing') return;

    const currentStep = sequenceSteps[currentStepIdx];
    const obj = objectStateRef.current;
    const goal = targetGoalRef.current;

    // 1. Draw Gold Target Goal for final step
    const gx = goal.x * width;
    const gy = goal.y * height;
    const gr = goal.radius * width;

    ctx.save();
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fillStyle = currentStepIdx === 4 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
    ctx.lineWidth = currentStepIdx === 4 ? 4 : 2;
    ctx.strokeStyle = currentStepIdx === 4 ? '#f59e0b' : '#6b7280';
    ctx.stroke();

    ctx.font = 'bold 15px "Fredoka", sans-serif';
    ctx.fillStyle = currentStepIdx === 4 ? '#f59e0b' : '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText('TARGET 🎯', gx, gy + 5);
    ctx.restore();

    // 2. State Machine Logic based on hand tracking
    const trackingData = trackingDataRef.current;
    if (trackingData && trackingData.hands) {
      let rightHand = trackingData.hands.find(h => h.handedness === 'Right');
      let leftHand = trackingData.hands.find(h => h.handedness === 'Left');

      // Update held object coordinates
      if (obj.isHeldBy === 'Right' && rightHand && rightHand.isPinching && rightHand.pinchMidpoint) {
        obj.x = rightHand.pinchMidpoint.x;
        obj.y = rightHand.pinchMidpoint.y;
      } else if (obj.isHeldBy === 'Left' && leftHand && leftHand.isPinching && leftHand.pinchMidpoint) {
        obj.x = leftHand.pinchMidpoint.x;
        obj.y = leftHand.pinchMidpoint.y;
      } else if (obj.isHeldBy) {
        // Pinch lost mid sequence check
        if (currentStepIdx < 4) {
          // Keep object at current position unless dropped during drop step
        }
      }

      // Evaluate Current Step Completion Criteria:
      if (currentStepIdx === 0) {
        // STEP 1: Grab with Right Hand
        if (rightHand && rightHand.isPinching && rightHand.pinchMidpoint) {
          const dist = getDistance(rightHand.pinchMidpoint, { x: obj.x, y: obj.y });
          if (dist < 0.12) {
            obj.isHeldBy = 'Right';
            advanceStep();
          }
        }
      } else if (currentStepIdx === 1) {
        // STEP 2: Move to Right side of screen (x > 0.65)
        if (obj.x >= 0.65) {
          advanceStep();
        }
      } else if (currentStepIdx === 2) {
        // STEP 3: Transfer to Left hand
        if (rightHand && leftHand && rightHand.pinchMidpoint && leftHand.pinchMidpoint) {
          const distHands = getDistance(rightHand.pinchMidpoint, leftHand.pinchMidpoint);
          if (distHands < 0.14 && leftHand.isPinching) {
            obj.isHeldBy = 'Left';
            sound.playTransfer();
            advanceStep();
          }
        }
      } else if (currentStepIdx === 3) {
        // STEP 4: Move Upward (y < 0.3)
        if (obj.y <= 0.3) {
          advanceStep();
        }
      } else if (currentStepIdx === 4) {
        // STEP 5: Drop inside Target Goal
        const distGoal = getDistance({ x: obj.x, y: obj.y }, goal);
        // Check if released pinch inside goal
        const currentHeldHand = obj.isHeldBy === 'Right' ? rightHand : leftHand;
        if (currentHeldHand && !currentHeldHand.isPinching && distGoal <= goal.radius) {
          obj.isHeldBy = null;
          advanceStep();
        }
      }
    }

    // 3. Draw Ball Object
    const bx = obj.x * width;
    const by = obj.y * height;
    const br = obj.radius * width;

    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.font = `${Math.round(br * 1.2)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚽', bx, by);
    ctx.restore();
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const activeStep = sequenceSteps[currentStepIdx];

  return (
    <div className="game-container">
      <Header
        gameTitle="Sequence Challenge"
        elapsedTime={elapsedTime}
        score={score}
        errors={errors}
        difficulty={difficulty}
        onHomeClick={onHome}
      />

      <div className="game-workspace">
        <CameraView videoRef={videoRef} />
        <GameCanvas trackingDataRef={trackingDataRef} onRenderFrame={handleRenderFrame} />

        {gameState === 'playing' && (
          <div className="game-hud">
            <div className="hud-progress">
              STEP <strong>{currentStepIdx + 1}</strong> OF {sequenceSteps.length}
            </div>

            <div className="hud-instruction highlight">
              {activeStep.instruction}
            </div>

            <div className="sequence-stepper">
              {sequenceSteps.map((step, sIdx) => (
                <div
                  key={step.id}
                  className={`stepper-dot ${sIdx === currentStepIdx ? 'active' : sIdx < currentStepIdx ? 'done' : ''}`}
                  title={step.title}
                >
                  {sIdx < currentStepIdx ? '✓' : sIdx + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'instructions' && (
          <Instructions
            title="Sequence Challenge 🧩"
            emoji="🧩"
            steps={[
              "A 5-step motor planning sequence will be given.",
              "Follow each instruction step-by-step in exact order.",
              "Complete all steps to test your movement planning precision!"
            ]}
            onStart={startGame}
          />
        )}

        {gameState === 'result' && (
          <ResultScreen
            metrics={metrics}
            onPlayAgain={startGame}
            onNextChallenge={onNextGame}
            onHome={onHome}
          />
        )}
      </div>
    </div>
  );
}

