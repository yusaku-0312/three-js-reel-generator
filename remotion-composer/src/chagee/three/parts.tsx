import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp01, lerp, rng, V3 } from "../core";
import { ease, EASE } from "../../golden2/shot";
import { ContactShadow } from "../../golden2/three/models";
import { fresnelGlass } from "../../paradise/three/glass";
import { COBALT, inChina, MAP_PX, mapPx, mapTexture, passportTexture, porcelainCupTexture, ticketTexture } from "./textures";

// ---------------------------------------------------------------------------
// Takeaway cup in CHAGEE's blue-and-white: tapered paper wall with the porcelain band, white dome lid.
// Local: base at y 0, lid top at CUP_H + ~0.16.
// ---------------------------------------------------------------------------

export const CUP_H = 1.3;
const R_TOP = 0.46;
const R_BOT = 0.35;

export type CupPose = { pos: V3; scale?: number; yaw?: number };
export const cupTop = ({ pos, scale = 1 }: CupPose): V3 => [pos[0], pos[1] + (CUP_H + 0.16) * scale, pos[2]];

const lidMat = new THREE.MeshPhysicalMaterial({ color: "#fbfbf8", roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 });

export const ChageeCup: React.FC<{ pose: CupPose; glow?: number }> = ({ pose, glow = 0 }) => {
  const wall = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: porcelainCupTexture(),
        emissiveMap: porcelainCupTexture(),
        emissive: new THREE.Color("#ffffff"),
        roughness: 0.55,
        clearcoat: 0.35,
        clearcoatRoughness: 0.35,
      }),
    [],
  );
  wall.emissiveIntensity = 0.03 + glow * 0.25;
  const s = pose.scale ?? 1;
  return (
    <>
      <ContactShadow pos={pose.pos} radius={0.6 * s} opacity={0.8} />
      <group position={pose.pos} scale={s} rotation-y={pose.yaw ?? 0}>
        <mesh position-y={CUP_H / 2} material={wall} castShadow receiveShadow>
          <cylinderGeometry args={[R_TOP, R_BOT, CUP_H, 72, 1, true]} />
        </mesh>
        <mesh position-y={0.005} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[R_BOT, 48]} />
          <meshStandardMaterial color="#e9e7e0" />
        </mesh>
        <mesh position-y={CUP_H + 0.02} material={lidMat} castShadow>
          <cylinderGeometry args={[R_TOP + 0.03, R_TOP + 0.02, 0.06, 72]} />
        </mesh>
        <mesh position-y={CUP_H + 0.05} material={lidMat} scale={[R_TOP * 0.96, 0.14, R_TOP * 0.96]} castShadow>
          <sphereGeometry args={[1, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, CUP_H + 0.19, R_TOP * 0.45]} material={lidMat}>
          <cylinderGeometry args={[0.07, 0.08, 0.05, 24]} />
        </mesh>
      </group>
    </>
  );
};

// ---------------------------------------------------------------------------
// Clear plastic cup with a single-colour liquid column (jasmine tea → milk tea) and a top disc.
// ---------------------------------------------------------------------------

const CLEAR_H = 1.35;
const CLEAR_TOP = 0.46;
const CLEAR_BOT = 0.34;
const clearRadius = (y: number) => lerp(CLEAR_BOT, CLEAR_TOP, clamp01(y / CLEAR_H));

export const clearSurface = ({ pos, scale = 1 }: CupPose, level: number): V3 => [pos[0], pos[1] + (0.04 + level * (CLEAR_H - 0.12)) * scale, pos[2]];

export const ClearCup: React.FC<{ pose: CupPose; level: number; color: string; glow?: number }> = ({ pose, level, color, glow = 0.2 }) => {
  const shell = useMemo(() => fresnelGlass("#f2fbff", 0.9), []);
  const liquid = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.25, clearcoat: 0.6, transparent: true, opacity: 0.94 }), []);
  liquid.color.set(color);
  liquid.emissive.set(color);
  liquid.emissiveIntensity = glow;
  const s = pose.scale ?? 1;
  const h = 0.04 + level * (CLEAR_H - 0.12);
  return (
    <>
      <ContactShadow pos={pose.pos} radius={0.55 * s} opacity={0.7} />
      <group position={pose.pos} scale={s} rotation-y={pose.yaw ?? 0}>
        {level > 0.01 && (
          <>
            <mesh position-y={h / 2 + 0.01} material={liquid} renderOrder={1}>
              <cylinderGeometry args={[clearRadius(h) * 0.97, CLEAR_BOT * 0.97, h, 64]} />
            </mesh>
          </>
        )}
        <mesh position-y={CLEAR_H / 2} material={shell} renderOrder={4}>
          <cylinderGeometry args={[CLEAR_TOP, CLEAR_BOT, CLEAR_H, 72, 1, true]} />
        </mesh>
        <mesh position-y={CLEAR_H} renderOrder={4}>
          <torusGeometry args={[CLEAR_TOP, 0.012, 8, 72]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
        <mesh position-y={CLEAR_H * 0.45} castShadow>
          <cylinderGeometry args={[CLEAR_BOT * 0.9, CLEAR_BOT * 0.9, CLEAR_H * 0.9, 24]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
};

// ---------------------------------------------------------------------------
// Jasmine sprig: a few white five-petal flowers with yellow hearts on dark leaves, lying on the counter.
// ---------------------------------------------------------------------------

const petalMat = new THREE.MeshPhysicalMaterial({ color: "#fffdf6", roughness: 0.6, sheen: 0.8, emissive: new THREE.Color("#fffaf0"), emissiveIntensity: 0.12 });
const heartMat = new THREE.MeshStandardMaterial({ color: "#f2cf55", roughness: 0.6 });
const leafMat = new THREE.MeshStandardMaterial({ color: "#3e6b2e", roughness: 0.55 });

const Jasmine: React.FC<{ pos: V3; s: number; open: number; rot: number }> = ({ pos, s, open, rot }) => (
  <group position={pos} scale={s} rotation={[0, rot, 0]}>
    {Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2;
      return (
        <mesh key={i} material={petalMat} position={[Math.cos(a) * 0.1, 0.02, Math.sin(a) * 0.1]} rotation={[0, -a, lerp(0.9, 0.12, open)]} scale={[0.12, 0.02, 0.07]}>
          <sphereGeometry args={[1, 16, 8]} />
        </mesh>
      );
    })}
    <mesh material={heartMat} position-y={0.04} scale={0.03}>
      <sphereGeometry args={[1, 10, 8]} />
    </mesh>
  </group>
);

export const JasmineSprig: React.FC<{ pos: V3; f: number; open: number; yaw?: number }> = ({ pos, f, open, yaw = 0 }) => {
  const parts = useMemo(() => {
    const r = rng(5);
    return {
      flowers: Array.from({ length: 5 }, (_, i) => ({ p: [(r() - 0.5) * 0.5, 0.05, (r() - 0.5) * 0.35] as V3, s: 0.8 + r() * 0.4, rot: r() * 6, d: i * 0.12 })),
      leaves: Array.from({ length: 4 }, () => ({ p: [(r() - 0.5) * 0.6, 0.015, (r() - 0.5) * 0.4] as V3, a: r() * 6 })),
    };
  }, []);
  return (
    <group position={pos} rotation-y={yaw}>
      {parts.leaves.map((l, i) => (
        <mesh key={i} material={leafMat} position={l.p} rotation={[0, l.a, 0]} scale={[0.2, 0.012, 0.08]} castShadow>
          <sphereGeometry args={[1, 16, 8]} />
        </mesh>
      ))}
      {parts.flowers.map((fl, i) => (
        <Jasmine key={i} pos={[fl.p[0], fl.p[1] + Math.sin(f / 30 + i) * 0.005, fl.p[2]]} s={fl.s} rot={fl.rot} open={clamp01((open - fl.d) / 0.5)} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Paper map lying on the counter; mapPoint turns lon/lat into a world point on it.
// ---------------------------------------------------------------------------

export const SHEET_W = 11.7;
export const SHEET_H = (SHEET_W * MAP_PX.h) / MAP_PX.w;
const SHEET_Y = 0.004;

export const mapPoint = (lon: number, lat: number, y = SHEET_Y): V3 => {
  const [px, py] = mapPx(lon, lat);
  return [(px / MAP_PX.w - 0.5) * SHEET_W, y, (py / MAP_PX.h - 0.5) * SHEET_H];
};

export const MapSheet: React.FC = () => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.85 }), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={SHEET_Y} material={mat} receiveShadow>
      <planeGeometry args={[SHEET_W, SHEET_H]} />
    </mesh>
  );
};

/** Places, lon east-positive (Los Angeles as 241.8 so it sits right of the date line). */
export const PLACE: Record<string, [number, number]> = {
  kunming: [102.7, 25.0],
  seoul: [126.98, 37.57],
  japan: [137.6, 36.4],
  la: [241.76, 34.05],
};

/** Overseas stores at the end of 2025: Malaysia (most), Singapore, Thailand, Indonesia, Philippines, Vietnam. */
export const SEA_PINS: Array<[number, number]> = [
  [101.7, 3.1], [100.33, 5.41], [103.76, 1.49], [110.35, 1.55], [116.07, 5.98], [101.1, 4.6],
  [103.82, 1.35], [100.5, 13.75], [98.98, 18.79], [106.85, -6.21], [112.75, -7.25], [121.0, 14.6], [106.7, 10.8], [105.84, 21.03],
];

/** Mainland stores: seeded points inside China, denser towards the east coast. */
export const CHINA_PINS: Array<[number, number]> = (() => {
  const r = rng(23);
  const out: Array<[number, number]> = [];
  for (let i = 0; i < 4000 && out.length < 72; i++) {
    const lon = 97 + r() * 25;
    const lat = 21 + r() * 20;
    const east = clamp01((lon - 97) / 22);
    if (r() < 0.25 + east * 0.75 && inChina(lon, lat)) out.push([lon, lat]);
  }
  return out;
})();

const pinHead = (color: string) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, clearcoat: 1, emissive: new THREE.Color(color), emissiveIntensity: 0.25 });
const needleMat = new THREE.MeshStandardMaterial({ color: "#d7dbe2", metalness: 0.4, roughness: 0.3 });
const headGeo = new THREE.SphereGeometry(1, 20, 14);
const needleGeo = new THREE.CylinderGeometry(0.006, 0.002, 1, 8);

/** Map pin that drops in at `at` (frames on the same clock as f) and settles with a small bounce. */
export const Pin: React.FC<{ at: V3; f: number; dropAt: number; size?: number; color?: string }> = ({ at, f, dropAt, size = 1, color = COBALT }) => {
  const mat = useMemo(() => pinHead(color), [color]);
  const t = f - dropAt;
  if (t < 0) return null;
  const fall = ease(t, 0, 8, EASE.in);
  const bounce = t > 8 ? Math.sin(clamp01((t - 8) / 8) * Math.PI) * 0.05 * (1 - clamp01((t - 8) / 8)) : 0;
  const lift = (1 - fall) * 0.9 + bounce;
  const h = 0.2 * size;
  return (
    <group position={[at[0], at[1] + lift, at[2]]}>
      <mesh geometry={needleGeo} material={needleMat} position-y={h / 2} scale={[size, h, size]} />
      <mesh geometry={headGeo} material={mat} position-y={h} scale={0.05 * size} castShadow />
    </group>
  );
};

/** Grey dashed ring on the map where a store would be (Japan): segments around a circle, gently pulsing. */
export const DashedRing: React.FC<{ center: V3; radius: number; k: number; f: number }> = ({ center, radius, k, f }) => {
  if (k <= 0) return null;
  const n = 28;
  const pulse = 1 + Math.sin(f / 9) * 0.04;
  return (
    <group position={[center[0], center[1] + 0.01, center[2]]} scale={pulse * lerp(0.6, 1, k)}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]} rotation-y={-a}>
            <boxGeometry args={[0.012, 0.012, ((Math.PI * 2 * radius) / n) * 0.55]} />
            <meshStandardMaterial color="#6f6a66" transparent opacity={k} />
          </mesh>
        );
      })}
    </group>
  );
};

/** A queue of small capsule people walking into line one by one from `start` along `dir`. */
export const Queue: React.FC<{ start: V3; dir: V3; f: number; at: number; count?: number; scale?: number }> = ({
  start,
  dir,
  f,
  at,
  count = 9,
  scale = 1,
}) => {
  const people = useMemo(() => {
    const r = rng(77);
    const colors = ["#d9534f", "#f0ad4e", "#5bc0de", "#5cb85c", "#7a5cc0", "#e8e2d4", "#2f3b52", "#e07aa0", "#8a6a4a"];
    return Array.from({ length: count }, (_, i) => ({ c: colors[i % colors.length], h: 0.9 + r() * 0.2, d: i * 3 }));
  }, [count]);
  return (
    <>
      {people.map((p, i) => {
        const k = ease(f, at + p.d, 10, EASE.out);
        if (k <= 0) return null;
        const step = 0.085 * scale * (i + 1);
        const sway = Math.sin(f / 7 + i) * 0.004 * scale;
        const pos: V3 = [start[0] + dir[0] * step + sway, start[1], start[2] + dir[2] * step];
        return (
          <group key={i} position={pos} scale={scale * p.h * k}>
            <mesh position-y={0.045} castShadow>
              <capsuleGeometry args={[0.02, 0.05, 4, 10]} />
              <meshStandardMaterial color={p.c} roughness={0.6} />
            </mesh>
            <mesh position-y={0.105} castShadow>
              <sphereGeometry args={[0.019, 14, 10]} />
              <meshStandardMaterial color="#f1d3b5" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

/** Thin additive beam rising from a map point (the U.S. listing). */
export const LightColumn: React.FC<{ base: V3; k: number; color?: string; height?: number }> = ({ base, k, color = "#9fc4ff", height = 1.4 }) =>
  k <= 0 ? null : (
    <mesh position={[base[0], base[1] + (height * k) / 2, base[2]]} renderOrder={6}>
      <cylinderGeometry args={[0.035, 0.07, height * k, 16, 1, true]} />
      <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(0.7)} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
    </mesh>
  );

// ---------------------------------------------------------------------------
// Travel props for the closing shot: a passport and a boarding pass lying on the counter.
// ---------------------------------------------------------------------------

export const Passport: React.FC<{ pos: V3; yaw?: number }> = ({ pos, yaw = 0 }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: passportTexture(), roughness: 0.7 }), []);
  return (
    <group position={pos} rotation-y={yaw}>
      <mesh position-y={0.03} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.06, 0.88]} />
        <meshStandardMaterial color="#1d2b52" roughness={0.7} />
      </mesh>
      <mesh position-y={0.061} rotation-x={-Math.PI / 2} material={mat}>
        <planeGeometry args={[0.6, 0.86]} />
      </mesh>
    </group>
  );
};

export const Ticket: React.FC<{ pos: V3; yaw?: number }> = ({ pos, yaw = 0 }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: ticketTexture(), roughness: 0.8 }), []);
  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, yaw]} material={mat} receiveShadow>
      <planeGeometry args={[1.0, 0.41]} />
    </mesh>
  );
};
