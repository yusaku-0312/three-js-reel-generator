import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp01, V3 } from "../core";
import { cardTexture, ScreenKind, screenTexture, wordCardTexture } from "./textures";
import { Glow, hdr, RED, TEAL } from "./fx";

/**
 * Smartphone. `screen` is the face; `under` shows through when `peel` swings the face open on its left edge
 * (the call screen peeling away from the generator app). `edge` lights the rim (red = the stranger's phone).
 */
export const Phone: React.FC<{
  pos: V3;
  rot?: V3;
  h?: number;
  screen: ScreenKind;
  under?: ScreenKind;
  peel?: number;
  body?: string;
  edge?: string;
  edgeGlow?: number;
  screenGlow?: number;
  children?: React.ReactNode;
}> = ({ pos, rot = [0, 0, 0], h = 1, screen, under, peel = 0, body = "#1d2230", edge, edgeGlow = 0, screenGlow = 1, children }) => {
  const w = h * 0.5;
  const d = h * 0.07;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, w * 0.16), [w, h, d]);
  const p = clamp01(peel);
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color={body} roughness={0.3} metalness={0.5} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      {edge && edgeGlow > 0 && (
        <mesh scale={[1.06, 1.03, 0.6]} geometry={geo}>
          <meshBasicMaterial color={hdr(edge, 1.2 * edgeGlow)} transparent opacity={0.55 * edgeGlow} side={THREE.BackSide} />
        </mesh>
      )}
      {under && (
        <mesh position={[0, 0, d / 2 + 0.002]}>
          <planeGeometry args={[w * 0.9, h * 0.92]} />
          <meshBasicMaterial map={screenTexture(under)} color={new THREE.Color(1, 1, 1).multiplyScalar(screenGlow)} />
        </mesh>
      )}
      <group position={[-w * 0.45, 0, d / 2 + 0.004 + p * 0.02]} rotation-y={-p * Math.PI * 0.85}>
        <mesh position={[w * 0.45, 0, 0]}>
          <planeGeometry args={[w * 0.9, h * 0.92]} />
          <meshBasicMaterial map={screenTexture(screen)} color={new THREE.Color(1, 1, 1).multiplyScalar(screenGlow)} transparent opacity={1 - p * 0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {children}
    </group>
  );
};

/** One of the three promise cards (rounded slab, face texture). `lit` adds a teal halo. */
export const PromiseCard: React.FC<{ pos: V3; rot?: V3; n: number; lines: string[]; scale?: number; lit?: number; k?: number }> = ({
  pos,
  rot = [0, 0, 0],
  n,
  lines,
  scale = 1,
  lit = 0,
  k = 1,
}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(0.8, 1.0, 0.06, 4, 0.08), []);
  if (k <= 0) return null;
  const tex = cardTexture(n, lines);
  return (
    <group position={pos} rotation={rot} scale={scale * (0.4 + 0.6 * k)}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color="#e6efe9" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[0.78, 0.975]} />
        <meshStandardMaterial map={tex} roughness={0.55} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.18 + lit * 0.5} />
      </mesh>
      <Glow pos={[0, 0, -0.1]} size={1.9} color={TEAL} intensity={lit * 0.6} />
    </group>
  );
};

/** Flat word card (名前, 誕生日, a secret word). `gone` crumples it away. */
export const WordCard: React.FC<{ pos: V3; text: string; w?: number; gone?: number; rot?: V3; bg?: string; ink?: string; k?: number }> = ({
  pos,
  text,
  w = 1.1,
  gone = 0,
  rot = [0, 0, 0],
  bg = "#ffffff",
  ink = "#26324a",
  k = 1,
}) => {
  if (k <= 0 || gone >= 1) return null;
  const s = (0.5 + 0.5 * k) * (1 - gone * 0.8);
  return (
    <mesh position={[pos[0], pos[1] - gone * 0.6, pos[2]]} rotation={[rot[0] + gone * 1.2, rot[1], rot[2] + gone * 0.9]} scale={s}>
      <planeGeometry args={[w, w / 2]} />
      <meshStandardMaterial map={wordCardTexture(text, bg, ink)} transparent opacity={k * (1 - gone)} roughness={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
};

/** A key split in two: the bow half (parent) and the blade half (child). `join` 0 = apart, 1 = one key. */
export const SplitKey: React.FC<{ pos: V3; join: number; apart?: number; f: number; scale?: number }> = ({ pos, join, apart = 1.2, f, scale = 1 }) => {
  const gap = (1 - clamp01(join)) * apart;
  const glow = Math.max(0, join - 0.85) / 0.15;
  const gold = <meshPhysicalMaterial color="#f2c14e" metalness={0.85} roughness={0.25} clearcoat={0.6} emissive="#ffb000" emissiveIntensity={glow * 0.6} />;
  return (
    <group position={pos} scale={scale} rotation-z={Math.sin(f / 50) * 0.04}>
      <group position={[-0.3 - gap / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.26, 0.08, 14, 32]} />
          {gold}
        </mesh>
        <mesh position={[0.38, 0, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.06, 0.06, 0.28, 12]} />
          {gold}
        </mesh>
      </group>
      <group position={[0.22 + gap / 2, 0, 0]}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.06, 0.06, 0.62, 12]} />
          {gold}
        </mesh>
        {[0.06, 0.2].map((x) => (
          <mesh key={x} position={[x, -0.1, 0]}>
            <boxGeometry args={[0.08, 0.16, 0.08]} />
            {gold}
          </mesh>
        ))}
      </group>
      <Glow pos={[0, 0, 0.1]} size={1.6} color="#ffd36a" intensity={glow * 0.8} />
    </group>
  );
};

const houseShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.42, -0.4);
  s.lineTo(0.42, -0.4);
  s.lineTo(0.42, 0.12);
  s.lineTo(0, 0.46);
  s.lineTo(-0.42, 0.12);
  s.closePath();
  return s;
};

/** Padlock whose body is a little house: "what only the family knows". `lit` turns it teal. */
export const HouseLock: React.FC<{ pos: V3; lit: number; scale?: number; f: number }> = ({ pos, lit, scale = 1, f }) => {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(houseShape(), { depth: 0.22, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 }), []);
  const color = new THREE.Color("#8d97a8").lerp(new THREE.Color(TEAL), lit);
  return (
    <group position={pos} scale={scale} rotation-y={Math.sin(f / 70) * 0.15}>
      <mesh position={[0, 0.42, 0.11]} rotation-z={0}>
        <torusGeometry args={[0.22, 0.05, 12, 24, Math.PI]} />
        <meshPhysicalMaterial color="#c8ced8" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} emissive={TEAL} emissiveIntensity={lit * 0.5} />
      </mesh>
      <mesh position={[0, -0.08, 0.27]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color="#1a2430" />
      </mesh>
      <Glow pos={[0, 0, 0.2]} size={1.4} color={TEAL} intensity={lit * 0.5} />
    </group>
  );
};

const shieldShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0.55);
  s.bezierCurveTo(0.25, 0.48, 0.42, 0.48, 0.5, 0.42);
  s.bezierCurveTo(0.5, -0.05, 0.36, -0.38, 0, -0.6);
  s.bezierCurveTo(-0.36, -0.38, -0.5, -0.05, -0.5, 0.42);
  s.bezierCurveTo(-0.42, 0.48, -0.25, 0.48, 0, 0.55);
  return s;
};

/** Shield with a check: identity confirmed. */
export const Shield: React.FC<{ pos: V3; k: number; scale?: number; color?: string }> = ({ pos, k, scale = 1, color = TEAL }) => {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(shieldShape(), { depth: 0.12, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 }), []);
  if (k <= 0) return null;
  return (
    <group position={pos} scale={scale * (0.5 + 0.5 * k)}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.9} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <group position={[0, 0, 0.2]}>
        <mesh position={[-0.11, -0.04, 0]} rotation-z={-Math.PI / 4}>
          <boxGeometry args={[0.09, 0.26, 0.04]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.08, 0.04, 0]} rotation-z={Math.PI / 5}>
          <boxGeometry args={[0.09, 0.46, 0.04]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      <Glow pos={[0, 0, 0.1]} size={2.0} color={color} intensity={0.5 * k} />
    </group>
  );
};

/** Envelope that closes (`close`) and gets a wax seal (`seal`). */
export const Envelope: React.FC<{ pos: V3; close: number; seal: number; scale?: number }> = ({ pos, close, seal, scale = 1 }) => {
  const flap = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.7, 0);
    s.lineTo(0.7, 0);
    s.lineTo(0, -0.5);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group position={pos} scale={scale}>
      <mesh castShadow>
        <boxGeometry args={[1.4, 0.9, 0.05]} />
        <meshStandardMaterial color="#f3e7cf" roughness={0.8} />
      </mesh>
      <group position={[0, 0.45, 0.03]} rotation-x={(1 - clamp01(close)) * Math.PI * 0.95}>
        <mesh geometry={flap}>
          <meshStandardMaterial color="#eadbbd" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {seal > 0 && (
        <mesh position={[0, 0.0, 0.05]} rotation-x={Math.PI / 2} scale={0.6 + 0.4 * seal}>
          <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} />
          <meshPhysicalMaterial color={RED} roughness={0.35} clearcoat={0.8} transparent opacity={seal} />
        </mesh>
      )}
    </group>
  );
};
