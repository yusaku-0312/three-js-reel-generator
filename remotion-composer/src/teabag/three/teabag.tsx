import React, { useMemo } from "react";
import * as THREE from "three";
import { add3, clamp01, lerp, rng, useGeometry, V3 } from "../core";
import { bagTexture, tagTexture } from "./textures";

// ---------------------------------------------------------------------------
// Tea bag: a puffy non-woven pillow with a crimped top seam, a cotton string and a paper tag.
// Posed by the bag centre; the string runs from the seam to the tag (above it when held up by the tag,
// over the cup rim when the bag rests in the tea).
// ---------------------------------------------------------------------------

export const BAG_W = 0.6;
export const BAG_H = 0.7;
const BAG_T = 0.16;
const SEAM_H = 0.07;
const TAG_W = 0.22;
const TAG_H = 0.28;

/** Dark tea pressed out of the bag (drops, the glow inside the bag). */
export const DARK_TEA = "#3a1206";

export type BagPose = { pos: V3; yaw?: number; tilt?: number; scale?: number };

/** Bottom tip of the bag in world space (where squeezed tea drips from). */
export const bagBottom = ({ pos, scale = 1 }: BagPose, squeeze = 0): V3 => [pos[0], pos[1] - (BAG_H / 2) * (1 + 0.1 * squeeze) * scale, pos[2]];
export const bagTop = ({ pos, scale = 1 }: BagPose): V3 => [pos[0], pos[1] + (BAG_H / 2 + SEAM_H) * scale, pos[2]];

const bell = (y: number) => Math.exp(-Math.pow(y * 2.4, 2));

/** Pillow: a subdivided box whose thickness swells in the middle; `squeeze` pinches it narrow and flat. */
const pillow = (squeeze: number, f: number) => {
  const geo = new THREE.BoxGeometry(1, 1, 1, 18, 20, 4);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const puff = Math.sqrt(Math.max(0, 1 - Math.pow(2 * x, 4))) * Math.sqrt(Math.max(0, 1 - Math.pow(2 * y, 4)));
    const pinch = 1 - 0.42 * squeeze * bell(y + 0.05);
    const wrinkle = squeeze * 0.025 * Math.sin(x * 23 + y * 17 + f * 0.05) * puff;
    p.setXYZ(i, x * BAG_W * pinch, y * BAG_H * (1 + 0.1 * squeeze), z * (0.012 + BAG_T * puff * (1 - 0.45 * squeeze)) * 2 + wrinkle);
  }
  geo.computeVertexNormals();
  return geo;
};

const paper = () => new THREE.MeshStandardMaterial({ map: bagTexture(), roughness: 0.95, metalness: 0, side: THREE.DoubleSide });

const DRY = new THREE.Color("#f1e9d8");
const WET = new THREE.Color("#a5703f");

export const TeaBag: React.FC<{
  pose: BagPose;
  /** World position of the tag centre. */
  tag: V3;
  /** Extra point the string passes (e.g. over the cup rim). */
  via?: V3;
  tagYaw?: number;
  /** 0..1 how hard it is squeezed. */
  squeeze?: number;
  /** 0 dry white … 1 soaked tea-brown. */
  wet?: number;
  /** 0..1 red-brown glow from inside (the strong tea held around the leaves). */
  inner?: number;
  f: number;
  opacity?: number;
}> = ({ pose, tag, via, tagYaw = 0, squeeze = 0, wet = 0, inner = 0, f, opacity = 1 }) => {
  const s = pose.scale ?? 1;
  const mat = useMemo(paper, []);
  mat.color.copy(DRY).lerp(WET, clamp01(wet));
  mat.emissive.set("#c24a12");
  mat.emissiveIntensity = inner * 0.9;
  mat.transparent = opacity < 1;
  mat.opacity = opacity;
  const sq = Math.round(clamp01(squeeze) * 40) / 40;
  const geo = useGeometry(() => pillow(sq, sq > 0 ? f : 0), [sq, sq > 0 ? f : 0]);
  const top = bagTop(pose);
  const tagEnd: V3 = tag[1] > top[1] ? add3(tag, [0, -TAG_H * 0.42 * s, 0]) : add3(tag, [0, TAG_H * 0.42 * s, 0]);
  return (
    <>
      <group position={pose.pos} rotation={[pose.tilt ?? 0, pose.yaw ?? 0, 0]} scale={s}>
        <mesh geometry={geo} material={mat} castShadow />
        <mesh position-y={BAG_H / 2 + SEAM_H / 2 - 0.01} material={mat} castShadow>
          <boxGeometry args={[BAG_W * (1 - 0.2 * squeeze), SEAM_H, 0.02]} />
        </mesh>
      </group>
      <TeaString from={top} to={tagEnd} via={via} scale={s} />
      <Tag pos={tag} yaw={tagYaw} scale={s} opacity={opacity} />
    </>
  );
};

const TeaString: React.FC<{ from: V3; to: V3; via?: V3; scale: number }> = ({ from, to, via, scale }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f6f1e6", roughness: 0.9 }), []);
  const geo = useGeometry(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = via ? new THREE.Vector3(...via) : a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, -0.04 * a.distanceTo(b), 0));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 40, 0.007 * scale, 6, false);
  }, [...from, ...to, ...(via ?? []), scale]);
  return <mesh geometry={geo} material={mat} />;
};

const Tag: React.FC<{ pos: V3; yaw: number; scale: number; opacity: number }> = ({ pos, yaw, scale, opacity }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tagTexture(), roughness: 0.8, side: THREE.DoubleSide }), []);
  mat.transparent = opacity < 1;
  mat.opacity = opacity;
  return (
    <mesh position={pos} rotation-y={yaw} scale={scale} material={mat} castShadow>
      <boxGeometry args={[TAG_W, TAG_H, 0.008]} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------
// Drips: dark tea drops that bead at the bag tip and fall to the tea surface, one every `every` frames.
// ---------------------------------------------------------------------------

const GROW = 6;
const G = 0.022;

export type DripSpec = { from: V3; toY: number; start: number; count: number; every: number };

const fallFrames = (from: V3, toY: number) => Math.sqrt((2 * Math.max(0.01, from[1] - toY)) / G);

/** Frames (scene-local) when each drop lands, for ripples. */
export const dripImpacts = (d: DripSpec) =>
  Array.from({ length: d.count }, (_, i) => d.start + i * d.every + GROW + fallFrames(d.from, d.toY));

/** Ripple of the most recent landing drop (golden2 Cup ripple). */
export const dripRipple = (f: number, drips: DripSpec[], amp = 0.035) => {
  const last = drips.flatMap(dripImpacts).filter((t) => t <= f).pop();
  return last === undefined ? undefined : { t: (f - last) / 30, amp };
};

/** Opaque dark-tea bead: a sphere stretched into a falling drop (the golden2 Drop is clear amber). */
const TeaDrop: React.FC<{ pos: V3; size: number; stretch?: number }> = ({ pos, size, stretch = 1 }) => {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: DARK_TEA, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04, emissive: "#5a1d07", emissiveIntensity: 0.25 }),
    [],
  );
  const w = size / Math.sqrt(stretch);
  return (
    <mesh position={pos} scale={[w, size * stretch, w]} material={mat}>
      <sphereGeometry args={[1, 20, 14]} />
    </mesh>
  );
};

export const DarkDrips: React.FC<{ f: number; d: DripSpec; size?: number }> = ({ f, d, size = 0.05 }) => {
  const fall = fallFrames(d.from, d.toY);
  const jitter = useMemo(() => {
    const r = rng(d.count * 7 + Math.round(d.start));
    return Array.from({ length: d.count }, () => (r() - 0.5) * 0.06);
  }, [d.count, d.start]);
  return (
    <>
      {jitter.map((dx, i) => {
        const t = f - (d.start + i * d.every);
        if (t < 0 || t > GROW + fall) return null;
        if (t < GROW) {
          const k = t / GROW;
          const sz = size * lerp(0.4, 1, k);
          return <TeaDrop key={i} pos={add3(d.from, [dx, -sz, 0])} size={sz} stretch={1 + 0.3 * k} />;
        }
        const tf = t - GROW;
        const y = d.from[1] - size - 0.5 * G * tf * tf;
        return <TeaDrop key={i} pos={[d.from[0] + dx, Math.max(d.toY, y), d.from[2]]} size={size * 0.85} stretch={1.6} />;
      })}
    </>
  );
};
