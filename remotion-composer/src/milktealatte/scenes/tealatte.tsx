import React from "react";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { PotPose, Teapot } from "../../golden2/three/models";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { DrinkChip, LATTE_ACCENT } from "../labels";
import { Bubbles, LIQUID, mixHex, PourStream, pourSlice } from "../../royalmilk/three/liquid";
import { FROTH_LIP, FrothPitcher, FrothPose, frothMilk, LatteGlass, LattePose, latteLevel, SteamWand } from "../three/latte";
import { COLOR, LATTE_DONE } from "./set";
import { SceneDefP } from "../types";

// Line 4: an empty glass; the pot pours a short dark shot of strong tea (濃く淹れた紅茶に); the camera tracks to a
// steel pitcher where the steam wand hisses and spins the milk (蒸気で温めた); the pitcher comes over and pours a
// long white stream, the glass fills high and turns caramel (ミルクをたっぷり).
// Line 5: the pitcher tips further and a soft foam cap heaps up on top (ふわふわの泡を のせます).
const GLASS: LattePose = { pos: [-0.4, 0, 0.3], scale: 0.88, yaw: -0.4 };
const PITCHER_BASE: V3 = [0.95, 0, -0.75];
const PITCHER_SCALE = 0.9;
const PITCHER_YAW = Math.PI;
const TEA_LEVEL = 0.3;

const restTip: V3 = [PITCHER_BASE[0] - FROTH_LIP[0] * PITCHER_SCALE, FROTH_LIP[1] * PITCHER_SCALE, PITCHER_BASE[2]];
const pourTip: V3 = [GLASS.pos[0] + 0.4, 1.62, GLASS.pos[2]];
const foamTip: V3 = [GLASS.pos[0] + 0.3, 1.5, GLASS.pos[2]];

const teaPour = (b: Beat) => ({ start: b.ck(0, 2) - 2, dur: 30 });
const steam = (b: Beat) => ({ start: b.ck(0, 3) - 4, end: b.ck(0, 4) - 6 });
const milkPour = (b: Beat) => ({ start: b.ck(0, 4) + 6, dur: b.ln(1) - b.ck(0, 4) - 4 });
const foamPour = (b: Beat) => ({ start: b.ck(1, 1) - 4, dur: 34 });

const POT_REST: V3 = [-2.2, 2.6, 0.2];
const POT_TIP: V3 = [GLASS.pos[0] - 0.3, 1.7, GLASS.pos[2]];
const potPose = (b: Beat): PotPose => {
  const t = teaPour(b);
  const enter = ease(b.f, t.start - 26, 24, EASE.out);
  const leave = ease(b.f, t.start + t.dur, 18, EASE.in);
  const tilt = lerp(0.15, 0.66, ease(b.f, t.start - 6, 10, EASE.out)) - 0.5 * leave;
  return { tip: lerp3(lerp3(POT_REST, POT_TIP, enter), POT_REST, leave), tilt, scale: 0.45, yaw: -0.2 };
};

const pitcherPose = (b: Beat): FrothPose => {
  const m = milkPour(b);
  const fo = foamPour(b);
  const travel = ease(b.f, steam(b).end, m.start - steam(b).end, EASE.inOut);
  const tilt = lerp(0, 0.95, ease(b.f, m.start - 6, 10, EASE.out));
  const toFoam = ease(b.f, fo.start - 8, 10, EASE.inOut);
  const leave = ease(b.f, fo.start + fo.dur, 16, EASE.in);
  const tip = lerp3(lerp3(lerp3(restTip, pourTip, travel), foamTip, toFoam), add3(pourTip, [1.2, 0.6, -0.3]), leave);
  return { tip, tilt: tilt + toFoam * 0.35 - leave * 0.9, yaw: PITCHER_YAW, scale: PITCHER_SCALE };
};

const glassContents = (b: Beat) => {
  const { f } = b;
  const t = teaPour(b);
  const m = milkPour(b);
  const fo = foamPour(b);
  const tea = ease(f, t.start + 3, t.dur, EASE.inOut);
  const milk = ease(f, m.start + 3, m.dur, EASE.inOut);
  const blend = ease(f, m.start + 10, m.dur + 20, EASE.inOut);
  return {
    level: TEA_LEVEL * tea + (LATTE_DONE.level - TEA_LEVEL) * milk,
    bottom: mixHex(COLOR.strongTea, LATTE_DONE.bottom, blend),
    top: mixHex(mixHex(COLOR.strongTea, COLOR.milk, milk), LATTE_DONE.top, blend),
    edge: 0.5,
    soft: lerp(0.35, 1, blend),
    foam: (LATTE_DONE.foam ?? 0) * ease(f, fo.start + 2, fo.dur, EASE.out),
    dome: (LATTE_DONE.dome ?? 0) * ease(f, fo.start + 10, fo.dur, EASE.out),
    glow: 0.25,
  };
};

const GLASS_SHOT: Shot2 = { pos: [-0.2, 2.7, 6.4], target: [-0.3, 0.8, 0.2], fov: 30, focus: [-0.4, 0.8, 0.3], aperture: 6 };
const PITCHER_SHOT: Shot2 = { pos: [0.75, 2.6, 5.6], target: [0.8, 0.7, -0.7], fov: 30, focus: [0.95, 0.6, -0.75], aperture: 6 };
const POUR_SHOT: Shot2 = { pos: [0.15, 2.9, 7.0], target: [0, 1.0, -0.1], fov: 30, focus: [-0.4, 1.0, 0.3], aperture: 5 };
const FOAM_SHOT: Shot2 = { pos: [-0.3, 3.3, 6.0], target: [-0.35, 1.15, 0.25], fov: 30, focus: [-0.4, 1.3, 0.3], aperture: 6 };

const latteShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, GLASS_SHOT],
      [b.ck(0, 3) - 6, PITCHER_SHOT, 18],
      [b.ck(0, 4) + 2, POUR_SHOT, 20],
      [b.ck(1, 2) - 6, FOAM_SHOT, 30],
    ]),
    b.f,
  );

const TeaLatteWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const c = glassContents(b);
  const pot = potPose(b);
  const t = teaPour(b);
  const m = milkPour(b);
  const fo = foamPour(b);
  const st = steam(b);
  const jug = pitcherPose(b);
  const hiss = ease(f, st.start, 6, EASE.out) * (1 - ease(f, st.end - 4, 10, EASE.in));
  const surface: V3 = [GLASS.pos[0], latteLevel(GLASS, Math.max(c.level, 0.02)), GLASS.pos[2]];
  const milkTop = frothMilk({ ...jug, tilt: 0 });
  const wandTip: V3 = add3(frothMilk({ tip: restTip, tilt: 0, yaw: PITCHER_YAW, scale: PITCHER_SCALE }), [0.08, -0.04, 0.04]);
  const lip = add3(jug.tip, [-0.02, -0.02, 0]);
  return (
    <>
      <LatteGlass pose={GLASS} c={c} />
      <Teapot pose={pot} />
      <PourStream from={pot.tip} to={surface} color="#5a2208" radius={0.04} f={f} bend={0.12} {...pourSlice(f, t.start, t.dur)} />
      <FrothPitcher
        pose={jug}
        f={f}
        milk={{ from: "#efe6d8", to: "#fbf7ef", spread: 1, mix: 0.4 + 0.5 * ease(f, st.start, st.end - st.start), swirl: f * 0.35 * (0.3 + hiss) }}
      />
      <Bubbles center={add3(milkTop, [0, 0.005, 0])} radius={0.26} f={f} boil={hiss} color="#fbf6ee" seed={7} count={26} />
      <SteamWand tip={wandTip} lift={ease(f, st.end - 4, 14, EASE.inOut)} />
      <Steam base={add3(milkTop, [0.05, 0.05, 0])} f={f * 2.2} width={0.35} opacity={2.4 * hiss} seed={9} />
      <Steam base={add3(milkTop, [-0.05, 0.05, 0.05])} f={f * 2.6 + 20} width={0.3} opacity={2.0 * hiss} seed={12} />
      <Glow pos={add3(milkTop, [0, 0.3, 0.1])} size={1.0} color="#ffffff" intensity={hiss * 0.35} />
      <PourStream from={lip} to={add3(surface, [0.06, 0, 0])} color={LIQUID.milk} radius={0.06} f={f} bend={0.08} {...pourSlice(f, m.start, m.dur)} />
      <PourStream from={lip} to={add3(surface, [0.02, (c.foam ?? 0) + 0.05, 0])} color="#fbf6ee" radius={0.06} f={f} bend={0.06} {...pourSlice(f, fo.start, fo.dur)} />
      <Steam base={add3(surface, [0, (c.foam ?? 0) + 0.1, 0])} f={f} width={0.25} opacity={0.8 * ease(f, m.start, 30)} seed={4} />
      <Sparkles center={add3(surface, [0, 0.45, 0])} f={f - b.ck(1, 2)} mode="burst" count={14} radius={0.5} size={0.05} seed={51} color="#fff6e0" intensity={2.2} />
    </>
  );
};

const TeaLatteOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={580} k={reveal(f, b.ck(0, 1) - 2)}>
        <DrinkChip kind="latte" size={60} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 2), b.ck(0, 3) - 4)}>
        <Chip text="濃い紅茶" size={58} accent="#c0733a" />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 3), b.ln(1) - 4)}>
        <Chip text="スチームミルク たっぷり" size={54} accent="#dfe4ea" />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 1))}>
        <Chip text="ふわふわの泡" size={58} accent={LATTE_ACCENT} />
      </Layer>
    </>
  );
};

export const TEALATTE: SceneDefP = {
  topic: "ティーラテとは",
  shot: latteShot,
  World: TeaLatteWorld,
  Overlay: TeaLatteOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
