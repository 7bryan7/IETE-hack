export const difficultyConfig = {
  Easy: { radius: 68, speed: 45, pathWidth: 100, sequenceLength: 3, holdMs: 300, dualHoldMs: 500 },
  Medium: { radius: 56, speed: 65, pathWidth: 80, sequenceLength: 4, holdMs: 400, dualHoldMs: 650 },
  Hard: { radius: 46, speed: 85, pathWidth: 64, sequenceLength: 5, holdMs: 500, dualHoldMs: 800 },
};
export const levels = [
  ['Touch & Reach', 'Point into five glowing targets. No pinch needed.', 'Reach', 5],
  ['Left or Right', 'Use the requested hand to touch each target.', 'Choose', 8],
  ['Catch the Star', 'Move close, then pinch to catch six drifting stars.', 'Catch', 6],
  ['Pick & Place', 'Pinch, move, then release inside the target.', 'Control', 5],
  ['Hand Transfer', 'Pass the crystal between your hands, then place it.', 'Transfer', 4],
  ['Two Hands Together', 'Hold both fingertips in their matching targets.', 'Coordinate', 5],
  ['Follow the Path', 'Follow four trails from start to finish.', 'Follow', 4],
  ['Remember & Move', 'Remember the targets and hands, then repeat the sequence.', 'Remember', 3],
  ['Dual Motion', 'Follow two moving targets for 18 seconds.', 'Track', 18],
  ['Motion Quest', 'Help Nova collect the Energy Crystal!', 'Quest', 6],
].map(([name, description, skill, rounds], i) => ({ id: i + 1, name, description, skill, rounds }));
