import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rng, V3 } from "../core";
import { Shot2 } from "../../golden2/shot";
import { bokehTexture } from "../../golden2/three/textures";
import { woodTexture } from "../../golden/three/textures";
import { cafeBackground, tileTexture } from "./textures";

export { Cam } from "../../golden2/three/stage";

const FOG = "#2a170c";

/** Café softboxes for reflections: a warm window key, a caramel rim strip, a dim cool fill. */
const cafeScene = () => {
  const scene = new THREE.Scene();
  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(20, 32, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#3a2112").multiplyScalar(0.6), side: THREE.BackSide }),
    ),
  );
  const box = (w: number, h: number, pos: V3, color: string, power: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0.5, 0);
    scene.add(m);
  };
  box(7, 4.5, [-7, 8, 6], "#fff1dc", 4.5);
  box(1.4, 9, [7.5, 3.5, -7], "#ffbf73", 4.5);
  box(5, 3, [8, 2, 6], "#d6e2ff", 0.6);
  box(10, 1.2, [0, 9.5, -4], "#ffe2b0", 2);
  return scene;
};

const Environment: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(cafeScene(), 0.0, 0.1, 50).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.45;
    scene.background = cafeBackground();
    scene.fog = new THREE.Fog(FOG, 11, 28);
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

/** Walnut counter, a touch lighter and redder than the golden-drop tea room. */
const Counter: React.FC = () => {
  const map = useMemo(() => {
    const t = woodTexture().clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshPhysicalMaterial map={map} color="#d9ab88" roughness={0.36} clearcoat={0.5} clearcoatRoughness={0.25} />
    </mesh>
  );
};

/** Cream tile backsplash with a shelf of jars; far enough back that the DOF pass softens it. */
const BackWall: React.FC = () => {
  const map = useMemo(() => {
    const t = tileTexture().clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(32, 8);
    t.needsUpdate = true;
    return t;
  }, []);
  const jars = useMemo(() => {
    const r = rng(12);
    return Array.from({ length: 14 }, (_, i) => ({
      x: -9 + i * 1.35 + (r() - 0.5) * 0.3,
      h: 0.5 + r() * 0.5,
      w: 0.22 + r() * 0.12,
      c: ["#b8722e", "#e8d7b8", "#5a3a22", "#d9a35c"][Math.floor(r() * 4)],
    }));
  }, []);
  return (
    <group position={[0, 0, -11]}>
      <mesh position={[0, 4, 0]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshStandardMaterial map={map} color="#a88a6c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.6, 0.35]}>
        <boxGeometry args={[30, 0.08, 0.7]} />
        <meshStandardMaterial color="#5a341d" roughness={0.6} />
      </mesh>
      {jars.map((j, i) => (
        <mesh key={i} position={[j.x, 2.64 + j.h / 2, 0.35]}>
          <cylinderGeometry args={[j.w, j.w, j.h, 20]} />
          <meshStandardMaterial color={j.c} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};

/** Pendant bulbs and shop lights behind the counter; the DOF pass opens them into discs. */
const BokehLights: React.FC<{ f: number; intensity: number }> = ({ f, intensity }) => {
  const dots = useMemo(() => {
    const r = rng(31);
    return Array.from({ length: 20 }, () => ({
      x: -9 + r() * 18,
      y: 1.2 + r() * 4.5,
      z: -8.5 - r() * 2,
      s: 0.22 + r() * 0.4,
      warm: r() > 0.2,
      o: 0.45 + r() * 0.55,
      ph: r() * 6.28,
    }));
  }, []);
  if (intensity <= 0) return null;
  return (
    <>
      {dots.map((d, i) => (
        <sprite key={i} position={[d.x + Math.sin(f / 120 + d.ph) * 0.12, d.y, d.z]} scale={d.s}>
          <spriteMaterial
            map={bokehTexture()}
            color={new THREE.Color(d.warm ? "#ffb85c" : "#fff0d6").multiplyScalar(intensity * d.o * (0.85 + 0.15 * Math.sin(f / 45 + d.ph)))}
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
  /** Where the warm key spot points (it sits up-left-front of this point). */
  keyAt: V3;
  keyAngle: number;
  key: number;
  fill: number;
  front: number;
  rim: number;
  bokeh: number;
};

export const DEFAULT_LIGHTING: Lighting = { keyAt: [0, 0.4, 0], keyAngle: 0.5, key: 3.2, fill: 0.42, front: 0.45, rim: 1.3, bokeh: 0.6 };

const KeySpot: React.FC<{ l: Lighting }> = ({ l }) => {
  const light = useMemo(() => {
    const s = new THREE.SpotLight("#ffe7c6");
    s.castShadow = true;
    s.shadow.mapSize.set(2048, 2048);
    s.shadow.bias = -0.0002;
    s.shadow.normalBias = 0.015;
    s.shadow.camera.near = 2;
    s.shadow.camera.far = 30;
    s.penumbra = 0.8;
    s.decay = 0;
    return s;
  }, []);
  light.position.set(l.keyAt[0] - 4.2, l.keyAt[1] + 7.5, l.keyAt[2] + 4.2);
  light.target.position.set(...l.keyAt);
  light.target.updateMatrixWorld();
  light.angle = l.keyAngle;
  light.intensity = l.key;
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

export const Stage: React.FC<{ f: number; shot: Shot2; light?: Lighting }> = ({ f, shot, light = DEFAULT_LIGHTING }) => (
  <>
    <Environment />
    <KeySpot l={light} />
    <hemisphereLight args={["#ffe6c8", "#2a150a"]} intensity={light.fill} />
    <directionalLight position={[shot.pos[0], shot.pos[1] + 3, shot.pos[2]]} intensity={light.front} color="#fff1e0" />
    <directionalLight position={[5, 3.5, -6]} intensity={light.rim} color="#ffb868" />
    <Counter />
    <BackWall />
    <BokehLights f={f} intensity={light.bokeh} />
  </>
);
