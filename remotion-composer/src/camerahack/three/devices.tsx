import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp01, useGeometry, V3 } from "../core";
import { AICore, Glow, hdr } from "../../aimukae/three/fx";
import { codeTexture, laptopTexture, manualTexture, ScreenKind, screenTexture, tagTexture } from "./screens";

export { AICore, Glow, GroundLine, hdr } from "../../aimukae/three/fx";

/** Colour language: red = hijacked / watched, cyan = the AI and its copies, teal = protected, blue = normal. */
export const HACK_RED = "#ff3b4a";
export const AI_CYAN = "#5ff0ff";
export const SAFE_TEAL = "#20d0b8";
export const LED_BLUE = "#7cc8ff";

export type Led = "blue" | "red" | "cyan" | "teal" | "off";
const LED_COLOR: Record<Led, string> = { blue: LED_BLUE, red: HACK_RED, cyan: AI_CYAN, teal: SAFE_TEAL, off: "#30343c" };

/** Status lamp: a small lit bead plus a soft glow (`blink` 0..1 dims it). */
const Lamp: React.FC<{ pos: V3; led: Led; r: number; k?: number }> = ({ pos, led, r, k = 1 }) => {
  const c = LED_COLOR[led];
  const on = led === "off" ? 0 : clamp01(k);
  return (
    <>
      <mesh position={pos}>
        <sphereGeometry args={[r, 12, 10]} />
        <meshBasicMaterial color={on > 0 ? hdr(c, 0.6 + on * 1.6) : new THREE.Color(c)} />
      </mesh>
      {on > 0 && <Glow pos={pos} size={r * 14} color={c} intensity={0.35 * on} />}
    </>
  );
};

const Plastic: React.FC<{ color?: string; dim?: number }> = ({ color = "#eef1f6", dim = 0 }) => (
  <meshPhysicalMaterial color={new THREE.Color(color).multiplyScalar(1 - dim * 0.55)} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.25} />
);

/**
 * The monitor camera: white dome on a short neck. Height ≈ 0.32 × s. `yaw`/`pitch` aim the head; `glitch`
 * jitters it with a red flicker; `crack` lights a red fault on the shell, `patch` covers it in teal; `dim` = power off.
 */
export const MonitorCam: React.FC<{
  pos: V3;
  s?: number;
  yaw?: number;
  pitch?: number;
  led?: Led;
  ledK?: number;
  glitch?: number;
  crack?: number;
  patch?: number;
  dim?: number;
  f?: number;
}> = ({ pos, s = 1, yaw = 0, pitch = 0, led = "blue", ledK = 1, glitch = 0, crack = 0, patch = 0, dim = 0, f = 0 }) => {
  const base = useMemo(() => new RoundedBoxGeometry(0.26, 0.05, 0.22, 3, 0.02), []);
  const jx = glitch > 0 ? Math.sin(f * 2.9) * 0.012 * glitch : 0;
  const flick = glitch > 0 ? 0.6 + 0.4 * Math.sin(f * 1.7) : 1;
  return (
    <group position={[pos[0] + jx * s, pos[1], pos[2]]} scale={s}>
      <mesh geometry={base} position={[0, 0.025, 0]} castShadow>
        <Plastic dim={dim} />
      </mesh>
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.09, 16]} />
        <Plastic color="#dfe3ea" dim={dim} />
      </mesh>
      <group position={[0, 0.2, 0]} rotation-y={yaw}>
      <group rotation-x={pitch}>
        <mesh castShadow>
          <sphereGeometry args={[0.12, 32, 24]} />
          <Plastic dim={dim} />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.062, 0.062, 0.05, 28]} />
          <meshPhysicalMaterial color="#141822" roughness={0.25} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0, 0.122]}>
          <sphereGeometry args={[0.038, 20, 14]} />
          <meshPhysicalMaterial color="#1b2a4a" roughness={0.05} metalness={0.3} clearcoat={1} emissive="#1a3a80" emissiveIntensity={0.3 * (1 - dim)} />
        </mesh>
        <Lamp pos={[0, 0.075, 0.098]} led={dim > 0.5 ? "off" : led} r={0.011} k={ledK * flick} />
        {crack > 0 && (
          <group position={[-0.06, 0.04, 0.095]} rotation={[0, -0.5, 0]}>
            {[[0, 0, 0.5], [0.022, -0.02, -0.7], [0.04, -0.01, 0.9]].map(([x, y, r], i) => (
              <mesh key={i} position={[x, y, 0.004]} rotation-z={r}>
                <boxGeometry args={[0.034, 0.004, 0.004]} />
                <meshBasicMaterial color={hdr(HACK_RED, 2.2 * crack * (1 - patch))} />
              </mesh>
            ))}
            {crack * (1 - patch) > 0.05 && <Glow pos={[0.02, -0.01, 0.02]} size={0.3} color={HACK_RED} intensity={0.5 * crack * (1 - patch)} />}
          </group>
        )}
        {patch > 0 && (
          <group position={[-0.05, 0.035, 0.104]} rotation={[0, -0.5, 0]} scale={0.4 + 0.6 * patch}>
            <mesh>
              <planeGeometry args={[0.085, 0.05]} />
              <meshStandardMaterial color={SAFE_TEAL} emissive={SAFE_TEAL} emissiveIntensity={0.6} transparent opacity={patch} />
            </mesh>
            <Glow pos={[0, 0, 0.01]} size={0.25} color={SAFE_TEAL} intensity={0.3 * patch} />
          </group>
        )}
      </group>
      </group>
      {glitch > 0 &&
        [-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.02 * glitch, 0.2, 0.01]}>
            <sphereGeometry args={[0.125, 20, 14]} />
            <meshBasicMaterial color={hdr(sd > 0 ? HACK_RED : AI_CYAN, 0.6)} transparent opacity={0.12 * glitch} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
    </group>
  );
};

/** Head position of a MonitorCam placed at `pos` with scale `s` (for lines that start at the lens). */
export const lensOf = (pos: V3, s = 1, yaw = 0, pitch = 0): V3 => [
  pos[0] + Math.sin(yaw) * Math.cos(pitch) * 0.12 * s,
  pos[1] + 0.2 * s - Math.sin(pitch) * 0.12 * s,
  pos[2] + Math.cos(yaw) * Math.cos(pitch) * 0.12 * s,
];

/** The camera's field of view as a faint four-sided cone of light from `from` to `to`. */
export const ViewCone: React.FC<{ from: V3; to: V3; spread?: number; k: number; color?: string }> = ({ from, to, spread = 0.45, k, color = LED_BLUE }) => {
  const a = new THREE.Vector3(...from);
  const dir = new THREE.Vector3(...to).sub(a);
  const len = dir.length();
  dir.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  if (k <= 0.001) return null;
  const mid = a.clone().add(dir.clone().multiplyScalar(len / 2));
  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={q}>
      <coneGeometry args={[len * spread, len, 4, 1, true]} />
      <meshBasicMaterial color={hdr(color, 0.5)} transparent opacity={0.04 * k} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
};

/** A small wall shelf board. */
export const Shelf: React.FC<{ pos: V3; w?: number; d?: number }> = ({ pos, w = 0.42, d = 0.22 }) => (
  <group position={pos}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[w, 0.03, d]} />
      <meshStandardMaterial color="#d8b48a" roughness={0.55} />
    </mesh>
    <mesh position={[0, -0.07, -d / 2 + 0.02]} castShadow>
      <boxGeometry args={[0.03, 0.12, 0.03]} />
      <meshStandardMaterial color="#b98a5a" roughness={0.6} />
    </mesh>
  </group>
);

/**
 * The sleeping child (small, yellow pyjamas): only the back of the head on the pillow and a blanket hump
 * running along the bed are seen. `stir` turns the head slightly (a breath of life in long holds).
 */
export const SleepingChild: React.FC<{ head: V3; f: number }> = ({ head, f }) => {
  const breath = Math.sin(f / 22) * 0.008;
  return (
    <group>
      <group position={head} rotation={[0, 0, 0.25]}>
        <mesh castShadow>
          <sphereGeometry args={[0.1, 24, 18]} />
          <meshPhysicalMaterial color="#e9cfa8" roughness={0.55} clearcoat={0.4} />
        </mesh>
        <mesh position={[0.012, 0.01, -0.012]} castShadow>
          <sphereGeometry args={[0.108, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color="#1c1612" roughness={0.6} />
        </mesh>
      </group>
      {/* pyjama collar peeking out of the blanket */}
      <mesh position={[head[0] - 0.12, head[1] - 0.05, head[2] + 0.02]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.07, 0.04, 4, 10]} />
        <meshStandardMaterial color="#f2c94a" roughness={0.8} />
      </mesh>
      {/* blanket hump over the body */}
      <mesh position={[head[0] - 0.5, head[1] - 0.09 + breath, head[2] + 0.04]} rotation-z={Math.PI / 2} scale={[1, 1, 0.85]} castShadow receiveShadow>
        <capsuleGeometry args={[0.13, 0.62, 6, 16]} />
        <meshStandardMaterial color="#6f9ad0" roughness={0.9} />
      </mesh>
    </group>
  );
};

/** A small smartphone with a canvas screen; `next` cross-fades over `screen`. */
export const Phone: React.FC<{
  pos: V3;
  rot?: V3;
  h?: number;
  screen: ScreenKind;
  next?: ScreenKind;
  mix?: number;
  glow?: number;
  glowColor?: string;
}> = ({ pos, rot = [0, 0, 0], h = 1, screen, next, mix = 0, glow = 0, glowColor = LED_BLUE }) => {
  const w = h * 0.5;
  const d = h * 0.07;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, w * 0.16), [w, h, d]);
  const m = next ? clamp01(mix) : 0;
  const bright = new THREE.Color(1, 1, 1).multiplyScalar(0.92);
  return (
    <group position={pos} rotation={rot}>
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
      {glow > 0 && <Glow pos={[0, 0, -d]} size={h * 1.7} color={glowColor} intensity={glow * 0.4} />}
    </group>
  );
};

/** The stranger's laptop: dark base, lid tilted back, the stolen feed on screen. */
export const Laptop: React.FC<{ pos: V3; yaw?: number; s?: number; rec?: boolean; k?: number }> = ({ pos, yaw = 0, s = 1, rec = false, k = 1 }) => {
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
          <meshBasicMaterial map={laptopTexture(rec)} color={new THREE.Color(1, 1, 1).multiplyScalar(0.9)} toneMapped />
        </mesh>
        <Glow pos={[0, 0.32, 0.1]} size={1.4} color={HACK_RED} intensity={0.22 * k} />
      </group>
    </group>
  );
};

/** Someone unknown, seen only from behind: a faceless dark-red hooded pawn. */
export const Stranger: React.FC<{ pos: V3; yaw?: number; s?: number; k?: number; lean?: number }> = ({ pos, yaw = 0, s = 1, k = 1, lean = 0 }) => {
  if (k <= 0.001) return null;
  return (
    <group position={[pos[0], pos[1] - (1 - k) * 0.2 * s, pos[2]]} rotation={[lean, yaw, 0]} scale={s}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.32, 6, 16]} />
        <meshStandardMaterial color="#5a1a24" roughness={0.75} transparent opacity={k} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.15, 20, 14]} />
        <meshStandardMaterial color="#2a0c12" roughness={0.6} transparent opacity={k} />
      </mesh>
      <mesh position={[0, 0.72, -0.02]} castShadow>
        <sphereGeometry args={[0.175, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial color="#6a1e2a" roughness={0.8} transparent opacity={k} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/** Padlock that springs open (`open` 0..1): the protection broken. */
export const Padlock: React.FC<{ pos: V3; s?: number; open: number; k: number; color?: string }> = ({ pos, s = 1, open, k, color = HACK_RED }) => {
  const body = useMemo(() => new RoundedBoxGeometry(0.32, 0.26, 0.12, 3, 0.04), []);
  if (k <= 0.001) return null;
  const o = clamp01(open);
  return (
    <group position={pos} scale={s * (0.5 + 0.5 * k)}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color={color} roughness={0.35} metalness={0.3} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, -0.02, 0.062]}>
        <circleGeometry args={[0.035, 16]} />
        <meshBasicMaterial color="#2a0a10" />
      </mesh>
      <group position={[0.1, 0.12 + o * 0.12, 0]} rotation-y={o * 1.2}>
        {[-0.2, 0].map((x) => (
          <mesh key={x} position={[x, -0.02, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08, 12]} />
            <meshPhysicalMaterial color="#d8dbe4" metalness={0.9} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[-0.1, 0.02, 0]}>
          <torusGeometry args={[0.1, 0.03, 12, 28, Math.PI]} />
          <meshPhysicalMaterial color="#d8dbe4" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
      <Glow pos={[0, 0, -0.05]} size={0.8} color={color} intensity={0.18 * k} />
    </group>
  );
};

/** The stolen password as a key with a red tag. */
export const KeyProp: React.FC<{ pos: V3; rot?: V3; s?: number; k: number }> = ({ pos, rot = [0, 0, 0], s = 1, k }) => {
  if (k <= 0.001) return null;
  return (
    <group position={pos} rotation={rot} scale={s * (0.5 + 0.5 * k)}>
      <mesh>
        <torusGeometry args={[0.07, 0.022, 10, 24]} />
        <meshPhysicalMaterial color="#e2b94a" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0.17, 0, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.016, 0.016, 0.2, 10]} />
        <meshPhysicalMaterial color="#e2b94a" metalness={0.85} roughness={0.3} />
      </mesh>
      {[0.22, 0.26].map((x) => (
        <mesh key={x} position={[x, -0.03, 0]}>
          <boxGeometry args={[0.018, 0.05, 0.018]} />
          <meshPhysicalMaterial color="#e2b94a" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.17, 0]}>
        <planeGeometry args={[0.36, 0.12]} />
        <meshBasicMaterial map={tagTexture()} transparent toneMapped />
      </mesh>
    </group>
  );
};

/** Teal shield panel with the six-digit code: the second lock. */
export const Shield: React.FC<{ pos: V3; yaw?: number; s?: number; k: number; hit?: number; f: number }> = ({ pos, yaw = 0, s = 1, k, hit = 0, f }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(1.0, 0.7, 0.03, 4, 0.08), []);
  if (k <= 0.001) return null;
  const pulse = 0.9 + 0.1 * Math.sin(f / 8) + hit * 0.6;
  return (
    <group position={[pos[0], pos[1] - (1 - k) * 0.5, pos[2]]} rotation-y={yaw} scale={s}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={SAFE_TEAL} roughness={0.2} transmission={0.3} transparent opacity={0.45 * k} emissive={SAFE_TEAL} emissiveIntensity={0.45 * pulse} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.9, 0.45]} />
        <meshBasicMaterial map={codeTexture()} transparent opacity={k} toneMapped />
      </mesh>
      <Glow pos={[0, 0, -0.05]} size={2.0} color={SAFE_TEAL} intensity={0.3 * k * pulse} />
    </group>
  );
};

/** The maker's manual booklet. */
export const Booklet: React.FC<{ pos: V3; rot?: V3; s?: number; k: number }> = ({ pos, rot = [0, 0, 0], s = 1, k }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(0.36, 0.48, 0.03, 2, 0.01), []);
  if (k <= 0.001) return null;
  return (
    <group position={pos} rotation={rot} scale={s * (0.5 + 0.5 * k)}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#f4f1ea" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[0.35, 0.47]} />
        <meshStandardMaterial map={manualTexture()} roughness={0.7} emissiveMap={manualTexture()} emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

/** Update progress: a teal arc that sweeps round a point, facing +z (the hero camera). */
export const ProgressRing: React.FC<{ pos: V3; r: number; k: number; vis?: number }> = ({ pos, r, k, vis = 1 }) => {
  if (vis <= 0.001) return null;
  return (
    <group position={pos}>
      <mesh>
        <ringGeometry args={[r * 0.9, r, 64]} />
        <meshBasicMaterial color="#2a3550" transparent opacity={0.5 * vis} />
      </mesh>
      {k > 0.001 && (
        <mesh position={[0, 0, 0.002]} rotation-z={Math.PI / 2}>
          <ringGeometry args={[r * 0.9, r, 64, 1, 0, -Math.PI * 2 * clamp01(k)]} />
          <meshBasicMaterial color={hdr(SAFE_TEAL, 1.5)} transparent opacity={vis} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export type DeviceKind = "tvbox" | "speaker" | "router" | "tv" | "oven";

/** Connected home devices for the diorama, each ≈0.2–0.3 units, with a status lamp. */
export const Device: React.FC<{ kind: DeviceKind; pos: V3; yaw?: number; s?: number; led?: Led; ledK?: number; k?: number }> = ({
  kind,
  pos,
  yaw = 0,
  s = 1,
  led = "blue",
  ledK = 1,
  k = 1,
}) => {
  const box = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.12), []);
  if (k <= 0.001) return null;
  const sc = s * (0.5 + 0.5 * k);
  return (
    <group position={pos} rotation-y={yaw} scale={sc}>
      {kind === "tvbox" && (
        <>
          <mesh geometry={box} position={[0, 0.035, 0]} scale={[0.22, 0.07, 0.22]} castShadow>
            <meshPhysicalMaterial color="#1e2129" roughness={0.3} clearcoat={0.8} />
          </mesh>
          <Lamp pos={[0.07, 0.04, 0.112]} led={led} r={0.008} k={ledK} />
        </>
      )}
      {kind === "speaker" && (
        <>
          <mesh position={[0, 0.11, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.08, 0.22, 28]} />
            <meshStandardMaterial color="#8a8f9a" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.222, 0]} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.05, 0.065, 32]} />
            <meshBasicMaterial color={led === "off" ? "#30343c" : hdr(LED_COLOR[led], 0.6 + 1.4 * ledK)} />
          </mesh>
          {led !== "off" && <Glow pos={[0, 0.24, 0]} size={0.3} color={LED_COLOR[led]} intensity={0.3 * ledK} />}
        </>
      )}
      {kind === "router" && (
        <>
          <mesh geometry={box} position={[0, 0.03, 0]} scale={[0.26, 0.06, 0.16]} castShadow>
            <meshPhysicalMaterial color="#f2f4f8" roughness={0.35} clearcoat={0.6} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.1, 0.13, -0.06]} rotation-z={sd * 0.12} castShadow>
              <cylinderGeometry args={[0.008, 0.01, 0.18, 8]} />
              <meshStandardMaterial color="#f2f4f8" roughness={0.4} />
            </mesh>
          ))}
          {[-0.06, -0.02, 0.02].map((x) => (
            <Lamp key={x} pos={[x, 0.035, 0.082]} led={led} r={0.006} k={ledK} />
          ))}
        </>
      )}
      {kind === "tv" && (
        <>
          <mesh geometry={box} position={[0, 0.17, 0]} scale={[0.4, 0.24, 0.025]} castShadow>
            <meshPhysicalMaterial color="#15171d" roughness={0.3} clearcoat={0.8} />
          </mesh>
          <mesh position={[0, 0.17, 0.0135]}>
            <planeGeometry args={[0.37, 0.21]} />
            <meshBasicMaterial color={led === "off" ? "#0c0e14" : hdr(LED_COLOR[led], 0.12 + 0.18 * ledK)} />
          </mesh>
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[0.03, 0.06, 0.03]} />
            <meshStandardMaterial color="#2a2e38" />
          </mesh>
          <mesh position={[0, 0.006, 0]}>
            <boxGeometry args={[0.16, 0.012, 0.08]} />
            <meshStandardMaterial color="#2a2e38" />
          </mesh>
          <Lamp pos={[0.17, 0.07, 0.015]} led={led} r={0.006} k={ledK} />
        </>
      )}
      {kind === "oven" && (
        <>
          <mesh geometry={box} position={[0, 0.1, 0]} scale={[0.3, 0.2, 0.22]} castShadow>
            <meshPhysicalMaterial color="#e8e3d8" roughness={0.4} clearcoat={0.5} />
          </mesh>
          <mesh position={[-0.03, 0.1, 0.111]}>
            <planeGeometry args={[0.17, 0.12]} />
            <meshPhysicalMaterial color="#1a1c22" roughness={0.1} clearcoat={1} />
          </mesh>
          <mesh position={[0.1, 0.13, 0.111]}>
            <planeGeometry args={[0.05, 0.03]} />
            <meshBasicMaterial color={led === "off" ? "#30343c" : hdr(LED_COLOR[led], 0.5 + 1.2 * ledK)} />
          </mesh>
          <mesh position={[0.1, 0.07, 0.115]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.016, 0.016, 0.01, 16]} />
            <meshStandardMaterial color="#8a8f9a" metalness={0.6} roughness={0.3} />
          </mesh>
        </>
      )}
    </group>
  );
};

/** Dark round platform that the diorama devices stand on, with a faint rim. */
export const Platform: React.FC<{ pos: V3; r: number }> = ({ pos, r }) => (
  <group position={pos}>
    <mesh position={[0, 0.03, 0]} receiveShadow>
      <cylinderGeometry args={[r, r * 1.02, 0.06, 64]} />
      <meshPhysicalMaterial color="#1a2238" roughness={0.45} clearcoat={0.6} clearcoatRoughness={0.3} />
    </mesh>
    <mesh position={[0, 0.062, 0]} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[r * 0.97, r, 96]} />
      <meshBasicMaterial color={hdr("#7c9cff", 0.5)} />
    </mesh>
  </group>
);

const bez = (a: V3, b: V3, lift: number, t: number): V3 => {
  const m: V3 = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + lift, (a[2] + b[2]) / 2];
  const u = 1 - t;
  return [0, 1, 2].map((i) => u * u * a[i] + 2 * u * t * m[i] + t * t * b[i]) as V3;
};

/** One AI copy hopping from device `from` to `to` along an arc (t 0→1), leaving a short cyan trail. */
export const Hop: React.FC<{ from: V3; to: V3; t: number; f: number; lift?: number; size?: number }> = ({ from, to, t, f, lift = 0.35, size = 0.05 }) => {
  const tail = Math.max(0, t - 0.35);
  const geo = useGeometry(() => {
    if (t <= 0.02 || t >= 1) return new THREE.BufferGeometry();
    const pts = Array.from({ length: 16 }, (_, i) => new THREE.Vector3(...bez(from, to, lift, tail + ((t - tail) * i) / 15)));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, size * 0.12, 6, false);
  }, [t, tail, lift, size, ...from, ...to]);
  if (t <= 0.02 || t >= 1) return null;
  const p = bez(from, to, lift, t);
  return (
    <>
      <mesh geometry={geo}>
        <meshBasicMaterial color={hdr(AI_CYAN, 1.4)} transparent opacity={0.8} />
      </mesh>
      <AICore pos={p} f={f} size={size} power={1} />
      <Glow pos={p} size={size * 6} color={AI_CYAN} intensity={0.35} />
    </>
  );
};
