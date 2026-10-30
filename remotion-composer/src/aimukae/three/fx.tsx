import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp01, rng, useGeometry, V3 } from "../core";
import { Glow } from "../../golden2/three/fx";

export { Glow, Sparkles } from "../../golden2/three/fx";

export const hdr = (color: string, intensity: number) => new THREE.Color(color).multiplyScalar(intensity);

export const PINK = "#ff7ab6";
export const CYAN = "#5ff0ff";
export const TEAL = "#20d0b8";
export const RED = "#ff3b4a";

/**
 * Voice waveform: a row of glowing bars. The same `seed` draws the same shape (so a clone matches its
 * source). `live` makes it speak; `glitch` adds the cyan offset copy and jitter that marks a fake.
 */
export const Waveform: React.FC<{
  pos: V3;
  f: number;
  width?: number;
  height?: number;
  bars?: number;
  seed?: number;
  color?: string;
  live?: number;
  glitch?: number;
  grow?: number;
  intensity?: number;
  yaw?: number;
}> = ({ pos, f, width = 1.6, height = 0.6, bars = 28, seed = 3, color = PINK, live = 1, glitch = 0, grow = 1, intensity = 1.6, yaw = 0 }) => {
  const shape = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: bars }, (_, i) => {
      const env = Math.sin(((i + 0.5) / bars) * Math.PI);
      return { base: 0.25 + 0.75 * env * (0.4 + r() * 0.6), ph: r() * 6.28, sp: 0.25 + r() * 0.2 };
    });
  }, [bars, seed]);
  const g = clamp01(grow);
  if (g <= 0 || intensity <= 0) return null;
  const gap = width / bars;
  const jr = rng(Math.floor(f / 2) + seed * 31);
  return (
    <group position={pos} rotation-y={yaw}>
      {shape.map((b, i) => {
        const visible = (i + 1) / bars <= g + 0.001;
        if (!visible) return null;
        const talk = 0.55 + 0.45 * Math.abs(Math.sin(f * b.sp + b.ph));
        const h = Math.max(0.03, height * b.base * (1 - live + live * talk));
        const x = -width / 2 + gap * (i + 0.5);
        const jitter = glitch > 0 && jr() < glitch * 0.5 ? (jr() - 0.5) * 0.12 * glitch : 0;
        return (
          <group key={i}>
            <mesh position={[x, h / 2 + jitter, 0]}>
              <boxGeometry args={[gap * 0.55, h, gap * 0.55]} />
              <meshBasicMaterial color={hdr(color, intensity)} toneMapped />
            </mesh>
            {glitch > 0 && (
              <mesh position={[x + gap * 0.35 * glitch, h / 2 + jitter * 2, -0.02]}>
                <boxGeometry args={[gap * 0.5, h * (0.8 + jr() * 0.4), gap * 0.3]} />
                <meshBasicMaterial color={hdr(CYAN, intensity * glitch)} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}
      <Glow pos={[0, height * 0.35, -0.05]} size={width * 1.3} color={color} intensity={0.25 * intensity * g} />
    </group>
  );
};

/** The AI: a slowly turning faceted crystal with a lit core and cyan edges. */
export const AICore: React.FC<{ pos: V3; f: number; size?: number; power?: number }> = ({ pos, f, size = 0.6, power = 1 }) => {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <group position={pos} rotation={[f / 90, f / 60, f / 140]} scale={size}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#1c3a66" roughness={0.15} metalness={0.2} transmission={0.4} thickness={0.6} emissive="#2a6aff" emissiveIntensity={0.3 + power * 0.8} transparent opacity={0.85} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={hdr(CYAN, 1.2 + power * 1.5)} />
      </lineSegments>
      <mesh scale={0.45}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={hdr("#bff8ff", 1 + power * 2)} />
      </mesh>
    </group>
  );
};

/**
 * A call travelling as light along an arc from `from` to `to`. `grow` draws it; `breakAt` (0..1) stops it
 * short with a fading tip (no answer).
 */
export const CallLine: React.FC<{ from: V3; to: V3; f: number; grow: number; lift?: number; color?: string; breakAt?: number; radius?: number }> = ({
  from,
  to,
  f,
  grow,
  lift = 3,
  color = TEAL,
  breakAt = 1,
  radius = 0.05,
}) => {
  const g = Math.min(clamp01(grow), breakAt);
  const curve = useMemo(() => {
    const mid = new THREE.Vector3((from[0] + to[0]) / 2, Math.max(from[1], to[1]) + lift, (from[2] + to[2]) / 2);
    return new THREE.QuadraticBezierCurve3(new THREE.Vector3(...from), mid, new THREE.Vector3(...to));
  }, [...from, ...to, lift]);
  const geo = useGeometry(() => {
    if (g <= 0.01) return new THREE.BufferGeometry();
    const pts = Array.from({ length: 40 }, (_, i) => curve.getPoint((i / 39) * g));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, radius, 8, false);
  }, [g, curve, radius]);
  if (g <= 0.01) return null;
  const head = curve.getPoint(g);
  const pulse = 0.8 + 0.2 * Math.sin(f / 4);
  return (
    <>
      <mesh geometry={geo}>
        <meshBasicMaterial color={hdr(color, 1.6)} />
      </mesh>
      <Glow pos={[head.x, head.y, head.z]} size={0.9 * pulse} color={color} intensity={g < breakAt - 0.001 || breakAt >= 1 ? 1.1 : 0.5} />
    </>
  );
};

/** Map pin that drops in (k 0→1) and glows: a place where the child can ask for help. */
export const Pin: React.FC<{ pos: V3; k: number; color?: string; f: number; size?: number }> = ({ pos, k, color = TEAL, f, size = 1 }) => {
  if (k <= 0) return null;
  const drop = (1 - k) * 1.2 * size;
  const s = (0.6 + 0.4 * k) * size;
  return (
    <group position={[pos[0], pos[1] + 1.1 * size + drop, pos[2]]} scale={s}>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.3, 20, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation-x={Math.PI}>
        <coneGeometry args={[0.2, 0.55, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0.22]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Glow pos={[0, 0.3, 0]} size={1.4} color={color} intensity={0.45 * k * (0.85 + 0.15 * Math.sin(f / 6))} />
    </group>
  );
};

/** Flat ring on the ground: the line the child does not cross / a highlighted spot. */
export const GroundRing: React.FC<{ pos: V3; radius: number; k: number; color?: string }> = ({ pos, radius, k, color = TEAL }) =>
  k <= 0 ? null : (
    <mesh position={[pos[0], pos[1] + 0.07, pos[2]]} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[radius * 0.86, radius, 48, 1, 0, Math.PI * 2 * k]} />
      <meshBasicMaterial color={hdr(color, 1.4)} transparent opacity={0.9} />
    </mesh>
  );

/** Straight glowing stripe on the ground (the "stop here" line). */
export const GroundLine: React.FC<{ from: V3; to: V3; k: number; color?: string; width?: number }> = ({ from, to, k, color = TEAL, width = 0.08 }) => {
  if (k <= 0) return null;
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dz) * k;
  const yaw = Math.atan2(dx, dz);
  return (
    <mesh position={[from[0] + (dx * k) / 2, from[1] + 0.075, from[2] + (dz * k) / 2]} rotation={[-Math.PI / 2, 0, yaw]}>
      <planeGeometry args={[width, len]} />
      <meshBasicMaterial color={hdr(color, 1.8)} />
    </mesh>
  );
};
