import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../core";

// ---------------------------------------------------------------------------
// The "tropical fruit" the aroma suggests: pineapple, mango, passion fruit half, orange slice.
// `ghost` 0 = solid, 1 = gone (the fruit turns translucent and shrinks away).
// ---------------------------------------------------------------------------

const texCache = new Map<string, THREE.CanvasTexture>();
const tex = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d") as CanvasRenderingContext2D);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
};

/** Pineapple skin: diamond eyes in gold-brown. */
const pineappleTexture = () =>
  tex("pine", 512, 512, (ctx) => {
    ctx.fillStyle = "#c98a1e";
    ctx.fillRect(0, 0, 512, 512);
    const cols = 10;
    const rows = 9;
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const x = (j + (i % 2) * 0.5) * (512 / cols);
        const y = i * (512 / rows);
        const g = ctx.createRadialGradient(x, y, 2, x, y, 30);
        g.addColorStop(0, "#5a3a0c");
        g.addColorStop(0.35, "#e0a72e");
        g.addColorStop(0.8, "#a8701a");
        g.addColorStop(1, "#6b4510");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, y - 28);
        ctx.lineTo(x + 26, y);
        ctx.lineTo(x, y + 28);
        ctx.lineTo(x - 26, y);
        ctx.closePath();
        ctx.fill();
      }
    }
  });

/** Mango skin: green shoulder blushing to red through yellow. */
const mangoTexture = () =>
  tex("mango", 64, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#d8342a");
    g.addColorStop(0.4, "#ff8a1f");
    g.addColorStop(0.75, "#ffcf3a");
    g.addColorStop(1, "#8bbf3a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 256);
  });

/** Passion fruit pulp seen from above: golden jelly with dark seeds. */
const pulpTexture = () =>
  tex("pulp", 256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "#ffd23a");
    g.addColorStop(0.8, "#f5a51a");
    g.addColorStop(0.9, "#fff1c8");
    g.addColorStop(1, "#6a2a62");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#2a1408";
    for (let i = 0; i < 70; i++) {
      const a = i * 2.39996;
      const r = 8 + Math.sqrt(i) * 11;
      ctx.beginPath();
      ctx.ellipse(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 5, 3.5, a, 0, Math.PI * 2);
      ctx.fill();
    }
  });

/** Orange slice face: rind, pith ring and juicy segments. */
const sliceTexture = () =>
  tex("slice", 256, 256, (ctx) => {
    ctx.fillStyle = "#ff8a00";
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4dc";
    ctx.beginPath();
    ctx.arc(128, 128, 116, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 10; i++) {
      const a0 = (i / 10) * Math.PI * 2 + 0.04;
      const a1 = ((i + 1) / 10) * Math.PI * 2 - 0.04;
      const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 108);
      g.addColorStop(0, "#ffd08a");
      g.addColorStop(1, "#ff9a1a");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(128 + Math.cos((a0 + a1) / 2) * 8, 128 + Math.sin((a0 + a1) / 2) * 8);
      ctx.arc(128, 128, 106, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
  });

const useFruitMats = (specs: Array<THREE.MeshPhysicalMaterialParameters>) =>
  useMemo(() => specs.map((s) => new THREE.MeshPhysicalMaterial({ roughness: 0.45, ...s })), []); // eslint-disable-line react-hooks/exhaustive-deps

/** Applies the vanishing state to a fruit's materials (pure function of `ghost`). */
const ghostly = (mats: THREE.MeshPhysicalMaterial[], ghost: number) => {
  for (const m of mats) {
    m.transparent = ghost > 0.001;
    m.opacity = 1 - ghost * 0.85;
    m.depthWrite = ghost < 0.5;
  }
};

const ghostScale = (ghost: number) => 1 - Math.pow(ghost, 2) * 0.9;

export const Pineapple: React.FC<{ pos: V3; scale?: number; yaw?: number; ghost?: number }> = ({ pos, scale = 1, yaw = 0, ghost = 0 }) => {
  const mats = useFruitMats([{ map: pineappleTexture(), roughness: 0.6 }, { color: "#3f8f3a", roughness: 0.5, side: THREE.DoubleSide }]);
  ghostly(mats, ghost);
  const s = scale * ghostScale(ghost);
  return (
    <group position={pos} rotation-y={yaw} scale={s}>
      <mesh material={mats[0]} position-y={0.5} scale={[0.36, 0.5, 0.36]} castShadow={ghost < 0.3}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2;
        const tilt = 0.25 + (i % 3) * 0.22;
        return (
          <group key={i} position-y={0.95} rotation={[0, a, 0]}>
            <mesh material={mats[1]} rotation={[0, 0, -tilt]} position-y={0.22} scale={[0.05, 0.28 + (i % 2) * 0.08, 0.012]} castShadow={ghost < 0.3}>
              <sphereGeometry args={[1, 8, 8]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const Mango: React.FC<{ pos: V3; scale?: number; yaw?: number; ghost?: number }> = ({ pos, scale = 1, yaw = 0, ghost = 0 }) => {
  const mats = useFruitMats([{ map: mangoTexture(), roughness: 0.35, clearcoat: 0.6 }]);
  ghostly(mats, ghost);
  return (
    <group position={pos} rotation={[0, yaw, 1.35]} scale={scale * ghostScale(ghost)}>
      <mesh material={mats[0]} position-x={0.24} scale={[0.27, 0.36, 0.24]} castShadow={ghost < 0.3}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
    </group>
  );
};

export const PassionHalf: React.FC<{ pos: V3; scale?: number; yaw?: number; ghost?: number }> = ({ pos, scale = 1, yaw = 0, ghost = 0 }) => {
  const mats = useFruitMats([
    { color: "#5a1f52", roughness: 0.55, clearcoat: 0.3 },
    { map: pulpTexture(), roughness: 0.15, clearcoat: 1 },
  ]);
  ghostly(mats, ghost);
  return (
    <group position={pos} rotation={[0.55, yaw, 0]} scale={scale * ghostScale(ghost)}>
      <mesh material={mats[0]} position-y={0.2} rotation-x={Math.PI} castShadow={ghost < 0.3}>
        <sphereGeometry args={[0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={mats[1]} position-y={0.201} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.215, 48]} />
      </mesh>
    </group>
  );
};

export const OrangeSlice: React.FC<{ pos: V3; scale?: number; yaw?: number; ghost?: number; lean?: number }> = ({
  pos,
  scale = 1,
  yaw = 0,
  ghost = 0,
  lean = 1.15,
}) => {
  const mats = useFruitMats([{ color: "#ff8a00", roughness: 0.4 }, { map: sliceTexture(), roughness: 0.2, clearcoat: 1 }]);
  ghostly(mats, ghost);
  return (
    <group position={pos} rotation={[lean, yaw, 0]} scale={scale * ghostScale(ghost)}>
      <mesh material={mats[0]} castShadow={ghost < 0.3}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 48]} />
      </mesh>
      {[0.026, -0.026].map((y) => (
        <mesh key={y} material={mats[1]} position-y={y} rotation-x={y > 0 ? -Math.PI / 2 : Math.PI / 2}>
          <circleGeometry args={[0.296, 48]} />
        </mesh>
      ))}
    </group>
  );
};
