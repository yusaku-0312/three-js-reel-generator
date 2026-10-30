import React from "react";
import { FONT } from "../../koucha/theme";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../golden2/three/fx";
import { GlassPot } from "../../golden2/three/glass";
import { Drop, DropLight, Stream } from "../../golden2/three/liquid";
import { Cup, CupPose, poseAbout, potToWorld, spoutLip, teaSurface } from "../../golden2/three/models";
import { clamp01, lin } from "../../golden/core";
import { add3, Beat, lerp, lerp3, rng, V3 } from "../core";
import { Chip, Headline, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { SceneDefP } from "../types";

// Glass teapot: leaves sink, the pour runs while the leaves keep giving, and the last of it becomes one strong drop.
const CENTER: V3 = [-0.25, 1.75, 0];
const SCALE = 0.85;
const YAW = -0.5;
const LEAVES_LOCAL: V3 = [0.1, -0.72, 0];
const CATCH: CupPose = { pos: [1.55, 0, 0.75], scale: 0.8 };
const DROP = 0.05;

const pourFrom = (b: Beat) => b.ln(1);
const pourEnd = (b: Beat) => b.ln(2) - 6;
const tiltAt = (b: Beat) => lerp(0, 0.55, ease(b.f, pourFrom(b), 40)) + lerp(0, 0.12, ease(b.f, b.ln(2), 30));
const pose = (b: Beat) => poseAbout(CENTER, tiltAt(b), SCALE, YAW);
const dropPos = (b: Beat): V3 => add3(spoutLip(pose(b)), [0, -DROP * 0.9, 0]);
const drainAt = (b: Beat) => ease(b.f, pourFrom(b) + 10, pourEnd(b) - pourFrom(b) - 10, EASE.inOut);

const whyShot = (b: Beat): Shot2 => {
  const tip = spoutLip(poseAbout(CENTER, 0.67, SCALE, YAW));
  const potMid: V3 = [0.1, 1.35, 0.1];
  return breathe(
    keys2(b.f, [
      [0, { pos: [0.2, 2.2, 7.0], target: [-0.2, 1.15, 0.1], fov: 32, focus: [-0.2, 1.1, 0], aperture: 6 }],
      [pourFrom(b) - 10, { pos: [0.45, 2.7, 9.2], target: [0.05, 1.2, 0.2], fov: 32, focus: potMid, aperture: 5 }, 50],
      [b.ln(2) - 8, { pos: add3(tip, [0.1, 0.5, 2.5]), target: add3(tip, [-0.12, -0.12, 0]), fov: 32, focus: tip, aperture: 11 }, 44],
    ]),
    b.f,
  );
};

/** What the leaves give off: amber motes while the tea pours, then aroma (pink) and umami (gold) squeezed into the drop. */
const Motes: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const start = b.ck(1, 1);
  if (f < start) return null;
  const squeeze = ease(f, b.ck(2, 2), 32, EASE.inOut);
  const named = ease(f, b.ck(2, 1), 16);
  const leaves = potToWorld(pose(b), LEAVES_LOCAL);
  const target = dropPos(b);
  const r = rng(31);
  return (
    <>
      {Array.from({ length: 30 }, (_, i) => {
        const aroma = i % 2 === 0;
        const a = r() * Math.PI * 2;
        const rise = 0.15 + r() * 0.35;
        const delay = r() * 40;
        const bias = 1.3 + r();
        const t = lin(f, start + delay, 40);
        const swirl = f / 25 + a;
        const free: V3 = add3(leaves, [Math.cos(swirl) * 0.32 * t, rise * t + Math.sin(f / 9 + a) * 0.04, Math.sin(swirl) * 0.22 * t]);
        const p = lerp3(free, target, Math.pow(squeeze, bias));
        const size = lerp(0.17, 0.26, named) * t * (1 - squeeze * 0.8);
        return (
          <React.Fragment key={i}>
            <Glow pos={p} size={size} color="#ff9a2e" intensity={1.3 * (1 - named)} />
            <Glow pos={p} size={size * 1.1} color={aroma ? "#ff8fae" : "#ffc43a"} intensity={1.5 * named} />
          </React.Fragment>
        );
      })}
    </>
  );
};

const WhyWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const p = pose(b);
  const center = potToWorld(p, [0, 0, 0]);
  const drain = drainAt(b);
  const level = center[1] + lerp(0.42, -0.78, drain) * SCALE;
  const pouring = f >= pourFrom(b) + 22;
  const pourTail = ease(f, pourEnd(b) - 14, 16, EASE.in);
  const pourHead = ease(f, pourFrom(b) + 22, 8, EASE.out);
  const dropK = ease(f, b.ln(2) + 8, 24, EASE.out);
  const gold = ease(f, b.ck(2, 2), 20);
  const catchFill = lerp(0.12, 0.6, drain);
  return (
    <>
      <GlassPot pose={p} level={level} f={f} dark={ease(f, pourFrom(b), pourEnd(b) - pourFrom(b)) * 0.75} settle={ease(f, 4, 50)} />
      <Cup pose={CATCH} fill={catchFill} ripple={{ t: ((f % 15) + 3) / 30, amp: pouring && pourTail < 1 ? 0.01 : 0 }} />
      {pouring && <Stream from={p.tip} to={teaSurface(CATCH, catchFill)} s0={pourTail} s1={pourHead} radius={0.04} bend={0.15} f={f} />}
      <Motes b={b} />
      <Drop pos={dropPos(b)} size={DROP * dropK} shape={0.6} gold={gold} stretch={1 + 0.05 * Math.sin(f / 4)} />
      <DropLight pos={dropPos(b)} intensity={gold * 0.4} />
      {gold > 0 && <Glow pos={dropPos(b)} size={DROP * 5} intensity={gold * 0.6} />}
      {gold > 0 && <Sparkles center={dropPos(b)} f={f - b.ck(2, 2)} mode="burst" radius={0.28} count={10} size={0.045} intensity={2} />}
    </>
  );
};

/** Vertical strength bar beside the pot: pale at the top, dark at the bottom. */
const Strata: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ display: "flex", alignItems: "stretch", gap: 14 }}>
    <div style={{ width: 40, height: 300, borderRadius: 20, border: "3px solid #e9b955", overflow: "hidden", background: "rgba(20,9,4,0.8)", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${k * 100}%`, background: "linear-gradient(180deg,#f7c98a 0%,#d27a26 45%,#7a2a08 80%,#3a1003 100%)" }} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#f5e6cc", textShadow: "0 3px 10px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
      <span>上：うすい</span>
      <span style={{ color: "#ffb35a" }}>底：こい</span>
    </div>
  </div>
);

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
            width: 52, height: 34, borderRadius: 7, display: "inline-block",
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
  const strata = reveal(f, b.ck(1, 3), b.ln(2) - 8);
  return (
    <>
      <Layer x={clampX(leaves.x)} y={Math.min(1330, leaves.y + 150)} k={reveal(f, b.ck(0, 1), b.ln(1) + 20)}>
        <Chip text="茶葉は底に" size={46} />
      </Layer>
      <Layer x={clampX(leaves.x + 40)} y={Math.min(1330, leaves.y + 140)} k={reveal(f, b.ck(1, 1), b.ck(1, 3) - 6)}>
        <Chip text="成分が溶け出す" size={46} />
      </Layer>
      <Layer x={815} y={800} k={strata}>
        <Strata k={ease(f, b.ck(1, 3), 50, EASE.out)} />
      </Layer>
      <Layer x={clampX(motes.x - 190)} y={Math.max(560, motes.y - 30)} k={reveal(f, b.ck(2, 1), b.ck(2, 2) - 4)}>
        <Chip text="香り" size={46} accent="#ff9fb8" />
      </Layer>
      <Layer x={clampX(motes.x + 190)} y={Math.max(560, motes.y - 150)} k={reveal(f, b.ck(2, 1) + 8, b.ck(2, 2) - 4)}>
        <Chip text="うまみ" size={46} />
      </Layer>
      <Scrim y={600} k={reveal(f, b.ck(2, 2) - 2)} height={240} />
      <Layer x={SAFE_CX} y={600} k={1}>
        <Headline text="いちばん濃い一滴" size={86} f={f} at={b.ck(2, 2)} sweepAt={b.ck(2, 2) + 18} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(2, 2) + 6)}>
        <Meter fill={ease(f, b.ck(2, 2) + 10, 24, EASE.out)} />
      </Layer>
    </>
  );
};

export const WHY: SceneDefP = { topic: "なぜおいしいの？", shot: whyShot, World: WhyWorld, Overlay: WhyOverlay, dipIn: true };
