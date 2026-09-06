import React, { useEffect, useRef } from 'react';
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
  trailPoints = []
}) {
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
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
        drawTrail(ctx, trailPoints, width, height, 'rgba(56, 189, 248, 0.7)');
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
          const primaryColor = isRight ? '#38bdf8' : '#a855f7'; // Cyan for Right, Purple for Left
          const accentColor = isPinching ? '#f59e0b' : '#10b981'; // Amber if pinching, Emerald if open

          // Draw skeleton lines
          ctx.lineWidth = 3;
          ctx.strokeStyle = primaryColor;

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

          // Draw landmark dots
          landmarks.forEach((pt, idx) => {
            const px = pt.x * width;
            const py = pt.y * height;
            const isFingertip = [4, 8, 12, 16, 20].includes(idx);
            const isIndexTip = idx === 8;
            const isThumbTip = idx === 4;

            ctx.beginPath();
            ctx.arc(px, py, isIndexTip || isThumbTip ? 7 : (isFingertip ? 5 : 3.5), 0, Math.PI * 2);
            ctx.fillStyle = isIndexTip ? accentColor : primaryColor;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
          });

          // Draw Pinch Visual Feedback between Thumb & Index Tip
          if (thumbTip && indexTip) {
            const midX = (thumbTip.x + indexTip.x) * 0.5 * width;
            const midY = (thumbTip.y + indexTip.y) * 0.5 * height;

            if (isPinching) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(midX, midY, 18, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
              ctx.fill();
              ctx.lineWidth = 3;
              ctx.strokeStyle = '#f59e0b';
              ctx.stroke();

              // Pinch text indicator
              ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              ctx.fillText('GRABBED 🖐️', midX, midY - 24);
              ctx.restore();
            }
          }

          // Draw Hand Badge Label (Left / Right) near Wrist (landmark 0)
          const wrist = landmarks[0];
          if (wrist) {
            const wx = wrist.x * width;
            const wy = Math.min(height - 20, wrist.y * height + 28);

            ctx.save();
            ctx.font = 'bold 14px "Fredoka", sans-serif';
            const labelText = `${handedness.toUpperCase()} HAND`;
            const textWidth = ctx.measureText(labelText).width;

            ctx.fillStyle = isRight ? 'rgba(56, 189, 248, 0.85)' : 'rgba(168, 85, 247, 0.85)';
            ctx.roundRect(wx - textWidth / 2 - 8, wy - 14, textWidth + 16, 22, 10);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labelText, wx, wy - 3);
            ctx.restore();
          }
        });
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [trackingDataRef, onRenderFrame, showSkeleton, trailPoints]);

  return (
    <canvas ref={canvasRef} className="game-canvas" />
  );
}

