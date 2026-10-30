import React, { useMemo } from "react";
import * as THREE from "three";
import { ContactShadow } from "../../golden2/three/models";
import { V3 } from "../core";

// Japanese tea set: a red-clay (朱泥) kyusu with a side handle, a yunomi, and green tea.
// Kyusu units: body radius ~0.5, spout pointing +x, handle +z; placed by its spout tip like the Teapot.

export const GREEN_TEA = "#9fae2e";

const lathe = (pts: Array<[number, number]>, segs = 64) =>
  new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segs);

const BODY: Array<[number, number]> = [
  [0, 0], [0.3, 0], [0.42, 0.05], [0.5, 0.16], [0.52, 0.27], [0.49, 0.38], [0.42, 0.47], [0.33, 0.52], [0.31, 0.53],
];
const LID: Array<[number, number]> = [[0, 0.64], [0.1, 0.635], [0.22, 0.6], [0.31, 0.545], [0.33, 0.53], [0.3, 0.525], [0, 0.56]];

const SPOUT_BASE = new THREE.Vector3(0.44, 0.2, 0);
const SPOUT_DIR = new THREE.Vector3(Math.cos(0.72), Math.sin(0.72), 0);
const SPOUT_LEN = 0.46;
/** Spout opening, kyusu-local. */
export const KYUSU_TIP = SPOUT_BASE.clone().addScaledVector(SPOUT_DIR, SPOUT_LEN);

const HANDLE_BASE = new THREE.Vector3(0, 0.28, 0.46);
const HANDLE_DIR = new THREE.Vector3(0.12, 0.26, 1).normalize();
const HANDLE_LEN = 0.55;

const clay = () =>
  new THREE.MeshPhysicalMaterial({ color: "#a2482a", roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.35, sheen: 0.2, sheenColor: new THREE.Color("#ffb08a") });

/** Tapered tube from `base` along `dir`, open at the end. */
const Spout: React.FC<{ base: THREE.Vector3; dir: THREE.Vector3; len: number; r0: number; r1: number; mat: THREE.Material; open?: boolean }> = ({
  base,
  dir,
  len,
  r0,
  r1,
  mat,
  open = false,
}) => {
  const mid = base.clone().addScaledVector(dir, len / 2);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return (
    <mesh position={mid} quaternion={quat} material={mat} castShadow>
      <cylinderGeometry args={[r1, r0, len, 32, 1, open]} />
    </mesh>
  );
};

export type KyusuPose = { tip: V3; tilt: number; scale: number; yaw?: number };

export const Kyusu: React.FC<{ pose: KyusuPose }> = ({ pose }) => {
  const mat = useMemo(clay, []);
  const inner = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a0f06", roughness: 0.9, side: THREE.BackSide }), []);
  const body = useMemo(() => lathe(BODY), []);
  const lid = useMemo(() => lathe(LID), []);
  const t = KYUSU_TIP;
  return (
    <group position={pose.tip} rotation={[0, pose.yaw ?? 0, 0]}>
      <group rotation={[0, 0, -pose.tilt]} scale={pose.scale}>
        <group position={[-t.x, -t.y, -t.z]}>
          <mesh geometry={body} material={mat} castShadow receiveShadow />
          <mesh geometry={lid} material={mat} castShadow />
          <mesh position={[0, 0.665, 0]} material={mat} castShadow>
            <sphereGeometry args={[0.055, 24, 16]} />
          </mesh>
          <Spout base={SPOUT_BASE} dir={SPOUT_DIR} len={SPOUT_LEN} r0={0.085} r1={0.04} mat={mat} />
          <mesh position={KYUSU_TIP.clone().addScaledVector(SPOUT_DIR, -0.005)} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), SPOUT_DIR)} material={inner}>
            <circleGeometry args={[0.032, 20]} />
          </mesh>
          <Spout base={HANDLE_BASE} dir={HANDLE_DIR} len={HANDLE_LEN} r0={0.06} r1={0.05} mat={mat} />
          <mesh position={HANDLE_BASE.clone().addScaledVector(HANDLE_DIR, HANDLE_LEN)} material={mat}>
            <sphereGeometry args={[0.05, 16, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/** Kyusu-local point to world for a pose (for drops at the spout). */
export const kyusuToWorld = (pose: KyusuPose, local: V3): V3 => {
  const t = KYUSU_TIP;
  const v = new THREE.Vector3(...local)
    .sub(t)
    .multiplyScalar(pose.scale)
    .applyAxisAngle(new THREE.Vector3(0, 0, 1), -pose.tilt)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), pose.yaw ?? 0)
    .add(new THREE.Vector3(...pose.tip));
  return [v.x, v.y, v.z];
};

// ---------------------------------------------------------------------------
// Yunomi: straight-sided cup, cream glaze with a brown rim, green tea surface.
// ---------------------------------------------------------------------------

const YUNOMI_OUT: Array<[number, number]> = [[0, 0.03], [0.2, 0.03], [0.21, 0], [0.26, 0], [0.27, 0.04], [0.3, 0.12], [0.33, 0.45], [0.35, 0.7], [0.345, 0.715]];
const YUNOMI_IN: Array<[number, number]> = [[0.32, 0.712], [0.305, 0.45], [0.275, 0.14], [0.2, 0.1], [0, 0.1]];
const FLOOR = 0.1;
const TOP = 0.69;

export type YunomiPose = { pos: V3; scale?: number };

const innerRadius = (y: number) => {
  const pts = [...YUNOMI_IN].reverse();
  for (let i = 1; i < pts.length; i++) {
    const [r0, y0] = pts[i - 1];
    const [r1, y1] = pts[i];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0 || 1);
  }
  return pts[pts.length - 1][0];
};

export const yunomiSurface = ({ pos, scale = 1 }: YunomiPose, fill: number): V3 => [pos[0], pos[1] + (FLOOR + fill * (TOP - FLOOR)) * scale, pos[2]];

export const Yunomi: React.FC<{ pose: YunomiPose; fill: number; glow?: number; ripple?: number }> = ({ pose, fill, glow = 0, ripple = 0 }) => {
  const glaze = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#e6dcc2", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }), []);
  const rim = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5a3018", roughness: 0.35, clearcoat: 0.6 }), []);
  const tea = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: GREEN_TEA, roughness: 0.08, clearcoat: 1, emissive: new THREE.Color("#ffd04a"), emissiveIntensity: 0 }),
    [],
  );
  tea.emissiveIntensity = 0.06 + glow * 0.5;
  const outer = useMemo(() => lathe([...YUNOMI_OUT, ...YUNOMI_IN], 96), []);
  const s = pose.scale ?? 1;
  const y = FLOOR + fill * (TOP - FLOOR);
  const r = innerRadius(y) * 0.99;
  return (
    <>
      <ContactShadow pos={pose.pos} radius={0.5 * s} />
      <group position={pose.pos} scale={s}>
        <mesh geometry={outer} material={glaze} castShadow receiveShadow />
        <mesh position-y={0.708} rotation-x={Math.PI / 2} material={rim}>
          <torusGeometry args={[0.335, 0.014, 10, 96]} />
        </mesh>
        {fill > 0.001 && (
          <mesh position-y={y} rotation-x={-Math.PI / 2} material={tea} receiveShadow>
            <circleGeometry args={[r, 64]} />
          </mesh>
        )}
        {fill > 0.001 && ripple > 0 && (
          <mesh position-y={y + 0.002} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[r * ripple * 0.85, r * ripple * 0.85 + 0.02, 64]} />
            <meshBasicMaterial color="#fff2b0" transparent opacity={0.6 * (1 - ripple)} />
          </mesh>
        )}
      </group>
    </>
  );
};

/** Low wooden tray under the Japanese set. */
export const Tray: React.FC<{ pos: V3; w: number; d: number }> = ({ pos, w, d }) => (
  <group position={pos}>
    <mesh position-y={0.02} receiveShadow castShadow>
      <boxGeometry args={[w, 0.04, d]} />
      <meshStandardMaterial color="#6e4524" roughness={0.6} />
    </mesh>
    {[-1, 1].map((sx) => (
      <mesh key={`x${sx}`} position={[(sx * w) / 2, 0.06, 0]} castShadow>
        <boxGeometry args={[0.05, 0.08, d]} />
        <meshStandardMaterial color="#5a371c" roughness={0.6} />
      </mesh>
    ))}
    {[-1, 1].map((sz) => (
      <mesh key={`z${sz}`} position={[0, 0.06, (sz * d) / 2]} castShadow>
        <boxGeometry args={[w, 0.08, 0.05]} />
        <meshStandardMaterial color="#5a371c" roughness={0.6} />
      </mesh>
    ))}
  </group>
);
