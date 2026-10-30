import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { V3 } from "../core";
import { Shot2 } from "../../golden2/shot";
import { duskSkyTexture, labTexture } from "./textures";
import { Town, TownState } from "./town";

export { Cam } from "../../golden2/three/stage";

export type SetId = "town" | "lab";

export type Lighting = {
  set: SetId;
  /** Low sun (town) or the overhead softbox (lab). */
  key: number;
  fill: number;
  /** Soft frontal fill from the camera side so object colours hold. */
  front: number;
  /** Lab only: cyan rim (left) and pink rim (right). */
  rimCyan?: number;
  rimPink?: number;
  /** Town only: 0 = golden dusk, 1 = later evening (darker sky, windows carry the light). */
  evening?: number;
  /** Town fog range override (the high map view needs to see the whole route). */
  fog?: [number, number];
};

export const TOWN_LIGHT: Lighting = { set: "town", key: 3.2, fill: 0.45, front: 0.5 };
export const LAB_LIGHT: Lighting = { set: "lab", key: 2.6, fill: 0.25, front: 0.45, rimCyan: 2.2, rimPink: 2.2 };

/** Reflection rooms, built once per set: dusk dome with the sun for the town, softboxes for the lab. */
const envScene = (set: SetId) => {
  const scene = new THREE.Scene();
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { lab: { value: set === "lab" ? 1 : 0 } },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float lab;
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 top = mix(vec3(0.20, 0.25, 0.48), vec3(0.03, 0.05, 0.12), lab);
          vec3 horizon = mix(vec3(1.0, 0.62, 0.42), vec3(0.08, 0.12, 0.25), lab);
          vec3 ground = mix(vec3(0.30, 0.26, 0.24), vec3(0.02, 0.03, 0.06), lab);
          vec3 c = h > 0.0 ? mix(horizon, top, pow(h, 0.5)) : mix(horizon, ground, pow(-h, 0.4));
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  );
  scene.add(dome);
  const card = (w: number, h: number, pos: V3, color: string, power: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0.5, 0);
    scene.add(m);
  };
  if (set === "town") {
    card(5, 2.5, [12, 2.5, -9], "#ffb070", 7); // the low sun
    card(10, 2, [0, 10, 0], "#9fb4e8", 1.6); // sky strip
  } else {
    card(8, 3, [0, 9, 2], "#dfe9ff", 4); // overhead softbox
    card(1.2, 7, [-7, 3, -2], "#5ff0ff", 3); // cyan strip
    card(1.2, 7, [7, 3, -2], "#ff8ac0", 3); // pink strip
  }
  return scene;
};

const Environment: React.FC<{ set: SetId; evening: number; fog?: [number, number] }> = ({ set, evening, fog }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const envs = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const out = { town: pmrem.fromScene(envScene("town"), 0, 0.1, 50).texture, lab: pmrem.fromScene(envScene("lab"), 0, 0.1, 50).texture };
    pmrem.dispose();
    return out;
  }, [gl]);
  useLayoutEffect(() => () => Object.values(envs).forEach((t) => t.dispose()), [envs]);
  useLayoutEffect(() => {
    scene.environment = envs[set];
    scene.environmentIntensity = set === "town" ? 0.55 - evening * 0.2 : 0.6;
    scene.background = set === "town" ? duskSkyTexture() : labTexture();
    scene.fog = set === "town" ? new THREE.Fog(new THREE.Color("#e7a07e").lerp(new THREE.Color("#3a3d63"), evening), fog?.[0] ?? 16, fog?.[1] ?? 46) : new THREE.Fog("#070c1a", 9, 26);
    gl.localClippingEnabled = true;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  });
  return null;
};

/** Low dusk sun from the right and behind: long shadows across the street toward the camera. */
const Sun: React.FC<{ at: V3; intensity: number; evening: number }> = ({ at, intensity, evening }) => {
  const light = useMemo(() => {
    const d = new THREE.DirectionalLight("#ffb27a");
    d.castShadow = true;
    d.shadow.mapSize.set(2048, 2048);
    d.shadow.bias = -0.0004;
    d.shadow.normalBias = 0.03;
    const c = d.shadow.camera as THREE.OrthographicCamera;
    c.left = -14;
    c.right = 14;
    c.top = 14;
    c.bottom = -14;
    c.near = 1;
    c.far = 60;
    return d;
  }, []);
  light.position.set(at[0] + 14, at[1] + 6.5, at[2] - 9);
  light.target.position.set(...at);
  light.target.updateMatrixWorld();
  light.intensity = intensity * (1 - evening * 0.65);
  light.color.set("#ffb27a").lerp(new THREE.Color("#ff8a6a"), evening);
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

const LabFloor: React.FC = () => (
  <mesh rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow>
    <planeGeometry args={[60, 60]} />
    <meshPhysicalMaterial color="#0b1428" roughness={0.32} metalness={0.15} clearcoat={0.4} clearcoatRoughness={0.3} />
  </mesh>
);

const LabLights: React.FC<{ l: Lighting; at: V3 }> = ({ l, at }) => {
  const spot = useMemo(() => {
    const s = new THREE.SpotLight("#e4ecff");
    s.castShadow = true;
    s.shadow.mapSize.set(1024, 1024);
    s.shadow.bias = -0.0003;
    s.penumbra = 0.8;
    s.decay = 0;
    s.angle = 0.55;
    return s;
  }, []);
  spot.position.set(at[0], at[1] + 8, at[2] + 3);
  spot.target.position.set(...at);
  spot.target.updateMatrixWorld();
  spot.intensity = l.key;
  return (
    <>
      <primitive object={spot} />
      <primitive object={spot.target} />
      <pointLight position={[at[0] - 4, at[1] + 1.5, at[2] - 1.5]} color="#4feaff" intensity={(l.rimCyan ?? 0) * 6} distance={14} decay={1.6} />
      <pointLight position={[at[0] + 4, at[1] + 1.5, at[2] - 1.5]} color="#ff7ab6" intensity={(l.rimPink ?? 0) * 6} distance={14} decay={1.6} />
      <LabFloor />
    </>
  );
};

/** Front fill follows the camera from slightly above, so it never throws a second visible shadow. */
const FrontFill: React.FC<{ shot: Shot2; l: Lighting }> = ({ shot, l }) => (
  <directionalLight position={[shot.pos[0], shot.pos[1] + 3, shot.pos[2]]} intensity={l.front} color={l.set === "town" ? "#ffe9d6" : "#dce6ff"} />
);

export const Stage: React.FC<{ f: number; shot: Shot2; light: Lighting; town?: TownState }> = ({ f, shot, light, town }) => {
  const evening = light.evening ?? 0;
  return (
    <>
      <Environment set={light.set} evening={evening} fog={light.fog} />
      <FrontFill shot={shot} l={light} />
      {light.set === "town" ? (
        <>
          <Sun at={shot.target} intensity={light.key} evening={evening} />
          <hemisphereLight args={[new THREE.Color("#9db2e6").lerp(new THREE.Color("#5a6496"), evening), "#7a6252"]} intensity={light.fill} />
          <Town f={f} state={town ?? {}} evening={evening} />
        </>
      ) : (
        <>
          <hemisphereLight args={["#40507e", "#0a0f1c"]} intensity={light.fill} />
          <LabLights l={light} at={[shot.target[0], 0, shot.target[2]]} />
        </>
      )}
    </>
  );
};
