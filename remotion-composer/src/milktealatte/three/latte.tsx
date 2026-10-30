import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp01, lerp, rng, useGeometry, V3 } from "../core";
import { ContactShadow } from "../../golden2/three/models";
import { fresnelGlass } from "../../paradise/three/glass";
import { LiquidDisc, Surface } from "../../royalmilk/three/liquid";

// ---------------------------------------------------------------------------
// Tea-latte glass: a tall heat-proof glass mug with a handle. Its contents are one opaque column whose
// colour runs from `bottom` to `top` (an `edge` with a `soft` blend, so the same column draws tea only,
// a blended latte, or the half-and-half diagram), with a matte milk-foam layer and dome on top.
// Glass-local units: base at y 0, rim at LATTE_H.
// ---------------------------------------------------------------------------

export const LATTE_H = 1.45;
const R_BOTTOM = 0.31;
const R_TOP = 0.36;
const BASE = 0.12;
const WALL = 0.02;

const outerRadius = (y: number) => lerp(R_BOTTOM, R_TOP, y / LATTE_H);
const innerRadius = (y: number) => outerRadius(y) - WALL;
const CAPACITY = LATTE_H - BASE - 0.03;

let shellGeo: THREE.LatheGeometry | null = null;
const shellGeometry = () => {
  if (shellGeo) return shellGeo;
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.001, 0), new THREE.Vector2(R_BOTTOM - 0.02, 0), new THREE.Vector2(R_BOTTOM, 0.02)];
  for (let i = 1; i <= 20; i++) pts.push(new THREE.Vector2(outerRadius((i / 20) * LATTE_H), (i / 20) * LATTE_H));
  pts.push(new THREE.Vector2(R_TOP - 0.006, LATTE_H + 0.006), new THREE.Vector2(innerRadius(LATTE_H), LATTE_H));
  for (let i = 20; i >= 0; i--) {
    const y = BASE + (i / 20) * (LATTE_H - BASE);
    pts.push(new THREE.Vector2(innerRadius(y), y));
  }
  pts.push(new THREE.Vector2(0.001, BASE));
  shellGeo = new THREE.LatheGeometry(pts, 96);
  return shellGeo;
};

const colA = new THREE.Color();
const colB = new THREE.Color();
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / Math.max(1e-4, b - a));
  return t * t * (3 - 2 * t);
};

/** Opaque liquid that keeps a little of its own colour as glow (so a dark tea never reads black). */
const columnMaterial = (glow: { value: number }) => {
  const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.3, clearcoat: 0.4, specularIntensity: 0.4 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uGlow = glow;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uGlow;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * uGlow;");
  };
  return mat;
};

export type LatteContents = {
  /** 0..1 of the glass capacity: top of the liquid column. */
  level: number;
  bottom: string;
  top: string;
  /** 0..1 up the column where bottom turns into top, and the width of that blend. */
  edge?: number;
  soft?: number;
  /** Foam layer thickness (glass-local units) and how much it domes over the rim (0..1). */
  foam?: number;
  dome?: number;
  /** Optional swirl pattern on the bare liquid surface (hidden once foam covers it). */
  surface?: Surface;
  glow?: number;
};

export type LattePose = { pos: V3; scale?: number; yaw?: number };

/** World y of the liquid top (foam sits on it) for a pose and level. */
export const latteLevel = ({ pos, scale = 1 }: LattePose, level: number) => pos[1] + (BASE + level * CAPACITY) * scale;
export const latteTop = (pose: LattePose, c: LatteContents): V3 => [
  pose.pos[0],
  latteLevel(pose, c.level) + ((c.foam ?? 0) + (c.dome ?? 0) * 0.12) * (pose.scale ?? 1),
  pose.pos[2],
];
export const latteRadius = ({ scale = 1 }: LattePose, level: number) => innerRadius(BASE + level * CAPACITY) * scale;

const SEGS = 40;

const Column: React.FC<{ c: LatteContents; glow: { value: number } }> = ({ c, glow }) => {
  const mat = useMemo(() => columnMaterial(glow), [glow]);
  const h = c.level * CAPACITY;
  const edge = c.edge ?? 0.5;
  const soft = c.soft ?? 1;
  const geo = useGeometry(() => {
    if (h < 0.005) return new THREE.BufferGeometry();
    const g = new THREE.CylinderGeometry(innerRadius(BASE + h) * 0.985, innerRadius(BASE) * 0.985, h, 72, SEGS, false);
    g.translate(0, BASE + h / 2, 0);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    colA.set(c.bottom);
    colB.set(c.top);
    const mixed = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) - BASE) / h;
      const k = smooth(edge - soft / 2, edge + soft / 2, t);
      mixed.copy(colA).lerp(colB, k);
      colors.set([mixed.r, mixed.g, mixed.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [h, c.bottom, c.top, edge, soft]);
  return h >= 0.005 ? <mesh geometry={geo} material={mat} renderOrder={1} /> : null;
};

let domeGeo: THREE.BufferGeometry | null = null;
/** Unit half-sphere with a little deterministic lumpiness: hand-poured foam, not a ball. */
const foamDome = () => {
  if (domeGeo) return domeGeo;
  const g = new THREE.SphereGeometry(1, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const p = g.attributes.position;
  const r = rng(17);
  const bumps = Array.from({ length: 14 }, () => ({ a: r() * 6.28, e: 0.2 + r() * 1.2, s: 0.04 + r() * 0.05 }));
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x);
    const e = Math.asin(clamp01(v.y));
    const lump = bumps.reduce((acc, b) => {
      const da = ((a - b.a + 9.42) % 6.28) - 3.14;
      return acc + b.s * Math.exp(-(da * da) * 6 - (e - b.e) ** 2 * 8);
    }, 0);
    v.multiplyScalar(1 + lump * Math.sin(e * 2));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  domeGeo = g;
  return g;
};

const foamMat = new THREE.MeshPhysicalMaterial({ color: "#fbf5ea", roughness: 0.92, sheen: 0.6, sheenColor: new THREE.Color("#ffffff"), emissive: new THREE.Color("#fff3e0"), emissiveIntensity: 0.12 });

export const LatteGlass: React.FC<{ pose: LattePose; c: LatteContents; foamGlow?: number }> = ({ pose, c, foamGlow = 0 }) => {
  const shell = useMemo(() => fresnelGlass("#fff6ea", 0.8), []);
  const glow = useMemo(() => ({ value: 0.25 }), []);
  glow.value = c.glow ?? 0.25;
  foamMat.emissiveIntensity = 0.12 + foamGlow;
  const s = pose.scale ?? 1;
  const y0 = BASE + c.level * CAPACITY;
  const foam = c.foam ?? 0;
  const dome = c.dome ?? 0;
  const rFoam = innerRadius(Math.min(LATTE_H, y0 + foam)) * 0.985;
  return (
    <>
      <ContactShadow pos={pose.pos} radius={0.55 * s} opacity={0.75} />
      <group position={pose.pos} scale={s} rotation-y={pose.yaw ?? 0}>
        <Column c={c} glow={glow} />
        {c.surface && foam < 0.01 && c.level > 0.02 && (
          <LiquidDisc center={[0, y0 + 0.002, 0]} radius={innerRadius(y0) * 0.98} s={c.surface} />
        )}
        {foam > 0.005 && (
          <mesh position-y={y0 + foam / 2} material={foamMat} renderOrder={1}>
            <cylinderGeometry args={[rFoam, innerRadius(y0) * 0.985, foam, 72, 1, true]} />
          </mesh>
        )}
        {foam > 0.005 && (
          <mesh geometry={foamDome()} material={foamMat} position-y={y0 + foam - 0.004} scale={[rFoam, 0.02 + dome * 0.16, rFoam]} renderOrder={1} />
        )}
        <mesh geometry={shellGeometry()} material={shell} renderOrder={4} />
        {/* handle: a half loop on +x, both ends on the wall and the bow outwards (z -90° turns the arc's top to +x) */}
        <mesh position={[outerRadius(LATTE_H * 0.55) - 0.01, LATTE_H * 0.55, 0]} rotation={[0, 0, -Math.PI / 2]} material={shell} renderOrder={4}>
          <torusGeometry args={[0.26, 0.05, 14, 40, Math.PI]} />
        </mesh>
        <mesh position-y={LATTE_H * 0.45} castShadow>
          <cylinderGeometry args={[R_BOTTOM * 0.9, R_BOTTOM * 0.9, LATTE_H * 0.9, 24]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
};

// ---------------------------------------------------------------------------
// Steel frothing pitcher, posed by its spout lip like the royalmilk creamer; milk shows at the top
// while it stands upright. Local: base at y 0, lip at FROTH_LIP.
// ---------------------------------------------------------------------------

const FROTH_PROFILE: Array<[number, number]> = [
  [0, 0], [0.27, 0], [0.3, 0.03], [0.31, 0.2], [0.29, 0.5], [0.27, 0.72], [0.275, 0.75], [0.26, 0.75], [0.255, 0.72],
  [0.275, 0.5], [0.295, 0.2], [0.285, 0.05], [0, 0.04],
];
export const FROTH_LIP: V3 = [0.3, 0.77, 0];
const FROTH_MILK_Y = 0.5;
let frothGeo: THREE.LatheGeometry | null = null;
const steel = new THREE.MeshPhysicalMaterial({ color: "#c3c7cc", metalness: 0.35, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.1, emissive: new THREE.Color("#3a3d42"), emissiveIntensity: 0.35 });

export type FrothPose = { tip: V3; tilt: number; yaw?: number; scale?: number };

/** World centre of the milk surface inside an upright pitcher. */
export const frothMilk = (pose: FrothPose): V3 => {
  const s = pose.scale ?? 1;
  const yaw = pose.yaw ?? 0;
  const dx = -FROTH_LIP[0] * s;
  return [pose.tip[0] + Math.cos(yaw) * dx, pose.tip[1] + (FROTH_MILK_Y - FROTH_LIP[1]) * s, pose.tip[2] - Math.sin(yaw) * dx];
};

export const FrothPitcher: React.FC<{ pose: FrothPose; milk: Surface; f: number }> = ({ pose, milk }) => {
  if (!frothGeo) frothGeo = new THREE.LatheGeometry(FROTH_PROFILE.map(([x, y]) => new THREE.Vector2(x, y)), 72);
  const upright = pose.tilt < 0.12;
  return (
    <group position={pose.tip} rotation={[0, pose.yaw ?? 0, 0]} scale={pose.scale ?? 1}>
      <group rotation={[0, 0, -pose.tilt]}>
        <group position={[-FROTH_LIP[0], -FROTH_LIP[1], 0]}>
          <mesh geometry={frothGeo} material={steel} castShadow />
          <mesh position={[0.27, 0.745, 0]} rotation={[0, 0, -0.55]} scale={[0.1, 0.03, 0.08]} material={steel}>
            <sphereGeometry args={[1, 16, 10]} />
          </mesh>
          <mesh position={[-0.33, 0.42, 0]} rotation={[0, 0, Math.PI / 2]} material={steel} castShadow>
            <torusGeometry args={[0.17, 0.03, 12, 32, Math.PI]} />
          </mesh>
          {upright && <LiquidDisc center={[0, FROTH_MILK_Y, 0]} radius={0.278} s={milk} />}
        </group>
      </group>
    </group>
  );
};

/** Steam wand: a steel pipe coming down from the machine above, its nozzle at `tip`; `lift` raises it out. */
export const SteamWand: React.FC<{ tip: V3; lift: number }> = ({ tip, lift }) => {
  const y = tip[1] + lift * 1.2;
  return (
    <group position={[tip[0], y, tip[2]]} rotation={[0.12, 0, -0.22]}>
      <mesh position-y={1.6} material={steel}>
        <cylinderGeometry args={[0.035, 0.035, 3.2, 16]} />
      </mesh>
      <mesh position-y={0.02} material={steel}>
        <cylinderGeometry args={[0.045, 0.03, 0.08, 16]} />
      </mesh>
      <mesh position-y={0.55} material={steel}>
        <torusGeometry args={[0.05, 0.012, 8, 20]} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Milk bottle: fresnel glass over white milk, a paper cap, and a kraft "latte" tag on a string.
// ---------------------------------------------------------------------------

const BOTTLE: Array<[number, number]> = [
  [0.001, 0], [0.3, 0], [0.33, 0.04], [0.33, 0.78], [0.28, 0.98], [0.17, 1.14], [0.15, 1.3], [0.17, 1.33], [0.17, 1.38], [0.14, 1.38],
];
let bottleGeo: THREE.LatheGeometry | null = null;
let milkGeo: THREE.LatheGeometry | null = null;

export const BOTTLE_NECK = 1.22;

export const MilkBottle: React.FC<{ pos: V3; f: number; scale?: number; glow?: number; children?: React.ReactNode }> = ({
  pos,
  f,
  scale = 1,
  glow = 0,
  children,
}) => {
  const shell = useMemo(() => fresnelGlass("#f4fbff", 1.1), []);
  const milkMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#f6f1e8", roughness: 0.35, sheen: 0.4, emissive: new THREE.Color("#fff6e8"), emissiveIntensity: 0.1 }),
    [],
  );
  milkMat.emissiveIntensity = 0.06 + glow * 0.18;
  if (!bottleGeo) bottleGeo = new THREE.LatheGeometry(BOTTLE.map(([x, y]) => new THREE.Vector2(x, y)), 72);
  if (!milkGeo)
    milkGeo = new THREE.LatheGeometry(
      [[0.001, 0.03], [0.3, 0.03], [0.31, 0.06], [0.31, 0.78], [0.265, 0.96], [0.16, 1.1], [0.001, 1.1]].map(([x, y]) => new THREE.Vector2(x, y)),
      72,
    );
  return (
    <>
      <ContactShadow pos={pos} radius={0.5 * scale} opacity={0.75} />
      <group position={pos} scale={scale}>
        <mesh geometry={milkGeo} material={milkMat} castShadow renderOrder={1} />
        <mesh geometry={bottleGeo} material={shell} renderOrder={4} />
        <mesh position-y={1.4}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 32]} />
          <meshStandardMaterial color="#e7d9bc" roughness={0.8} />
        </mesh>
        <group position={[0, BOTTLE_NECK, 0]} rotation-z={Math.sin(f / 14) * 0.06}>{children}</group>
      </group>
    </>
  );
};

/** Paper tag hanging from the bottle neck on a short string (child of MilkBottle). */
export const NeckTag: React.FC<{ texture: THREE.Texture; swing: number }> = ({ texture, swing }) => (
  <group rotation={[0, -0.25, swing]}>
    <mesh position={[0.2, -0.12, 0.12]} rotation-z={0.6}>
      <cylinderGeometry args={[0.006, 0.006, 0.28, 6]} />
      <meshStandardMaterial color="#8a5a2c" roughness={0.9} />
    </mesh>
    <mesh position={[0.48, -0.3, 0.16]} rotation={[0, -0.15, -0.12]} castShadow>
      <planeGeometry args={[0.6, 0.4]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.85} />
    </mesh>
  </group>
);

/** Toothpick flag that springs up out of the counter (`up` 0..1), with any flag texture. */
export const FlagPick: React.FC<{ pos: V3; up: number; f: number; texture: THREE.Texture; yaw?: number }> = ({ pos, up, f, texture, yaw = -0.35 }) => {
  if (up <= 0.01) return null;
  const sway = Math.sin(f / 9) * 0.08 * (1 - up) + Math.sin(f / 23) * 0.03;
  return (
    <group position={pos} scale={up} rotation={[0, yaw, sway]}>
      <mesh position-y={0.4}>
        <cylinderGeometry args={[0.012, 0.012, 0.8, 8]} />
        <meshStandardMaterial color="#e8d3a8" roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.68, 0]}>
        <planeGeometry args={[0.38, 0.25]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
    </group>
  );
};
