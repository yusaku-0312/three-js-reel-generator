import React from "react";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { PotPose, Teapot } from "../../golden2/three/models";
import { Aroma, Sparkles, Steam } from "../../paradise/three/fx";
import { LeafDish } from "../../paradise/three/props";
import { Pitcher, PitcherPose } from "../../royalmilk/three/kitchen";
import { mixHex, PourStream, pourSlice } from "../../royalmilk/three/liquid";
import { Thump } from "../../milktealatte/labels";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { COBALT, JASMINE } from "../labels";
import { ClearCup, clearSurface, JasmineSprig } from "../three/parts";
import { COLOR } from "./set";
import { SceneDefP } from "../types";

// Line 3: an empty clear cup; the pot pours pale gold jasmine tea (ジャスミン茶と) beside a jasmine sprig, the
// creamer pours fresh milk (新鮮な牛乳の) and the cup turns milky (ミルクティー).
// Line 4: a dish of loose tea leaves; the pot pours hot tea again (茶葉から淹れる), steam, then scent ribbons in
// jasmine and white rise and brighten (香りがとても濃い).
const CUP = { pos: [0.1, 0, 0.25] as V3, scale: 0.9 };
const SPRIG: V3 = [-0.85, 0, 0.85];
const DISH: V3 = [-0.95, 0, -0.35];

const teaPour = (b: Beat) => ({ start: b.ck(0, 1) - 2, dur: 34 });
const milkPour = (b: Beat) => ({ start: b.ck(0, 2) - 2, dur: 32 });
const brewPour = (b: Beat) => ({ start: b.ck(1, 0) + 4, dur: 26 });
const TEA_LEVEL = 0.45;
const FULL = 0.82;

const POT_REST: V3 = [-2.4, 2.8, 0.2];
const POT_TIP: V3 = [CUP.pos[0] - 0.35, 1.75, CUP.pos[2]];
const potPose = (f: number, start: number, dur: number): PotPose => {
  const enter = ease(f, start - 24, 22, EASE.out);
  const leave = ease(f, start + dur, 18, EASE.in);
  const tilt = lerp(0.15, 0.66, ease(f, start - 6, 10, EASE.out)) - 0.5 * leave;
  return { tip: lerp3(lerp3(POT_REST, POT_TIP, enter), POT_REST, leave), tilt, scale: 0.45, yaw: -0.2 };
};

const JUG_REST: V3 = [2.2, 2.2, 0.0];
const JUG_TIP: V3 = [CUP.pos[0] + 0.35, 1.7, CUP.pos[2]];
const jugPose = (b: Beat): PitcherPose => {
  const m = milkPour(b);
  const enter = ease(b.f, m.start - 22, 20, EASE.out);
  const leave = ease(b.f, m.start + m.dur, 16, EASE.in);
  return { tip: lerp3(lerp3(JUG_REST, JUG_TIP, enter), JUG_REST, leave), tilt: lerp(0, 1.0, ease(b.f, m.start - 6, 10, EASE.out)) - leave, yaw: Math.PI, scale: 0.9 };
};

const contents = (b: Beat) => {
  const tea = ease(b.f, teaPour(b).start + 3, teaPour(b).dur, EASE.inOut);
  const milk = ease(b.f, milkPour(b).start + 3, milkPour(b).dur, EASE.inOut);
  const blend = ease(b.f, milkPour(b).start + 8, milkPour(b).dur + 18, EASE.inOut);
  return { level: TEA_LEVEL * tea + (FULL - TEA_LEVEL) * milk, color: mixHex(COLOR.jasmine, COLOR.jasmineMilk, blend) };
};

const CUP_SHOT: Shot2 = { pos: [-0.2, 2.8, 6.6], target: [-0.1, 0.85, 0.2], fov: 30, focus: CUP.pos, aperture: 6 };
const CUP_IN: Shot2 = { pos: [-0.1, 2.7, 5.8], target: [0, 0.9, 0.2], fov: 30, focus: CUP.pos, aperture: 7 };
const BREW_SHOT: Shot2 = { pos: [-1.0, 3.0, 6.2], target: [-0.45, 0.7, 0], fov: 30, focus: [-0.4, 0.5, 0], aperture: 6 };
const AROMA_SHOT: Shot2 = { pos: [-0.3, 2.9, 6.9], target: [0, 1.25, 0.2], fov: 30, focus: CUP.pos, aperture: 5 };

const menuShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, CUP_SHOT],
      [b.ck(0, 3) - 4, CUP_IN, 24],
      [b.ln(1) - 6, BREW_SHOT, 26],
      [b.ck(1, 2) - 6, AROMA_SHOT, 30],
    ]),
    b.f,
  );

const MenuWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const c = contents(b);
  const t = teaPour(b);
  const m = milkPour(b);
  const br = brewPour(b);
  const inTea = f < b.ln(1) - 10;
  const pot = inTea ? potPose(f, t.start, t.dur) : potPose(f, br.start, br.dur);
  const pour = inTea ? pourSlice(f, t.start, t.dur) : pourSlice(f, br.start, br.dur);
  const surface = clearSurface(CUP, Math.max(c.level, 0.03));
  const jug = jugPose(b);
  const scent = ease(f, b.ck(1, 2) - 4, 30, EASE.out);
  const strong = ease(f, b.ck(1, 3), 16, EASE.out);
  return (
    <>
      <ClearCup pose={CUP} level={c.level} color={c.color} glow={0.18} />
      <JasmineSprig pos={SPRIG} f={f} open={ease(f, b.ck(0, 1) - 6, 30, EASE.out) + 0.3} yaw={0.3} />
      <LeafDish pos={DISH} mix={0} f={f} scale={0.55} />
      <Teapot pose={pot} />
      <PourStream from={pot.tip} to={surface} color={COLOR.jasmine} radius={0.035} f={f} bend={0.12} {...pour} />
      <Pitcher pose={jug} />
      <PourStream from={add3(jug.tip, [-0.02, -0.02, 0])} to={add3(surface, [0.05, 0, 0])} color={COLOR.milk} radius={0.05} f={f} bend={0.08} {...pourSlice(f, m.start, m.dur)} />
      <Steam base={add3(surface, [0, 0.08, 0])} f={f} width={0.25} opacity={0.6 + 1.2 * ease(f, b.ck(1, 1), 20)} seed={5} />
      <Aroma from={add3(surface, [0, 0.05, 0])} f={f} colors={[JASMINE, "#fff8e8", JASMINE]} grow={scent} intensity={0.22 + strong * 0.2} height={1.6} radius={0.3} seed={7} />
      <Sparkles center={add3(surface, [0, 0.5, 0])} f={f - b.ck(1, 3)} mode="burst" count={16} radius={0.6} size={0.05} seed={41} color="#f4ffd8" intensity={2.0} />
    </>
  );
};

const MenuOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0), b.ln(1) - 4)}>
        <Headline text="看板メニュー" size={92} f={f} at={b.ck(0, 0)} />
      </Layer>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(0, 1), b.ck(0, 3) - 3)}>
        <div style={{ display: "flex", gap: 14 }}>
          <Chip text="ジャスミン茶" size={52} accent={JASMINE} />
          {f >= b.ck(0, 2) && <Chip text="＋ 新鮮な牛乳" size={52} accent="#f6f1e8" />}
        </div>
      </Layer>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(0, 3), b.ln(1) - 4)}>
        <Chip text="ジャスミンミルクティー" size={54} accent={COBALT} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(1, 0), b.ck(1, 3) - 3)}>
        <Chip text="茶葉から淹れる" size={58} accent="#c0733a" />
      </Layer>
      <Layer x={SAFE_CX} y={640} k={reveal(f, b.ck(1, 3))} rise={0}>
        <Thump text="香りが濃い！" f={f} at={b.ck(1, 3)} size={110} />
      </Layer>
    </>
  );
};

export const MENU: SceneDefP = {
  topic: "看板メニュー",
  shot: menuShot,
  World: MenuWorld,
  Overlay: MenuOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
