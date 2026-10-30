import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../../golden/core";
import { PotPose, potToWorld, teapotGeometry, teapotSpoutTip } from "../../golden/three/models";
import { contactTexture, teaTexture } from "./textures";

export { poseAbout, potToWorld, teapotSpoutTip } from "../../golden/three/models";
export type { PotPose } from "../../golden/three/models";

/** Gold in linear RGB (sRGB #e3b04f), shared by trims, bands and the crown splash. */
export const GOLD_LINEAR = new THREE.Color().setRGB(0.77, 0.43, 0.08);

export const porcelain = () =>
  new THREE.MeshPhysicalMaterial({
    color: "#fbf6ee",
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    specularIntensity: 0.7,
  });

export const goldTrim = new THREE.MeshPhysicalMaterial({
  color: GOLD_LINEAR,
  metalness: 1,
  roughness: 0.2,
  clearcoat: 0.6,
  clearcoatRoughness: 0.08,
});

/** Vertices of the spout opening rim, teapot-local. */
let spoutRing: V3[] | null = null;
const spoutRingLocal = () => {
  if (spoutRing) return spoutRing;
  const p = teapotGeometry().attributes.position;
  let maxX = -Infinity;
  for (let i = 0; i < p.count; i++) maxX = Math.max(maxX, p.getX(i));
  spoutRing = [];
  for (let i = 0; i < p.count; i++) if (p.getX(i) > maxX - 0.03) spoutRing.push([p.getX(i), p.getY(i), p.getZ(i)]);
  return spoutRing;
};

/** Lowest point of the spout opening in world space: where a drop hangs from. */
export const spoutLip = (pose: PotPose): V3 =>
  spoutRingLocal()
    .map((v) => potToWorld(pose, v))
    .reduce((lo, v) => (v[1] < lo[1] ? v : lo));

// ---------------------------------------------------------------------------
// Teapot: porcelain with gilded body rim, belly band, lid knob and spout tip (masked in the shader).
// ---------------------------------------------------------------------------

const gildedPorcelain = () => {
  const mat = porcelain();
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLocal;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vLocal;
        float band(float y, float a, float b) { return smoothstep(a - 0.006, a + 0.006, y) * smoothstep(b + 0.006, b - 0.006, y); }
        float goldMask(vec3 p) {
          float r = length(p.xz);
          float m = band(p.y, 0.555, 0.6) * step(0.85, r);
          m = max(m, band(p.y, -0.5, -0.455) * step(1.2, r));
          m = max(m, step(0.8, p.y) * step(r, 0.3));
          m = max(m, smoothstep(2.06, 2.09, p.x));
          return m;
        }`,
      )
      .replace(
        "#include <metalnessmap_fragment>",
        `#include <metalnessmap_fragment>
        float gm = goldMask(vLocal);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.77, 0.43, 0.08), gm);
        metalnessFactor = mix(metalnessFactor, 1.0, gm);
        roughnessFactor = mix(roughnessFactor, 0.2, gm);`,
      );
  };
  return mat;
};

export const Teapot: React.FC<{
  pose: PotPose;
  material?: THREE.Material;
  renderOrder?: number;
  shadow?: boolean;
  children?: React.ReactNode;
}> = ({ pose, material, renderOrder = 0, shadow = true, children }) => {
  const mat = useMemo(() => material ?? gildedPorcelain(), [material]);
  const t = teapotSpoutTip();
  return (
    <group position={pose.tip} rotation={[0, pose.yaw ?? 0, 0]}>
      <group rotation={[0, 0, -pose.tilt]} scale={pose.scale}>
        <group position={[-t.x, -t.y, -t.z]}>
          <mesh geometry={teapotGeometry()} material={mat} renderOrder={renderOrder} castShadow={shadow} receiveShadow={shadow} />
          {children}
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Teacup on a saucer (same profile as v1). Units: cup 0.77 tall, rim radius 0.63; saucer radius 1.
// ---------------------------------------------------------------------------

const CUP_PROFILE: Array<[number, number]> = [
  [0, 0.045], [0.2, 0.045], [0.27, 0.035], [0.29, 0.0], [0.32, 0.0], [0.335, 0.04],
  [0.37, 0.12], [0.46, 0.27], [0.55, 0.46], [0.61, 0.64], [0.635, 0.75], [0.632, 0.768],
  [0.618, 0.771], [0.607, 0.755], [0.585, 0.65], [0.525, 0.46], [0.44, 0.28], [0.34, 0.15],
  [0.2, 0.105], [0, 0.1],
];
const CUP_INNER = CUP_PROFILE.slice(13).reverse();
const SAUCER_PROFILE: Array<[number, number]> = [
  [0, 0], [0.45, 0], [0.5, 0.012], [0.8, 0.06], [0.98, 0.105], [1.0, 0.12], [0.985, 0.13],
  [0.8, 0.088], [0.5, 0.042], [0.36, 0.038], [0, 0.036],
];
const SAUCER_TOP = 0.036;
const CUP_FLOOR = 0.1;
const CUP_FULL = 0.69;

const lathe = (profile: Array<[number, number]>, samples: number) => {
  const curve = new THREE.SplineCurve(profile.map(([x, y]) => new THREE.Vector2(x, y)));
  return new THREE.LatheGeometry(curve.getPoints(samples), 96);
};

let cupGeo: THREE.BufferGeometry | null = null;
let saucerGeo: THREE.BufferGeometry | null = null;

const cupInnerRadius = (y: number) => {
  for (let i = 1; i < CUP_INNER.length; i++) {
    const [r0, y0] = CUP_INNER[i - 1];
    const [r1, y1] = CUP_INNER[i];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return CUP_INNER[CUP_INNER.length - 1][0];
};

const teaLocalY = (fill: number) => CUP_FLOOR + 0.004 + fill * (CUP_FULL - CUP_FLOOR);

export type CupPose = { pos: V3; scale?: number; yaw?: number };

/** World position of the tea surface centre for a cup pose and fill (0..1). */
export const teaSurface = ({ pos, scale = 1 }: CupPose, fill: number): V3 => [
  pos[0],
  pos[1] + (SAUCER_TOP + teaLocalY(fill)) * scale,
  pos[2],
];

/** Inner radius of the cup at the tea surface, world units. */
export const teaRadius = ({ scale = 1 }: CupPose, fill: number) => cupInnerRadius(teaLocalY(fill)) * scale;

// ---------------------------------------------------------------------------
// Tea surface: polar grid displaced by an expanding ring wave (shape and normals in the vertex shader).
// ---------------------------------------------------------------------------

const polarGrid = (() => {
  let geo: THREE.BufferGeometry | null = null;
  return () => {
    if (geo) return geo;
    const rings = 64;
    const segs = 144;
    const pos: number[] = [0, 0, 0];
    const uv: number[] = [0.5, 0.5];
    const idx: number[] = [];
    for (let r = 1; r <= rings; r++) {
      const rad = Math.pow(r / rings, 0.85);
      for (let s = 0; s < segs; s++) {
        const a = (s / segs) * Math.PI * 2;
        pos.push(Math.cos(a) * rad, Math.sin(a) * rad, 0);
        uv.push(0.5 + Math.cos(a) * rad * 0.5, 0.5 + Math.sin(a) * rad * 0.5);
      }
    }
    const at = (r: number, s: number) => (r === 0 ? 0 : 1 + (r - 1) * segs + (s % segs));
    for (let s = 0; s < segs; s++) idx.push(0, at(1, s), at(1, s + 1));
    for (let r = 1; r < rings; r++) {
      for (let s = 0; s < segs; s++) {
        idx.push(at(r, s), at(r + 1, s), at(r + 1, s + 1), at(r, s), at(r + 1, s + 1), at(r, s + 1));
      }
    }
    geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(new Array(pos.length).fill(0).map((_, i) => (i % 3 === 2 ? 1 : 0)), 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    return geo;
  };
})();

/** Ring wave started by a drop: `t` seconds since impact (negative = calm), `amp` in surface radii. */
export type Ripple = { t: number; amp: number };

type TeaUniforms = Record<"uT" | "uAmp" | "uPale" | "uDark", { value: number }>;

const teaMaterial = () => {
  const uniforms: TeaUniforms = { uT: { value: -1 }, uAmp: { value: 0 }, uPale: { value: 0 }, uDark: { value: 0 } };
  const mat = new THREE.MeshPhysicalMaterial({
    map: teaTexture(),
    roughness: 0.06,
    ior: 1.33,
    specularIntensity: 1,
    emissive: new THREE.Color("#e8800f"),
    emissiveIntensity: 0,
  });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uT;
        uniform float uAmp;
        // Height and radial slope of a decaying ring wave travelling out from the centre.
        vec2 ripple(vec2 p) {
          if (uT <= 0.0 || uAmp <= 0.0) return vec2(0.0);
          float r = length(p) + 1e-4;
          float front = 0.55 * uT;
          float k = 46.0;
          float phase = k * (r - front);
          float env = exp(-uT * 0.9) * smoothstep(front + 0.03, front - 0.25, r) * smoothstep(0.99, 0.82, length(p)) / (1.0 + 2.5 * r);
          return vec2(uAmp * env * cos(phase), -uAmp * env * k * sin(phase));
        }`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `vec2 rip = ripple(position.xy);
        vec2 rdir = position.xy / (length(position.xy) + 1e-4);
        vec3 objectNormal = normalize(vec3(-rip.y * rdir, 1.0));
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
        #endif`,
      )
      .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.xy, rip.x);");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uPale;\nuniform float uDark;")
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        float edge = length(vMapUv - 0.5) * 2.0;
        diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(0.42, 0.13, 0.02), vec3(0.85, 0.42, 0.1), edge * edge), uPale);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.035, 0.012, 0.004), uDark);`,
      );
  };
  return { mat, uniforms };
};

/** Soft dark disc on the table under an object (the shadow map gives the direction; this gives the contact). */
export const ContactShadow: React.FC<{ pos: V3; radius: number; opacity?: number }> = ({ pos, radius, opacity = 1 }) => (
  <mesh position={[pos[0], 0.003, pos[2]]} rotation-x={-Math.PI / 2} scale={[radius, radius, 1]} renderOrder={-1}>
    <planeGeometry args={[2, 2]} />
    <meshBasicMaterial color="#000000" alphaMap={contactTexture()} transparent opacity={0.55 * opacity} depthWrite={false} />
  </mesh>
);

export const Cup: React.FC<{
  pose: CupPose;
  fill: number;
  /** 0 = normal tea, 1 = over-steeped near-black. */
  dark?: number;
  /** 0 = normal tea, 1 = weak first pour. */
  pale?: number;
  /** Golden glow of the tea surface (HDR emissive, drives bloom). */
  glow?: number;
  ripple?: Ripple;
  children?: React.ReactNode;
}> = ({ pose, fill, dark = 0, pale = 0, glow = 0, ripple, children }) => {
  if (!cupGeo) cupGeo = lathe(CUP_PROFILE, 160);
  if (!saucerGeo) saucerGeo = lathe(SAUCER_PROFILE, 90);
  const mat = useMemo(() => porcelain(), []);
  const tea = useMemo(teaMaterial, []);
  tea.uniforms.uT.value = ripple?.t ?? -1;
  tea.uniforms.uAmp.value = ripple?.amp ?? 0;
  tea.uniforms.uPale.value = pale;
  tea.uniforms.uDark.value = dark;
  tea.mat.emissiveIntensity = glow * 0.42;
  const y = teaLocalY(fill);
  const r = cupInnerRadius(y) * 0.997;
  const s = pose.scale ?? 1;
  return (
    <>
      <ContactShadow pos={pose.pos} radius={1.15 * s} />
      <group position={pose.pos} rotation={[0, pose.yaw ?? 0, 0]} scale={s}>
        <mesh geometry={saucerGeo} material={mat} castShadow receiveShadow />
        <mesh position-y={0.124} rotation-x={Math.PI / 2} material={goldTrim}>
          <torusGeometry args={[0.995, 0.008, 8, 128]} />
        </mesh>
        <group position-y={SAUCER_TOP}>
          <mesh geometry={cupGeo} material={mat} castShadow receiveShadow />
          <mesh position-y={0.769} rotation-x={Math.PI / 2} material={goldTrim}>
            <torusGeometry args={[0.622, 0.011, 10, 128]} />
          </mesh>
          <mesh position={[0.66, 0.43, 0]} rotation-z={1.32 * Math.PI} material={mat} castShadow>
            <torusGeometry args={[0.165, 0.038, 16, 48, 1.36 * Math.PI]} />
          </mesh>
          {fill > 0.001 && (
            <mesh position-y={y} rotation-x={-Math.PI / 2} scale={[r, r, r]} geometry={polarGrid()} material={tea.mat} receiveShadow />
          )}
          {children}
        </group>
      </group>
    </>
  );
};
