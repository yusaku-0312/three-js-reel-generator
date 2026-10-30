import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Bubble } from "../overlays";
import { faceTo, Figure } from "../../kondate/three/figures";
import { DishCard, Phone, Sparkles } from "../three/parts";
import { MENU } from "../three/screens";
import { T_KID, T_PARENT, TABLE_CAM } from "../../kondate/scenes/cams";
import { SceneDefP } from "../types";

// L0 at the table: the three menus float up out of the parent's phone, the parent holds it out to the child,
// asks 「この中だったら、どれがいい？」, and on 「選んで」 the child points at オムライス (orange edge).
export const TABLE_CARDS: V3[] = [[0.1, 1.34, -0.8], [0.55, 1.4, -0.8], [1.0, 1.34, -0.8]];
export const CARD_YAW = 0.17;
export const handAt = (reach = 0.42): V3 => {
  const yaw = faceTo(T_PARENT, T_KID);
  return [T_PARENT[0] + Math.sin(yaw) * reach, 1.02, T_PARENT[2] + Math.cos(yaw) * reach];
};

export const tableShot = (b: Beat): Shot2 => {
  const t = ease(b.f, 0, b.dur, EASE.inOut);
  return breathe({ ...TABLE_CAM, pos: [TABLE_CAM.pos[0] + 0.25 - t * 0.5, TABLE_CAM.pos[1], TABLE_CAM.pos[2]] }, b.f);
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const offer = ease(b.f, b.ck(0, 1), 12, EASE.inOut);
  const point = ease(b.f, b.ck(0, 4) - 2, 10, EASE.out);
  const yawP = faceTo(T_PARENT, T_KID);
  const hand = handAt(0.42 + offer * 0.12);
  return (
    <>
      <Figure kind="parent" pose={{ pos: T_PARENT, yaw: yawP, armR: 0.9 + offer * 0.4, armL: 0.2, headPitch: 0.1, headRoll: ease(b.f, b.ck(0, 2), 8) * 0.18 }} />
      <Phone pos={hand} rot={[-0.3, yawP, 0]} h={0.26} screen="menus" />
      <Figure kind="kid" pose={{ pos: T_KID, yaw: faceTo(T_KID, TABLE_CARDS[1]), armR: point * 1.9, lean: point * 0.12, headPitch: -0.1 }} />
      {MENU.map((dish, i) => {
        const k = ease(b.f, b.ck(0, 0) + i * 5, 12, EASE.out);
        const pos = lerp3(hand, TABLE_CARDS[i], k);
        return (
          <DishCard
            key={dish}
            dish={dish}
            pos={[pos[0], pos[1] + Math.sin(b.f / 20 + i) * 0.015, pos[2]]}
            k={k}
            rot={[0, CARD_YAW, 0]}
            scale={i === 1 ? 0.95 + point * 0.15 : 0.95}
            pick={i === 1 ? point : 0}
          />
        );
      })}
      <Sparkles center={TABLE_CARDS[1]} f={b.f - b.ck(0, 4)} mode="burst" count={14} radius={0.45} color="#ffb25a" intensity={1.8 * (1 - ease(b.f, b.ck(0, 4) + 24, 16))} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const askK = Math.min(ease(b.f, b.ck(0, 2) - 2, 8, EASE.out), 1 - ease(b.f, b.dur - 8, 8, EASE.in));
  return <Bubble shot={shot} at3={[T_PARENT[0], 1.62, T_PARENT[2]]} text={"この中だったら、\nどれがいい？"} k={askK} dy={190} size={52} />;
};

export const CHOOSE: SceneDefP = {
  topic: "子どもに選んでもらう",
  shot: tableShot,
  World,
  Overlay,
  bloom: () => 0.4,
  dipIn: true,
};
