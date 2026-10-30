import React from "react";
import { Beat, clamp01 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Layer, Stamp, SAFE_CX } from "../overlays";
import { Aroma, Glow, Sparkles } from "../three/fx";
import { IcedGlass, glassRim } from "../three/glass";
import { Mango, OrangeSlice, PassionHalf, Pineapple } from "../three/fruits";
import { SceneDefP } from "../types";

// Line 0: a sunny table, iced tea in the middle, tropical fruit all around, fruit-coloured scent rising.
// Line 1: 「でも実は」 the fruit glints, then vanishes one by one; the scent stays → 果物 0個.
const GLASS = { pos: [0, 0, 0] as [number, number, number] };
const RIM = glassRim(GLASS);
const FRUIT_COLORS = ["#ffd23a", "#ff8a1f", "#ff6f61", "#c45bd6"];

type FruitSpot = { kind: "pine" | "mango" | "passion" | "slice"; pos: [number, number, number]; scale: number; yaw: number };
const FRUITS: FruitSpot[] = [
  { kind: "pine", pos: [-0.85, 0, -0.75], scale: 0.95, yaw: 0.4 },
  { kind: "mango", pos: [0.82, 0, -0.5], scale: 0.85, yaw: -0.5 },
  { kind: "passion", pos: [0.62, 0, 0.6], scale: 1.0, yaw: 0.3 },
  { kind: "slice", pos: [-0.62, 0.05, 0.55], scale: 0.95, yaw: 0.6 },
  { kind: "passion", pos: [-1.05, 0, 0.1], scale: 0.85, yaw: 1.0 },
];

const ghostOf = (b: Beat, i: number) => clamp01((b.f - (b.ck(1, 1) + i * 5)) / 14);

const hookShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0, 3.6, 9.8], target: [0, 0.75, 0], fov: 30, focus: [0, 0.8, 0], aperture: 4 }],
      [0, { pos: [0, 2.9, 8.0], target: [0, 0.8, 0], fov: 30, focus: [0, 0.8, 0], aperture: 5 }, 110],
      [b.ck(1, 0), { pos: [0.15, 2.5, 7.0], target: [0, 0.85, 0], fov: 30, focus: [0, 0.85, 0], aperture: 6 }, 90],
    ]),
    b.f,
  );

const Fruit: React.FC<{ s: FruitSpot; ghost: number }> = ({ s, ghost }) => {
  const p = { pos: s.pos, scale: s.scale, yaw: s.yaw, ghost };
  if (s.kind === "pine") return <Pineapple {...p} />;
  if (s.kind === "mango") return <Mango {...p} />;
  if (s.kind === "passion") return <PassionHalf {...p} />;
  return <OrangeSlice {...p} lean={0.22} />;
};

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const glint = ease(f, b.ck(1, 0), 6, EASE.out) * (1 - ease(f, b.ck(1, 0) + 8, 14, EASE.in));
  return (
    <>
      <IcedGlass pose={GLASS} fill={0.82} f={f} ice={4} straw glow={0.35} />
      {FRUITS.map((s, i) => {
        const g = ghostOf(b, i);
        return (
          <React.Fragment key={i}>
            {g < 0.999 && <Fruit s={s} ghost={g} />}
            <Glow pos={[s.pos[0], 0.45 * s.scale, s.pos[2]]} size={0.9 * s.scale} color="#fff3c0" intensity={glint * 0.9 * (1 - g)} />
            <Sparkles center={[s.pos[0], 0.4, s.pos[2]]} f={f - (b.ck(1, 1) + i * 5 + 10)} mode="burst" count={10} radius={0.45} size={0.07} seed={40 + i} intensity={2} />
          </React.Fragment>
        );
      })}
      <Aroma from={[RIM[0], RIM[1] - 0.05, RIM[2]]} f={f} colors={FRUIT_COLORS} grow={ease(f, b.ck(0, 1) - 6, 40, EASE.out)} intensity={0.9} height={0.8} radius={0.32} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const at = b.ck(1, 2);
  return (
    <Layer x={SAFE_CX} y={700} k={1}>
      <Stamp f={b.f} at={at} top="果物" big="0個" />
    </Layer>
  );
};

export const HOOK: SceneDefP = {
  topic: "南国の香りの正体",
  shot: hookShot,
  World: HookWorld,
  Overlay: HookOverlay,
  bloom: () => 0.3,
};
