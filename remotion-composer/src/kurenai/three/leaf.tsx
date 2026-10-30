import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../core";

// One fresh tea leaf lying on the counter. `ferment` 0..1 turns it from green to copper-red, starting at the
// serrated edge and creeping in along the veins (the oxidation that makes theaflavins).

type LeafU = Record<"uFerment" | "uGlow", { value: number }>;

const leafMaterial = () => {
  const u: LeafU = { uFerment: { value: 0 }, uGlow: { value: 0 } };
  const mat = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3, side: THREE.DoubleSide });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vLeaf;")
      .replace(
        "#include <begin_vertex>",
        `vLeaf = uv;
        vec3 transformed = position;
        float cx = (uv.x - 0.5) * 2.0;
        // cupped across the blade, arched along the midrib, tip lifting a little
        transformed.z += 0.12 * cx * cx + 0.1 * sin(uv.y * 3.14159) + 0.06 * uv.y * uv.y;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec2 vLeaf;
        uniform float uFerment; uniform float uGlow;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
        }
        vec3 srgb(vec3 c) { return pow(c, vec3(2.2)); }`,
      )
      .replace(
        "#include <map_fragment>",
        `float y = vLeaf.y;
        float hw = 0.5 * pow(sin(3.14159 * pow(y, 0.85)), 0.8) * (1.0 - 0.12 * y);
        float saw = 0.018 * abs(fract(y * 26.0) - 0.5) * smoothstep(0.05, 0.2, y) * smoothstep(0.98, 0.85, y);
        float x = abs(vLeaf.x - 0.5);
        if (x > hw - saw) discard;
        float edge = 1.0 - x / max(hw, 1e-3);
        float rib = smoothstep(0.012, 0.0, x);
        float vein = smoothstep(0.008, 0.0, abs(fract((y - x * 0.9) * 9.0) - 0.5) * 0.12) * smoothstep(0.02, 0.06, x) * smoothstep(0.0, 0.25, hw - x);
        vec3 green = mix(srgb(vec3(0.20, 0.42, 0.12)), srgb(vec3(0.42, 0.62, 0.24)), 0.35 * vein + 0.7 * rib);
        green *= 0.85 + 0.25 * noise(vLeaf * vec2(30.0, 60.0));
        vec3 copper = mix(srgb(vec3(0.55, 0.13, 0.05)), srgb(vec3(0.78, 0.30, 0.10)), 0.35 * vein + 0.6 * rib);
        copper *= 0.85 + 0.3 * noise(vLeaf * vec2(24.0, 48.0) + 7.0);
        float front = uFerment * 1.45 - 0.35 + 0.25 * noise(vLeaf * vec2(8.0, 14.0)) + 0.15 * vein;
        float k = smoothstep(edge - 0.12, edge + 0.12, front);
        diffuseColor.rgb = mix(green, copper, k);
        vec3 leafGlow = copper * k * uGlow * (0.6 + 0.6 * vein);`,
      )
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += leafGlow;");
  };
  return { mat, u };
};

export const BigLeaf: React.FC<{ pos: V3; length: number; yaw?: number; ferment: number; glow?: number }> = ({
  pos,
  length,
  yaw = 0,
  ferment,
  glow = 0,
}) => {
  const { mat, u } = useMemo(leafMaterial, []);
  u.uFerment.value = ferment;
  u.uGlow.value = glow;
  return (
    <group position={pos} rotation={[-Math.PI / 2, 0, yaw]}>
      <mesh material={mat} position-y={0} receiveShadow>
        <planeGeometry args={[length * 0.55, length, 48, 96]} />
      </mesh>
    </group>
  );
};
