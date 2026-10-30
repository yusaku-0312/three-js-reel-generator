import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rng, V3 } from "../core";
import { Shot2 } from "../../golden2/shot";
import { backdropTexture, bokehTexture, palmGoboTexture, skyTexture, terrazzoTexture } from "./textures";

export { Cam } from "../../golden2/three/stage";

const HAZE = "#f0e6d2";

/** Sky dome for reflections only: turquoise above, warm haze at the horizon, a sun box and cloud cards. */
const skyScene = () => {
  const scene = new THREE.Scene();
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 top = vec3(0.12, 0.55, 0.75);
          vec3 horizon = vec3(0.95, 0.93, 0.82);
          vec3 ground = vec3(0.75, 0.62, 0.45);
          vec3 c = h > 0.0 ? mix(horizon, top, pow(h, 0.6)) : mix(horizon, ground, pow(-h, 0.5));
          gl_FragColor = vec4(c * 1.2, 1.0);
        }`,
    }),
  );
  scene.add(dome);
  const card = (w: number, h: number, pos: V3, color: string, power: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0.5, 0);
    scene.add(m);
  };
  card(4.5, 4.5, [-6, 9, -7], "#fff6e0", 9); // the sun, high behind-left (backlight)
  card(8, 3, [-8, 5, 7], "#ffffff", 2.4); // bright sky window front-left
  card(1.5, 8, [8, 4, 5], "#ffe7c4", 3); // warm rim strip
  card(12, 1.2, [0, 10, 0], "#eaf8ff", 2.2); // top strip for long highlights on rims
  return scene;
};

const Environment: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(skyScene(), 0.0, 0.1, 50).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.5;
    scene.background = skyTexture();
    scene.fog = new THREE.Fog(HAZE, 14, 42);
    gl.localClippingEnabled = true;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

const Table: React.FC = () => {
  const map = useMemo(() => {
    const t = terrazzoTexture().clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 5);
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshPhysicalMaterial map={map} color="#e9d6b8" roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.25} />
    </mesh>
  );
};

/** Beach and sea far behind the terrace; the depth-of-field pass blurs it into a sunny wash. */
const Backdrop: React.FC<{ sky: number }> = ({ sky }) => (
  <mesh position={[0, 8.5, -22]}>
    <planeGeometry args={[64, 32]} />
    <meshBasicMaterial map={backdropTexture()} color={new THREE.Color(1, 1, 1).multiplyScalar(sky)} fog={false} toneMapped />
  </mesh>
);

/** Sun glints on the water and in the leaves; the DOF pass opens them into discs. */
const SunGlints: React.FC<{ f: number; intensity: number }> = ({ f, intensity }) => {
  const dots = useMemo(() => {
    const r = rng(41);
    return Array.from({ length: 26 }, () => ({
      x: -12 + r() * 24,
      y: 0.4 + r() * 5,
      z: -11 - r() * 5,
      s: 0.25 + r() * 0.5,
      warm: r() > 0.5,
      o: 0.4 + r() * 0.6,
      ph: r() * 6.28,
    }));
  }, []);
  if (intensity <= 0) return null;
  return (
    <>
      {dots.map((d, i) => (
        <sprite key={i} position={[d.x + Math.sin(f / 140 + d.ph) * 0.2, d.y, d.z]} scale={d.s}>
          <spriteMaterial
            map={bokehTexture()}
            color={new THREE.Color(d.warm ? "#fff0c8" : "#e8fbff").multiplyScalar(
              intensity * d.o * (0.8 + 0.2 * Math.sin(f / 37 + d.ph)),
            )}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </sprite>
      ))}
    </>
  );
};

export type Lighting = {
  /** Where the sun spot points (it sits high behind-left of this point, so glasses are backlit). */
  keyAt: V3;
  keyAngle: number;
  key: number;
  fill: number;
  /** Soft frontal fill from the camera side, so the faces of objects keep their colour. */
  front: number;
  rim: number;
  bokeh: number;
  /** Brightness of the beach backdrop (rises for the 楽園 beat). */
  sky: number;
  /** 0 = warm afternoon, 1 = cool blue (the iced beat). */
  cool?: number;
};

export const DEFAULT_LIGHTING: Lighting = {
  keyAt: [0, 0.6, 0],
  keyAngle: 0.5,
  key: 5.0,
  fill: 0.45,
  front: 0.55,
  rim: 1.0,
  bokeh: 0.7,
  sky: 1.0,
};

const SunSpot: React.FC<{ l: Lighting }> = ({ l }) => {
  const light = useMemo(() => {
    const s = new THREE.SpotLight("#fff1d8");
    s.castShadow = true;
    s.shadow.mapSize.set(2048, 2048);
    s.shadow.bias = -0.0002;
    s.shadow.normalBias = 0.02;
    s.shadow.camera.near = 2;
    s.shadow.camera.far = 40;
    s.penumbra = 0.6;
    s.decay = 0;
    s.map = palmGoboTexture(); // leaf shade on the table (needs castShadow)
    return s;
  }, []);
  light.position.set(l.keyAt[0] - 4.5, l.keyAt[1] + 9, l.keyAt[2] - 5.5);
  light.target.position.set(...l.keyAt);
  light.target.updateMatrixWorld();
  light.angle = l.keyAngle;
  light.intensity = l.key;
  light.color.set("#fff1d8").lerp(new THREE.Color("#dff3ff"), (l.cool ?? 0) * 0.6);
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

/** Front fill follows the camera (from slightly above it), so it never throws a second visible shadow. */
const FrontFill: React.FC<{ shot: Shot2; l: Lighting }> = ({ shot, l }) => {
  const cool = l.cool ?? 0;
  const color = new THREE.Color("#fff3e4").lerp(new THREE.Color("#d8efff"), cool);
  return <directionalLight position={[shot.pos[0], shot.pos[1] + 3, shot.pos[2]]} intensity={l.front} color={color} />;
};

export const Stage: React.FC<{ f: number; shot: Shot2; light?: Lighting }> = ({ f, shot, light = DEFAULT_LIGHTING }) => (
  <>
    <Environment />
    <SunSpot l={light} />
    <hemisphereLight
      args={[new THREE.Color("#bfe9f2").lerp(new THREE.Color("#9fd8ff"), light.cool ?? 0), "#e6cfa8"]}
      intensity={light.fill}
    />
    <FrontFill shot={shot} l={light} />
    <directionalLight position={[6, 3, 4]} intensity={light.rim} color="#ffd7a0" />
    <Table />
    <Backdrop sky={light.sky} />
    <SunGlints f={f} intensity={light.bokeh} />
  </>
);
