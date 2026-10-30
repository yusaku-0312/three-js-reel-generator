import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp01, V3 } from "../core";
import { Glow, hdr, HACK_RED, LED_BLUE, SAFE_TEAL } from "../../camerahack/three/devices";
import { frostTexture, laptopTalkTexture, Screen, screenTexture } from "./screens";

export { AICore, CallLine, Waveform } from "../../aimukae/three/fx";
export { Figure, walkAlong } from "../../aimukae/three/figures";
export { HACK_RED, LED_BLUE, MonitorCam, Padlock, ProgressRing, SAFE_TEAL, Stranger } from "../../camerahack/three/devices";

export const AI_CYAN = "#5ff0ff";
/** Mother's real voice and the bubbles that sound like her. */
export const WARM = "#ffb052";

/** A small smartphone with this reel's screens; `next` cross-fades over `screen`. */
export const Phone: React.FC<{
  pos: V3;
  rot?: V3;
  h?: number;
  screen: Screen;
  next?: Screen;
  mix?: number;
  glow?: number;
  glowColor?: string;
  k?: number;
}> = ({ pos, rot = [0, 0, 0], h = 1, screen, next, mix = 0, glow = 0, glowColor = LED_BLUE, k = 1 }) => {
  const w = h * 0.5;
  const d = h * 0.07;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, w * 0.16), [w, h, d]);
  if (k <= 0.001) return null;
  const m = next ? clamp01(mix) : 0;
  const bright = new THREE.Color(1, 1, 1).multiplyScalar(0.92);
  return (
    <group position={pos} rotation={rot} scale={0.6 + 0.4 * k}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#20242e" roughness={0.3} metalness={0.5} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.9, h * 0.93]} />
        <meshBasicMaterial map={screenTexture(screen)} color={bright} toneMapped transparent opacity={k} />
      </mesh>
      {next && m > 0 && (
        <mesh position={[0, 0, d / 2 + 0.003]}>
          <planeGeometry args={[w * 0.9, h * 0.93]} />
          <meshBasicMaterial map={screenTexture(next)} color={bright} transparent opacity={m * k} toneMapped />
        </mesh>
      )}
      {glow > 0 && <Glow pos={[0, 0, -d]} size={h * 1.7} color={glowColor} intensity={glow * 0.4 * k} />}
    </group>
  );
};

/** The stranger's laptop with the monitor app's talk button held (red). */
export const TalkLaptop: React.FC<{ pos: V3; yaw?: number; s?: number; k?: number }> = ({ pos, yaw = 0, s = 1, k = 1 }) => {
  const base = useMemo(() => new RoundedBoxGeometry(1.0, 0.04, 0.66, 3, 0.02), []);
  const lid = useMemo(() => new RoundedBoxGeometry(1.0, 0.64, 0.03, 3, 0.02), []);
  if (k <= 0.001) return null;
  return (
    <group position={pos} rotation-y={yaw} scale={s * (0.6 + 0.4 * k)}>
      <mesh geometry={base} position={[0, 0.02, 0]}>
        <meshPhysicalMaterial color="#2a2e38" roughness={0.35} metalness={0.6} />
      </mesh>
      <group position={[0, 0.04, -0.32]} rotation-x={-0.22}>
        <mesh geometry={lid} position={[0, 0.32, 0]}>
          <meshPhysicalMaterial color="#2a2e38" roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.32, 0.017]}>
          <planeGeometry args={[0.94, 0.58]} />
          <meshBasicMaterial map={laptopTalkTexture()} color={new THREE.Color(1, 1, 1).multiplyScalar(0.9)} toneMapped transparent opacity={k} />
        </mesh>
        <Glow pos={[0, 0.32, 0.1]} size={1.4} color={HACK_RED} intensity={0.22 * k} />
      </group>
    </group>
  );
};

/** Height of the thumb-turn above the door's bottom edge (door units). */
export const LOCK_Y = 1.18;
export const LOCK_X = 0.36;

/**
 * The front door (origin at the bottom centre, 1 wide × 2 tall): dark clear-coated wood, a frosted glass strip,
 * a lever handle and a thumb-turn lock above it. `turn` 0 = locked (bar vertical) → 1 = unlocked (bar
 * horizontal); `lockGlow` lights the lock red (opened) or teal (kept shut). `hand` 0..1 brings a child's
 * wooden arm in from the lower right to the thumb-turn. `figure` shows someone standing outside the glass.
 */
export const FrontDoor: React.FC<{
  pos: V3;
  s?: number;
  yaw?: number;
  turn?: number;
  lockGlow?: number;
  glowColor?: string;
  hand?: number;
  figure?: boolean;
  k?: number;
}> = ({ pos, s = 1, yaw = 0, turn = 0, lockGlow = 0, glowColor = HACK_RED, hand = 0, figure = false, k = 1 }) => {
  const slab = useMemo(() => new RoundedBoxGeometry(1.0, 2.0, 0.07, 3, 0.015), []);
  if (k <= 0.001) return null;
  const wood = "#5b3b27";
  const metal = "#c9ccd2";
  const h = clamp01(hand);
  const reach: V3 = [LOCK_X + 0.07, LOCK_Y - 0.02, 0.12];
  const from: V3 = [LOCK_X + 0.75, LOCK_Y - 0.75, 0.35];
  const tip: V3 = [from[0] + (reach[0] - from[0]) * h, from[1] + (reach[1] - from[1]) * h, from[2] + (reach[2] - from[2]) * h];
  const armDir = new THREE.Vector3(from[0] - tip[0], from[1] - tip[1], from[2] - tip[2]);
  const armLen = 0.55;
  const armQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), armDir.clone().normalize());
  const armMid: V3 = [tip[0] + armDir.x / armDir.length() * armLen * 0.5, tip[1] + armDir.y / armDir.length() * armLen * 0.5, tip[2] + armDir.z / armDir.length() * armLen * 0.5];
  return (
    <group position={pos} rotation-y={yaw} scale={s * (0.85 + 0.15 * k)}>
      {/* frame */}
      {[
        [-0.56, 1.03, 0.12, 2.12],
        [0.56, 1.03, 0.12, 2.12],
        [0, 2.08, 1.24, 0.12],
      ].map(([x, y, w, hh], i) => (
        <mesh key={i} position={[x, y, -0.02]} receiveShadow>
          <boxGeometry args={[w, hh, 0.14]} />
          <meshStandardMaterial color="#e9e2d6" roughness={0.6} />
        </mesh>
      ))}
      <mesh geometry={slab} position={[0, 1.0, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial color={wood} roughness={0.45} clearcoat={0.6} clearcoatRoughness={0.3} />
      </mesh>
      {/* frosted glass strip */}
      <mesh position={[-0.24, 1.32, 0.037]}>
        <planeGeometry args={[0.16, 0.95]} />
        <meshStandardMaterial map={frostTexture(figure)} emissive="#ffffff" emissiveMap={frostTexture(figure)} emissiveIntensity={0.28} roughness={0.3} />
      </mesh>
      {/* lever handle */}
      <mesh position={[LOCK_X, 0.98, 0.05]}>
        <cylinderGeometry args={[0.045, 0.045, 0.03, 20]} />
        <meshStandardMaterial color={metal} metalness={0.35} roughness={0.35} emissive={metal} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[LOCK_X - 0.08, 0.98, 0.09]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.022, 0.16, 4, 10]} />
        <meshStandardMaterial color={metal} metalness={0.35} roughness={0.35} emissive={metal} emissiveIntensity={0.08} />
      </mesh>
      {/* thumb-turn */}
      <group position={[LOCK_X, LOCK_Y, 0.04]}>
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.075, 0.075, 0.025, 28]} />
          <meshStandardMaterial color={metal} metalness={0.35} roughness={0.3} emissive={metal} emissiveIntensity={0.08} />
        </mesh>
        <mesh position={[0, 0, 0.035]} rotation-z={-turn * Math.PI * 0.5}>
          <boxGeometry args={[0.035, 0.12, 0.045]} />
          <meshStandardMaterial color={metal} metalness={0.35} roughness={0.3} emissive={lockGlow > 0 ? glowColor : metal} emissiveIntensity={0.08 + lockGlow * 0.6} />
        </mesh>
        {lockGlow > 0 && <Glow pos={[0, 0, 0.06]} size={0.5} color={glowColor} intensity={0.35 * lockGlow} />}
      </group>
      {h > 0.01 && (
        <group>
          <mesh position={tip} castShadow>
            <sphereGeometry args={[0.05, 14, 10]} />
            <meshPhysicalMaterial color="#e9cfa8" roughness={0.55} clearcoat={0.4} />
          </mesh>
          <mesh position={armMid} quaternion={armQ} castShadow>
            <capsuleGeometry args={[0.045, armLen, 4, 10]} />
            <meshStandardMaterial color="#f2c94a" roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/** Floor ring of light (the promise between parent and child). */
export const FloorRing: React.FC<{ pos: V3; r: number; k: number; color?: string }> = ({ pos, r, k, color = SAFE_TEAL }) =>
  k <= 0.001 ? null : (
    <mesh position={pos} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[r * 0.9, r, 64]} />
      <meshBasicMaterial color={hdr(color, 0.9 * k)} transparent opacity={0.85 * k} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
