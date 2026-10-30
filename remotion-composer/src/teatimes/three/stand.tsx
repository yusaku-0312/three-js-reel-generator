import React, { useMemo } from "react";
import * as THREE from "three";
import { add3, V3 } from "../core";
import { ContactShadow, goldTrim, porcelain } from "../../golden2/three/models";
import { Glow } from "../../paradise/three/fx";

// Afternoon-tea stand whose three tiers hold what the narration names: sandwiches (bottom), scones
// (middle), cakes (top). Each tier pops in on its own and can glow to show the eating order.

const mat = (color: string, roughness = 0.6, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, ...extra });

export const TIERS = [
  { y: 0.06, r: 0.2 },
  { y: 0.26, r: 0.16 },
  { y: 0.44, r: 0.12 },
];

/** World position just above tier `i` of a stand at `pos` with scale `s`. */
export const tierAt = (pos: V3, s: number, i: number): V3 => add3(pos, [0, (TIERS[i].y + 0.05) * s, 0]);

const Sandwich: React.FC<{ a: number; r: number; m: Record<string, THREE.Material> }> = ({ a, r, m }) => (
  <group position={[Math.cos(a) * r, 0.03, Math.sin(a) * r]} rotation-y={-a + Math.PI / 6}>
    <mesh material={m.bread} position-y={-0.012} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 0.012, 3]} />
    </mesh>
    <mesh material={m.cucumber} position-y={0}>
      <cylinderGeometry args={[0.047, 0.047, 0.01, 3]} />
    </mesh>
    <mesh material={m.bread} position-y={0.012} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 0.012, 3]} />
    </mesh>
  </group>
);

const Scone: React.FC<{ a: number; r: number; m: Record<string, THREE.Material> }> = ({ a, r, m }) => (
  <group position={[Math.cos(a) * r, 0.012, Math.sin(a) * r]}>
    <mesh material={m.scone} castShadow>
      <cylinderGeometry args={[0.036, 0.04, 0.04, 20]} />
    </mesh>
    <mesh material={m.crust} position-y={0.022} scale={[1, 0.35, 1]}>
      <sphereGeometry args={[0.036, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
    </mesh>
  </group>
);

const Cake: React.FC<{ a: number; r: number; i: number; m: Record<string, THREE.Material> }> = ({ a, r, i, m }) => (
  <group position={[Math.cos(a) * r, 0.016, Math.sin(a) * r]}>
    <mesh material={i % 2 ? m.cakeB : m.cakeA} castShadow>
      <cylinderGeometry args={[0.026, 0.028, 0.034, 18]} />
    </mesh>
    <mesh material={m.cream} position-y={0.02} scale={[1, 0.5, 1]}>
      <sphereGeometry args={[0.022, 14, 8]} />
    </mesh>
    <mesh material={m.berry} position-y={0.034}>
      <sphereGeometry args={[0.009, 10, 8]} />
    </mesh>
  </group>
);

/**
 * `fill[i]` (0..1) pops tier i's food in; `glow[i]` (0..1) lights tier i. `s` scales the whole stand.
 */
export const AfternoonStand: React.FC<{ pos: V3; s: number; fill: [number, number, number]; glow?: [number, number, number] }> = ({
  pos,
  s,
  fill,
  glow = [0, 0, 0],
}) => {
  const plate = useMemo(() => porcelain(), []);
  const m = useMemo(
    () => ({
      bread: mat("#f6ead2", 0.75),
      cucumber: mat("#7fb04f", 0.5),
      scone: mat("#d9a25a", 0.8),
      crust: mat("#b97a36", 0.8),
      cakeA: mat("#f4a6b8", 0.55),
      cakeB: mat("#c98a3e", 0.6),
      cream: mat("#fff6e6", 0.45),
      berry: mat("#d8323e", 0.35, { emissive: new THREE.Color("#5a0a10"), emissiveIntensity: 0.2 }),
    }),
    [],
  );
  if (s <= 0.01) return null;
  const food = [
    Array.from({ length: 5 }, (_, i) => <Sandwich key={i} a={(i / 5) * Math.PI * 2} r={TIERS[0].r * 0.6} m={m} />),
    Array.from({ length: 4 }, (_, i) => <Scone key={i} a={(i / 4) * Math.PI * 2 + 0.4} r={TIERS[1].r * 0.55} m={m} />),
    Array.from({ length: 3 }, (_, i) => <Cake key={i} a={(i / 3) * Math.PI * 2 + 0.9} r={TIERS[2].r * 0.5} i={i} m={m} />),
  ];
  return (
    <>
      <group position={pos} scale={s}>
        <ContactShadow pos={[0, 0, 0]} radius={0.24} opacity={0.6} />
        <mesh material={goldTrim} position-y={0.29}>
          <cylinderGeometry args={[0.008, 0.008, 0.58, 10]} />
        </mesh>
        <mesh material={goldTrim} position-y={0.6} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.035, 0.007, 8, 20]} />
        </mesh>
        {TIERS.map((t, ti) => (
          <group key={ti} position-y={t.y}>
            <mesh material={plate} castShadow receiveShadow>
              <cylinderGeometry args={[t.r, t.r * 0.85, 0.015, 36]} />
            </mesh>
            {fill[ti] > 0.01 && <group scale={fill[ti]}>{food[ti]}</group>}
          </group>
        ))}
      </group>
      {glow.map((g, i) =>
        g > 0.01 ? <Glow key={i} pos={tierAt(pos, s, i)} size={TIERS[i].r * s * 3.2} color="#ffd9a0" intensity={g * 0.55} /> : null,
      )}
    </>
  );
};
