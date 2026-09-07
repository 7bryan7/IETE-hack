export const forestLevels = [
  { id: 1, title: 'Explore the Forest', area: 'Forest Entrance', icon: '🧭', instruction: 'Raise both hands and explore the forest', detail: 'Move your hands left and right. Look at each of the three glowing trail markers.', total: 3 },
  { id: 2, title: 'Find the Glowing Object', area: 'Crystal Grove', icon: '💎', instruction: 'Explore the forest and find the glowing crystal', detail: 'Look near the rocks on the left. Lower one hand and point at the crystal.', total: 1 },
  { id: 3, title: 'Grab and Place', area: 'Forest Clearing', icon: '✨', instruction: 'Pick up the forest crystal and place it in the glowing circle', detail: 'Point, pinch, and carry. Open your fingers over the golden circle to place it.', total: 1 },
  { id: 4, title: 'Forest Quest', area: 'River Crossing', icon: '🍃', instruction: 'Raise both hands to explore', detail: 'Explore, find the magical leaf, then carry it to the woodland shrine.', total: 5 },
  { id: 5, title: 'Firefly Hunt', area: 'Firefly Clearing', icon: '🌟', instruction: 'Catch the dancing fireflies', detail: 'Move your hand close to a glowing firefly. When it shines bright, pinch to catch it!', total: 6 },
  { id: 6, title: 'Magic Fruit Harvest', area: 'Magic Orchard', icon: '🍎', instruction: 'Collect 3 blue fruits into the basket', detail: 'Find the glowing blue fruits on the tree branches. Pinch to pick and place them in the basket.', total: 3 },
  { id: 7, title: 'Repair the Bridge', area: 'River Bridge', icon: '🪵', instruction: 'Carry wooden planks to repair the river bridge', detail: 'Pinch a wooden plank, carry it across to the river, and drop it into the glowing slot.', total: 3 },
  { id: 8, title: 'River Memory Stones', area: 'Memory Stones', icon: '🔮', instruction: 'Watch the stones glow, then touch them in order', detail: 'Memorize the musical stone sequence and touch each stone in the same pattern.', total: 3 },
  { id: 9, title: 'Ancient Magic Gate', area: 'Ancient Ruins', icon: '🏛️', instruction: 'Place both hands into the magic runes to open the gate', detail: 'Raise both hands into the left and right glyphs together. Hold steady to charge the gate!', total: 100 },
  { id: 10, title: 'Guide the Butterfly', area: 'Butterfly Garden', icon: '🦋', instruction: 'Guide the magical butterfly through the floral rings', detail: 'The butterfly follows your fingertip. Lead it smoothly through each floating ring to the sacred flower.', total: 5 },
  { id: 11, title: 'Energy Orb Challenge', area: 'Woodland Shrine', icon: '⚡', instruction: 'Balance both hands around the floating orb', detail: 'Hold your left and right hands balanced on both sides of the orb to channel its energy.', total: 100 },
  { id: 12, title: 'Restore the Magic Tree', area: 'Grand Magic Tree', icon: '🌳', instruction: 'Awaken the Grand Magic Tree and restore the forest', detail: 'Navigate to the Magic Tree, place the Star Crystal in the shrine, and raise both hands to channel the forest bloom!', total: 6 },
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

// Level 5 — Firefly Hunt configurations (6 fireflies)
export const FIREFLY_CONFIGS = [
  { id: 'ff_1', initialPos: [-2.2, 1.8, 1.2], color: '#fef08a', speed: 0.7, pattern: 'horizontal' },
  { id: 'ff_2', initialPos: [2.0, 2.1, 0.6], color: '#a7f3d0', speed: 0.85, pattern: 'vertical' },
  { id: 'ff_3', initialPos: [-0.6, 1.6, 2.2], color: '#fbcfe8', speed: 0.75, pattern: 'gentle' },
  { id: 'ff_4', initialPos: [3.0, 1.9, -0.8], color: '#fed7aa', speed: 0.65, pattern: 'horizontal' },
  { id: 'ff_5', initialPos: [-3.4, 2.2, -0.4], color: '#bae6fd', speed: 0.8, pattern: 'vertical' },
  { id: 'ff_6', initialPos: [0.6, 2.3, 0.2], color: '#fde047', speed: 0.9, pattern: 'gentle' },
];

// Level 6 — Magic Fruit Harvest configurations
export const FRUIT_DEFINITIONS = [
  { id: 'fruit_blue_1', color: '#38bdf8', isTarget: true, position: [-6.2, 2.6, -0.6], label: 'Blue Fruit' },
  { id: 'fruit_blue_2', color: '#38bdf8', isTarget: true, position: [-5.8, 3.2, -0.4], label: 'Blue Fruit' },
  { id: 'fruit_blue_3', color: '#38bdf8', isTarget: true, position: [-6.9, 2.8, -1.0], label: 'Blue Fruit' },
  { id: 'fruit_red_1', color: '#f87171', isTarget: false, position: [-6.4, 3.4, -1.3], label: 'Red Fruit' },
  { id: 'fruit_green_1', color: '#4ade80', isTarget: false, position: [-5.5, 2.3, -0.9], label: 'Green Fruit' },
  { id: 'fruit_yellow_1', color: '#facc15', isTarget: false, position: [-6.6, 2.1, -0.3], label: 'Yellow Fruit' },
];
export const BASKET_POSITION = [-4.0, 0.45, 0.2];

// Level 7 — Repair the Bridge configurations
export const BRIDGE_PLANK_DEFINITIONS = [
  { id: 'plank_1', initialPos: [-2.2, 0.2, -3.8], targetPos: [-0.6, 0.38, -6.0], label: 'Plank 1' },
  { id: 'plank_2', initialPos: [2.5, 0.2, -4.2], targetPos: [0.0, 0.42, -6.0], label: 'Plank 2' },
  { id: 'plank_3', initialPos: [-1.8, 0.2, -3.2], targetPos: [0.6, 0.38, -6.0], label: 'Plank 3' },
];

// Level 8 — River Memory Stones configurations
export const MEMORY_STONE_DEFINITIONS = [
  { id: 'stone_0', name: 'Sun Stone', position: [-2.0, 0.22, -5.6], color: '#fde047', rune: '☀️' },
  { id: 'stone_1', name: 'Wave Stone', position: [-0.7, 0.24, -5.7], color: '#38bdf8', rune: '🌊' },
  { id: 'stone_2', name: 'Leaf Stone', position: [0.7, 0.24, -5.7], color: '#4ade80', rune: '🍃' },
  { id: 'stone_3', name: 'Star Stone', position: [2.0, 0.22, -5.6], color: '#c084fc', rune: '⭐' },
];
export const MEMORY_ROUNDS = [
  [0, 2, 1],          // Round 1: 3 stones
  [1, 3, 0, 2],       // Round 2: 4 stones
  [3, 0, 2, 1],       // Round 3: 4 stones
];

// Level 9 — Ancient Magic Gate configurations
export const GATE_POSITION = [7.0, 1.8, -4.5];
export const GATE_ZONES = {
  left: { x: 0.35, y: 0.50, radius: 0.15 },
  right: { x: 0.65, y: 0.50, radius: 0.15 },
};

// Level 10 — Guide the Butterfly configurations
export const BUTTERFLY_START = [0.0, 1.8, 2.0];
export const BUTTERFLY_RINGS = [
  { id: 'ring_1', position: [-1.2, 1.9, 0.8], radius: 0.75 },
  { id: 'ring_2', position: [-2.5, 2.1, -1.2], radius: 0.75 },
  { id: 'ring_3', position: [-1.6, 2.3, -3.5], radius: 0.75 },
  { id: 'ring_4', position: [-3.4, 2.0, -5.6], radius: 0.75 },
  { id: 'ring_5', position: [-4.6, 1.8, -7.5], radius: 0.75 },
];
export const BUTTERFLY_FLOWER = [-5.2, 0.8, -8.6];

// Level 11 — Energy Orb Challenge configurations
export const ENERGY_ORB_POSITION = [-5.5, 2.2, -8.8];

// Level 12 — Restore the Magic Tree configurations
export const STAR_CRYSTAL_POS = [0, 1.2, -10.0];
export const TREE_SHRINE_POS = [0, 1.0, -14.2];

export { FOREST_LANDMARKS, ADVENTURE_QUESTS } from './forestAdventure.js';

