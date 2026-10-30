import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp01, lerp, rng, useGeometry, V3 } from "../core";

// Liquids of this reel: tea, milk, the two milk teas. Colours are sRGB hex (three converts to linear).
export const LIQUID = {
  tea: "#6a2a0c",
  milk: "#f3ece1",
  milkTea: "#b98154",
  royal: "#d9b48b",
  royalRaw: "#efe2cf",
  water: "#8e7658",
};

const white1 = (() => {
  let t: THREE.DataTexture | null = null;
  return () => {
    if (t) return t;
    t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
  };
})();

type SurfaceU = Record<"uTea" | "uBase" | "uMilk", { value: THREE.Color }> & Record<"uSpread" | "uMix" | "uSwirl" | "uGlow", { value: number }>;

/** Flat liquid disc: a base colour with a milk cloud that spirals out (`spread`) and then blends in (`mix`). */
const surfaceMaterial = () => {
  const u: SurfaceU = {
    uTea: { value: new THREE.Color(LIQUID.tea) },
    uBase: { value: new THREE.Color(LIQUID.milkTea) },
    uMilk: { value: new THREE.Color(LIQUID.milk) },
    uSpread: { value: 0 },
    uMix: { value: 0 },
    uSwirl: { value: 0 },
    uGlow: { value: 0.12 },
  };
  const mat = new THREE.MeshPhysicalMaterial({ map: white1(), roughness: 0.16, clearcoat: 0.6, clearcoatRoughness: 0.12, specularIntensity: 0.6 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uTea; uniform vec3 uBase; uniform vec3 uMilk;
        uniform float uSpread; uniform float uMix; uniform float uSwirl; uniform float uGlow;
        vec3 liquidColour(vec2 uv) {
          vec2 p = (uv - 0.5) * 2.0;
          float r = length(p);
          float a = atan(p.y, p.x);
          float arms = 0.5 + 0.5 * sin(3.0 * a + 9.0 * r - uSwirl) * cos(2.0 * a - 5.0 * r + uSwirl * 0.6);
          float cloud = smoothstep(uSpread + 0.02, uSpread - 0.3, r) * smoothstep(0.15, 0.7, arms + 0.4 * (1.0 - r));
          vec3 base = mix(uTea, uBase, uMix);
          vec3 c = mix(base, uMilk, cloud * (1.0 - uMix));
          return c * (0.9 + 0.14 * smoothstep(0.8, 1.0, r));
        }`,
      )
      .replace("#include <map_fragment>", "vec3 liq = liquidColour(vMapUv);\ndiffuseColor.rgb = liq;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += liq * uGlow;");
  };
  return { mat, u };
};

export type Surface = {
  /** Colour before any milk (tea, or milk itself in the pan). */
  from?: string;
  /** Colour once everything is blended. */
  to?: string;
  /** 0..1 how far the white milk cloud has spread. */
  spread?: number;
  /** 0..1 how blended it is (1 = flat `to`). */
  mix?: number;
  swirl?: number;
  glow?: number;
};

export const LiquidDisc: React.FC<{ center: V3; radius: number; s: Surface }> = ({ center, radius, s }) => {
  const { mat, u } = useMemo(surfaceMaterial, []);
  u.uTea.value.set(s.from ?? LIQUID.tea);
  u.uBase.value.set(s.to ?? LIQUID.milkTea);
  u.uSpread.value = (s.spread ?? 0) * 1.25;
  u.uMix.value = s.mix ?? 0;
  u.uSwirl.value = s.swirl ?? 0;
  u.uGlow.value = s.glow ?? 0.12;
  if (radius <= 0.001) return null;
  return (
    <mesh position={center} rotation-x={-Math.PI / 2} scale={[radius, radius, 1]} material={mat} receiveShadow>
      <circleGeometry args={[1, 96]} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------
// Pour stream: a tapered tube along a bezier from the lip down to the surface, in any liquid colour.
// [s0, s1] is the visible slice of the path (s1 grows as it starts, s0 as it ends).
// ---------------------------------------------------------------------------

export const PourStream: React.FC<{
  from: V3;
  to: V3;
  color: string;
  s0?: number;
  s1?: number;
  radius: number;
  bend?: number;
  f: number;
}> = ({ from, to, color, s0 = 0, s1 = 1, radius, bend = 0.2, f }) => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }), []);
  mat.color.set(color);
  mat.emissive.set(color);
  mat.emissiveIntensity = 0.22;
  const visible = s1 - s0 > 0.01 && radius > 0.001;
  const geo = useGeometry(() => {
    if (!visible) return new THREE.BufferGeometry();
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const ctrl = new THREE.Vector3(lerp(a.x, b.x, 0.15) + bend * Math.sign(b.x - a.x || 1), a.y - 0.05, lerp(a.z, b.z, 0.15));
    const path = new THREE.QuadraticBezierCurve3(a, ctrl, b);
    const pts = Array.from({ length: 25 }, (_, i) => path.getPoint(lerp(s0, s1, i / 24)));
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubular = 64;
    const radial = 12;
    const tube = new THREE.TubeGeometry(curve, tubular, radius, radial, false);
    const pos = tube.attributes.position;
    for (let i = 0; i <= tubular; i++) {
      const s = lerp(s0, s1, i / tubular);
      const k = lerp(1, 0.55, s) * (1 + 0.1 * Math.sin(s * 40 - f * 0.9));
      const c = curve.getPointAt(i / tubular);
      for (let j = 0; j <= radial; j++) {
        const idx = i * (radial + 1) + j;
        pos.setXYZ(idx, c.x + (pos.getX(idx) - c.x) * k, c.y + (pos.getY(idx) - c.y) * k, c.z + (pos.getZ(idx) - c.z) * k);
      }
    }
    tube.computeVertexNormals();
    return tube;
  }, [visible, ...from, ...to, s0, s1, radius, bend, f]);
  return visible ? <mesh geometry={geo} material={mat} /> : null;
};

/** Stream slice for a pour that runs from `start` for `dur` frames: grows in, holds, then lets go. */
export const pourSlice = (f: number, start: number, dur: number, grow = 6) => ({
  s1: clamp01((f - start) / grow),
  s0: clamp01((f - (start + dur)) / grow),
});

// ---------------------------------------------------------------------------
// Simmer bubbles: small domes that swell and pop on the surface; `boil` 0..1 sets how many are alive.
// ---------------------------------------------------------------------------

const bubbleGeo = new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);

export const Bubbles: React.FC<{ center: V3; radius: number; f: number; boil: number; color: string; seed?: number; count?: number }> = ({
  center,
  radius,
  f,
  boil,
  color,
  seed = 4,
  count = 34,
}) => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.85 }), []);
  mat.color.set(color).lerp(new THREE.Color("#ffffff"), 0.25);
  const parts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, (_, i) => ({
      d: Math.sqrt(0.25 + r() * 0.75) * 0.88,
      a: r() * Math.PI * 2,
      period: 14 + r() * 16,
      ph: r(),
      s: 0.025 + r() * 0.035,
      gate: i / count,
    }));
  }, [seed, count]);
  if (boil <= 0) return null;
  return (
    <>
      {parts.map((p, i) => {
        if (p.gate > boil) return null;
        const t = ((f / p.period + p.ph) % 1 + 1) % 1;
        const size = p.s * radius * 0.9 * Math.sin(t * Math.PI);
        if (size < 0.002) return null;
        return (
          <mesh
            key={i}
            geometry={bubbleGeo}
            material={mat}
            position={[center[0] + Math.cos(p.a) * p.d * radius, center[1], center[2] + Math.sin(p.a) * p.d * radius]}
            scale={[size, size * 0.45, size]}
          />
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Loose tea leaves: curled pellets that fall in, drift round with the liquid, and open flat.
// ---------------------------------------------------------------------------

const pelletGeo = new THREE.SphereGeometry(1, 12, 8);

export const TeaLeaves: React.FC<{
  center: V3;
  radius: number;
  f: number;
  /** Frame (same clock as f) when the first leaf lands; others follow within ~10 frames. */
  landAt: number;
  /** 0 = tight curled pellets, 1 = leaves opened flat. */
  open: number;
  swirl: number;
  count?: number;
  seed?: number;
  /** 0..1 how far the leaves have sunk out of view (in milk they disappear into the colour). */
  sink?: number;
}> = ({ center, radius, f, landAt, open, swirl, count = 46, seed = 8, sink = 0 }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.55 }), []);
  mat.color.set("#3a1a0a").lerp(new THREE.Color("#241005"), open);
  const leaves = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      d: Math.sqrt(r()) * 0.78,
      a: r() * Math.PI * 2,
      delay: r() * 10,
      spin: r() * Math.PI,
      tilt: (r() - 0.5) * 0.6,
      fall: 0.9 + r() * 0.8,
      size: 0.6 + r() * 0.6,
      shade: r(),
    }));
  }, [count, seed]);
  return (
    <>
      {leaves.map((l, i) => {
        const t = f - (landAt + l.delay);
        if (t < -14) return null;
        const drop = clamp01(-t / 14);
        const a = l.a + swirl * (1.2 - l.d * 0.6);
        const y = center[1] + 0.012 + drop * drop * l.fall - sink * 0.05;
        const w = lerp(0.026, 0.075, open) * radius * 1.4 * l.size;
        const h = lerp(0.02, 0.007, open) * radius * 1.4 * l.size;
        const len = lerp(0.02, 0.04, open) * radius * 1.4 * l.size;
        if (sink >= 1) return null;
        return (
          <mesh
            key={i}
            geometry={pelletGeo}
            material={mat}
            position={[center[0] + Math.cos(a) * l.d * radius, y, center[2] + Math.sin(a) * l.d * radius]}
            rotation={[l.tilt * (1 - open), l.spin + swirl, drop * 3]}
            scale={[w, h, len]}
          />
        );
      })}
    </>
  );
};

const mixA = new THREE.Color();
const mixB = new THREE.Color();
/** sRGB hex between two liquid colours (for a liquid that changes colour as it brews). */
export const mixHex = (a: string, b: string, t: number) => `#${mixA.set(a).lerp(mixB.set(b), clamp01(t)).getHexString()}`;
