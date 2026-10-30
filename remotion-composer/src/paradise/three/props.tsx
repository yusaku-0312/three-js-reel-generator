import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { lerp, rng, V3 } from "../core";
import { porcelain } from "../../golden2/three/models";
import { ContactShadow } from "../../golden2/three/models";
import { fresnelGlass } from "./glass";
import { FLOWER_COLOR, FlowerKind, loosePetal, petalMat } from "./flowers";
import { teaLeavesTexture } from "./textures";

// ---------------------------------------------------------------------------
// Drink-bar dispenser (no branding): white body, clear amber tank on top, a lever over the spout.
// Local units: base at y 0, the spout tip at SPOUT.
// ---------------------------------------------------------------------------

export const SPOUT: V3 = [0, 1.62, 0.62];

const bodyMat = new THREE.MeshPhysicalMaterial({ color: "#f6f4ef", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 });
const steelMat = new THREE.MeshPhysicalMaterial({ color: "#c9cdd2", metalness: 1, roughness: 0.25 });
const darkMat = new THREE.MeshPhysicalMaterial({ color: "#2d3a40", roughness: 0.5 });
const tankTea = new THREE.MeshPhysicalMaterial({
  color: "#c2561a",
  roughness: 0.1,
  transparent: true,
  opacity: 0.82,
  emissive: new THREE.Color("#ff8a2a"),
  emissiveIntensity: 0.35,
});

export const Dispenser: React.FC<{ pos: V3; lever: number; level: number }> = ({ pos, lever, level }) => {
  const tank = useMemo(() => fresnelGlass("#f2fdff", 1.1), []);
  const box = useMemo(() => new RoundedBoxGeometry(1.5, 1, 1.1, 4, 0.08), []);
  return (
    <>
      <ContactShadow pos={pos} radius={1.2} opacity={0.6} />
      <group position={pos}>
        {/* drip tray */}
        <mesh geometry={box} material={steelMat} position={[0, 0.06, 0.25]} scale={[0.9, 0.12, 1.1]} castShadow receiveShadow />
        {/* column behind the spout */}
        <mesh geometry={box} material={bodyMat} position={[0, 1.0, -0.2]} scale={[1, 2.0, 0.65]} castShadow receiveShadow />
        {/* head with the spout */}
        <mesh geometry={box} material={bodyMat} position={[0, 1.9, 0.18]} scale={[1, 0.55, 1]} castShadow receiveShadow />
        <mesh material={darkMat} position={[0, 2.0, 0.74]} scale={[1.1, 0.35, 0.02]}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        <mesh material={steelMat} position={[SPOUT[0], SPOUT[1] + 0.05, SPOUT[2]]}>
          <cylinderGeometry args={[0.05, 0.035, 0.12, 20]} />
        </mesh>
        {/* lever: hinged at the head, swings down when pressed */}
        <group position={[0, 1.72, 0.7]} rotation-x={lerp(0, 0.5, lever)}>
          <mesh material={steelMat} position={[0, -0.18, 0.04]} castShadow>
            <boxGeometry args={[0.32, 0.36, 0.035]} />
          </mesh>
        </group>
        {/* clear tank with tea on top */}
        <group position={[0, 2.2, 0.0]}>
          <mesh material={tankTea} position-y={0.03 + level * 0.36} scale={[1, level, 1]}>
            <cylinderGeometry args={[0.44, 0.44, 0.72, 48]} />
          </mesh>
          <mesh material={tank} position-y={0.4} renderOrder={4}>
            <cylinderGeometry args={[0.47, 0.47, 0.82, 48, 1, true]} />
          </mesh>
          <mesh material={bodyMat} position-y={0.84} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.08, 48]} />
          </mesh>
        </group>
      </group>
    </>
  );
};

// ---------------------------------------------------------------------------
// A shallow porcelain dish heaped with black tea; petals of the four flowers fall in and mix.
// ---------------------------------------------------------------------------

let dishGeo: THREE.LatheGeometry | null = null;
const dish = () => {
  if (dishGeo) return dishGeo;
  const pts = [
    [0.001, 0],
    [0.5, 0],
    [0.56, 0.03],
    [0.8, 0.16],
    [0.86, 0.2],
    [0.84, 0.21],
    [0.76, 0.17],
    [0.5, 0.06],
    [0.001, 0.05],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  dishGeo = new THREE.LatheGeometry(pts, 96);
  return dishGeo;
};

const leafHeapMat = () =>
  new THREE.MeshPhysicalMaterial({ map: teaLeavesTexture(), roughness: 0.75, bumpMap: teaLeavesTexture(), bumpScale: 2 });

export const FLOWER_KINDS: FlowerKind[] = ["cornflower", "marigold", "safflower", "rose"];

/** `mix` 0..1: petals falling (0 → 0.6) and settling into the heap (→ 1). Dish-local petal spots are seeded. */
export const LeafDish: React.FC<{ pos: V3; mix: number; f: number; scale?: number }> = ({ pos, mix, f, scale = 1 }) => {
  const mat = useMemo(porcelain, []);
  const heap = useMemo(leafHeapMat, []);
  const petals = useMemo(() => {
    const r = rng(19);
    return Array.from({ length: 44 }, (_, i) => ({
      kind: FLOWER_KINDS[i % 4],
      a: r() * Math.PI * 2,
      rad: Math.sqrt(r()) * 0.5,
      delay: r() * 0.45,
      spin: (r() - 0.5) * 8,
      rx: r() * 6.28,
      drift: (r() - 0.5) * 0.6,
    }));
  }, []);
  return (
    <>
      <ContactShadow pos={pos} radius={1.0 * scale} opacity={0.6} />
      <group position={pos} scale={scale}>
        <mesh geometry={dish()} material={mat} castShadow receiveShadow />
        <mesh material={heap} position-y={0.04} scale={[0.6, 0.17, 0.6]} receiveShadow castShadow>
          <sphereGeometry args={[1, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        {petals.map((p, i) => {
          const t = Math.min(1, Math.max(0, (mix - p.delay) / 0.55));
          if (t <= 0) return null;
          const fall = 1 - Math.pow(1 - t, 2);
          const hx = Math.cos(p.a) * p.rad;
          const hz = Math.sin(p.a) * p.rad;
          const heapY = 0.04 + 0.17 * Math.sqrt(Math.max(0, 1 - (p.rad / 0.6) ** 2)) + 0.006;
          const y = lerp(1.6, heapY, fall);
          const x = hx + p.drift * (1 - fall) + Math.sin(f / 9 + i) * 0.03 * (1 - fall);
          const rot = p.spin * (1 - fall);
          return (
            <mesh
              key={i}
              geometry={loosePetal(p.kind)}
              material={petalMat}
              position={[x, y, hz]}
              rotation={[lerp(p.rx, -Math.PI / 2 + 0.2, fall) + rot, rot * 0.5, p.a]}
              scale={1.1}
              castShadow
            />
          );
        })}
      </group>
    </>
  );
};

// ---------------------------------------------------------------------------
// Sugar cube: rounded, frosty white with a sparkle of crystals.
// ---------------------------------------------------------------------------

const cubeGeo = new RoundedBoxGeometry(1, 1, 1, 3, 0.1);
const sugarMat = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.75, sheen: 1, sheenColor: new THREE.Color("#ffffff") });

export const SugarCube: React.FC<{ pos: V3; size?: number; rot?: V3; opacity?: number }> = ({ pos, size = 0.16, rot = [0, 0, 0], opacity = 1 }) => {
  const mat = useMemo(() => sugarMat.clone(), []);
  mat.transparent = opacity < 0.999;
  mat.opacity = opacity;
  if (opacity <= 0.01) return null;
  return <mesh geometry={cubeGeo} material={mat} position={pos} rotation={rot} scale={size} castShadow />;
};

/** Petal colour list in the order the narration names the flowers. */
export const PETAL_HEX = FLOWER_KINDS.map((k) => FLOWER_COLOR[k]);
