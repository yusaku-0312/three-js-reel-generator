import React, { useMemo } from "react";
import * as THREE from "three";
import { rng, V3 } from "../core";
import { ContactShadow, porcelain } from "../../golden2/three/models";
import { puerhTexture, sealTexture, tinLabelTexture, wrapperTexture } from "./textures";

// ---------------------------------------------------------------------------
// Dry black-tea leaves: twisted dark pellets piled in a mound (on a small white dish, or loose on the counter).
// ---------------------------------------------------------------------------

const pelletGeo = new THREE.CapsuleGeometry(1, 2.2, 3, 8);

export const LeafHeap: React.FC<{ pos: V3; radius: number; height: number; count?: number; seed?: number; dish?: boolean }> = ({
  pos,
  radius,
  height,
  count = 160,
  seed = 5,
  dish = true,
}) => {
  const mats = useMemo(
    () => ["#1c120c", "#2a1a10", "#3a2214", "#140d09"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.62 })),
    [],
  );
  const dishMat = useMemo(() => porcelain(), []);
  const pellets = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => {
      const d = Math.sqrt(r());
      const a = r() * Math.PI * 2;
      return {
        p: [Math.cos(a) * d * radius, height * (1 - d * d) * (0.55 + r() * 0.45), Math.sin(a) * d * radius] as V3,
        rot: [r() * 3.14, r() * 3.14, r() * 3.14] as V3,
        s: 0.018 + r() * 0.014,
        m: Math.floor(r() * 4),
      };
    });
  }, [count, seed, radius, height]);
  const base = dish ? 0.06 : 0.01;
  return (
    <>
      {dish && (
        <>
          <ContactShadow pos={pos} radius={radius * 1.6} />
          <mesh position={[pos[0], pos[1] + 0.03, pos[2]]} material={dishMat} castShadow receiveShadow>
            <cylinderGeometry args={[radius * 1.35, radius * 1.15, 0.06, 64]} />
          </mesh>
        </>
      )}
      <group position={[pos[0], pos[1] + base, pos[2]]}>
        {pellets.map((q, i) => (
          <mesh key={i} geometry={pelletGeo} material={mats[q.m]} position={q.p} rotation={q.rot} scale={[q.s, q.s * 1.1, q.s * 0.8]} castShadow />
        ))}
      </group>
    </>
  );
};

// ---------------------------------------------------------------------------
// Tea tin: dark lacquered can with a BLACK TEA paper band, lid off and leaning on its side.
// ---------------------------------------------------------------------------

export const TeaTin: React.FC<{ pos: V3; scale?: number; yaw?: number }> = ({ pos, scale = 1, yaw = 0 }) => {
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1e2a3a", metalness: 0.6, roughness: 0.3, clearcoat: 0.8 }), []);
  const label = useMemo(() => new THREE.MeshStandardMaterial({ map: tinLabelTexture(), roughness: 0.7 }), []);
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#c9952e", metalness: 1, roughness: 0.25 }), []);
  const leaves = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a110b", roughness: 0.8 }), []);
  const R = 0.5;
  const Hh = 1.25;
  return (
    <>
      <ContactShadow pos={pos} radius={0.8 * scale} />
      <group position={pos} rotation-y={yaw} scale={scale}>
        <mesh position-y={Hh / 2} material={body} castShadow receiveShadow>
          <cylinderGeometry args={[R, R, Hh, 64, 1, true]} />
        </mesh>
        <mesh position-y={Hh * 0.5} material={label}>
          <cylinderGeometry args={[R + 0.004, R + 0.004, Hh * 0.42, 64, 1, true]} />
        </mesh>
        {[0.27, 0.73].map((k) => (
          <mesh key={k} position-y={Hh * k} rotation-x={Math.PI / 2} material={gold}>
            <torusGeometry args={[R + 0.006, 0.012, 8, 64]} />
          </mesh>
        ))}
        <mesh position-y={Hh - 0.04} rotation-x={-Math.PI / 2} material={leaves}>
          <circleGeometry args={[R - 0.01, 48]} />
        </mesh>
        <mesh position-y={Hh} rotation-x={Math.PI / 2} material={gold}>
          <torusGeometry args={[R - 0.005, 0.018, 8, 64]} />
        </mesh>
        {/* lid lying on the counter behind-right of the tin */}
        <group position={[0.75, 0.09, -0.35]} rotation={[0.08, 0.4, 0]}>
          <mesh material={body} castShadow receiveShadow>
            <cylinderGeometry args={[R + 0.03, R + 0.03, 0.18, 64]} />
          </mesh>
          <mesh position-y={0.091} rotation-x={Math.PI / 2} material={gold}>
            <torusGeometry args={[R - 0.05, 0.015, 8, 64]} />
          </mesh>
        </group>
      </group>
    </>
  );
};

// ---------------------------------------------------------------------------
// Pu-erh cake: a pressed disc of dark leaves with a dimple, on its opened cotton wrapper with a red seal.
// ---------------------------------------------------------------------------

let cakeGeo: THREE.LatheGeometry | null = null;

export const PuerhCake: React.FC<{ pos: V3; scale?: number; yaw?: number }> = ({ pos, scale = 1, yaw = 0 }) => {
  if (!cakeGeo)
    cakeGeo = new THREE.LatheGeometry(
      ([
        [0, 0.02], [0.85, 0.0], [0.95, 0.05], [0.98, 0.12], [0.94, 0.19], [0.8, 0.23], [0.4, 0.25], [0.12, 0.22], [0.0, 0.2],
      ] as Array<[number, number]>).map(([x, y]) => new THREE.Vector2(x, y)),
      96,
    );
  const cake = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map: puerhTexture(), roughness: 0.85, bumpMap: puerhTexture(), bumpScale: 2 });
    return m;
  }, []);
  const top = useMemo(() => new THREE.MeshStandardMaterial({ map: puerhTexture(), roughness: 0.85, bumpMap: puerhTexture(), bumpScale: 3 }), []);
  const paper = useMemo(() => new THREE.MeshStandardMaterial({ map: wrapperTexture(), roughness: 0.9, side: THREE.DoubleSide }), []);
  const seal = useMemo(() => new THREE.MeshStandardMaterial({ map: sealTexture(), roughness: 0.9, transparent: true }), []);
  const wrapGeo = useMemo(() => {
    const g = new THREE.CircleGeometry(1.75, 96, 0, Math.PI * 2);
    const p = g.attributes.position;
    const r = rng(9);
    const bumps = Array.from({ length: 12 }, () => [r() * Math.PI * 2, 0.02 + r() * 0.05] as const);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const d = Math.hypot(x, y);
      const a = Math.atan2(y, x);
      const lift = Math.max(0, d - 1.1) * 0.18 + bumps.reduce((s, [ba, h]) => s + h * Math.max(0, Math.cos((a - ba) * 6)) * Math.max(0, d - 0.9), 0);
      p.setZ(i, lift);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group position={pos} rotation-y={yaw} scale={scale}>
      <ContactShadow pos={[0, 0, 0]} radius={1.9} opacity={0.6} />
      <mesh geometry={wrapGeo} material={paper} rotation-x={-Math.PI / 2} position-y={0.005} receiveShadow />
      <mesh position={[-0.95, 0.05, 1.05]} rotation={[-Math.PI / 2 + 0.06, 0, 0.35]} material={seal}>
        <planeGeometry args={[0.42, 0.42]} />
      </mesh>
      <mesh geometry={cakeGeo} material={cake} position-y={0.012} castShadow receiveShadow />
      <mesh position-y={0.258} rotation-x={-Math.PI / 2} material={top} scale={[0.86, 0.86, 1]}>
        <circleGeometry args={[1, 64]} />
      </mesh>
    </group>
  );
};
