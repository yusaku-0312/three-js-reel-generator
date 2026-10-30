import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { faceTo } from "../../kyouhaku/three/figures";
import { At, Chip, Layer, NoteCard, SAFE_CX, StepPill } from "../overlays";
import { Figure, FrontDoor, LOCK_X, LOCK_Y, Phone, SAFE_TEAL } from "../three/props";
import { SceneDefP } from "../types";
import { HERO_CAM, KID_FACE, MOM_KNEEL, PAIR_CAM } from "./cams";
import { EVENING, Kid } from "./cast";

// L0 (dip) the child's phone: 「つながりません」 (grey); the front door to the right stays locked and its lock lights
// teal on 「鍵を開けない」. L1 (dip) the room: the mother crouched by a smaller child; 「助けを求めるか」 a sticky note
// 「もしものとき だれに・どうやって 助けを求める？」 over them, highlighted on 「決めておいてください」.
const inRoom = (b: Beat) => b.f >= b.ln(1) - 4;
const PHONE_AT: V3 = [-0.42, 1.25, 1.0];
const DOOR_POS: V3 = [0.12, 0.05, 0.45];
const DOOR_S = 0.95;
const LOCK: V3 = [DOOR_POS[0] + LOCK_X * DOOR_S, DOOR_POS[1] + LOCK_Y * DOOR_S, DOOR_POS[2] + 0.1];

const shot = (b: Beat): Shot2 => (inRoom(b) ? breathe(PAIR_CAM, b.f, 0.02) : breathe(HERO_CAM, b.f));

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (!inRoom(b)) {
    return (
      <>
        <FrontDoor pos={DOOR_POS} s={DOOR_S} turn={0} lockGlow={ease(b.f, b.ck(0, 3), 8, EASE.out)} glowColor={SAFE_TEAL} k={ease(b.f, b.ck(0, 1), 12, EASE.out)} />
        <Phone pos={PHONE_AT} h={1.4} rot={[0, 0.12, 0]} screen="noAnswer" glow={0.2} glowColor="#9aa0aa" />
      </>
    );
  }
  return (
    <>
      <Figure kind="mom" pose={{ pos: MOM_KNEEL, yaw: faceTo(MOM_KNEEL, KID_FACE), lean: 0.38, armR: 0.5, headPitch: 0.25 }} />
      <Kid pos={KID_FACE} yaw={faceTo(KID_FACE, MOM_KNEEL)} headPitch={-0.15} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  if (!inRoom(b)) {
    return (
      <>
        <At shot={shot} p={[PHONE_AT[0], PHONE_AT[1] + 0.9, PHONE_AT[2]]} k={ease(b.f, b.ck(0, 0), 8, EASE.out)}>
          <Chip text="つながらない" size={44} accent="#9aa0aa" />
        </At>
        <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(0, 3), 9, EASE.out)}>
          <StepPill n={2} text="確認できなければ開けない" size={44} />
        </Layer>
        <At shot={shot} p={[LOCK[0], LOCK[1] + 0.3, LOCK[2]]} k={ease(b.f, b.ck(0, 3), 8, EASE.out)}>
          <Chip text="開けない" size={42} accent={SAFE_TEAL} mark="ok" />
        </At>
      </>
    );
  }
  return (
    <>
      <Layer x={SAFE_CX} y={560} k={ease(b.f, b.ck(1, 1), 8, EASE.out) * (1 - ease(b.f, b.ck(1, 5) - 6, 6))}>
        <Chip text="一人で電話できないときも" size={46} accent={SAFE_TEAL} />
      </Layer>
      <Layer x={SAFE_CX} y={630} k={1}>
        <NoteCard
          f={b.f}
          k={ease(b.f, b.ck(1, 5), 10, EASE.out)}
          lines={[
            { text: "もしものとき", at: b.ck(1, 5) },
            { text: "だれに・どうやって", at: b.ck(1, 5) + 6, hl: b.f >= b.ck(1, 7) },
            { text: "助けを求める？", at: b.ck(1, 5) + 12, hl: b.f >= b.ck(1, 7) },
          ]}
        />
      </Layer>
    </>
  );
};

export const RULE: SceneDefP = {
  topic: "確認できないときは開けない",
  shot,
  World,
  Overlay,
  light: (b) => (inRoom(b) ? EVENING : { ...EVENING, front: 0.6, fill: 0.45 }),
  dipIn: true,
  dipLines: [1],
};
