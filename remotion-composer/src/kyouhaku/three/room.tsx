import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp01, V3 } from "../core";
import { Shot2 } from "../../golden2/shot";
import { Glow } from "../../golden2/three/fx";
import { floorMap, nightTexture } from "./textures";

export { Cam } from "../../golden2/three/stage";

/**
 * The one set: a child's bedroom at night. Back wall at z = -3.2 with the window over the bed; the bed runs
 * along the back wall (long side to camera, seat edge at z = BED.front); the door is in the back wall just
 * left of the bed (it opens onto the warm hall behind), the desk and lamp further left. Keeping door and bed on
 * one wall lets a 9:16 frame hold the child and the door together. Figure scale: teen 1.3, mom 1.6, dad 1.72.
 */
export const BACK_Z = -3.2;
export const LEFT_X = -2.7;
export const BED = { x0: 0.0, x1: 1.9, z0: BACK_Z, front: -2.15, seat: 0.3 } as const;
export const DESK = { x: -2.0, w: 0.9, d: 0.55, h: 0.74 } as const;
export const DOOR = { x: -0.8, w: 0.85, h: 2.0 } as const;
const LAMP: V3 = [DESK.x + 0.25, DESK.h, BACK_Z + 0.25];

export type RoomLight = {
  /** Blue moonlight through the window. */
  moon: number;
  /** Warm desk lamp (0 = off). */
  lamp: number;
  /** Warm hall light behind the door (under the door when shut). */
  hall: number;
  fill: number;
  front: number;
  /** Cold phone-screen light on the child (its position). */
  phone?: { pos: V3; k: number; red?: number };
};

export const NIGHT: RoomLight = { moon: 0.55, lamp: 1, hall: 0.6, fill: 0.4, front: 0.5 };
export const DARK: RoomLight = { moon: 0.5, lamp: 0, hall: 0.6, fill: 0.22, front: 0.2 };

export type RoomState = {
  /** Door 0 = shut, 1 = open (about 80°, into the hall). */
  door?: number;
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
          vec3 top = vec3(0.36, 0.38, 0.5);
          vec3 mid = vec3(0.3, 0.3, 0.38);
          vec3 low = vec3(0.14, 0.12, 0.14);
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
  card(3, 3, [-4, 6, 2], "#ffe2b8", 2.2); // warm lamp side
  card(4, 2, [3, 3, -8], "#7d96d8", 1.6); // the night window
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
    scene.background = new THREE.Color("#141a2a");
    scene.fog = new THREE.Fog("#1a2034", 14, 30);
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  });
  return null;
};

const shadowSpot = (color: string) => {
  const s = new THREE.SpotLight(color);
  s.castShadow = true;
  s.shadow.mapSize.set(2048, 2048);
  s.shadow.bias = -0.0003;
  s.shadow.normalBias = 0.02;
  s.shadow.camera.near = 0.2;
  s.shadow.camera.far = 14;
  s.penumbra = 0.9;
  s.decay = 0;
  return s;
};

/** Desk lamp: a warm spot down onto the desk and bed, plus the bulb glow. */
const Lamp: React.FC<{ k: number }> = ({ k }) => {
  const spot = useMemo(() => shadowSpot("#ffcf98"), []);
  spot.position.set(LAMP[0] + 0.1, LAMP[1] + 1.1, LAMP[2] + 0.6);
  spot.target.position.set(0.5, 0, -2.2);
  spot.target.updateMatrixWorld();
  spot.angle = 1.15;
  spot.intensity = 3.2 * k;
  return (
    <>
      <primitive object={spot} />
      <primitive object={spot.target} />
      <group position={LAMP}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.03, 20]} />
          <meshStandardMaterial color="#2f5b52" roughness={0.5} />
        </mesh>
        <mesh position={[0.02, 0.22, 0]} rotation-z={-0.25}>
          <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
          <meshStandardMaterial color="#2f5b52" />
        </mesh>
        <mesh position={[0.12, 0.42, 0.04]} rotation-z={0.9}>
          <coneGeometry args={[0.1, 0.16, 24, 1, true]} />
          <meshStandardMaterial color="#2f5b52" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.15, 0.38, 0.04]}>
          <sphereGeometry args={[0.035, 12, 10]} />
          <meshBasicMaterial color={new THREE.Color("#ffe6b0").multiplyScalar(0.2 + 1.4 * k)} />
        </mesh>
        <Glow pos={[0.15, 0.36, 0.06]} size={0.8} color="#ffcf8a" intensity={0.35 * k} />
      </group>
    </>
  );
};

const Room: React.FC<{ l: RoomLight; door: number }> = ({ l, door }) => {
  const floor = useMemo(() => floorMap(), []);
  const doorGeo = useMemo(() => new RoundedBoxGeometry(DOOR.w, DOOR.h, 0.05, 2, 0.02), []);
  const hallColor = new THREE.Color("#ffc98a").multiplyScalar(0.25 + l.hall * 1.1);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshPhysicalMaterial map={floor} color="#c9a07a" roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.35} />
      </mesh>
      {/* rug under the bed edge */}
      <mesh rotation-x={-Math.PI / 2} position={[0.7, 0.003, -1.6]} receiveShadow>
        <circleGeometry args={[0.6, 40]} />
        <meshStandardMaterial color="#5f6b86" roughness={0.95} />
      </mesh>
      {/* back wall with the door opening */}
      {[
        [DOOR.x - DOOR.w / 2 - 4, 8],
        [DOOR.x + DOOR.w / 2 + 4, 8],
      ].map(([x, w], i) => (
        <mesh key={i} position={[x, 2, BACK_Z]} receiveShadow>
          <planeGeometry args={[w, 4]} />
          <meshStandardMaterial color="#aebbd6" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[DOOR.x, DOOR.h + 1, BACK_Z]}>
        <planeGeometry args={[DOOR.w, 2]} />
        <meshStandardMaterial color="#aebbd6" roughness={0.9} />
      </mesh>
      <mesh position={[LEFT_X, 2, -1.2]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#a4b2cf" roughness={0.9} />
      </mesh>
      {/* the hall behind the door: a warm lit wall */}
      <mesh position={[DOOR.x, 1.2, BACK_Z - 1.0]}>
        <planeGeometry args={[2.4, 3]} />
        <meshBasicMaterial color={hallColor} />
      </mesh>
      <pointLight position={[DOOR.x, 1.6, BACK_Z + 0.4]} color="#ffc98a" intensity={l.hall * door * 2.2} distance={4} decay={1.4} />
      {/* door frame + door, hinged at its left edge, opening into the hall */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[DOOR.x + (s * (DOOR.w + 0.06)) / 2, DOOR.h / 2, BACK_Z + 0.02]}>
          <boxGeometry args={[0.06, DOOR.h, 0.08]} />
          <meshStandardMaterial color="#f2ead8" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[DOOR.x, DOOR.h + 0.03, BACK_Z + 0.02]}>
        <boxGeometry args={[DOOR.w + 0.12, 0.06, 0.08]} />
        <meshStandardMaterial color="#f2ead8" roughness={0.6} />
      </mesh>
      <group position={[DOOR.x - DOOR.w / 2, 0, BACK_Z]} rotation-y={door * 1.4}>
        <mesh geometry={doorGeo} position={[DOOR.w / 2, DOOR.h / 2, -0.03]} castShadow>
          <meshStandardMaterial color="#f4ecdc" roughness={0.6} />
        </mesh>
        <mesh position={[DOOR.w - 0.1, 1.0, 0.0]}>
          <sphereGeometry args={[0.03, 10, 8]} />
          <meshPhysicalMaterial color="#c9a45a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      {/* light leaking under the shut door */}
      <mesh position={[DOOR.x, 0.012, BACK_Z + 0.005]}>
        <planeGeometry args={[DOOR.w - 0.06, 0.024]} />
        <meshBasicMaterial color={new THREE.Color("#ffd29a").multiplyScalar(l.hall * 2.2 * (1 - door))} />
      </mesh>
      <mesh position={[DOOR.x, 0.002, BACK_Z + 0.25]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[DOOR.w * 0.9, 0.5]} />
        <meshBasicMaterial color="#ffc98a" transparent opacity={l.hall * 0.35 * (1 - door)} />
      </mesh>
      {/* warm wash on the floor when the door is open */}
      <mesh position={[DOOR.x, 0.003, BACK_Z + 0.7]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[DOOR.w * 1.2, 1.4]} />
        <meshBasicMaterial color="#ffc98a" transparent opacity={l.hall * 0.22 * door} depthWrite={false} />
      </mesh>
      {/* night window over the bed, with curtains */}
      <group position={[0.9, 1.78, BACK_Z + 0.01]}>
        <mesh>
          <planeGeometry args={[1.1, 0.75]} />
          <meshBasicMaterial map={nightTexture()} color={new THREE.Color(1, 1, 1).multiplyScalar(0.85)} toneMapped />
        </mesh>
        {[[0, 0.4, 1.2, 0.05], [0, -0.4, 1.2, 0.05], [-0.57, 0, 0.05, 0.85], [0.57, 0, 0.05, 0.85], [0, 0, 0.03, 0.75]].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0.02]}>
            <boxGeometry args={[w, h, 0.04]} />
            <meshStandardMaterial color="#f4ead8" roughness={0.6} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.72, -0.05, 0.08]}>
            <boxGeometry args={[0.22, 1.0, 0.04]} />
            <meshStandardMaterial color="#e8c06a" roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* a poster and a shelf: a lived-in room */}
      <mesh position={[-1.95, 1.75, BACK_Z + 0.01]} rotation-z={0.03}>
        <planeGeometry args={[0.5, 0.65]} />
        <meshStandardMaterial color="#f2b04a" roughness={0.8} />
      </mesh>
      <mesh position={[-1.95, 1.7, BACK_Z + 0.015]} rotation-z={0.03}>
        <circleGeometry args={[0.15, 24]} />
        <meshStandardMaterial color="#3a6ac0" roughness={0.8} />
      </mesh>
    </>
  );
};

const Bed: React.FC = () => {
  const len = BED.x1 - BED.x0;
  const depth = BED.front - BED.z0;
  const cx = (BED.x0 + BED.x1) / 2;
  const cz = (BED.z0 + BED.front) / 2;
  const mattress = useMemo(() => new RoundedBoxGeometry(len - 0.06, 0.16, depth - 0.06, 3, 0.06), [len, depth]);
  const pillow = useMemo(() => new RoundedBoxGeometry(0.42, 0.1, 0.3, 3, 0.05), []);
  return (
    <group>
      <mesh position={[cx, 0.1, cz]} castShadow receiveShadow>
        <boxGeometry args={[len, 0.2, depth]} />
        <meshStandardMaterial color="#b98a5a" roughness={0.6} />
      </mesh>
      <mesh geometry={mattress} position={[cx, BED.seat - 0.08, cz]} castShadow receiveShadow>
        <meshStandardMaterial color="#e9eef6" roughness={0.85} />
      </mesh>
      {/* blanket over the right two-thirds */}
      <mesh position={[cx + len * 0.18, BED.seat + 0.005, cz + 0.02]} castShadow receiveShadow>
        <boxGeometry args={[len * 0.62, 0.04, depth + 0.02]} />
        <meshStandardMaterial color="#5f8fc9" roughness={0.9} />
      </mesh>
      <mesh geometry={pillow} position={[BED.x1 - 0.3, BED.seat + 0.06, cz - 0.15]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      <mesh position={[BED.x1 + 0.02, 0.5, cz]} castShadow>
        <boxGeometry args={[0.06, 0.75, depth]} />
        <meshStandardMaterial color="#b98a5a" roughness={0.6} />
      </mesh>
    </group>
  );
};

const Desk: React.FC = () => (
  <group position={[DESK.x, 0, BACK_Z + DESK.d / 2]}>
    <mesh position={[0, DESK.h, 0]} castShadow receiveShadow>
      <boxGeometry args={[DESK.w, 0.04, DESK.d]} />
      <meshPhysicalMaterial color="#d8b48a" roughness={0.45} clearcoat={0.3} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * (DESK.w / 2 - 0.03), DESK.h / 2, 0]} castShadow>
        <boxGeometry args={[0.04, DESK.h, DESK.d - 0.04]} />
        <meshStandardMaterial color="#b98a5a" roughness={0.6} />
      </mesh>
    ))}
    {/* books */}
    {[["#e25d4a", 0.05], ["#3a6ac0", 0.12], ["#f2b04a", 0.17]].map(([c, x], i) => (
      <mesh key={i} position={[-0.36 + (x as number), DESK.h + 0.12, -0.12]} castShadow>
        <boxGeometry args={[0.045, 0.22, 0.16]} />
        <meshStandardMaterial color={c as string} roughness={0.7} />
      </mesh>
    ))}
    {/* chair */}
    <group position={[0.05, 0, 0.45]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.04, 0.38]} />
        <meshStandardMaterial color="#5f8f86" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.68, 0.18]} castShadow>
        <boxGeometry args={[0.4, 0.34, 0.03]} />
        <meshStandardMaterial color="#5f8f86" roughness={0.6} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x * 0.17, 0.2, z * 0.16]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.4, 8]} />
          <meshStandardMaterial color="#3a4a48" />
        </mesh>
      ))}
    </group>
  </group>
);

const FrontFill: React.FC<{ shot: Shot2; l: RoomLight }> = ({ shot, l }) => (
  <directionalLight position={[shot.pos[0], shot.pos[1] + 3, shot.pos[2]]} intensity={l.front} color="#e8ecff" />
);

/** Cold light from the phone screen onto the child (red while the threat is on screen). */
const PhoneLight: React.FC<{ p?: RoomLight["phone"] }> = ({ p }) => {
  if (!p || p.k <= 0) return null;
  const c = new THREE.Color("#9fd8ff").lerp(new THREE.Color("#ff4a5a"), clamp01(p.red ?? 0));
  return (
    <>
      <pointLight position={p.pos} color={c} intensity={p.k * 0.5} distance={1.2} decay={1.8} />
    </>
  );
};

export const Stage: React.FC<{ shot: Shot2; light: RoomLight; room?: RoomState }> = ({ shot, light, room = {} }) => {
  const moon = useMemo(() => shadowSpot("#9fb4ff"), []);
  moon.position.set(1.1, 6.5, -4.6);
  moon.target.position.set(0.6, 0, -1.6);
  moon.target.updateMatrixWorld();
  moon.angle = 0.7;
  moon.intensity = light.moon * 2.2;
  return (
    <>
      <Environment />
      <hemisphereLight args={["#c9d4ff", "#3a2a2a"]} intensity={light.fill} />
      <FrontFill shot={shot} l={light} />
      <primitive object={moon} />
      <primitive object={moon.target} />
      <Lamp k={light.lamp} />
      <PhoneLight p={light.phone} />
      <Room l={light} door={clamp01(room.door ?? 0)} />
      <Bed />
      <Desk />
    </>
  );
};
