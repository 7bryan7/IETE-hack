import React, { useEffect, useRef, useState } from 'react';
import CameraView from '../components/Camera';
import GameCanvas from '../components/GameCanvas';
import Header from '../components/Header';
import Instructions from '../components/Instructions';
import ResultScreen from '../components/ResultScreen';
import { useHandTracking } from '../hooks/useHandTracking';
import { getDistance, isPinching } from '../utils/gestures';
import { calculateAccuracy, calculateCoordinationScore } from '../utils/scoring';
import { sound } from '../utils/sound';

const OBJECT_TYPES = [
  { type: 'star', emoji: '⭐', label: 'Golden Star', color: '#f59e0b' },
  { type: 'ball', emoji: '⚽', label: 'Soccer Ball', color: '#38bdf8' },
  { type: 'fruit', emoji: '🍓', label: 'Strawberry', color: '#ef4444' },
  { type: 'bubble', emoji: '🫧', label: 'Magic Bubble', color: '#a855f7' }
];

export default function CatchGame({ videoRef, difficulty = 'Medium', onHome, onNextGame }) {
  const { isLoaded, isTracking, trackingDataRef } = useHandTracking(videoRef);

  const [gameState, setGameState] = useState('instructions');
  const [objectIndex, setObjectIndex] = useState(0);
  const [totalObjects] = useState(difficulty === 'Easy' ? 4 : difficulty === 'Hard' ? 7 : 5);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [metrics, setMetrics] = useState(null);

  // Active object state stored in ref for 60fps canvas loop
  const currentObjRef = useRef({
    x: 0.3,
    y: 0.4,
    vx: 0.002,
    vy: 0.0015,
    radius: 0.06,
    isCaught: false,
    caughtByHand: null,
    item: OBJECT_TYPES[0]
  });

  const dropZoneRef = useRef({ x: 0.8, y: 0.8, radius: 0.12 });
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const attemptsRef = useRef(0);

  const speedMultiplier = difficulty === 'Easy' ? 0.7 : difficulty === 'Hard' ? 1.4 : 1.0;

  const spawnNextObject = (idx) => {
    const item = OBJECT_TYPES[idx % OBJECT_TYPES.length];
    const margin = 0.25;
    const startX = margin + Math.random() * (0.5 - margin);
    const startY = margin + Math.random() * (0.5 - margin);

    const vx = (Math.random() > 0.5 ? 1 : -1) * (0.001 + Math.random() * 0.0015) * speedMultiplier;
    const vy = (Math.random() > 0.5 ? 1 : -1) * (0.001 + Math.random() * 0.0015) * speedMultiplier;

    currentObjRef.current = {
      x: startX,
      y: startY,
      vx,
      vy,
      radius: 0.06,
      isCaught: false,
      caughtByHand: null,
      item
    };
  };

  const startGame = () => {
    setGameState('playing');
    setObjectIndex(0);
    setScore(0);
    setErrors(0);
    setElapsedTime(0);
    hitsRef.current = 0;
    missesRef.current = 0;
    attemptsRef.current = 0;

    spawnNextObject(0);

    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  };

  const finishGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const totalTime = (Date.now() - startTimeRef.current) / 1000;

    const total = attemptsRef.current > 0 ? attemptsRef.current : totalObjects;
    const accuracy = calculateAccuracy(hitsRef.current, total);
    const coordScore = calculateCoordinationScore({
      accuracy,
      errors: missesRef.current,
      timeSeconds: totalTime,
      targetTimeSeconds: totalObjects * 4
    });

    const finalMetrics = {
      gameName: 'Catch Challenge 🖐️',
      accuracy,
      timeSeconds: totalTime,
      errors: missesRef.current,
      coordinationScore: coordScore
    };

    setMetrics(finalMetrics);
    setGameState('result');
    sound.playSuccess();
  };

  // Render loop
  const handleRenderFrame = (ctx, width, height) => {
    if (gameState !== 'playing') return;

    const obj = currentObjRef.current;
    const dropZone = dropZoneRef.current;

    // Update object motion if not caught
    if (!obj.isCaught) {
      obj.x += obj.vx;
      obj.y += obj.vy;

      // Bounce off screen boundaries
      if (obj.x - obj.radius < 0.1 || obj.x + obj.radius > 0.9) obj.vx *= -1;
      if (obj.y - obj.radius < 0.1 || obj.y + obj.radius > 0.8) obj.vy *= -1;
    }

    // 1. Draw Target Drop Zone Collector (Basket at bottom right)
    const dzX = dropZone.x * width;
    const dzY = dropZone.y * height;
    const dzR = dropZone.radius * width;

    ctx.save();
    ctx.beginPath();
    ctx.arc(dzX, dzY, dzR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#10b981';
    ctx.stroke();

    ctx.font = 'bold 16px "Fredoka", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'center';
    ctx.fillText('DROP ZONE 🧺', dzX, dzY + 5);
    ctx.restore();

    // 2. Process Hand Tracking for Pinch Catch & Drop
    const trackingData = trackingDataRef.current;
    if (trackingData && trackingData.hands) {
      trackingData.hands.forEach(hand => {
        const { isPinching, pinchMidpoint, handedness } = hand;

        if (pinchMidpoint) {
          const distToObj = getDistance(pinchMidpoint, { x: obj.x, y: obj.y });

          // Pinch Catch trigger
          if (isPinching && !obj.isCaught && distToObj < 0.12) {
            obj.isCaught = true;
            obj.caughtByHand = handedness;
            sound.playGrab();
            setFeedbackMsg(`CAUGHT ${obj.item.label}! Now drag to Drop Zone 🧺`);
          }

          // If caught, attach object to pinch midpoint
          if (obj.isCaught && obj.caughtByHand === handedness) {
            if (isPinching) {
              obj.x = pinchMidpoint.x;
              obj.y = pinchMidpoint.y;
            } else {
              // Released pinch! Check if dropped inside drop zone
              const distToDrop = getDistance(pinchMidpoint, dropZone);
              if (distToDrop <= dropZone.radius) {
                // Successful Catch & Drop!
                sound.playPop();
                hitsRef.current += 1;
                attemptsRef.current += 1;
                setScore(prev => prev + 150);

                if (objectIndex + 1 >= totalObjects) {
                  finishGame();
                } else {
                  const nextIdx = objectIndex + 1;
                  setObjectIndex(nextIdx);
                  spawnNextObject(nextIdx);
                }
              } else {
                // Dropped outside target - error
                sound.playError();
                missesRef.current += 1;
                attemptsRef.current += 1;
                setErrors(missesRef.current);
                setFeedbackMsg('Oops! Drop it inside the green Drop Zone 🧺');
                obj.isCaught = false;
              }
            }
          }
        }
      });
    }

    // 3. Draw Object
    const ox = obj.x * width;
    const oy = obj.y * height;
    const or = obj.radius * width;

    ctx.save();
    ctx.beginPath();
    ctx.arc(ox, oy, or, 0, Math.PI * 2);
    ctx.fillStyle = obj.isCaught ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    ctx.lineWidth = obj.isCaught ? 4 : 2;
    ctx.strokeStyle = obj.item.color;
    ctx.stroke();

    // Draw Emoji inside object
    ctx.font = `${Math.round(or * 1.2)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obj.item.emoji, ox, oy);
    ctx.restore();
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="game-container">
      <Header
        gameTitle="Catch Challenge"
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
              Object <strong>{objectIndex + 1}</strong> / {totalObjects}
            </div>

            <div className="hud-instruction">
              Pinch 🤏 to <strong>CATCH</strong> the floating {currentObjRef.current.item.emoji}, then drop in 🧺
            </div>

            {feedbackMsg && (
              <div className="hud-feedback">
                {feedbackMsg}
              </div>
            )}
          </div>
        )}

        {gameState === 'instructions' && (
          <Instructions
            title="Catch Challenge 🖐️"
            emoji="🖐️"
            steps={[
              "Virtual objects (stars, balls, fruits) float on screen.",
              "PINCH your thumb & index finger to catch the object.",
              "Drag the object and DROP inside the green Drop Zone!"
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

