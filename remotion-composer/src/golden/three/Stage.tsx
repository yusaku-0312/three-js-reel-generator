import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { rng, Shot } from "../core";
import { backgroundTexture, glowTexture, woodTexture } from "./textures";

const FOG_COLOR = "#2e170b";

/** Points the R3F default camera at a shot; runs before ThreeCanvas advances the frame. */
export const Cam: React.FC<{ shot: Shot }> = ({ shot }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...shot.pos);
    camera.fov = shot.fov;
    camera.near = 0.05;
    camera.far = 80;
    camera.lookAt(...shot.target);
    camera.updateProjectionMatrix();
  });
  return null;
};

const Environment: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.6;
    scene.background = backgroundTexture();
    scene.fog = new THREE.Fog(FOG_COLOR, 10, 26);
    gl.localClippingEnabled = true;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

const Table: React.FC = () => {
  const map = useMemo(() => {
    const t = woodTexture();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 5);
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.001}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial map={map} roughness={0.42} metalness={0} />
    </mesh>
  );
};

/** Out-of-focus café lights far behind the set. */
const Bokeh: React.FC<{ f: number }> = ({ f }) => {
  const dots = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: 16 }, () => ({
      x: -9 + r() * 18,
      y: 1.5 + r() * 7,
      z: -11 - r() * 6,
      s: 0.8 + r() * 1.6,
      o: 0.18 + r() * 0.3,
      hue: r() > 0.3 ? "#ffb347" : "#ffe2a8",
      ph: r() * 6.28,
    }));
  }, []);
  return (
    <>
      {dots.map((d, i) => (
        <sprite key={i} position={[d.x + Math.sin(f / 90 + d.ph) * 0.2, d.y, d.z]} scale={d.s}>
          <spriteMaterial
            map={glowTexture()}
            color={d.hue}
            transparent
            opacity={d.o * (0.8 + 0.2 * Math.sin(f / 40 + d.ph))}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </sprite>
      ))}
    </>
  );
};

export const Stage: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Environment />
    <hemisphereLight args={["#ffe7c4", "#2a1408", 0.8]} />
    <directionalLight position={[-3, 6, 4]} intensity={2.4} color="#fff0da" />
    <directionalLight position={[4, 3, -5]} intensity={1.8} color="#ffb25c" />
    <Table />
    <Bokeh f={f} />
  </>
);
