// Pure-logic adventure quest and discovery engine for Forest World.
// No React, Three.js, or MediaPipe dependencies - fully testable in Node.

export const FOREST_LANDMARKS = [
  { id: 'crystal_grove', name: 'Crystal Grove', area: 'Crystal Grove', position: [-6.5, 1.5, 0], icon: '💎', hint: 'Look to the left near the glowing blue crystals.' },
  { id: 'waterfall', name: 'Quiet Brook & Waterfall', area: 'River Crossing', position: [0, 2.0, -6.5], icon: '🌊', hint: 'Look straight ahead towards the rushing woodland brook.' },
  { id: 'stone_ruins', name: 'Ancient Stone Ruins', area: 'Ancient Ruins', position: [7.0, 1.8, -4.5], icon: '🏛️', hint: 'Look to the right across the clearing toward the weathered pillars.' },
  { id: 'forest_shrine', name: 'Woodland Shrine', area: 'Forest Shrine', position: [-5.5, 1.5, -9.0], icon: '⛩️', hint: 'Peer deeper into the woods past the brook to spot the sacred shrine.' },
  { id: 'magic_tree', name: 'Grand Magic Tree', area: 'Magic Tree', position: [0, 3.5, -16.0], icon: '🌳', hint: 'Gaze into the distance at the enormous ancient tree.' },
];

export const ADVENTURE_QUESTS = [
  {
    id: 'quest_explorer',
    title: 'Forest Explorer',
    description: 'Explore the woods and discover all 5 magical landmarks.',
    type: 'DISCOVERY',
    targetCount: 5,
    rewardStars: 5,
    nextQuest: 'quest_fireflies',
  },
  {
    id: 'quest_fireflies',
    title: 'Firefly Catch',
    description: 'Catch glowing fireflies dancing in the clearing.',
    type: 'COLLECTION',
    targetCount: 5,
    rewardStars: 3,
    nextQuest: 'quest_fruits',
  },
  {
    id: 'quest_fruits',
    title: 'Magic Fruit Harvest',
    description: 'Harvest the ripe magical fruits from the trees.',
    type: 'INTERACTION',
    targetCount: 3,
    rewardStars: 4,
    nextQuest: 'quest_bridge',
  },
  {
    id: 'quest_bridge',
    title: 'Repair the Bridge',
    description: 'Gather fallen bridge planks to cross the river safely.',
    type: 'BUILDING',
    targetCount: 3,
    rewardStars: 5,
    nextQuest: 'quest_tree',
  },
  {
    id: 'quest_tree',
    title: 'Restore the Magic Tree',
    description: 'Channel woodland energy to awaken the Grand Magic Tree.',
    type: 'STORY',
    targetCount: 1,
    rewardStars: 10,
    nextQuest: null,
  },
];

export function createAdventureState() {
  return {
    discovered: [],
    discoveryDwell: {},
    stars: 0,
    activeQuestIndex: 0,
    questProgress: 0,
    newlyDiscovered: null,
    discoveryTimer: 0,
    novaMood: 'cheerful', // 'cheerful' | 'excited' | 'thinking' | 'celebrating'
    novaMessage: 'Welcome to the Whispering Woods! I am Nova, your forest guide. Raise both hands to look around!',
    treeEnergy: 0, // 0 - 100%
    worldState: {
      bridgeRepaired: false,
      gateOpen: false,
      plantsBloomed: false,
      treeRestored: false,
    },
  };
}

export function updateAdventure(state, input, deltaMs) {
  if (!state) return;
  const ms = Math.max(0, Math.min(deltaMs, 250));

  // Clear one-shot discovery announcement after 3 seconds
  if (state.discoveryTimer && state.discoveryTimer > 0) {
    state.discoveryTimer -= ms;
    if (state.discoveryTimer <= 0) {
      state.newlyDiscovered = null;
    }
  }

  // 1. Process Landmark Gaze Discovery
  const landmarkProjections = input.projections?.landmarks || {};
  for (const landmark of FOREST_LANDMARKS) {
    if (state.discovered.includes(landmark.id)) continue;

    const proj = landmarkProjections[landmark.id];
    // Check if player is looking roughly towards the landmark (within central screen reticle region)
    const isLooking = proj && proj.visible && Math.abs(proj.x - 0.5) < 0.24 && Math.abs(proj.y - 0.5) < 0.32;

    if (isLooking) {
      state.discoveryDwell[landmark.id] = (state.discoveryDwell[landmark.id] || 0) + ms;
      if (state.discoveryDwell[landmark.id] >= 400) {
        state.discovered.push(landmark.id);
        state.stars += 1;
        state.newlyDiscovered = landmark;
        state.discoveryTimer = 3200;
        state.novaMood = 'excited';
        state.novaMessage = `New place discovered! ✨ You found ${landmark.name}!`;

        // Check explorer quest progress
        const currentQuest = ADVENTURE_QUESTS[state.activeQuestIndex];
        if (currentQuest && currentQuest.id === 'quest_explorer') {
          state.questProgress = state.discovered.length;
          if (state.discovered.length >= currentQuest.targetCount) {
            state.stars += currentQuest.rewardStars;
            state.novaMood = 'celebrating';
            state.novaMessage = 'Incredible! You have explored the entire Whispering Woods! ⭐';
          }
        }
      }
    } else {
      state.discoveryDwell[landmark.id] = Math.max(0, (state.discoveryDwell[landmark.id] || 0) - ms * 0.5);
    }
  }
}

export function getClosestUndiscovered(state, yaw = 0) {
  const remaining = FOREST_LANDMARKS.filter(l => !state.discovered.includes(l.id));
  if (!remaining.length) return null;

  return remaining.map(l => {
    const dx = l.position[0];
    const dz = l.position[2] - 12;
    const targetAngle = Math.atan2(-dx, -dz);
    const angleDiff = targetAngle - yaw;
    const distance = Math.hypot(l.position[0], l.position[2] - 12);
    return {
      ...l,
      angleDiff,
      distance: Math.round(distance),
      direction: angleDiff < -0.2 ? 'left' : angleDiff > 0.2 ? 'right' : 'forward',
    };
  }).sort((a, b) => a.distance - b.distance)[0];
}
