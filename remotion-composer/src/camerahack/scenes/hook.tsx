import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, lerpShot2, Shot2 } from "../../golden2/shot";
import { CallLine } from "../../aimukae/three/fx";
import { Chip, Layer, SAFE_CX } from "../overlays";
import { HACK_RED, Laptop, LED_BLUE, Phone, Stranger } from "../three/devices";
import { SceneDefP } from "../types";
import { dolly, HERO, HERO_CAM, HOOK_CAM, LENS } from "./cams";
import { Bedroom, DARK_NIGHT } from "./cast";

// L0 night: the child asleep, the shelf camera's lamp blue and its view cone on the bed. 「ハッキングされて」 the lamp
// turns red with a glitch; 「映像まで」 a red stream leaves the lens and runs off the top right. 「自分が子どもを」
// (dip) the parent's phone floats in front with the feed and 「見守り中」; 「知らない誰かも」 the phone drops to the
// lower left and a stranger's laptop with the same feed rises behind, a dark-red hooded figure in front of it.
const isHero = (b: Beat) => b.f >= b.ck(0, 5) - 4;
const hacked = (b: Beat) => b.f >= b.ck(0, 1);

const OUT_TO: [number, number, number] = [3.6, 3.0, 0.2];
const SPLIT_CAM: Shot2 = { ...HERO_CAM, pos: [0.05, 1.45, 8.6], target: [0.05, 1.28, 0.9] };

const shot = (b: Beat): Shot2 => {
  if (!isHero(b)) return breathe(dolly(HOOK_CAM, 0.12 * ease(b.f, 0, b.ck(0, 5), EASE.inOut)), b.f, 0.02);
  return breathe(lerpShot2(HERO_CAM, SPLIT_CAM, ease(b.f, b.ck(0, 7), 18, EASE.cam)), b.f);
};

const glitchK = (b: Beat) => {
  const at = isHero(b) ? b.ck(0, 7) : b.ck(0, 1);
  return ease(b.f, at, 3, EASE.out) * (1 - ease(b.f, at + 4, 14, EASE.inOut));
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (!isHero(b)) {
    const stream = ease(b.f, b.ck(0, 2), 22, EASE.out);
    return (
      <>
        <Bedroom f={b.f} led={hacked(b) ? "red" : "blue"} glitch={glitchK(b) + (hacked(b) ? 0.15 : 0)} coneColor={hacked(b) ? HACK_RED : LED_BLUE} />
        <CallLine from={LENS} to={OUT_TO} f={b.f} grow={stream} lift={0.5} color={HACK_RED} radius={0.018} />
      </>
    );
  }
  const split = ease(b.f, b.ck(0, 7), 18, EASE.cam);
  const rec = b.f >= b.ck(0, 9) && Math.floor(b.f / 8) % 2 === 0;
  return (
    <>
      <Phone
        pos={[HERO[0] - 0.5 * split, HERO[1] - 0.42 * split, HERO[2] + 0.35 * split]}
        rot={[0, 0.18 * split, 0]}
        h={1.5 - 0.62 * split}
        screen="feed"
        glow={0.5}
      />
      <Laptop pos={[0.18, 1.3, 0.25]} yaw={-0.12} s={0.95} rec={rec} k={split} />
      <Stranger pos={[0.62, 0.42, 1.0]} yaw={Math.PI + 0.25} s={1.05} k={ease(b.f, b.ck(0, 7) + 6, 14, EASE.out)} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX + 170} y={532} k={Math.min(ease(b.f, b.ck(0, 2), 8, EASE.out), 1 - ease(b.f, b.ck(0, 5) - 8, 6))}>
      <Chip text="映像が外へ" size={46} accent={HACK_RED} mark="ng" />
    </Layer>
    <Layer x={SAFE_CX} y={532} k={ease(b.f, b.ck(0, 7) + 4, 8, EASE.out)}>
      <Chip text="知らない誰かも見ている" size={46} accent={HACK_RED} />
    </Layer>
  </>
);

export const HOOK: SceneDefP = {
  topic: "見守りカメラが乗っ取られたら",
  shot,
  World,
  Overlay,
  light: (b) => (isHero(b) ? { ...DARK_NIGHT, front: 0.55, fill: 0.4 } : DARK_NIGHT),
  grade: (b) => ({ glitch: glitchK(b) * 0.7, danger: hacked(b) ? 0.18 * ease(b.f, b.ck(0, 1), 10) : 0 }),
  dipChunks: [[0, 5]],
};
