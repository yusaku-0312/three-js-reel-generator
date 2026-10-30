import React from "react";
import { add3, Beat, lerp, V3 } from "../core";
import { ease, EASE, Shot2 } from "../../golden2/shot";
import { C, FONT } from "../../koucha/theme";
import { Dot, Headline, Kicker, Layer, reveal, SAFE_CX } from "../overlays";
import { Aroma, Glow, Sparkles } from "../three/fx";
import { Flower } from "../three/flowers";
import { glassRim, IcedGlass } from "../three/glass";
import { FLOWER_KINDS, PETAL_HEX } from "../three/props";
import { SceneDefP } from "../types";

// Hero glass with petals afloat and the four flowers behind; the scent drifts toward the lens on
// 「まず香りから」, then the summary card holds.
const GLASS = { pos: [0, 0, 0] as V3 };
const RIM = glassRim(GLASS);
const BACK: Array<[number, number]> = [[-0.95, -0.85], [-0.4, -1.25], [0.45, -1.2], [1.0, -0.8]];

const cardAt = (b: Beat) => b.ck(0, 2) - 6;

const outroShot = (b: Beat): Shot2 => {
  const k = ease(b.f, 0, cardAt(b) + 30, EASE.cam);
  const a = lerp(-0.42, 0.1, k);
  const r = lerp(8.6, 8.0, k);
  return { pos: [Math.sin(a) * r, 2.6, Math.cos(a) * r], target: [0, 0.68, -0.3], fov: 31, focus: add3(GLASS.pos, [0, 1.0, 0]), aperture: 5 };
};

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const toLens = ease(f, b.ck(0, 1) - 4, 40, EASE.inOut);
  const shot = outroShot(b);
  const lens: V3 = [shot.pos[0] * 0.3, 2.0, shot.pos[2] * 0.3];
  return (
    <>
      <IcedGlass pose={GLASS} fill={0.84} f={f} ice={4} petals={22} glow={0.6} />
      {FLOWER_KINDS.map((k, i) => (
        <Flower key={k} kind={k} pos={[BACK[i][0], 0, BACK[i][1]]} stem={0.75 + (i % 2) * 0.2} scale={0.8} bloom={1} f={f} face={0.5} seed={i + 4} />
      ))}
      <Aroma
        from={add3(RIM, [0, -0.05, 0])}
        f={f}
        colors={PETAL_HEX}
        grow={ease(f, 0, 30, EASE.out)}
        intensity={1.1 - toLens * 0.4}
        height={1.4}
        radius={0.35}
        to={toLens > 0.01 ? lens : undefined}
        seed={12}
      />
      <Glow pos={[0, 0.9, -0.25]} size={1.2} color="#ff9a2a" intensity={0.1} />
      <Sparkles center={add3(RIM, [0, 0.3, 0])} f={f + 30} mode="rise" count={16} radius={0.5} size={0.05} seed={95} color="#fff2c0" intensity={1.8} />
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const at = cardAt(b);
  const k = reveal(f, at);
  return (
    <Layer x={SAFE_CX} y={1262} k={k}>
      <div
        style={{
          background: "linear-gradient(180deg, rgba(14,96,105,0.92), rgba(7,56,62,0.94))",
          border: "4px solid #ffd86b",
          borderRadius: 36,
          padding: "26px 44px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 16px 40px rgba(0,40,45,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <Kicker text="SUMMARY" f={f} at={at} size={30} color="#bdf3f0" />
        <Headline text="パラダイスティー" size={78} f={f} at={at + 2} sweepAt={at + 20} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.cream }}>
          ＝ 紅茶 ＋ 4種の花
          <div style={{ display: "flex", gap: 6 }}>
            {PETAL_HEX.map((c) => (
              <Dot key={c} color={c} size={22} />
            ))}
          </div>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: "#ffd86b", opacity: ease(f, at + 12, 10, EASE.out) }}>
          まずは香りから楽しもう
        </div>
        <div style={{ alignSelf: "flex-start", marginTop: 6, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: "#b9e0dc" }}>
          ※AI制作のアニメーションです
        </div>
      </div>
    </Layer>
  );
};

export const OUTRO: SceneDefP = {
  topic: "まずは香りから",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
  bloom: () => 0.4,
};
