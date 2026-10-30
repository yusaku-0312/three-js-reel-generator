import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { V3 } from "../core";

/**
 * Toy-like food, all procedural and glossy. Each item is about the size of a real one at figure scale
 * (child figure = 1.0), and `s` scales it up for the hero shots where it floats beside the phone.
 */
type Item = { pos: V3; s?: number; rot?: V3 };

const Glossy: React.FC<{ color: string; rough?: number; coat?: number; emissive?: number }> = ({ color, rough = 0.35, coat = 0.6, emissive = 0 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={coat} clearcoatRoughness={0.25} emissive={color} emissiveIntensity={emissive} />
);

export const Egg: React.FC<Item> = ({ pos, s = 1, rot = [0, 0, 0] }) => (
  <mesh position={pos} rotation={rot} scale={[0.045 * s, 0.058 * s, 0.045 * s]} castShadow>
    <sphereGeometry args={[1, 20, 14]} />
    <Glossy color="#fff3e0" rough={0.5} coat={0.3} />
  </mesh>
);

export const Tomato: React.FC<Item> = ({ pos, s = 1, rot = [0, 0, 0] }) => (
  <group position={pos} rotation={rot} scale={s}>
    <mesh scale={[0.08, 0.068, 0.08]} castShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <Glossy color="#e5382b" rough={0.22} coat={0.9} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[0, 0.066, 0]} rotation={[0.9, (i / 5) * Math.PI * 2, 0]}>
        <boxGeometry args={[0.012, 0.004, 0.05]} />
        <meshStandardMaterial color="#3d8a2f" roughness={0.6} />
      </mesh>
    ))}
  </group>
);

export const Carrot: React.FC<Item> = ({ pos, s = 1, rot = [0, 0, Math.PI / 2] }) => (
  <group position={pos} rotation={rot} scale={s}>
    <mesh castShadow>
      <coneGeometry args={[0.035, 0.24, 14]} />
      <Glossy color="#ff8a1f" rough={0.45} coat={0.4} />
    </mesh>
    {[-0.3, 0, 0.3].map((a) => (
      <mesh key={a} position={[0, 0.15, 0]} rotation-z={a}>
        <boxGeometry args={[0.008, 0.08, 0.008]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
    ))}
  </group>
);

export const Onion: React.FC<Item> = ({ pos, s = 1, rot = [0, 0, 0] }) => (
  <group position={pos} rotation={rot} scale={s}>
    <mesh scale={[0.075, 0.07, 0.075]} castShadow>
      <sphereGeometry args={[1, 20, 14]} />
      <Glossy color="#d9a15a" rough={0.4} coat={0.5} />
    </mesh>
    <mesh position={[0, 0.08, 0]}>
      <coneGeometry args={[0.018, 0.04, 8]} />
      <meshStandardMaterial color="#a8763a" />
    </mesh>
  </group>
);

export const Pepper: React.FC<Item & { tint?: number }> = ({ pos, s = 1, rot = [0, 0, 0], tint = 0 }) => {
  const color = new THREE.Color("#2f9a35").lerp(new THREE.Color("#7a8a7a"), tint);
  return (
    <group position={pos} rotation={rot} scale={s}>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 0.024, 0, 0]} scale={[0.04, 0.065, 0.05]} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
          <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={1} />
        </mesh>
      ))}
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.03, 8]} />
        <meshStandardMaterial color="#2f6b22" />
      </mesh>
    </group>
  );
};

/** Milk carton: white with a blue band and a gable top. */
export const Milk: React.FC<Item> = ({ pos, s = 1, rot = [0, 0, 0] }) => {
  const roof = useMemo(() => {
    const g = new THREE.CylinderGeometry(0, 0.065, 0.05, 4, 1);
    g.rotateY(Math.PI / 4);
    return g;
  }, []);
  return (
    <group position={pos} rotation={rot} scale={s}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.09, 0.2, 0.09]} />
        <meshStandardMaterial color="#fbfbf7" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.092, 0.04, 0.092]} />
        <meshStandardMaterial color="#3d8bd9" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.225, 0]} geometry={roof} scale={[1, 1, 0.35]}>
        <meshStandardMaterial color="#fbfbf7" roughness={0.6} />
      </mesh>
    </group>
  );
};

/** Pale tray of eggs (five showing). */
export const EggCarton: React.FC<Item> = ({ pos, s = 1, rot = [0, 0, 0] }) => (
  <group position={pos} rotation={rot} scale={s}>
    <mesh position={[0, 0.02, 0]} castShadow>
      <boxGeometry args={[0.32, 0.04, 0.12]} />
      <meshStandardMaterial color="#e7d3b0" roughness={0.9} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => (
      <Egg key={i} pos={[-0.12 + i * 0.06, 0.07, 0]} s={0.95} />
    ))}
  </group>
);

/** Chicken in a foam tray with cling film. */
export const Chicken: React.FC<Item> = ({ pos, s = 1, rot = [0, 0, 0] }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(0.26, 0.04, 0.16, 3, 0.015), []);
  return (
    <group position={pos} rotation={rot} scale={s}>
      <mesh geometry={geo} position={[0, 0.02, 0]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {[-0.07, 0.0, 0.07].map((x, i) => (
        <mesh key={x} position={[x, 0.05, (i - 1) * 0.015]} scale={[0.05, 0.022, 0.055]}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshPhysicalMaterial color="#f2a3a0" roughness={0.35} clearcoat={0.8} />
        </mesh>
      ))}
    </group>
  );
};

/** Omurice on a white plate, with a ketchup zigzag; steam is drawn by the scene. */
export const Omurice: React.FC<Item> = ({ pos, s = 1, rot = [0, 0, 0] }) => {
  const zig = useMemo(() => {
    const pts = Array.from({ length: 9 }, (_, i) => new THREE.Vector3(-0.11 + i * 0.0275, 0, i % 2 ? -0.025 : 0.025));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.008, 6, false);
  }, []);
  return (
    <group position={pos} rotation={rot} scale={s}>
      <mesh position={[0, 0.008, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.24, 0.2, 0.016, 40]} />
        <meshPhysicalMaterial color="#e9e4da" roughness={0.45} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.045, 0]} scale={[0.16, 0.06, 0.09]} castShadow>
        <sphereGeometry args={[1, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#ffc93a" roughness={0.3} clearcoat={0.7} sheen={0.4} />
      </mesh>
      <mesh geometry={zig} position={[0, 0.1, 0]}>
        <meshPhysicalMaterial color="#d81f26" roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[0.13, 0.03, 0.08]} scale={[0.03, 0.03, 0.03]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#3d9a3d" roughness={0.5} />
      </mesh>
    </group>
  );
};

/** Stand-alone hero versions: the photo ingredients orbiting the AI. */
export const FOOD_RING = ["egg", "tomato", "carrot", "onion", "chicken", "milk"] as const;
export type FoodId = (typeof FOOD_RING)[number] | "pepper";

export const Food: React.FC<{ id: FoodId; pos: V3; s?: number; rot?: V3; tint?: number }> = ({ id, pos, s = 1, rot, tint }) => {
  switch (id) {
    case "egg":
      return <Egg pos={pos} s={s} rot={rot} />;
    case "tomato":
      return <Tomato pos={pos} s={s} rot={rot} />;
    case "carrot":
      return <Carrot pos={pos} s={s} rot={rot ?? [0, 0, 1.1]} />;
    case "onion":
      return <Onion pos={pos} s={s} rot={rot} />;
    case "chicken":
      return <Chicken pos={pos} s={s} rot={rot ?? [0.5, 0, 0]} />;
    case "milk":
      return <Milk pos={[pos[0], pos[1] - 0.11 * s, pos[2]]} s={s} rot={rot} />;
    default:
      return <Pepper pos={pos} s={s} rot={rot} tint={tint} />;
  }
};
