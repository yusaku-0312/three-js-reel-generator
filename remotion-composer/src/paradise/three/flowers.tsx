import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp01, lerp, rng, V3 } from "../core";

// ---------------------------------------------------------------------------
// The four blend flowers, built from bent petal shapes. `bloom` 0 = closed bud, 1 = fully open.
// Flower-local units: the head sits at y 0 on top of its stem; a head is ~0.5 across when open.
// ---------------------------------------------------------------------------

export type FlowerKind = "cornflower" | "marigold" | "safflower" | "rose";

export const FLOWER_COLOR: Record<FlowerKind, string> = {
  cornflower: "#3d6bff",
  marigold: "#ff8a12",
  safflower: "#ef3a1e",
  rose: "#ff7aa2",
};

const geoCache = new Map<string, THREE.BufferGeometry>();

/**
 * Petal from base (y 0) to tip (y len): outline from `half(t)` (half-width along the length),
 * cupped across (z = cup·x²) and curled along (z += curl·t²). Vertex colours run base → tip.
 */
const petalGeometry = (
  key: string,
  len: number,
  half: (t: number) => number,
  cup: number,
  curl: number,
  base: string,
  tip: string,
  teeth = 0,
) => {
  const hit = geoCache.get(key);
  if (hit) return hit;
  const rows = 14;
  const cols = 6;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const cb = new THREE.Color(base);
  const ct = new THREE.Color(tip);
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    // Toothed tip: the last rows split into `teeth` points by modulating the length per column.
    for (let j = 0; j <= cols; j++) {
      const u = j / cols - 0.5;
      const toothCut = teeth > 0 && t > 0.82 ? Math.abs(Math.sin((u + 0.5) * teeth * Math.PI)) * (t - 0.82) * 1.2 : 0;
      const tt = Math.max(0, t - toothCut);
      const x = u * 2 * half(tt);
      const y = tt * len;
      const z = cup * x * x * 4 + curl * tt * tt * len;
      pos.push(x, y, z);
      const c = cb.clone().lerp(ct, Math.pow(t, 0.8));
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      idx.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  geoCache.set(key, g);
  return g;
};

const petalMat = new THREE.MeshPhysicalMaterial({
  vertexColors: true,
  roughness: 0.55,
  sheen: 1,
  sheenColor: new THREE.Color("#ffffff"),
  sheenRoughness: 0.5,
  side: THREE.DoubleSide,
});
const stemMat = new THREE.MeshPhysicalMaterial({ color: "#4f8f3a", roughness: 0.6 });
const discMat = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.8 });
const DISC = { cornflower: discMat("#2b2470"), marigold: discMat("#b4520b"), rose: discMat("#e85c86") };

/** One ring of petals: each petal hinges at the head and opens from `closed` to `open` radians off vertical. */
const Ring: React.FC<{
  geo: THREE.BufferGeometry;
  count: number;
  radius: number;
  closed: number;
  open: number;
  bloom: number;
  y?: number;
  twist?: number;
  jitter?: number;
  seed?: number;
}> = ({ geo, count, radius, closed, open, bloom, y = 0, twist = 0, jitter = 0.1, seed = 1 }) => {
  const r = useMemo(() => {
    const g = rng(seed);
    return Array.from({ length: count }, () => ({ a: g() - 0.5, t: g() - 0.5, s: 0.9 + g() * 0.2 }));
  }, [count, seed]);
  // Ring frame: radial = +x, tangent = z. The petal's width maps to the tangent and its cup faces the centre;
  // rotating about z by -tilt leans it outward from vertical.
  return (
    <>
      {r.map((p, i) => {
        const a = (i / count) * Math.PI * 2 + twist + p.a * jitter;
        const tilt = lerp(closed, open, bloom) + p.t * jitter * 1.5;
        return (
          <group key={i} rotation={[0, -a, 0]} position-y={y}>
            <group position-x={radius} rotation={[0, 0, -tilt]}>
              <mesh geometry={geo} material={petalMat} rotation={[0, -Math.PI / 2, 0]} scale={p.s} castShadow />
            </group>
          </group>
        );
      })}
    </>
  );
};

const Cornflower: React.FC<{ bloom: number }> = ({ bloom }) => {
  const outer = petalGeometry("cf-o", 0.26, (t) => 0.02 + 0.05 * Math.pow(t, 1.5), 0.6, -0.15, "#2a3fae", "#4f7dff", 4);
  const inner = petalGeometry("cf-i", 0.12, (t) => 0.012 + 0.012 * t, 0.2, 0, "#3a2a8a", "#6a4cff");
  return (
    <>
      <mesh material={DISC.cornflower} scale={[0.07, 0.05, 0.07]}>
        <sphereGeometry args={[1, 16, 10]} />
      </mesh>
      <Ring geo={outer} count={9} radius={0.04} closed={0.15} open={1.35} bloom={bloom} seed={3} />
      <Ring geo={inner} count={14} radius={0.02} closed={0.05} open={0.55} bloom={bloom} twist={0.2} seed={4} />
    </>
  );
};

const Marigold: React.FC<{ bloom: number }> = ({ bloom }) => {
  const long = petalGeometry("mg-l", 0.25, (t) => 0.028 * Math.sin(Math.min(1, t * 1.1) * Math.PI * 0.55 + 0.25) + 0.008, 0.25, -0.1, "#f06a00", "#ffb21a");
  const mid = petalGeometry("mg-m", 0.19, (t) => 0.024 * Math.sin(Math.min(1, t * 1.1) * Math.PI * 0.55 + 0.25) + 0.008, 0.3, -0.05, "#ef6400", "#ffa010");
  return (
    <>
      <mesh material={DISC.marigold} position-y={0.01} scale={[0.075, 0.035, 0.075]}>
        <sphereGeometry args={[1, 18, 10]} />
      </mesh>
      <Ring geo={long} count={18} radius={0.06} closed={0.2} open={1.5} bloom={bloom} seed={5} />
      <Ring geo={mid} count={16} radius={0.045} closed={0.12} open={1.05} bloom={bloom} twist={0.17} y={0.012} seed={6} />
      <Ring geo={mid} count={12} radius={0.03} closed={0.08} open={0.6} bloom={bloom} twist={0.35} y={0.02} seed={7} />
    </>
  );
};

/** Safflower: a green spiky bulb crowned by a tuft of thin red-orange florets. */
const Safflower: React.FC<{ bloom: number }> = ({ bloom }) => {
  const bract = petalGeometry("sf-b", 0.13, (t) => 0.03 * (1 - t) + 0.004, 0.4, 0.2, "#4f8f3a", "#8cbf4a");
  const floret = petalGeometry("sf-f", 0.2, () => 0.006, 0, -0.1, "#ff9a1a", "#e8241a");
  const threads = useMemo(() => {
    const g = rng(11);
    return Array.from({ length: 46 }, () => ({ a: g() * Math.PI * 2, r: g() * 0.05, tilt: g() * 0.9, s: 0.7 + g() * 0.5 }));
  }, []);
  return (
    <>
      <mesh material={stemMat} position-y={-0.03} scale={[0.085, 0.09, 0.085]}>
        <sphereGeometry args={[1, 18, 12]} />
      </mesh>
      <Ring geo={bract} count={10} radius={0.06} closed={0.6} open={0.85} bloom={bloom} y={-0.07} seed={8} jitter={0.3} />
      {threads.map((t, i) => (
        <group key={i} rotation={[0, -t.a, 0]} position-y={0.04}>
          <group position-x={t.r} rotation={[0, 0, -t.tilt * bloom]}>
            <mesh geometry={floret} material={petalMat} rotation={[0, -Math.PI / 2, 0]} scale={[1, lerp(0.25, t.s, bloom), 1]} />
          </group>
        </group>
      ))}
    </>
  );
};

/** Rose: three rings of cupped petals spiralling open from a tight centre. */
const Rose: React.FC<{ bloom: number }> = ({ bloom }) => {
  const outer = petalGeometry("rs-o", 0.22, (t) => 0.11 * Math.sin(Math.min(1, t * 1.05) * Math.PI * 0.75 + 0.15), 1.6, -0.25, "#f04f7c", "#ffb3c8");
  const mid = petalGeometry("rs-m", 0.17, (t) => 0.09 * Math.sin(Math.min(1, t * 1.05) * Math.PI * 0.75 + 0.15), 2.2, -0.1, "#ec3f6e", "#ff9ab6");
  const core = petalGeometry("rs-c", 0.12, (t) => 0.07 * Math.sin(Math.min(1, t * 1.05) * Math.PI * 0.75 + 0.15), 3.2, 0.05, "#d92a5c", "#ff7aa2");
  return (
    <>
      <Ring geo={outer} count={6} radius={0.05} closed={0.25} open={1.25} bloom={bloom} seed={12} twist={0.3} />
      <Ring geo={mid} count={5} radius={0.035} closed={0.12} open={0.75} bloom={bloom} seed={13} twist={0.9} y={0.01} />
      <Ring geo={core} count={4} radius={0.02} closed={0.05} open={0.3} bloom={bloom} seed={14} twist={1.6} y={0.02} />
      <mesh material={DISC.rose} position-y={0.04} scale={[0.03, 0.05, 0.03]}>
        <sphereGeometry args={[1, 12, 8]} />
      </mesh>
    </>
  );
};

const HEADS: Record<FlowerKind, React.FC<{ bloom: number }>> = {
  cornflower: Cornflower,
  marigold: Marigold,
  safflower: Safflower,
  rose: Rose,
};

/** A flower on a stem, nodding gently; the head turns up toward `face` as it opens. */
export const Flower: React.FC<{
  kind: FlowerKind;
  pos: V3;
  /** Stem length (world units at scale 1). */
  stem?: number;
  scale?: number;
  bloom: number;
  f: number;
  /** Head tilt toward the camera (radians about x). */
  face?: number;
  /** 0..1 head shrink as its petals leave for the vortex. */
  shed?: number;
  seed?: number;
}> = ({ kind, pos, stem = 0.9, scale = 1, bloom, f, face = 0.35, shed = 0, seed = 0 }) => {
  const Head = HEADS[kind];
  const sway = Math.sin(f / 40 + seed * 1.7) * 0.03;
  const grown = clamp01(bloom * 1.2);
  const headScale = lerp(0.7, 1, grown) * (1 - shed);
  return (
    <group position={pos} scale={scale}>
      <mesh material={stemMat} position-y={stem / 2} castShadow>
        <cylinderGeometry args={[0.012, 0.018, stem, 8]} />
      </mesh>
      <mesh material={stemMat} position={[0.04, stem * 0.35, 0]} rotation={[0, 0, -0.9]} scale={[0.05, 0.13, 0.02]}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      {headScale > 0.01 && (
        <group position-y={stem} rotation={[face * bloom + sway, 0, sway * 0.6]} scale={headScale}>
          <Head bloom={clamp01(bloom)} />
        </group>
      )}
    </group>
  );
};

/** Bare petal meshes for the vortex: one bent petal per colour, reused by many flying instances. */
export const loosePetal = (kind: FlowerKind) => {
  const c = FLOWER_COLOR[kind];
  const base = new THREE.Color(c).multiplyScalar(0.75).getStyle();
  return petalGeometry(`loose-${kind}`, kind === "safflower" ? 0.12 : 0.1, (t) => (kind === "safflower" ? 0.008 : 0.035 * Math.sin(t * Math.PI * 0.9 + 0.1)), 0.8, -0.2, base, c);
};
export { petalMat };
