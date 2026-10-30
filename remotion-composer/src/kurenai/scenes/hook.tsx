import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { BROWN, KouchaTitle, SwatchChip } from "../labels";
import { Mug, mugSurface, MugPose } from "../three/liquid";
import { LOOK, MUG_FILL } from "./set";
import { SceneDefP } from "../types";

// Line 0: a mug of tea that reads brown (茶色の紅茶ですが); the word 紅茶 rises above it and only 紅 turns
// crimson (「紅」という漢字を), a brush line underlines it, then a ？ pops (理由があります).
const HERO: MugPose = { pos: [0, 0, 0], scale: 1.05, yaw: -0.6 };
const TOP = mugSurface(HERO, MUG_FILL);

const hookShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0, 4.4, 6.4], target: [0, 0.45, 0], fov: 30, focus: TOP, aperture: 6 }],
      [0, { pos: [0, 4.2, 6.0], target: [0, 0.45, 0], fov: 30, focus: TOP, aperture: 7 }, 170],
    ]),
    b.f,
  );

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const brown = ease(f, b.ck(0, 1) - 2, 10, EASE.out) * (1 - ease(f, b.ck(0, 2), 14, EASE.in));
  return (
    <>
      <Mug pose={HERO} fill={MUG_FILL} look={LOOK.mug} f={f} />
      <Steam base={TOP} f={f + 40} width={0.4} opacity={1} seed={4} />
      <Glow pos={add3(TOP, [0, 0.1, 0])} size={1.3} color="#c98a52" intensity={brown * 0.35} />
      <Sparkles center={add3(TOP, [0, 0.6, 0])} f={f - b.ck(0, 4)} mode="burst" count={12} radius={0.6} size={0.05} seed={12} color="#ffd9b0" intensity={2} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const mug = project2(shot, add3(TOP, [0.62, 0.15, 0]));
  const q = ease(f, b.ck(0, 4), 8, EASE.out);
  return (
    <>
      <Layer x={Math.min(mug.x + 60, 800)} y={mug.y - 40} k={reveal(f, b.ck(0, 1) - 2, b.ck(0, 2) + 10)}>
        <SwatchChip text="茶色？" color={BROWN} size={54} />
      </Layer>
      <Layer x={SAFE_CX - 30} y={585} k={reveal(f, b.ck(0, 2) - 4)} rise={0}>
        <KouchaTitle f={f} at={b.ck(0, 2) - 4} redAt={b.ck(0, 2) + 6} lineAt={b.ck(0, 3)} size={200} />
      </Layer>
      {q > 0 && (
        <div style={{ position: "absolute", left: 760, top: 470, transform: `scale(${0.6 + 0.4 * q}) rotate(${(1 - q) * 20 + 8}deg)`, opacity: q }}>
          <Headline text="？" size={170} f={f} at={b.ck(0, 4) - 8} />
        </div>
      )}
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "茶色なのに「紅」？",
  shot: hookShot,
  World: HookWorld,
  Overlay: HookOverlay,
  bloom: () => 0.32,
};
