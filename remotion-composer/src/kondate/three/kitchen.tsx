import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp01, V3 } from "../core";
import { Shot2 } from "../../golden2/shot";
import { Glow } from "../../golden2/three/fx";
import { Carrot, Chicken, EggCarton, Milk, Onion, Pepper, Tomato } from "./food";
import { floorMap, nightTexture, tileMap } from "./textures";

export { Cam } from "../../golden2/three/stage";

/**
 * The one set: a small kitchen at 7 pm. Back wall at z = -3.2 with the fridge (left), the counter run and a
 * night window; a low dining table in front under a warm pendant. Figure scale: child 1.0, parent 1.6.
 */
export const BACK_Z = -3.2;
export const FRIDGE = { x: -0.95, w: 0.9, h: 1.85, d: 0.7, front: -2.5 } as const;
export const TABLE = { x: 0.55, z: -0.75, w: 1.2, d: 0.75, h: 0.62 } as const;
const COUNTER = { x0: -0.42, x1: 2.8, h: 0.9, d: 0.6 } as const;
const PENDANT: V3 = [TABLE.x, 2.2, TABLE.z];

export type KitchenLight = {
  /** Warm pendant over the table. */
  key: number;
  fill: number;
  /** Soft frontal fill from the camera side. */
  front: number;
  /** Cool white light from inside the fridge (rises with the door). */
  fridge?: number;
};

export const KITCHEN_LIGHT: KitchenLight = { key: 4.2, fill: 0.4, front: 0.5 };

export type KitchenState = {
  /** Fridge door 0 = shut, 1 = wide open (about 105°). */
  door?: number;
  /** Hide the pepper (taken out of the fridge into the hero shot). */
  noPepper?: boolean;
  /** Plate of omurice on the table (0..1 grow). */
  omurice?: number;
};

const envScene = () => {
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
          vec3 top = vec3(0.55, 0.45, 0.36);
          vec3 mid = vec3(0.42, 0.34, 0.28);
          vec3 low = vec3(0.22, 0.16, 0.12);
          vec3 c = h > 0.0 ? mix(mid, top, h) : mix(mid, low, -h);
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  );
  scene.add(dome);
  const card = (w: number, h: number, pos: V3, color: string, power: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 1, 0);
    scene.add(m);
  };
  card(3, 3, [0, 9, 0], "#ffe2b8", 5); // pendant / ceiling
  card(6, 2, [-6, 3, 6], "#fff1dc", 1.6); // soft front-left window of the room
  card(2, 1.5, [2, 2, -8], "#6d86c8", 1.4); // the night window behind
  return scene;
};

const Environment: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const t = pmrem.fromScene(envScene(), 0, 0.1, 50).texture;
    pmrem.dispose();
    return t;
  }, [gl]);
  useLayoutEffect(() => () => env.dispose(), [env]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = 0.45;
    scene.background = new THREE.Color("#2a1d16");
    scene.fog = new THREE.Fog("#3a2a20", 14, 30);
    gl.localClippingEnabled = true;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  });
  return null;
};

const Pendant: React.FC<{ l: KitchenLight }> = ({ l }) => {
  const spot = useMemo(() => {
    const s = new THREE.SpotLight("#ffd9a8");
    s.castShadow = true;
    s.shadow.mapSize.set(2048, 2048);
    s.shadow.bias = -0.0003;
    s.shadow.normalBias = 0.02;
    s.shadow.camera.near = 0.3;
    s.shadow.camera.far = 12;
    s.penumbra = 0.85;
    s.decay = 0;
    s.angle = 1.05;
    return s;
  }, []);
  spot.position.set(PENDANT[0], PENDANT[1] - 0.05, PENDANT[2]);
  spot.target.position.set(PENDANT[0] - 0.3, 0, PENDANT[2] - 0.3);
  spot.target.updateMatrixWorld();
  spot.intensity = l.key;
  return (
    <>
      <primitive object={spot} />
      <primitive object={spot.target} />
      <mesh position={[PENDANT[0], 2.75, PENDANT[2]]}>
        <cylinderGeometry args={[0.006, 0.006, 1.0, 6]} />
        <meshStandardMaterial color="#2a2420" />
      </mesh>
      <mesh position={[PENDANT[0], PENDANT[1] + 0.12, PENDANT[2]]}>
        <coneGeometry args={[0.26, 0.24, 32, 1, true]} />
        <meshStandardMaterial color="#2f5b52" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[PENDANT[0], PENDANT[1] + 0.02, PENDANT[2]]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshBasicMaterial color={new THREE.Color("#ffe6b0").multiplyScalar(1.6)} />
      </mesh>
      <Glow pos={[PENDANT[0], PENDANT[1], PENDANT[2]]} size={1.1} color="#ffcf8a" intensity={0.35} />
    </>
  );
};

const Room: React.FC = () => {
  const floor = useMemo(() => floorMap(), []);
  const tiles = useMemo(() => tileMap(), []);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshPhysicalMaterial map={floor} color="#d9b48a" roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.35} />
      </mesh>
      {/* back wall: warm plaster, tiles behind the counter */}
      <mesh position={[0, 2, BACK_Z]} receiveShadow>
        <planeGeometry args={[14, 4]} />
        <meshStandardMaterial color="#e8d2b0" roughness={0.9} />
      </mesh>
      <mesh position={[(COUNTER.x0 + COUNTER.x1) / 2, 1.25, BACK_Z + 0.005]} receiveShadow>
        <planeGeometry args={[COUNTER.x1 - COUNTER.x0, 0.7]} />
        <meshStandardMaterial map={tiles} roughness={0.5} />
      </mesh>
      {/* left wall, angled so the corner reads */}
      <mesh position={[-2.6, 2, -1.2]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#dcc3a0" roughness={0.9} />
      </mesh>
      {/* night window */}
      <group position={[1.35, 1.72, BACK_Z + 0.01]}>
        <mesh>
          <planeGeometry args={[1.1, 0.62]} />
          <meshBasicMaterial map={nightTexture()} color={new THREE.Color(1, 1, 1).multiplyScalar(0.9)} toneMapped />
        </mesh>
        {[[0, 0.33, 1.2, 0.05], [0, -0.33, 1.2, 0.05], [-0.57, 0, 0.05, 0.7], [0.57, 0, 0.05, 0.7], [0, 0, 0.03, 0.62]].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0.02]}>
            <boxGeometry args={[w, h, 0.04]} />
            <meshStandardMaterial color="#f4ead8" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </>
  );
};

const Counter: React.FC = () => {
  const len = COUNTER.x1 - COUNTER.x0;
  const cx = (COUNTER.x0 + COUNTER.x1) / 2;
  const z = BACK_Z + COUNTER.d / 2;
  return (
    <group>
      <mesh position={[cx, COUNTER.h / 2 - 0.02, z]} castShadow receiveShadow>
        <boxGeometry args={[len, COUNTER.h - 0.04, COUNTER.d - 0.04]} />
        <meshStandardMaterial color="#5f8f86" roughness={0.6} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[COUNTER.x0 + (len / 4) * (i + 0.5), 0.5, z + COUNTER.d / 2 - 0.015]}>
          <boxGeometry args={[len / 4 - 0.04, 0.72, 0.01]} />
          <meshStandardMaterial color="#6fa096" roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[cx, COUNTER.h - 0.01, z + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[len, 0.04, COUNTER.d + 0.02]} />
        <meshPhysicalMaterial color="#efe6d6" roughness={0.3} clearcoat={0.6} />
      </mesh>
      {/* upper cabinets */}
      <mesh position={[cx + 0.9, 2.28, BACK_Z + 0.18]} castShadow>
        <boxGeometry args={[len - 1.8, 0.62, 0.36]} />
        <meshStandardMaterial color="#efe3cc" roughness={0.7} />
      </mesh>
      {/* cutting board, pan on the hob, a kettle */}
      <mesh position={[0.55, COUNTER.h + 0.015, z]} castShadow>
        <boxGeometry args={[0.5, 0.025, 0.3]} />
        <meshStandardMaterial color="#d8a66a" roughness={0.7} />
      </mesh>
      <group position={[2.15, COUNTER.h + 0.05, z]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.18, 0.08, 28]} />
          <meshPhysicalMaterial color="#2a2a2e" roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[0.36, 0.01, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
          <meshStandardMaterial color="#3a2a20" />
        </mesh>
      </group>
      <group position={[1.4, COUNTER.h + 0.12, z - 0.1]}>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 20, 14]} />
          <meshPhysicalMaterial color="#e86a4a" roughness={0.3} clearcoat={0.8} />
        </mesh>
      </group>
    </group>
  );
};

/** Fridge contents on three shelves (the camera texture shows the same layout). */
const FridgeFood: React.FC<{ noPepper?: boolean }> = ({ noPepper }) => {
  const zf = -0.12;
  return (
    <group scale={1.35} position={[0, -0.12, 0.05]}>
      <Milk pos={[-0.25, 1.4, zf]} s={1.25} />
      <EggCarton pos={[0.12, 1.4, zf]} s={1.0} />
      <Chicken pos={[-0.18, 0.98, zf]} s={1.0} />
      <Tomato pos={[0.1, 1.06, zf]} s={1.05} />
      {!noPepper && <Pepper pos={[0.28, 1.06, zf]} s={1.1} />}
      <Carrot pos={[-0.22, 0.58, zf]} s={1.1} rot={[0, 0.3, Math.PI / 2]} />
      <Carrot pos={[-0.12, 0.6, zf + 0.06]} s={1.0} rot={[0, -0.2, Math.PI / 2]} />
      <Onion pos={[0.22, 0.64, zf]} s={1.05} />
    </group>
  );
};

/** Fridge: shell with an inner light, glass shelves, and a door hinged on its left edge. */
const Fridge: React.FC<{ state: KitchenState; light: number }> = ({ state, light }) => {
  const { w, h, d } = FRIDGE;
  const doorGeo = useMemo(() => new RoundedBoxGeometry(w, h - 0.42, 0.07, 3, 0.03), [w, h]);
  const drawerGeo = useMemo(() => new RoundedBoxGeometry(w, 0.38, 0.07, 3, 0.03), [w]);
  const door = clamp01(state.door ?? 0);
  const paint = <meshPhysicalMaterial color="#f3ead6" roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.25} />;
  const zc = FRIDGE.front - d / 2;
  const t = 0.03;
  return (
    <group position={[FRIDGE.x, 0, zc]}>
      {/* shell: back, sides, top, bottom of the upper compartment */}
      <mesh position={[0, h / 2, -d / 2 + t / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial color="#eef4f5" roughness={0.6} emissive="#dff4ff" emissiveIntensity={light * 0.06} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (w - t)) / 2, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[t, h, d]} />
          {paint}
        </mesh>
      ))}
      <mesh position={[0, h - t / 2, 0]} castShadow>
        <boxGeometry args={[w, t, d]} />
        {paint}
      </mesh>
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <boxGeometry args={[w - 2 * t, 0.03, d]} />
        <meshStandardMaterial color="#eef4f5" roughness={0.5} />
      </mesh>
      {[0.92, 1.33].map((y) => (
        <mesh key={y} position={[0, y, 0]} receiveShadow>
          <boxGeometry args={[w - 2 * t, 0.012, d - 0.04]} />
          <meshPhysicalMaterial color="#cfe8f0" roughness={0.1} transmission={0.6} transparent opacity={0.7} />
        </mesh>
      ))}
      <FridgeFood noPepper={state.noPepper} />
      {/* inner light */}
      <pointLight position={[0, h - 0.18, 0.05]} color="#e8f6ff" intensity={light * 0.8} distance={2.2} decay={1.5} />
      <mesh position={[0, h - 0.06, 0]}>
        <boxGeometry args={[0.3, 0.015, 0.1]} />
        <meshBasicMaterial color={new THREE.Color("#f0faff").multiplyScalar(0.6 + light * 0.8)} />
      </mesh>
      {/* freezer drawer (shut) */}
      <mesh geometry={drawerGeo} position={[0, 0.2, d / 2 + 0.035]} castShadow>
        {paint}
      </mesh>
      <mesh position={[0, 0.34, d / 2 + 0.08]}>
        <boxGeometry args={[0.4, 0.025, 0.025]} />
        <meshPhysicalMaterial color="#c9ccd2" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* door, hinged at the left front edge */}
      <group position={[-w / 2, 0, d / 2 + 0.035]} rotation-y={-door * 1.85}>
        <mesh geometry={doorGeo} position={[w / 2, 0.42 + (h - 0.42) / 2, 0]} castShadow>
          {paint}
        </mesh>
        <mesh position={[w - 0.08, 1.15, 0.05]}>
          <boxGeometry args={[0.025, 0.42, 0.025]} />
          <meshPhysicalMaterial color="#c9ccd2" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* a child's drawing on a magnet: lived-in */}
        <mesh position={[w * 0.42, 1.45, 0.037]} rotation-z={0.06}>
          <planeGeometry args={[0.22, 0.17]} />
          <meshStandardMaterial color="#fffdf5" roughness={0.9} />
        </mesh>
        <mesh position={[w * 0.42, 1.45, 0.04]}>
          <circleGeometry args={[0.05, 16]} />
          <meshStandardMaterial color="#ffb03a" />
        </mesh>
      </group>
      <Glow pos={[0, 1.1, d / 2 + 0.25]} size={1.8} color="#dff4ff" intensity={light * 0.1} />
    </group>
  );
};

const Chair: React.FC<{ pos: V3; yaw: number }> = ({ pos, yaw }) => (
  <group position={pos} rotation-y={yaw}>
    <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.36, 0.04, 0.36]} />
      <meshStandardMaterial color="#c08a55" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.62, -0.17]} castShadow>
      <boxGeometry args={[0.36, 0.32, 0.03]} />
      <meshStandardMaterial color="#c08a55" roughness={0.6} />
    </mesh>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => (
      <mesh key={`${x}${z}`} position={[x * 0.15, 0.17, z * 0.15]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.34, 8]} />
        <meshStandardMaterial color="#8a5a32" roughness={0.6} />
      </mesh>
    ))}
  </group>
);

const Table: React.FC<{ state: KitchenState }> = ({ state }) => (
  <group position={[TABLE.x, 0, TABLE.z]}>
    <mesh position={[0, TABLE.h, 0]} castShadow receiveShadow>
      <boxGeometry args={[TABLE.w, 0.05, TABLE.d]} />
      <meshPhysicalMaterial color="#d6a774" roughness={0.45} clearcoat={0.4} />
    </mesh>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => (
      <mesh key={`${x}${z}`} position={[x * (TABLE.w / 2 - 0.08), TABLE.h / 2, z * (TABLE.d / 2 - 0.08)]} castShadow>
        <cylinderGeometry args={[0.03, 0.025, TABLE.h, 10]} />
        <meshStandardMaterial color="#9a6a3e" roughness={0.6} />
      </mesh>
    ))}
    {/* checked runner and two place mats */}
    <mesh position={[0, TABLE.h + 0.027, 0]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[TABLE.w * 0.3, TABLE.d]} />
      <meshStandardMaterial color="#e25d4a" roughness={0.8} />
    </mesh>
    <Chair pos={[-0.32, 0, -TABLE.d / 2 - 0.12]} yaw={0} />
    <Chair pos={[0.32, 0, -TABLE.d / 2 - 0.12]} yaw={0} />
    {(state.omurice ?? 0) <= 0 && (
      <mesh position={[0.25, TABLE.h + 0.035, 0.1]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.02, 24]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.3} clearcoat={0.6} />
      </mesh>
    )}
  </group>
);

const FrontFill: React.FC<{ shot: Shot2; l: KitchenLight }> = ({ shot, l }) => (
  <directionalLight position={[shot.pos[0], shot.pos[1] + 3, shot.pos[2]]} intensity={l.front} color="#ffe9d2" />
);

export const Stage: React.FC<{ shot: Shot2; light: KitchenLight; kitchen?: KitchenState }> = ({ shot, light, kitchen = {} }) => {
  const fridgeLight = light.fridge ?? clamp01((kitchen.door ?? 0) * 1.4);
  return (
    <>
      <Environment />
      <hemisphereLight args={["#ffe3c4", "#5a3d2a"]} intensity={light.fill} />
      <FrontFill shot={shot} l={light} />
      <Pendant l={light} />
      {/* cool moonlight through the window, a thin rim on the back of things */}
      <directionalLight position={[2.5, 3, -6]} intensity={0.35} color="#9fb4ff" />
      <Room />
      <Counter />
      <Fridge state={kitchen} light={fridgeLight} />
      <Table state={kitchen} />
    </>
  );
};
