import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Bubble, Layer, reveal, SAFE_CX, StepPill } from "../overlays";
import { faceTo, Figure } from "../three/figures";
import { MenuCard, Phone, Sparkles } from "../three/props";
import { SceneDefP } from "../types";
import { T_KID, T_PARENT, TABLE_CAM } from "./cams";
import { MENU } from "./step2";

// L0 at the table the parent shows the phone; the three menus float over the table; on 「選んで」 the child
// points at オムライス. L1 「なんでもいい」 above the child turns into 「これがいい！」, the child hops, the
// other two cards go and the chosen one comes forward.
const CARD_AT: V3[] = [[0.1, 1.34, -0.8], [0.55, 1.4, -0.8], [1.0, 1.34, -0.8]];
const CHOSEN_AT: V3 = [0.3, 1.5, -0.7];
const CARD_YAW = 0.17;
const handAt = (): V3 => {
  const yaw = faceTo(T_PARENT, T_KID);
  return [T_PARENT[0] + Math.sin(yaw) * 0.42, 1.02, T_PARENT[2] + Math.cos(yaw) * 0.42];
};

const shot = (b: Beat): Shot2 => {
  const t = ease(b.f, 0, b.dur, EASE.inOut);
  return breathe({ ...TABLE_CAM, pos: [TABLE_CAM.pos[0] + 0.25 - t * 0.5, TABLE_CAM.pos[1], TABLE_CAM.pos[2]] }, b.f);
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const point = ease(b.f, b.ck(0, 2) - 2, 10, EASE.out);
  const yes = b.ck(1, 1);
  const hopT = b.f - yes;
  const hop = hopT > 0 && hopT < 24 ? (hopT % 12) / 12 : 0;
  const choose = ease(b.f, yes, 14, EASE.inOut);
  const yawP = faceTo(T_PARENT, T_KID);
  return (
    <>
      <Figure kind="parent" pose={{ pos: T_PARENT, yaw: yawP, armR: 1.1, armL: 0.2, headPitch: 0.1 }} />
      <Phone pos={handAt()} rot={[-0.3, yawP, 0]} h={0.26} screen="menusSafe" />
      <Figure
        kind="kid"
        pose={{ pos: T_KID, yaw: faceTo(T_KID, CARD_AT[1]), armR: point * 1.9 * (1 - choose * 0.3), lean: point * 0.12, hop, armL: choose * 1.2 }}
      />
      {MENU.map((dish, i) => {
        const k = ease(b.f, b.ck(0, 0) + i * 5, 12, EASE.out);
        const from: V3 = [handAt()[0], handAt()[1], handAt()[2]];
        const base = lerp3(from, CARD_AT[i], k);
        const chosen = i === 1;
        const pos = chosen ? lerp3(base, CHOSEN_AT, choose) : [base[0], base[1] - choose * 0.3, base[2]] as V3;
        const fade = chosen ? 1 : 1 - choose;
        return (
          <MenuCard
            key={dish}
            dish={dish}
            pos={[pos[0], pos[1] + Math.sin(b.f / 20 + i) * 0.015, pos[2]]}
            k={k * fade}
            rot={[0, CARD_YAW, 0]}
            scale={chosen ? 0.95 + choose * 0.45 : 0.95}
            pick={chosen ? point : 0}
            safe={1 - (chosen ? point : 0)}
          />
        );
      })}
      <Sparkles center={CHOSEN_AT} f={b.f - yes} mode="burst" count={16} radius={0.5} color="#ffb25a" intensity={2 * (1 - ease(b.f, yes + 30, 20))} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const yes = b.ck(1, 1);
  const head: V3 = [T_KID[0], 1.05, T_KID[2]];
  return (
    <>
      <Layer x={SAFE_CX} y={575} k={reveal(b.f, b.ck(0, 0), b.ln(1) - 4)}>
        <StepPill n={3} text="子どもが選ぶ" />
      </Layer>
      <Bubble shot={shot} at3={head} text="なんでもいい" tone="grey" k={reveal(b.f, b.ck(1, 0) - 2, yes - 2)} dy={200} />
      <Bubble shot={shot} at3={head} text="これがいい！" tone="orange" k={reveal(b.f, yes)} dy={200} size={62} />
    </>
  );
};

export const STEP3: SceneDefP = {
  topic: "③ お子さんに選んでもらう",
  shot,
  World,
  Overlay,
  bloom: () => 0.4,
  dipIn: true,
};
