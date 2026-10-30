import React, { useMemo } from "react";
import * as THREE from "three";
import { Beat, lerp, V3 } from "../core";
import { breathe, ease, EASE, project2, Shot2 } from "../../golden2/shot";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { LayerTag, Thump } from "../labels";
import { mixHex } from "../../royalmilk/three/liquid";
import { LatteGlass, LattePose, latteLevel, latteRadius } from "../three/latte";
import { COLOR, LATTE_DONE } from "./set";
import { SceneDefP } from "../types";

// Line 6: the finished latte seen side-on (お店によっては); its column turns into a diagram — the foam settles,
// the lower half goes tea-brown and the upper half milk-white with a dashed ring at the line (紅茶とミルクが);
// a big 1 : 1 thumps in (半分ずつ).
const GLASS: LattePose = { pos: [0, 0, 0], scale: 1, yaw: 0.35 };
const LEVEL = LATTE_DONE.level;
const HALF_Y = latteLevel(GLASS, LEVEL / 2);

const ratioShot = (b: Beat): Shot2 => breathe({ pos: [0, 1.05, 7.4], target: [0, 0.55, 0], fov: 30, focus: [0, 0.8, 0], aperture: 4 }, b.f, 0.02);

const DASHES = 30;
const DashedRing: React.FC<{ y: number; radius: number; k: number }> = ({ y, radius, k }) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff3dc").multiplyScalar(1.4), transparent: true }), []);
  mat.opacity = k;
  if (k <= 0.01) return null;
  return (
    <group position-y={y}>
      {Array.from({ length: DASHES }, (_, i) => {
        const a = (i / DASHES) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]} rotation-y={-a} material={mat} renderOrder={5}>
            <boxGeometry args={[0.012, 0.018, 0.05]} />
          </mesh>
        );
      })}
    </group>
  );
};

const RatioWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const split = ease(f, b.ck(0, 1) - 6, 18, EASE.inOut);
  const settle = ease(f, b.ck(0, 1) - 12, 16, EASE.inOut);
  const c = {
    ...LATTE_DONE,
    bottom: mixHex(LATTE_DONE.bottom, COLOR.tea, split),
    top: mixHex(LATTE_DONE.top, COLOR.milk, split),
    soft: lerp(1, 0.025, split),
    foam: (LATTE_DONE.foam ?? 0) * (1 - settle),
    dome: (LATTE_DONE.dome ?? 0) * (1 - settle),
  };
  return (
    <>
      <LatteGlass pose={GLASS} c={c} />
      <DashedRing y={HALF_Y} radius={latteRadius(GLASS, LEVEL / 2) + 0.045} k={ease(f, b.ck(0, 1) + 6, 8, EASE.out)} />
    </>
  );
};

const at = (y: number, dx: number): V3 => [GLASS.pos[0] + dx, y, GLASS.pos[2]];

const RatioOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const top = project2(shot, at(latteLevel(GLASS, LEVEL * 0.75), 0.75));
  const low = project2(shot, at(latteLevel(GLASS, LEVEL * 0.25), 0.75));
  return (
    <>
      <Layer x={SAFE_CX} y={580} k={reveal(f, b.ck(0, 0) - 2)}>
        <Chip text="お店によっては" size={52} accent="#f3c27a" />
      </Layer>
      <Layer x={Math.min(top.x + 90, 850)} y={top.y} k={reveal(f, b.ck(0, 1) + 4)} rise={0}>
        <LayerTag text="ミルク" color={COLOR.milk} />
      </Layer>
      <Layer x={Math.min(low.x + 90, 850)} y={low.y} k={reveal(f, b.ck(0, 1) + 8)} rise={0}>
        <LayerTag text="紅茶" color="#b5561c" />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={1} rise={0}>
        <Thump text="1 : 1" f={f} at={b.ck(0, 2)} size={150} />
      </Layer>
    </>
  );
};

export const RATIO: SceneDefP = {
  topic: "ミルクの量",
  shot: ratioShot,
  World: RatioWorld,
  Overlay: RatioOverlay,
  dipIn: true,
  bloom: () => 0.3,
};
