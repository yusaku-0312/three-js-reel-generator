import React from "react";
import * as THREE from "three";
import { V3 } from "../core";
import { woodGrainTexture } from "./textures";

/**
 * Faceless wooden figurines (toy look, no real child depicted). Every pose value is a number the scene
 * computes from the frame: walking phase, lean, head turn/shake/nod, arm angles, crouch.
 */
export type Kind = "child" | "man" | "mom" | "dad";

export type Pose = {
  pos: V3;
  /** Facing angle around y (0 = facing +z, toward the usual camera). */
  yaw?: number;
  /** Walk cycle phase in radians; `step` scales the swing (0 = standing). */
  walk?: number;
  step?: number;
  /** Forward lean of the upper body (radians). */
  lean?: number;
  /** Head yaw offset (shake) and pitch (nod, positive = down). */
  headYaw?: number;
  headPitch?: number;
  /** Arm raise angles around x (0 = hanging, PI/2 = straight forward). */
  armL?: number;
  armR?: number;
  /** 0 = standing, 1 = crouched to a child's eye level. */
  crouch?: number;
  /** Small happy hop (0..1 sine). */
  hop?: number;
  /** Red danger tint on the whole figure (0..1). */
  tint?: number;
};

type Look = { height: number; body: string; legs: string; hat?: string; hair?: string; bag?: string; width: number };

const LOOKS: Record<Kind, Look> = {
  child: { height: 1.0, body: "#f4f1ea", legs: "#2f3b5c", hat: "#ffd23a", bag: "#d8262f", width: 0.19 },
  man: { height: 1.78, body: "#4a4f5a", legs: "#2a2d35", hat: "#1f2533", width: 0.27 },
  mom: { height: 1.6, body: "#efe0c4", legs: "#6d7c8f", hair: "#3b2a24", width: 0.24 },
  dad: { height: 1.72, body: "#3d5a80", legs: "#3a3a40", hair: "#2a2220", width: 0.27 },
};

const Wood: React.FC<{ color?: string; tint: number }> = ({ color = "#e9cfa8", tint }) => {
  const c = new THREE.Color(color).lerp(new THREE.Color("#ff3b3b"), tint * 0.35);
  return <meshPhysicalMaterial map={woodGrainTexture()} color={c} roughness={0.55} clearcoat={0.5} clearcoatRoughness={0.4} />;
};

const Cloth: React.FC<{ color: string; tint: number; rough?: number }> = ({ color, tint, rough = 0.8 }) => (
  <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color("#ff3b3b"), tint * 0.35)} roughness={rough} />
);

/** `bare`: no hat, school bag or straps, with hair (a child at home). */
export const Figure: React.FC<{ kind: Kind; pose: Pose; body?: string; bare?: boolean; children?: React.ReactNode }> = ({ kind, pose, body, bare, children }) => {
  const look = body ? { ...LOOKS[kind], body } : LOOKS[kind];
  const L: Look = bare ? { ...look, hat: undefined, bag: undefined, hair: look.hair ?? "#1c1612" } : look;
  const s = L.height;
  const tint = pose.tint ?? 0;
  const step = pose.step ?? 0;
  const ph = pose.walk ?? 0;
  const swing = Math.sin(ph) * 0.5 * step;
  const bob = Math.abs(Math.sin(ph)) * 0.035 * step * s + Math.sin((pose.hop ?? 0) * Math.PI) * 0.12 * s;
  const crouch = pose.crouch ?? 0;
  const legH = 0.42 * s;
  const hipY = legH * (1 - crouch * 0.5);
  const torsoH = 0.36 * s;
  const headR = (kind === "child" ? 0.135 : 0.11) * s;
  const w = L.width;
  const torsoR = w * 0.78;
  const shoulderX = torsoR + w * 0.2;
  return (
    <group position={[pose.pos[0], pose.pos[1] + bob, pose.pos[2]]} rotation-y={pose.yaw ?? 0}>
      {/* legs swing from the hip; crouch folds them */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * w * 0.42, hipY, 0]} rotation-x={side * swing + crouch * 1.05}>
          <mesh position={[0, -legH / 2, 0]} castShadow>
            <capsuleGeometry args={[w * 0.28, legH - w * 0.56, 4, 10]} />
            <Cloth color={L.legs} tint={tint} />
          </mesh>
          <mesh position={[0, -legH + 0.03, 0.05 * s]} castShadow>
            <boxGeometry args={[w * 0.5, 0.06 * s, 0.16 * s]} />
            <Cloth color="#2a2420" tint={tint} rough={0.6} />
          </mesh>
        </group>
      ))}
      <group position={[0, hipY, 0]} rotation-x={pose.lean ?? 0}>
        <mesh position={[0, torsoH / 2, 0]} castShadow>
          <capsuleGeometry args={[torsoR, Math.max(0.02, torsoH + torsoR * 0.4 - torsoR * 2), 6, 14]} />
          <Cloth color={L.body} tint={tint} />
        </mesh>
        {kind === "child" && !bare && (
          <>
            {/* randoseru shoulder straps and a name tag read as "front" on a faceless figure */}
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * torsoR * 0.48, torsoH * 0.55, torsoR * 0.86]} rotation-x={-0.12}>
                <boxGeometry args={[torsoR * 0.32, torsoH * 0.95, 0.02]} />
                <meshPhysicalMaterial color="#c81f28" roughness={0.4} clearcoat={0.8} />
              </mesh>
            ))}
            <mesh position={[torsoR * 0.05, torsoH * 0.62, torsoR * 0.99]}>
              <boxGeometry args={[torsoR * 0.42, torsoR * 0.26, 0.01]} />
              <meshStandardMaterial color="#ffffff" roughness={0.6} />
            </mesh>
            <mesh position={[0, torsoH * 0.98, 0]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[torsoR * 0.55, torsoR * 0.12, 8, 20]} />
              <Cloth color="#d9e6f2" tint={tint} />
            </mesh>
          </>
        )}
        {(kind !== "child" || bare) && (
          <mesh position={[0, torsoH * 0.98, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[torsoR * 0.5, torsoR * 0.14, 8, 20]} />
            <Cloth color={kind === "man" ? "#3a3f48" : L.body} tint={tint} />
          </mesh>
        )}
        {kind === "man" && (
          <mesh position={[0, torsoH * 0.98, -torsoR * 0.55]} castShadow>
            <sphereGeometry args={[torsoR * 0.75, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Cloth color="#3d424c" tint={tint} />
          </mesh>
        )}
        {L.bag && (
          <group position={[0, torsoH * 0.55, -torsoR * 1.35]}>
            <mesh castShadow>
              <boxGeometry args={[torsoR * 2.1, torsoH * 1.05, torsoR * 1.1]} />
              <meshPhysicalMaterial color={new THREE.Color(L.bag).lerp(new THREE.Color("#ff3b3b"), tint * 0.2)} roughness={0.35} clearcoat={0.9} />
            </mesh>
            <mesh position={[0, torsoH * 0.36, torsoR * 0.12]} castShadow>
              <boxGeometry args={[torsoR * 2.16, torsoH * 0.36, torsoR * 1.2]} />
              <meshPhysicalMaterial color="#b81e26" roughness={0.35} clearcoat={0.9} />
            </mesh>
          </group>
        )}
        {/* arms hang from the shoulders and swing opposite to the legs */}
        {[-1, 1].map((side) => {
          const raise = side < 0 ? pose.armL ?? 0 : pose.armR ?? 0;
          return (
            <group key={side} position={[side * shoulderX, torsoH * 0.88, 0]} rotation-x={-raise - side * swing * 0.8} rotation-z={side * 0.08}>
              <mesh position={[0, -torsoH * 0.42, 0]} castShadow>
                <capsuleGeometry args={[w * 0.22, torsoH * 0.62, 4, 10]} />
                <Cloth color={L.body} tint={tint} />
              </mesh>
              <mesh position={[0, -torsoH * 0.82, 0]} castShadow>
                <sphereGeometry args={[w * 0.24, 10, 8]} />
                <Wood tint={tint} />
              </mesh>
              {side > 0 && children}
            </group>
          );
        })}
        <group position={[0, torsoH + headR * 0.95, 0]} rotation-y={pose.headYaw ?? 0} rotation-x={pose.headPitch ?? 0}>
          <mesh castShadow>
            <sphereGeometry args={[headR, 24, 18]} />
            <Wood tint={tint} />
          </mesh>
          {L.hat && kind === "child" && (
            <group position={[0, headR * 0.25, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[headR * 1.06, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <Cloth color={L.hat} tint={tint} rough={0.6} />
              </mesh>
              <mesh position={[0, 0.0, headR * 0.15]} rotation-x={-0.08}>
                <cylinderGeometry args={[headR * 1.32, headR * 1.32, 0.012, 24, 1, false, -Math.PI / 2, Math.PI]} />
                <Cloth color={L.hat} tint={tint} rough={0.6} />
              </mesh>
            </group>
          )}
          {L.hat && kind === "man" && (
            <group position={[0, headR * 0.3, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[headR * 1.05, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <Cloth color={L.hat} tint={tint} rough={0.7} />
              </mesh>
              <mesh position={[0, 0, headR * 1.0]} rotation-x={0.25}>
                <boxGeometry args={[headR * 1.4, 0.012, headR * 0.9]} />
                <Cloth color={L.hat} tint={tint} rough={0.7} />
              </mesh>
            </group>
          )}
          {L.hair && (
            <mesh position={[0, headR * 0.12, -headR * 0.12]} castShadow>
              <sphereGeometry args={[headR * 1.08, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              <Cloth color={L.hair} tint={tint} rough={0.6} />
            </mesh>
          )}
          {kind === "mom" && (
            <mesh position={[0, headR * 0.6, -headR * 0.95]} castShadow>
              <sphereGeometry args={[headR * 0.45, 14, 10]} />
              <Cloth color={L.hair!} tint={tint} rough={0.6} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

/** Walk helper: position along a straight path with a toy-like stepping phase. */
export const walkAlong = (from: V3, to: V3, t: number, steps: number) => {
  const k = Math.min(1, Math.max(0, t));
  const pos: V3 = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k];
  const yaw = Math.atan2(to[0] - from[0], to[2] - from[2]);
  const moving = k > 0 && k < 1;
  return { pos, yaw, walk: k * steps * Math.PI, step: moving ? 1 : 0 };
};
