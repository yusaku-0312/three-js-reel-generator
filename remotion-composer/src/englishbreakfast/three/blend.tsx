import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp01, lerp, rng, V3 } from "../core";
import { EASE } from "../../golden2/shot";

// Leaves of two teas leaping from their side dishes into the middle dish (the blend): each pellet flies on
// an arc with its own small delay, so the stream reads as a scoop being poured rather than a block moving.

const pelletGeo = new THREE.CapsuleGeometry(1, 2.2, 3, 8);

export const FlyingLeaves: React.FC<{
  from: V3;
  to: V3;
  /** 0..1 progress of the whole transfer. */
  t: number;
  colors: string[];
  count?: number;
  seed?: number;
  spread?: number;
  arc?: number;
}> = ({ from, to, t, colors, count = 60, seed = 3, spread = 0.35, arc = 1.1 }) => {
  const mats = useMemo(() => colors.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.62 })), [colors]);
  const parts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      delay: r() * 0.55,
      off0: [(r() - 0.5) * spread, r() * 0.12, (r() - 0.5) * spread] as V3,
      off1: [(r() - 0.5) * spread * 0.8, r() * 0.1, (r() - 0.5) * spread * 0.8] as V3,
      lift: arc * (0.8 + r() * 0.4),
      rot: [r() * 3, r() * 3, r() * 3] as V3,
      spin: 4 + r() * 6,
      s: 0.02 + r() * 0.015,
      m: Math.floor(r() * colors.length),
    }));
  }, [count, seed, spread, arc, colors.length]);
  if (t <= 0 || t >= 1.6) return null;
  return (
    <>
      {parts.map((p, i) => {
        const u = clamp01((t - p.delay) / 0.45);
        if (u <= 0 || u >= 1) return null;
        const e = EASE.inOut(u);
        const x = lerp(from[0] + p.off0[0], to[0] + p.off1[0], e);
        const z = lerp(from[2] + p.off0[2], to[2] + p.off1[2], e);
        const y = lerp(from[1] + p.off0[1], to[1] + p.off1[1], e) + Math.sin(Math.PI * e) * p.lift;
        return (
          <mesh
            key={i}
            geometry={pelletGeo}
            material={mats[p.m]}
            position={[x, y, z]}
            rotation={[p.rot[0] + u * p.spin, p.rot[1], p.rot[2] + u * p.spin * 0.7]}
            scale={[p.s, p.s * 1.1, p.s * 0.8]}
          />
        );
      })}
    </>
  );
};
