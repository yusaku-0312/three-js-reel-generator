import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Chip, COL, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { Figure } from "../three/figures";
import { Sparkles, TEAL } from "../three/fx";
import { PromiseCard } from "../three/props";
import { TOWN_LIGHT } from "../three/stage";
import { SceneDefP } from "../types";

// In front of home: dad, mom and the child side by side; on 「3つの約束」 three cards stand up above them.
const Y = 0.06;
export const PROMISES: Array<{ n: number; lines: string[] }> = [
  { n: 1, lines: ["合言葉"] },
  { n: 2, lines: ["自分から", "かけ直す"] },
  { n: 3, lines: ["助けを", "求める"] },
];
// The camera looks toward -x, so screen left is +z: card ① sits at the largest z.
const CARD_Z = [6.85, 6.05, 5.25];

const shot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [4.2, 4.2, 6.6], target: [-3.85, 1.1, 6.05], fov: 30, focus: [-4.0, 0.9, 6.0], aperture: 2.5 }],
      [b.ck(0, 3) - 6, { pos: [4.8, 5.2, 6.05], target: [-3.82, 1.2, 6.05], fov: 30, focus: [-3.7, 1.5, 6.0], aperture: 2.5 }, 50],
    ]),
    b.f,
  );

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const turn = ease(b.f, b.ck(0, 1), 12, EASE.inOut);
  return (
    <>
      <Figure kind="dad" pose={{ pos: [-4.2, Y, 5.25], yaw: Math.PI / 2 - 0.2 + turn * 0.25 }} />
      <Figure kind="mom" pose={{ pos: [-4.2, Y, 6.85], yaw: Math.PI / 2 + 0.2 - turn * 0.25, armL: turn * 0.3 }} />
      <Figure kind="child" pose={{ pos: [-3.85, Y, 6.05], yaw: Math.PI / 2, hop: ease(b.f, b.ck(0, 3), 10) * (1 - ease(b.f, b.ck(0, 3) + 10, 10)) }} />
      {PROMISES.map((p, i) => {
        const at = b.ck(0, 3) + i * 7;
        const k = ease(b.f, at, 14, EASE.out);
        const pos: V3 = [-3.55, 2.15 + (1 - k) * -0.4 + Math.sin(b.f / 20 + i) * 0.03, CARD_Z[i]];
        return (
          <React.Fragment key={p.n}>
            <PromiseCard pos={pos} rot={[0, Math.PI / 2, 0]} n={p.n} lines={p.lines} scale={0.72} k={k} lit={ease(b.f, at + 6, 10)} />
            <Sparkles center={pos} f={b.f - at} mode="burst" count={10} radius={0.5} size={0.08} color={TEAL} seed={20 + i} intensity={2} />
          </React.Fragment>
        );
      })}
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={650} k={Math.min(reveal(b.f, b.ck(0, 1)), 1 - ease(b.f, b.ck(0, 3) - 6, 6))}>
      <Chip text="パパさん・ママさんへ" size={50} accent={COL.teal} />
    </Layer>
    <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(0, 3))}>
      <Headline text="親子で3つの約束" size={88} f={b.f} at={b.ck(0, 3)} tone="teal" />
    </Layer>
  </>
);

export const PROMISE: SceneDefP = {
  topic: "親子で3つの約束",
  shot,
  World,
  Overlay,
  light: () => ({ ...TOWN_LIGHT, evening: 0.3, key: 3.6, fill: 0.55 }),
  bloom: () => 0.4,
  dipIn: true,
};
