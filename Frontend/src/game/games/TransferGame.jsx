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

export default function TransferGame({ videoRef, difficulty = 'Medium', onHome, onNextGame, onExitToLanding }) {
  const { isLoaded, isTracking, handCount, trackingDataRef } = useHandTracking(videoRef, { numHands: 2 });

  const [gameState, setGameState] = useState('instructions');
  const [roundIndex, setRoundIndex] = useState(0);
  const [totalRounds] = useState(difficulty === 'Easy' ? 3 : difficulty === 'Hard' ? 5 : 4);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transferStep, setTransferStep] = useState(1); // 1: Pick up with Start Hand, 2: Transfer to Target Hand, 3: Deliver to Goal
  const [stepPrompt, setStepPrompt] = useState('');
  const [metrics, setMetrics] = useState(null);

  // Transfer round config (alternates between Right->Left and Left->Right)
  const transferConfigRef = useRef({
    startHand: 'Right', // 'Right' or 'Left'
    targetHand: 'Left',
    object: { x: 0.25, y: 0.4, radius: 0.05, emoji: '🔮', isHeldBy: null },
    goal: { x: 0.8, y: 0.6, radius: 0.1 }
  });

  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const hitsRef = useRef(0);
  const errorsRef = useRef(0);
  const transfersSuccessRef = useRef(0);

  const initRound = (rIdx) => {
    const isRightStart = rIdx % 2 === 0;
    const startHand = isRightStart ? 'Right' : 'Left';
    const targetHand = isRightStart ? 'Left' : 'Right';

    const objX = isRightStart ? 0.25 : 0.75;
    const goalX = isRightStart ? 0.85 : 0.15;

    transferConfigRef.current = {
      startHand,
      targetHand,
      object: { x: objX, y: 0.45, radius: 0.055, emoji: '🔮', isHeldBy: null },
      goal: { x: goalX, y: 0.65, radius: 0.09 }
    };

    setTransferStep(1);
    setStepPrompt(`Step 1: Pick up the orb using your ${startHand.toUpperCase()} hand ✋`);
  };

  const startGame = () => {
    setGameState('playing');
    setRoundIndex(0);
    setScore(0);
    setErrors(0);
    setElapsedTime(0);
    hitsRef.current = 0;
    errorsRef.current = 0;
    transfersSuccessRef.current = 0;

    initRound(0);

    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  };

  const finishGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const totalTime = (Date.now() - startTimeRef.current) / 1000;

    const transferSuccessPct = Math.round((transfersSuccessRef.current / totalRounds) * 100);
    const accuracy = calculateAccuracy(hitsRef.current, totalRounds);
    const coordScore = calculateCoordinationScore({
      accuracy,
      errors: errorsRef.current,
      timeSeconds: totalTime,
      targetTimeSeconds: totalRounds * 6,
      handTransfersSuccess: transferSuccessPct
    });

    const finalMetrics = {
      gameName: 'Hand Transfer Challenge 🔄',
      accuracy,
      timeSeconds: totalTime,
      errors: errorsRef.current,
      coordinationScore: coordScore
    };

    setMetrics(finalMetrics);
    setGameState('result');
    sound.playSuccess();
  };

  // Render loop
  const handleRenderFrame = (ctx, width, height) => {
    if (gameState !== 'playing') return;

    const config = transferConfigRef.current;
    const obj = config.object;
    const goal = config.goal;

    // 1. Draw Target Goal Zone
    const gx = goal.x * width;
    const gy = goal.y * height;
    const gr = goal.radius * width;

    ctx.save();
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(234, 159, 14, 0.18)';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = '#EA9F0E';
    ctx.stroke();

    ctx.font = 'bold 15px "Montserrat", sans-serif';
    ctx.fillStyle = '#EA9F0E';
    ctx.textAlign = 'center';
    ctx.fillText(`TARGET ZONE 🎯`, gx, gy + 5);
    ctx.restore();

    // 2. Process Hand Tracking for Pickup, Transfer, and Drop
    const trackingData = trackingDataRef.current;
    if (trackingData && trackingData.hands) {
      let startHandObj = null;
      let targetHandObj = null;

      trackingData.hands.forEach(h => {
        if (h.handedness === config.startHand) startHandObj = h;
        if (h.handedness === config.targetHand) targetHandObj = h;
      });

      // STEP 1: Pickup object with Start Hand
      if (transferStep === 1) {
        if (startHandObj && startHandObj.isPinching && startHandObj.pinchMidpoint) {
          const distToObj = getDistance(startHandObj.pinchMidpoint, { x: obj.x, y: obj.y });
          if (distToObj < 0.12) {
            obj.isHeldBy = config.startHand;
            setTransferStep(2);
            sound.playGrab();
            setStepPrompt(`Step 2: Transfer orb to your ${config.targetHand.toUpperCase()} hand! 🤝`);
          }
        }

        // Check if user accidentally grabbed with wrong hand
        if (targetHandObj && targetHandObj.isPinching && targetHandObj.pinchMidpoint) {
          const distWrong = getDistance(targetHandObj.pinchMidpoint, { x: obj.x, y: obj.y });
          if (distWrong < 0.1) {
            sound.playError();
            errorsRef.current += 1;
            setErrors(errorsRef.current);
            setStepPrompt(`Wrong hand! Use your ${config.startHand.toUpperCase()} hand 🤚`);
          }
        }
      }

      // If held by start hand, stick object to start hand pinch position
      if (obj.isHeldBy === config.startHand) {
        if (startHandObj && startHandObj.isPinching && startHandObj.pinchMidpoint) {
          obj.x = startHandObj.pinchMidpoint.x;
          obj.y = startHandObj.pinchMidpoint.y;

          // STEP 2: Detect Transfer when Target Hand pinches close by
          if (targetHandObj && targetHandObj.pinchMidpoint) {
            const distBetweenHands = getDistance(startHandObj.pinchMidpoint, targetHandObj.pinchMidpoint);

            // Draw connecting transfer prompt line between hands when close
            if (distBetweenHands < 0.25) {
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(startHandObj.pinchMidpoint.x * width, startHandObj.pinchMidpoint.y * height);
              ctx.lineTo(targetHandObj.pinchMidpoint.x * width, targetHandObj.pinchMidpoint.y * height);
              ctx.lineWidth = 4;
              ctx.strokeStyle = '#f59e0b';
              ctx.setLineDash([6, 4]);
              ctx.stroke();
              ctx.restore();
            }

            if (distBetweenHands < 0.14 && targetHandObj.isPinching) {
              // Successful Transfer!
              obj.isHeldBy = config.targetHand;
              transfersSuccessRef.current += 1;
              setTransferStep(3);
              sound.playTransfer();
              setStepPrompt(`Step 3: Drop orb inside the TARGET ZONE 🎯`);
            }
          }
        } else {
          // Dropped object before transfer
          obj.isHeldBy = null;
          sound.playError();
          errorsRef.current += 1;
          setErrors(errorsRef.current);
          setTransferStep(1);
          setStepPrompt(`Dropped orb! Pick it up with your ${config.startHand.toUpperCase()} hand again!`);
        }
      }

      // STEP 3: Held by Target Hand, deliver to Goal Target
      if (obj.isHeldBy === config.targetHand) {
        if (targetHandObj && targetHandObj.isPinching && targetHandObj.pinchMidpoint) {
          obj.x = targetHandObj.pinchMidpoint.x;
          obj.y = targetHandObj.pinchMidpoint.y;
        } else {
          // Released! Check if inside Goal
          const distToGoal = getDistance({ x: obj.x, y: obj.y }, goal);
          if (distToGoal <= goal.radius) {
            // Round Complete!
            sound.playPop();
            hitsRef.current += 1;
            setScore(prev => prev + 200);

            if (roundIndex + 1 >= totalRounds) {
              finishGame();
            } else {
              const nextR = roundIndex + 1;
              setRoundIndex(nextR);
              initRound(nextR);
            }
          } else {
            // Dropped outside goal
            obj.isHeldBy = null;
            sound.playError();
            errorsRef.current += 1;
            setErrors(errorsRef.current);
            setTransferStep(1);
            setStepPrompt(`Oops! Drop it inside the Target Zone! Try again.`);
          }
        }
      }
    }

    // 3. Draw Orb Object
    const ox = obj.x * width;
    const oy = obj.y * height;
    const or = obj.radius * width;

    ctx.save();
    ctx.beginPath();
    ctx.arc(ox, oy, or, 0, Math.PI * 2);
    ctx.fillStyle = obj.isHeldBy ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = obj.isHeldBy ? '#a855f7' : '#f59e0b';
    ctx.stroke();

    ctx.font = `${Math.round(or * 1.3)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obj.emoji, ox, oy);
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
        gameTitle="Hand Transfer"
        elapsedTime={elapsedTime}
        score={score}
        errors={errors}
        difficulty={difficulty}
        onHomeClick={onHome}
        onExitToLanding={onExitToLanding}
      />

      <div className="game-workspace">
        <CameraView videoRef={videoRef} />
        <GameCanvas trackingDataRef={trackingDataRef} onRenderFrame={handleRenderFrame} />

        {gameState === 'playing' && (
          <div className="game-hud">
            <div className="hud-progress">
              Mission <strong>{roundIndex + 1}</strong> / {totalRounds}
            </div>

            <div className="hud-instruction highlight">
              {stepPrompt}
            </div>

            {handCount < 2 && (
              <div className="hud-warning">
                ⚠️ Raise <strong>BOTH HANDS</strong> into view for transfer!
              </div>
            )}
          </div>
        )}

        {gameState === 'instructions' && (
          <Instructions
            title="Hand Transfer Challenge 🔄"
            emoji="🔄"
            steps={[
              "Grab the virtual orb with your designated starting hand.",
              "Bring both hands together and TRANSFER the orb to your other hand.",
              "Move to the target zone and release the orb to complete the mission!"
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

