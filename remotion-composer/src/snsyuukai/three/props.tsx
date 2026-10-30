import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp01, rng, V3 } from "../core";
import { Glow, hdr } from "../../aimukae/three/fx";
import { Figure } from "../../aimukae/three/figures";
import { canvasTexture, CLUE, FACE_UV, JP, mapTexture, MAP_SPOTS, PhotoKind, photoTexture, ScreenKind, screenTexture, SpotId } from "./textures";

export { AICore, CallLine, GroundLine, GroundRing, Pin, Sparkles, Waveform } from "../../aimukae/three/fx";
export { Envelope } from "../../aimukae/three/props";
export { Figure, walkAlong } from "../../aimukae/three/figures";
export { Coins, Dome, ringPositions, Watcher } from "../../kyouhaku/three/props";
export { Cross } from "../../kondate/three/props";
export { Stranger } from "../../camerahack/three/devices";
export { Glow, hdr };

export const RED = "#ff3b4a";
export const CYAN = "#5ff0ff";
export const PINK = "#ff7ab6";
export const TEAL = "#20d0b8";

/**
 * Smartphone with a canvas screen. `next` cross-fades in over the current screen (`mix` 0→1); `shake`
 * jitters it (the fake arriving); `glow` lights a coloured halo behind it.
 */
export const Phone: React.FC<{
  pos: V3;
  rot?: V3;
  h?: number;
  screen: ScreenKind;
  next?: ScreenKind;
  mix?: number;
  glow?: number;
  glowColor?: string;
  shake?: number;
  f?: number;
  k?: number;
  children?: React.ReactNode;
}> = ({ pos, rot = [0, 0, 0], h = 1, screen, next, mix = 0, glow = 0, glowColor = TEAL, shake = 0, f = 0, k = 1, children }) => {
  const w = h * 0.5;
  const d = h * 0.07;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, w * 0.16), [w, h, d]);
  if (k <= 0.001) return null;
  const m = next ? clamp01(mix) : 0;
  const jx = shake * Math.sin(f * 2.7) * 0.012 * h;
  const jr = shake * Math.sin(f * 3.3) * 0.03;
  const pop = k < 1 ? 0.4 + 0.6 * k + Math.sin(k * Math.PI) * 0.1 : 1;
  return (
    <group position={[pos[0] + jx, pos[1], pos[2]]} rotation={[rot[0], rot[1], rot[2] + jr]} scale={pop}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#1d2230" roughness={0.3} metalness={0.5} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.9, h * 0.93]} />
        <meshBasicMaterial map={screenTexture(screen)} color={new THREE.Color(0.95, 0.95, 0.95)} />
      </mesh>
      {next && m > 0 && (
        <mesh position={[0, 0, d / 2 + 0.003]}>
          <planeGeometry args={[w * 0.9, h * 0.93]} />
          <meshBasicMaterial map={screenTexture(next)} color={new THREE.Color(0.95, 0.95, 0.95)} transparent opacity={m} />
        </mesh>
      )}
      <Glow pos={[0, 0, -d]} size={h * 1.7} color={glowColor} intensity={glow * 0.4} />
      {children}
    </group>
  );
};

/** Card size in world units at scale 1 (the photo face is 0.4 × 0.5 inside a white border). */
export const CARD = { w: 0.44, h: 0.54, face: [0.4, 0.5] as [number, number] };

/** A face point (u, v in 0..1 of the photo) in the card's local space. */
const facePoint = (u: number, v: number): V3 => [(u - 0.5) * CARD.face[0], (0.5 - v) * CARD.face[1], 0.02];

/** Ring drawn on the photo face (a red clue circle, or a cyan face-scan frame when `square`). */
const FaceRing: React.FC<{ at: V3; r: number; k: number; color: string; square?: boolean }> = ({ at, r, k, color, square }) => {
  if (k <= 0.001) return null;
  const s = 0.6 + 0.4 * k + Math.sin(clamp01(k) * Math.PI) * 0.15;
  return (
    <group position={at} scale={s}>
      <mesh position-z={0.004}>
        {square ? <ringGeometry args={[r * 0.8, r, 4, 1, Math.PI / 4]} /> : <ringGeometry args={[r * 0.86, r, 48]} />}
        <meshBasicMaterial color={hdr(color, 1.4)} transparent opacity={k} depthWrite={false} />
      </mesh>
    </group>
  );
};

/**
 * A posted photo as a thick card. `clue` circles the give-away detail in red; `face` frames the child's face
 * in cyan (face scan); `glitch` adds the cyan/pink offset copies while a fake is being made.
 */
export const PhotoCard: React.FC<{
  pos: V3;
  kind: PhotoKind;
  k?: number;
  rot?: V3;
  scale?: number;
  edge?: string;
  edgeGlow?: number;
  clue?: number;
  face?: number;
  glitch?: number;
  f?: number;
}> = ({ pos, kind, k = 1, rot = [0, 0, 0], scale = 1, edge = "#ffffff", edgeGlow = 0, clue = 0, face = 0, glitch = 0, f = 0 }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(CARD.w, CARD.h, 0.03, 3, 0.03), []);
  if (k <= 0.001) return null;
  const tex = photoTexture(kind);
  const pop = k < 1 ? 0.3 + 0.7 * k + Math.sin(k * Math.PI) * 0.12 : 1;
  const jit = glitch > 0 ? Math.sin(f * 5.1) * 0.012 * glitch : 0;
  const c = CLUE[kind];
  return (
    <group position={[pos[0] + jit, pos[1], pos[2]]} rotation={rot} scale={scale * pop}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={edge} roughness={0.5} emissive={edge} emissiveIntensity={0.15 + edgeGlow * 0.9} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={CARD.face} />
        <meshStandardMaterial map={tex} roughness={0.6} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.35} />
      </mesh>
      {c && <FaceRing at={facePoint(c[0], c[1])} r={c[2] * CARD.face[0]} k={clue} color={RED} />}
      <FaceRing at={facePoint(FACE_UV[0], FACE_UV[1])} r={0.095} k={face} color={CYAN} square />
      {glitch > 0 &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.014 * glitch + jit * 2, 0, 0.02]}>
            <planeGeometry args={[CARD.w, CARD.h]} />
            <meshBasicMaterial color={hdr(s > 0 ? CYAN : "#ff4ad0", 0.6)} transparent opacity={0.2 * glitch} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      <Glow pos={[0, 0, -0.05]} size={1.0} color={edgeGlow > 0 ? edge : "#fff2d8"} intensity={0.12 + edgeGlow * 0.3} />
    </group>
  );
};

/** The fake child: the same figurine, cyan and see-through, flickering with noise. */
export const FakeChild: React.FC<{ pos: V3; k: number; f: number; yaw?: number; scale?: number }> = ({ pos, k, f, yaw = 0, scale = 1 }) => {
  if (k <= 0.001) return null;
  const r = rng(Math.floor(f / 3) + 7);
  const jx = (r() - 0.5) * 0.03 * k;
  const flicker = 0.75 + 0.25 * Math.sin(f * 0.9) * (r() > 0.7 ? 1 : 0.3);
  return (
    <group position={[pos[0] + jx, pos[1], pos[2]]} scale={scale * (0.5 + 0.5 * k)}>
      <Figure kind="child" body={CYAN} pose={{ pos: [0, 0, 0], yaw }} />
      <Glow pos={[0, 0.55, 0.1]} size={1.6} color={CYAN} intensity={0.55 * k * flicker} />
      {[0.25, 0.55, 0.8].map((y, i) => (
        <mesh key={i} position={[(r() - 0.5) * 0.05, y + (r() - 0.5) * 0.1, 0.16]}>
          <planeGeometry args={[0.42, 0.018]} />
          <meshBasicMaterial color={hdr(CYAN, 1.4)} transparent opacity={0.6 * k * (r() > 0.4 ? 1 : 0)} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

/** A small floating tag card with a question mark (what else a post gives away). */
export const QuestionCard: React.FC<{ pos: V3; k: number; f: number; seed?: number }> = ({ pos, k, f, seed = 0 }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(0.34, 0.34, 0.04, 3, 0.05), []);
  if (k <= 0.001) return null;
  const bob = Math.sin(f / 12 + seed) * 0.03;
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} scale={0.4 + 0.6 * k + Math.sin(clamp01(k) * Math.PI) * 0.15}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#fff4e4" roughness={0.5} emissive="#ffb070" emissiveIntensity={0.2} />
      </mesh>
      <mesh position-z={0.025}>
        <planeGeometry args={[0.24, 0.24]} />
        <meshBasicMaterial map={qTexture()} transparent />
      </mesh>
    </group>
  );
};

const qTexture = () =>
  canvasTexture("s-q", 128, 128, (ctx) => {
    ctx.fillStyle = RED;
    ctx.font = `900 110px ${JP}`;
    ctx.textAlign = "center";
    ctx.fillText("?", 64, 104);
  });

/** Paper picture map lying on the table (x/z plane), `size` units square, centred at `pos`. */
export const MapSheet: React.FC<{ pos: V3; size: number }> = ({ pos, size }) => (
  <group position={pos}>
    <mesh position-y={-0.03} receiveShadow>
      <boxGeometry args={[size + 0.5, 0.06, size + 0.5]} />
      <meshStandardMaterial color="#6b4a32" roughness={0.7} />
    </mesh>
    <mesh rotation-x={-Math.PI / 2} position-y={0.003} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={mapTexture()} color={new THREE.Color(0.78, 0.78, 0.78)} />
    </mesh>
  </group>
);

/** World point of a map spot on a MapSheet at `pos` with `size`. */
export const mapPoint = (pos: V3, size: number, id: SpotId, lift = 0): V3 => {
  const s = MAP_SPOTS[id];
  return [pos[0] + (s.u - 0.5) * size, pos[1] + lift, pos[2] + (s.v - 0.5) * size];
};

/** Little house model standing on the map (home is unnamed on the map; the pin finds it). */
export const MapHouse: React.FC<{ pos: V3; s?: number; danger?: number }> = ({ pos, s = 1, danger = 0 }) => (
  <group position={pos} scale={s}>
    <mesh position-y={0.12} castShadow>
      <boxGeometry args={[0.32, 0.24, 0.28]} />
      <meshStandardMaterial color={new THREE.Color("#f1c9a0").lerp(new THREE.Color(RED), danger * 0.3)} roughness={0.7} />
    </mesh>
    <mesh position-y={0.32} rotation-y={Math.PI / 4} castShadow>
      <coneGeometry args={[0.27, 0.18, 4]} />
      <meshStandardMaterial color="#3d6aa8" roughness={0.6} />
    </mesh>
  </group>
);
