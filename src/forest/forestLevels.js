export const forestLevels = [
  { title: 'Explore the Forest', instruction: 'Raise both hands and explore the forest', detail: 'Move your hands left and right. Look at each of the three glowing trail markers.', total: 3 },
  { title: 'Find the Glowing Object', instruction: 'Explore the forest and find the glowing crystal', detail: 'Look near the rocks on the left. Lower one hand and point at the crystal.', total: 1 },
  { title: 'Grab and Place', instruction: 'Pick up the forest crystal and place it in the glowing circle', detail: 'Point, pinch, and carry. Open your fingers over the golden circle to place it.', total: 1 },
  { title: 'Forest Quest', instruction: 'Raise both hands to explore', detail: 'Explore, find the magical leaf, then carry it to the woodland shrine.', total: 5 },
];

export const checkpoints = [
  { id: 'fern', name: 'Fern grove', position: [-6, 1.8, -2] },
  { id: 'brook', name: 'Quiet brook', position: [0, 1.8, -5] },
  { id: 'sun', name: 'Sunlit trees', position: [6, 1.8, -2] },
];
export const objectDefinitions = [
  { id: 'crystal', position: [-4, 1.5, 0], target: [2.6, 0.25, 0], color: '#94f8ff' },
  { id: 'leaf', position: [4.5, 1.5, -3], target: [-1.6, 0.25, -3], color: '#dcfa80' },
];
