import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp01, lerp, lerp3, rng, V3 } from "../core";
import { ContactShadow } from "../../golden2/three/models";
import { Ribbon } from "../../paradise/three/fx";
import { butterTexture, cookieTexture, unionFlagTexture } from "./textures";

// ---------------------------------------------------------------------------
// Butter cookie: an extruded bevelled disc. Unrotated it stands like a coin facing +Z (shape y = up),
// so a dunk only has to lower it; lying on a plate is rot [-π/2, 0, 0]. Bites are scallops cut into the
// outline; `wet` darkens everything below a local height (the part that soaked up tea).
// ---------------------------------------------------------------------------

export const COOKIE_R = 0.42;
export const COOKIE_T = 0.1;
const BEVEL = 0.028;

/** A bite out of the rim: `a` = angle of the bite centre (radians, 0 = +x), `r` = tooth-arc radius. */
export type Bite = { a: number; r: number };
export type CookiePose = { pos: V3; rot?: V3; scale?: number };

const outline = (bites: Bite[]) => {
  const N = 160;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    let p = new THREE.Vector2(Math.cos(t) * COOKIE_R, Math.sin(t) * COOKIE_R);
    for (const b of bites) {
      const c = new THREE.Vector2(Math.cos(b.a), Math.sin(b.a)).multiplyScalar(COOKIE_R + b.r * 0.35);
      const d = p.clone().sub(c);
      const wobble = b.r * (1 + 0.07 * Math.sin(Math.atan2(d.y, d.x) * 9));
      if (d.length() < wobble) p = c.clone().add(d.normalize().multiplyScalar(wobble));
    }
    pts.push(p);
  }
  return new THREE.Shape(pts);
};

const geoCache = new Map<string, THREE.BufferGeometry>();
const cookieGeometry = (bites: Bite[]) => {
  const key = JSON.stringify(bites);
  const hit = geoCache.get(key);
  if (hit) return hit;
  const depth = COOKIE_T - BEVEL * 2;
  const geo = new THREE.ExtrudeGeometry(outline(bites), {
    depth,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 4,
    curveSegments: 4,
  });
  geo.translate(0, 0, -depth / 2);
  // Face UVs come out in shape units; map the disc onto the 0..1 texture square.
  const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + COOKIE_R) / (2 * COOKIE_R), (uv.getY(i) + COOKIE_R) / (2 * COOKIE_R));
  geo.computeVertexNormals();
  geoCache.set(key, geo);
  return geo;
};

type WetUniforms = { uWetY: { value: number }; uWet: { value: number } };

const cookieMaterial = () => {
  const uniforms: WetUniforms = { uWetY: { value: -1 }, uWet: { value: 0 } };
  const mat = new THREE.MeshStandardMaterial({ map: cookieTexture(), roughness: 0.82, emissive: new THREE.Color("#ff9c3a"), emissiveIntensity: 0 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vLocalY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocalY = position.y;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vLocalY;\nuniform float uWetY;\nuniform float uWet;")
      .replace(
        "#include <map_fragment>",
        "#include <map_fragment>\nfloat wetK = uWet * smoothstep(uWetY + 0.025, uWetY - 0.025, vLocalY);\ndiffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.5, 0.33, 0.2), wetK);",
      )
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.38, wetK);");
  };
  return { mat, uniforms };
};

export const Cookie: React.FC<{
  pose: CookiePose;
  bites?: Bite[];
  /** 0..1 fraction of the height (from the bottom of the standing disc) that soaked up tea. */
  wet?: number;
  /** Warm emissive glow (HDR, drives bloom a little). */
  glow?: number;
  shadow?: boolean;
}> = ({ pose, bites = [], wet = 0, glow = 0, shadow = true }) => {
  const m = useMemo(cookieMaterial, []);
  m.uniforms.uWet.value = wet > 0 ? 1 : 0;
  m.uniforms.uWetY.value = -COOKIE_R + wet * 2 * COOKIE_R;
  m.mat.emissiveIntensity = glow * 0.22;
  const s = pose.scale ?? 1;
  return (
    <mesh
      geometry={cookieGeometry(bites)}
      material={m.mat}
      position={pose.pos}
      rotation={pose.rot ?? [0, 0, 0]}
      scale={s}
      castShadow={shadow}
      receiveShadow
    />
  );
};

/** A cookie lying flat at `pos` (centre of its bottom face on whatever it rests on). */
export const flatCookie = (pos: V3, yaw = 0, tilt = 0, scale = 1): CookiePose => ({
  pos: [pos[0], pos[1] + (COOKIE_T / 2) * scale, pos[2]],
  rot: [-Math.PI / 2 + tilt, 0, yaw],
  scale,
});

// ---------------------------------------------------------------------------
// Crumbs that fly off a bite and fall (frame-driven ballistic arcs).
// ---------------------------------------------------------------------------

const crumbGeo = new THREE.DodecahedronGeometry(1, 0);
const crumbMat = new THREE.MeshStandardMaterial({ color: "#d39a52", roughness: 0.9 });

export const Crumbs: React.FC<{ at: V3; t: number; seed?: number; count?: number; floor?: number }> = ({ at, t, seed = 4, count = 12, floor = 0 }) => {
  const parts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      v: [(r() - 0.5) * 0.05, 0.02 + r() * 0.035, (r() - 0.2) * 0.05] as V3,
      size: 0.012 + r() * 0.02,
      spin: r() * 6,
    }));
  }, [seed, count]);
  if (t < 0 || t > 40) return null;
  return (
    <>
      {parts.map((p, i) => {
        const y = Math.max(floor + p.size, at[1] + p.v[1] * t - 0.0016 * t * t);
        return (
          <mesh
            key={i}
            geometry={crumbGeo}
            material={crumbMat}
            position={[at[0] + p.v[0] * t, y, at[2] + p.v[2] * t]}
            rotation={[p.spin + t * 0.2, p.spin * 2, 0]}
            scale={p.size * (1 - clamp01((t - 30) / 10))}
          />
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Golden oil beads: they bead up on the cookie, lift into a floating cluster (the greasy film left in the
// mouth) and dissolve one by one when the tea's astringency reaches them.
// ---------------------------------------------------------------------------

const beadGeo = new THREE.SphereGeometry(1, 24, 16);

export const OilBeads: React.FC<{
  /** Where the beads first appear (cookie top centre) and how wide. */
  from: V3;
  fromRadius: number;
  /** Centre and size of the floating cluster. */
  cloud: V3;
  spread: number;
  f: number;
  appear: number;
  lift: number;
  dissolve?: number;
  count?: number;
  seed?: number;
}> = ({ from, fromRadius, cloud, spread, f, appear, lift, dissolve = 0, count = 16, seed = 8 }) => {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f2bf3a",
        roughness: 0.12,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        emissive: new THREE.Color("#b87400"),
        emissiveIntensity: 0.28,
      }),
    [],
  );
  const beads = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, (_, i) => {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r());
      return {
        start: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3,
        end: [(r() - 0.5) * 2, (r() - 0.5) * 1.1, (r() - 0.5) * 1.2] as V3,
        size: 0.035 + r() * 0.035,
        delay: r() * 0.5,
        order: (i * 7) % count,
        phase: r() * Math.PI * 2,
      };
    });
  }, [count, seed]);
  if (appear <= 0) return null;
  return (
    <>
      {beads.map((b, i) => {
        const k = clamp01((appear - b.delay) / (1 - b.delay));
        const l = clamp01((lift - b.delay * 0.6) / (1 - b.delay * 0.6));
        const gone = clamp01(dissolve * 1.6 - (b.order / count) * 0.6);
        const size = b.size * k * (1 - gone) * lerp(0.7, 1, l);
        if (size <= 0.002) return null;
        const start: V3 = [from[0] + b.start[0] * fromRadius, from[1] + size * 0.5, from[2] + b.start[2] * fromRadius];
        const end: V3 = [cloud[0] + b.end[0] * spread, cloud[1] + b.end[1] * spread, cloud[2] + b.end[2] * spread];
        const p = lerp3(start, end, l * l * (3 - 2 * l));
        const bob = Math.sin(f / 14 + b.phase) * 0.03 * l;
        return <mesh key={i} geometry={beadGeo} material={mat} position={[p[0], p[1] + bob, p[2]]} scale={size} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Props: off-white plate, a block of butter on a paper square, a Union-flag toothpick.
// ---------------------------------------------------------------------------

const PLATE_PROFILE = [
  [0, 0.0],
  [0.62, 0.0],
  [0.66, 0.012],
  [0.72, 0.03],
  [0.92, 0.07],
  [0.95, 0.085],
  [0.93, 0.09],
  [0.7, 0.05],
  [0.0, 0.04],
].map(([x, y]) => new THREE.Vector2(x, y));
let plateGeo: THREE.LatheGeometry | null = null;
export const PLATE_TOP = 0.04;

export const Plate: React.FC<{ pos: V3; scale?: number }> = ({ pos, scale = 1 }) => {
  if (!plateGeo) plateGeo = new THREE.LatheGeometry(PLATE_PROFILE, 96);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#e9e4da", roughness: 0.38, clearcoat: 0.25, clearcoatRoughness: 0.4, side: THREE.DoubleSide }), []);
  return (
    <>
      <ContactShadow pos={pos} radius={1.05 * scale} />
      <mesh geometry={plateGeo} material={mat} position={pos} scale={scale} castShadow receiveShadow />
    </>
  );
};

export const Butter: React.FC<{ pos: V3; yaw?: number; scale?: number }> = ({ pos, yaw = 0, scale = 1 }) => (
  <group position={pos} rotation={[0, yaw, 0]} scale={scale}>
    <mesh position-y={0.004} receiveShadow>
      <boxGeometry args={[0.62, 0.008, 0.46]} />
      <meshStandardMaterial color="#f4ede0" roughness={0.9} />
    </mesh>
    <mesh position-y={0.13} castShadow receiveShadow>
      <boxGeometry args={[0.46, 0.24, 0.3]} />
      <meshStandardMaterial map={butterTexture()} roughness={0.45} emissive="#f0c040" emissiveIntensity={0.05} />
    </mesh>
  </group>
);

export const UnionFlagPick: React.FC<{ pos: V3; up: number; f: number }> = ({ pos, up, f }) => {
  if (up <= 0.01) return null;
  const sway = Math.sin(f / 9) * 0.08 * (1 - up) + Math.sin(f / 23) * 0.03;
  return (
    <group position={pos} scale={up} rotation={[0, -0.35, sway]}>
      <mesh position-y={0.45}>
        <cylinderGeometry args={[0.012, 0.012, 0.9, 8]} />
        <meshStandardMaterial color="#e8d3a8" roughness={0.6} />
      </mesh>
      <mesh position={[0.23, 0.76, 0]}>
        <planeGeometry args={[0.45, 0.3]} />
        <meshStandardMaterial map={unionFlagTexture()} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Scent: the paradise Aroma bundle with a thinner ribbon (cookie-sized; Aroma's 0.09 reads as a sash up close).
// ---------------------------------------------------------------------------

export const Scent: React.FC<{
  from: V3;
  f: number;
  colors: string[];
  grow: number;
  intensity?: number;
  height?: number;
  radius?: number;
  width?: number;
  to?: V3;
  seed?: number;
}> = ({ from, f, colors, grow, intensity = 0.3, height = 0.9, radius = 0.2, width = 0.05, to, seed = 3 }) => {
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
          width={width}
          grow={clamp01((grow - params[i].delay) / (1 - params[i].delay))}
          intensity={intensity}
        />
      ))}
    </>
  );
};
