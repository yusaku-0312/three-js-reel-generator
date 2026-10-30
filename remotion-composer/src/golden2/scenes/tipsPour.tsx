import React from "react";
import { add3, Beat, clamp01, lerp, lerp3, lin, V3 } from "../../golden/core";
import { ease, EASE } from "../shot";
import { Glow, Sparkles, Steam } from "../three/fx";
import { Drop, DropLight, Splash, Stream } from "../three/liquid";
import { Cup, CupPose, PotPose, spoutLip, Teapot, teaRadius, teaSurface } from "../three/models";

// POINT 1/2 set: three cups on a diagonal, poured in turns 1→2→3→3→2→1, then the last drop into cup 1.

export const CUPS: CupPose[] = [
  { pos: [-0.45, 0, 1.1], scale: 0.8, yaw: -0.5 },
  { pos: [0, 0, 0], scale: 0.8, yaw: -0.5 },
  { pos: [0.45, 0, -1.1], scale: 0.8, yaw: -0.5 },
];
export const ORDER = [0, 1, 2, 2, 1, 0];
export const STEP = 15;
const PER_POUR = 0.28;
const POT_SCALE = 0.55;
/** The pot gets stronger as it steeps: each successive pour is darker. */
export const POUR_STRENGTH = ORDER.map((_, i) => 0.35 + (0.65 * i) / (ORDER.length - 1));

export const pourStart = (b: Beat) => b.ck(0, 1) - 6;
export const LAST_DROP_FALL = 24;
const above = (c: number): V3 => add3(teaSurface(CUPS[c], 0.5), [0.02, 0.62, 0.02]);

type PourState = {
  tip: V3;
  tilt: number;
  stream: [number, number] | null;
  target: number;
  fills: number[];
  /** Mean strength of what each cup holds (0..1), NaN while empty. */
  strength: number[];
  step: number;
};

export const pourState = (b: Beat): PourState => {
  const { f } = b;
  const t0 = pourStart(b);
  const fills = [0, 0, 0];
  const dose = [0, 0, 0];
  if (f < t0) {
    const enter = ease(f, t0 - 26, 26, EASE.cam);
    return { tip: lerp3(add3(above(0), [1.6, 1.4, 0]), above(0), enter), tilt: 0.3, stream: null, target: 0, fills, strength: [NaN, NaN, NaN], step: -1 };
  }
  const step = Math.min(ORDER.length - 1, Math.floor((f - t0) / STEP));
  const u = clamp01((f - t0 - step * STEP) / STEP);
  ORDER.forEach((c, i) => {
    const amount = i < step ? PER_POUR : i === step ? PER_POUR * clamp01((u - 0.35) / 0.6) : 0;
    fills[c] += amount;
    dose[c] += amount * POUR_STRENGTH[i];
  });
  const from = above(ORDER[Math.max(0, step - 1)]);
  const to = above(ORDER[step]);
  const move = clamp01(u * 3);
  const pouring = u > 0.33 && u < 0.96 && f < t0 + ORDER.length * STEP;
  return {
    tip: lerp3(from, to, move * move * (3 - 2 * move)),
    tilt: lerp(0.32, 0.72, clamp01(Math.sin(clamp01((u - 0.3) / 0.7) * Math.PI) * 1.6)),
    stream: pouring ? [clamp01((u - 0.86) / 0.1), clamp01((u - 0.33) / 0.1)] : null,
    target: ORDER[step],
    fills,
    strength: fills.map((v, i) => (v > 0.005 ? dose[i] / v : NaN)),
    step,
  };
};

/** Tea colour from strength: weak first pours read pale amber. */
const paleFor = (s: number) => (Number.isNaN(s) ? 0 : clamp01((0.8 - s) / 0.5));

const lastTilt = (b: Beat) => ease(b.f, b.ck(2, 0), 36, EASE.inOut);

const potPose = (b: Beat, s: PourState): PotPose => ({
  tip: s.tip,
  tilt: lerp(s.tilt, 1.05, lastTilt(b)),
  scale: POT_SCALE,
  yaw: 0.1,
});

export const PourSet: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const s = pourState(b);
  const pose = potPose(b, s);
  const lip = spoutLip(pose);
  const fallStart = b.ck(2, 1);
  const surface0 = teaSurface(CUPS[0], s.fills[0]);
  const t = lin(f, fallStart, LAST_DROP_FALL);
  const landed = f >= fallStart + LAST_DROP_FALL;
  const since = f - fallStart - LAST_DROP_FALL;
  const hang = add3(lip, [0, -0.04, 0]);
  const dropPos: V3 = [lerp(hang[0], surface0[0], t), lerp(hang[1], surface0[1] + 0.02, t * t), lerp(hang[2], surface0[2], t)];
  const dribble = f >= b.ck(2, 0) + 4 && f < b.ck(2, 0) + 30;
  const gold = ease(f, b.ck(2, 0) + 40, 20);
  const even = ease(f, b.ck(1, 0), 12) * (1 - ease(f, b.ck(2, 0), 10));
  const glow0 = landed ? 0.45 + 0.8 * Math.exp(-since / 14) : 0;
  return (
    <>
      {CUPS.map((c, i) => (
        <React.Fragment key={i}>
          <Cup
            pose={c}
            fill={s.fills[i]}
            pale={paleFor(s.strength[i])}
            glow={i === 0 ? glow0 : 0}
            ripple={
              i === 0 && landed
                ? { t: (since / 30) * 0.45 + 0.02, amp: 0.03 }
                : s.stream && s.target === i
                  ? { t: ((f % 12) + 3) / 30, amp: 0.012 }
                  : undefined
            }
          />
          {s.fills[i] > 0.3 && <Steam base={teaSurface(c, s.fills[i])} f={f + i * 50} opacity={0.4} seed={i + 4} />}
          {even > 0 && <Sparkles center={teaSurface(c, s.fills[i])} f={f - b.ck(1, 0)} mode="burst" radius={0.45} count={8} size={0.04} seed={40 + i} intensity={2 * even} />}
        </React.Fragment>
      ))}
      <Teapot pose={pose} />
      {s.stream && <Stream from={s.tip} to={teaSurface(CUPS[s.target], s.fills[s.target])} s0={s.stream[0]} s1={s.stream[1]} radius={0.03} bend={0.1} f={f} />}
      {dribble && <Stream from={s.tip} to={surface0} s0={ease(f, b.ck(2, 0) + 18, 12, EASE.in)} radius={0.014} bend={0.06} f={f} />}
      {!landed && (
        <Drop pos={dropPos} size={0.042 * ease(f, b.ck(2, 0) + 30, 18, EASE.out)} shape={f >= fallStart ? 0.75 : 0.6} gold={gold} stretch={f >= fallStart ? 1.15 : 1} />
      )}
      <DropLight pos={landed ? add3(surface0, [0, 0.12, 0]) : dropPos} intensity={landed ? 0.3 * glow0 : gold * 0.35} />
      {!landed && gold > 0 && <Glow pos={dropPos} size={0.2} intensity={gold * 0.55} />}
      <Splash center={surface0} t={(since / 30) * 0.45} size={0.04} gold={1} />
      {landed && <Sparkles center={surface0} f={since} mode="burst" radius={0.55} count={14} size={0.045} seed={17} intensity={2.4} />}
      {landed && <Glow pos={add3(surface0, [0, 0.04, 0])} size={teaRadius(CUPS[0], s.fills[0]) * 2.6} intensity={0.15 * glow0} />}
    </>
  );
};
