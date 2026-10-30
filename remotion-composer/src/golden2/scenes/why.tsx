import React from "react";
import { FONT } from "../../koucha/theme";
import { add3, Beat, clamp01, lerp, lerp3, lin, rng, V3 } from "../../golden/core";
import { Chip, Headline, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../shot";
import { Glow, Sparkles } from "../three/fx";
import { GlassPot } from "../three/glass";
import { Drop, DropLight, Stream } from "../three/liquid";
import { Cup, CupPose, poseAbout, potToWorld, spoutLip, teaSurface } from "../three/models";
import { SceneDef2 } from "../types";

// Glass teapot: the tea pours away, the last of it stays with the leaves and concentrates into one drop.
const CENTER: V3 = [-0.25, 1.75, 0];
const SCALE = 0.85;
const YAW = -0.5;
const LEAVES_LOCAL: V3 = [0.1, -0.72, 0];
const CATCH: CupPose = { pos: [1.55, 0, 0.75], scale: 0.8 };

const tiltAt = (b: Beat) => lerp(0, 0.55, ease(b.f, 4, 70)) + lerp(0, 0.12, ease(b.f, b.ck(1, 1) - 10, 30));
const pose = (b: Beat) => poseAbout(CENTER, tiltAt(b), SCALE, YAW);
const DROP = 0.05;
const dropPos = (b: Beat): V3 => add3(spoutLip(pose(b)), [0, -DROP * 0.9, 0]);

const whyShot = (b: Beat): Shot2 => {
  const tip = spoutLip(poseAbout(CENTER, 0.67, SCALE, YAW));
  const potMid: V3 = [0.1, 1.35, 0.1];
  return breathe(
    keys2(b.f, [
      [0, { pos: [0.45, 2.7, 9.2], target: [0.05, 1.25, 0.2], fov: 32, focus: potMid, aperture: 5 }],
      [b.ck(0, 1) - 6, { pos: [0.3, 2.45, 7.6], target: [-0.05, 1.2, 0.15], fov: 32, focus: potMid, aperture: 6 }, 60],
      [b.ck(1, 1) - 8, { pos: add3(tip, [0.1, 0.5, 2.5]), target: add3(tip, [-0.12, -0.12, 0]), fov: 32, focus: tip, aperture: 11 }, 40],
    ]),
    b.f,
  );
};

/** Aroma and umami motes: rise from the leaves, then squeeze into the drop at the spout. */
const Motes: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const start = b.ck(1, 0);
  if (f < start) return null;
  const squeeze = ease(f, b.ck(1, 1), 32, EASE.inOut);
  const leaves = potToWorld(pose(b), LEAVES_LOCAL);
  const target = dropPos(b);
  const r = rng(31);
  return (
    <>
      {Array.from({ length: 30 }, (_, i) => {
        const aroma = i % 2 === 0;
        const a = r() * Math.PI * 2;
        const rise = 0.25 + r() * 0.55;
        const delay = r() * 18;
        const bias = 1.3 + r();
        const t = lin(f, start + delay, 30);
        const swirl = f / 25 + a;
        const free: V3 = add3(leaves, [Math.cos(swirl) * 0.45 * t, rise * t + Math.sin(f / 9 + a) * 0.04, Math.sin(swirl) * 0.3 * t]);
        const p = lerp3(free, target, Math.pow(squeeze, bias));
        const size = (aroma ? 0.3 : 0.26) * t * (1 - squeeze * 0.8);
        return <Glow key={i} pos={p} size={size} color={aroma ? "#ff8fae" : "#ffc43a"} intensity={1.5} />;
      })}
    </>
  );
};

const WhyWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const p = pose(b);
  const center = potToWorld(p, [0, 0, 0]);
  const drain = ease(f, 6, 92, EASE.inOut);
  const level = center[1] + lerp(0.42, -0.78, drain) * SCALE;
  const pourTail = ease(f, 86, 16, EASE.in);
  const dropK = ease(f, b.ck(1, 1) + 12, 24, EASE.out);
  const gold = ease(f, b.ck(1, 2), 20);
  const catchFill = lerp(0.2, 0.6, drain);
  return (
    <>
      <GlassPot pose={p} level={level} f={f} dark={ease(f, 30, 140) * 0.7} settle={ease(f, 16, 46)} />
      <Cup pose={CATCH} fill={catchFill} ripple={{ t: ((f % 15) + 3) / 30, amp: pourTail < 1 ? 0.01 : 0 }} />
      <Stream from={p.tip} to={teaSurface(CATCH, catchFill)} s0={pourTail} radius={0.04} bend={0.15} f={f} />
      <Motes b={b} />
      <Drop pos={dropPos(b)} size={DROP * dropK} shape={0.6} gold={gold} stretch={1 + 0.05 * Math.sin(f / 4)} />
      <DropLight pos={dropPos(b)} intensity={gold * 0.4} />
      {gold > 0 && <Glow pos={dropPos(b)} size={DROP * 5} intensity={gold * 0.6} />}
      {gold > 0 && <Sparkles center={dropPos(b)} f={f - b.ck(1, 2)} mode="burst" radius={0.28} count={10} size={0.045} intensity={2} />}
    </>
  );
};

/** 濃さ gauge: five segments filling to MAX. */
const Meter: React.FC<{ fill: number }> = ({ fill }) => (
  <Chip text="" size={44}>
    <span>濃さ</span>
    {Array.from({ length: 5 }, (_, i) => {
      const on = clamp01(fill * 5 - i);
      return (
        <span
          key={i}
          style={{
            width: 52,
            height: 34,
            borderRadius: 7,
            display: "inline-block",
            background: `linear-gradient(180deg, rgba(255,226,122,${on}), rgba(232,150,30,${on}))`,
            boxShadow: `inset 0 0 0 2px rgba(255,214,120,${0.25 + 0.5 * on})`,
          }}
        />
      );
    })}
    <span style={{ color: "#ffd34d", opacity: fill >= 1 ? 1 : 0, fontFamily: FONT }}>MAX</span>
  </Chip>
);

const WhyOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const leaves = project2(shot, potToWorld(pose(b), LEAVES_LOCAL));
  const motes = project2(shot, add3(potToWorld(pose(b), LEAVES_LOCAL), [0, 0.5, 0]));
  const clampX = (x: number) => Math.min(815, Math.max(250, x));
  return (
    <>
      <Layer x={clampX(leaves.x - 30)} y={Math.min(1330, leaves.y + 150)} k={reveal(f, b.ck(0, 1), b.ck(1, 1) - 10)}>
        <Chip text="茶葉" size={46} />
      </Layer>
      <Layer x={clampX(motes.x - 190)} y={Math.max(560, motes.y - 30)} k={reveal(f, b.ck(1, 0) + 4, b.ck(1, 1) - 8)}>
        <Chip text="香り" size={46} accent="#ff9fb8" />
      </Layer>
      <Layer x={clampX(motes.x + 190)} y={Math.max(560, motes.y - 150)} k={reveal(f, b.ck(1, 0) + 18, b.ck(1, 1) - 8)}>
        <Chip text="うまみ" size={46} />
      </Layer>
      <Scrim y={600} k={reveal(f, b.ck(1, 2) - 2)} height={240} />
      <Layer x={SAFE_CX} y={600} k={1}>
        <Headline text="いちばん濃い一滴" size={86} f={f} at={b.ck(1, 2)} sweepAt={b.ck(1, 2) + 18} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(1, 2) + 6)}>
        <Meter fill={ease(f, b.ck(1, 2) + 10, 24, EASE.out)} />
      </Layer>
    </>
  );
};

export const WHY: SceneDef2 = { topic: "なぜおいしいの？", shot: whyShot, World: WhyWorld, Overlay: WhyOverlay, dipIn: true };
