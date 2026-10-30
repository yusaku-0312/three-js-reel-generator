import React from "react";
import { add3, Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { C, FONT } from "../../koucha/theme";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { CHAI_ACCENT } from "../labels";
import { LeafHeap } from "../../kurenai/three/props";
import { UnionFlagPick } from "../../cookietea/three/cookie";
import { Crate, CRATE, CtcHeap, Kulhad, kulhadSurface } from "../three/parts";
import { CHAI_DONE, KULHAD_FILL } from "./set";
import { SceneDefP } from "../types";

// Line 8: a tea chest on the counter; a Union flag pick goes up on it (イギリスの 植民地だったころ).
// Line 9: the fine leaves glow gold (質のいい茶葉は), lift into the chest and are gone (輸出に回され); the camera
// trucks to the small heap of broken leaves left behind (残った茶葉を) and the chai beside it (おいしく飲む工夫).
const CRATE_AT: V3 = [-0.6, 0, -0.7];
const CRATE_TOP: V3 = add3(CRATE_AT, [0, CRATE.h + 0.02, 0]);
const FINE: V3 = [0.0, 0, 0.05];
const DUST: V3 = [0.75, 0, -0.05];
const CUP = { pos: [1.4, 0, -0.85] as V3, scale: 0.85 };
const CUP_TOP = kulhadSurface(CUP, KULHAD_FILL);

const historyShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-0.2, 2.5, 6.4], target: [-0.1, 0.6, -0.1], fov: 30, focus: [-0.4, 0.4, -0.2], aperture: 6 }],
      [b.ck(1, 2) - 8, { pos: [1.0, 3.3, 4.7], target: [1.0, 0.3, -0.4], fov: 30, focus: add3(DUST, [0, 0.15, 0]), aperture: 7 }, 40],
    ]),
    b.f,
  );

const HistoryWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const gold = ease(f, b.ck(1, 0), 10, EASE.out);
  const go = ease(f, b.ck(1, 1) - 2, 24, EASE.inOut);
  const glide = lerp3(FINE, CRATE_TOP, go);
  const finePos: V3 = [glide[0], 0.6 * Math.sin(go * Math.PI) + go * CRATE_TOP[1], glide[2]];
  const gone = go >= 0.98;
  const dustLight = ease(f, b.ck(1, 2), 10, EASE.out);
  const sweet = ease(f, b.ck(1, 3), 8, EASE.out) * (1 - ease(f, b.ck(1, 3) + 20, 20));
  return (
    <>
      <Crate pos={CRATE_AT} yaw={0.15} />
      <UnionFlagPick pos={add3(CRATE_TOP, [0.35, 0, 0.15])} up={0.7 * ease(f, b.ck(0, 2) - 2, 10, EASE.out)} f={f} />
      {!gone && <LeafHeap pos={finePos} radius={0.34 * (1 - go * 0.35)} height={0.15} count={110} seed={8} />}
      {!gone && <Glow pos={add3(finePos, [0, 0.2, 0])} size={1.0} color="#ffd36a" intensity={gold * 0.75 * (1 - go)} />}
      <Sparkles center={add3(FINE, [0, 0.25, 0])} f={f - b.ck(1, 0)} mode="burst" count={12} radius={0.45} size={0.05} seed={41} color="#ffe7a0" intensity={2} />
      <CtcHeap pos={DUST} radius={0.3} height={0.08} count={170} seed={11} glow={dustLight * 0.6} />
      <Glow pos={add3(DUST, [0, 0.18, 0])} size={0.8} color="#ffcf8a" intensity={dustLight * 0.3} />
      <Kulhad pose={CUP} fill={KULHAD_FILL} s={CHAI_DONE} swirl={f * 0.006} />
      <Steam base={CUP_TOP} f={f} width={0.28} opacity={0.9} seed={7} />
      <Glow pos={add3(CUP_TOP, [0, 0.3, 0])} size={1.0} color="#ffc98a" intensity={sweet * 0.7} />
      <Sparkles center={add3(CUP_TOP, [0, 0.3, 0])} f={f - b.ck(1, 3)} mode="burst" count={12} radius={0.5} size={0.05} seed={44} color="#fff0c8" intensity={2} />
    </>
  );
};

const HistoryOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const l9 = b.ln(1) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(0, 0), l9)}>
        <Chip text="煮出すようになったのは" size={48} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(0, 2) - 2, l9)}>
        <Headline text="イギリスの植民地時代" size={76} f={f} at={b.ck(0, 2) - 2} sweepAt={b.ck(0, 3) + 6} />
      </Layer>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(1, 0), b.ck(1, 2) - 4)}>
        <Chip text="質のいい茶葉は 輸出へ" size={50} accent="#ffd36a" />
      </Layer>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(1, 2))}>
        <Chip text="残った茶葉を" size={52} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(1, 3))}>
        <Headline text="煮出しておいしく" size={84} f={f} at={b.ck(1, 3)} sweepAt={b.ck(1, 3) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={1395} k={reveal(f, b.ck(1, 5))}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.cream, WebkitTextStroke: "8px #2a150a", paintOrder: "stroke fill" }}>※ 諸説あります</div>
      </Layer>
    </>
  );
};

export const HISTORY: SceneDefP = {
  topic: "煮出すのはなぜ？",
  shot: historyShot,
  World: HistoryWorld,
  Overlay: HistoryOverlay,
  dipIn: true,
  bloom: () => 0.32,
};
