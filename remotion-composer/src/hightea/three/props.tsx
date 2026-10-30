import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate } from "remotion";
import { rng, V3 } from "../core";
import { ContactShadow, goldTrim, porcelain } from "../../golden2/three/models";
import { Glow } from "../../paradise/three/fx";

// Scale: a teacup at scale 0.22 is real size, so 1 unit ≈ 0.7 m. Furniture and food follow that.

/** Pop-in scale for food and props: 0 before `at`, a small overshoot, then 1. */
export const pop = (f: number, at: number) =>
  interpolate(f, [at, at + 5, at + 9], [0, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const mat = (color: string, roughness = 0.6, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, ...extra });

// ---------------------------------------------------------------------------
// Furniture.
// ---------------------------------------------------------------------------

export type TableSpec = { pos: V3; w: number; d: number; h: number; yaw?: number };
export const HIGH_TABLE_H = 1.1;
export const LOW_TABLE_H = 0.6;

/** Walnut table: a top slab on four turned-looking legs. `glow` warms the top edge (when the narration names it). */
export const Table: React.FC<{ t: TableSpec; glow?: number }> = ({ t, glow = 0 }) => {
  const wood = useMemo(() => mat("#6b3f22", 0.45, { emissive: new THREE.Color("#ffb860") }), []);
  wood.emissiveIntensity = glow * 0.07;
  const legs: Array<[number, number]> = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  return (
    <group position={t.pos} rotation-y={t.yaw ?? 0}>
      <mesh material={wood} position-y={t.h - 0.035} castShadow receiveShadow>
        <boxGeometry args={[t.w, 0.07, t.d]} />
      </mesh>
      {legs.map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} material={wood} position={[sx * (t.w / 2 - 0.08), (t.h - 0.07) / 2, sz * (t.d / 2 - 0.08)]} castShadow>
          <cylinderGeometry args={[0.04, 0.03, t.h - 0.07, 12]} />
        </mesh>
      ))}
    </group>
  );
};

/** Top centre of a table, plus an offset on the top (x along the table, z across it). */
export const onTable = (t: TableSpec, dx = 0, dz = 0): V3 => [t.pos[0] + dx, t.pos[1] + t.h, t.pos[2] + dz];

/** Two-seat velvet sofa, back towards -z. */
export const Sofa: React.FC<{ pos: V3; yaw?: number; scale?: number }> = ({ pos, yaw = 0, scale = 1 }) => {
  const velvet = useMemo(() => mat("#7a2633", 0.85), []);
  const leg = useMemo(() => mat("#3a2414", 0.5), []);
  return (
    <group position={pos} rotation-y={yaw} scale={scale}>
      <mesh material={velvet} position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.22, 0.7]} />
      </mesh>
      <mesh material={velvet} position={[0, 0.8, -0.3]} castShadow>
        <boxGeometry args={[1.7, 0.6, 0.16]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={velvet} position={[s * 0.83, 0.62, 0]} castShadow>
          <boxGeometry args={[0.16, 0.3, 0.7]} />
        </mesh>
      ))}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={leg} position={[sx * 0.75, 0.15, sz * 0.28]}>
            <cylinderGeometry args={[0.03, 0.025, 0.3, 8]} />
          </mesh>
        )),
      )}
    </group>
  );
};

/** Plain kitchen chair facing +z (rotate with yaw). */
export const Chair: React.FC<{ pos: V3; yaw?: number }> = ({ pos, yaw = 0 }) => {
  const wood = useMemo(() => mat("#7a4a28", 0.55), []);
  return (
    <group position={pos} rotation-y={yaw}>
      <mesh material={wood} position-y={0.66} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.05, 0.5]} />
      </mesh>
      <mesh material={wood} position={[0, 1.08, -0.23]} castShadow>
        <boxGeometry args={[0.55, 0.8, 0.04]} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={wood} position={[sx * 0.23, 0.32, sz * 0.2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.64, 8]} />
          </mesh>
        )),
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Tableware and food.
// ---------------------------------------------------------------------------

/** Small white plate (radius r) with its contact shadow. */
export const Plate: React.FC<{ pos: V3; r?: number }> = ({ pos, r = 0.2 }) => {
  const m = useMemo(() => porcelain(), []);
  return (
    <>
      <ContactShadow pos={pos} radius={r * 1.2} opacity={0.6} />
      <mesh material={m} position={[pos[0], pos[1] + 0.012, pos[2]]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 0.8, 0.024, 40]} />
      </mesh>
    </>
  );
};
const PLATE_TOP = 0.024;

/** Meat pie on a plate: golden crust with a crimped rim and three steam slits. */
export const MeatPie: React.FC<{ pos: V3; s: number }> = ({ pos, s }) => {
  const crust = useMemo(() => mat("#c98a3e", 0.55), []);
  const dark = useMemo(() => mat("#5a2e12", 0.6), []);
  if (s <= 0.01) return null;
  return (
    <group position={pos} scale={s}>
      <Plate pos={[0, 0, 0]} r={0.22} />
      <group position-y={PLATE_TOP}>
        <mesh material={crust} position-y={0.04} castShadow>
          <cylinderGeometry args={[0.15, 0.16, 0.08, 32]} />
        </mesh>
        <mesh material={crust} position-y={0.08} scale={[0.15, 0.04, 0.15]} castShadow>
          <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={crust} position-y={0.08} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.15, 0.018, 8, 32]} />
        </mesh>
        {[-0.04, 0, 0.04].map((x) => (
          <mesh key={x} material={dark} position={[x, 0.122, 0]} scale={[0.008, 0.004, 0.04]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Two slices of cheese on toast. */
export const CheeseToast: React.FC<{ pos: V3; s: number }> = ({ pos, s }) => {
  const bread = useMemo(() => mat("#d9a35c", 0.75), []);
  const crustM = useMemo(() => mat("#9a5e2a", 0.7), []);
  const cheese = useMemo(() => mat("#f2c64a", 0.35, { emissive: new THREE.Color("#ffb020"), emissiveIntensity: 0.08 }), []);
  if (s <= 0.01) return null;
  return (
    <group position={pos} scale={s}>
      <Plate pos={[0, 0, 0]} r={0.22} />
      {[
        [-0.06, 0.25],
        [0.07, -0.35],
      ].map(([x, yaw], i) => (
        <group key={i} position={[x, PLATE_TOP + 0.02 + i * 0.012, i * 0.02]} rotation-y={yaw}>
          <mesh material={crustM} castShadow>
            <boxGeometry args={[0.16, 0.035, 0.13]} />
          </mesh>
          <mesh material={bread} position-y={0.019}>
            <boxGeometry args={[0.145, 0.004, 0.115]} />
          </mesh>
          <mesh material={cheese} position-y={0.024} scale={[0.07, 0.008, 0.055]}>
            <sphereGeometry args={[1, 16, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Round loaf on a board. */
export const Bread: React.FC<{ pos: V3; s: number }> = ({ pos, s }) => {
  const loaf = useMemo(() => mat("#b8742f", 0.7), []);
  const board = useMemo(() => mat("#a8763f", 0.6), []);
  if (s <= 0.01) return null;
  return (
    <group position={pos} scale={s}>
      <ContactShadow pos={[0, 0, 0]} radius={0.24} opacity={0.6} />
      <mesh material={board} position-y={0.015} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.03, 0.24]} />
      </mesh>
      <mesh material={loaf} position-y={0.09} scale={[0.15, 0.09, 0.1]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
    </group>
  );
};

/** Roast beef: overlapping pink slices with a browned rim, on a plate. */
export const RoastBeef: React.FC<{ pos: V3; s: number }> = ({ pos, s }) => {
  const pink = useMemo(() => mat("#c9606a", 0.45), []);
  const rim = useMemo(() => mat("#6a2e1c", 0.6), []);
  const greens = useMemo(() => mat("#5f9a3a", 0.6), []);
  if (s <= 0.01) return null;
  return (
    <group position={pos} scale={s}>
      <Plate pos={[0, 0, 0]} r={0.22} />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[-0.09 + i * 0.06, PLATE_TOP + 0.01 + i * 0.006, 0]} rotation={[-Math.PI / 2 + 0.25, 0, 0]}>
          <mesh material={pink} castShadow>
            <circleGeometry args={[0.07, 24]} />
          </mesh>
          <mesh material={rim}>
            <torusGeometry args={[0.07, 0.008, 6, 24]} />
          </mesh>
        </group>
      ))}
      <mesh material={greens} position={[0.06, PLATE_TOP + 0.02, 0.1]} scale={[0.05, 0.02, 0.04]}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
    </group>
  );
};

/** Champagne flute: clear glass, pale gold wine, bubbles rising (frame-driven). */
export const Flute: React.FC<{ pos: V3; s: number; f: number }> = ({ pos, s, f }) => {
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.05, transmission: 0.9, thickness: 0.02, transparent: true, opacity: 0.35 }),
    [],
  );
  const wine = useMemo(() => mat("#e8c46a", 0.2, { emissive: new THREE.Color("#c99a2e"), emissiveIntensity: 0.35, transparent: true, opacity: 0.9 }), []);
  const bubble = useMemo(() => mat("#fff6d8", 0.2, { emissive: new THREE.Color("#fff0c0"), emissiveIntensity: 0.6 }), []);
  const bubbles = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 8 }, () => ({ x: (r() - 0.5) * 0.03, z: (r() - 0.5) * 0.03, ph: r(), sp: 40 + r() * 30 }));
  }, []);
  if (s <= 0.01) return null;
  return (
    <group position={pos} scale={s}>
      <ContactShadow pos={[0, 0, 0]} radius={0.08} opacity={0.5} />
      <mesh material={glass} position-y={0.005}>
        <cylinderGeometry args={[0.05, 0.055, 0.01, 24]} />
      </mesh>
      <mesh material={glass} position-y={0.08}>
        <cylinderGeometry args={[0.006, 0.006, 0.15, 8]} />
      </mesh>
      <mesh material={glass} position-y={0.26}>
        <cylinderGeometry args={[0.045, 0.028, 0.22, 24, 1, true]} />
      </mesh>
      <mesh material={wine} position-y={0.23}>
        <cylinderGeometry args={[0.04, 0.026, 0.15, 24]} />
      </mesh>
      {bubbles.map((b, i) => {
        const t = ((f / b.sp + b.ph) % 1 + 1) % 1;
        return <mesh key={i} material={bubble} position={[b.x, 0.16 + t * 0.14, b.z]} scale={0.004}><sphereGeometry args={[1, 6, 4]} /></mesh>;
      })}
    </group>
  );
};

/** Three-tier stand: gold rod and handle, three white plates; sweets (pink/cream) or savoury (sandwiches, beef rolls). */
export const TieredStand: React.FC<{ pos: V3; s: number; savory?: boolean }> = ({ pos, s, savory = false }) => {
  const plate = useMemo(() => porcelain(), []);
  const items = useMemo(() => {
    const colors = savory ? ["#f3e6c8", "#c9606a", "#7ab04a", "#f3e6c8"] : ["#f4a6b8", "#fff3dc", "#c98a3e", "#e86a7a"];
    return colors.map((c) => mat(c, 0.5));
  }, [savory]);
  const tiers = [
    { y: 0.06, r: 0.2 },
    { y: 0.26, r: 0.16 },
    { y: 0.44, r: 0.12 },
  ];
  if (s <= 0.01) return null;
  return (
    <group position={pos} scale={s}>
      <ContactShadow pos={[0, 0, 0]} radius={0.24} opacity={0.6} />
      <mesh material={goldTrim} position-y={0.29}>
        <cylinderGeometry args={[0.008, 0.008, 0.58, 10]} />
      </mesh>
      <mesh material={goldTrim} position-y={0.6} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.035, 0.007, 8, 20]} />
      </mesh>
      {tiers.map((t, ti) => (
        <group key={ti} position-y={t.y}>
          <mesh material={plate} castShadow receiveShadow>
            <cylinderGeometry args={[t.r, t.r * 0.85, 0.015, 36]} />
          </mesh>
          {Array.from({ length: 5 - ti }, (_, i) => {
            const a = (i / (5 - ti)) * Math.PI * 2 + ti;
            const m = items[(i + ti) % items.length];
            return savory ? (
              <mesh key={i} material={m} position={[Math.cos(a) * t.r * 0.6, 0.025, Math.sin(a) * t.r * 0.6]} rotation-y={-a} castShadow>
                <cylinderGeometry args={[0.035, 0.035, 0.035, 3]} />
              </mesh>
            ) : (
              <mesh key={i} material={m} position={[Math.cos(a) * t.r * 0.6, 0.025, Math.sin(a) * t.r * 0.6]} castShadow>
                <cylinderGeometry args={[0.028, 0.03, 0.035, 18]} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

/** Short dinner candle with a flickering flame glow. */
export const Candle: React.FC<{ pos: V3; f: number; seed?: number }> = ({ pos, f, seed = 0 }) => {
  const wax = useMemo(() => mat("#f3ead6", 0.5, { emissive: new THREE.Color("#ffcf80"), emissiveIntensity: 0.12 }), []);
  const flicker = 0.85 + 0.15 * Math.sin(f * 0.6 + seed * 2.1) * Math.sin(f * 0.23 + seed);
  return (
    <>
      <mesh material={goldTrim} position={[pos[0], pos[1] + 0.01, pos[2]]}>
        <cylinderGeometry args={[0.05, 0.06, 0.02, 20]} />
      </mesh>
      <mesh material={wax} position={[pos[0], pos[1] + 0.1, pos[2]]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.18, 14]} />
      </mesh>
      <Glow pos={[pos[0], pos[1] + 0.21, pos[2]]} size={0.12} color="#ffd27a" intensity={1.6 * flicker} />
      <Glow pos={[pos[0], pos[1] + 0.21, pos[2]]} size={0.6} color="#ffb050" intensity={0.25 * flicker} />
    </>
  );
};

// ---------------------------------------------------------------------------
// Night window: a dark navy pane with city lights behind the room (DOF turns the lights into discs).
// ---------------------------------------------------------------------------

let cityTex: THREE.CanvasTexture | null = null;
const cityTexture = () => {
  if (cityTex) return cityTex;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 384;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, "#0b1430");
  g.addColorStop(1, "#1d2448");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const r = rng(77);
  for (let i = 0; i < 260; i++) {
    const x = r() * c.width;
    const y = c.height * (0.4 + r() * 0.6);
    const rad = 3 + r() * 7;
    const rgb = r() > 0.3 ? `255,${190 + Math.floor(r() * 50)},${110 + Math.floor(r() * 60)}` : "220,235,255";
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(${rgb},${0.5 + r() * 0.4})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  cityTex = new THREE.CanvasTexture(c);
  cityTex.colorSpace = THREE.SRGBColorSpace;
  return cityTex;
};

export const NightWindow: React.FC<{ k: number }> = ({ k }) => {
  const m = useMemo(() => new THREE.MeshBasicMaterial({ map: cityTexture(), transparent: true, toneMapped: false }), []);
  m.opacity = k;
  m.color.setScalar(1.6);
  if (k <= 0.01) return null;
  return (
    <mesh material={m} position={[0, 3.2, -10.3]}>
      <planeGeometry args={[22, 6]} />
    </mesh>
  );
};
