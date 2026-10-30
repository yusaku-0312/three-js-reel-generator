import React from "react";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { COOKIE_ACCENT, PopChip, Thump } from "../labels";
import { Cookie, CookiePose, UnionFlagPick, Scent } from "../three/cookie";
import { BITE1, BITE2, CookiePlate, CUP, HERO_REST, PAIR_WIDE, TEA_TOP, TeaCup } from "./set";
import { SceneDefP } from "../types";

// Line 6: back to the pair; the bitten cookie rises off the plate and turns upright, a faint scent around it.
// Line 7 (new set through the flash): close on the cup; a Union-flag pick springs up (イギリスで), the cookie
// hangs over the cup (クッキーを), sinks halfway into the tea with a ripple (浸すと), and scent rises (香りが).
export const BITES = [BITE1, BITE2];
export const DUNK_SCALE = 0.85;
/** Upright cookie half sunk in the tea (bites down, slightly turned to show its thickness). */
export const dunkPose = (lift: number): CookiePose => ({
  pos: [TEA_TOP[0] + 0.02, TEA_TOP[1] + 0.02 + lift, TEA_TOP[2] - 0.05],
  rot: [0, -0.3, 0],
  scale: DUNK_SCALE,
});
const HOVER: CookiePose = { pos: [0.38, 0.95, -0.25], rot: [0, -0.3, 0], scale: 1 };
const FLAG_POS: V3 = [CUP.pos[0] + 0.62, 0, CUP.pos[2] - 0.45];

const PAIR_IN: Shot2 = { pos: [0, 2.9, 7.4], target: [0.05, 0.5, 0], fov: 30, focus: [0.3, 0.6, 0], aperture: 6 };
const CUP_SHOT: Shot2 = { pos: [-0.2, 2.6, 4.6], target: [TEA_TOP[0] + 0.15, 0.75, TEA_TOP[2]], fov: 30, focus: TEA_TOP, aperture: 7 };
const CUP_IN: Shot2 = { pos: [-0.25, 2.4, 4.1], target: [TEA_TOP[0] + 0.1, 0.72, TEA_TOP[2]], fov: 30, focus: TEA_TOP, aperture: 7 };

const aromaShot = (b: Beat): Shot2 => {
  if (b.f < b.ln(1) - 4) return breathe(keys2(b.f, [[0, PAIR_WIDE], [0, PAIR_IN, 110]]), b.f);
  return breathe(keys2(b.f, [[0, CUP_SHOT], [b.ck(1, 2), CUP_IN, 60]]), b.f);
};

const liftPose = (k: number): CookiePose => ({
  pos: lerp3(HERO_REST.pos, HERO.pos, k),
  rot: lerp3(HERO_REST.rot!, HERO.rot!, k) as V3,
  scale: 1,
});
const HERO = HOVER;

export const dunkAt = (b: Beat) => b.ck(1, 2) + 2;

const AromaWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  if (f < b.ln(1) - 4) {
    const k = ease(f, b.ck(0, 1) - 6, 26, EASE.inOut);
    const pose = liftPose(k);
    return (
      <>
        <TeaCup f={f} />
        <CookiePlate hero={null} />
        <Cookie pose={pose} bites={BITES} glow={k * 0.4} />
        <Scent from={add3(pose.pos, [0, 0.3, 0])} f={f} colors={["#ffd28a", "#f3b066"]} grow={ease(f, b.ck(0, 1), 40, EASE.out)} intensity={0.28} height={0.8} radius={0.2} seed={7} />
      </>
    );
  }
  const dunk = dunkAt(b);
  const hang = ease(f, b.ck(1, 1) - 4, 14, EASE.out);
  const sink = ease(f, dunk - 14, 14, EASE.in);
  const lift = lerp(0.42, 0, sink);
  return (
    <>
      <TeaCup f={f} ripple={{ t: (f - dunk) / 30, amp: 0.08 }} />
      <CookiePlate hero={null} />
      <UnionFlagPick pos={FLAG_POS} up={ease(f, b.ck(1, 0) - 2, 12, EASE.out)} f={f} />
      {hang > 0.01 && <Cookie pose={{ ...dunkPose(lift + (1 - hang) * 0.25), scale: DUNK_SCALE * hang }} bites={BITES} wet={f > dunk + 30 ? 0.5 : 0} />}
      <Scent
        from={add3(TEA_TOP, [0.02, 0.4, -0.05])}
        f={f}
        colors={["#ffd28a", "#f3b066", "#fff0c8"]}
        grow={ease(f, b.ck(1, 3) - 4, 40, EASE.out)}
        intensity={0.32}
        height={0.55}
        radius={0.22}
        seed={9}
      />
      <Sparkles center={add3(TEA_TOP, [0, 0.1, 0])} f={f - dunk} mode="burst" count={10} radius={0.35} size={0.04} seed={52} color="#ffe2b0" intensity={1.6} />
    </>
  );
};

const AromaOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0) - 2, b.ln(1) - 6)}>
        <Headline text="② 香りを引き出す" size={92} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 1) + 4} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 0) - 2, b.ck(1, 4) - 6)} rise={0}>
        <PopChip f={f} at={b.ck(1, 0) - 2} text="イギリスの実験" accent={COOKIE_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1320} k={1} rise={0}>
        <Thump text="？" f={f} at={b.ck(1, 4)} size={150} />
      </Layer>
    </>
  );
};

export const AROMA: SceneDefP = { topic: "理由② 香り", shot: aromaShot, World: AromaWorld, Overlay: AromaOverlay, dipIn: true, dipLines: [1], bloom: () => 0.34 };
