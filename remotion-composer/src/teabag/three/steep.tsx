import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../core";

// Steeping tea surface: pale amber hot water that turns to tea from the bag outward. A cloud of tea colour
// spirals out from `center` (uv offset of the bag, -1..1 across the disc) as `spread` grows, and the whole
// disc deepens with `steep` — tannin coming out the whole time the bag sits in the water.

type U = Record<"uWater" | "uTea", { value: THREE.Color }> & Record<"uSpread" | "uSteep" | "uSwirl" | "uGlow", { value: number }> & { uCenter: { value: THREE.Vector2 } };

const steepMaterial = () => {
  const u: U = {
    uWater: { value: new THREE.Color("#b5702c") },
    uTea: { value: new THREE.Color("#4a1405") },
    uSpread: { value: 0 },
    uSteep: { value: 0 },
    uSwirl: { value: 0 },
    uGlow: { value: 0.12 },
    uCenter: { value: new THREE.Vector2() },
  };
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  white.needsUpdate = true;
  const mat = new THREE.MeshPhysicalMaterial({ map: white, roughness: 0.12, clearcoat: 0.7, clearcoatRoughness: 0.1, specularIntensity: 0.7 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uWater; uniform vec3 uTea; uniform vec2 uCenter;
        uniform float uSpread; uniform float uSteep; uniform float uSwirl; uniform float uGlow;
        vec3 steepColour(vec2 uv) {
          vec2 p = (uv - 0.5) * 2.0;
          vec2 q = p - uCenter;
          float r = length(q);
          float a = atan(q.y, q.x);
          float arms = 0.5 + 0.5 * sin(3.0 * a + 8.0 * r - uSwirl) * cos(2.0 * a - 4.0 * r + uSwirl * 0.7);
          float cloud = smoothstep(uSpread + 0.05, uSpread - 0.35, r) * (0.55 + 0.45 * arms);
          float k = clamp(max(cloud * 0.85, uSteep), 0.0, 1.0);
          vec3 c = mix(uWater, uTea, k);
          return c * (0.9 + 0.14 * smoothstep(0.8, 1.0, length(p)));
        }`,
      )
      .replace("#include <map_fragment>", "vec3 liq = steepColour(vMapUv);\ndiffuseColor.rgb = liq;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += liq * uGlow;");
  };
  return { mat, u };
};

export const SteepDisc: React.FC<{
  center: V3;
  radius: number;
  /** Bag position on the disc, -1..1 (x right, y toward the camera is negative z). */
  from?: [number, number];
  spread: number;
  steep: number;
  swirl?: number;
  glow?: number;
}> = ({ center, radius, from = [0, 0], spread, steep, swirl = 0, glow = 0.12 }) => {
  const { mat, u } = useMemo(steepMaterial, []);
  u.uCenter.value.set(from[0], from[1]);
  u.uSpread.value = spread * 2.2;
  u.uSteep.value = steep;
  u.uSwirl.value = swirl;
  u.uGlow.value = glow;
  return (
    <mesh position={center} rotation-x={-Math.PI / 2} scale={[radius, radius, 1]} material={mat} receiveShadow>
      <circleGeometry args={[1, 96]} />
    </mesh>
  );
};
