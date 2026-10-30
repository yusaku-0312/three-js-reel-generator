import React, { useMemo } from "react";
import * as THREE from "three";
import { lerp, rng } from "../../golden/core";
import { teapotGeometry } from "../../golden/three/models";
import { PotPose, Teapot } from "./models";

// ---------------------------------------------------------------------------
// Glass teapot: additive fresnel shell with the studio softboxes reflected in it, tea clipped at a
// world-space level, rolled leaves inside.
// ---------------------------------------------------------------------------

const glassMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { tint: { value: new THREE.Color("#ffe6c2") } },
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
      varying vec3 vN;
      varying vec3 vV;
      // Rectangular softbox seen in reflection direction r: bright inside a cone, soft edge.
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
        float fres = pow(clamp(1.0 - abs(dot(n, vV)), 0.0, 1.0), 2.6);
        vec3 r = reflect(-vV, n);
        float key = box(r, vec3(-0.6, 0.65, 0.45), 0.42, 0.28);
        float rim = box(r, vec3(0.6, 0.25, -0.6), 0.08, 0.6);
        float top = box(r, vec3(0.0, 0.92, -0.38), 0.7, 0.07);
        float spec = 0.12 + 0.88 * fres;
        vec3 c = tint * (0.02 + fres * 0.5) + spec * (vec3(1.0, 0.95, 0.88) * (key * 1.4 + top * 1.1) + vec3(1.0, 0.7, 0.35) * rim * 1.6);
        gl_FragColor = vec4(c, 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

/** Outer radius of the teapot body by height, read off the x = 0 seam of the geometry. */
let bodyProfile: Array<[number, number]> | null = null;
const teapotBody = () => {
  if (bodyProfile) return bodyProfile;
  const p = teapotGeometry().attributes.position;
  const bins = new Map<number, number>();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    if (Math.abs(x) > 0.004 || z <= 0 || y > 0.62) continue;
    const key = Math.round(y * 40) / 40;
    bins.set(key, Math.max(bins.get(key) ?? 0, z));
  }
  bodyProfile = [...bins.entries()].sort((a, b) => a[0] - b[0]).map(([y, r]) => [r, y]);
  return bodyProfile;
};

/** Liquid shell inside the body (closed at the bottom; the top is cut by a clip plane). */
let liquidGeo: THREE.LatheGeometry | null = null;
const liquidGeometry = () => {
  if (liquidGeo) return liquidGeo;
  const body = teapotBody().filter(([, y]) => y > -0.94);
  const floorY = body[0][1] + 0.02;
  const pts = [new THREE.Vector2(0, floorY), ...body.map(([r, y]) => new THREE.Vector2(r * 0.94, Math.max(y, floorY)))];
  liquidGeo = new THREE.LatheGeometry(pts, 64);
  return liquidGeo;
};

const FRESH = new THREE.Color("#9a3a10");
const STEWED = new THREE.Color("#4a1205");
const CAP_FRESH = new THREE.Color("#b5561c");
const CAP_STEWED = new THREE.Color("#5a1a06");

/** Tea inside the glass; the interior (FLIP_SIDED) pass paints the flat surface cap in linear `capColor`. */
const liquidMaterial = (plane: THREE.Plane, cap: { value: THREE.Color }) => {
  const mat = new THREE.MeshPhysicalMaterial({
    color: FRESH,
    roughness: 0.1,
    clearcoat: 1,
    transparent: true,
    opacity: 0.84,
    side: THREE.DoubleSide,
    clippingPlanes: [plane],
    depthWrite: false,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.capColor = cap;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 capColor;")
      .replace(
        "#include <dithering_fragment>",
        // Transparent DoubleSide draws the interior in a FLIP_SIDED pass, where gl_FrontFacing is always true.
        "#include <dithering_fragment>\n#ifdef FLIP_SIDED\ngl_FragColor = vec4(capColor, 0.92);\n#endif",
      );
  };
  return mat;
};

const leafGeometry = (() => {
  let geo: THREE.BufferGeometry | null = null;
  return () => {
    if (geo) return geo;
    const s = new THREE.Shape();
    s.moveTo(-0.07, 0);
    s.quadraticCurveTo(0, 0.032, 0.07, 0);
    s.quadraticCurveTo(0, -0.032, -0.07, 0);
    geo = new THREE.ShapeGeometry(s, 8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getX(i) * pos.getX(i) * 7 + pos.getY(i) * pos.getY(i) * 9); // curl + roll
    geo.computeVertexNormals();
    return geo;
  };
})();

const leafMats = ["#3a200d", "#4d2a10", "#2b1708"].map(
  (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.45, clearcoat: 0.4, side: THREE.DoubleSide }),
);

/** Tea leaves dancing in the pot (jumping), settling to the bottom as the pot empties. Teapot-local units. */
const Leaves: React.FC<{ f: number; count?: number; settle: number }> = ({ f, count = 46, settle }) => {
  const leaves = useMemo(() => {
    const r = rng(21);
    return Array.from({ length: count }, () => ({
      a: r() * Math.PI * 2,
      rad: 0.15 + r() * 0.55,
      y: -0.85 + r() * 0.35,
      sp: 0.4 + r() * 0.8,
      rx: r() * 6.28,
      ry: r() * 6.28,
      spin: 0.5 + r() * 1.5,
      s: 0.8 + r() * 0.7,
      m: Math.floor(r() * 3),
    }));
  }, [count]);
  return (
    <>
      {leaves.map((l, i) => {
        const t = f / 30;
        const a = l.a + t * l.sp * 0.6 * (1 - settle);
        const bob = Math.sin(t * l.sp * 2 + l.rx) * 0.12 * (1 - settle);
        const y = lerp(l.y + bob, -0.84 + (l.y + 0.85) * 0.15, settle);
        const rad = l.rad * (1 - settle * 0.25);
        return (
          <mesh
            key={i}
            geometry={leafGeometry()}
            material={leafMats[l.m]}
            position={[Math.cos(a) * rad, y, Math.sin(a) * rad]}
            rotation={[l.rx + t * l.spin * (1 - settle), l.ry + t * l.spin * 0.7 * (1 - settle), 0]}
            scale={l.s}
          />
        );
      })}
    </>
  );
};

export const GlassPot: React.FC<{
  pose: PotPose;
  /** World-space height of the tea surface. */
  level: number;
  f: number;
  /** 0 = fresh amber, 1 = over-steeped dark. */
  dark?: number;
  /** 0 = leaves dancing, 1 = sunk to the bottom. */
  settle?: number;
  children?: React.ReactNode;
}> = ({ pose, level, f, dark = 0, settle = 0, children }) => {
  const glass = useMemo(glassMaterial, []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const cap = useMemo(() => ({ value: CAP_FRESH.clone() }), []);
  const liquid = useMemo(() => liquidMaterial(plane, cap), [plane, cap]);
  plane.constant = level;
  liquid.color.copy(FRESH).lerp(STEWED, dark);
  cap.value.copy(CAP_FRESH).lerp(CAP_STEWED, dark);
  return (
    <Teapot pose={pose} material={glass} renderOrder={2} shadow={false}>
      <Leaves f={f} settle={settle} />
      <mesh geometry={liquidGeometry()} material={liquid} renderOrder={1} />
      {children}
    </Teapot>
  );
};
