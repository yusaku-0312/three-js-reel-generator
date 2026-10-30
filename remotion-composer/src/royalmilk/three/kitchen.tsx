import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../core";
import { Cup, CupPose, porcelain, teaRadius, teaSurface } from "../../golden2/three/models";
import { glowTexture } from "../../golden/three/textures";
import { LiquidDisc, Surface } from "./liquid";
import { boardBackTexture, boardFrontTexture, flagTexture, postcardTexture } from "./textures";

const lathe = (profile: Array<[number, number]>, segments = 96) =>
  new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), segments);

// ---------------------------------------------------------------------------
// Teacup with our own liquid (the golden2 cup is drawn empty; the disc sits at its tea level).
// ---------------------------------------------------------------------------

export const MilkCup: React.FC<{ pose: CupPose; fill: number; s: Surface }> = ({ pose, fill, s }) => (
  <>
    <Cup pose={pose} fill={0} />
    {fill > 0.02 && <LiquidDisc center={teaSurface(pose, fill)} radius={teaRadius(pose, fill) * 0.995} s={s} />}
  </>
);

// ---------------------------------------------------------------------------
// Pitcher: a small creamer (porcelain for milk, steel for hot water), posed by its spout lip like the teapot.
// ---------------------------------------------------------------------------

const PITCHER_PROFILE: Array<[number, number]> = [
  [0, 0], [0.2, 0], [0.24, 0.03], [0.27, 0.15], [0.26, 0.3], [0.22, 0.42], [0.23, 0.5], [0.215, 0.5], [0.205, 0.42],
  [0.245, 0.3], [0.255, 0.15], [0.225, 0.04], [0, 0.03],
];
const PITCHER_LIP: V3 = [0.29, 0.52, 0];
let pitcherGeo: THREE.LatheGeometry | null = null;

export type PitcherPose = { tip: V3; tilt: number; yaw?: number; scale?: number };

export const Pitcher: React.FC<{ pose: PitcherPose; steel?: boolean; opacity?: number }> = ({ pose, steel = false, opacity = 1 }) => {
  if (!pitcherGeo) pitcherGeo = lathe(PITCHER_PROFILE, 64);
  const mat = useMemo(
    () =>
      steel
        ? new THREE.MeshPhysicalMaterial({ color: "#c9ccd0", metalness: 1, roughness: 0.22, clearcoat: 0.4 })
        : porcelain(),
    [steel],
  );
  mat.transparent = opacity < 1;
  mat.opacity = opacity;
  if (opacity <= 0.01) return null;
  return (
    <group position={pose.tip} rotation={[0, pose.yaw ?? 0, 0]} scale={pose.scale ?? 1}>
      <group rotation={[0, 0, -pose.tilt]}>
        <group position={[-PITCHER_LIP[0], -PITCHER_LIP[1], 0]}>
          <mesh geometry={pitcherGeo} material={mat} castShadow />
          {/* spout: a short pinched trough at +x on the rim */}
          <mesh position={[0.24, 0.49, 0]} rotation={[0, 0, -0.5]} scale={[0.09, 0.03, 0.07]} material={mat}>
            <sphereGeometry args={[1, 16, 10]} />
          </mesh>
          <mesh position={[-0.27, 0.27, 0]} rotation={[0, 0, Math.PI / 2]} material={mat} castShadow>
            <torusGeometry args={[0.12, 0.028, 12, 32, Math.PI]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Gas burner with a ring of small blue flames; `flame` 0..1 (0 = off).
// ---------------------------------------------------------------------------

export const BURNER_TOP = 0.2;
const flameGeo = new THREE.ConeGeometry(1, 1, 10, 1, true);

export const Burner: React.FC<{ pos: V3; flame: number; f: number }> = ({ pos, flame, f }) => {
  const iron = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1b1b1d", roughness: 0.5, metalness: 0.6 }), []);
  const flameMat = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    [],
  );
  flameMat.color.set("#3f7bff").multiplyScalar(1.6 * flame);
  return (
    <group position={pos}>
      <mesh position-y={0.05} receiveShadow castShadow material={iron}>
        <cylinderGeometry args={[0.95, 1.0, 0.1, 48]} />
      </mesh>
      <mesh position-y={0.12} material={iron}>
        <cylinderGeometry args={[0.2, 0.24, 0.06, 32]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position-y={BURNER_TOP - 0.02} rotation-y={(i * Math.PI) / 4} material={iron}>
          <boxGeometry args={[1.7, 0.04, 0.05]} />
        </mesh>
      ))}
      <mesh position-y={BURNER_TOP - 0.02} rotation-x={Math.PI / 2} material={iron}>
        <torusGeometry args={[0.85, 0.025, 8, 48]} />
      </mesh>
      {flame > 0.02 &&
        Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2;
          const h = 0.11 * flame * (0.85 + 0.15 * Math.sin(f * 0.7 + i * 1.7));
          return (
            <mesh
              key={i}
              geometry={flameGeo}
              material={flameMat}
              position={[Math.cos(a) * 0.24, 0.15 + h / 2, Math.sin(a) * 0.24]}
              rotation={[Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]}
              scale={[0.03, h, 0.03]}
            />
          );
        })}
      {flame > 0.02 && (
        <sprite position={[0, 0.1, 0.7]} scale={0.5}>
          <spriteMaterial map={glowTexture()} color={new THREE.Color("#4d86ff").multiplyScalar(0.5 * flame)} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Enamel milk pan (cream outside, black rim) with a wooden handle; the liquid level follows `fill`.
// ---------------------------------------------------------------------------

const PAN_R = 0.66;
const PAN_FLOOR = 0.04;
const PAN_DEPTH = 0.4;
let panGeo: THREE.LatheGeometry | null = null;

/** Centre of the liquid surface in world space for a pan at `pos` (on the burner) and fill 0..1. */
export const panSurface = (pos: V3, fill: number): V3 => [pos[0], pos[1] + PAN_FLOOR + 0.01 + fill * (PAN_DEPTH - 0.1), pos[2]];
export const PAN_INNER = PAN_R - 0.035;

export const MilkPan: React.FC<{ pos: V3; fill: number; s: Surface; children?: React.ReactNode }> = ({ pos, fill, s, children }) => {
  if (!panGeo)
    panGeo = lathe([
      [0, 0], [PAN_R - 0.06, 0], [PAN_R, 0.05], [PAN_R + 0.01, PAN_DEPTH], [PAN_R + 0.04, PAN_DEPTH + 0.02], [PAN_R + 0.02, PAN_DEPTH + 0.035],
      [PAN_R - 0.025, PAN_DEPTH], [PAN_R - 0.035, 0.06], [PAN_R - 0.09, PAN_FLOOR], [0, PAN_FLOOR],
    ]);
  const enamel = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#efe4cf", roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1, side: THREE.DoubleSide }), []);
  const rim = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1d1712", roughness: 0.35 }), []);
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a5530", roughness: 0.5 }), []);
  return (
    <>
      <group position={pos}>
        <mesh geometry={panGeo} material={enamel} castShadow receiveShadow />
        <mesh position-y={PAN_DEPTH + 0.018} rotation-x={Math.PI / 2} material={rim}>
          <torusGeometry args={[PAN_R + 0.015, 0.022, 10, 96]} />
        </mesh>
        <group position={[PAN_R + 0.02, PAN_DEPTH - 0.06, 0]} rotation={[0, 0, 0.18]}>
          <mesh position-x={0.08} rotation-z={Math.PI / 2} material={rim}>
            <cylinderGeometry args={[0.045, 0.05, 0.16, 16]} />
          </mesh>
          <mesh position-x={0.6} rotation-z={Math.PI / 2} material={wood} castShadow>
            <cylinderGeometry args={[0.055, 0.045, 0.9, 16]} />
          </mesh>
        </group>
      </group>
      {fill > 0.02 && <LiquidDisc center={panSurface(pos, fill)} radius={PAN_INNER - 0.02 + fill * 0.03} s={s} />}
      {children}
    </>
  );
};

// ---------------------------------------------------------------------------
// Chalkboard menu stand: front = this café's menu, back = a London tea room menu. `spin` 0..1 turns it round.
// ---------------------------------------------------------------------------

export const BOARD_W = 1.6;
export const BOARD_H = 2.0;

export const MenuBoard: React.FC<{ pos: V3; spin: number; write: number; royal: number; cross: number; yaw?: number }> = ({
  pos,
  spin,
  write,
  royal,
  cross,
  yaw = 0,
}) => {
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6b4426", roughness: 0.6 }), []);
  const front = boardFrontTexture(write);
  const back = boardBackTexture(royal, cross);
  return (
    <group position={pos} rotation={[0, yaw + spin * Math.PI, 0]}>
      <group position-y={BOARD_H / 2 + 0.35} rotation-x={-0.08}>
        <mesh position-z={0.012} castShadow>
          <planeGeometry args={[BOARD_W, BOARD_H]} />
          <meshStandardMaterial map={front} roughness={0.85} />
        </mesh>
        <mesh position-z={-0.012} rotation-y={Math.PI}>
          <planeGeometry args={[BOARD_W, BOARD_H]} />
          <meshStandardMaterial map={back} roughness={0.85} />
        </mesh>
        <mesh material={frame}>
          <boxGeometry args={[BOARD_W + 0.02, BOARD_H + 0.02, 0.018]} />
        </mesh>
      </group>
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} material={frame} castShadow>
          <boxGeometry args={[0.07, 0.4, 0.07]} />
        </mesh>
      ))}
    </group>
  );
};

/** Toothpick flag that springs up out of the counter (`up` 0..1). */
export const FlagPick: React.FC<{ pos: V3; up: number; f: number }> = ({ pos, up, f }) => {
  if (up <= 0.01) return null;
  const sway = Math.sin(f / 9) * 0.08 * (1 - up) + Math.sin(f / 23) * 0.03;
  return (
    <group position={pos} scale={up} rotation={[0, -0.35, sway]}>
      <mesh position-y={0.4}>
        <cylinderGeometry args={[0.012, 0.012, 0.8, 8]} />
        <meshStandardMaterial color="#e8d3a8" roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.68, 0]}>
        <planeGeometry args={[0.38, 0.25]} />
        <meshStandardMaterial map={flagTexture()} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
    </group>
  );
};

/** Sepia postcard of a Kyoto tea shop on a small wooden easel. */
export const Postcard: React.FC<{ pos: V3; k: number; yaw?: number }> = ({ pos, k, yaw = 0 }) => {
  if (k <= 0.01) return null;
  return (
    <group position={pos} rotation={[0, yaw, 0]} scale={0.7 + 0.3 * k}>
      <mesh position={[0, 0.62, 0]} rotation-x={-0.2} castShadow>
        <planeGeometry args={[1.6, 1.12]} />
        <meshStandardMaterial map={postcardTexture()} roughness={0.8} transparent opacity={k} />
      </mesh>
      <mesh position={[0, 0.07, 0.12]}>
        <boxGeometry args={[1.5, 0.06, 0.1]} />
        <meshStandardMaterial color="#6b4426" roughness={0.6} transparent opacity={k} />
      </mesh>
    </group>
  );
};
