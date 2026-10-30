import React from "react";
import { V3 } from "../core";
import { woodGrainTexture } from "./textures";

export { walkAlong } from "../../aimukae/three/figures";

/**
 * Faceless wooden figurines (same toy family as the other AI防犯 reels; no real child depicted).
 * teen: navy hoodie, jeans, black hair, middle-school height; mom: cream cardigan; dad: grey sweater.
 * Legs have a knee so a figure can sit on the bed (`sit` 0..1).
 */
export type Kind = "teen" | "mom" | "dad" | "friend";

export type Pose = {
  pos: V3;
  /** Facing angle around y (0 = facing +z, toward the usual camera). */
  yaw?: number;
  walk?: number;
  step?: number;
  lean?: number;
  headYaw?: number;
  headPitch?: number;
  headRoll?: number;
  /** Arm raise around x (0 = hanging, PI/2 = straight forward); `spread` swings both arms out sideways. */
  armL?: number;
  armR?: number;
  /** Arm swung out sideways around z toward a neighbour (an arm round someone's shoulder). */
  hugR?: number;
  hugL?: number;
  spread?: number;
  /** Shoulders dropped (0..1): the frightened hunch. */
  slump?: number;
  /** 0 = standing, 1 = sitting on a seat at the hip height of the figure's thigh. */
  sit?: number;
  hop?: number;
};

type Look = { height: number; body: string; legs: string; hair: string; width: number; shoes: string; hood?: boolean; long?: boolean };

const LOOKS: Record<Kind, Look> = {
  teen: { height: 1.3, body: "#2f4a8a", legs: "#3a4a66", hair: "#1c1612", width: 0.2, shoes: "#f4f1ea", hood: true },
  friend: { height: 1.28, body: "#8a8f9a", legs: "#4a4f5a", hair: "#2a2420", width: 0.2, shoes: "#f4f1ea" },
  mom: { height: 1.6, body: "#efe0c4", legs: "#6d7c8f", hair: "#3b2a24", width: 0.24, shoes: "#2a2420", long: true },
  dad: { height: 1.72, body: "#7d8794", legs: "#2f3542", hair: "#241c18", width: 0.27, shoes: "#2a2420" },
};

const Wood: React.FC = () => <meshPhysicalMaterial map={woodGrainTexture()} color="#e9cfa8" roughness={0.55} clearcoat={0.5} clearcoatRoughness={0.4} />;
const Cloth: React.FC<{ color: string; rough?: number }> = ({ color, rough = 0.8 }) => <meshStandardMaterial color={color} roughness={rough} />;

/** Hip height of a standing figure (its thigh + shin). Sitting on a seat of height h puts pos.y at h - hip. */
export const hipHeight = (kind: Kind) => 0.42 * LOOKS[kind].height;

const Leg: React.FC<{ L: Look; side: number; swing: number; sit: number }> = ({ L, side, swing, sit }) => {
  const s = L.height;
  const w = L.width;
  const seg = 0.21 * s;
  return (
    <group position={[side * w * 0.42, 0.42 * s, 0]} rotation-x={side * swing - sit * (Math.PI / 2)}>
      <mesh position={[0, -seg / 2, 0]} castShadow>
        <capsuleGeometry args={[w * 0.3, seg - w * 0.3, 4, 10]} />
        <Cloth color={L.legs} />
      </mesh>
      <group position={[0, -seg, 0]} rotation-x={sit * (Math.PI / 2)}>
        <mesh position={[0, -seg / 2, 0]} castShadow>
          <capsuleGeometry args={[w * 0.27, seg - w * 0.3, 4, 10]} />
          <Cloth color={L.legs} />
        </mesh>
        <mesh position={[0, -seg + 0.03, 0.05 * s]} castShadow>
          <boxGeometry args={[w * 0.5, 0.06 * s, 0.16 * s]} />
          <Cloth color={L.shoes} rough={0.6} />
        </mesh>
      </group>
    </group>
  );
};

export const Figure: React.FC<{ kind: Kind; pose: Pose; children?: React.ReactNode }> = ({ kind, pose, children }) => {
  const L = LOOKS[kind];
  const s = L.height;
  const step = pose.step ?? 0;
  const sit = pose.sit ?? 0;
  const ph = pose.walk ?? 0;
  const swing = Math.sin(ph) * 0.5 * step;
  const bob = Math.abs(Math.sin(ph)) * 0.035 * step * s + Math.sin((pose.hop ?? 0) * Math.PI) * 0.14 * s;
  const legH = 0.42 * s;
  const torsoH = 0.36 * s;
  const headR = (kind === "teen" || kind === "friend" ? 0.12 : 0.11) * s;
  const w = L.width;
  const torsoR = w * 0.78;
  const slump = pose.slump ?? 0;
  const shoulderX = torsoR + w * 0.2;
  const shoulderY = torsoH * (0.88 - slump * 0.08);
  return (
    <group position={[pose.pos[0], pose.pos[1] + bob, pose.pos[2]]} rotation-y={pose.yaw ?? 0}>
      {[-1, 1].map((side) => (
        <Leg key={side} L={L} side={side} swing={swing} sit={sit} />
      ))}
      <group position={[0, legH, 0]} rotation-x={(pose.lean ?? 0) + slump * 0.22}>
        <mesh position={[0, torsoH / 2, 0]} castShadow>
          <capsuleGeometry args={[torsoR, Math.max(0.02, torsoH + torsoR * 0.4 - torsoR * 2), 6, 14]} />
          <Cloth color={L.body} />
        </mesh>
        {L.hood && (
          <>
            <mesh position={[0, torsoH * 0.95, -torsoR * 0.55]} rotation-x={-0.5} castShadow>
              <torusGeometry args={[torsoR * 0.55, torsoR * 0.22, 8, 20, Math.PI]} />
              <Cloth color={L.body} />
            </mesh>
            <mesh position={[0, torsoH * 0.32, torsoR * 0.95]}>
              <boxGeometry args={[torsoR * 1.0, torsoH * 0.22, 0.03]} />
              <Cloth color="#26407a" />
            </mesh>
          </>
        )}
        {kind === "mom" && (
          <mesh position={[0, torsoH * 0.45, torsoR * 0.96]}>
            <boxGeometry args={[torsoR * 0.12, torsoH * 0.85, 0.02]} />
            <Cloth color="#d9c6a4" />
          </mesh>
        )}
        <mesh position={[0, torsoH * 0.98, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[torsoR * 0.5, torsoR * 0.14, 8, 20]} />
          <Cloth color={L.body} />
        </mesh>
        {[-1, 1].map((side) => {
          const raise = side < 0 ? pose.armL ?? 0 : pose.armR ?? 0;
          const hug = side > 0 ? pose.hugR ?? 0 : -(pose.hugL ?? 0);
          return (
            <group
              key={side}
              position={[side * shoulderX, shoulderY, 0]}
              rotation-x={-raise - side * swing * 0.8}
              rotation-z={side * (0.08 + (pose.spread ?? 0) * 0.9) + hug}
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
          rotation-x={(pose.headPitch ?? 0) + slump * 0.45}
          rotation-z={pose.headRoll ?? 0}
        >
          <mesh castShadow>
            <sphereGeometry args={[headR, 24, 18]} />
            <Wood />
          </mesh>
          <mesh position={[0, headR * 0.12, -headR * 0.12]} castShadow>
            <sphereGeometry args={[headR * 1.08, 20, 12, 0, Math.PI * 2, 0, Math.PI * (L.long ? 0.68 : 0.55)]} />
            <Cloth color={L.hair} rough={0.6} />
          </mesh>
          {L.long && (
            <mesh position={[0, -headR * 0.35, -headR * 0.55]} castShadow>
              <capsuleGeometry args={[headR * 0.7, headR * 0.6, 4, 12]} />
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
