import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Bubble, Chip, COL } from "../overlays";
import { Figure, walkAlong } from "../three/figures";
import { PINK, Waveform } from "../three/fx";
import { Phone } from "../three/props";
import { TOWN_LIGHT } from "../three/stage";
import { SceneDefP } from "../types";

// L0 walking home past the school; the man by the van turns and calls out. L1 the child steps back and
// shakes her head; he takes out a phone and holds it out. L2-L3 close on the phone: mom's voice comes out.
const Y = 0.06;
export const CHILD_STOP: V3 = [1.15, Y, -4.6];
export const MAN_AT: V3 = [0.55, Y, -3.35];
/** The phone held out at the child's eye level (world space, screen toward the child). */
export const PHONE_AT: V3 = [0.42, 1.0, -3.92];

const child = (b: Beat) => {
  const w = walkAlong([1.15, Y, -10.5], CHILD_STOP, b.f / b.ck(0, 3), 14);
  const back = ease(b.f, b.ck(1, 0), 14, EASE.out);
  return { ...w, pos: [w.pos[0], Y, w.pos[2] - back * 0.4] as V3, yaw: 0, step: w.step + (back > 0 && back < 1 ? 0.6 : 0), walk: w.walk + back * Math.PI };
};

const man = (b: Beat) => {
  const turn = ease(b.f, b.ck(0, 2) - 4, 14, EASE.inOut);
  const w = walkAlong([0.12, Y, -2.95], MAN_AT, ease(b.f, b.ck(0, 2) + 4, 26, EASE.inOut), 4);
  const bend = ease(b.f, b.ck(0, 3), 12, EASE.out) * (1 - ease(b.f, b.ck(1, 0), 12, EASE.inOut));
  const phoneUp = ease(b.f, b.ck(1, 2), 14, EASE.out);
  const offer = ease(b.f, b.ck(1, 4) - 4, 16, EASE.out);
  return {
    pos: w.pos,
    yaw: -Math.PI / 2 + turn * (-Math.PI / 2),
    walk: w.walk,
    step: w.step,
    lean: bend * 0.32 + offer * 0.18,
    headPitch: bend * 0.25,
    armR: phoneUp * 0.9 + offer * 0.55,
    phoneUp,
    offer,
  };
};

const shot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-2.2, 3.6, -20.5], target: [0.6, 0.8, -5.3], fov: 30, focus: [1.15, 0.5, -9], aperture: 2.5 }],
      [0, { pos: [-2.0, 3.3, -18.5], target: [0.6, 0.8, -5.0], fov: 30, focus: [1.15, 0.5, -7], aperture: 2.5 }, 110],
      [b.ck(0, 2) - 6, { pos: [-7.07, 6.71, -13.22], target: [0.79, 1.0, -3.85], fov: 30, focus: [0.85, 0.9, -3.9], aperture: 3 }, 50],
      [b.ck(1, 0) - 10, { pos: [-5.9, 5.9, -11.8], target: [0.8, 1.0, -3.95], fov: 30, focus: [0.85, 0.8, -4.0], aperture: 3.5 }, 45],
      [b.ck(1, 2) - 8, { pos: [-1.3, 1.75, -11.2], target: [1.0, 1.0, -4.2], fov: 30, focus: [0.5, 1.0, -3.6], aperture: 4 }, 40],
      [b.ck(2, 0) - 4, { pos: [0.5, 1.1, -6.3], target: [PHONE_AT[0], PHONE_AT[1] + 0.08, PHONE_AT[2]], fov: 30, focus: PHONE_AT, aperture: 7 }, 34],
    ]),
    b.f,
    0.02,
  );

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const c = child(b);
  const m = man(b);
  const shake = Math.sin((b.f - b.ck(1, 0)) / 3) * 0.45 * ease(b.f, b.ck(1, 0), 4) * (1 - ease(b.f, b.ck(1, 0) + 16, 8));
  const phonePos: V3 = [MAN_AT[0] - 0.13, 0.75 + m.phoneUp * 0.12 + m.offer * 0.13, MAN_AT[2] - 0.18 - m.offer * 0.39];
  const voice = ease(b.f, b.ck(2, 1), 14, EASE.out);
  const loud = ease(b.f, b.ck(3, 0), 8, EASE.out);
  return (
    <>
      <Figure kind="child" pose={{ pos: c.pos, yaw: c.yaw, walk: c.walk, step: c.step, headYaw: shake }} />
      <Figure kind="man" pose={{ pos: m.pos, yaw: m.yaw, walk: m.walk, step: m.step, lean: m.lean, headPitch: m.headPitch, armR: m.armR }} />
      {m.phoneUp > 0 && (
        <Phone pos={phonePos} rot={[0, Math.PI, 0]} h={0.3} screen="call" screenGlow={1.2} body="#15181f">
          <Waveform pos={[0, 0.165, 0.02]} f={b.f} seed={11} width={0.34 + loud * 0.1} height={0.1 + loud * 0.06} grow={voice} intensity={1.6} color={PINK} />
        </Phone>
      )}
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const c = child(b);
  const head = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
  const out = (at: number, end: number) => Math.min(ease(b.f, at, 8, EASE.out), 1 - ease(b.f, end - 6, 6, EASE.in));
  return (
    <>
      <At shot={shot} p={head(c.pos, 1.25)} k={out(b.ck(0, 1), b.ck(0, 2) + 10)}>
        <Chip text="下校中" size={44} accent={COL.cyan} />
      </At>
      <Bubble shot={shot} at3={head(MAN_AT, 1.85)} text={"ママに頼まれて\n迎えに来たよ"} k={out(b.ck(0, 3), b.ck(1, 0))} tone="red" dy={150} />
      <Bubble shot={shot} at3={head(c.pos, 1.05)} text="行かない" k={out(b.ck(1, 0) + 4, b.ck(1, 2))} tone="teal" dy={140} />
      <Bubble shot={shot} at3={head(MAN_AT, 1.6)} text={"じゃあ\nママに確認しよう"} k={out(b.ck(1, 2), b.ck(2, 0) - 6)} tone="red" dy={170} />
      <Bubble shot={shot} at3={[PHONE_AT[0], PHONE_AT[1] + 0.2, PHONE_AT[2]]} text={"その人と\n一緒に来てね"} k={out(b.ck(3, 0), b.dur + 20)} tone="pink" dy={300} size={58} />
    </>
  );
};

export const STORY: SceneDefP = {
  topic: "たとえば下校中に…",
  shot,
  World,
  Overlay,
  light: () => ({ ...TOWN_LIGHT, evening: 0.15 }),
  dipIn: true,
};
