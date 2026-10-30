import React from "react";
import { Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, lerpShot2, Shot2 } from "../../golden2/shot";
import { Chip, Layer, SAFE_CX } from "../overlays";
import { CallLine, HACK_RED, MonitorCam, Padlock, Stranger, TalkLaptop, Waveform } from "../three/props";
import { SceneDefP } from "../types";
import { HERO_CAM } from "./cams";
import { EVENING } from "./cast";

// L0 the monitor camera big in the centre; 「アカウントが」 a padlock (the account) beside it; 「ハッキングされ」 the
// padlock springs open in red, the lamp turns red with a glitch. 「話しかける機能を」 the camera drops to the lower
// right and a red-edged laptop with the same talk button rises top left; 「勝手に使われたら」 a red voice line runs
// from the laptop to the camera; 「知らない人も」 a hooded stranger in front of the laptop; 「声を流せて」 a red waveform.
const BIG: V3 = [0, 1.0, 0.9];
const SMALL: V3 = [0.34, 0.8, 1.1];
const LAPTOP: V3 = [-0.28, 1.5, 0.3];
const WIDE: Shot2 = { ...HERO_CAM, pos: [0, 1.45, 8.7], target: [0, 1.25, 0.9] };

const hacked = (b: Beat) => b.f >= b.ck(0, 2);
const split = (b: Beat) => ease(b.f, b.ck(0, 3) - 2, 16, EASE.cam);
const glitchK = (b: Beat) => ease(b.f, b.ck(0, 2), 3, EASE.out) * (1 - ease(b.f, b.ck(0, 2) + 4, 14, EASE.inOut));

const shot = (b: Beat): Shot2 => breathe(lerpShot2(HERO_CAM, WIDE, split(b)), b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const k = split(b);
  const camPos = lerp3(BIG, SMALL, k);
  const lineGrow = ease(b.f, b.ck(0, 4), 18, EASE.out);
  return (
    <>
      <MonitorCam pos={camPos} s={lerp(3.0, 2.0, k)} yaw={-0.25 + Math.sin(b.f / 60) * 0.08} pitch={0.05} led={hacked(b) ? "red" : "blue"} glitch={glitchK(b) + (hacked(b) ? 0.12 : 0)} f={b.f} />
      <Padlock pos={[0.62, 1.95, 1.0]} s={1.3} open={ease(b.f, b.ck(0, 2), 8, EASE.out)} k={Math.min(ease(b.f, b.ck(0, 1), 10, EASE.out), 1 - ease(b.f, b.ck(0, 3), 10))} />
      <TalkLaptop pos={LAPTOP} yaw={0.18} s={0.95} k={ease(b.f, b.ck(0, 3), 14, EASE.out)} />
      <CallLine from={[LAPTOP[0] + 0.3, LAPTOP[1] + 0.2, LAPTOP[2] + 0.3]} to={[camPos[0], camPos[1] + 0.1, camPos[2] + 0.3]} f={b.f} grow={lineGrow} lift={0.3} color={HACK_RED} radius={0.018} />
      <Stranger pos={[-0.62, 0.42, 1.0]} yaw={Math.PI + 0.45} s={0.95} k={ease(b.f, b.ck(0, 5), 14, EASE.out)} />
      <Waveform pos={[-0.16, 0.62, 1.4]} f={b.f} width={0.42} height={0.22} bars={14} color={HACK_RED} grow={ease(b.f, b.ck(0, 7), 12, EASE.out)} intensity={1.3} glitch={0.3} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={1372} k={Math.min(ease(b.f, b.ck(0, 2), 8, EASE.out), 1 - ease(b.f, b.ck(0, 6) - 6, 6))}>
      <Chip text="アカウントが乗っ取られる" size={46} accent={HACK_RED} mark="ng" />
    </Layer>
    <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(0, 6), 8, EASE.out)}>
      <Chip text="知らない人の声が流れる" size={46} accent={HACK_RED} />
    </Layer>
  </>
);

export const HACK: SceneDefP = {
  topic: "話しかける機能を乗っ取られたら",
  shot,
  World,
  Overlay,
  light: () => ({ ...EVENING, front: 0.6, fill: 0.45 }),
  dipIn: true,
  grade: (b) => ({ glitch: glitchK(b) * 0.7, danger: hacked(b) ? 0.16 * ease(b.f, b.ck(0, 2), 10) : 0 }),
};
