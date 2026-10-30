import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { teaSurface } from "../../golden2/three/models";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { C, FONT } from "../../koucha/theme";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { KURENAI } from "../labels";
import { Mug, mugSurface, SunLight, WhiteCup } from "../three/liquid";
import { DEFAULT_LIGHTING, Lighting } from "../../royalmilk/three/stage";
import { BACKLIT_SHOT } from "./color";
import { CUP, CUP_FILL, lerpLook, LOOK, MUG, MUG_FILL } from "./set";
import { SceneDefP } from "../types";

// Line 7: back to the white cup in the window light; at 紅い色を the crimson is at its brightest, then a
// slow crane up leaves room for the summary card.
const CUP_TOP = teaSurface(CUP, CUP_FILL);

const outroShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, BACKLIT_SHOT],
      [b.ck(0, 2) - 10, { pos: [0.3, 4.2, 6.6], target: [0.42, 0.2, -0.45], fov: 30, focus: CUP_TOP, aperture: 8 }, 70],
    ]),
    b.f,
    0.025,
  );

const outroLight = (): Lighting => ({ ...DEFAULT_LIGHTING, key: 2.2, rim: 2.4, bokeh: 0.25 });

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const peak = ease(f, b.ck(0, 2) - 4, 18, EASE.out);
  const look = lerpLook(LOOK.backlit, { clear: 1, glow: 0.42, ring: 1.3 }, peak);
  return (
    <>
      <SunLight target={CUP_TOP} open={1} />
      <Mug pose={MUG} fill={MUG_FILL} look={LOOK.mug} f={f} />
      <WhiteCup pose={CUP} fill={CUP_FILL} look={look} f={f} />
      <Steam base={CUP_TOP} f={f + 15} width={0.38} opacity={ease(f, b.ck(0, 1) - 6, 20)} seed={9} />
      <Steam base={mugSurface(MUG, MUG_FILL)} f={f + 50} width={0.32} opacity={0.6} seed={4} />
      <Glow pos={add3(CUP_TOP, [0, 0.05, -0.05])} size={1.6} color="#ff6a3a" intensity={0.18 + peak * 0.08} />
      <Sparkles center={add3(CUP_TOP, [0, 0.3, 0])} f={f - b.ck(0, 2)} mode="burst" count={14} radius={0.7} size={0.05} seed={71} color="#ffd0b0" intensity={2.2} />
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const at = b.ck(0, 3) - 2;
  return (
    <Layer x={SAFE_CX} y={1290} k={reveal(f, at)}>
      <div
        style={{
          width: 780,
          background: "linear-gradient(180deg, rgba(74,42,23,0.94), rgba(43,23,12,0.96))",
          border: "4px solid #f3c27a",
          borderRadius: 36,
          padding: "24px 30px 22px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 16px 40px rgba(30,12,4,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.cream }}>
          紅茶の「<span style={{ color: KURENAI, fontSize: 76 }}>紅</span>」は
        </div>
        <Headline text="淹れたお茶の色" size={78} f={f} at={at + 6} sweepAt={at + 26} />
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#f3c27a", opacity: ease(f, at + 18, 10, EASE.out) }}>
          ＝ 水色（すいしょく）
        </div>
      </div>
    </Layer>
  );
};

export const OUTRO: SceneDefP = {
  topic: "白いカップで確かめて",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  light: outroLight,
  dipIn: true,
  bloom: () => 0.36,
};
