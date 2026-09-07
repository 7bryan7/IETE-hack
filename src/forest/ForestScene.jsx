import React, { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Raycaster, Vector2, Vector3 } from 'three';
import { checkpoints, objectDefinitions } from './forestLevels.js';
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
const Scenery = memo(function Scenery() {
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
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0, 0.26 + Math.sin(i / 8 * Math.PI) * 0.2, -7.6 + i * 0.4]}><boxGeometry args={[2.5, 0.15, 0.35]} /><meshStandardMaterial color={i % 2 ? '#b58a5c' : '#c7a16d'} /></mesh>)}
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

function Fireflies({ reducedMotion }) {
  const group = useRef();
  useFrame(({ clock }) => { if (!reducedMotion) { group.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.15; group.current.rotation.y = Math.sin(clock.elapsedTime * 0.1) * 0.04; } });
  return <group ref={group}>{Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[Math.sin(i * 12.3) * 8, 0.8 + (i % 4) * 0.6, Math.cos(i * 4.6) * 6 - 2]}><sphereGeometry args={[0.025, 4, 4]} /><meshBasicMaterial color="#fff8ca" /></mesh>)}</group>;
}

export default function ForestScene({ run, readInput, onSnapshot, reducedMotion }) {
  const published = useRef(0);
  const math = useMemo(() => ({ v: new Vector3(), target: new Vector3(), ray: new Raycaster(), pointer: new Vector2(), plane: new Plane(new Vector3(0, 0, 1), 0), hit: new Vector3() }), []);
  useFrame(({ camera, size, clock }, delta) => {
    const s = run.current;
    const project = position => {
      math.v.set(...position).project(camera);
      return { x: (math.v.x + 1) / 2, y: (1 - math.v.y) / 2, visible: math.v.z > -1 && math.v.z < 1 && Math.abs(math.v.x) < 1 && Math.abs(math.v.y) < 1 };
    };
    const input = readInput();
    const projections = {
      objects: Object.fromEntries(objectDefinitions.map(o => [o.id, project(s.objects[o.id])])),
      targets: Object.fromEntries(objectDefinitions.map(o => [o.id, project([o.target[0], o.target[1] + 0.3, o.target[2]])])),
      checkpoints: Object.fromEntries(checkpoints.map(p => [p.id, project(p.position)])),
    };
    stepForest(s, { ...input, ...projections, aspect: size.width / size.height,
      dragPoint: (pointer, id) => {
        math.pointer.set(pointer.x * 2 - 1, 1 - pointer.y * 2);
        math.ray.setFromCamera(math.pointer, camera);
        math.plane.constant = -objectDefinitions.find(o => o.id === id).position[2];
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
    <Scenery />
    {checkpoints.map(p => <TrailMarker key={p.id} checkpoint={p} run={run} />)}
    {objectDefinitions.map(o => <React.Fragment key={o.id}><ForestObject definition={o} run={run} reducedMotion={reducedMotion} /><ForestTarget definition={o} run={run} /></React.Fragment>)}
    <Fireflies reducedMotion={reducedMotion} />
  </>;
}
