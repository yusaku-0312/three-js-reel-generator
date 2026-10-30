import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, COL, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { Pepper } from "../three/food";
import { Cross, MenuCard, Phone } from "../three/props";
import { Dish } from "../three/textures";
import { SceneDefP } from "../types";
import { dolly, HERO_CAM } from "./cams";
import { Core, CORE_AT, FoodOrbit, PHONE_AT, PHONE_H } from "./hero";

// L0 the ingredients circle the AI and are drawn in; three menu cards pop out of it (親子丼, オムライス, 野菜カレー).
// L1 「アレルギーや苦手な食べ物も伝えると」: the pepper is crossed out and drops; the cards' edges turn teal.
export const MENU: Dish[] = ["oyakodon", "omurice", "curry"];
const CARD_AT: V3[] = [[-0.52, 1.74, 1.1], [0, 1.8, 1.16], [0.52, 1.74, 1.1]];
const PEPPER_AT: V3 = [0.56, 1.12, 1.25];

const shot = (b: Beat): Shot2 => breathe(dolly(HERO_CAM, -0.05 * ease(b.f, b.ck(0, 3), 30, EASE.inOut)), b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const pull = ease(b.f, b.ck(0, 2) - 4, 14, EASE.in);
  const coreOut = ease(b.f, b.ck(0, 3) + 14, 12, EASE.inOut);
  const toMenus = ease(b.f, b.ck(0, 3), 10, EASE.inOut);
  const toSafe = ease(b.f, b.ck(1, 3), 10, EASE.inOut);
  const pepIn = ease(b.f, b.ck(1, 1) - 2, 8, EASE.out);
  const cross = ease(b.f, b.ck(1, 1) + 8, 6, EASE.out);
  const drop = ease(b.f, b.ck(1, 2), 18, EASE.in);
  return (
    <>
      <Phone
        pos={PHONE_AT}
        h={PHONE_H}
        screen={toSafe > 0 ? "menus" : "prompt"}
        next={toSafe > 0 ? "menusSafe" : "menus"}
        mix={toSafe > 0 ? toSafe : toMenus}
        glow={0.6}
      />
      <Core f={b.f} k={1 - coreOut} power={0.6 + pull * 1.6} />
      {pull < 1 && <FoodOrbit f={b.f} at={b.ck(0, 1) - 6} n={6} step={3} pull={pull} />}
      {MENU.map((dish, i) => {
        const at = b.ck(0, 3) + i * 7;
        const k = ease(b.f, at, 12, EASE.out);
        const pos = lerp3(CORE_AT, CARD_AT[i], k);
        return (
          <MenuCard key={dish} dish={dish} pos={pos} k={k} rot={[0, -CARD_AT[i][0] * 0.5, 0]} scale={1.15} safe={toSafe} dim={ease(b.f, b.ln(1), 10) * (1 - toSafe) * 0.4} />
        );
      })}
      {pepIn > 0 && drop < 1 && (
        <group>
          <Pepper pos={[PEPPER_AT[0], PEPPER_AT[1] - drop * 1.6, PEPPER_AT[2]]} s={2.4 * pepIn} rot={[drop * 2, b.f / 25, drop]} tint={cross * 0.3} />
          <Cross pos={[PEPPER_AT[0], PEPPER_AT[1] - drop * 1.6 + 0.02, PEPPER_AT[2] + 0.2]} k={cross * (1 - drop)} size={0.34} />
        </group>
      )}
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => {
  const safeAt = b.ck(1, 3);
  return (
    <>
      <Layer x={SAFE_CX} y={1345} k={reveal(b.f, b.ck(0, 4) - 4, b.ln(1) - 6)}>
        <Headline text="今ある食材で 3品" size={88} f={b.f} at={b.ck(0, 4) - 4} />
      </Layer>
      <Layer x={SAFE_CX - 150} y={1300} k={reveal(b.f, b.ck(1, 0), safeAt - 4)}>
        <Chip text="アレルギー" accent={COL.teal} size={46} />
      </Layer>
      <Layer x={SAFE_CX + 60} y={1390} k={reveal(b.f, b.ck(1, 1), safeAt - 4)}>
        <Chip text="苦手：ピーマン" accent={COL.red} size={46} mark="ng" />
      </Layer>
      <Layer x={SAFE_CX} y={1345} k={reveal(b.f, safeAt)}>
        <Chip text="伝えると さらに安心" accent={COL.teal} size={54} mark="ok" />
      </Layer>
    </>
  );
};

export const STEP2: SceneDefP = {
  topic: "② AIがメニューを提案",
  shot,
  World,
  Overlay,
  bloom: () => 0.45,
};
