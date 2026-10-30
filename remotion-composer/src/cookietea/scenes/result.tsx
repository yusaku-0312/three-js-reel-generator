import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Layer, reveal, SAFE_CX } from "../overlays";
import { COOKIE_ACCENT, DropIcon, FlameIcon, PopChip, TEA_ACCENT } from "../labels";
import { Cookie, flatCookie, Plate, Scent } from "../three/cookie";
import { CookiePlate, TEA_TOP, TeaCup } from "./set";
import { BITES, dunkPose } from "./aroma";
import { SceneDefP } from "../types";

// Line 8: two small plates side by side, a dry cookie (left, そのまま) and one whose front half soaked up tea
// (right, 浸した). At 「香りの成分が」 scent rises from both: thin, low and slow on the left; thick, tall and
// fast on the right, and more ribbons join at 「多く」.
// Line 9 (new set through the flash): the cup with the cookie standing in it; the tea glows and steams harder
// (水分と熱), scent rises from the cookie (クッキーの香りが) and fans out wide (広がりやすくなる).
const LEFT: V3 = [-0.4, 0, 0.2];
const RIGHT: V3 = [0.4, 0, 0.2];
const SMALL = 0.45;
const ON = 0.04 * SMALL;
const DRY = flatCookie([LEFT[0], ON, LEFT[2]], 0.5, 0.22, 0.78);
const WET = flatCookie([RIGHT[0], ON, RIGHT[2]], -0.3, 0.22, 0.78);

const PAIR: Shot2 = { pos: [0, 1.95, 5.7], target: [0, 0.4, 0.2], fov: 30, focus: [0, 0.2, 0.2], aperture: 5 };
const CUP_SHOT: Shot2 = { pos: [-0.2, 2.6, 4.6], target: [TEA_TOP[0] + 0.1, 0.85, TEA_TOP[2]], fov: 30, focus: TEA_TOP, aperture: 7 };
const CUP_UP: Shot2 = { pos: [-0.2, 2.95, 4.8], target: [TEA_TOP[0] + 0.1, 1.15, TEA_TOP[2]], fov: 30, focus: add3(TEA_TOP, [0, 0.4, 0]), aperture: 6 };

const resultShot = (b: Beat): Shot2 => {
  if (b.f < b.ln(1) - 4) return breathe(PAIR, b.f);
  return breathe(keys2(b.f, [[0, CUP_SHOT], [b.ck(1, 4) - 4, CUP_UP, 60]]), b.f);
};

const ResultWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  if (f < b.ln(1) - 4) {
    const start = b.ck(0, 5) - 4;
    return (
      <>
        <Plate pos={LEFT} scale={SMALL} />
        <Plate pos={RIGHT} scale={SMALL} />
        <Cookie pose={DRY} />
        <Cookie pose={WET} wet={0.5} />
        <Scent from={add3(DRY.pos, [0, 0.08, 0])} f={f * 0.5} colors={["#f3c890"]} grow={ease(f, start + 6, 90, EASE.inOut) * 0.75} intensity={0.3} height={0.5} radius={0.1} seed={3} />
        <Scent from={add3(WET.pos, [0, 0.08, 0])} f={f * 1.3} colors={["#ffd28a", "#f3b066", "#fff0c8"]} grow={ease(f, start, 22, EASE.out)} intensity={0.38} height={1.0} radius={0.18} width={0.06} seed={11} />
        <Scent from={add3(WET.pos, [0.05, 0.08, 0])} f={f * 1.3 + 40} colors={["#ffc070", "#ffe2b0", "#f0a04b"]} grow={ease(f, b.ck(0, 7) - 2, 22, EASE.out)} intensity={0.34} height={0.9} radius={0.26} width={0.06} seed={19} />
        <Sparkles center={add3(WET.pos, [0, 0.7, 0])} f={f - b.ck(0, 9)} mode="burst" count={14} radius={0.5} size={0.045} seed={61} color="#fff0c8" intensity={2} />
      </>
    );
  }
  const heat = ease(f, b.ck(1, 2) - 2, 20, EASE.out);
  const spread = ease(f, b.ck(1, 4) - 2, 40, EASE.out);
  return (
    <>
      <TeaCup f={f} glow={heat * 0.8} steam={1 + heat * 0.8} />
      <CookiePlate hero={null} />
      <Cookie pose={dunkPose(0)} bites={BITES} wet={0.5} />
      <Scent
        from={add3(TEA_TOP, [0.02, 0.4, -0.05])}
        f={f * (1 + heat * 0.4)}
        colors={["#ffd28a", "#f3b066", "#fff0c8", "#ffc070"]}
        grow={ease(f, b.ck(1, 3) - 4, 30, EASE.out)}
        intensity={0.36}
        height={0.5 + spread * 0.2}
        radius={0.18 + spread * 0.35}
        seed={13}
      />
    </>
  );
};

const Label: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div style={{ fontFamily: "Hiragino Sans, sans-serif", fontWeight: 900, fontSize: 52, color, WebkitTextStroke: "10px #2a150a", paintOrder: "stroke fill", whiteSpace: "nowrap" }}>{text}</div>
);

const ResultOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const out = b.ln(1) - 6;
  if (f < b.ln(1) - 4) {
    const l = project2(shot, [LEFT[0], 0, LEFT[2] + 0.6]);
    const r = project2(shot, [RIGHT[0], 0, RIGHT[2] + 0.6]);
    return (
      <>
        <Layer x={r.x} y={Math.min(r.y, 1340)} k={reveal(f, b.ck(0, 1) - 2, out)}>
          <Label text="浸した" color={TEA_ACCENT} />
        </Layer>
        <Layer x={l.x} y={Math.min(l.y, 1340)} k={reveal(f, b.ck(0, 3) - 2, out)}>
          <Label text="そのまま" color="#fff6e6" />
        </Layer>
        <Layer x={380} y={600} k={reveal(f, b.ck(0, 6) - 2, out)} rise={0}>
          <PopChip f={f} at={b.ck(0, 6) - 2} text="速く" accent={TEA_ACCENT} />
        </Layer>
        <Layer x={700} y={600} k={reveal(f, b.ck(0, 7) - 2, out)} rise={0}>
          <PopChip f={f} at={b.ck(0, 7) - 2} text="多く" accent={TEA_ACCENT} />
        </Layer>
      </>
    );
  }
  return (
    <>
      <Layer x={360} y={600} k={reveal(f, b.ck(1, 2) - 2)} rise={0}>
        <PopChip f={f} at={b.ck(1, 2) - 2} text="水分" accent="#8fd3ff">
          <DropIcon size={56} />
        </PopChip>
      </Layer>
      <Layer x={710} y={600} k={reveal(f, b.ck(1, 2) + 6)} rise={0}>
        <PopChip f={f} at={b.ck(1, 2) + 6} text="熱" accent="#ff8a3a">
          <FlameIcon size={56} />
        </PopChip>
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 4) - 2)} rise={0}>
        <PopChip f={f} at={b.ck(1, 4) - 2} text="香りが広がる" accent={COOKIE_ACCENT} />
      </Layer>
    </>
  );
};

export const RESULT: SceneDefP = { topic: "実験の結果", shot: resultShot, World: ResultWorld, Overlay: ResultOverlay, dipIn: true, dipLines: [1], bloom: () => 0.34 };
