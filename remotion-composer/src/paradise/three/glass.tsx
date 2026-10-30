import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { lerp, rng, V3 } from "../core";
import { ContactShadow } from "../../golden2/three/models";

// ---------------------------------------------------------------------------
// Iced-tea highball: additive fresnel glass (the sky's softboxes reflected in it), amber tea clipped at
// a world-space level with a lit surface cap, floating ice, an optional paper straw and loose petals.
// Glass-local units: base at y 0, rim at GLASS_H.
// ---------------------------------------------------------------------------

export const GLASS_H = 1.6;
const R_BOTTOM = 0.36;
const R_TOP = 0.43;
const BASE = 0.14;
const WALL = 0.022;

const outerRadius = (y: number) => lerp(R_BOTTOM, R_TOP, y / GLASS_H);
/** Inner radius at height y (glass-local). */
export const innerRadius = (y: number) => outerRadius(y) - WALL;

/** Additive fresnel shell: edges catch the sky and the sun box, the face stays almost clear. */
export const fresnelGlass = (tint = "#e9fbff", strength = 1) =>
  new THREE.ShaderMaterial({
    uniforms: { tint: { value: new THREE.Color(tint) }, strength: { value: strength } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 tint;
      uniform float strength;
      varying vec3 vN;
      varying vec3 vV;
      float box(vec3 r, vec3 dir, float w, float h) {
        vec3 d = normalize(dir);
        vec3 side = normalize(cross(d, vec3(0.0, 1.0, 0.0)));
        vec3 up = cross(side, d);
        float f = dot(r, d);
        if (f <= 0.0) return 0.0;
        vec2 p = vec2(dot(r, side), dot(r, up)) / f;
        return smoothstep(w, w * 0.7, abs(p.x)) * smoothstep(h, h * 0.7, abs(p.y));
      }
      void main() {
        vec3 n = normalize(vN);
        if (!gl_FrontFacing) n = -n;
        // clamp: |n·v| can exceed 1 by rounding, and pow() of a negative base is NaN (bloom smears NaN into blocks).
        float fres = pow(clamp(1.0 - abs(dot(n, vV)), 0.0, 1.0), 2.4);
        vec3 r = reflect(-vV, n);
        float win = box(r, vec3(-0.7, 0.35, 0.6), 0.5, 0.22);
        float rim = box(r, vec3(0.75, 0.3, 0.5), 0.08, 0.7);
        float top = box(r, vec3(0.0, 0.95, 0.2), 0.8, 0.08);
        float spec = 0.15 + 0.85 * fres;
        vec3 c = tint * (0.02 + fres * 0.5) + spec * (vec3(1.0) * (win * 0.9 + top * 0.9) + vec3(1.0, 0.85, 0.6) * rim * 1.3);
        gl_FragColor = vec4(c * strength, 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

let shellGeo: THREE.LatheGeometry | null = null;
const shellGeometry = () => {
  if (shellGeo) return shellGeo;
  const pts: THREE.Vector2[] = [];
  pts.push(new THREE.Vector2(0.001, 0), new THREE.Vector2(R_BOTTOM - 0.02, 0), new THREE.Vector2(R_BOTTOM, 0.02));
  for (let i = 1; i <= 20; i++) pts.push(new THREE.Vector2(outerRadius((i / 20) * GLASS_H), (i / 20) * GLASS_H));
  pts.push(new THREE.Vector2(R_TOP - 0.006, GLASS_H + 0.006), new THREE.Vector2(innerRadius(GLASS_H), GLASS_H));
  for (let i = 20; i >= 0; i--) {
    const y = BASE + (i / 20) * (GLASS_H - BASE);
    pts.push(new THREE.Vector2(innerRadius(y), y));
  }
  pts.push(new THREE.Vector2(0.001, BASE));
  shellGeo = new THREE.LatheGeometry(pts, 96);
  return shellGeo;
};

let teaGeo: THREE.LatheGeometry | null = null;
const teaGeometry = () => {
  if (teaGeo) return teaGeo;
  const pts = [new THREE.Vector2(0.001, BASE + 0.003)];
  for (let i = 0; i <= 16; i++) {
    const y = BASE + 0.003 + (i / 16) * (GLASS_H - BASE - 0.01);
    pts.push(new THREE.Vector2(innerRadius(y) * 0.985, y));
  }
  teaGeo = new THREE.LatheGeometry(pts, 72);
  return teaGeo;
};

const TEA = new THREE.Color("#6a2604");
const TEA_CAP = new THREE.Color("#b8520c");

/** Amber tea; the interior (FLIP_SIDED) pass paints the flat surface cap, lit from the sun behind. */
const teaMaterial = (plane: THREE.Plane, cap: { value: THREE.Color }) => {
  const mat = new THREE.MeshPhysicalMaterial({
    color: TEA,
    // Little surface reflection: the glass shell carries the highlights, the tea keeps its amber.
    roughness: 0.35,
    specularIntensity: 0.25,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    clippingPlanes: [plane],
    depthWrite: false,
    emissive: new THREE.Color("#d2600a"),
    emissiveIntensity: 0.32,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.capColor = cap;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 capColor;")
      .replace(
        "#include <dithering_fragment>",
        // Transparent DoubleSide draws the interior in a FLIP_SIDED pass, where gl_FrontFacing is always true.
        "#include <dithering_fragment>\n#ifdef FLIP_SIDED\ngl_FragColor = vec4(capColor, 0.9);\n#endif",
      );
  };
  return mat;
};

const iceGeo = new RoundedBoxGeometry(1, 1, 1, 3, 0.18);
const strawMat = new THREE.MeshPhysicalMaterial({ color: "#ff8f7a", roughness: 0.55, clearcoat: 0.2 });

/** Loose petals floating at the tea surface (glass-local), in the four flower colours. */
export const PETAL_COLORS = ["#3d6bff", "#ff8a12", "#ef3a1e", "#ff7aa2"];
const petalGeo = (() => {
  let g: THREE.BufferGeometry | null = null;
  return () => {
    if (g) return g;
    const s = new THREE.Shape();
    s.moveTo(0, -0.05);
    s.quadraticCurveTo(0.045, 0, 0, 0.06);
    s.quadraticCurveTo(-0.045, 0, 0, -0.05);
    g = new THREE.ShapeGeometry(s, 6);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, p.getX(i) * p.getX(i) * 6);
    g.computeVertexNormals();
    return g;
  };
})();
const petalMats = PETAL_COLORS.map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, sheen: 1, side: THREE.DoubleSide }));

export type GlassPose = { pos: V3; scale?: number };

/** World height of the tea surface for a pose and fill (0..1). */
export const teaLevel = ({ pos, scale = 1 }: GlassPose, fill: number) => pos[1] + (BASE + fill * (GLASS_H - BASE - 0.06)) * scale;
export const glassRim = ({ pos, scale = 1 }: GlassPose): V3 => [pos[0], pos[1] + GLASS_H * scale, pos[2]];

export const IcedGlass: React.FC<{
  pose: GlassPose;
  fill: number;
  f: number;
  ice?: number;
  straw?: boolean;
  petals?: number;
  /** Extra amber glow when the sun is right behind (HDR emissive, drives bloom). */
  glow?: number;
  /** Spin of the ice around the glass axis (radians), for the stirred / clinking beat. */
  swirl?: number;
}> = ({ pose, fill, f, ice = 4, straw = false, petals = 0, glow = 0, swirl = 0 }) => {
  const shell = useMemo(() => fresnelGlass(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const cap = useMemo(() => ({ value: TEA_CAP.clone() }), []);
  const tea = useMemo(() => teaMaterial(plane, cap), [plane, cap]);
  const iceMat = useMemo(() => fresnelGlass("#f4feff", 1.25), []);
  const iceFill = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#f3fbff", roughness: 0.2, transparent: true, opacity: 0.28, depthWrite: false }),
    [],
  );
  const cubes = useMemo(() => {
    const r = rng(13);
    return Array.from({ length: 6 }, (_, i) => ({
      a: (i / 6) * Math.PI * 2 + r() * 0.6,
      rad: 0.1 + r() * 0.13,
      dy: r() * 0.22,
      rx: r() * 6.28,
      ry: r() * 6.28,
      s: 0.16 + r() * 0.04,
      ph: r() * 6.28,
    }));
  }, []);
  const floaters = useMemo(() => {
    const r = rng(29);
    return Array.from({ length: 24 }, (_, i) => ({ a: r() * 6.28, rad: r() * 0.3, rot: r() * 6.28, m: i % 4, ph: r() * 6.28 }));
  }, []);
  const s = pose.scale ?? 1;
  const level = teaLevel(pose, fill);
  plane.constant = level;
  tea.emissiveIntensity = 0.3 + glow * 0.45;
  cap.value.copy(TEA_CAP).multiplyScalar(1 + glow * 0.6);
  const localLevel = (level - pose.pos[1]) / s;
  return (
    <>
      <ContactShadow pos={pose.pos} radius={0.62 * s} opacity={0.7} />
      <group position={pose.pos} scale={s}>
        {fill > 0.01 && <mesh geometry={teaGeometry()} material={tea} renderOrder={1} />}
        {cubes.slice(0, fill > 0.05 ? ice : 0).map((c, i) => {
          const a = c.a + swirl;
          const y = Math.min(localLevel - 0.08 - c.dy, GLASS_H - 0.2) + Math.sin(f / 24 + c.ph) * 0.012;
          return (
            <group key={i} position={[Math.cos(a) * c.rad, Math.max(BASE + 0.12, y), Math.sin(a) * c.rad]} rotation={[c.rx + swirl, c.ry, 0]} scale={c.s}>
              <mesh geometry={iceGeo} material={iceFill} renderOrder={2} />
              <mesh geometry={iceGeo} material={iceMat} renderOrder={3} />
            </group>
          );
        })}
        {floaters.slice(0, petals).map((p, i) => (
          <mesh
            key={`p${i}`}
            geometry={petalGeo()}
            material={petalMats[p.m]}
            position={[Math.cos(p.a + f / 200) * p.rad, localLevel + 0.004, Math.sin(p.a + f / 200) * p.rad]}
            rotation={[-Math.PI / 2 + Math.sin(f / 30 + p.ph) * 0.08, 0, p.rot]}
            scale={1.3}
            renderOrder={2}
          />
        ))}
        {straw && (
          <mesh position={[0.12, 1.15, -0.05]} rotation={[0.08, 0, -0.16]} material={strawMat} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 1.9, 20, 1, true]} />
          </mesh>
        )}
        <mesh geometry={shellGeometry()} material={shell} renderOrder={4} />
        {/* Invisible solid for the sun's shadow: the glass throws a soft amber-less shade on the stone. */}
        <mesh position-y={GLASS_H * fill * 0.5 + BASE * 0.5} castShadow>
          <cylinderGeometry args={[R_BOTTOM * 0.92, R_BOTTOM * 0.9, GLASS_H * Math.max(0.15, fill), 24]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
};
