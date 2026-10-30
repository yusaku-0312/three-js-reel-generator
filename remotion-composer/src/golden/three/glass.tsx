import React, { useMemo } from "react";
import * as THREE from "three";
import { lerp, rng } from "../core";
import { PotPose, Teapot, teapotGeometry } from "./models";

// ---------------------------------------------------------------------------
// X-ray teapot: fresnel glass shell, tea clipped at a world-space level, leaves inside.
// ---------------------------------------------------------------------------

const glassMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      rim: { value: new THREE.Color("#ffe3b8") },
      lightDir: { value: new THREE.Vector3(-0.4, 0.8, 0.5).normalize() },
    },
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
      uniform vec3 rim;
      uniform vec3 lightDir;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec3 n = normalize(vN);
        if (!gl_FrontFacing) n = -n;
        float fres = pow(1.0 - abs(dot(n, vV)), 2.4);
        float spec = pow(max(dot(n, normalize(lightDir + vV)), 0.0), 90.0);
        gl_FragColor = vec4(rim * (0.03 + fres * 0.75) + vec3(spec * 0.9), 1.0);
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

/** sRGB components as-is: the cap colour is written straight to the output, after tone mapping. */
const hexToVec = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const liquidMaterial = (plane: THREE.Plane, cap: { value: THREE.Vector3 }) => {
  const mat = new THREE.MeshPhysicalMaterial({
    color: "#9a3a10",
    roughness: 0.1,
    clearcoat: 1,
    transparent: true,
    opacity: 0.82,
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
    s.quadraticCurveTo(0, 0.035, 0.07, 0);
    s.quadraticCurveTo(0, -0.035, -0.07, 0);
    geo = new THREE.ShapeGeometry(s, 6);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getX(i) * pos.getX(i) * 6); // curl
    geo.computeVertexNormals();
    return geo;
  };
})();

const leafMat = new THREE.MeshStandardMaterial({ color: "#4a2c12", roughness: 0.55, side: THREE.DoubleSide });

/** Tea leaves jumping in the pot, teapot-local units. */
const Leaves: React.FC<{ f: number; count?: number; settle: number }> = ({ f, count = 42, settle }) => {
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
            material={leafMat}
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
  const cap = useMemo(() => ({ value: hexToVec("#b0521c") }), []);
  const liquid = useMemo(() => liquidMaterial(plane, cap), [plane, cap]);
  plane.constant = level;
  liquid.color.set("#9a3a10").lerp(new THREE.Color("#2a0d03"), dark);
  cap.value.copy(hexToVec("#b0521c")).lerp(hexToVec("#3a1406"), dark);
  return (
    <Teapot pose={pose} material={glass} renderOrder={2}>
      <Leaves f={f} settle={settle} />
      <mesh geometry={liquidGeometry()} material={liquid} renderOrder={1} />
      {children}
    </Teapot>
  );
};
