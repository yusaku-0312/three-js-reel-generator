import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp01, V3 } from "../core";
import { AI_CYAN, Cross, Glow, KID_ORANGE } from "../../kondate/three/props";
import { Dish, dishCardTexture, photoTexture, Screen, screenTex } from "./screens";

export { AICore, AI_CYAN, Cross, Glow, Heart, KID_ORANGE, PhotoCard, Sparkles, Steam } from "../../kondate/three/props";

/** The kondate phone with the ChatGPT chat screens; `next` cross-fades in over `screen` (`mix` 0→1). */
export const Phone: React.FC<{
  pos: V3;
  rot?: V3;
  h?: number;
  screen: Screen;
  next?: Screen;
  mix?: number;
  flash?: number;
  glow?: number;
}> = ({ pos, rot = [0, 0, 0], h = 1, screen, next, mix = 0, flash = 0, glow = 0 }) => {
  const w = h * 0.5;
  const d = h * 0.07;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, w * 0.16), [w, h, d]);
  const m = next ? clamp01(mix) : 0;
  const bright = new THREE.Color(1, 1, 1).multiplyScalar(0.95 + flash * 1.5);
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color="#20242e" roughness={0.3} metalness={0.5} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.9, h * 0.93]} />
        <meshBasicMaterial map={screenTex(screen)} color={bright} toneMapped />
      </mesh>
      {next && m > 0 && (
        <mesh position={[0, 0, d / 2 + 0.003]}>
          <planeGeometry args={[w * 0.9, h * 0.93]} />
          <meshBasicMaterial map={screenTex(next)} color={bright} transparent opacity={m} toneMapped />
        </mesh>
      )}
      <Glow pos={[0, 0, -d]} size={h * 1.6} color={AI_CYAN} intensity={glow * 0.35} />
    </group>
  );
};

/** A dish suggestion card; `pick` lights the edge orange, `safe` teal, `no` puts a red ✕ on it. */
export const DishCard: React.FC<{ pos: V3; dish: Dish; k?: number; rot?: V3; scale?: number; pick?: number; safe?: number; no?: number; dim?: number }> = ({
  pos,
  dish,
  k = 1,
  rot = [0, 0, 0],
  scale = 1,
  pick = 0,
  safe = 0,
  no = 0,
  dim = 0,
}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(0.4, 0.5, 0.035, 4, 0.05), []);
  if (k <= 0.001) return null;
  const tex = dishCardTexture(dish);
  const edge = new THREE.Color("#ffffff").lerp(new THREE.Color("#20d0b8"), safe).lerp(new THREE.Color(KID_ORANGE), pick).lerp(new THREE.Color("#ff3b4a"), no * 0.8);
  const pop = k < 1 ? 0.3 + 0.7 * k + Math.sin(k * Math.PI) * 0.12 : 1;
  return (
    <group position={pos} rotation={rot} scale={scale * pop}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={edge} roughness={0.5} emissive={edge} emissiveIntensity={(pick + safe + no) * 0.35} />
      </mesh>
      <mesh position={[0, 0, 0.0185]}>
        <planeGeometry args={[0.38, 0.475]} />
        <meshStandardMaterial map={tex} roughness={0.6} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.32 - dim * 0.2} transparent opacity={1 - dim * 0.45} />
      </mesh>
      <Cross pos={[0, 0.03, 0.06]} k={no} size={0.34} />
      <Glow pos={[0, 0, -0.05]} size={0.95} color={pick > 0 ? KID_ORANGE : "#20d0b8"} intensity={Math.max(pick, safe * 0.6) * 0.5} />
    </group>
  );
};

/** The fridge photo as a large print floating in front of the kitchen (w × 1.25w). */
export const PhotoPanel: React.FC<{ pos: V3; w: number; k: number; rot?: V3 }> = ({ pos, w, k, rot = [0, 0, 0] }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(w * 1.06, w * 1.31, 0.02, 3, 0.03), [w]);
  if (k <= 0.001) return null;
  const tex = photoTexture();
  return (
    <group position={pos} rotation={rot} scale={0.4 + 0.6 * k}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[w, w * 1.25]} />
        <meshStandardMaterial map={tex} roughness={0.7} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
};

/** World point of a spot on the photo given as fractions (u from the left, v from the top). */
export const photoPoint = (pos: V3, w: number, [u, v]: readonly [number, number]): V3 => [pos[0] + (u - 0.5) * w, pos[1] + (0.5 - v) * w * 1.25, pos[2] + 0.03];

/** Ceramic mug (warm drink for the parent's own time). */
export const Mug: React.FC<{ pos: V3; s?: number }> = ({ pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <mesh position={[0, 0.05, 0]} castShadow>
      <cylinderGeometry args={[0.045, 0.04, 0.1, 24]} />
      <meshPhysicalMaterial color="#5f8fb8" roughness={0.35} clearcoat={0.8} />
    </mesh>
    <mesh position={[0, 0.095, 0]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[0.04, 24]} />
      <meshStandardMaterial color="#7a4a2a" roughness={0.3} />
    </mesh>
    <mesh position={[0.05, 0.05, 0]} rotation-z={-Math.PI / 2}>
      <torusGeometry args={[0.025, 0.008, 8, 16, Math.PI]} />
      <meshPhysicalMaterial color="#5f8fb8" roughness={0.35} />
    </mesh>
  </group>
);
