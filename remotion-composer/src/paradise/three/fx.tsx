import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp01, lerp, rng, useGeometry, V3 } from "../core";
import { ribbonTexture } from "./textures";

export { Glow, Sparkles, Steam } from "../../golden2/three/fx";

const hdr = (color: string, intensity: number) => new THREE.Color(color).multiplyScalar(intensity);

/**
 * Scent ribbon: a soft additive strip along a rising spiral. `grow` reveals it from the source,
 * `fade` removes it, and the texture flows along the strip so it reads as drifting air.
 */
export const Ribbon: React.FC<{
  from: V3;
  f: number;
  color: string;
  /** Path shape: spiral radius, height, turns and starting angle. */
  radius?: number;
  height?: number;
  turns?: number;
  phase?: number;
  /** Optional end point: the ribbon bends toward it instead of rising straight. */
  to?: V3;
  width?: number;
  grow?: number;
  intensity?: number;
}> = ({ from, f, color, radius = 0.35, height = 1.6, turns = 0.9, phase = 0, to, width = 0.09, grow = 1, intensity = 1 }) => {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        alphaMap: ribbonTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      }),
    [],
  );
  const map = useMemo(() => {
    const t = ribbonTexture().clone();
    t.wrapS = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, []);
  mat.alphaMap = map;
  map.offset.x = -((f / 90) % 1);
  mat.color.copy(hdr(color, intensity * 0.55));
  const g = clamp01(grow);
  const geo = useGeometry(() => {
    if (g <= 0.01) return new THREE.BufferGeometry();
    const n = 48;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * g;
      const a = phase + t * turns * Math.PI * 2 + Math.sin(f / 50 + phase) * 0.25;
      const r = radius * (0.3 + t * 0.9);
      let p = new THREE.Vector3(from[0] + Math.cos(a) * r, from[1] + t * height, from[2] + Math.sin(a) * r);
      if (to) p = p.lerp(new THREE.Vector3(...to), Math.pow(t, 1.6));
      pts.push(p);
    }
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= n; i++) {
      const p = pts[i];
      const tan = pts[Math.min(i + 1, n)].clone().sub(pts[Math.max(i - 1, 0)]).normalize();
      const side = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 0, 1)).normalize();
      const w = width * Math.sin(Math.min(1, (i / n) * 1.3) * Math.PI * 0.5 + 0.2) * (1 + (i / n) * 0.8);
      pos.push(p.x + side.x * w, p.y + side.y * w, p.z + side.z * w, p.x - side.x * w, p.y - side.y * w, p.z - side.z * w);
      uv.push((i / n) * g, 0, (i / n) * g, 1);
      if (i < n) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geom.setIndex(idx);
    return geom;
  }, [g, f, ...from, ...(to ?? [0, 0, 0]), radius, height, turns, phase, width]);
  if (g <= 0.01 || intensity <= 0) return null;
  return <mesh geometry={geo} material={mat} renderOrder={6} />;
};

/** A bundle of scent ribbons rising from one point, each in its own colour. */
export const Aroma: React.FC<{
  from: V3;
  f: number;
  colors: string[];
  grow: number;
  intensity?: number;
  height?: number;
  radius?: number;
  to?: V3;
  seed?: number;
}> = ({ from, f, colors, grow, intensity = 1, height = 1.6, radius = 0.35, to, seed = 3 }) => {
  const params = useMemo(() => {
    const r = rng(seed);
    return colors.map((_, i) => ({ phase: (i / colors.length) * Math.PI * 2 + r() * 0.5, turns: 0.6 + r() * 0.5, h: 0.8 + r() * 0.35, delay: i * 0.08 }));
  }, [colors, seed]);
  return (
    <>
      {colors.map((c, i) => (
        <Ribbon
          key={i}
          from={from}
          f={f}
          color={c}
          phase={params[i].phase}
          turns={params[i].turns}
          height={height * params[i].h}
          radius={radius}
          to={to}
          grow={lerp(0, 1, clamp01((grow - params[i].delay) / (1 - params[i].delay)))}
          intensity={intensity}
        />
      ))}
    </>
  );
};
