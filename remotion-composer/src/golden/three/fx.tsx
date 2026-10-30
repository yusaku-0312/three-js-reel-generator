import React, { useMemo } from "react";
import * as THREE from "three";
import { add3, clamp01, lerp, rng, useGeometry, V3 } from "../core";
import { glowTexture, starTexture } from "./textures";

export const GOLD = "#ffbf3a";
const AMBER = new THREE.Color("#a8471a");
const GOLD_COLOR = new THREE.Color("#f7a823");

// ---------------------------------------------------------------------------
// The drop: round when hanging, teardrop when falling, amber → glowing gold.
// ---------------------------------------------------------------------------

const dropGeometries = new Map<number, THREE.LatheGeometry>();

const dropGeometry = (shape: number) => {
  const key = Math.round(clamp01(shape) * 10);
  const hit = dropGeometries.get(key);
  if (hit) return hit;
  const m = (key / 10) * 1.6;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = Math.PI - (i / 40) * Math.PI; // bottom → top so normals face out
    pts.push(new THREE.Vector2(Math.sin(t) * Math.pow(Math.sin(t / 2), m), Math.cos(t)));
  }
  const geo = new THREE.LatheGeometry(pts, 48);
  dropGeometries.set(key, geo);
  return geo;
};

export const Glow: React.FC<{ pos: V3; size: number; color?: string; opacity?: number }> = ({
  pos,
  size,
  color = GOLD,
  opacity = 1,
}) =>
  size <= 0 || opacity <= 0 ? null : (
    <sprite position={pos} scale={size}>
      <spriteMaterial
        map={glowTexture()}
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
        fog={false}
      />
    </sprite>
  );

export const Drop: React.FC<{
  pos: V3;
  size: number;
  /** 0 = round bead, 1 = falling teardrop. */
  shape?: number;
  /** 0 = plain tea amber, 1 = glowing gold. */
  gold?: number;
  /** Vertical stretch while hanging/falling. */
  stretch?: number;
}> = ({ pos, size, shape = 0, gold = 0, stretch = 1 }) => {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({ roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02, toneMapped: false }),
    [],
  );
  mat.color.copy(AMBER).lerp(GOLD_COLOR, gold);
  mat.emissive.copy(AMBER).lerp(GOLD_COLOR, gold);
  mat.emissiveIntensity = 0.12 + gold * 0.55;
  if (size <= 0) return null;
  return (
    <group position={pos}>
      <mesh geometry={dropGeometry(shape)} material={mat} scale={[size, size * stretch, size]} />
      <Glow pos={[0, 0, 0]} size={size * (3 + gold * 9)} opacity={0.25 + gold * 0.75} />
    </group>
  );
};

// ---------------------------------------------------------------------------
// Pour stream: a tapered tube along a bezier from the spout to the cup.
// [s0, s1] is the visible slice of the path (s1 grows as it starts, s0 as it ends).
// ---------------------------------------------------------------------------

const streamMat = new THREE.MeshPhysicalMaterial({
  color: "#b9601f",
  emissive: "#5a2006",
  emissiveIntensity: 0.4,
  roughness: 0.08,
  clearcoat: 1,
  transparent: true,
  opacity: 0.93,
});

export const Stream: React.FC<{ from: V3; to: V3; s0?: number; s1?: number; radius: number; bend?: number }> = ({
  from,
  to,
  s0 = 0,
  s1 = 1,
  radius,
  bend = 0.25,
}) => {
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
      const u = i / tubular;
      const k = lerp(1, 0.55, lerp(s0, s1, u)); // thinner as it accelerates
      const c = curve.getPointAt(u);
      for (let j = 0; j <= radial; j++) {
        const idx = i * (radial + 1) + j;
        pos.setXYZ(idx, c.x + (pos.getX(idx) - c.x) * k, c.y + (pos.getY(idx) - c.y) * k, c.z + (pos.getZ(idx) - c.z) * k);
      }
    }
    tube.computeVertexNormals();
    return tube;
  }, [visible, ...from, ...to, s0, s1, radius, bend]);
  return visible ? <mesh geometry={geo} material={streamMat} /> : null;
};

// ---------------------------------------------------------------------------
// Sparkles, ripples, splash and steam: all pure functions of the local frame.
// ---------------------------------------------------------------------------

type SparkleMode = "orbit" | "burst" | "rise";

export const Sparkles: React.FC<{
  center: V3;
  f: number;
  count?: number;
  radius?: number;
  seed?: number;
  mode?: SparkleMode;
  size?: number;
  color?: string;
  opacity?: number;
}> = ({ center, f, count = 24, radius = 0.6, seed = 1, mode = "orbit", size = 0.12, color = "#ffe08a", opacity = 1 }) => {
  const parts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      a: r() * Math.PI * 2,
      e: (r() - 0.5) * Math.PI * 0.9,
      d: 0.4 + r() * 0.6,
      sp: 0.6 + r() * 0.8,
      ph: r() * Math.PI * 2,
      s: 0.5 + r() * 0.8,
    }));
  }, [count, seed]);
  if (f < 0 || opacity <= 0) return null;
  return (
    <>
      {parts.map((p, i) => {
        let off: V3;
        let fade = 1;
        if (mode === "orbit") {
          const a = p.a + (f / 30) * p.sp * 1.4;
          const d = radius * p.d;
          off = [Math.cos(a) * d * Math.cos(p.e), Math.sin(p.e) * d + Math.sin(f / 20 + p.ph) * 0.05, Math.sin(a) * d * Math.cos(p.e)];
        } else if (mode === "burst") {
          const t = clamp01(f / (24 + p.sp * 12));
          const d = radius * p.d * (1 - Math.pow(1 - t, 3));
          off = [Math.cos(p.a) * Math.cos(p.e) * d, Math.sin(p.e) * d + t * 0.1, Math.sin(p.a) * Math.cos(p.e) * d];
          fade = 1 - t;
        } else {
          const t = ((f / 30) * p.sp * 0.35 + p.d) % 1;
          off = [Math.cos(p.a) * radius * p.d * (1 - t * 0.4), t * radius * 2.2, Math.sin(p.a) * radius * p.d * (1 - t * 0.4)];
          fade = Math.sin(t * Math.PI);
        }
        const twinkle = 0.55 + 0.45 * Math.sin(f / 4 + p.ph);
        const s = size * p.s * twinkle * fade;
        if (s <= 0.002) return null;
        return (
          <sprite key={i} position={add3(center, off)} scale={s}>
            <spriteMaterial
              map={starTexture()}
              color={color}
              transparent
              opacity={opacity * fade}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
              fog={false}
            />
          </sprite>
        );
      })}
    </>
  );
};

const ringGeo = new THREE.RingGeometry(0.92, 1, 96);

/** Expanding rings on a liquid surface, started at f = 0. */
export const Ripples: React.FC<{ center: V3; f: number; maxR: number; color?: string; rings?: number }> = ({
  center,
  f,
  maxR,
  color = GOLD,
  rings = 3,
}) => {
  if (f < 0) return null;
  return (
    <>
      {Array.from({ length: rings }, (_, i) => {
        const t = clamp01((f - i * 7) / 45);
        if (t <= 0 || t >= 1) return null;
        const r = maxR * (0.08 + 0.92 * (1 - Math.pow(1 - t, 2)));
        return (
          <mesh key={i} geometry={ringGeo} position={[center[0], center[1] + 0.003, center[2]]} rotation-x={-Math.PI / 2} scale={[r, r, 1]}>
            <meshBasicMaterial color={color} transparent opacity={(1 - t) * 0.8} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        );
      })}
    </>
  );
};

const splashGeo = new THREE.SphereGeometry(1, 16, 12);

/** Crown of droplets plus a small rebound jet, started at f = 0. Slow-motion gravity. */
export const Splash: React.FC<{ center: V3; f: number; scale?: number; seed?: number; gold?: number }> = ({
  center,
  f,
  scale = 1,
  seed = 3,
  gold = 1,
}) => {
  const drops = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 14 }, (_, i) => ({
      a: (i / 14) * Math.PI * 2 + r() * 0.3,
      vu: 1.0 + r() * 0.7,
      vr: 0.35 + r() * 0.35,
      s: 0.018 + r() * 0.016,
    }));
  }, [seed]);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.05, clearcoat: 1 }), []);
  mat.color.copy(AMBER).lerp(GOLD_COLOR, gold);
  mat.emissive.copy(AMBER).lerp(GOLD_COLOR, gold);
  mat.emissiveIntensity = 0.3 + gold * 0.7;
  if (f < 0 || f > 40) return null;
  const t = f / 30;
  const g = 5.5;
  const jetH = Math.max(0, 1.4 * t - 0.5 * g * t * t) * scale;
  return (
    <>
      {drops.map((d, i) => {
        const y = (d.vu * t - 0.5 * g * t * t) * scale;
        if (y < -0.01) return null;
        const rr = d.vr * t * scale;
        return (
          <mesh key={i} geometry={splashGeo} material={mat} scale={d.s * scale} position={[center[0] + Math.cos(d.a) * rr, center[1] + y, center[2] + Math.sin(d.a) * rr]} />
        );
      })}
      {jetH > 0.005 && (
        <mesh geometry={splashGeo} material={mat} position={[center[0], center[1] + jetH * 0.5, center[2]]} scale={[0.03 * scale, jetH * 0.5 + 0.02, 0.03 * scale]} />
      )}
    </>
  );
};

export const Steam: React.FC<{ base: V3; f: number; width?: number; opacity?: number; seed?: number }> = ({
  base,
  f,
  width = 0.4,
  opacity = 1,
  seed = 5,
}) => {
  const wisps = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 9 }, () => ({ x: (r() - 0.5) * width, ph: r() * 6.28, sp: 0.5 + r() * 0.4, off: r() }));
  }, [seed, width]);
  return (
    <>
      {wisps.map((w, i) => {
        const t = ((f / 30) * w.sp * 0.3 + w.off) % 1;
        const y = t * 1.4;
        const x = w.x + Math.sin(t * 5 + w.ph) * 0.12 * t;
        return (
          <sprite key={i} position={[base[0] + x, base[1] + y, base[2]]} scale={0.25 + t * 0.6}>
            <spriteMaterial map={glowTexture()} color="#fff4e6" transparent opacity={opacity * 0.13 * Math.sin(t * Math.PI)} depthWrite={false} fog={false} />
          </sprite>
        );
      })}
    </>
  );
};
