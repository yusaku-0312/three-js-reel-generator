import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../core";
import { goldMaterial } from "./models";

const SPIKES = 5;
const ruby = new THREE.MeshPhysicalMaterial({ color: "#c0142c", roughness: 0.08, clearcoat: 1, emissive: "#40000a", emissiveIntensity: 0.4 });
const pearl = new THREE.MeshPhysicalMaterial({ color: "#fff6e8", roughness: 0.2, clearcoat: 1 });

/** Small gold crown marking the guest of honour's cup. Height ≈ 0.42 at scale 1. */
export const Crown: React.FC<{ pos: V3; scale: number; spin: number }> = ({ pos, scale, spin }) => {
  const spikes = useMemo(() => Array.from({ length: SPIKES }, (_, i) => (i / SPIKES) * Math.PI * 2), []);
  if (scale <= 0.001) return null;
  return (
    <group position={pos} scale={scale} rotation={[0.25, spin, 0]}>
      <mesh material={goldMaterial}>
        <cylinderGeometry args={[0.3, 0.26, 0.16, 48, 1, true]} />
      </mesh>
      <mesh material={goldMaterial} position-y={-0.08} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.265, 0.025, 12, 48]} />
      </mesh>
      <mesh material={goldMaterial} position-y={0.08} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.3, 0.02, 12, 48]} />
      </mesh>
      {spikes.map((a, i) => (
        <group key={i} rotation-y={a}>
          <mesh material={goldMaterial} position={[0.29, 0.2, 0]}>
            <coneGeometry args={[0.07, 0.24, 16]} />
          </mesh>
          <mesh material={pearl} position={[0.29, 0.34, 0]}>
            <sphereGeometry args={[0.035, 16, 12]} />
          </mesh>
          <mesh material={ruby} position={[0.285, 0, 0]} rotation-y={Math.PI / 2}>
            <sphereGeometry args={[0.035, 16, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
