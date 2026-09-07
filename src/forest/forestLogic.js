import {
  forestLevels,
  checkpoints,
  objectDefinitions,
  FIREFLY_CONFIGS,
  FRUIT_DEFINITIONS,
  BASKET_POSITION,
  BRIDGE_PLANK_DEFINITIONS,
  MEMORY_STONE_DEFINITIONS,
  MEMORY_ROUNDS,
  GATE_ZONES,
  BUTTERFLY_RINGS,
  BUTTERFLY_START,
  BUTTERFLY_FLOWER,
  STAR_CRYSTAL_POS,
  TREE_SHRINE_POS,
} from './forestLevels.js';
import { updateNavigation, clamp } from './worldControls.js';
import { createAdventureState, updateAdventure } from './forestAdventure.js';

export function createForestRun(level = 1, worldState = null) {
  const baseObjects = Object.fromEntries(objectDefinitions.map(o => [o.id, [...o.position]]));

  // Initialize level-specific objects
  if (level === 6) {
    FRUIT_DEFINITIONS.forEach(f => { baseObjects[f.id] = [...f.position]; });
  } else if (level === 7) {
    BRIDGE_PLANK_DEFINITIONS.forEach(p => { baseObjects[p.id] = [...p.initialPos]; });
  } else if (level === 12) {
    baseObjects.star_crystal = [...STAR_CRYSTAL_POS];
  }

  return {
    level,
    status: 'intro',
    elapsed: 0,
    progress: 0,
    stage: 0,
    navigationMs: 0,
    control: { yaw: 0, tilt: 0, vx: 0, vy: 0, anchor: null, active: false },
    viewed: [],
    dwell: {},
    left: 0,
    right: 0,
    hover: null,
    held: null,
    lostMs: 0,
    armed: {},
    objects: baseObjects,
    placed: [],
    attempts: 0,
    feedback: '',
    feedbackUntil: 0,
    pointers: [],
    adventure: createAdventureState(level, worldState),
    stars: 0,

    // Level 5 specific: Fireflies
    firefliesCaught: [],

    // Level 6 specific: Fruits
    harvestedFruits: [],
    wrongFruitAttempts: 0,

    // Level 7 specific: Bridge Planks
    repairedPlanks: [],

    // Level 8 specific: Memory Stones
    memoryRound: 0,
    memoryPhase: 'preview', // 'preview' | 'input'
    previewTimer: 0,
    previewIndex: 0,
    activePreviewStone: null,
    inputSequence: [],
    lastTouchedStone: null,

    // Level 9 specific: Magic Gate
    gateCharge: 0,

    // Level 10 specific: Butterfly
    butterflyPos: [...BUTTERFLY_START],
    ringsPassed: [],

    // Level 11 specific: Energy Orb
    orbCharge: 0,

    // Level 12 specific: Restore Magic Tree
    treeCharge: 0,
  };
}

export const near = (a, b, radius, aspect = 1) =>
  !!a && !!b && b.visible !== false && Math.hypot((a.x - b.x) * aspect, a.y - b.y) < radius;

export function forestInstruction(s, mouse = false) {
  if (s.level === 1 && mouse) return 'Use the arrow keys and look at all three trail markers';
  if (s.level === 4) {
    const steps = [
      mouse ? 'Use the arrow keys to explore' : 'Raise both hands to explore',
      'Find and point at the magical leaf',
      mouse ? 'Click and hold the magical leaf' : 'Pinch to pick up the magical leaf',
      'Carry the leaf to the golden shrine',
      'Release the leaf over the shrine',
    ];
    return steps[s.stage] || forestLevels[3].instruction;
  }
  if (s.level === 5) return mouse ? 'Click to catch dancing fireflies' : 'Move hand near a firefly and pinch to catch it';
  if (s.level === 6) return mouse ? 'Drag the blue fruits into the basket' : 'Pinch a blue fruit and drop it in the basket';
  if (s.level === 7) return mouse ? 'Drag the planks to the bridge' : 'Pinch each plank and repair the broken bridge';
  if (s.level === 8) return s.memoryPhase === 'preview' ? 'Watch the stones glow in order…' : 'Touch the glowing stones in the same sequence';
  if (s.level === 9) return mouse ? 'Click and hold to power the ancient gate runes' : 'Hold both hands inside the magic runes to open the gate';
  if (s.level === 10) return mouse ? 'Move mouse to guide the butterfly through the rings' : 'Move your fingertip to guide the butterfly through the rings';
  if (s.level === 11) return mouse ? 'Click and hold to balance energy into the floating orb' : 'Hold both hands on each side of the orb to balance energy';
  if (s.level === 12) {
    const steps = [
      mouse ? 'Use arrow keys to look towards the Magic Tree' : 'Raise both hands and look at the Magic Tree',
      'Point at the Star Crystal near the altar',
      mouse ? 'Click and hold the Star Crystal' : 'Pinch to pick up the Star Crystal',
      'Carry the Star Crystal towards the Tree Shrine',
      'Release the crystal into the Tree Shrine',
      mouse ? 'Click and hold to channel forest energy into the tree' : 'Raise both hands high to channel energy into the tree!',
    ];
    return steps[s.stage] || forestLevels[11].instruction;
  }
  return forestLevels[s.level - 1]?.instruction || 'Explore the forest';
}

function feedback(s, text) {
  s.feedback = text;
  s.feedbackUntil = s.elapsed + 2400;
}

function finish(s, text) {
  s.status = 'complete';
  s.control.active = false;
  s.progress = forestLevels[s.level - 1]?.total || 1;
  feedback(s, text);
}

export function pauseForest(s) {
  s.control.active = false;
  s.control.anchor = null;
  s.control.vx = 0;
  s.control.vy = 0;
  if (s.held && s.level === 4 && s.status === 'playing') {
    s.stage = 2;
    s.progress = 2;
  }
  s.held = null;
  s.armed = {};
  s.hover = null;
  s.pointers = [];
}

export function stepForest(s, input, deltaMs) {
  if (s.status !== 'playing' || input.paused) {
    pauseForest(s);
    return;
  }
  const ms = clamp(deltaMs, 0, 250);
  const dt = Math.min(ms, 50) / 1000;
  const pointers = input.pointers || [];
  s.pointers = pointers;
  const movement = updateNavigation(s.control, pointers, input.keyboard, dt, !!s.held);

  if (!pointers.length && !input.keyboard) {
    s.hover = null;
  } else {
    s.elapsed += ms;
  }

  if (s.control.active) {
    s.navigationMs += ms;
    s.left += Math.max(0, -movement);
    s.right += Math.max(0, movement);
  }

  // ============================================================
  // LEVEL 1: Explore the Forest (3 Trail Markers)
  // ============================================================
  if (s.level === 1) {
    if (s.navigationMs > 100) {
      for (const [id, point] of Object.entries(input.checkpoints || {})) {
        const viewing = point.visible && Math.abs(point.x - 0.5) < 0.13 && Math.abs(point.y - 0.5) < 0.28;
        s.dwell[id] = viewing && (pointers.length || input.keyboard) ? (s.dwell[id] || 0) + ms : 0;
        if (s.dwell[id] >= 450 && !s.viewed.includes(id)) {
          s.viewed.push(id);
          feedback(s, 'Trail marker discovered!');
        }
      }
    }
    s.progress = s.viewed.length;
    if (s.viewed.length === 3 && s.left > 0.12 && s.right > 0.12) {
      finish(s, 'Great job! You explored the forest.');
    }
  }

  // ============================================================
  // LEVEL 2 & 4: Discovery stages
  // ============================================================
  if (s.level === 4 && s.stage === 0 && s.navigationMs >= 600 && s.left + s.right > 0.08) {
    s.stage = 1;
    s.progress = 1;
  }

  const objectId = s.level === 4 ? 'leaf' : 'crystal';
  const eligibleLegacy = s.level >= 2 && s.level <= 4 && (s.level !== 4 || s.stage > 0);
  const candidatesLegacy = pointers.filter(p => near(p, input.objects?.[objectId], 0.115, input.aspect));

  if (s.level <= 4) {
    s.hover = eligibleLegacy && candidatesLegacy.length && !s.placed.includes(objectId) ? objectId : null;
    if (s.level === 2 && s.hover) finish(s, 'Crystal found!');
    if (s.level === 4 && s.stage === 1 && s.hover) {
      s.stage = 2;
      s.progress = 2;
      feedback(s, 'You found the magical leaf!');
    }
  }

  // ============================================================
  // LEVEL 5: Firefly Hunt (Catch 6 fireflies)
  // ============================================================
  if (s.level === 5) {
    const fireflyProjections = input.fireflies || {};
    let hoveredFf = null;
    for (const ff of FIREFLY_CONFIGS) {
      if (s.firefliesCaught.includes(ff.id)) continue;
      const proj = fireflyProjections[ff.id];
      const pNear = pointers.find(p => near(p, proj, 0.14, input.aspect));
      if (pNear) {
        hoveredFf = ff.id;
        if (pNear.pinch && s.armed[pNear.id]) {
          s.firefliesCaught.push(ff.id);
          s.progress = s.firefliesCaught.length;
          s.stars += 1;
          if (s.adventure) s.adventure.stars += 1;
          feedback(s, `Firefly caught! ✨ (${s.progress}/6)`);
          if (s.progress >= 6) {
            finish(s, 'All 6 fireflies caught! Beautiful work! 🌟');
          }
          break;
        }
      }
    }
    s.hover = hoveredFf;
  }

  // ============================================================
  // LEVEL 6: Magic Fruit Harvest (3 blue fruits into basket)
  // ============================================================
  if (s.level === 6) {
    const fruitProjections = input.fruits || {};
    const basketProj = input.basket;

    if (!s.held) {
      let hoveredFruit = null;
      for (const fruit of FRUIT_DEFINITIONS) {
        if (s.placed.includes(fruit.id)) continue;
        const proj = fruitProjections[fruit.id];
        const grabber = pointers.find(p => near(p, proj, 0.13, input.aspect));
        if (grabber) {
          hoveredFruit = fruit.id;
          if (grabber.pinch && s.armed[grabber.id]) {
            s.held = { objectId: fruit.id, handId: grabber.id };
            s.lostMs = 0;
            feedback(s, `Carrying ${fruit.label}! Drop it in the basket.`);
            break;
          }
        }
      }
      s.hover = hoveredFruit;
    } else if (s.held && FRUIT_DEFINITIONS.some(f => f.id === s.held.objectId)) {
      const fruitId = s.held.objectId;
      const fruitDef = FRUIT_DEFINITIONS.find(f => f.id === fruitId);
      const holder = pointers.find(p => p.id === s.held.handId);

      if (!holder) {
        s.lostMs += ms;
        if (s.lostMs > 200) {
          s.held = null;
          s.objects[fruitId] = [...fruitDef.position];
          feedback(s, 'Fruit returned to branch. Try again!');
        }
      } else {
        s.lostMs = 0;
        const dest = input.dragPoint?.(holder, fruitId);
        if (holder.pinch && dest?.every(Number.isFinite)) {
          const pos = s.objects[fruitId];
          const alpha = 1 - Math.exp(-14 * dt);
          for (let i = 0; i < 3; i++) pos[i] += (dest[i] - pos[i]) * alpha;
        }
        if (!holder.pinch) {
          if (near(holder, basketProj, 0.20, input.aspect)) {
            if (fruitDef.isTarget) {
              s.placed.push(fruitId);
              s.harvestedFruits.push(fruitId);
              s.progress = s.harvestedFruits.length;
              s.stars += 1;
              s.objects[fruitId] = [BASKET_POSITION[0] + (s.progress - 2) * 0.25, BASKET_POSITION[1] + 0.4, BASKET_POSITION[2]];
              feedback(s, `Blue fruit collected! 🍎 (${s.progress}/3)`);
              if (s.progress >= 3) {
                finish(s, 'Magic fruit harvest complete! ⭐');
              }
            } else {
              s.objects[fruitId] = [...fruitDef.position];
              s.wrongFruitAttempts++;
              feedback(s, 'Try another fruit! Look for the blue one.');
              if (s.adventure) s.adventure.novaMessage = 'Try another fruit! Nova loves the blue ones.';
            }
          } else {
            s.objects[fruitId] = [...fruitDef.position];
            feedback(s, 'Drop the fruit into the wooden basket.');
          }
          s.held = null;
        }
      }
    }
  }

  // ============================================================
  // LEVEL 7: Repair the Bridge (3 bridge planks)
  // ============================================================
  if (s.level === 7) {
    const plankProjections = input.planks || {};
    const bridgeSlotProjections = input.bridgeSlots || {};

    if (!s.held) {
      let hoveredPlank = null;
      for (const plank of BRIDGE_PLANK_DEFINITIONS) {
        if (s.placed.includes(plank.id)) continue;
        const proj = plankProjections[plank.id];
        const grabber = pointers.find(p => near(p, proj, 0.14, input.aspect));
        if (grabber) {
          hoveredPlank = plank.id;
          if (grabber.pinch && s.armed[grabber.id]) {
            s.held = { objectId: plank.id, handId: grabber.id };
            s.lostMs = 0;
            feedback(s, 'Plank picked up! Carry it to the bridge gap.');
            break;
          }
        }
      }
      s.hover = hoveredPlank;
    } else if (s.held && BRIDGE_PLANK_DEFINITIONS.some(p => p.id === s.held.objectId)) {
      const plankId = s.held.objectId;
      const plankDef = BRIDGE_PLANK_DEFINITIONS.find(p => p.id === plankId);
      const holder = pointers.find(p => p.id === s.held.handId);

      if (!holder) {
        s.lostMs += ms;
        if (s.lostMs > 200) {
          s.held = null;
          s.objects[plankId] = [...plankDef.initialPos];
          feedback(s, 'Plank waiting on the riverbank.');
        }
      } else {
        s.lostMs = 0;
        const dest = input.dragPoint?.(holder, plankId);
        if (holder.pinch && dest?.every(Number.isFinite)) {
          const pos = s.objects[plankId];
          const alpha = 1 - Math.exp(-14 * dt);
          for (let i = 0; i < 3; i++) pos[i] += (dest[i] - pos[i]) * alpha;
        }
        if (!holder.pinch) {
          const slotProj = bridgeSlotProjections[plankId];
          if (near(holder, slotProj, 0.22, input.aspect)) {
            s.placed.push(plankId);
            s.repairedPlanks.push(plankId);
            s.progress = s.repairedPlanks.length;
            s.stars += 1;
            s.objects[plankId] = [...plankDef.targetPos];
            feedback(s, `Plank secured! 🪵 (${s.progress}/3)`);
            if (s.progress >= 3) {
              if (s.adventure) s.adventure.worldState.bridgeRepaired = true;
              finish(s, 'BRIDGE RESTORED ✨ The river crossing is open!');
            }
          } else {
            feedback(s, 'Drop the plank over the glowing bridge gap.');
          }
          s.held = null;
        }
      }
    }
  }

  // ============================================================
  // LEVEL 8: River Memory Stones (3 sequential rounds)
  // ============================================================
  if (s.level === 8) {
    const targetSeq = MEMORY_ROUNDS[s.memoryRound] || MEMORY_ROUNDS[0];
    const stoneProjections = input.stones || {};

    if (s.memoryPhase === 'preview') {
      s.previewTimer += ms;
      const stepDuration = 700;
      const idx = Math.floor(s.previewTimer / stepDuration);
      if (idx < targetSeq.length) {
        s.activePreviewStone = targetSeq[idx];
      } else {
        s.memoryPhase = 'input';
        s.previewTimer = 0;
        s.activePreviewStone = null;
        s.inputSequence = [];
        feedback(s, 'Your turn! Touch the stones in order.');
      }
    } else if (s.memoryPhase === 'input') {
      let hoveredStone = null;
      for (let i = 0; i < MEMORY_STONE_DEFINITIONS.length; i++) {
        const stone = MEMORY_STONE_DEFINITIONS[i];
        const proj = stoneProjections[stone.id];
        const pNear = pointers.find(p => near(p, proj, 0.15, input.aspect));
        if (pNear) {
          hoveredStone = stone.id;
          const isTouch = pNear.pinch || s.dwell[stone.id] > 300 || pNear.id === 'mouse';
          if (isTouch && s.lastTouchedStone !== i && s.armed[pNear.id]) {
            s.lastTouchedStone = i;
            s.inputSequence.push(i);
            const expected = targetSeq[s.inputSequence.length - 1];

            if (i === expected) {
              feedback(s, `Harmonic chime! 🎵 (${s.inputSequence.length}/${targetSeq.length})`);
              if (s.inputSequence.length === targetSeq.length) {
                s.memoryRound++;
                s.progress = s.memoryRound;
                s.stars += 2;
                if (s.memoryRound >= MEMORY_ROUNDS.length) {
                  finish(s, 'River Memory Stones aligned! Pure harmony! 🔮');
                } else {
                  s.memoryPhase = 'preview';
                  s.previewTimer = 0;
                  s.inputSequence = [];
                  s.lastTouchedStone = null;
                  feedback(s, `Round complete! Watch Round ${s.memoryRound + 1}...`);
                }
              }
            } else {
              feedback(s, 'Almost! Watch the sequence again.');
              s.memoryPhase = 'preview';
              s.previewTimer = 0;
              s.inputSequence = [];
              s.lastTouchedStone = null;
            }
            break;
          }
        }
      }
      s.hover = hoveredStone;
      if (!pointers.some(p => near(p, stoneProjections[MEMORY_STONE_DEFINITIONS[s.lastTouchedStone]?.id], 0.15, input.aspect))) {
        s.lastTouchedStone = null;
      }
    }
  }

  // ============================================================
  // LEVEL 9: Ancient Magic Gate (Dual hands hold & charge)
  // ============================================================
  if (s.level === 9) {
    const leftInZone = pointers.some(p => (p.id === 'left' || p.x < 0.5) && near(p, GATE_ZONES.left, GATE_ZONES.left.radius, input.aspect));
    const rightInZone = pointers.some(p => (p.id === 'right' || p.x >= 0.5) && near(p, GATE_ZONES.right, GATE_ZONES.right.radius, input.aspect));
    const mouseHold = pointers.some(p => p.id === 'mouse' && p.pinch);

    const isCharging = (leftInZone && rightInZone) || mouseHold;

    if (isCharging) {
      s.gateCharge = Math.min(100, s.gateCharge + dt * 65);
      s.progress = Math.round(s.gateCharge);
      if (s.gateCharge >= 100) {
        if (s.adventure) s.adventure.worldState.gateOpen = true;
        finish(s, 'GATE UNLOCKED ✨ The ancient ruins are open!');
      }
    } else {
      s.gateCharge = Math.max(0, s.gateCharge - dt * 25);
      s.progress = Math.round(s.gateCharge);
    }
  }

  // ============================================================
  // LEVEL 10: Guide the Butterfly (Fingertip tracking through rings)
  // ============================================================
  if (s.level === 10) {
    const primaryPointer = pointers[0];
    if (primaryPointer) {
      // Exponential smoothing towards fingertip position in 3D
      const targetX = (primaryPointer.x - 0.5) * 6;
      const targetY = clamp(2.4 - (primaryPointer.y - 0.5) * 3.5, 0.8, 3.5);
      const targetZ = clamp(2.0 - s.ringsPassed.length * 2.0, -8.6, 2.0);

      const alpha = 1 - Math.exp(-6 * dt);
      s.butterflyPos[0] += (targetX - s.butterflyPos[0]) * alpha;
      s.butterflyPos[1] += (targetY - s.butterflyPos[1]) * alpha;
      s.butterflyPos[2] += (targetZ - s.butterflyPos[2]) * alpha;
    }

    const ringProjections = input.rings || {};
    const nextRingIdx = s.ringsPassed.length;
    if (nextRingIdx < BUTTERFLY_RINGS.length) {
      const nextRing = BUTTERFLY_RINGS[nextRingIdx];
      const ringProj = ringProjections[nextRing.id];
      if (primaryPointer && near(primaryPointer, ringProj, 0.18, input.aspect)) {
        s.ringsPassed.push(nextRing.id);
        s.progress = s.ringsPassed.length;
        s.stars += 1;
        feedback(s, `Passed ring ${s.progress} / 5! 🌸`);
        if (s.progress >= 5) {
          s.butterflyPos = [...BUTTERFLY_FLOWER];
          finish(s, 'Butterfly Reached Home! 🦋');
        }
      }
    }
  }

  // ============================================================
  // LEVEL 11: Energy Orb Challenge (Dual hands balance holding)
  // ============================================================
  if (s.level === 11) {
    const leftHand = pointers.find(p => p.id === 'left' || p.x < 0.5);
    const rightHand = pointers.find(p => p.id === 'right' || p.x >= 0.5);
    const mouseHold = pointers.some(p => p.id === 'mouse' && p.pinch);

    const isBalanced = (leftHand && rightHand && Math.abs(leftHand.y - rightHand.y) < 0.25 && leftHand.x < 0.48 && rightHand.x > 0.52) || mouseHold;

    if (isBalanced) {
      s.orbCharge = Math.min(100, s.orbCharge + dt * 60);
      s.progress = Math.round(s.orbCharge);
      if (s.orbCharge >= 100) {
        if (s.adventure) s.adventure.worldState.shrineActive = true;
        finish(s, 'Energy Orb Fully Charged! ⚡ Power sent to Magic Tree!');
      }
    } else {
      s.orbCharge = Math.max(0, s.orbCharge - dt * 20);
      s.progress = Math.round(s.orbCharge);
    }
  }

  // ============================================================
  // LEVEL 12: Restore the Magic Tree (Grand Adventure Climax)
  // ============================================================
  if (s.level === 12) {
    // Stage 0: Look towards Magic Tree
    if (s.stage === 0 && s.navigationMs > 500 && Math.abs(s.control.yaw) < 0.25) {
      s.stage = 1;
      s.progress = 1;
      feedback(s, 'You see the Grand Magic Tree! Find the Star Crystal.');
    }

    // Stage 1: Find Star Crystal
    const starCrystalProj = input.objects?.star_crystal;
    if (s.stage === 1 && pointers.some(p => near(p, starCrystalProj, 0.15, input.aspect))) {
      s.stage = 2;
      s.progress = 2;
      feedback(s, 'Star Crystal spotted! Pinch to pick it up.');
    }

    // Stage 2: Pick up Star Crystal
    if (s.stage === 2 && !s.held) {
      const grabber = pointers.find(p => near(p, starCrystalProj, 0.14, input.aspect) && p.pinch && s.armed[p.id]);
      if (grabber) {
        s.held = { objectId: 'star_crystal', handId: grabber.id };
        s.stage = 3;
        s.progress = 3;
        feedback(s, 'Carry the Star Crystal to the Tree Shrine!');
      }
    }

    // Stage 3 & 4: Carry and Place into Tree Shrine
    if (s.held?.objectId === 'star_crystal') {
      const holder = pointers.find(p => p.id === s.held.handId);
      if (holder) {
        const dest = input.dragPoint?.(holder, 'star_crystal');
        if (holder.pinch && dest?.every(Number.isFinite)) {
          const pos = s.objects.star_crystal;
          const alpha = 1 - Math.exp(-14 * dt);
          for (let i = 0; i < 3; i++) pos[i] += (dest[i] - pos[i]) * alpha;
          if (near(holder, input.treeShrine, 0.20, input.aspect)) {
            s.stage = 4;
            s.progress = 4;
          }
        }
        if (!holder.pinch) {
          if (near(holder, input.treeShrine, 0.20, input.aspect)) {
            s.objects.star_crystal = [...TREE_SHRINE_POS];
            s.placed.push('star_crystal');
            s.held = null;
            s.stage = 5;
            s.progress = 5;
            feedback(s, 'Crystal placed! Now raise both hands to awaken the tree!');
          } else {
            feedback(s, 'Release the crystal over the tree shrine.');
            s.held = null;
          }
        }
      }
    }

    // Stage 5: Dual Hand Channeling & Tree Awaken
    if (s.stage === 5) {
      const isChanneling = (pointers.length >= 2 && pointers.every(p => p.raised !== false)) || pointers.some(p => p.id === 'mouse' && p.pinch);

      if (isChanneling) {
        s.treeCharge = Math.min(100, s.treeCharge + dt * 45);
        if (s.treeCharge >= 100) {
          if (s.adventure) {
            s.adventure.worldState.treeRestored = true;
            s.adventure.worldState.plantsBloomed = true;
            s.adventure.treeEnergy = 100;
          }
          finish(s, 'FOREST RESTORED 🌳✨ The Whispering Woods are alive!');
        }
      } else {
        s.treeCharge = Math.max(0, s.treeCharge - dt * 15);
      }
    }
  }

  // ============================================================
  // Legacy object manipulation (Levels 2–4)
  // ============================================================
  const currentIds = new Set(pointers.map(p => p.id));
  for (const id of Object.keys(s.armed)) {
    if (!currentIds.has(Number(id)) && !currentIds.has(id)) delete s.armed[id];
  }

  if (s.held && s.level <= 4) {
    const holder = pointers.find(p => p.id === s.held.handId);
    if (!holder) {
      s.lostMs += ms;
      if (s.lostMs > 180) {
        s.held = null;
        if (s.level === 4) {
          s.stage = 2;
          s.progress = 2;
        }
        feedback(s, 'Object is waiting for you. Open your hand, then pinch again.');
      }
    } else {
      s.lostMs = 0;
      const destination = input.dragPoint?.(holder, objectId);
      if (holder.pinch && destination?.every(Number.isFinite)) {
        const pos = s.objects[objectId];
        const alpha = 1 - Math.exp(-14 * dt);
        for (let i = 0; i < 3; i++) pos[i] += (destination[i] - pos[i]) * alpha;
        if (s.level === 4 && near(holder, input.targets?.[objectId], 0.16, input.aspect)) {
          s.stage = 4;
          s.progress = 4;
        }
      }
      if (!holder.pinch) {
        s.attempts++;
        if (near(holder, input.targets?.[objectId], 0.16, input.aspect)) {
          const target = objectDefinitions.find(o => o.id === objectId).target;
          s.objects[objectId] = [target[0], target[1] + 0.8, target[2]];
          s.placed.push(objectId);
          finish(s, s.level === 4 ? 'Forest quest complete!' : 'Beautifully placed!');
        } else {
          feedback(s, 'Try releasing over the golden circle.');
          if (s.level === 4) {
            s.stage = 2;
            s.progress = 2;
          }
        }
        s.held = null;
      }
    }
  } else if (eligibleLegacy && s.status === 'playing' && s.level >= 3 && s.level <= 4 && !s.control.active) {
    const grabber = candidatesLegacy.find(p => p.pinch && s.armed[p.id]);
    if (grabber) {
      s.held = { objectId, handId: grabber.id };
      s.lostMs = 0;
      if (s.level === 4) {
        s.stage = 3;
        s.progress = 3;
      }
      feedback(s, 'Got it! Carry it to the golden circle.');
    }
  }

  for (const p of pointers) s.armed[p.id] = !p.pinch;

  if (s.adventure) {
    updateAdventure(s.adventure, input, ms);
    s.stars = s.adventure.stars;
    if (s.adventure.newlyDiscovered && !s.feedback) {
      feedback(s, `Discovered: ${s.adventure.newlyDiscovered.name}! ✨`);
    }
  }
}

