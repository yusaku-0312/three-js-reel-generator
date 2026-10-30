import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../core";
import { Cup, CupPose, ContactShadow, porcelain, teaRadius, teaSurface } from "../../golden2/three/models";
import { windowTexture } from "./textures";
import { Glow } from "../../paradise/three/fx";

// The reel's one idea in material form: the same tea reads brown in a dark mug and clear crimson with a gold
// rim ring once a white cup is held against the light. `clear` 0..1 moves between the two looks.

type RedU = Record<"uClear" | "uGlow" | "uRing" | "uTime", { value: number }>;

const white1 = (() => {
  let t: THREE.DataTexture | null = null;
  return () => {
    if (t) return t;
    t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
  };
})();

const redTeaMaterial = () => {
  const u: RedU = { uClear: { value: 0 }, uGlow: { value: 0 }, uRing: { value: 0 }, uTime: { value: 0 } };
  const mat = new THREE.MeshPhysicalMaterial({ map: white1(), roughness: 0.08, clearcoat: 0.8, clearcoatRoughness: 0.06, specularIntensity: 0.5 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uClear; uniform float uGlow; uniform float uRing; uniform float uTime;
        vec3 srgb(vec3 c) { return pow(c, vec3(2.2)); }
        vec3 teaColour(vec2 uv, out vec3 glow) {
          float r = length((uv - 0.5) * 2.0);
          float sway = 0.04 * sin(uv.x * 9.0 + uTime * 0.05) * sin(uv.y * 7.0 - uTime * 0.04);
          // dull: murky brown, a touch lighter at the wall
          vec3 dull = mix(srgb(vec3(0.20, 0.10, 0.05)), srgb(vec3(0.36, 0.20, 0.10)), smoothstep(0.5, 1.0, r));
          // clear: deep ruby core, crimson body, orange near the wall, gold ring at the meniscus
          vec3 core = srgb(vec3(0.50, 0.07, 0.04));
          vec3 body = srgb(vec3(0.72, 0.11, 0.06));
          vec3 edge = srgb(vec3(0.90, 0.32, 0.10));
          vec3 clear = mix(core, body, smoothstep(0.0, 0.6, r + sway));
          clear = mix(clear, edge, smoothstep(0.7, 0.92, r));
          float ring = smoothstep(0.84, 0.93, r) * smoothstep(1.0, 0.95, r);
          vec3 gold = srgb(vec3(1.0, 0.72, 0.30));
          clear = mix(clear, gold, ring * uRing);
          glow = (clear * (0.6 + 0.4 * smoothstep(0.2, 0.9, r)) + gold * ring * uRing * 1.2) * uGlow;
          return mix(dull, clear, uClear);
        }`,
      )
      .replace("#include <map_fragment>", "vec3 teaGlow;\nvec3 liq = teaColour(vMapUv, teaGlow);\ndiffuseColor.rgb = liq;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += teaGlow;");
  };
  return { mat, u };
};

export type TeaLook = { clear: number; glow?: number; ring?: number };

/** Flat tea surface (a disc) at `center`. */
export const RedTea: React.FC<{ center: V3; radius: number; look: TeaLook; f: number }> = ({ center, radius, look, f }) => {
  const { mat, u } = useMemo(redTeaMaterial, []);
  u.uClear.value = look.clear;
  u.uGlow.value = look.glow ?? 0;
  u.uRing.value = look.ring ?? look.clear;
  u.uTime.value = f;
  if (radius <= 0.001) return null;
  return (
    <mesh position={center} rotation-x={-Math.PI / 2} scale={[radius, radius, 1]} material={mat} receiveShadow>
      <circleGeometry args={[1, 96]} />
    </mesh>
  );
};

/** golden2 white porcelain cup with this reel's tea surface. */
export const WhiteCup: React.FC<{ pose: CupPose; fill: number; look: TeaLook; f: number }> = ({ pose, fill, look, f }) => (
  <>
    <Cup pose={pose} fill={0} />
    {fill > 0.02 && <RedTea center={teaSurface(pose, fill)} radius={teaRadius(pose, fill) * 0.995} look={look} f={f} />}
  </>
);

// ---------------------------------------------------------------------------
// Mug: thick dark-brown stoneware, glazed inside too, so the tea in it reads brown.
// ---------------------------------------------------------------------------

const MUG_R = 0.48;
const MUG_H = 0.95;
const MUG_WALL = 0.065;
const MUG_FLOOR = 0.09;
let mugGeo: THREE.LatheGeometry | null = null;

export type MugPose = { pos: V3; scale?: number; yaw?: number };

export const mugSurface = ({ pos, scale = 1 }: MugPose, fill: number): V3 => [
  pos[0],
  pos[1] + (MUG_FLOOR + fill * (MUG_H - MUG_FLOOR - 0.08)) * scale,
  pos[2],
];
export const mugRadius = ({ scale = 1 }: MugPose) => (MUG_R - MUG_WALL) * scale;

export const Mug: React.FC<{ pose: MugPose; fill: number; look: TeaLook; f: number }> = ({ pose, fill, look, f }) => {
  if (!mugGeo) {
    const R = MUG_R;
    const I = MUG_R - MUG_WALL;
    mugGeo = new THREE.LatheGeometry(
      ([
        [0, 0], [R - 0.06, 0], [R - 0.01, 0.03], [R, 0.12], [R + 0.01, MUG_H - 0.03], [R - 0.01, MUG_H], [I + 0.01, MUG_H],
        [I, MUG_H - 0.03], [I - 0.005, MUG_FLOOR + 0.06], [I - 0.05, MUG_FLOOR], [0, MUG_FLOOR],
      ] as Array<[number, number]>).map(([x, y]) => new THREE.Vector2(x, y)),
      96,
    );
  }
  const glaze = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#4a2c1c", roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.15, side: THREE.DoubleSide }),
    [],
  );
  const s = pose.scale ?? 1;
  return (
    <>
      <ContactShadow pos={pose.pos} radius={0.75 * s} />
      <group position={pose.pos} rotation={[0, pose.yaw ?? 0, 0]} scale={s}>
        <mesh geometry={mugGeo} material={glaze} castShadow receiveShadow />
        <mesh position={[MUG_R + 0.06, MUG_H * 0.52, 0]} rotation-z={-Math.PI / 2} material={glaze} castShadow>
          <torusGeometry args={[0.22, 0.055, 16, 40, Math.PI]} />
        </mesh>
      </group>
      {fill > 0.02 && <RedTea center={mugSurface(pose, fill)} radius={mugRadius(pose) * 0.99} look={look} f={f} />}
    </>
  );
};

// ---------------------------------------------------------------------------
// Small Chinese tea bowl (no handle) for the pu-erh scene.
// ---------------------------------------------------------------------------

let bowlGeo: THREE.LatheGeometry | null = null;
const BOWL_LEVEL = 0.3;

export const TeaBowl: React.FC<{ pos: V3; scale?: number; look: TeaLook; f: number }> = ({ pos, scale = 1, look, f }) => {
  if (!bowlGeo)
    bowlGeo = new THREE.LatheGeometry(
      ([
        [0, 0], [0.16, 0], [0.18, 0.04], [0.2, 0.05], [0.34, 0.2], [0.42, 0.4], [0.41, 0.42], [0.39, 0.4], [0.31, 0.21],
        [0.18, 0.08], [0, 0.075],
      ] as Array<[number, number]>).map(([x, y]) => new THREE.Vector2(x, y)),
      72,
    );
  const mat = useMemo(() => porcelain(), []);
  return (
    <>
      <ContactShadow pos={pos} radius={0.55 * scale} />
      <mesh geometry={bowlGeo} material={mat} position={pos} scale={scale} castShadow receiveShadow />
      <RedTea center={[pos[0], pos[1] + BOWL_LEVEL * scale, pos[2]]} radius={0.355 * scale} look={look} f={f} />
    </>
  );
};

// ---------------------------------------------------------------------------
// Sunlight from a window behind the cup (seen from above, so the window itself is off frame): a window-shaped
// patch of light on the counter, a warm back spot that rims the cup, and a soft glow behind it.
// ---------------------------------------------------------------------------

export const SunLight: React.FC<{ target: V3; open: number }> = ({ target, open }) => {
  const patch = useMemo(
    () => new THREE.MeshBasicMaterial({ map: windowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
    [],
  );
  patch.color.set("#ffc890").multiplyScalar(open * 0.3);
  const spot = useMemo(() => {
    const l = new THREE.SpotLight("#ffb46a", 0, 0, 0.26, 0.6, 0);
    return l;
  }, []);
  spot.intensity = open * 2.6;
  // steep enough that its reflection on the lacquered counter misses the camera
  spot.position.set(target[0] + 0.6, target[1] + 5.5, target[2] - 2.6);
  spot.target.position.set(...target);
  spot.target.updateMatrixWorld();
  if (open <= 0.001) return null;
  return (
    <>
      <mesh position={[target[0] + 0.3, 0.004, target[2] - 2.5]} rotation={[-Math.PI / 2, 0, 0.12]} material={patch}>
        <planeGeometry args={[1.9, 1.7]} />
      </mesh>
      <primitive object={spot} />
      <primitive object={spot.target} />
      <Glow pos={[target[0] + 0.15, target[1] + 0.35, target[2] - 1.1]} size={2.6} color="#ffb070" intensity={open * 0.18} />
    </>
  );
};
