/**
 * Performance metrics & scoring engine for MotionForge
 * NOTE: These are game performance metrics ONLY, NOT medical diagnostic metrics.
 */

export function calculateAccuracy(successfulActions, totalAttempts) {
  if (!totalAttempts || totalAttempts <= 0) return 100;
  const accuracy = (successfulActions / totalAttempts) * 100;
  return Math.min(100, Math.max(0, Math.round(accuracy)));
}

/**
 * Calculates game coordination score (0 - 100)
 * Factors:
 * - Accuracy percentage (weight: 45%)
 * - Error count penalty (weight: 35%)
 * - Time performance bonus/penalty (weight: 20%)
 */
export function calculateCoordinationScore({
  accuracy = 100,
  errors = 0,
  timeSeconds = 10,
  targetTimeSeconds = 15,
  handTransfersSuccess = 100
}) {
  // Base component from accuracy
  const accScore = accuracy * 0.45;

  // Hand transfer component
  const transferScore = handTransfersSuccess * 0.20;

  // Errors penalty: each error deducts 7 points up to max 35 points
  const errorPenalty = Math.min(35, errors * 7);
  const errorScore = Math.max(0, 35 - errorPenalty);

  // Time bonus/penalty: ratio of target time vs actual time
  let timeScore = 20;
  if (timeSeconds > targetTimeSeconds) {
    const overtimeRatio = (timeSeconds - targetTimeSeconds) / targetTimeSeconds;
    timeScore = Math.max(0, 20 - (overtimeRatio * 15));
  } else {
    // Slight bonus for faster smooth completion
    const speedRatio = (targetTimeSeconds - timeSeconds) / targetTimeSeconds;
    timeScore = Math.min(25, 20 + (speedRatio * 5));
  }

  const rawScore = accScore + transferScore + errorScore + timeScore;
  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return finalScore;
}

export function getPerformanceCategory(score) {
  if (score >= 80) {
    return {
      label: 'Excellent',
      stars: 5,
      color: '#10b981', // emerald
      message: 'Outstanding hand-eye coordination & control! 🏆',
      bg: 'rgba(16, 185, 129, 0.15)'
    };
  } else if (score >= 60) {
    return {
      label: 'Good',
      stars: 4,
      color: '#3b82f6', // blue
      message: 'Great job! Strong control and smooth movements! ⭐',
      bg: 'rgba(59, 130, 246, 0.15)'
    };
  } else if (score >= 40) {
    return {
      label: 'Developing',
      stars: 3,
      color: '#f59e0b', // amber
      message: 'Nice effort! Practice makes your movements steady! 👍',
      bg: 'rgba(245, 158, 11, 0.15)'
    };
  } else {
    return {
      label: 'Keep Practicing',
      stars: 2,
      color: '#ec4899', // pink
      message: 'Keep going! Try moving steadily and carefully! 💪',
      bg: 'rgba(236, 72, 153, 0.15)'
    };
  }
}

