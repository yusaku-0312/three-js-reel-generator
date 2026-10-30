import React, { useMemo } from "react";
import * as THREE from "three";
import { TeapotGeometry } from "three/examples/jsm/geometries/TeapotGeometry.js";
import { V3 } from "../core";
import { glowTexture, teaSurfaceTexture } from "./textures";

// ---------------------------------------------------------------------------
// Teapot: placed by its spout tip so pours and drops stay where the shot wants them.
// ---------------------------------------------------------------------------

let teapotGeo: THREE.BufferGeometry | null = null;
let spoutTip: THREE.Vector3 | null = null;

export const teapotGeometry = () => {
  if (!teapotGeo) teapotGeo = new TeapotGeometry(1, 14, true, true, true, true, true);
  return teapotGeo;
};

/** Centre of the spout opening in teapot-local units (the pot spans y -1..1). */
export const teapotSpoutTip = () => {
  if (spoutTip) return spoutTip;
  const p = teapotGeometry().attributes.position;
  let maxX = -Infinity;
  for (let i = 0; i < p.count; i++) maxX = Math.max(maxX, p.getX(i));
  const sum = new THREE.Vector3();
  let n = 0;
  for (let i = 0; i < p.count; i++) {
    if (p.getX(i) > maxX - 0.03) {
      sum.add(new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)));
      n++;
    }
  }
  spoutTip = sum.divideScalar(n);
  return spoutTip;
};

export type PotPose = { tip: V3; tilt: number; scale: number; yaw?: number };

const potMatrix = ({ tip, tilt, scale, yaw = 0 }: PotPose) => {
  const t = teapotSpoutTip();
  return new THREE.Matrix4()
    .makeTranslation(...tip)
    .multiply(new THREE.Matrix4().makeRotationY(yaw))
    .multiply(new THREE.Matrix4().makeRotationZ(-tilt))
    .multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
    .multiply(new THREE.Matrix4().makeTranslation(-t.x, -t.y, -t.z));
};

/** Pose that keeps the teapot body centre (local origin) at `center` while it tilts. */
export const poseAbout = (center: V3, tilt: number, scale: number, yaw = 0): PotPose => {
  const t = teapotSpoutTip();
  const v = new THREE.Vector3(t.x * scale, t.y * scale, t.z * scale)
    .applyMatrix4(new THREE.Matrix4().makeRotationZ(-tilt))
    .applyMatrix4(new THREE.Matrix4().makeRotationY(yaw));
  return { tip: [center[0] + v.x, center[1] + v.y, center[2] + v.z], tilt, scale, yaw };
};

/** World position of a teapot-local point for a pose. */
export const potToWorld = (pose: PotPose, local: V3): V3 => {
  const v = new THREE.Vector3(...local).applyMatrix4(potMatrix(pose));
  return [v.x, v.y, v.z];
};

const porcelain = () =>
  new THREE.MeshPhysicalMaterial({ color: "#fffaf2", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06 });

export const Teapot: React.FC<{
  pose: PotPose;
  material?: THREE.Material;
  renderOrder?: number;
  children?: React.ReactNode;
}> = ({ pose, material, renderOrder = 0, children }) => {
  const mat = useMemo(() => material ?? porcelain(), [material]);
  const t = teapotSpoutTip();
  return (
    <group position={pose.tip} rotation={[0, pose.yaw ?? 0, 0]}>
      <group rotation={[0, 0, -pose.tilt]} scale={pose.scale}>
        <group position={[-t.x, -t.y, -t.z]}>
          <mesh geometry={teapotGeometry()} material={mat} renderOrder={renderOrder} />
          {children}
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Teacup on a saucer. Units: cup 0.77 tall, rim radius 0.63; saucer radius 1.
// ---------------------------------------------------------------------------

const CUP_PROFILE: Array<[number, number]> = [
  [0, 0.045], [0.2, 0.045], [0.27, 0.035], [0.29, 0.0], [0.32, 0.0], [0.335, 0.04],
  [0.37, 0.12], [0.46, 0.27], [0.55, 0.46], [0.61, 0.64], [0.635, 0.75], [0.632, 0.768],
  [0.618, 0.771], [0.607, 0.755], [0.585, 0.65], [0.525, 0.46], [0.44, 0.28], [0.34, 0.15],
  [0.2, 0.105], [0, 0.1],
];
const CUP_INNER = CUP_PROFILE.slice(13).reverse(); // floor → rim
const SAUCER_PROFILE: Array<[number, number]> = [
  [0, 0], [0.45, 0], [0.5, 0.012], [0.8, 0.06], [0.98, 0.105], [1.0, 0.12], [0.985, 0.13],
  [0.8, 0.088], [0.5, 0.042], [0.36, 0.038], [0, 0.036],
];
const SAUCER_TOP = 0.036;
const CUP_FLOOR = 0.1;
const CUP_FULL = 0.69;

const lathe = (profile: Array<[number, number]>, samples: number) => {
  const curve = new THREE.SplineCurve(profile.map(([x, y]) => new THREE.Vector2(x, y)));
  return new THREE.LatheGeometry(curve.getPoints(samples), 72);
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

const gold = new THREE.MeshStandardMaterial({ color: "#e9b949", metalness: 1, roughness: 0.25 });

export const Cup: React.FC<{
  pose: CupPose;
  fill: number;
  /** 0 = normal tea, 1 = over-steeped near-black. */
  dark?: number;
  /** Golden emissive glow on the tea surface, 0..1. */
  glow?: number;
  children?: React.ReactNode;
}> = ({ pose, fill, dark = 0, glow = 0, children }) => {
  if (!cupGeo) cupGeo = lathe(CUP_PROFILE, 160);
  if (!saucerGeo) saucerGeo = lathe(SAUCER_PROFILE, 90);
  const mat = useMemo(() => porcelain(), []);
  const teaMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: teaSurfaceTexture(),
        roughness: 0.32,
        emissive: new THREE.Color("#ffc23a"),
        emissiveMap: teaSurfaceTexture(),
      }),
    [],
  );
  teaMat.color.setRGB(1 - dark * 0.72, 1 - dark * 0.78, 1 - dark * 0.8);
  teaMat.emissiveIntensity = glow * 0.8;
  const y = teaLocalY(fill);
  const r = cupInnerRadius(y) * 0.995;
  return (
    <group position={pose.pos} rotation={[0, pose.yaw ?? 0, 0]} scale={pose.scale ?? 1}>
      <mesh geometry={saucerGeo} material={mat} />
      <mesh position-y={0.124} rotation-x={Math.PI / 2} material={gold}>
        <torusGeometry args={[0.995, 0.008, 8, 96]} />
      </mesh>
      <group position-y={SAUCER_TOP}>
        <mesh geometry={cupGeo} material={mat} />
        <mesh position-y={0.769} rotation-x={Math.PI / 2} material={gold}>
          <torusGeometry args={[0.622, 0.011, 8, 96]} />
        </mesh>
        <mesh position={[0.66, 0.43, 0]} rotation-z={1.32 * Math.PI} material={mat}>
          <torusGeometry args={[0.165, 0.038, 16, 48, 1.36 * Math.PI]} />
        </mesh>
        {fill > 0.001 && (
          <mesh position-y={y} rotation-x={-Math.PI / 2} material={teaMat}>
            <circleGeometry args={[r, 64]} />
          </mesh>
        )}
        {fill > 0.001 && glow > 0.01 && (
          <mesh position-y={y + 0.003} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[r * 0.98, 64]} />
            <meshBasicMaterial
              map={glowTexture()}
              color="#ffe07a"
              transparent
              opacity={Math.min(1, glow)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}
        {children}
      </group>
    </group>
  );
};

export const goldMaterial = gold;
