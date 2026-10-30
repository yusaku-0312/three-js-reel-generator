import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../core";
import { asphaltTexture, pavingTexture, signTexture, windowTexture } from "./textures";
import { Glow } from "./fx";

// Street map (child ≈ 1.0 tall). The road runs along z; the school route goes from the school (far, -z)
// toward home (near, +z). Right side x > 0.2, left side x < -3.2.
export const TOWN = {
  schoolGate: [2.05, 0, -21] as V3,
  shopDoor: [2.15, 0, -9.5] as V3,
  house110: [-4.95, 0, -3.5] as V3,
  homeGate: [-4.95, 0, 6.5] as V3,
  van: [-0.75, 0, -1.4] as V3,
  /** Mom's kitchen inside the home (seen through the front window). */
  kitchen: [-7.2, 0, 7.6] as V3,
};

export type TownState = {
  /** Van sliding door 0 = shut, 1 = open. */
  vanDoor?: number;
  /** Extra light in the shop / school entrance / 110 sign (0..1) when they are named. */
  shop?: number;
  school?: number;
  sign110?: number;
};

const SIDEWALK_Y = 0.06;

const Box: React.FC<{ size: V3; pos: V3; color: string; rough?: number; map?: THREE.Texture; emissive?: string; emissiveIntensity?: number; cast?: boolean }> = ({
  size,
  pos,
  color,
  rough = 0.85,
  map,
  emissive,
  emissiveIntensity = 0,
  cast = true,
}) => (
  <mesh position={pos} castShadow={cast} receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={rough} map={map} emissive={emissive ?? "#000000"} emissiveIntensity={emissiveIntensity} />
  </mesh>
);

const tiled = (tex: THREE.Texture, rx: number, ry: number) => {
  const t = tex.clone();
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
};

const Ground: React.FC = () => {
  const asphalt = useMemo(() => tiled(asphaltTexture(), 2, 26), []);
  const paving = useMemo(() => tiled(pavingTexture(), 1, 30), []);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -10]} receiveShadow>
        <planeGeometry args={[80, 90]} />
        <meshStandardMaterial color="#5d5a4f" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-1.5, 0.002, -14]} receiveShadow>
        <planeGeometry args={[3.4, 52]} />
        <meshStandardMaterial map={asphalt} roughness={0.92} />
      </mesh>
      {[0.06, -3.06].map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.004, -14]}>
          <planeGeometry args={[0.07, 52]} />
          <meshStandardMaterial color="#f2efe6" roughness={0.7} />
        </mesh>
      ))}
      {/* crosswalk stripes toward home */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-2.85 + i * 0.55, 0.005, 3.1]} receiveShadow>
          <planeGeometry args={[0.32, 1.8]} />
          <meshStandardMaterial color="#f4f1e8" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[1.05, SIDEWALK_Y / 2, -14]} receiveShadow>
        <boxGeometry args={[1.7, SIDEWALK_Y, 52]} />
        <meshStandardMaterial map={paving} roughness={0.9} />
      </mesh>
      <mesh position={[-4.05, SIDEWALK_Y / 2, -14]} receiveShadow>
        <boxGeometry args={[1.7, SIDEWALK_Y, 52]} />
        <meshStandardMaterial map={paving} roughness={0.9} />
      </mesh>
    </>
  );
};

/** White pipe guardrail along the right sidewalk, open by the van and at the crosswalk. */
const Guardrail: React.FC = () => {
  const spans: Array<[number, number]> = [
    [-38, -3.4],
    [0.6, 2.0],
    [4.2, 12],
  ];
  return (
    <>
      {spans.map(([a, b]) => {
        const posts = Math.max(2, Math.round((b - a) / 1.3) + 1);
        return (
          <group key={a}>
            {Array.from({ length: posts }, (_, i) => (
              <mesh key={i} position={[0.32, 0.38, a + ((b - a) * i) / (posts - 1)]} castShadow>
                <cylinderGeometry args={[0.035, 0.035, 0.7, 8]} />
                <meshStandardMaterial color="#f2f2ee" roughness={0.4} />
              </mesh>
            ))}
            {[0.46, 0.7].map((y) => (
              <mesh key={y} position={[0.32, y, (a + b) / 2]} rotation-x={Math.PI / 2} castShadow>
                <cylinderGeometry args={[0.03, 0.03, b - a, 8]} />
                <meshStandardMaterial color="#f7f7f3" roughness={0.35} />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
};

type HouseSpec = { x: number; z: number; w: number; d: number; h: number; wall: string; roof: string; seed: number; facing: 1 | -1 };

const House: React.FC<{ s: HouseSpec; glow: number }> = ({ s, glow }) => {
  const front = s.x - (s.facing * s.w) / 2 - s.facing * 0.01;
  const win = windowTexture(s.seed);
  return (
    <group>
      <Box size={[s.w, s.h, s.d]} pos={[s.x, s.h / 2, s.z]} color={s.wall} />
      <group position={[s.x, s.h + 0.42, s.z]} scale={[s.w * 0.78, 1, s.d * 0.78]}>
        <mesh rotation-y={Math.PI / 4} castShadow>
          <cylinderGeometry args={[0.001, 1, 0.84, 4, 1]} />
          <meshStandardMaterial color={s.roof} roughness={0.7} />
        </mesh>
      </group>
      {[0.34, 0.72].map((fy, i) =>
        [-0.25, 0.25].map((fz) => (
          <mesh key={`${i}${fz}`} position={[front, s.h * fy, s.z + fz * s.d]} rotation-y={-s.facing * Math.PI / 2}>
            <planeGeometry args={[0.55, 0.5]} />
            <meshStandardMaterial map={win} emissiveMap={win} emissive="#ffffff" emissiveIntensity={0.35 + glow} roughness={0.3} />
          </mesh>
        )),
      )}
      {/* block wall in front */}
      <Box size={[0.14, 0.5, s.d * 0.8]} pos={[s.x - (s.facing * (s.w / 2 + 0.6)), 0.25, s.z - s.d * 0.08]} color="#bdb4a6" />
    </group>
  );
};

const HOUSES: HouseSpec[] = [
  { x: 4.0, z: 3.5, w: 3, d: 4, h: 2.4, wall: "#e9e0d0", roof: "#5a6a7a", seed: 1, facing: 1 },
  { x: 4.2, z: 10.5, w: 3, d: 4.4, h: 2.6, wall: "#d8cdb8", roof: "#7a4a3a", seed: 2, facing: 1 },
  { x: 4.0, z: -16.5, w: 3, d: 4.4, h: 2.4, wall: "#e4d9c6", roof: "#4c5b6c", seed: 3, facing: 1 },
  { x: -7.0, z: -10.5, w: 3, d: 4.4, h: 2.5, wall: "#ddd2bf", roof: "#6b4a3b", seed: 4, facing: -1 },
  { x: -7.0, z: -17.5, w: 3.2, d: 4.6, h: 2.7, wall: "#e9e2d4", roof: "#56616e", seed: 5, facing: -1 },
  { x: -7.0, z: -25.0, w: 3.2, d: 5, h: 2.5, wall: "#d6c9b1", roof: "#7b5141", seed: 6, facing: -1 },
  { x: 4.2, z: -38, w: 3, d: 4, h: 2.4, wall: "#e2d6c2", roof: "#5d4a40", seed: 7, facing: 1 },
];

/** 子ども110番の家: an ordinary house with the yellow plate on its gate wall. */
const House110: React.FC<{ glow: number; sign: number }> = ({ glow, sign }) => {
  const plate = signTexture("子ども110番の家", "#ffd23a", "#c0262d", 640, 200);
  return (
    <group>
      <House s={{ x: -7.0, z: -3.5, w: 3.2, d: 4.6, h: 2.6, wall: "#efe7d8", roof: "#4a6a5a", seed: 8, facing: -1 }} glow={glow} />
      <mesh position={[TOWN.house110[0] + 0.04, 0.62, TOWN.house110[2]]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.9, 0.28]} />
        <meshStandardMaterial map={plate} emissiveMap={plate} emissive="#ffffff" emissiveIntensity={0.25 + sign * 1.6} roughness={0.5} />
      </mesh>
      <Box size={[0.14, 0.9, 3.2]} pos={[-5.0, 0.45, -3.5]} color="#c9c0b0" />
    </group>
  );
};

/** The child's home: a big front window into a lit kitchen, so mom can be seen inside. */
const Home: React.FC<{ glow: number }> = ({ glow }) => (
  <group>
    <Box size={[0.12, 2.6, 4.6]} pos={[-9.6, 1.3, 7.6]} color="#e8dcc6" />
    <Box size={[4.4, 2.6, 0.12]} pos={[-7.4, 1.3, 5.3]} color="#efe5d3" />
    <Box size={[4.4, 2.6, 0.12]} pos={[-7.4, 1.3, 9.9]} color="#efe5d3" />
    <Box size={[4.4, 0.1, 4.6]} pos={[-7.4, 2.65, 7.6]} color="#d9ccb5" />
    <mesh position={[-7.4, 3.1, 7.6]} rotation-y={Math.PI / 4} castShadow>
      <cylinderGeometry args={[0.001, 3.4, 0.9, 4, 1]} />
      <meshStandardMaterial color="#8a5240" roughness={0.7} />
    </mesh>
    {/* inside: warm walls and floor carry the window light */}
    <Box size={[0.05, 2.5, 4.4]} pos={[-9.5, 1.25, 7.6]} color="#ffe2b8" emissive="#ffcf8a" emissiveIntensity={0.25 + glow * 0.5} cast={false} />
    <Box size={[4.2, 0.04, 4.4]} pos={[-7.4, 0.02, 7.6]} color="#c99b6b" cast={false} />
    {/* front wall around the window opening */}
    <Box size={[0.12, 0.7, 4.6]} pos={[-5.2, 0.35, 7.6]} color="#efe5d3" />
    <Box size={[0.12, 0.5, 4.6]} pos={[-5.2, 2.35, 7.6]} color="#efe5d3" />
    <Box size={[0.12, 1.4, 0.6]} pos={[-5.2, 1.4, 5.6]} color="#efe5d3" />
    <Box size={[0.12, 1.4, 0.6]} pos={[-5.2, 1.4, 9.6]} color="#efe5d3" />
    <mesh position={[-5.2, 1.4, 7.6]} rotation-y={Math.PI / 2}>
      <planeGeometry args={[3.4, 1.4]} />
      <meshPhysicalMaterial color="#ffe9c8" transparent opacity={0.12} roughness={0.05} metalness={0} />
    </mesh>
    {/* kitchen table */}
    <Box size={[0.9, 0.06, 1.3]} pos={[-7.4, 0.62, 7.9]} color="#a8754a" />
    <Box size={[0.08, 0.6, 0.08]} pos={[-7.4, 0.3, 7.9]} color="#8a5c38" />
    <pointLight position={[-7.6, 2.2, 7.6]} color="#ffc27a" intensity={6 + glow * 8} distance={6} decay={1.8} />
    <Box size={[0.14, 0.6, 3.2]} pos={[-5.0, 0.3, 2.9]} color="#c9c0b0" />
  </group>
);

const Shop: React.FC<{ lit: number }> = ({ lit }) => {
  const sign = signTexture("まちのストア", "#2f6f6a", "#fff6df", 640, 160);
  return (
    <group>
      <Box size={[4, 2.4, 5]} pos={[4.15, 1.2, -9.5]} color="#e8e4dc" />
      <mesh position={[2.13, 1.0, -9.5]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[4.4, 1.6]} />
        <meshStandardMaterial color="#9fb8c4" emissive="#eaf6ff" emissiveIntensity={0.08 + lit * 0.18} roughness={0.2} />
      </mesh>
      {[-1.4, -0.4, 0.6, 1.6].map((dz) => (
        <Box key={dz} size={[0.05, 1.2, 0.08]} pos={[2.12, 0.9, -9.5 + dz]} color="#5a6a70" cast={false} />
      ))}
      <mesh position={[1.95, 2.0, -9.5]} rotation={[0, -Math.PI / 2, 0.35]} castShadow>
        <planeGeometry args={[4.6, 0.6]} />
        <meshStandardMaterial color="#e8873a" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[2.12, 2.3, -9.5]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[2.2, 0.55]} />
        <meshStandardMaterial map={sign} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.3 + lit * 0.4} />
      </mesh>
      <pointLight position={[1.5, 1.2, -9.5]} color="#e8f4ff" intensity={1 + lit * 3} distance={4} decay={1.8} />
    </group>
  );
};

const School: React.FC<{ lit: number }> = ({ lit }) => {
  const plate = signTexture("みどり小学校", "#f4efe2", "#2b3a3a", 512, 140);
  return (
    <group>
      <Box size={[6, 4.2, 11]} pos={[6.8, 2.1, -28]} color="#efe8da" />
      {[1, 2.3, 3.6].map((y) =>
        Array.from({ length: 6 }, (_, i) => (
          <mesh key={`${y}${i}`} position={[3.79, y, -32.5 + i * 1.7]} rotation-y={-Math.PI / 2}>
            <planeGeometry args={[1.1, 0.75]} />
            <meshStandardMaterial color="#9fc4d8" emissive="#fff0c8" emissiveIntensity={0.15 + lit * 0.5} roughness={0.2} />
          </mesh>
        )),
      )}
      {[-19.9, -22.1].map((z) => (
        <Box key={z} size={[0.35, 1.3, 0.35]} pos={[2.1, 0.65, z]} color="#cfc6b6" />
      ))}
      <mesh position={[1.92, 1.0, -22.1]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[0.3, 0.9]} />
        <meshStandardMaterial color="#f4efe2" />
      </mesh>
      <mesh position={[1.91, 0.95, -19.9]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[0.32, 0.09 * 9]} />
        <meshStandardMaterial map={plate} emissiveMap={plate} emissive="#ffffff" emissiveIntensity={0.2 + lit} />
      </mesh>
      <Box size={[0.14, 0.9, 12]} pos={[2.1, 0.45, -28]} color="#c9c0b0" />
    </group>
  );
};

const Streetlight: React.FC<{ z: number; on: number }> = ({ z, on }) => (
  <group>
    <mesh position={[1.75, 1.6, z]} castShadow>
      <cylinderGeometry args={[0.04, 0.05, 3.2, 8]} />
      <meshStandardMaterial color="#9aa0a6" roughness={0.5} metalness={0.4} />
    </mesh>
    <Box size={[0.7, 0.05, 0.08]} pos={[1.45, 3.15, z]} color="#9aa0a6" />
    <mesh position={[1.15, 3.08, z]}>
      <boxGeometry args={[0.3, 0.06, 0.16]} />
      <meshStandardMaterial color="#fff4dc" emissive="#ffe2a8" emissiveIntensity={1.0 + on * 1.4} />
    </mesh>
    <Glow pos={[1.15, 3.0, z]} size={0.7} color="#ffd59a" intensity={0.12 + on * 0.3} />
  </group>
);

/** 電柱 with sagging wires along the left side. */
const Poles: React.FC = () => {
  const zs = [-25, -16, -7, 2, 11];
  const wire = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < zs.length - 1; i++)
      for (let k = 0; k <= 12; k++) {
        const t = k / 12;
        pts.push(new THREE.Vector3(-4.75, 4.0 - Math.sin(t * Math.PI) * 0.35, zs[i] + (zs[i + 1] - zs[i]) * t));
      }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  return (
    <>
      {zs.map((z) => (
        <group key={z}>
          <mesh position={[-4.75, 2.2, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 4.4, 8]} />
            <meshStandardMaterial color="#8d8a82" roughness={0.8} />
          </mesh>
          <Box size={[0.9, 0.06, 0.06]} pos={[-4.75, 4.05, z]} color="#6f6c66" />
        </group>
      ))}
      <line>
        <primitive object={wire} attach="geometry" />
        <lineBasicMaterial color="#2b2a30" />
      </line>
    </>
  );
};

const Tree: React.FC<{ pos: V3; s: number }> = ({ pos, s }) => (
  <group position={pos} scale={s}>
    <mesh position={[0, 0.6, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.11, 1.2, 8]} />
      <meshStandardMaterial color="#6a4b34" />
    </mesh>
    <mesh position={[0, 1.55, 0]} castShadow>
      <icosahedronGeometry args={[0.75, 1]} />
      <meshStandardMaterial color="#4f7a46" roughness={0.9} flatShading />
    </mesh>
  </group>
);

/** The van parked by the gap in the guardrail; its sliding door faces the sidewalk. */
const Van: React.FC<{ door: number }> = ({ door }) => {
  const [x, , z] = TOWN.van;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.25, 3.3]} />
        <meshPhysicalMaterial color="#3c4352" roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, 1.08, -1.66]}>
        <planeGeometry args={[1.2, 0.55]} />
        <meshStandardMaterial color="#141820" roughness={0.1} metalness={0.4} />
      </mesh>
      {[-1.1, 0.0, 1.05].map((dz) => (
        <mesh key={dz} position={[0.68, 1.12, dz]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.85, 0.42]} />
          <meshStandardMaterial color="#141820" roughness={0.1} metalness={0.4} />
        </mesh>
      ))}
      {/* sliding door: dark opening behind, the panel slides back along the body */}
      <mesh position={[0.676, 0.72, 0.05]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[1.05 * door, 1.0]} />
        <meshBasicMaterial color="#07080b" />
      </mesh>
      <mesh position={[0.7, 0.72, 0.05 + door * 1.05]} castShadow>
        <boxGeometry args={[0.03, 1.02, 1.05]} />
        <meshPhysicalMaterial color="#454c5c" roughness={0.35} clearcoat={0.8} />
      </mesh>
      {[-1.15, 1.15].map((dz) =>
        [-0.62, 0.62].map((dx) => (
          <mesh key={`${dz}${dx}`} position={[dx, 0.24, dz]} rotation-z={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.16, 16]} />
            <meshStandardMaterial color="#1b1d22" roughness={0.8} />
          </mesh>
        )),
      )}
    </group>
  );
};

export const Town: React.FC<{ f: number; state: TownState; evening: number }> = ({ state, evening }) => {
  const glow = evening * 0.9;
  return (
    <>
      <Ground />
      <Guardrail />
      {HOUSES.map((s) => (
        <House key={s.seed} s={s} glow={glow} />
      ))}
      <House110 glow={glow} sign={state.sign110 ?? 0} />
      <Home glow={glow} />
      <Shop lit={state.shop ?? 0} />
      <School lit={state.school ?? 0} />
      {[-18, -11, -6.2, 3, 10].map((z) => (
        <Streetlight key={z} z={z} on={evening} />
      ))}
      <Poles />
      {(
        [
          [5.8, 0, -4.5, 1.1],
          [6.2, 0, 7, 1.2],
          [-9.5, 0, -7.5, 1.0],
          [-9.8, 0, -21, 1.3],
          [5.6, 0, -13, 0.9],
        ] as Array<[number, number, number, number]>
      ).map(([x, y, z, s]) => (
        <Tree key={`${x}${z}`} pos={[x, y, z]} s={s} />
      ))}
      <Van door={state.vanDoor ?? 0} />
    </>
  );
};
