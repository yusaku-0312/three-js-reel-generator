import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp01, rng, V3 } from "../core";
import { Glow, hdr } from "../../aimukae/three/fx";
import { evidenceTexture, hiddenImageTexture, ordinaryPhotoTexture, ScreenKind, screenTexture } from "./textures";

export { AICore, CallLine, Glow, GroundRing, hdr, Sparkles, TEAL } from "../../aimukae/three/fx";
export { Cross } from "../../kondate/three/props";

export const THREAT_RED = "#ff3b4a";
export const FAKE_CYAN = "#5ff0ff";
export const SAFE_TEAL = "#20d0b8";

/**
 * Smartphone with a canvas screen. `next` cross-fades in over the current screen (`mix` 0→1). `shake` jitters
 * it (the threat arriving); `glow` lights a coloured halo behind it.
 */
export const Phone: React.FC<{
  pos: V3;
  rot?: V3;
  h?: number;
  screen: ScreenKind;
  next?: ScreenKind;
  mix?: number;
  flash?: number;
  glow?: number;
  glowColor?: string;
  shake?: number;
  f?: number;
  dim?: number;
}> = ({ pos, rot = [0, 0, 0], h = 1, screen, next, mix = 0, flash = 0, glow = 0, glowColor = THREAT_RED, shake = 0, f = 0, dim = 0 }) => {
  const w = h * 0.5;
  const d = h * 0.07;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, w * 0.16), [w, h, d]);
  const m = next ? clamp01(mix) : 0;
  const bright = new THREE.Color(1, 1, 1).multiplyScalar((0.95 - dim * 0.6) + flash * 1.5);
  const jx = shake * Math.sin(f * 2.7) * 0.012 * h;
  const jr = shake * Math.sin(f * 3.3) * 0.03;
  return (
    <group position={[pos[0] + jx, pos[1], pos[2]]} rotation={[rot[0], rot[1], rot[2] + jr]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#20242e" roughness={0.3} metalness={0.5} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.9, h * 0.93]} />
        <meshBasicMaterial map={screenTexture(screen)} color={bright} toneMapped />
      </mesh>
      {next && m > 0 && (
        <mesh position={[0, 0, d / 2 + 0.003]}>
          <planeGeometry args={[w * 0.9, h * 0.93]} />
          <meshBasicMaterial map={screenTexture(next)} color={bright} transparent opacity={m} toneMapped />
        </mesh>
      )}
      <Glow pos={[0, 0, -d]} size={h * 1.7} color={glowColor} intensity={glow * 0.4} />
    </group>
  );
};

/**
 * A photo as a thick card. kind "ordinary" is the child's park photo; kind "hidden" is the fake, never shown:
 * mosaic + warning, with a cyan noise edge (`glitch`) while it is being made.
 */
export const PhotoCard: React.FC<{ pos: V3; k: number; kind: "ordinary" | "hidden"; rot?: V3; scale?: number; glitch?: number; f?: number; edge?: string }> = ({
  pos,
  k,
  kind,
  rot = [0, 0, 0],
  scale = 1,
  glitch = 0,
  f = 0,
  edge,
}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(0.44, 0.54, 0.03, 3, 0.03), []);
  if (k <= 0.001) return null;
  const tex = kind === "ordinary" ? ordinaryPhotoTexture() : hiddenImageTexture();
  const border = edge ?? (kind === "ordinary" ? "#ffffff" : "#c9ccd6");
  const pop = k < 1 ? 0.3 + 0.7 * k + Math.sin(k * Math.PI) * 0.12 : 1;
  const jit = glitch > 0 ? Math.sin(f * 5.1) * 0.012 * glitch : 0;
  return (
    <group position={[pos[0] + jit, pos[1], pos[2]]} rotation={rot} scale={scale * pop}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={border} roughness={0.5} emissive={border} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[0.4, 0.5]} />
        <meshStandardMaterial map={tex} roughness={0.6} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.35} />
      </mesh>
      {glitch > 0 &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.012 * glitch + jit * 2, 0, 0.018]}>
            <planeGeometry args={[0.44, 0.54]} />
            <meshBasicMaterial color={hdr(s > 0 ? FAKE_CYAN : "#ff4ad0", 0.6)} transparent opacity={0.18 * glitch} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      <Glow pos={[0, 0, -0.05]} size={1.0} color={kind === "hidden" ? FAKE_CYAN : "#fff2d8"} intensity={kind === "hidden" ? 0.25 + glitch * 0.4 : 0.15} />
    </group>
  );
};

/** A small stack of gold coins (the money the child might send). */
export const Coins: React.FC<{ pos: V3; k: number; scale?: number }> = ({ pos, k, scale = 1 }) => {
  if (k <= 0.001) return null;
  return (
    <group position={pos} scale={scale * k}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[(i % 2) * 0.012, i * 0.032, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.028, 28]} />
          <meshPhysicalMaterial color="#f2c14a" metalness={0.85} roughness={0.25} emissive="#7a5a10" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
};

/** A saved copy of the evidence (the threat / the account), white card with a teal edge. */
export const EvidenceCard: React.FC<{ pos: V3; k: number; kind: "msg" | "acct"; rot?: V3; scale?: number }> = ({ pos, k, kind, rot = [0, 0, 0], scale = 1 }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(0.62, 0.47, 0.03, 3, 0.04), []);
  if (k <= 0.001) return null;
  const tex = evidenceTexture(kind);
  return (
    <group position={pos} rotation={rot} scale={scale * (0.4 + 0.6 * k)}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={SAFE_TEAL} roughness={0.5} emissive={SAFE_TEAL} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[0.58, 0.435]} />
        <meshStandardMaterial map={tex} roughness={0.6} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
};

/** A faceless pawn: one of the people who can see the photo (grey), a friend (teal) or a stranger (red). */
export const Watcher: React.FC<{ pos: V3; k: number; color: string; yaw?: number; s?: number }> = ({ pos, k, color, yaw = 0, s = 1 }) => {
  if (k <= 0.001) return null;
  return (
    <group position={[pos[0], pos[1] - (1 - k) * 0.25 * s, pos[2]]} rotation-y={yaw} scale={s * (0.5 + 0.5 * k)}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.16, 4, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} transparent opacity={k} />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <sphereGeometry args={[0.075, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} transparent opacity={k} />
      </mesh>
    </group>
  );
};

/** Watchers in a ring around `center`: `n` evenly spaced, deterministic jitter. */
export const ringPositions = (center: V3, radius: number, n: number, seed: number): V3[] => {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + r() * 0.2;
    const rr = radius * (0.92 + r() * 0.16);
    return [center[0] + Math.sin(a) * rr, center[1], center[2] + Math.cos(a) * rr] as V3;
  });
};

/** Soft teal dome of light over the child (protected whatever the image is). */
export const Dome: React.FC<{ pos: V3; k: number; radius?: number; f: number }> = ({ pos, k, radius = 1, f }) => {
  if (k <= 0.001) return null;
  const pulse = 0.9 + 0.1 * Math.sin(f / 10);
  return (
    <group position={pos} scale={radius * (0.6 + 0.4 * k)}>
      <mesh>
        <sphereGeometry args={[1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={hdr(SAFE_TEAL, 0.5 * pulse)} transparent opacity={0.16 * k} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.01}>
        <ringGeometry args={[0.94, 1, 64]} />
        <meshBasicMaterial color={hdr(SAFE_TEAL, 1.3)} transparent opacity={0.85 * k} />
      </mesh>
    </group>
  );
};
