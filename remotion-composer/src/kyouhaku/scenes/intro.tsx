import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, Headline, Layer, SAFE_CX } from "../overlays";
import { faceTo, Figure } from "../three/figures";
import { SceneDefP } from "../types";
import { DAD_DOOR, MOM_DOOR, ROOM_CAM, TEEN_SIT } from "./cams";
import { phoneNight, TeenOnBed } from "./cast";
import { span } from "./util";

// L0 the door opens onto the warm hall: mom just inside, dad behind her; the desk lamp comes on and the
// child turns toward them. 「パパさん・ママさんへ」, then 「一人で解決しようとしない」.
const openAt = 2;
const shot = (b: Beat): Shot2 => breathe(ROOM_CAM, b.f, 0.03);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const turn = ease(b.f, openAt + 10, 18, EASE.inOut);
  return (
    <>
      <TeenOnBed f={b.f} screen="dmThreat" phoneGlow={0.15} phoneDim={0.4} lower={1} pose={{ slump: 0.6 * (1 - turn), headYaw: -0.6 * turn, headPitch: 0.25 - turn * 0.25 }} />
      <Figure kind="mom" pose={{ pos: MOM_DOOR, yaw: faceTo(MOM_DOOR, TEEN_SIT), armR: 0.25 }} />
      <Figure kind="dad" pose={{ pos: DAD_DOOR, yaw: faceTo(DAD_DOOR, TEEN_SIT) }} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={590} k={span(b.f, b.ck(0, 0))}>
      <Headline text="パパさん・ママさんへ" size={74} f={b.f} at={b.ck(0, 0)} />
    </Layer>
    <Layer x={SAFE_CX} y={1330} k={span(b.f, b.ck(0, 3))}>
      <Chip text="一人で解決しようとしない" size={46} accent="#16b8a4" />
    </Layer>
  </>
);

export const INTRO: SceneDefP = {
  topic: "パパさん・ママさんへ",
  shot,
  World,
  Overlay,
  light: (b) => {
    const on = ease(b.f, openAt + 8, 16, EASE.inOut);
    return { ...phoneNight(0.4 * (1 - on), 0.2), lamp: on, front: 0.3 + 0.2 * on, fill: 0.25 + 0.15 * on, hall: 0.9 };
  },
  room: (b) => ({ door: ease(b.f, openAt, 18, EASE.inOut) }),
  dipIn: true,
};
