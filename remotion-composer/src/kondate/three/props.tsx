import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp01, rng, V3 } from "../core";
import { Glow, hdr } from "../../aimukae/three/fx";
import { Dish, menuCardTexture, ScreenKind, screenTexture } from "./textures";

export { AICore, Glow, hdr, Sparkles, TEAL } from "../../aimukae/three/fx";

export const AI_CYAN = "#80f2ff";
export const KID_ORANGE = "#ff8a3d";

/**
 * Smartphone with a canvas screen. `next` cross-fades in over the current screen (`mix` 0→1), so a
 * screen change never pops. `flash` whitens the screen for the shutter.
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
  children?: React.ReactNode;
}> = ({ pos, rot = [0, 0, 0], h = 1, screen, next, mix = 0, flash = 0, glow = 0, children }) => {
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
        <meshBasicMaterial map={screenTexture(screen)} color={bright} toneMapped />
      </mesh>
      {next && m > 0 && (
        <mesh position={[0, 0, d / 2 + 0.003]}>
          <planeGeometry args={[w * 0.9, h * 0.93]} />
          <meshBasicMaterial map={screenTexture(next)} color={bright} transparent opacity={m} toneMapped />
        </mesh>
      )}
      <Glow pos={[0, 0, -d]} size={h * 1.6} color={AI_CYAN} intensity={glow * 0.35} />
      {children}
    </group>
  );
};

/** A menu suggestion as a thick rounded card; `pick` lights its edge orange, `safe` teal. */
export const MenuCard: React.FC<{ pos: V3; dish: Dish; k?: number; rot?: V3; scale?: number; pick?: number; safe?: number; dim?: number }> = ({
  pos,
  dish,
  k = 1,
  rot = [0, 0, 0],
  scale = 1,
  pick = 0,
  safe = 0,
  dim = 0,
}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(0.4, 0.5, 0.035, 4, 0.05), []);
  if (k <= 0.001) return null;
  const tex = menuCardTexture(dish);
  const edge = new THREE.Color("#ffffff").lerp(new THREE.Color("#20d0b8"), safe).lerp(new THREE.Color(KID_ORANGE), pick);
  const pop = k < 1 ? 0.3 + 0.7 * k + Math.sin(k * Math.PI) * 0.12 : 1;
  return (
    <group position={pos} rotation={rot} scale={scale * pop}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={edge} roughness={0.5} emissive={edge} emissiveIntensity={(pick + safe) * 0.35} />
      </mesh>
      <mesh position={[0, 0, 0.0185]}>
        <planeGeometry args={[0.38, 0.475]} />
        <meshStandardMaterial
          map={tex}
          roughness={0.6}
          emissiveMap={tex}
          emissive="#ffffff"
          emissiveIntensity={0.32 - dim * 0.2}
          transparent
          opacity={1 - dim * 0.45}
        />
      </mesh>
      <Glow pos={[0, 0, -0.05]} size={0.95} color={pick > 0 ? KID_ORANGE : "#20d0b8"} intensity={Math.max(pick, safe * 0.6) * 0.5} />
    </group>
  );
};

/** The fridge photo as a small card (it flies from the phone into the AI). */
export const PhotoCard: React.FC<{ pos: V3; k: number; rot?: V3; scale?: number }> = ({ pos, k, rot = [0, 0, 0], scale = 1 }) => {
  if (k <= 0.001) return null;
  return (
    <group position={pos} rotation={rot} scale={scale * (0.4 + 0.6 * k)}>
      <mesh>
        <boxGeometry args={[0.34, 0.42, 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.0, 0.006]}>
        <planeGeometry args={[0.31, 0.39]} />
        <meshBasicMaterial map={screenTexture("camera")} toneMapped />
      </mesh>
    </group>
  );
};

/** Wisps of steam above a hot dish: soft additive puffs rising and fading (pure function of f). */
export const Steam: React.FC<{ pos: V3; f: number; k: number }> = ({ pos, f, k }) => {
  const puffs = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 8 }, () => ({ x: (r() - 0.5) * 0.14, ph: r(), sp: 0.6 + r() * 0.5 }));
  }, []);
  if (k <= 0) return null;
  return (
    <>
      {puffs.map((p, i) => {
        const t = (f / 60) * p.sp + p.ph;
        const u = t - Math.floor(t);
        return (
          <Glow
            key={i}
            pos={[pos[0] + p.x + Math.sin(t * 6) * 0.03, pos[1] + u * 0.45, pos[2]]}
            size={0.12 + u * 0.18}
            color="#fff6ea"
            intensity={k * 0.35 * Math.sin(u * Math.PI)}
          />
        );
      })}
    </>
  );
};

/** Flat heart (extruded) for the "wants to eat" beat. */
export const Heart: React.FC<{ pos: V3; k: number; scale?: number }> = ({ pos, k, scale = 1 }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.3);
    s.bezierCurveTo(-0.45, 0.0, -0.3, 0.35, 0, 0.15);
    s.bezierCurveTo(0.3, 0.35, 0.45, 0.0, 0, -0.3);
    return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  }, []);
  if (k <= 0.001) return null;
  return (
    <mesh geometry={geo} position={pos} scale={scale * k}>
      <meshPhysicalMaterial color="#ff5a7a" roughness={0.3} clearcoat={0.9} emissive="#ff3a64" emissiveIntensity={0.35} />
    </mesh>
  );
};

/** Red ✕ made of two bars (the pepper taken off the list). */
export const Cross: React.FC<{ pos: V3; k: number; size?: number }> = ({ pos, k, size = 0.3 }) =>
  k <= 0.001 ? null : (
    <group position={pos} scale={k}>
      {[1, -1].map((s) => (
        <mesh key={s} rotation-z={(s * Math.PI) / 4}>
          <boxGeometry args={[size * 0.18, size * 1.2, size * 0.1]} />
          <meshBasicMaterial color={hdr("#ff3b4a", 1.3)} />
        </mesh>
      ))}
    </group>
  );
