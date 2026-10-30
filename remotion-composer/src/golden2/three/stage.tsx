import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rng, V3 } from "../../golden/core";
import { backgroundTexture, woodTexture } from "../../golden/three/textures";
import { Shot2 } from "../shot";
import { bokehTexture } from "./textures";

const FOG_COLOR = "#1c0e07";

/** Points the R3F default camera at a shot; runs before ThreeCanvas advances the frame. */
export const Cam: React.FC<{ shot: Shot2 }> = ({ shot }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...shot.pos);
    camera.fov = shot.fov;
    camera.near = 0.05;
    camera.far = 60;
    camera.up.set(Math.sin(shot.roll ?? 0), Math.cos(shot.roll ?? 0), 0);
    camera.lookAt(...shot.target);
    camera.updateProjectionMatrix();
  });
  return null;
};

/** Softbox studio for reflections only: dark room, a big warm key box, a tall rim strip, a dim fill. */
const studioScene = () => {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("#2a1408").multiplyScalar(0.5), side: THREE.BackSide }),
  );
  scene.add(room);
  const box = (w: number, h: number, pos: V3, color: string, power: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0.5, 0);
    scene.add(m);
  };
  box(7, 4.5, [-7, 8, 6], "#fff1dc", 5.5); // key softbox
  box(1.4, 9, [7.5, 3.5, -7], "#ffb35c", 6); // rim strip
  box(5, 3, [8, 2, 6], "#cfe0ff", 0.7); // cool fill card
  box(10, 1.2, [0, 9.5, -4], "#ffd9a0", 2.2); // top strip for long highlights on rims
  return scene;
};

const Environment: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(studioScene(), 0.0, 0.1, 50).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    scene.background = backgroundTexture();
    scene.fog = new THREE.Fog(FOG_COLOR, 9, 24);
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
      <meshPhysicalMaterial map={map} color="#c9a48a" roughness={0.34} clearcoat={0.55} clearcoatRoughness={0.22} />
    </mesh>
  );
};

/** Café lights far behind the set; the DOF pass opens them into discs. */
const BokehLights: React.FC<{ f: number; intensity: number }> = ({ f, intensity }) => {
  const dots = useMemo(() => {
    const r = rng(23);
    return Array.from({ length: 22 }, () => ({
      x: -10 + r() * 20,
      y: 0.8 + r() * 4.2,
      z: -9.5 - r() * 3.2, // in front of the back wall (z -13)
      s: 0.2 + r() * 0.4,
      warm: r() > 0.25,
      o: 0.5 + r() * 0.5,
      ph: r() * 6.28,
    }));
  }, []);
  if (intensity <= 0) return null;
  return (
    <>
      {dots.map((d, i) => (
        <sprite key={i} position={[d.x + Math.sin(f / 120 + d.ph) * 0.15, d.y, d.z]} scale={d.s}>
          <spriteMaterial
            map={bokehTexture()}
            color={new THREE.Color(d.warm ? "#ffb04a" : "#ffe7c2").multiplyScalar(
              intensity * d.o * (0.85 + 0.15 * Math.sin(f / 45 + d.ph)),
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

/** Dim panelled wall behind the table, so camera moves read as parallax rather than a flat backdrop. */
const BackWall: React.FC = () => (
  <group position={[0, 0, -13]}>
    <mesh position={[0, 5, 0]} receiveShadow>
      <planeGeometry args={[40, 12]} />
      <meshStandardMaterial color="#3a2012" roughness={0.8} />
    </mesh>
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[-16 + i * 4, 1.6, 0.05]}>
        <boxGeometry args={[3.2, 2.6, 0.08]} />
        <meshStandardMaterial color="#47291a" roughness={0.7} />
      </mesh>
    ))}
  </group>
);

export type Lighting = {
  /** Where the key spot points (it sits up-left-front of this point). */
  keyAt: V3;
  keyAngle: number;
  key: number;
  fill: number;
  rim: number;
  bokeh: number;
};

export const DEFAULT_LIGHTING: Lighting = { keyAt: [0, 0.5, 0], keyAngle: 0.42, key: 3.0, fill: 0.45, rim: 1.5, bokeh: 0.55 };

const KeySpot: React.FC<{ l: Lighting }> = ({ l }) => {
  const light = useMemo(() => {
    const s = new THREE.SpotLight("#ffe9cc");
    s.castShadow = true;
    s.shadow.mapSize.set(2048, 2048);
    s.shadow.bias = -0.0002;
    s.shadow.normalBias = 0.015;
    s.shadow.camera.near = 2;
    s.shadow.camera.far = 30;
    s.penumbra = 0.85;
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

export const Stage: React.FC<{ f: number; light?: Lighting }> = ({ f, light = DEFAULT_LIGHTING }) => (
  <>
    <Environment />
    <KeySpot l={light} />
    <hemisphereLight args={["#ffe2bf", "#1a0c05"]} intensity={light.fill} />
    <directionalLight position={[5, 3.5, -6]} intensity={light.rim} color="#ffb060" />
    <Table />
    <BackWall />
    <BokehLights f={f} intensity={light.bokeh} />
  </>
);
