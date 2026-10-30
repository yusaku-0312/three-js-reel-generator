import React, { useMemo } from "react";
import * as THREE from "three";
import { lerp, rng, V3 } from "../core";
import { ContactShadow, porcelain } from "../../golden2/three/models";
import { LiquidDisc, Surface } from "../../royalmilk/three/liquid";

const lathe = (profile: Array<[number, number]>, segments = 72) =>
  new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), segments);

/** Colours of this reel's drinks (sRGB hex). Chai is deeper and more orange than milk tea. */
export const CHAI = {
  done: "#93562c",
  deep: "#7d3f19",
  speck: "#3a1a0a",
};

// ---------------------------------------------------------------------------
// Kulhad: the unglazed terracotta cup chai is served in on Indian streets. Liquid level follows `fill`.
// ---------------------------------------------------------------------------

const K_FLOOR = 0.12;
const K_FULL = 0.7;
const K_IN0 = 0.24;
const K_IN1 = 0.31;
let kulhadGeo: THREE.LatheGeometry | null = null;

export type KulhadPose = { pos: V3; scale?: number };

export const kulhadSurface = ({ pos, scale = 1 }: KulhadPose, fill: number): V3 => [
  pos[0],
  pos[1] + (K_FLOOR + fill * (K_FULL - K_FLOOR)) * scale,
  pos[2],
];
export const kulhadRadius = ({ scale = 1 }: KulhadPose, fill: number) => lerp(K_IN0, K_IN1, fill) * scale;

/** Spice specks floating on chai (seeded, fixed in the cup's frame; they turn slowly with `swirl`). */
const Specks: React.FC<{ center: V3; radius: number; swirl: number; count?: number; seed?: number }> = ({ center, radius, swirl, count = 22, seed = 3 }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: CHAI.speck, roughness: 0.6 }), []);
  const dots = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({ d: Math.sqrt(r()) * 0.8, a: r() * Math.PI * 2, s: 0.006 + r() * 0.008 }));
  }, [count, seed]);
  return (
    <>
      {dots.map((d, i) => {
        const a = d.a + swirl * (1.1 - d.d * 0.5);
        return (
          <mesh key={i} material={mat} position={[center[0] + Math.cos(a) * d.d * radius, center[1] + 0.004, center[2] + Math.sin(a) * d.d * radius]} scale={[d.s * radius * 4, d.s, d.s * radius * 4]}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        );
      })}
    </>
  );
};

export const Kulhad: React.FC<{ pose: KulhadPose; fill: number; s: Surface; swirl?: number; specks?: boolean }> = ({
  pose,
  fill,
  s,
  swirl = 0,
  specks = true,
}) => {
  if (!kulhadGeo)
    kulhadGeo = lathe([
      [0, 0], [0.25, 0], [0.275, 0.03], [0.355, 0.62], [0.385, 0.71], [0.37, 0.75], [0.34, 0.74], [K_IN1 + 0.01, K_FULL],
      [K_IN0, K_FLOOR], [0, K_FLOOR],
    ]);
  const clay = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b8603a", roughness: 0.92, side: THREE.DoubleSide }), []);
  const lip = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8f4527", roughness: 0.85 }), []);
  const scale = pose.scale ?? 1;
  const top = kulhadSurface(pose, fill);
  const r = kulhadRadius(pose, fill) * 0.99;
  return (
    <>
      <ContactShadow pos={pose.pos} radius={0.42 * scale} />
      <group position={pose.pos} scale={scale}>
        <mesh geometry={kulhadGeo} material={clay} castShadow receiveShadow />
        <mesh position-y={0.73} rotation-x={Math.PI / 2} material={lip}>
          <torusGeometry args={[0.365, 0.018, 8, 72]} />
        </mesh>
      </group>
      {fill > 0.02 && <LiquidDisc center={top} radius={r} s={s} />}
      {fill > 0.02 && specks && <Specks center={top} radius={r} swirl={swirl} />}
    </>
  );
};

// ---------------------------------------------------------------------------
// CTC tea: tiny round granules (crush, tear, curl) heaped on a small white dish.
// ---------------------------------------------------------------------------

const granuleGeo = new THREE.IcosahedronGeometry(1, 1);

export const CtcHeap: React.FC<{ pos: V3; radius: number; height: number; count?: number; seed?: number; glow?: number }> = ({
  pos,
  radius,
  height,
  count = 260,
  seed = 7,
  glow = 0,
}) => {
  const mats = useMemo(
    () => ["#1c0c05", "#241008", "#160a04", "#2e150a"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, emissive: new THREE.Color("#ffb060") })),
    [],
  );
  mats.forEach((m) => (m.emissiveIntensity = glow * 0.1));
  const dishMat = useMemo(() => porcelain(), []);
  const grains = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => {
      const d = Math.sqrt(r());
      const a = r() * Math.PI * 2;
      return {
        p: [Math.cos(a) * d * radius, height * (1 - d * d) * (0.6 + r() * 0.4), Math.sin(a) * d * radius] as V3,
        s: 0.014 + r() * 0.01,
        m: Math.floor(r() * 4),
      };
    });
  }, [count, seed, radius, height]);
  return (
    <>
      <ContactShadow pos={pos} radius={radius * 1.6} />
      <mesh position={[pos[0], pos[1] + 0.03, pos[2]]} material={dishMat} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 1.35, radius * 1.15, 0.06, 64]} />
      </mesh>
      <group position={[pos[0], pos[1] + 0.06, pos[2]]}>
        {grains.map((g, i) => (
          <mesh key={i} geometry={granuleGeo} material={mats[g.m]} position={g.p} scale={g.s} castShadow />
        ))}
      </group>
    </>
  );
};

/** A few CTC granules falling into a cup: each starts at `from` and lands on `to` around `at` (frames). */
export const FallingGrains: React.FC<{ from: V3; to: V3; f: number; at: number; count?: number }> = ({ from, to, f, at, count = 14 }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a1a0c", roughness: 0.5 }), []);
  const grains = useMemo(() => {
    const r = rng(19);
    return Array.from({ length: count }, () => ({ dx: (r() - 0.5) * 0.18, dz: (r() - 0.5) * 0.18, delay: r() * 8 }));
  }, [count]);
  return (
    <>
      {grains.map((g, i) => {
        const t = (f - at - g.delay) / 12;
        if (t < 0 || t > 1) return null;
        const y = lerp(from[1], to[1], t * t);
        return <mesh key={i} geometry={granuleGeo} material={mat} position={[lerp(from[0], to[0], t) + g.dx, y, lerp(from[2], to[2], t) + g.dz]} scale={0.02} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Whole spices of masala chai.
// ---------------------------------------------------------------------------

export type SpiceKind = "ginger" | "cardamom" | "cinnamon" | "anise";
export const SPICES: SpiceKind[] = ["ginger", "cardamom", "cinnamon", "anise"];

const spiceMat = (color: string, roughness = 0.75) => new THREE.MeshStandardMaterial({ color, roughness });

export const Spice: React.FC<{ kind: SpiceKind; pos: V3; rot?: V3; scale?: number }> = ({ kind, pos, rot = [0, 0, 0], scale = 1 }) => {
  const m = useMemo(
    () => ({
      ginger: spiceMat("#ecd7a0", 0.6),
      gingerSkin: spiceMat("#b48450"),
      cardamom: spiceMat("#93ad5e", 0.55),
      cinnamon: spiceMat("#8a4a22", 0.85),
      cinnamonIn: spiceMat("#5e2c12", 0.9),
      anise: spiceMat("#5a2a14", 0.7),
    }),
    [],
  );
  if (scale <= 0.01) return null;
  return (
    <group position={pos} rotation={rot} scale={scale}>
      {kind === "ginger" && (
        <>
          <mesh material={m.ginger} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.03, 28]} />
          </mesh>
          <mesh material={m.gingerSkin} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.1, 0.012, 8, 28]} />
          </mesh>
        </>
      )}
      {kind === "cardamom" &&
        [-0.05, 0.05].map((x) => (
          <mesh key={x} material={m.cardamom} position-x={x} rotation-z={x * 4} scale={[0.04, 0.04, 0.075]} castShadow>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        ))}
      {kind === "cinnamon" && (
        <group rotation-z={Math.PI / 2}>
          <mesh material={m.cinnamon} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.36, 18, 1, true]} />
          </mesh>
          <mesh material={m.cinnamonIn}>
            <cylinderGeometry args={[0.022, 0.022, 0.36, 14]} />
          </mesh>
        </group>
      )}
      {kind === "anise" &&
        Array.from({ length: 8 }, (_, i) => (
          <group key={i} rotation-y={(i / 8) * Math.PI * 2}>
            <mesh material={m.anise} position-x={0.055} rotation-z={-Math.PI / 2} scale={[0.028, 0.07, 0.022]} castShadow>
              <coneGeometry args={[1, 1, 10]} />
            </mesh>
          </group>
        ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Wooden tea chest (export crate): slatted pine box with darker corner battens.
// ---------------------------------------------------------------------------

export const CRATE = { w: 1.05, h: 0.56, d: 0.72 };

export const Crate: React.FC<{ pos: V3; yaw?: number }> = ({ pos, yaw = 0 }) => {
  const pine = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b98349", roughness: 0.8 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7a4e26", roughness: 0.8 }), []);
  const { w, h, d } = CRATE;
  const slats = 4;
  return (
    <group position={pos} rotation-y={yaw}>
      {Array.from({ length: slats }, (_, i) => (
        <mesh key={i} material={pine} position-y={(h / slats) * (i + 0.5)} castShadow receiveShadow>
          <boxGeometry args={[w, h / slats - 0.02, d]} />
        </mesh>
      ))}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={dark} position={[sx * (w / 2 - 0.03), h / 2, sz * (d / 2 - 0.03)]} castShadow>
            <boxGeometry args={[0.08, h + 0.01, 0.08]} />
          </mesh>
        )),
      )}
      <mesh material={dark} position-y={h + 0.005}>
        <boxGeometry args={[w + 0.02, 0.02, d + 0.02]} />
      </mesh>
    </group>
  );
};
