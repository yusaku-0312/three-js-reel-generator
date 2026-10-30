import React, { useMemo } from "react";
import * as THREE from "three";
import { add3, clamp01, rng, V3 } from "../../golden/core";
import { glowTexture, starTexture } from "../../golden/three/textures";

export { Steam } from "../../golden/three/fx";

/** HDR colour for additive sprites: `intensity` above ~1 crosses the bloom threshold. */
const hdr = (color: string, intensity: number) => new THREE.Color(color).multiplyScalar(intensity);

export const Glow: React.FC<{ pos: V3; size: number; color?: string; intensity?: number }> = ({
  pos,
  size,
  color = "#ffb43a",
  intensity = 1,
}) =>
  size <= 0 || intensity <= 0 ? null : (
    <sprite position={pos} scale={size}>
      <spriteMaterial map={glowTexture()} color={hdr(color, intensity)} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
    </sprite>
  );

type SparkleMode = "orbit" | "burst" | "rise";

/** Small four-point glints; few and purposeful (they mark the golden moments only). */
export const Sparkles: React.FC<{
  center: V3;
  f: number;
  count?: number;
  radius?: number;
  seed?: number;
  mode?: SparkleMode;
  size?: number;
  color?: string;
  intensity?: number;
}> = ({ center, f, count = 18, radius = 0.6, seed = 1, mode = "orbit", size = 0.1, color = "#ffd27a", intensity = 2.5 }) => {
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
  if (f < 0 || intensity <= 0) return null;
  return (
    <>
      {parts.map((p, i) => {
        let off: V3;
        let fade = 1;
        if (mode === "orbit") {
          const a = p.a + (f / 30) * p.sp * 0.8;
          const d = radius * p.d;
          off = [Math.cos(a) * d * Math.cos(p.e), Math.sin(p.e) * d * 0.5 + Math.sin(f / 24 + p.ph) * 0.04, Math.sin(a) * d * Math.cos(p.e)];
        } else if (mode === "burst") {
          const t = clamp01(f / (26 + p.sp * 14));
          const d = radius * p.d * (1 - Math.pow(1 - t, 3));
          off = [Math.cos(p.a) * Math.cos(p.e) * d, Math.abs(Math.sin(p.e)) * d * 0.7 + t * 0.12, Math.sin(p.a) * Math.cos(p.e) * d];
          fade = 1 - t * t;
        } else {
          const t = ((f / 30) * p.sp * 0.3 + p.d) % 1;
          off = [Math.cos(p.a) * radius * p.d * (1 - t * 0.4), t * radius * 2.2, Math.sin(p.a) * radius * p.d * (1 - t * 0.4)];
          fade = Math.sin(t * Math.PI);
        }
        const twinkle = 0.5 + 0.5 * Math.sin(f / 5 + p.ph);
        const s = size * p.s * twinkle * fade;
        if (s <= 0.002) return null;
        return (
          <sprite key={i} position={add3(center, off)} scale={s}>
            <spriteMaterial
              map={starTexture()}
              color={hdr(color, intensity * fade)}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              fog={false}
            />
          </sprite>
        );
      })}
    </>
  );
};
