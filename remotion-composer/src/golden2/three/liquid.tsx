import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp01, lerp, rng, useGeometry, V3 } from "../../golden/core";

const AMBER = new THREE.Color("#a8451a");
const GOLD = new THREE.Color("#ffb21f");

// ---------------------------------------------------------------------------
// The drop: clear amber liquid (transmission) that lights up gold from within.
// ---------------------------------------------------------------------------

const dropGeometries = new Map<number, THREE.LatheGeometry>();

/** Lathe of a bead (shape 0) morphing to a falling teardrop with its tail up (shape 1). */
const dropGeometry = (shape: number) => {
  const key = Math.round(clamp01(shape) * 12);
  const hit = dropGeometries.get(key);
  if (hit) return hit;
  const m = (key / 12) * 1.6;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = Math.PI - (i / 48) * Math.PI;
    pts.push(new THREE.Vector2(Math.max(1e-4, Math.sin(t) * Math.pow(Math.sin(t / 2), m)), Math.cos(t)));
  }
  const geo = new THREE.LatheGeometry(pts, 64);
  dropGeometries.set(key, geo);
  return geo;
};

const liquidMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transmission: 1,
    thickness: 0.12,
    ior: 1.33,
    roughness: 0.02,
    attenuationColor: new THREE.Color("#c25a16"),
    attenuationDistance: 0.14,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    emissive: GOLD.clone(),
    emissiveIntensity: 0,
  });

export const Drop: React.FC<{
  pos: V3;
  size: number;
  /** 0 = round bead, 1 = falling teardrop. */
  shape?: number;
  /** 0 = plain tea amber, 1 = glowing gold. */
  gold?: number;
  /** Vertical stretch (>1) or squash (<1), volume kept by widening. */
  stretch?: number;
  /** Liquid colour in place of tea amber (e.g. green tea). */
  tint?: string;
}> = ({ pos, size, shape = 0, gold = 0, stretch = 1, tint }) => {
  const mat = useMemo(liquidMaterial, []);
  const base = tint ? new THREE.Color(tint) : AMBER;
  mat.attenuationColor.copy(base).lerp(GOLD, gold * 0.7);
  mat.emissive.copy(base).lerp(GOLD, gold);
  mat.emissiveIntensity = 0.15 + gold * 1.25;
  if (size <= 0) return null;
  const w = size / Math.sqrt(stretch);
  return (
    <mesh position={pos} geometry={dropGeometry(shape)} material={mat} scale={[w, size * stretch, w]} castShadow />
  );
};

/** Thin liquid thread between the spout lip and a hanging drop; `pinch` 1 = snapped. */
export const Neck: React.FC<{ from: V3; to: V3; radius: number; pinch: number; gold?: number }> = ({
  from,
  to,
  radius,
  pinch,
  gold = 0,
}) => {
  const mat = useMemo(liquidMaterial, []);
  mat.emissive.copy(AMBER).lerp(GOLD, gold);
  mat.emissiveIntensity = 0.15 + gold * 1.25;
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const r = radius * (1 - pinch);
  if (r <= radius * 0.05 || len < 1e-4) return null;
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <mesh position={mid} quaternion={quat} material={mat}>
      <cylinderGeometry args={[r * 1.15, r * 0.8, len, 24, 1, true]} />
    </mesh>
  );
};

/** Warm light carried by the golden drop: it lights the spout and the tea below. Always mounted. */
export const DropLight: React.FC<{ pos: V3; intensity: number }> = ({ pos, intensity }) => (
  <pointLight position={pos} color="#ffb547" intensity={intensity} distance={2.2} decay={2} />
);

// ---------------------------------------------------------------------------
// Pour stream: a tapered tube along a bezier from the spout to the cup, with a slight wobble.
// [s0, s1] is the visible slice of the path (s1 grows as it starts, s0 as it ends).
// ---------------------------------------------------------------------------

export const Stream: React.FC<{
  from: V3;
  to: V3;
  s0?: number;
  s1?: number;
  radius: number;
  bend?: number;
  f: number;
  /** Liquid colour in place of tea amber (e.g. green tea). */
  tint?: string;
}> = ({ from, to, s0 = 0, s1 = 1, radius, bend = 0.25, f, tint }) => {
  const mat = useMemo(() => {
    const m = liquidMaterial();
    m.thickness = 0.05;
    m.attenuationDistance = 0.3;
    m.emissiveIntensity = 0.12;
    m.emissive.copy(AMBER);
    if (tint) {
      m.attenuationColor.set(tint);
      m.emissive.set(tint);
    }
    return m;
  }, [tint]);
  const visible = s1 - s0 > 0.01 && radius > 0.001;
  const geo = useGeometry(() => {
    if (!visible) return new THREE.BufferGeometry();
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const ctrl = new THREE.Vector3(lerp(a.x, b.x, 0.15) + bend * Math.sign(b.x - a.x || 1), a.y - 0.05, lerp(a.z, b.z, 0.15));
    const path = new THREE.QuadraticBezierCurve3(a, ctrl, b);
    const pts = Array.from({ length: 25 }, (_, i) => path.getPoint(lerp(s0, s1, i / 24)));
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubular = 72;
    const radial = 14;
    const tube = new THREE.TubeGeometry(curve, tubular, radius, radial, false);
    const pos = tube.attributes.position;
    for (let i = 0; i <= tubular; i++) {
      const u = i / tubular;
      const s = lerp(s0, s1, u);
      const k = lerp(1, 0.5, s) * (1 + 0.12 * Math.sin(s * 40 - f * 0.9)); // thins as it falls, ripples along
      const c = curve.getPointAt(u);
      for (let j = 0; j <= radial; j++) {
        const idx = i * (radial + 1) + j;
        pos.setXYZ(idx, c.x + (pos.getX(idx) - c.x) * k, c.y + (pos.getY(idx) - c.y) * k, c.z + (pos.getZ(idx) - c.z) * k);
      }
    }
    tube.computeVertexNormals();
    return tube;
  }, [visible, ...from, ...to, s0, s1, radius, bend, f]);
  return visible ? <mesh geometry={geo} material={mat} /> : null;
};

// ---------------------------------------------------------------------------
// Impact: crown sheet with beaded points, flying droplets, then a Worthington jet.
// `t` is slow-motion seconds since impact; everything scales with `size` (the drop radius).
// ---------------------------------------------------------------------------

const crownGeometry = (radius: number, height: number, open: number) => {
  const pts = [
    new THREE.Vector2(radius * 0.7, -0.02),
    new THREE.Vector2(radius * 0.92, height * 0.35),
    new THREE.Vector2(radius * (1 + open * 0.35), height),
    new THREE.Vector2(radius * (1 + open * 0.35) - 0.004, height * 0.97),
    new THREE.Vector2(radius * 0.88, height * 0.3),
    new THREE.Vector2(radius * 0.62, -0.02),
  ];
  return new THREE.LatheGeometry(pts, 64);
};

const beadGeo = new THREE.SphereGeometry(1, 20, 14);

export const Splash: React.FC<{ center: V3; t: number; size: number; gold?: number; seed?: number }> = ({
  center,
  t,
  size,
  gold = 1,
  seed = 3,
}) => {
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide });
    return m;
  }, []);
  mat.color.copy(AMBER).lerp(GOLD, gold);
  mat.emissive.copy(AMBER).lerp(GOLD, gold);
  mat.emissiveIntensity = 0.25 + gold * 0.9;
  const beads = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 16 }, (_, i) => ({
      a: (i / 16) * Math.PI * 2 + (r() - 0.5) * 0.25,
      h: 0.8 + r() * 0.5,
      v: 0.8 + r() * 0.6,
      s: 0.65 + r() * 0.6,
      fly: r() > 0.45,
    }));
  }, [seed]);
  const crownLife = 0.55;
  const rise = clamp01(t / 0.16);
  const fall = clamp01((t - 0.2) / (crownLife - 0.2));
  const crownH = size * 2.6 * Math.sin(rise * Math.PI * 0.5) * (1 - fall * fall);
  const crownR = size * (1.1 + 1.6 * (1 - Math.pow(1 - clamp01(t / crownLife), 2)));
  const geo = useGeometry(
    () => crownGeometry(crownR, Math.max(0.001, crownH), clamp01(t / crownLife)),
    [crownR, crownH, t],
  );
  if (t < 0 || t > 1.6) return null;
  const jetT = t - 0.42;
  const jetH = jetT > 0 ? size * 4.2 * Math.sin(clamp01(jetT / 0.5) * Math.PI) : 0;
  const pinchT = clamp01((jetT - 0.28) / 0.1);
  const g = 2.2;
  return (
    <group position={center}>
      {crownH > size * 0.05 && <mesh geometry={geo} material={mat} />}
      {beads.map((b, i) => {
        const tipY = crownH * b.h;
        if (!b.fly && crownH < size * 0.2) return null;
        let x = Math.cos(b.a) * crownR * (1 + 0.12 * b.h);
        let z = Math.sin(b.a) * crownR * (1 + 0.12 * b.h);
        let y = tipY + size * 0.25;
        if (b.fly && t > 0.12) {
          const ft = t - 0.12;
          const out = size * 3.5 * b.v * ft;
          x = Math.cos(b.a) * (crownR + out);
          z = Math.sin(b.a) * (crownR + out);
          y = size * 2.8 * b.h + size * 9 * b.v * ft - 0.5 * g * ft * ft * size * 18;
          if (y < 0) return null;
        }
        return <mesh key={i} geometry={beadGeo} material={mat} position={[x, y, z]} scale={size * 0.22 * b.s} />;
      })}
      {jetH > size * 0.05 && (
        <mesh material={mat} position={[0, jetH * 0.5, 0]} scale={[size * 0.45 * (1 - pinchT * 0.4), jetH * 0.5, size * 0.45 * (1 - pinchT * 0.4)]} geometry={beadGeo} />
      )}
      {pinchT > 0 && jetT < 0.9 && (
        <mesh
          material={mat}
          geometry={beadGeo}
          scale={size * 0.42}
          position={[0, size * 4.2 * 0.95 + size * 2.5 * (jetT - 0.38) - 0.5 * g * Math.pow(Math.max(0, jetT - 0.38), 2) * size * 22, 0]}
        />
      )}
    </group>
  );
};
