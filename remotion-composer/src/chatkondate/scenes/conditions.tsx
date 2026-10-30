import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, COL, Layer, reveal, SAFE_CX } from "../overlays";
import { Phone } from "../three/parts";
import { HERO_CAM } from "../../kondate/scenes/cams";
import { PHONE_AT, PHONE_H } from "../../kondate/scenes/hero";
import { SceneDefP } from "../types";

// L0 the phone in the middle; the conditions pop up around it one by one (家族の人数・苦手・辛さ・洗い物),
// on 「といった条件も」 they are drawn into the phone, the reply is redone for them and lights teal.
const PHONE_C = { x: SAFE_CX, y: 1050 };
const CONDS: Array<{ text: string; x: number; y: number; chunk: number; accent: string }> = [
  { text: "家族は4人", x: 330, y: 620, chunk: 0, accent: "#ffcf3f" },
  { text: "ピーマン苦手", x: 750, y: 730, chunk: 1, accent: COL.red },
  { text: "辛くしないで", x: 330, y: 1310, chunk: 2, accent: "#ff8a3d" },
  { text: "洗い物少なめ", x: 750, y: 1370, chunk: 3, accent: "#9fc2ff" },
];

const shot = (b: Beat): Shot2 => breathe(HERO_CAM, b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const absorb = ease(b.f, b.ck(0, 5), 14, EASE.in);
  const toConds = ease(b.f, b.ck(0, 5) + 10, 10, EASE.inOut);
  const glow = 0.4 + 0.8 * ease(b.f, b.ck(0, 5) + 8, 6) * (1 - ease(b.f, b.ck(0, 6) + 10, 16));
  return <Phone pos={PHONE_AT} rot={[0, Math.sin(b.f / 40) * 0.05, 0]} h={PHONE_H} screen="menus" next="conds" mix={toConds} glow={glow + absorb * 0.3} />;
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => {
  const absorb = ease(b.f, b.ck(0, 5), 14, EASE.in);
  return (
    <>
      {CONDS.map((c) => {
        const at = c.chunk === 3 ? b.ck(0, 3) : b.ck(0, c.chunk);
        const k = reveal(b.f, at - 2) * (1 - ease(b.f, b.ck(0, 5) + 10, 4));
        const x = c.x + (PHONE_C.x - c.x) * absorb;
        const y = c.y + (PHONE_C.y - c.y) * absorb;
        return (
          <Layer key={c.text} x={x} y={y} k={k}>
            <div style={{ transform: `scale(${1 - absorb * 0.7})` }}>
              <Chip text={c.text} accent={c.accent} size={46} />
            </div>
          </Layer>
        );
      })}
      <Layer x={SAFE_CX} y={600} k={reveal(b.f, b.ck(0, 6) - 2)}>
        <Chip text="条件も一緒に伝えられる" accent={COL.teal} size={50} mark="ok" />
      </Layer>
    </>
  );
};

export const CONDITIONS: SceneDefP = {
  topic: "条件も一緒に伝える",
  shot,
  World,
  Overlay,
  bloom: () => 0.45,
  dipIn: true,
};
