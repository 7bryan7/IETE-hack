import React, { useEffect, useRef } from 'react';
import { drawTrail } from '../utils/movement';
import { DEBUG_HAND_TRACKING } from '../hooks/useHandTracking';

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
        drawTrail(ctx, trailPoints, width, height, 'rgba(2, 174, 144, 0.8)');
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
          const primaryColor = isRight ? '#02AE90' : '#FF7673'; // Mint for Right hand, Coral for Left hand
          const primaryGlow = isRight ? 'rgba(2, 174, 144, 0.55)' : 'rgba(255, 118, 115, 0.55)';
          const accentColor = isPinching ? '#EA9F0E' : '#02AE90'; // Amber if pinching, Mint if open

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

      // 4. Development/Debug Overlay
      if (DEBUG_HAND_TRACKING && trackingData && trackingData.hands && trackingData.hands.length > 0) {
        let boxY = 16;
        trackingData.hands.forEach(hand => {
          const {
            handedness,
            rawHandedness,
            handednessScore,
            pinchRatio,
            trackingStatus
          } = hand;

          ctx.save();
          ctx.fillStyle = 'rgba(11, 16, 29, 0.85)';
          ctx.strokeStyle = handedness === 'Right' ? '#38bdf8' : '#c084fc';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 6;
          ctx.roundRect(16, boxY, 210, 120, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = handedness === 'Right' ? '#38bdf8' : '#c084fc';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(`${handedness.toUpperCase()} HAND`, 26, boxY + 20);

          ctx.fillStyle = '#cbd5e1';
          ctx.font = '12px monospace';
          ctx.fillText(`Raw: ${rawHandedness || 'N/A'}`, 26, boxY + 38);
          ctx.fillText(`Normalized: ${handedness}`, 26, boxY + 56);
          ctx.fillText(`Confidence: ${handednessScore !== undefined ? (handednessScore * 100).toFixed(0) + '%' : '100%'}`, 26, boxY + 74);
          ctx.fillText(`Pinch: ${pinchRatio !== undefined ? pinchRatio.toFixed(2) : 'N/A'}`, 26, boxY + 92);
          ctx.fillText(`Tracking: ${trackingStatus || 'Stable'}`, 26, boxY + 110);
          ctx.restore();

          boxY += 130;
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
