import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, COL, Layer, reveal, SAFE_CX } from "../overlays";
import { AI_CYAN, DishCard } from "../three/parts";
import { Dish, MENU } from "../three/screens";
import { HERO_CAM } from "../../kondate/scenes/cams";
import { Core, CORE_AT } from "../../kondate/scenes/hero";
import { SceneDefP } from "../types";
import { FAN_AT } from "./intro";

// L0 one dish at a time: 生姜焼き pops up and is crossed out and dropped, then 焼き魚, then a "？" card wobbles
// (考え直す). On 「ChatGPTに」 it fades, the AI lights, and three menus fan out at once (まとめて).
const ONE_AT: V3 = [0, 1.55, 1.1];
const SOLO: Array<{ dish: Dish; inAt: (b: Beat) => number; noAt?: (b: Beat) => number }> = [
  { dish: "shogayaki", inAt: (b) => b.ck(0, 0) - 2, noAt: (b) => b.ck(0, 1) + 6 },
  { dish: "sakana", inAt: (b) => b.ck(0, 2) - 6, noAt: (b) => b.ck(0, 2) + 12 },
  { dish: "mystery", inAt: (b) => b.ck(0, 3) - 2 },
];
const FAN_ROW: V3[] = FAN_AT.map(([x, y, z]) => [x, y - 0.2, z]);

const shot = (b: Beat): Shot2 => breathe(HERO_CAM, b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const aiAt = b.ck(0, 4);
  const coreK = ease(b.f, aiAt - 2, 10, EASE.out);
  const coreOut = ease(b.f, b.ck(0, 5) + 12, 12, EASE.inOut);
  return (
    <>
      {SOLO.map(({ dish, inAt, noAt }, i) => {
        const k = ease(b.f, inAt(b), 10, EASE.out);
        const no = noAt ? ease(b.f, noAt(b), 6, EASE.out) : 0;
        const drop = noAt ? ease(b.f, noAt(b) + 8, 14, EASE.in) : ease(b.f, aiAt - 4, 10, EASE.in);
        if (k <= 0 || drop >= 1) return null;
        const wobble = i === 2 ? Math.sin(b.f * 0.35) * 0.18 * ease(b.f, inAt(b) + 6, 8) : 0;
        return (
          <DishCard
            key={dish}
            dish={dish}
            pos={[ONE_AT[0], ONE_AT[1] - (noAt ? drop * 1.3 : 0), ONE_AT[2]]}
            k={k * (noAt ? 1 : 1 - drop)}
            no={no}
            rot={[noAt ? drop : 0, 0, wobble + (noAt ? drop * 0.5 : 0)]}
            scale={1.5}
          />
        );
      })}
      <Core f={b.f} k={coreK * (1 - coreOut)} power={0.6 + coreK * 0.8} />
      {MENU.map((dish, i) => {
        const k = ease(b.f, b.ck(0, 5) + i * 4, 12, EASE.out);
        return (
          <DishCard
            key={dish}
            dish={dish}
            pos={lerp3(CORE_AT, FAN_ROW[i], k)}
            k={k}
            rot={[0, -FAN_ROW[i][0] * 0.5, 0]}
            scale={1.2}
            safe={ease(b.f, b.ck(0, 6), 10)}
          />
        );
      })}
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={1320} k={reveal(b.f, b.ck(0, 0), b.ck(0, 4) - 4)}>
      <Chip text="1品ずつ提案 → 断られる" accent={COL.red} size={50} />
    </Layer>
    <Layer x={SAFE_CX + 240} y={620} k={reveal(b.f, b.ck(0, 4), b.ck(0, 5) - 2)}>
      <Chip text="ChatGPT" accent={AI_CYAN} size={50} />
    </Layer>
    <Layer x={SAFE_CX} y={1320} k={reveal(b.f, b.ck(0, 5))}>
      <Chip text="候補を まとめて3品" accent={COL.teal} size={54} mark="ok" />
    </Layer>
  </>
);

export const WHY: SceneDefP = {
  topic: "候補をまとめて出してもらう",
  shot,
  World,
  Overlay,
  bloom: () => 0.45,
  dipIn: true,
};
