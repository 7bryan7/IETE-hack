import React, { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Raycaster, Vector2, Vector3 } from 'three';
import {
  checkpoints,
  objectDefinitions,
  FOREST_LANDMARKS,
  FIREFLY_CONFIGS,
  FRUIT_DEFINITIONS,
  BASKET_POSITION,
  BRIDGE_PLANK_DEFINITIONS,
  MEMORY_STONE_DEFINITIONS,
  GATE_POSITION,
  BUTTERFLY_RINGS,
  BUTTERFLY_START,
  BUTTERFLY_FLOWER,
  STAR_CRYSTAL_POS,
  TREE_SHRINE_POS,
} from './forestLevels.js';
import { stepForest } from './forestLogic.js';

function Tree({ position, size = 1, broad = false, color = '#508b61' }) {
  return <group position={position} scale={size}>
    <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.16, 0.27, 2.4, 6]} /><meshStandardMaterial color="#977354" flatShading /></mesh>
    {broad ? <mesh position={[0, 3, 0]} scale={[1.2, 1.1, 1]}><icosahedronGeometry args={[1.45, 1]} /><meshStandardMaterial color={color} flatShading /></mesh> : [0, 1, 2].map(i => <mesh key={i} position={[0, 1.8 + i * 0.85, 0]}><coneGeometry args={[1.4 - i * 0.3, 2.2, 7]} /><meshStandardMaterial color={i === 2 ? '#87b978' : color} flatShading /></mesh>)}
  </group>;
}
function Rock({ position, scale = [1, 0.7, 0.8] }) {
  return <mesh position={position} scale={scale} rotation={[0.1, 0.6, 0.2]}><dodecahedronGeometry args={[0.8, 0]} /><meshStandardMaterial color="#acb6a4" flatShading /></mesh>;
}
const Scenery = memo(function Scenery({ run }) {
  const trees = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2;
    const radius = 11 + (i % 3) * 2;
    return { position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius - 4], size: 0.8 + (i % 5) * 0.15, broad: i % 3 === 0 };
  }).filter(tree => tree.position[2] < 1 || Math.abs(tree.position[0]) > 10), []);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}><circleGeometry args={[55, 64]} /><meshStandardMaterial color="#98ba77" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} scale={[1, 1.9, 1]}><circleGeometry args={[7.5, 48]} /><meshStandardMaterial color="#b5ce8b" /></mesh>
    {/* A sandy trail leads across the brook into the clearing. */}
    {[0, 1, 2, 3, 4, 5, 6].map(i => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[Math.sin(i * 0.7) * 0.5, 0.012, 10 - i * 3]} scale={[1, 1.8, 1]}><circleGeometry args={[1.25, 12]} /><meshStandardMaterial color="#e1d4a2" /></mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, -6]}><planeGeometry args={[35, 2.5]} /><meshStandardMaterial color="#83cdd0" roughness={0.25} metalness={0.1} /></mesh>
    {Array.from({ length: 9 }, (_, i) => {
      const bridgeFixed = run?.current?.adventure?.worldState?.bridgeRepaired || (run?.current?.level || 1) > 7;
      if (!bridgeFixed && i >= 3 && i <= 5) return null;
      return <mesh key={i} position={[0, 0.26 + Math.sin(i / 8 * Math.PI) * 0.2, -7.6 + i * 0.4]}><boxGeometry args={[2.5, 0.15, 0.35]} /><meshStandardMaterial color={i % 2 ? '#b58a5c' : '#c7a16d'} /></mesh>;
    })}
    {[-1.3, 1.3].map(x => <group key={x}>{[-7.5, -6, -4.5].map(z => <mesh key={z} position={[x, 0.7, z]}><cylinderGeometry args={[0.08, 0.1, 1.2, 6]} /><meshStandardMaterial color="#9d744e" /></mesh>)}<mesh position={[x, 1.2, -6]}><boxGeometry args={[0.1, 0.12, 3.3]} /><meshStandardMaterial color="#ae8557" /></mesh></group>)}
    {trees.map((tree, i) => <Tree key={i} {...tree} color={['#5e9569', '#6ca575', '#447c62'][i % 3]} />)}
    <Tree position={[-6.5, 0, -0.7]} size={1.2} broad /><Tree position={[7, 0, -3.8]} size={1.1} />
    <Rock position={[-4.5, 0.5, -0.7]} /><Rock position={[-5.2, 0.3, 0.2]} scale={[0.6, 0.5, 0.6]} /><Rock position={[5.5, 0.4, -4]} />
    {Array.from({ length: 22 }, (_, i) => {
      const side = i % 2 ? -1 : 1, x = side * (3.5 + (i % 5) * 1.25), z = 5 - Math.floor(i / 2) * 1.4;
      return <group key={i} position={[x, 0, z]}>
        {i % 3 === 0 ? <mesh position={[0, 0.4, 0]} scale={[1, 0.65, 0.8]}><icosahedronGeometry args={[0.75, 1]} /><meshStandardMaterial color="#72a260" flatShading /></mesh> : <>
          <mesh position={[0, 0.22, 0]}><coneGeometry args={[0.14, 0.45, 4]} /><meshStandardMaterial color="#689552" /></mesh>
          <mesh position={[0.1, 0.42, 0]}><icosahedronGeometry args={[0.14, 0]} /><meshStandardMaterial color={['#fff4ae', '#eaa9b3', '#ddd0f0'][i % 3]} /></mesh>
          <mesh position={[-0.18, 0.18, 0.1]} rotation={[0, 0, 0.2]}><coneGeometry args={[0.08, 0.4, 3]} /><meshStandardMaterial color="#6b9955" /></mesh>
        </>}
      </group>;
    })}
    {[-18, 0, 18].map((x, i) => <mesh key={x} position={[x, 1, -27]} scale={[12, 5 + i, 8]}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#aac7a0" flatShading /></mesh>)}
  </group>;
});

function Waterfall({ reducedMotion }) {
  const cascade = useRef();
  useFrame(({ clock }) => {
    if (!reducedMotion && cascade.current) {
      cascade.current.position.y = 1.2 + Math.sin(clock.elapsedTime * 6) * 0.05;
    }
  });
  return (
    <group position={[-2.8, 0, -6.8]}>
      <mesh position={[0, 1.4, -0.4]} scale={[2.8, 2.2, 1.6]} rotation={[0, 0.2, 0]}>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#7a8a76" flatShading />
      </mesh>
      <mesh position={[1.4, 0.9, -0.2]} scale={[1.6, 1.6, 1.2]}>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#6a7a67" flatShading />
      </mesh>
      <mesh ref={cascade} position={[0, 1.2, 0.35]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[1.6, 2.4]} />
        <meshStandardMaterial color="#91e5ee" transparent opacity={0.78} roughness={0.1} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 16]} />
        <meshBasicMaterial color="#d4f9ff" transparent opacity={0.65} />
      </mesh>
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[(i - 1) * 0.45, 0.35 + (i % 2) * 0.2, 0.8]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshBasicMaterial color="#eefdff" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function StoneRuins() {
  return (
    <group position={[7.0, 0, -4.5]}>
      <mesh position={[-1.2, 1.4, 0]} rotation={[0.05, 0.1, -0.04]}>
        <cylinderGeometry args={[0.32, 0.38, 2.8, 8]} />
        <meshStandardMaterial color="#a3aba0" flatShading />
      </mesh>
      <mesh position={[1.2, 1.5, 0.2]} rotation={[-0.03, -0.08, 0.05]}>
        <cylinderGeometry args={[0.3, 0.36, 3.0, 8]} />
        <meshStandardMaterial color="#9ba498" flatShading />
      </mesh>
      <mesh position={[0.2, 0.35, 1.1]} rotation={[0, 0.4, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.32, 1.6, 8]} />
        <meshStandardMaterial color="#8e998a" flatShading />
      </mesh>
      <mesh position={[0, 2.85, 0.1]} rotation={[0.02, 0.05, 0.02]}>
        <boxGeometry args={[3.2, 0.35, 0.6]} />
        <meshStandardMaterial color="#aab4a7" flatShading />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <circleGeometry args={[2.0, 6]} />
        <meshStandardMaterial color="#889684" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.95, 16]} />
        <meshBasicMaterial color="#94f4c8" transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ForestShrine() {
  return (
    <group position={[-5.5, 0, -9.0]}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[2.2, 2.5, 0.3, 16]} />
        <meshStandardMaterial color="#9ba693" flatShading />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.8, 8]} />
        <meshStandardMaterial color="#8a9982" flatShading />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#ffe891" emissive="#ffd659" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.55, 12, 8]} />
        <meshBasicMaterial color="#ffe891" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      {[0, 1, 2, 3].map(i => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.7, 0.55, Math.sin(a) * 1.7]}>
            <boxGeometry args={[0.3, 0.9, 0.25]} />
            <meshStandardMaterial color="#a0ac99" flatShading />
          </mesh>
        );
      })}
    </group>
  );
}

function GrandMagicTree({ run, reducedMotion }) {
  const foliage = useRef();
  useFrame(({ clock }) => {
    if (!reducedMotion && foliage.current) {
      foliage.current.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 0.05;
    }
  });
  const restored = run?.current?.adventure?.worldState?.treeRestored;
  return (
    <group position={[0, 0, -16.0]}>
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.9, 1.8, 6.5, 8]} />
        <meshStandardMaterial color="#73573c" flatShading />
      </mesh>
      {[0, 1, 2, 3, 4].map(i => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.5, 0.8, Math.sin(a) * 1.5]} rotation={[0.4, a, 0]}>
            <cylinderGeometry args={[0.25, 0.55, 2.4, 5]} />
            <meshStandardMaterial color="#6a5036" flatShading />
          </mesh>
        );
      })}
      <group ref={foliage} position={[0, 6.2, 0]}>
        <mesh position={[0, 0, 0]} scale={[4.2, 2.5, 3.8]}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial color={restored ? '#eab308' : '#509b64'} emissive={restored ? '#facc15' : '#000000'} emissiveIntensity={restored ? 0.35 : 0} flatShading />
        </mesh>
        <mesh position={[0, 1.8, 0]} scale={[3.4, 2.2, 3.2]}>
          <icosahedronGeometry args={[1.4, 1]} />
          <meshStandardMaterial color={restored ? '#fbbf24' : '#6ec27b'} emissive={restored ? '#fde047' : '#000000'} emissiveIntensity={restored ? 0.45 : 0} flatShading />
        </mesh>
        <mesh position={[0, 3.2, 0]} scale={[2.4, 1.8, 2.4]}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial color={restored ? '#fef08a' : '#94e892'} emissive={restored ? '#fef08a' : '#000000'} emissiveIntensity={restored ? 0.55 : 0} flatShading />
        </mesh>
      </group>
      <mesh position={[0, 6.0, 0]}>
        <sphereGeometry args={[4.5, 16, 12]} />
        <meshBasicMaterial color={restored ? '#fef08a' : '#aaffcc'} transparent opacity={restored ? 0.18 : 0.06} depthWrite={false} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <mesh key={i} position={[Math.sin(i * 1.5) * 3.2, 4.5 + (i % 3) * 1.2, Math.cos(i * 1.5) * 3.2]}>
          <octahedronGeometry args={[restored ? 0.22 : 0.12, 0]} />
          <meshBasicMaterial color={restored ? '#ffd700' : '#fffeb3'} />
        </mesh>
      ))}
    </group>
  );
}

export function ForestObject({ definition, run, reducedMotion }) {
  const mesh = useRef(), halo = useRef();
  useFrame(({ clock }, dt) => {
    const s = run.current, m = mesh.current, t = clock.elapsedTime;
    m.position.set(...s.objects[definition.id]);
    const active = s.level === 4 ? definition.id === 'leaf' : definition.id === 'crystal';
    m.visible = active && s.level >= 2;
    const held = s.held?.objectId === definition.id, hover = s.hover === definition.id;
    if (!held && !s.placed.includes(definition.id) && !reducedMotion) m.position.y += Math.sin(t * 1.8) * 0.07;
    if (!reducedMotion) m.rotation.y += Math.min(dt, 0.05) * (held ? 0.15 : 0.45);
    const scale = hover || held ? 1.2 : 1;
    m.scale.setScalar(m.scale.x + (scale - m.scale.x) * (1 - Math.exp(-10 * Math.min(dt, 0.05))));
    halo.current.material.opacity = hover || held ? 0.25 : 0.10;
  });
  return <group ref={mesh} position={definition.position}>
    <mesh scale={definition.id === 'leaf' ? [0.8, 1.25, 0.22] : [0.7, 1.25, 0.7]} rotation={[0, 0, definition.id === 'leaf' ? -0.4 : 0]}>
      <octahedronGeometry args={[0.45, 0]} /><meshStandardMaterial color={definition.color} emissive={definition.color} emissiveIntensity={0.6} roughness={0.3} flatShading />
    </mesh>
    <mesh ref={halo}><sphereGeometry args={[0.7, 12, 8]} /><meshBasicMaterial color={definition.color} transparent opacity={0.12} depthWrite={false} /></mesh>
    {[0, 1, 2].map(i => <mesh key={i} position={[Math.cos(i * 2.1) * 0.7, Math.sin(i * 2.1) * 0.5, 0]}><octahedronGeometry args={[0.055]} /><meshBasicMaterial color="#fffbd6" /></mesh>)}
  </group>;
}

export function ForestTarget({ definition, run }) {
  const group = useRef(), ring = useRef();
  useFrame(() => {
    const s = run.current;
    group.current.visible = s.level === 4 ? definition.id === 'leaf' : s.level === 3 && definition.id === 'crystal';
    ring.current.material.color.set(s.placed.includes(definition.id) ? '#d5ffa0' : '#ffe8a3');
  });
  return <group ref={group} position={definition.target}>
    <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[1.05, 1.2, 0.35, 10]} /><meshStandardMaterial color="#bcac80" flatShading /></mesh>
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}><torusGeometry args={[0.82, 0.07, 6, 32]} /><meshBasicMaterial color="#ffe8a3" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}><circleGeometry args={[0.75, 32]} /><meshBasicMaterial color="#ffebae" transparent opacity={0.35} depthWrite={false} /></mesh>
    <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.9, 0.85, 0.8, 24, 1, true]} /><meshBasicMaterial color="#ffe5a0" transparent opacity={0.09} depthWrite={false} side={2} /></mesh>
  </group>;
}

function TrailMarker({ checkpoint, run }) {
  const group = useRef(), orb = useRef();
  useFrame(() => { group.current.visible = run.current.level === 1; orb.current.material.color.set(run.current.viewed.includes(checkpoint.id) ? '#9ff2aa' : '#fff4b5'); });
  return <group ref={group} position={checkpoint.position}>
    <mesh position={[0, -0.95, 0]}><cylinderGeometry args={[0.04, 0.05, 1.7, 6]} /><meshStandardMaterial color="#a78656" /></mesh>
    <mesh ref={orb}><octahedronGeometry args={[0.3]} /><meshBasicMaterial color="#fff4b5" /></mesh>
    <mesh><sphereGeometry args={[0.52, 12, 8]} /><meshBasicMaterial color="#fff1b4" transparent opacity={0.13} depthWrite={false} /></mesh>
  </group>;
}

const DRAGONFLY_CONFIGS = [
  { id: 'azure', name: 'Azure Darner', initialPos: [0, 1.8, -4.5], radiusX: 2.2, radiusZ: 1.6, speed: 0.85, phase: 0.0, color: '#38bdf8', eyeColor: '#00ffff', wingColor: '#bae6fd', scale: 1.1 },
  { id: 'emerald', name: 'Emerald Glider', initialPos: [-3.2, 1.9, 0.5], radiusX: 2.5, radiusZ: 1.8, speed: 0.75, phase: 1.4, color: '#4ade80', eyeColor: '#86efac', wingColor: '#dcfce7', scale: 1.05 },
  { id: 'golden', name: 'Golden Skimmer', initialPos: [3.5, 2.0, 1.0], radiusX: 2.4, radiusZ: 2.0, speed: 0.9, phase: 2.8, color: '#fbbf24', eyeColor: '#fde047', wingColor: '#fef3c7', scale: 1.15 },
  { id: 'ruby', name: 'Ruby Chaser', initialPos: [5.2, 2.1, -3.2], radiusX: 2.0, radiusZ: 1.5, speed: 0.8, phase: 4.2, color: '#f87171', eyeColor: '#fca5a5', wingColor: '#fee2e2', scale: 1.0 },
  { id: 'amethyst', name: 'Amethyst Phantom', initialPos: [-4.5, 1.7, -1.2], radiusX: 1.8, radiusZ: 1.4, speed: 0.7, phase: 5.1, color: '#c084fc', eyeColor: '#d8b4fe', wingColor: '#f3e8ff', scale: 1.08 },
];

function Dragonfly({ config, run, reducedMotion }) {
  const rootRef = useRef();
  const wingFL = useRef(), wingFR = useRef(), wingBL = useRef(), wingBR = useRef();
  const haloRef = useRef();

  const state = useRef({
    pos: new Vector3(...config.initialPos),
    evadeTimer: 0,
    evadeDir: new Vector3(0, 1, 0),
    caughtTimer: 0,
    baseY: config.initialPos[1],
    phase: config.phase || 0,
  });

  useFrame(({ clock, camera, size }, delta) => {
    if (!rootRef.current) return;
    const st = state.current;
    const t = clock.elapsedTime + st.phase;
    const deltaClamped = Math.min(delta, 0.05);

    // 1. Natural cruising orbit with gentle hovering & sinusoidal wave
    const speed = (config.speed || 0.8) * (st.evadeTimer > 0 ? 2.6 : 1.0);
    const patrolX = config.initialPos[0] + Math.sin(t * speed) * config.radiusX + Math.cos(t * 0.4) * 0.5;
    const patrolZ = config.initialPos[2] + Math.cos(t * speed) * config.radiusZ + Math.sin(t * 0.5) * 0.4;
    const patrolY = st.baseY + Math.sin(t * 1.9) * 0.35 + Math.cos(t * 0.7) * 0.18;

    // 2. Project 3D position to camera view to detect touch/grab from player hands or mouse
    const proj = st.pos.clone().project(camera);
    const screenX = (proj.x + 1) / 2;
    const screenY = (1 - proj.y) / 2;
    const isVisible = proj.z > -1 && proj.z < 1 && Math.abs(proj.x) < 1.15 && Math.abs(proj.y) < 1.15;

    // 3. Proximity detection with all active pointers (hands / mouse)
    const s = run.current;
    const pointers = s?.pointers || [];
    const aspect = size.width / size.height;

    let nearestDist = 999;
    let nearestPointer = null;

    if (isVisible) {
      for (const p of pointers) {
        const d = Math.hypot((p.x - screenX) * aspect, p.y - screenY);
        if (d < nearestDist) {
          nearestDist = d;
          nearestPointer = p;
        }
      }
    }

    // 4. Reactive Touch & Grab AI
    if (nearestPointer && nearestDist < 0.20 && st.caughtTimer <= 0) {
      if (nearestPointer.pinch && nearestDist < 0.10) {
        // Pinch caught!
        st.caughtTimer = 2.2;
        if (s.adventure) {
          s.adventure.dragonfliesCaught = (s.adventure.dragonfliesCaught || 0) + 1;
          s.adventure.stars = (s.adventure.stars || 0) + 1;
          s.stars = s.adventure.stars;
          s.feedback = `Dragonfly Caught! ✨ (${Math.min(5, s.adventure.dragonfliesCaught)}/5)`;
          s.feedbackUntil = (s.elapsed || 0) + 2600;
          s.adventure.novaMood = 'celebrating';
          s.adventure.novaMessage = `Splendid catch! You caught the ${config.name}! ⭐`;
        }
      } else {
        // Hand is approaching/touching: Evade & dart away playfully!
        st.evadeTimer = 0.9;
        const dx = (screenX - nearestPointer.x) * 3.5 + Math.sin(t * 8) * 1.2;
        const dy = (nearestPointer.y - screenY) * 2.5 + 0.9;
        const dz = Math.cos(t * 6) * 1.5 - 0.5;
        st.evadeDir.set(dx, dy, dz).normalize();
      }
    }

    // 5. Position blending & target computation
    let targetX = patrolX;
    let targetY = patrolY;
    let targetZ = patrolZ;

    if (st.caughtTimer > 0) {
      st.caughtTimer -= deltaClamped;
      // Joyful celebratory spiral
      targetY += (2.2 - st.caughtTimer) * 1.6;
      targetX += Math.sin(clock.elapsedTime * 14) * 0.45;
      targetZ += Math.cos(clock.elapsedTime * 14) * 0.45;
    } else if (st.evadeTimer > 0) {
      st.evadeTimer -= deltaClamped;
      targetX += st.evadeDir.x * 2.4;
      targetY += st.evadeDir.y * 1.6;
      targetZ += st.evadeDir.z * 1.8;
    }

    // Exponential smoothing for natural flight transitions
    const followSpeed = st.evadeTimer > 0 ? 11 : 3.8;
    const alpha = 1 - Math.exp(-followSpeed * deltaClamped);
    const prevPos = st.pos.clone();
    st.pos.x += (targetX - st.pos.x) * alpha;
    st.pos.y += (targetY - st.pos.y) * alpha;
    st.pos.z += (targetZ - st.pos.z) * alpha;

    rootRef.current.position.copy(st.pos);

    // 6. Look in direction of flight (natural banking and pitch)
    const moveDir = st.pos.clone().sub(prevPos);
    if (moveDir.lengthSq() > 0.00001) {
      rootRef.current.lookAt(st.pos.clone().add(moveDir));
    }

    // 7. Rapid High-Frequency Wing Flutter (vibrating double wings)
    if (!reducedMotion) {
      const flutterFreq = st.evadeTimer > 0 ? 64 : 42;
      const flap1 = Math.sin(clock.elapsedTime * flutterFreq) * 0.45;
      const flap2 = Math.sin(clock.elapsedTime * flutterFreq + 0.6) * 0.40;
      if (wingFL.current) wingFL.current.rotation.z = flap1;
      if (wingFR.current) wingFR.current.rotation.z = -flap1;
      if (wingBL.current) wingBL.current.rotation.z = flap2;
      if (wingBR.current) wingBR.current.rotation.z = -flap2;
    }

    // 8. Reactive glow pulse
    if (haloRef.current) {
      haloRef.current.material.opacity = st.caughtTimer > 0 ? 0.6 : st.evadeTimer > 0 ? 0.38 : 0.14;
    }
  });

  return (
    <group ref={rootRef} scale={config.scale || 1}>
      {/* Head */}
      <mesh position={[0, 0, 0.32]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={config.color} roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Large Glowing Compound Eyes */}
      <mesh position={[-0.055, 0.03, 0.35]}>
        <sphereGeometry args={[0.042, 6, 6]} />
        <meshStandardMaterial color={config.eyeColor} emissive={config.eyeColor} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0.055, 0.03, 0.35]}>
        <sphereGeometry args={[0.042, 6, 6]} />
        <meshStandardMaterial color={config.eyeColor} emissive={config.eyeColor} emissiveIntensity={0.9} />
      </mesh>
      {/* Thorax */}
      <mesh position={[0, 0, 0.18]} scale={[1, 1.15, 1.5]}>
        <sphereGeometry args={[0.085, 8, 8]} />
        <meshStandardMaterial color={config.color} roughness={0.2} metalness={0.7} />
      </mesh>
      {/* Segmented Slender Abdomen */}
      <mesh position={[0, 0.01, -0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.048, 0.72, 6]} />
        <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={0.35} />
      </mesh>
      {/* 4 Translucent Shimmering Wings (Forewings & Hindwings) */}
      <group position={[-0.04, 0.05, 0.22]} ref={wingFL}>
        <mesh position={[-0.34, 0, 0.05]} rotation={[0, 0, -0.12]}>
          <planeGeometry args={[0.66, 0.17]} />
          <meshStandardMaterial color={config.wingColor} transparent opacity={0.7} side={2} roughness={0.1} metalness={0.8} depthWrite={false} />
        </mesh>
      </group>
      <group position={[0.04, 0.05, 0.22]} ref={wingFR}>
        <mesh position={[0.34, 0, 0.05]} rotation={[0, 0, 0.12]}>
          <planeGeometry args={[0.66, 0.17]} />
          <meshStandardMaterial color={config.wingColor} transparent opacity={0.7} side={2} roughness={0.1} metalness={0.8} depthWrite={false} />
        </mesh>
      </group>
      <group position={[-0.04, 0.04, 0.12]} ref={wingBL}>
        <mesh position={[-0.3, 0, -0.04]} rotation={[0, 0, -0.18]}>
          <planeGeometry args={[0.58, 0.15]} />
          <meshStandardMaterial color={config.wingColor} transparent opacity={0.7} side={2} roughness={0.1} metalness={0.8} depthWrite={false} />
        </mesh>
      </group>
      <group position={[0.04, 0.04, 0.12]} ref={wingBR}>
        <mesh position={[0.3, 0, -0.04]} rotation={[0, 0, 0.18]}>
          <planeGeometry args={[0.58, 0.15]} />
          <meshStandardMaterial color={config.wingColor} transparent opacity={0.7} side={2} roughness={0.1} metalness={0.8} depthWrite={false} />
        </mesh>
      </group>
      {/* Magical Glow Halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.38, 8, 8]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Dragonflies({ run, reducedMotion }) {
  return (
    <group>
      {DRAGONFLY_CONFIGS.map(cfg => (
        <Dragonfly key={cfg.id} config={cfg} run={run} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

function FireflySwarm({ run, reducedMotion }) {
  const meshRefs = useRef([]);
  useFrame(({ clock }) => {
    const s = run.current;
    if (s.level !== 5 && !s.firefliesCaught?.length) return;
    const t = clock.elapsedTime;
    FIREFLY_CONFIGS.forEach((ff, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const isCaught = s.firefliesCaught?.includes(ff.id);
      if (isCaught) {
        mesh.position.y += 0.05;
        mesh.scale.setScalar(Math.max(0.01, mesh.scale.x * 0.96));
        return;
      }
      const x = ff.initialPos[0] + Math.sin(t * ff.speed + i) * 0.85;
      const y = ff.initialPos[1] + Math.sin(t * ff.speed * 1.6 + i * 0.5) * 0.35;
      const z = ff.initialPos[2] + Math.cos(t * ff.speed + i) * 0.7;
      mesh.position.set(x, y, z);
      const isHovered = s.hover === ff.id;
      const targetScale = isHovered ? 1.6 : 1.0;
      mesh.scale.setScalar(mesh.scale.x + (targetScale - mesh.scale.x) * 0.15);
    });
  });

  return (
    <group>
      {FIREFLY_CONFIGS.map((ff, i) => (
        <group key={ff.id} ref={el => (meshRefs.current[i] = el)} position={ff.initialPos}>
          <mesh>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshStandardMaterial color={ff.color} emissive={ff.color} emissiveIntensity={1.2} roughness={0.1} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.26, 8, 8]} />
            <meshBasicMaterial color={ff.color} transparent opacity={0.35} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FruitItem({ definition, run, reducedMotion }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    const s = run.current;
    if (!mesh.current || !s.objects[definition.id]) return;
    mesh.current.position.set(...s.objects[definition.id]);
    const held = s.held?.objectId === definition.id;
    const hover = s.hover === definition.id;
    const scale = held || hover ? 1.3 : 1.0;
    mesh.current.scale.setScalar(mesh.current.scale.x + (scale - mesh.current.scale.x) * 0.2);
    if (!held && !s.placed.includes(definition.id) && !reducedMotion) {
      mesh.current.position.y += Math.sin(clock.elapsedTime * 2 + definition.position[0]) * 0.03;
    }
  });

  return (
    <group ref={mesh} position={definition.position}>
      <mesh>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color={definition.color} emissive={definition.color} emissiveIntensity={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.018, 0.024, 0.09, 4]} />
        <meshStandardMaterial color="#4a2e12" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color={definition.color} transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MagicFruitTree({ run, reducedMotion }) {
  const group = useRef();
  useFrame(() => {
    const s = run.current;
    if (group.current) group.current.visible = s.level === 6;
  });

  return (
    <group ref={group}>
      <group position={BASKET_POSITION}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.45, 0.45, 12, 1, true]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} side={2} />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.45, 12]} />
          <meshStandardMaterial color="#704214" />
        </mesh>
        <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.65, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} depthWrite={false} />
        </mesh>
      </group>
      {FRUIT_DEFINITIONS.map(fruit => (
        <FruitItem key={fruit.id} definition={fruit} run={run} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

function PlankItem({ definition, run }) {
  const mesh = useRef();
  useFrame(() => {
    const s = run.current;
    if (!mesh.current || !s.objects[definition.id]) return;
    mesh.current.position.set(...s.objects[definition.id]);
    const held = s.held?.objectId === definition.id;
    const hover = s.hover === definition.id;
    const scale = held || hover ? 1.12 : 1.0;
    mesh.current.scale.setScalar(mesh.current.scale.x + (scale - mesh.current.scale.x) * 0.2);
  });

  return (
    <group ref={mesh} position={definition.initialPos}>
      <mesh>
        <boxGeometry args={[2.5, 0.15, 0.36]} />
        <meshStandardMaterial color="#c7a16d" roughness={0.7} />
      </mesh>
    </group>
  );
}

function BridgeRepairPlanks({ run, reducedMotion }) {
  const group = useRef();
  useFrame(() => {
    const s = run.current;
    if (group.current) group.current.visible = s.level === 7;
  });

  return (
    <group ref={group}>
      {BRIDGE_PLANK_DEFINITIONS.map(plank => (
        <React.Fragment key={plank.id}>
          <mesh position={plank.targetPos}>
            <boxGeometry args={[2.55, 0.17, 0.38]} />
            <meshBasicMaterial color="#ffe066" wireframe transparent opacity={0.65} />
          </mesh>
          <PlankItem definition={plank} run={run} />
        </React.Fragment>
      ))}
    </group>
  );
}

function SteppingStoneItem({ stone, index, run }) {
  const stoneRef = useRef(), runeRef = useRef();
  useFrame(() => {
    const s = run.current;
    if (!runeRef.current) return;
    const isGlowing = s.activePreviewStone === index || s.lastTouchedStone === index || s.hover === stone.id;
    runeRef.current.material.opacity = isGlowing ? 0.95 : 0.35;
    runeRef.current.scale.setScalar(isGlowing ? 1.25 : 1.0);
  });

  return (
    <group position={stone.position}>
      <mesh ref={stoneRef}>
        <cylinderGeometry args={[0.42, 0.52, 0.22, 10]} />
        <meshStandardMaterial color="#889684" roughness={0.8} flatShading />
      </mesh>
      <mesh ref={runeRef} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 16]} />
        <meshBasicMaterial color={stone.color} transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MemorySteppingStones({ run }) {
  const group = useRef();
  useFrame(() => {
    const s = run.current;
    if (group.current) group.current.visible = s.level === 8;
  });

  return (
    <group ref={group}>
      {MEMORY_STONE_DEFINITIONS.map((stone, idx) => (
        <SteppingStoneItem key={stone.id} stone={stone} index={idx} run={run} />
      ))}
    </group>
  );
}

function AncientMagicGate({ run }) {
  const group = useRef(), leftDoor = useRef(), rightDoor = useRef(), leftGlyph = useRef(), rightGlyph = useRef();
  useFrame(() => {
    const s = run.current;
    if (group.current) group.current.visible = s.level === 9 || s.adventure?.worldState?.gateOpen;
    const isOpen = s.adventure?.worldState?.gateOpen || s.gateCharge >= 100;
    const slide = isOpen ? 1.6 : ((s.gateCharge || 0) / 100) * 1.4;
    if (leftDoor.current) leftDoor.current.position.x = -0.65 - slide;
    if (rightDoor.current) rightDoor.current.position.x = 0.65 + slide;
    if (leftGlyph.current) leftGlyph.current.material.opacity = ((s.gateCharge || 0) / 100) * 0.7 + 0.3;
    if (rightGlyph.current) rightGlyph.current.material.opacity = ((s.gateCharge || 0) / 100) * 0.7 + 0.3;
  });

  return (
    <group ref={group} position={GATE_POSITION}>
      <mesh position={[-1.7, 0, 0]}><cylinderGeometry args={[0.35, 0.42, 3.6, 8]} /><meshStandardMaterial color="#8e998a" flatShading /></mesh>
      <mesh position={[1.7, 0, 0]}><cylinderGeometry args={[0.35, 0.42, 3.6, 8]} /><meshStandardMaterial color="#8e998a" flatShading /></mesh>
      <mesh position={[0, 1.9, 0]}><boxGeometry args={[3.8, 0.45, 0.6]} /><meshStandardMaterial color="#9ba498" flatShading /></mesh>
      <mesh ref={leftDoor} position={[-0.65, 0, 0]}><boxGeometry args={[1.25, 3.3, 0.2]} /><meshStandardMaterial color="#7a8576" flatShading /></mesh>
      <mesh ref={rightDoor} position={[0.65, 0, 0]}><boxGeometry args={[1.25, 3.3, 0.2]} /><meshStandardMaterial color="#7a8576" flatShading /></mesh>
      <mesh ref={leftGlyph} position={[-1.7, 0, 0.35]}>
        <circleGeometry args={[0.26, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh ref={rightGlyph} position={[1.7, 0, 0.35]}>
        <circleGeometry args={[0.26, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

function FloralRingItem({ ring, index, run }) {
  const ringRef = useRef();
  useFrame(() => {
    const s = run.current;
    if (!ringRef.current) return;
    const isPassed = s.ringsPassed?.includes(ring.id);
    const isCurrent = s.ringsPassed?.length === index;
    ringRef.current.material.color.set(isPassed ? '#4ade80' : isCurrent ? '#facc15' : '#e2e8f0');
    ringRef.current.material.opacity = isPassed ? 0.8 : isCurrent ? 0.75 : 0.3;
  });

  return (
    <group position={ring.position}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.75, 0.06, 6, 24]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GuidedButterflyScene({ run, reducedMotion }) {
  const group = useRef(), bMesh = useRef();
  useFrame(({ clock }) => {
    const s = run.current;
    if (group.current) group.current.visible = s.level === 10;
    if (bMesh.current && s.butterflyPos) {
      bMesh.current.position.set(...s.butterflyPos);
      if (!reducedMotion) {
        bMesh.current.rotation.y = Math.sin(clock.elapsedTime * 8) * 0.2;
      }
    }
  });

  return (
    <group ref={group}>
      {BUTTERFLY_RINGS.map((ring, i) => (
        <FloralRingItem key={ring.id} ring={ring} index={i} run={run} />
      ))}
      <group position={BUTTERFLY_FLOWER}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.2, 8]} />
          <meshStandardMaterial color="#556550" />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial color="#f472b6" emissive="#f43f5e" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <group ref={bMesh} position={BUTTERFLY_START}>
        <mesh position={[0, 0, 0]} scale={[1, 1, 1.4]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[-0.22, 0.04, 0]} rotation={[0, 0, -0.2]}>
          <planeGeometry args={[0.42, 0.32]} />
          <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={0.5} side={2} />
        </mesh>
        <mesh position={[0.22, 0.04, 0]} rotation={[0, 0, 0.2]}>
          <planeGeometry args={[0.42, 0.32]} />
          <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={0.5} side={2} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshBasicMaterial color="#fed7aa" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function EnergyOrbScene({ run, reducedMotion }) {
  const group = useRef(), orbCore = useRef(), halo = useRef();
  useFrame(({ clock }) => {
    const s = run.current;
    if (group.current) group.current.visible = s.level === 11;
    if (orbCore.current) {
      const charge = (s.orbCharge || 0) / 100;
      const pulse = 1 + Math.sin(clock.elapsedTime * 6) * 0.1;
      orbCore.current.scale.setScalar((1 + charge * 0.5) * pulse);
      if (halo.current) halo.current.material.opacity = 0.2 + charge * 0.5;
    }
  });

  return (
    <group ref={group} position={ENERGY_ORB_POSITION}>
      <mesh ref={orbCore}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.0} roughness={0.1} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.75, 0.03, 6, 32]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.75, 0.03, 6, 32]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

function StarCrystalAndShrine({ run, reducedMotion }) {
  const group = useRef(), crystalMesh = useRef();
  useFrame(({ clock }) => {
    const s = run.current;
    if (group.current) group.current.visible = s.level === 12 || s.adventure?.worldState?.treeRestored;
    if (crystalMesh.current && s.objects?.star_crystal) {
      crystalMesh.current.position.set(...s.objects.star_crystal);
      if (!reducedMotion) crystalMesh.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={group}>
      <group position={TREE_SHRINE_POS}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[1.1, 1.3, 0.4, 12]} />
          <meshStandardMaterial color="#94a3b8" flatShading />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.65, 0.5, 8]} />
          <meshStandardMaterial color="#cbd5e1" flatShading />
        </mesh>
        <mesh position={[0, 0.77, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.45, 16]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      </group>
      <group ref={crystalMesh} position={STAR_CRYSTAL_POS}>
        <mesh>
          <dodecahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} roughness={0.1} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.65, 8, 8]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function RestoredForestBloom({ run }) {
  const group = useRef();
  const flowers = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => {
      const a = (i / 32) * Math.PI * 2;
      const r = 2.5 + (i % 5) * 1.2;
      const colors = ['#f472b6', '#facc15', '#38bdf8', '#c084fc', '#4ade80'];
      return {
        pos: [Math.cos(a) * r, 0.15, -1.0 + Math.sin(a) * r * 0.8],
        color: colors[i % colors.length],
      };
    });
  }, []);

  useFrame(() => {
    const s = run.current;
    if (group.current) {
      group.current.visible = !!s.adventure?.worldState?.plantsBloomed;
    }
  });

  return (
    <group ref={group} visible={false}>
      {flowers.map((fl, i) => (
        <group key={i} position={fl.pos}>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshStandardMaterial color={fl.color} emissive={fl.color} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.2, 4]} />
            <meshStandardMaterial color="#4ade80" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function ForestScene({ run, readInput, onSnapshot, reducedMotion }) {
  const published = useRef(0);
  const math = useMemo(() => ({ v: new Vector3(), target: new Vector3(), ray: new Raycaster(), pointer: new Vector2(), plane: new Plane(new Vector3(0, 0, 1), 0), hit: new Vector3() }), []);
  useFrame(({ camera, size, clock }, delta) => {
    const s = run.current;
    const project = position => {
      math.v.set(...position).project(camera);
      return { x: (math.v.x + 1) / 2, y: (1 - math.v.y) / 2, visible: math.v.z > -1 && math.v.z < 1 && Math.abs(math.v.x) < 1.15 && Math.abs(math.v.y) < 1.15 };
    };
    const input = readInput();
    const projections = {
      objects: {
        ...Object.fromEntries(objectDefinitions.map(o => [o.id, project(s.objects[o.id] || o.position)])),
        star_crystal: project(s.objects?.star_crystal || STAR_CRYSTAL_POS),
      },
      targets: Object.fromEntries(objectDefinitions.map(o => [o.id, project([o.target[0], o.target[1] + 0.3, o.target[2]])])),
      checkpoints: Object.fromEntries(checkpoints.map(p => [p.id, project(p.position)])),
      landmarks: Object.fromEntries(FOREST_LANDMARKS.map(l => [l.id, project(l.position)])),
      fireflies: Object.fromEntries(FIREFLY_CONFIGS.map(f => [f.id, project(f.initialPos)])),
      fruits: Object.fromEntries(FRUIT_DEFINITIONS.map(f => [f.id, project(s.objects?.[f.id] || f.position)])),
      basket: project(BASKET_POSITION),
      planks: Object.fromEntries(BRIDGE_PLANK_DEFINITIONS.map(p => [p.id, project(s.objects?.[p.id] || p.initialPos)])),
      bridgeSlots: Object.fromEntries(BRIDGE_PLANK_DEFINITIONS.map(p => [p.id, project(p.targetPos)])),
      stones: Object.fromEntries(MEMORY_STONE_DEFINITIONS.map(st => [st.id, project(st.position)])),
      rings: Object.fromEntries(BUTTERFLY_RINGS.map(r => [r.id, project(r.position)])),
      butterfly: project(s.butterflyPos || BUTTERFLY_START),
      treeShrine: project(TREE_SHRINE_POS),
    };
    stepForest(s, { ...input, ...projections, aspect: size.width / size.height,
      dragPoint: (pointer, id) => {
        math.pointer.set(pointer.x * 2 - 1, 1 - pointer.y * 2);
        math.ray.setFromCamera(math.pointer, camera);
        let planeZ = 0;
        if (id === 'crystal' || id === 'leaf') {
          planeZ = objectDefinitions.find(o => o.id === id)?.position[2] ?? 0;
        } else if (id?.startsWith('fruit_')) {
          planeZ = FRUIT_DEFINITIONS.find(f => f.id === id)?.position[2] ?? -0.8;
        } else if (id?.startsWith('plank_')) {
          planeZ = BRIDGE_PLANK_DEFINITIONS.find(p => p.id === id)?.initialPos[2] ?? -4.0;
        } else if (id === 'star_crystal') {
          planeZ = STAR_CRYSTAL_POS[2];
        }
        math.plane.constant = -planeZ;
        if (!math.ray.ray.intersectPlane(math.plane, math.hit)) return null;
        return [Math.max(-10, Math.min(10, math.hit.x)), Math.max(0.5, Math.min(7, math.hit.y)), math.hit.z];
      },
    }, delta * 1000);
    camera.position.set(0, 4.8, 12);
    math.target.set(Math.sin(s.control.yaw) * 14, 1.3 + s.control.tilt, 12 - Math.cos(s.control.yaw) * 14);
    camera.lookAt(math.target); camera.updateMatrixWorld();
    if (clock.elapsedTime - published.current > 0.08) {
      published.current = clock.elapsedTime;
      onSnapshot({ ...s, control: { ...s.control }, viewed: [...s.viewed], projections });
    }
  });
  return <>
    <color attach="background" args={['#dcebdd']} /><fog attach="fog" args={['#dcebdd', 20, 48]} />
    <hemisphereLight args={['#fffce7', '#719c68', 2]} /><directionalLight position={[-6, 12, 6]} intensity={2.2} color="#fff0c8" />
    <Scenery run={run} />
    <Waterfall reducedMotion={reducedMotion} />
    <StoneRuins />
    <ForestShrine />
    <GrandMagicTree run={run} reducedMotion={reducedMotion} />
    {checkpoints.map(p => <TrailMarker key={p.id} checkpoint={p} run={run} />)}
    {objectDefinitions.map(o => <React.Fragment key={o.id}><ForestObject definition={o} run={run} reducedMotion={reducedMotion} /><ForestTarget definition={o} run={run} /></React.Fragment>)}
    <Dragonflies run={run} reducedMotion={reducedMotion} />
    <FireflySwarm run={run} reducedMotion={reducedMotion} />
    <MagicFruitTree run={run} reducedMotion={reducedMotion} />
    <BridgeRepairPlanks run={run} reducedMotion={reducedMotion} />
    <MemorySteppingStones run={run} />
    <AncientMagicGate run={run} />
    <GuidedButterflyScene run={run} reducedMotion={reducedMotion} />
    <EnergyOrbScene run={run} reducedMotion={reducedMotion} />
    <StarCrystalAndShrine run={run} reducedMotion={reducedMotion} />
    <RestoredForestBloom run={run} />
  </>;
}
