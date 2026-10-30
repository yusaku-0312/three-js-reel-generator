import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../core";

// Breakfast on a plate at counter scale (the cookietea plate is ~1.05 across at scale 1).

/** A slice of toast: pale crumb top with a golden-brown crust, lying flat; `k` pops it in. */
export const Toast: React.FC<{ pos: V3; yaw?: number; tilt?: number; k?: number; scale?: number }> = ({ pos, yaw = 0, tilt = 0, k = 1, scale = 1 }) => {
  const crust = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a8642a", roughness: 0.8 }), []);
  const crumb = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e6b56a", roughness: 0.9, emissive: "#7a4a14", emissiveIntensity: 0.06 }), []);
  const shape = useMemo(() => {
    // bread-slice outline: square bottom, domed top
    const s = new THREE.Shape();
    s.moveTo(-0.32, -0.3);
    s.lineTo(0.32, -0.3);
    s.lineTo(0.32, 0.12);
    s.bezierCurveTo(0.36, 0.36, 0.14, 0.4, 0, 0.36);
    s.bezierCurveTo(-0.14, 0.4, -0.36, 0.36, -0.32, 0.12);
    s.closePath();
    return s;
  }, []);
  const s = scale * k;
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, yaw, tilt]} scale={s}>
      <group rotation-x={-Math.PI / 2}>
        <mesh material={crust} castShadow receiveShadow>
          <extrudeGeometry args={[shape, { depth: 0.07, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }]} />
        </mesh>
        <mesh position-z={0.088} scale={[0.86, 0.86, 1]} material={crumb}>
          <shapeGeometry args={[shape]} />
        </mesh>
      </group>
    </group>
  );
};

/** Fried egg: a soft white puddle with a glossy yolk dome; `k` pops it in. */
export const FriedEgg: React.FC<{ pos: V3; k?: number; scale?: number }> = ({ pos, k = 1, scale = 1 }) => {
  const white = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#f7f3ea", roughness: 0.35, clearcoat: 0.5, emissive: "#ffffff", emissiveIntensity: 0.04 }), []);
  const yolk = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#f2a21a", roughness: 0.2, clearcoat: 1, emissive: "#c06a00", emissiveIntensity: 0.15 }), []);
  const puddle = useMemo(() => {
    const sh = new THREE.Shape();
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 0.34 + 0.05 * Math.sin(a * 3 + 0.6) + 0.03 * Math.sin(a * 5);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.9;
      if (i === 0) sh.moveTo(x, y);
      else sh.lineTo(x, y);
    }
    return sh;
  }, []);
  const s = scale * k;
  if (s <= 0.002) return null;
  return (
    <group position={pos} scale={s}>
      <mesh rotation-x={-Math.PI / 2} material={white} receiveShadow>
        <extrudeGeometry args={[puddle, { depth: 0.025, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.02, bevelSegments: 3 }]} />
      </mesh>
      <mesh position={[0.04, 0.05, -0.02]} scale={[0.13, 0.08, 0.13]} material={yolk} castShadow>
        <sphereGeometry args={[1, 32, 16]} />
      </mesh>
    </group>
  );
};
