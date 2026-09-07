import React, { useEffect, useRef, useState } from 'react';
import CameraView from '../components/Camera';
import GameCanvas from '../components/GameCanvas';
import Header from '../components/Header';
import Instructions from '../components/Instructions';
import ResultScreen from '../components/ResultScreen';
import { useHandTracking } from '../hooks/useHandTracking';
import { isPointInCirclePx } from '../utils/collision';
import { calculateAccuracy, calculateCoordinationScore } from '../utils/scoring';
import { TrailTracker } from '../utils/movement';
import { sound } from '../utils/sound';

export default function ReachGame({ videoRef, difficulty = 'Medium', onHome, onNextGame, onExitToLanding }) {
  const { isLoaded, isTracking, trackingDataRef } = useHandTracking(videoRef);

  const [gameState, setGameState] = useState('instructions'); // instructions, playing, result
  const [targetIndex, setTargetIndex] = useState(0);
  const [totalTargets] = useState(difficulty === 'Easy' ? 5 : difficulty === 'Hard' ? 8 : 6);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [metrics, setMetrics] = useState(null);

  // Target coordinates stored as normalized ratios (0.15 to 0.85)
  const targetRef = useRef({ x: 0.5, y: 0.5, radiusPx: 40 });
  const trailTrackerRef = useRef(new TrailTracker(20));
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const attemptsRef = useRef(0);
  const errorsRef = useRef(0);
  const hitsRef = useRef(0);

  // Difficulty configurations
  const radiusMap = { Easy: 50, Medium: 38, Hard: 28 };
  const targetRadiusPx = radiusMap[difficulty] || 38;

  // Generate random target position avoiding extreme edges
  const generateNewTarget = () => {
    const margin = 0.2;
    const newX = margin + Math.random() * (1 - 2 * margin);
    const newY = margin + Math.random() * (1 - 2 * margin);
    targetRef.current = { x: newX, y: newY, radiusPx: targetRadiusPx };
  };

  const startGame = () => {
    setGameState('playing');
    setTargetIndex(0);
    setScore(0);
    setErrors(0);
    setElapsedTime(0);
    attemptsRef.current = 0;
    errorsRef.current = 0;
    hitsRef.current = 0;

    generateNewTarget();

    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  };

  const finishGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const totalTime = (Date.now() - startTimeRef.current) / 1000;

    const totalAttempts = attemptsRef.current > 0 ? attemptsRef.current : totalTargets;
    const accuracy = calculateAccuracy(hitsRef.current, totalAttempts);
    const coordScore = calculateCoordinationScore({
      accuracy,
      errors: errorsRef.current,
      timeSeconds: totalTime,
      targetTimeSeconds: totalTargets * 2.5
    });

    const finalMetrics = {
      gameName: 'Reach Challenge 🎯',
      accuracy,
      timeSeconds: totalTime,
      errors: errorsRef.current,
      coordinationScore: coordScore
    };

    setMetrics(finalMetrics);
    setGameState('result');
    sound.playSuccess();
  };

  // Canvas render frame callback
  const handleRenderFrame = (ctx, width, height) => {
    if (gameState !== 'playing') return;

    const target = targetRef.current;
    const tx = target.x * width;
    const ty = target.y * height;
    const r = target.radiusPx;

    // Draw glowing pulsing target circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(tx, ty, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Target bullseye inner ring
    ctx.beginPath();
    ctx.arc(tx, ty, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Check hand fingertip collision with target
    const trackingData = trackingDataRef.current;
    if (trackingData && trackingData.hands) {
      trackingData.hands.forEach(hand => {
        const indexTip = hand.indexTip;
        if (indexTip) {
          const ix = indexTip.x * width;
          const iy = indexTip.y * height;

          trailTrackerRef.current.addPoint(indexTip.x, indexTip.y, hand.handedness);

          // Test collision
          if (isPointInCirclePx(ix, iy, tx, ty, r)) {
            sound.playPop();
            hitsRef.current += 1;
            attemptsRef.current += 1;

            const newScore = hitsRef.current * 100;
            setScore(newScore);

            const msgs = ['Awesome! 🎯', 'Great Reach! ⭐', 'Bullseye! ⚡', 'Nice Job! 🚀'];
            setFeedbackMsg(msgs[Math.floor(Math.random() * msgs.length)]);

            if (targetIndex + 1 >= totalTargets) {
              finishGame();
            } else {
              setTargetIndex(prev => prev + 1);
              generateNewTarget();
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="game-container">
      <Header
        gameTitle="Reach Challenge"
        elapsedTime={elapsedTime}
        score={score}
        errors={errors}
        difficulty={difficulty}
        onHomeClick={onHome}
        onExitToLanding={onExitToLanding}
      />

      <div className="game-workspace">
        <CameraView videoRef={videoRef} />
        <GameCanvas
          trackingDataRef={trackingDataRef}
          onRenderFrame={handleRenderFrame}
          trailPoints={trailTrackerRef.current.getPoints()}
        />

        {/* Progress & Instruction HUD */}
        {gameState === 'playing' && (
          <div className="game-hud">
            <div className="hud-progress">
              Target <strong>{targetIndex + 1}</strong> / {totalTargets}
            </div>

            <div className="hud-instruction">
              Reach your <strong>INDEX FINGER</strong> into the blue target circle!
            </div>

            {feedbackMsg && (
              <div className="hud-feedback animate-bounce">
                {feedbackMsg}
              </div>
            )}
          </div>
        )}

        {/* Instructions Overlay */}
        {gameState === 'instructions' && (
          <Instructions
            title="Reach Challenge 🎯"
            emoji="🎯"
            steps={[
              "Circular targets will appear on screen.",
              "Reach your INDEX FINGER into the target circle.",
              "Complete all targets as fast and accurately as possible!"
            ]}
            onStart={startGame}
          />
        )}

        {/* Result Screen */}
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

