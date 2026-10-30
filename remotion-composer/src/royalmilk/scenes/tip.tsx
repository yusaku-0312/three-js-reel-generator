import React from "react";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles, Steam } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { StepChip } from "../labels";
import { Burner, MilkPan, PAN_INNER, panSurface, Pitcher, PitcherPose } from "../three/kitchen";
import { Bubbles, LIQUID, mixHex, PourStream, pourSlice, TeaLeaves } from "../three/liquid";
import { BURNER, PAN } from "./set";
import { SceneDefP } from "../types";

// Line 8: leaves sit dry in the pan; a steel jug adds a little hot water and the curled leaves open (茶葉を開く).
// Line 9: milk goes in, small bubbles rise at the rim (沸騰する手前で), the flame goes out and it settles (火を止めます).
const waterPour = (b: Beat) => ({ start: b.ck(0, 1) + 2, dur: 22 });
const milkPour = (b: Beat) => ({ start: b.ck(1, 0) + 2, dur: 24 });

const tipShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.2, 5.0, 6.4], target: [0, 0.32, 0], fov: 30, focus: panSurface(PAN, 0.3), aperture: 7 }],
      [b.ck(1, 2) - 4, { pos: [0.2, 5.5, 7.2], target: [0, 0.3, 0], fov: 30, focus: panSurface(PAN, 0.5), aperture: 6 }, 40],
    ]),
    b.f,
  );

const jugPose = (b: Beat, pour: { start: number; dur: number }, rest: V3, tip: V3, tilt: number): PitcherPose => {
  const enter = ease(b.f, pour.start - 16, 14, EASE.out);
  const leave = ease(b.f, pour.start + pour.dur, 14, EASE.in);
  return {
    tip: lerp3(lerp3(rest, tip, enter), rest, leave),
    tilt: lerp(0.1, tilt, ease(b.f, pour.start - 5, 8, EASE.out)) - (tilt - 0.1) * leave,
    yaw: Math.PI,
    scale: 1.1,
  };
};

const TipWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const w = waterPour(b);
  const m = milkPour(b);
  const fill = 0.12 + 0.12 * ease(f, w.start + 2, w.dur) + 0.38 * ease(f, m.start + 2, m.dur);
  const top = panSurface(PAN, fill);
  const open = ease(f, b.ck(0, 2) - 4, 22, EASE.out);
  const tea = mixHex(LIQUID.water, "#9a5a26", open * 0.8);
  const spread = ease(f, m.start + 4, 30, EASE.out);
  const mix = ease(f, m.start + 20, 40, EASE.inOut);
  const boil = ease(f, b.ck(1, 1) - 2, 14) * (1 - ease(f, b.ck(1, 2) + 2, 24));
  const flame = 1 - ease(f, b.ck(1, 2) - 2, 12, EASE.in);
  const swirl = ease(f, w.start, 160, EASE.out) * 4;
  const water = jugPose(b, w, [1.9, 2.4, 0.5], [0.55, 1.2, 0.15], 0.75);
  const milk = jugPose(b, m, [1.9, 2.4, 0.5], [0.55, 1.25, 0.15], 0.9);
  const hasWater = fill > 0.13;
  return (
    <>
      <Burner pos={BURNER} flame={flame} f={f} />
      <MilkPan pos={PAN} fill={hasWater ? fill : 0} s={{ from: tea, to: mixHex(tea, LIQUID.royal, 0.85), spread, mix, swirl, glow: 0.08 }}>
        <TeaLeaves center={hasWater ? top : panSurface(PAN, 0)} radius={PAN_INNER} f={f} landAt={-40} open={open} swirl={swirl * 0.5} sink={mix} />
        <Bubbles center={top} radius={PAN_INNER} f={f} boil={boil} color={LIQUID.royal} count={40} />
      </MilkPan>
      <Sparkles center={add3(top, [0, 0.2, 0])} f={f - b.ck(0, 2)} mode="burst" count={14} radius={0.6} size={0.05} seed={71} color="#fff0c8" intensity={2} />
      <Steam base={top} f={f} width={0.55} opacity={1.1 * ease(f, w.start, 20) * lerp(0.6, 1, boil)} />
      <Pitcher pose={water} steel />
      <PourStream from={water.tip} to={add3(top, [0.15, 0, 0])} color="#a9d4e6" radius={0.026} f={f} bend={0.08} {...pourSlice(f, w.start, w.dur)} />
      <Pitcher pose={milk} />
      <PourStream from={milk.tip} to={add3(top, [0.15, 0, 0])} color={LIQUID.milk} radius={0.042} f={f} bend={0.08} {...pourSlice(f, m.start, m.dur)} />
    </>
  );
};

const TipOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={575} k={reveal(f, b.ck(0, 0) - 2)}>
        <Headline text="おいしく作るコツ" size={88} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 0) + 18} />
      </Layer>
      <Layer x={SAFE_CX} y={1170} k={reveal(f, b.ck(0, 1))}>
        <StepChip n="1" text="少しのお湯で茶葉を開く" size={44} />
      </Layer>
      <Layer x={SAFE_CX} y={1262} k={reveal(f, b.ck(1, 0))}>
        <StepChip n="2" text="牛乳を入れる" size={44} />
      </Layer>
      <Layer x={SAFE_CX} y={1354} k={reveal(f, b.ck(1, 1))}>
        <StepChip n="3" text="沸騰の手前で火を止める" size={44} />
      </Layer>
    </>
  );
};

export const TIP: SceneDefP = {
  topic: "おいしく作るコツ",
  shot: tipShot,
  World: TipWorld,
  Overlay: TipOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
