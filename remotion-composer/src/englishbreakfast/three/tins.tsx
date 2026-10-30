import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../core";
import { ContactShadow } from "../../golden2/three/models";

// Lacquered tea tins in the brand colours of the four teas, each with a cream paper band carrying its name.
// Scale 1 = 1.25 tall, like the kurenai tin; the label faces the camera at yaw 0.

export type TinKind = "earl" | "darj" | "assam" | "eb";

export const TIN_LOOK: Record<TinKind, { body: string; name: string[]; sub: string; ink: string }> = {
  earl: { body: "#4f6577", name: ["EARL GREY"], sub: "BERGAMOT", ink: "#33465a" },
  darj: { body: "#5f7f3a", name: ["DARJEELING"], sub: "HIMALAYA", ink: "#3f5a22" },
  assam: { body: "#8a3a1e", name: ["ASSAM"], sub: "MALTY · BOLD", ink: "#6a2814" },
  eb: { body: "#1d2b52", name: ["ENGLISH", "BREAKFAST"], sub: "ASSAM · CEYLON", ink: "#1d2b52" },
};

const SERIF = `"Didot", "Bodoni 72", "Times New Roman", serif`;
const labels = new Map<TinKind, THREE.CanvasTexture>();

const labelTexture = (kind: TinKind) => {
  const hit = labels.get(kind);
  if (hit) return hit;
  const look = TIN_LOOK[kind];
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 360;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "#f1e6cc";
  ctx.fillRect(0, 0, 1024, 360);
  ctx.strokeStyle = "#a07c34";
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, 996, 332);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // the front of the open cylinder is u ≈ 0.25 (x 256) after the -π/2 turn below
  const cx = 256;
  ctx.fillStyle = look.ink;
  const big = look.name.length > 1 ? 58 : 64;
  look.name.forEach((line, i) => {
    ctx.font = `bold ${big}px ${SERIF}`;
    ctx.fillText(line, cx, look.name.length > 1 ? 125 + i * 72 : 165, 290);
  });
  ctx.font = `30px ${SERIF}`;
  ctx.fillStyle = "#a07c34";
  ctx.fillText(`— ${look.sub} —`, cx, 300, 290);
  ctx.fillText("✦", cx, 50);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  labels.set(kind, tex);
  return tex;
};

const R = 0.5;
const HT = 1.25;

/** World point just above the tin's lid (for sparkles and glows). */
export const tinTop = (pos: V3, scale: number): V3 => [pos[0], pos[1] + HT * scale + 0.05, pos[2]];

/** `k` 0..1 pops the tin in; `dim` greys it back when another tin is the answer; `hop` lifts it a little. */
export const Tin: React.FC<{ kind: TinKind; pos: V3; scale?: number; yaw?: number; k?: number; dim?: number; hop?: number; glow?: number }> = ({
  kind,
  pos,
  scale = 1,
  yaw = 0,
  k = 1,
  dim = 0,
  hop = 0,
  glow = 0,
}) => {
  const look = TIN_LOOK[kind];
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({ color: look.body, metalness: 0.35, roughness: 0.32, clearcoat: 0.8 }), [look.body]);
  const label = useMemo(() => new THREE.MeshStandardMaterial({ map: labelTexture(kind), roughness: 0.7 }), [kind]);
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#c9952e", metalness: 0.35, roughness: 0.3, emissive: "#6a4a10", emissiveIntensity: 0.25 }), []);
  const shade = 1 - 0.45 * dim;
  body.color.set(look.body).multiplyScalar(shade);
  body.emissive.set(look.body);
  body.emissiveIntensity = 0.08 + glow * 0.5;
  label.color.setScalar(shade);
  label.emissive.set("#fff2d0");
  label.emissiveIntensity = glow * 0.25;
  const s = scale * k;
  if (s <= 0.002) return null;
  return (
    <>
      <ContactShadow pos={pos} radius={0.75 * s} opacity={0.8} />
      <group position={[pos[0], pos[1] + hop, pos[2]]} rotation-y={yaw} scale={s}>
        <mesh position-y={HT / 2} material={body} castShadow receiveShadow>
          <cylinderGeometry args={[R, R, HT, 64]} />
        </mesh>
        <mesh position-y={HT * 0.48} rotation-y={-Math.PI / 2} material={label}>
          <cylinderGeometry args={[R + 0.004, R + 0.004, HT * 0.5, 64, 1, true]} />
        </mesh>
        {[0.2, 0.76].map((y) => (
          <mesh key={y} position-y={HT * y} rotation-x={Math.PI / 2} material={gold}>
            <torusGeometry args={[R + 0.006, 0.014, 8, 64]} />
          </mesh>
        ))}
        {/* lid */}
        <mesh position-y={HT + 0.06} material={body} castShadow>
          <cylinderGeometry args={[R + 0.03, R + 0.03, 0.14, 64]} />
        </mesh>
        <mesh position-y={HT + 0.13} rotation-x={Math.PI / 2} material={gold}>
          <torusGeometry args={[R - 0.06, 0.016, 8, 64]} />
        </mesh>
      </group>
    </>
  );
};
