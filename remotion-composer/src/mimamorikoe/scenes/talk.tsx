import React from "react";
import { Screen } from "../three/screens";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, lerpShot2, Shot2 } from "../../golden2/shot";
import { Chip, Layer, SAFE_CX } from "../overlays";
import { CallLine, LED_BLUE, MonitorCam, Phone, Waveform } from "../three/props";
import { screenAt } from "./util";
import { SceneDefP } from "../types";
import { HERO, HERO_CAM } from "./cams";
import { EVENING } from "./cast";

// L0 (dip) the parent's phone, out: the monitor app with the room feed and a big 「話しかける」 button, pressed on
// 「スマホを使って」. 「子どもに」 the phone drops to the lower left, the monitor camera rises top right, a blue voice
// line arcs from the phone to it and a blue waveform plays at its speaker on 「話しかけられる」.
const PHONE_SPLIT: V3 = [-0.45, 1.0, 1.15];
const CAM_POS: V3 = [0.38, 1.5, 0.8];
const WIDE: Shot2 = { ...HERO_CAM, pos: [0, 1.45, 8.6], target: [0, 1.3, 0.9] };

const split = (b: Beat) => ease(b.f, b.ck(0, 4) - 2, 16, EASE.cam);

const shot = (b: Beat): Shot2 => breathe(lerpShot2(HERO_CAM, WIDE, split(b)), b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const k = split(b);
  const s = screenAt<Screen>(b.f, [
    [0, "talk"],
    [b.ck(0, 3) + 6, "talkOn"],
  ]);
  const phonePos = lerp3(HERO, PHONE_SPLIT, k);
  const camK = ease(b.f, b.ck(0, 4) + 2, 12, EASE.out);
  return (
    <>
      <Phone pos={phonePos} h={1.55 - 0.45 * k} screen={s.screen} next={s.next} mix={s.mix} glow={0.35} rot={[0, 0.12 * k, 0]} />
      {camK > 0.01 && <MonitorCam pos={CAM_POS} s={2.0 * (0.5 + 0.5 * camK)} yaw={-0.35} pitch={0.08} led="blue" f={b.f} />}
      <CallLine from={[phonePos[0] + 0.1, phonePos[1] + 0.5, phonePos[2]]} to={[CAM_POS[0] - 0.05, CAM_POS[1] + 0.05, CAM_POS[2] + 0.3]} f={b.f} grow={ease(b.f, b.ck(0, 4) + 8, 18, EASE.out)} lift={0.35} color={LED_BLUE} radius={0.016} />
      <Waveform pos={[CAM_POS[0] + 0.02, CAM_POS[1] - 0.62, CAM_POS[2] + 0.4]} f={b.f} width={0.6} height={0.24} bars={16} color={LED_BLUE} grow={ease(b.f, b.ck(0, 5), 12, EASE.out)} intensity={1.3} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={540} k={Math.min(ease(b.f, b.ck(0, 2), 8, EASE.out), 1 - ease(b.f, b.ck(0, 4) - 4, 6))}>
      <Chip text="外出先から" size={50} accent={LED_BLUE} />
    </Layer>
    <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(0, 5), 8, EASE.out)}>
      <Chip text="スマホから子どもに話しかけ" size={46} accent={LED_BLUE} />
    </Layer>
  </>
);

export const TALK: SceneDefP = {
  topic: "外出先から話しかけられる",
  shot,
  World,
  Overlay,
  light: () => ({ ...EVENING, front: 0.6, fill: 0.45 }),
  dipIn: true,
};
