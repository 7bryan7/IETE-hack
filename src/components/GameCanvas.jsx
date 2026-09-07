import React, { useEffect, useRef } from 'react';
import { DEBUG_HAND_TRACKING } from '../tracking/config.js';
import { drawTrail } from '../utils/movement';

// MediaPipe hand landmark skeleton connections
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],   // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
];

export default function GameCanvas({
  trackingDataRef,
  onRenderFrame,
  showSkeleton = true,
  showDebug = DEBUG_HAND_TRACKING,
  trailPoints = []
}) {
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);
  const framePulseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      framePulseRef.current = (framePulseRef.current + 0.05) % (Math.PI * 2);

      // Auto-resize canvas to match displayed size
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw fingertip trails
      if (trailPoints && trailPoints.length > 0) {
        drawTrail(ctx, trailPoints, width, height, 'rgba(56, 189, 248, 0.75)');
      }

      // 2. Custom Game Elements Render Callback (targets, balls, drop zones, step prompts)
      if (onRenderFrame) {
        onRenderFrame(ctx, width, height);
      }

      // 3. Draw Hand Landmarks & Skeleton Overlays
      const trackingData = trackingDataRef?.current;
      if (showSkeleton && trackingData && trackingData.hands) {
        trackingData.hands.forEach(hand => {
          const { landmarks, handedness, isPinching, indexTip, thumbTip } = hand;
          const isRight = handedness === 'Right';
          const primaryColor = isRight ? '#38bdf8' : '#c084fc'; // Cyan for Right hand, Purple for Left hand
          const primaryGlow = isRight ? 'rgba(56, 189, 248, 0.5)' : 'rgba(192, 132, 252, 0.5)';
          const accentColor = isPinching ? '#fbbf24' : '#34d399'; // Amber if pinching, Emerald if open

          // Draw skeleton lines with glow effect
          ctx.save();
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = primaryColor;
          ctx.shadowColor = primaryGlow;
          ctx.shadowBlur = 10;

          HAND_CONNECTIONS.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            if (p1 && p2) {
              ctx.beginPath();
              ctx.moveTo(p1.x * width, p1.y * height);
              ctx.lineTo(p2.x * width, p2.y * height);
              ctx.stroke();
            }
          });
          ctx.restore();

          // Draw landmark dots
          landmarks.forEach((pt, idx) => {
            const px = pt.x * width;
            const py = pt.y * height;
            const isFingertip = [4, 8, 12, 16, 20].includes(idx);
            const isIndexTip = idx === 8;
            const isThumbTip = idx === 4;

            ctx.save();
            ctx.beginPath();
            const radius = isIndexTip || isThumbTip ? 8 : (isFingertip ? 6 : 4);
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fillStyle = isIndexTip ? accentColor : primaryColor;
            ctx.shadowColor = isIndexTip ? accentColor : primaryColor;
            ctx.shadowBlur = isIndexTip ? 12 : 6;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
            ctx.restore();

            // Pulsing target halo around Index Fingertip
            if (isIndexTip) {
              const haloRadius = 14 + Math.sin(framePulseRef.current * 2) * 3;
              ctx.save();
              ctx.beginPath();
              ctx.arc(px, py, haloRadius, 0, Math.PI * 2);
              ctx.strokeStyle = accentColor;
              ctx.lineWidth = 2;
              ctx.globalAlpha = 0.6;
              ctx.stroke();
              ctx.restore();
            }
          });

          // Draw Pinch Visual Feedback between Thumb & Index Tip
          if (thumbTip && indexTip) {
            const midX = (thumbTip.x + indexTip.x) * 0.5 * width;
            const midY = (thumbTip.y + indexTip.y) * 0.5 * height;

            if (isPinching) {
              ctx.save();
              // Outer pulsing glow circle
              const pulseRadius = 22 + Math.sin(framePulseRef.current * 3) * 3;
              ctx.beginPath();
              ctx.arc(midX, midY, pulseRadius, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
              ctx.fill();
              ctx.lineWidth = 3;
              ctx.strokeStyle = '#fbbf24';
              ctx.shadowColor = '#fbbf24';
              ctx.shadowBlur = 15;
              ctx.stroke();

              // Pinch text indicator badge
              ctx.font = 'bold 13px "Fredoka", sans-serif';
              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
              ctx.shadowBlur = 4;
              ctx.fillText('GRABBED 🖐️', midX, midY - 30);
              ctx.restore();
            }
          }

          // Draw Hand Badge Label (Left / Right) near Wrist (landmark 0)
          const wrist = landmarks[0];
          if (wrist) {
            const wx = wrist.x * width;
            const wy = Math.min(height - 24, wrist.y * height + 32);

            ctx.save();
            ctx.font = 'bold 14px "Fredoka", sans-serif';
            const labelText = `${handedness.toUpperCase()} HAND`;
            const textWidth = ctx.measureText(labelText).width;

            ctx.fillStyle = isRight ? 'rgba(56, 189, 248, 0.9)' : 'rgba(192, 132, 252, 0.9)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 8;
            ctx.roundRect(wx - textWidth / 2 - 10, wy - 14, textWidth + 20, 24, 12);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labelText, wx, wy - 2);
            ctx.restore();
          }
        });
      }

      if (showDebug) {
        const debugHands = trackingData?.debugHands || [];
        const lines = debugHands.length ? debugHands.flatMap(hand => [
          `Physical Hand: ${hand.handedness || 'Pending'}`,
          `Raw: ${hand.rawHandedness || 'Unknown'} | Normalized: ${hand.normalizedHandedness || 'Unknown'}`,
          `Confidence: ${hand.handednessConfidence.toFixed(2)} | Pinch: ${Number.isFinite(hand.pinchRatio) ? hand.pinchRatio.toFixed(2) : '--'}`,
          `Tracking: ${hand.trackingStatus}`,
        ]) : [trackingData?.status || 'Tracking: No hands'];
        ctx.save();
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(8, 8, Math.min(340, width - 16), lines.length * 17 + 12);
        ctx.fillStyle = '#ffffff';
        lines.forEach((line, i) => ctx.fillText(line, 14, 14 + i * 17));
        ctx.restore();
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [trackingDataRef, onRenderFrame, showSkeleton, showDebug, trailPoints]);

  return (
    <canvas ref={canvasRef} className="game-canvas" />
  );
}
