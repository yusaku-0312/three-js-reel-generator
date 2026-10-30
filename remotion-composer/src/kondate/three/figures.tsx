import React from "react";
import * as THREE from "three";
import { V3 } from "../core";
import { woodGrainTexture } from "./textures";

export { walkAlong } from "../../aimukae/three/figures";

/**
 * Faceless wooden figurines at home (same toy family as the AI防犯 reels, no real child depicted).
 * parent: cream cardigan + mustard apron; kid: orange T-shirt, navy shorts, black hair (no cap, no randoseru).
 */
export type Kind = "kid" | "parent";

export type Pose = {
  pos: V3;
  /** Facing angle around y (0 = facing +z, toward the usual camera). */
  yaw?: number;
  walk?: number;
  step?: number;
  lean?: number;
  /** Head yaw (shake), pitch (nod, positive = down) and roll (a tilt of the head: "hmm?"). */
  headYaw?: number;
  headPitch?: number;
  headRoll?: number;
  /** Arm raise around x (0 = hanging, PI/2 = straight forward); `spread` swings both arms out sideways. */
  armL?: number;
  armR?: number;
  spread?: number;
  /** Shoulders dropped (0..1): the tired "what do I cook" slump. */
  slump?: number;
  hop?: number;
};

type Look = { height: number; body: string; legs: string; hair: string; width: number; apron?: string };

const LOOKS: Record<Kind, Look> = {
  kid: { height: 1.0, body: "#ff8a3d", legs: "#2f3b5c", hair: "#221a16", width: 0.19 },
  parent: { height: 1.6, body: "#efe0c4", legs: "#6d7c8f", hair: "#3b2a24", width: 0.24, apron: "#e0a83a" },
};

const Wood: React.FC = () => <meshPhysicalMaterial map={woodGrainTexture()} color="#e9cfa8" roughness={0.55} clearcoat={0.5} clearcoatRoughness={0.4} />;
const Cloth: React.FC<{ color: string; rough?: number }> = ({ color, rough = 0.8 }) => <meshStandardMaterial color={color} roughness={rough} />;

export const Figure: React.FC<{ kind: Kind; pose: Pose; children?: React.ReactNode }> = ({ kind, pose, children }) => {
  const L = LOOKS[kind];
  const s = L.height;
  const step = pose.step ?? 0;
  const ph = pose.walk ?? 0;
  const swing = Math.sin(ph) * 0.5 * step;
  const bob = Math.abs(Math.sin(ph)) * 0.035 * step * s + Math.sin((pose.hop ?? 0) * Math.PI) * 0.14 * s;
  const legH = 0.42 * s;
  const torsoH = 0.36 * s;
  const headR = (kind === "kid" ? 0.135 : 0.11) * s;
  const w = L.width;
  const torsoR = w * 0.78;
  const slump = pose.slump ?? 0;
  const shoulderX = torsoR + w * 0.2;
  const shoulderY = torsoH * (0.88 - slump * 0.08);
  return (
    <group position={[pose.pos[0], pose.pos[1] + bob, pose.pos[2]]} rotation-y={pose.yaw ?? 0}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * w * 0.42, legH, 0]} rotation-x={side * swing}>
          <mesh position={[0, -legH / 2, 0]} castShadow>
            <capsuleGeometry args={[w * 0.28, legH - w * 0.56, 4, 10]} />
            <Cloth color={kind === "kid" ? "#f0d2b0" : L.legs} />
          </mesh>
          {kind === "kid" && (
            <mesh position={[0, -legH * 0.18, 0]} castShadow>
              <cylinderGeometry args={[w * 0.33, w * 0.33, legH * 0.42, 12]} />
              <Cloth color={L.legs} />
            </mesh>
          )}
          <mesh position={[0, -legH + 0.03, 0.05 * s]} castShadow>
            <boxGeometry args={[w * 0.5, 0.06 * s, 0.16 * s]} />
            <Cloth color={kind === "kid" ? "#f4f1ea" : "#2a2420"} rough={0.6} />
          </mesh>
        </group>
      ))}
      <group position={[0, legH, 0]} rotation-x={(pose.lean ?? 0) + slump * 0.12}>
        <mesh position={[0, torsoH / 2, 0]} castShadow>
          <capsuleGeometry args={[torsoR, Math.max(0.02, torsoH + torsoR * 0.4 - torsoR * 2), 6, 14]} />
          <Cloth color={L.body} />
        </mesh>
        {L.apron && (
          <>
            <mesh position={[0, torsoH * 0.3, torsoR * 0.9]} castShadow>
              <boxGeometry args={[torsoR * 1.3, torsoH * 1.15, 0.025]} />
              <Cloth color={L.apron} rough={0.75} />
            </mesh>
            <mesh position={[0, torsoH * 0.38, torsoR * 0.93]}>
              <boxGeometry args={[torsoR * 0.6, torsoH * 0.22, 0.02]} />
              <Cloth color="#c98f2a" rough={0.75} />
            </mesh>
          </>
        )}
        {kind === "kid" && (
          <mesh position={[0, torsoH * 0.55, torsoR * 0.98]}>
            <circleGeometry args={[torsoR * 0.3, 20]} />
            <meshStandardMaterial color="#ffe27a" roughness={0.6} />
          </mesh>
        )}
        <mesh position={[0, torsoH * 0.98, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[torsoR * 0.5, torsoR * 0.14, 8, 20]} />
          <Cloth color={L.body} />
        </mesh>
        {[-1, 1].map((side) => {
          const raise = side < 0 ? pose.armL ?? 0 : pose.armR ?? 0;
          return (
            <group
              key={side}
              position={[side * shoulderX, shoulderY, 0]}
              rotation-x={-raise - side * swing * 0.8}
              rotation-z={side * (0.08 + (pose.spread ?? 0) * 0.9)}
            >
              <mesh position={[0, -torsoH * 0.42, 0]} castShadow>
                <capsuleGeometry args={[w * 0.22, torsoH * 0.62, 4, 10]} />
                <Cloth color={L.body} />
              </mesh>
              <mesh position={[0, -torsoH * 0.82, 0]} castShadow>
                <sphereGeometry args={[w * 0.24, 10, 8]} />
                <Wood />
              </mesh>
              {side > 0 && <group position={[0, -torsoH * 0.86, 0]}>{children}</group>}
            </group>
          );
        })}
        <group
          position={[0, torsoH + headR * 0.95 - slump * 0.02, 0]}
          rotation-y={pose.headYaw ?? 0}
          rotation-x={(pose.headPitch ?? 0) + slump * 0.35}
          rotation-z={pose.headRoll ?? 0}
        >
          <mesh castShadow>
            <sphereGeometry args={[headR, 24, 18]} />
            <Wood />
          </mesh>
          <mesh position={[0, headR * 0.12, -headR * 0.12]} castShadow>
            <sphereGeometry args={[headR * 1.08, 20, 12, 0, Math.PI * 2, 0, Math.PI * (kind === "kid" ? 0.55 : 0.62)]} />
            <Cloth color={L.hair} rough={0.6} />
          </mesh>
          {kind === "parent" && (
            <mesh position={[0, headR * 0.6, -headR * 0.95]} castShadow>
              <sphereGeometry args={[headR * 0.45, 14, 10]} />
              <Cloth color={L.hair} rough={0.6} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

/** Yaw that turns a figure at `from` to face `to` (0 = facing +z). */
export const faceTo = (from: V3, to: V3) => Math.atan2(to[0] - from[0], to[2] - from[2]);

export const tint = (c: string, k: number) => new THREE.Color(c).lerp(new THREE.Color("#ffffff"), k);
