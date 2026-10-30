import React from "react";
import { sec } from "../../koucha/anim";
import { FONT } from "../../koucha/theme";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles, Steam } from "../../golden2/three/fx";
import { Drop, DropLight, Neck, Splash, Stream } from "../../golden2/three/liquid";
import { Cup, CupPose, PotPose, spoutLip, Teapot, teaRadius, teaSurface } from "../../golden2/three/models";
import { add3, Beat, lerp, lerp3, TL, V3 } from "../core";
import { lin } from "../../golden/core";
import { Badge, Chip, FocusRing, Headline, Kicker, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { SceneDefP } from "../types";

// Hook and answer share one set: a pot pours into a cup until only the last drop is left, which turns gold and falls.
const CUP: CupPose = { pos: [0, 0, 0] };
const TIP: V3 = [-0.12, 1.72, 0.05];
const POT = (tilt: number): PotPose => ({ tip: TIP, tilt, scale: 0.8, yaw: -0.45 });
const REST_TILT = 0.62;
const LIP = spoutLip(POT(REST_TILT));
const FILL = 0.55;
const SURFACE = teaSurface(CUP, FILL);
const DROP = 0.058;
const HANG_SHAPE = 0.6;

const chunk = (id: string, line: number, j: number) => {
  const s = TL.scenes.find((x) => x.id === id)!;
  return sec(s.lines[line].chunks[j]);
};

/** Centre of a drop hanging from `lip`, its tip touching the lip; `sag` lowers it on a thread. */
const hanging = (lip: V3, size: number, stretch: number, sag = 0): V3 => add3(lip, [0, -(size * stretch * 0.9 + sag), 0]);

const MACRO: Shot2 = { pos: add3(LIP, [0.42, 0.0, 1.55]), target: add3(LIP, [0.02, -0.1, 0]), fov: 30, focus: LIP, aperture: 13 };
const IMPACT: Shot2 = { pos: add3(SURFACE, [0.45, 1.85, 2.55]), target: add3(SURFACE, [0, 0.06, 0]), fov: 30, focus: SURFACE, aperture: 8 };
const TOP: Shot2 = { pos: add3(SURFACE, [0, 4.0, 0.55]), target: add3(SURFACE, [0, 0, -0.14]), fov: 30, focus: SURFACE, aperture: 4 };

// ---------------------------------------------------------------------------
// Hook: a steady pour that thins at 「まん中でもありません」, breaks into drips, and leaves one drop at the spout.
// ---------------------------------------------------------------------------

/** Frame (hook-local) where the stream breaks: on 「まん中でもありません」. */
const POUR_END = chunk("hook", 1, 1);
const POUR_START_FILL = 0.12;

const hookTilt = (f: number) => lerp(0.8, REST_TILT, ease(f, POUR_END - 6, 30, EASE.out));
const hookDropSize = (f: number) => DROP * ease(f, POUR_END + 10, 24, EASE.out);
/** 0..1 how far the pour has gone (drives the progress needle). */
const pourProgress = (f: number) => Math.min(1, f / (POUR_END + 24));

const hookShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [1.75, 1.45, 5.6], target: [-0.05, 1.0, 0], fov: 32, focus: add3(TIP, [0.1, -0.5, 0]), aperture: 5 }],
      [10, { pos: [1.5, 1.4, 4.7], target: [-0.05, 1.02, 0], fov: 32, focus: add3(TIP, [0.1, -0.5, 0]), aperture: 6 }, POUR_END - 40],
      [POUR_END - 24, MACRO, 60],
    ]),
    b.f,
    0.02,
  );

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const pose = POT(hookTilt(f));
  const lip = spoutLip(pose);
  const fill = lerp(POUR_START_FILL, FILL, ease(f, 0, POUR_END + 10, EASE.out));
  const surface = teaSurface(CUP, fill);
  const radius = lerp(0.045, 0.012, ease(f, POUR_END - 60, 56));
  const tail = ease(f, POUR_END - 2, 14, EASE.in);
  const size = hookDropSize(f);
  const wobble = 1 + 0.1 * Math.sin(f / 3.2) * Math.exp(-Math.max(0, f - POUR_END - 28) / 22);
  return (
    <>
      <Teapot pose={pose} />
      <Cup pose={CUP} fill={fill} ripple={{ t: ((f % 16) + 4) / 30, amp: f < POUR_END + 4 ? 0.012 : 0.004 }} />
      <Stream from={TIP} to={surface} s0={tail} radius={radius} bend={0.16} f={f} />
      {[0, 1].map((i) => {
        const t = lin(f, POUR_END + 10 + i * 7, 12);
        if (t <= 0 || t >= 1) return null;
        return <Drop key={i} pos={[lerp(lip[0], surface[0], t), lerp(lip[1], surface[1], t * t), lerp(lip[2], surface[2], t)]} size={0.02} shape={0.8} stretch={1.3} />;
      })}
      <Drop pos={hanging(lip, size, wobble)} size={size} shape={HANG_SHAPE} stretch={wobble} />
      <DropLight pos={hanging(lip, size, wobble)} intensity={0} />
      <Steam base={surface} f={f + 200} opacity={0.5} />
    </>
  );
};

const MARKS = ["はじめ", "まん中", "最後"];

/** Pour timeline: three stops and a needle that follows the pour; wrong guesses get crossed out. */
const PourBar: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const w = 600;
  const p = pourProgress(f);
  const crossAt = [b.ck(1, 0), b.ck(1, 1)];
  const ask = ease(f, b.ck(1, 1) + 8, 10, EASE.out);
  return (
    <div style={{ position: "relative", width: w + 120, height: 190, borderRadius: 30, background: "radial-gradient(ellipse 60% 60% at 50% 55%, rgba(14,6,2,0.7), rgba(14,6,2,0) 100%)" }}>
      <div style={{ position: "absolute", left: 60, top: 64, width: w, height: 10, borderRadius: 5, background: "rgba(20,9,4,0.8)", border: "2px solid rgba(233,185,85,0.7)" }} />
      <div style={{ position: "absolute", left: 60, top: 64, width: w * p, height: 10, borderRadius: 5, background: "linear-gradient(90deg,#f6c45a,#c86a12)" }} />
      {MARKS.map((m, i) => {
        const x = 60 + (w * i) / 2;
        const cross = i < 2 ? ease(f, crossAt[i], 8, EASE.out) : 0;
        return (
          <div key={m} style={{ position: "absolute", left: x, top: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ height: 52, display: "flex", alignItems: "center" }}>
              {i < 2 && cross > 0 && (
                <div style={{ transform: `scale(${1.4 - 0.4 * cross})`, opacity: cross }}>
                  <Badge text="✕" size={58} color="#fff" bg="linear-gradient(180deg,#d4462e,#8e1f10)" />
                </div>
              )}
              {i === 2 && ask > 0 && (
                <div style={{ transform: `scale(${1.3 - 0.3 * ask + 0.05 * Math.sin(f / 5)})`, opacity: ask, filter: "drop-shadow(0 0 14px rgba(255,200,90,0.9))" }}>
                  <Badge text="？" size={64} />
                </div>
              )}
            </div>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: p >= i / 2 ? "#ffd36a" : "#4a2a14", border: "3px solid #2a1206", marginTop: -38 }} />
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: i === 2 ? "#ffd36a" : "#f5e6cc", whiteSpace: "nowrap", textShadow: "0 3px 10px rgba(0,0,0,0.9)", opacity: i < 2 ? 1 - 0.45 * (i === 0 ? ease(f, crossAt[0], 8) : ease(f, crossAt[1], 8)) : 1 }}>
              {m}の一滴
            </div>
          </div>
        );
      })}
    </div>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const at = b.ck(0, 1);
  return (
    <>
      <Scrim y={600} k={reveal(f, at - 4)} height={240} />
      <Layer x={SAFE_CX} y={600} k={1}>
        <Headline text="いちばんおいしい一滴は？" size={70} f={f} at={at} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(0, 2))}>
        <PourBar b={b} />
      </Layer>
    </>
  );
};

// ---------------------------------------------------------------------------
// Answer: the drop lights up gold, sags, snaps off on 「最後に落ちる一滴」, falls in slow motion, lights the cup.
// ---------------------------------------------------------------------------

const SNAP = chunk("answer", 0, 2) + 2;
const SAG_FROM = chunk("answer", 0, 1);
const FALL = 40;
const LAND = SNAP + FALL;
/** Slow motion after impact: crown and ripples run at 35% speed. */
const SLOW = 0.35;

const sagAt = (f: number) => (f < SNAP ? DROP * 0.55 * ease(f, SAG_FROM, SNAP - SAG_FROM, EASE.in) : 0);
const stretchAt = (f: number) => {
  if (f < SNAP) return lerp(1, 1.25, ease(f, SAG_FROM, SNAP - SAG_FROM, EASE.in)) + 0.025 * Math.sin(f / 4);
  const s = f - SNAP;
  return 1 + 0.2 * Math.cos(s / 2.2) * Math.exp(-s / 9);
};

const dropPosAt = (f: number): V3 => {
  if (f < SNAP) return hanging(LIP, DROP, stretchAt(f), sagAt(f));
  const from = hanging(LIP, DROP, 1.25, DROP * 0.55);
  const t = lin(f, SNAP, FALL);
  return [lerp(from[0], SURFACE[0], t), lerp(from[1], SURFACE[1] + DROP * 0.5, t * t), lerp(from[2], SURFACE[2], t)];
};

const impactT = (f: number) => ((f - LAND) / 30) * SLOW;

/** Tilt down with the drop (kept just above centre) while craning up so the cup rim clears the view at impact. */
const fallShot = (f: number): Shot2 => {
  const follow = ease(f, SNAP - 4, FALL + 6, EASE.inOut);
  const drop = dropPosAt(Math.min(f, LAND));
  const track = Math.max(IMPACT.target[1], drop[1] - 0.05);
  const aimY = lerp(MACRO.target[1], Math.min(MACRO.target[1], track), ease(f, SNAP, 8, EASE.out));
  const aim: V3 = [lerp(MACRO.target[0], IMPACT.target[0], follow), aimY, lerp(MACRO.target[2], IMPACT.target[2], follow)];
  const offset = lerp3(
    [MACRO.pos[0] - MACRO.target[0], MACRO.pos[1] - MACRO.target[1], MACRO.pos[2] - MACRO.target[2]],
    [IMPACT.pos[0] - IMPACT.target[0], IMPACT.pos[1] - IMPACT.target[1], IMPACT.pos[2] - IMPACT.target[2]],
    follow,
  );
  return { pos: add3(aim, offset), target: aim, fov: 30, focus: f < LAND ? drop : SURFACE, aperture: lerp(13, 8, follow) };
};

const answerShot = (b: Beat): Shot2 => breathe(keys2(b.f, [[0, fallShot(b.f)], [b.ck(0, 4) - 8, TOP, 46]]), b.f, 0.012);

const AnswerWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const gold = ease(f, b.ck(0, 0), 30);
  const landed = f >= LAND;
  const t = impactT(f);
  const cupGlow = landed ? 0.55 + 0.06 * Math.sin(f / 9) + 0.9 * Math.exp(-(f - LAND) / 12) : 0;
  const pos = dropPosAt(f);
  const stretch = stretchAt(f);
  const sag = sagAt(f);
  return (
    <>
      <Teapot pose={POT(REST_TILT)} />
      <Cup pose={CUP} fill={FILL} glow={cupGlow} ripple={{ t: landed ? t + 0.02 : -1, amp: 0.034 }} />
      {!landed && <Drop pos={pos} size={DROP} shape={f < SNAP ? HANG_SHAPE : 0.75} stretch={stretch} gold={gold} />}
      {f < SNAP && sag > 0.002 && (
        <Neck from={LIP} to={add3(pos, [0, DROP * stretch * 0.8, 0])} radius={DROP * 0.22} pinch={ease(f, SNAP - 8, 8, EASE.in)} gold={gold} />
      )}
      <DropLight pos={landed ? add3(SURFACE, [0, 0.15, 0]) : pos} intensity={landed ? 0.3 * cupGlow : gold * 0.4} />
      {!landed && <Glow pos={pos} size={DROP * 5} intensity={gold * 0.6} />}
      {!landed && gold > 0.05 && <Sparkles center={pos} f={f} radius={0.13} count={6} size={0.035} intensity={1.8 * gold} seed={4} />}
      <Splash center={SURFACE} t={t} size={DROP * 0.9} gold={1} />
      {landed && <Sparkles center={SURFACE} f={f - LAND} mode="burst" radius={0.6} count={14} size={0.05} seed={8} intensity={2.4} />}
      {landed && <Glow pos={add3(SURFACE, [0, 0.04, 0])} size={teaRadius(CUP, FILL) * 2.6} intensity={0.16 * cupGlow} />}
      <Steam base={SURFACE} f={f + 313} opacity={0.5} />
    </>
  );
};

const AnswerOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const at = b.ck(0, 3);
  const p = project2(shot, hanging(LIP, DROP, 1));
  return (
    <>
      <FocusRing x={p.x} y={p.y} r={92} f={f} at={b.ck(0, 0) + 4} out={SNAP - 6} />
      <Scrim y={600} k={ease(f, at - 4, 12, EASE.out)} />
      <Layer x={SAFE_CX} y={590} k={1}>
        <Kicker text="GOLDEN DROP" f={f} at={at - 2} />
        <div style={{ height: 6 }} />
        <Headline text="ゴールデンドロップ" size={84} f={f} at={at} sweepAt={at + 14} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(0, 4))}>
        <Chip text="＝ ポットの最後の一滴" size={50} />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = { topic: "いちばんおいしい一滴は？", shot: hookShot, World: HookWorld, Overlay: HookOverlay };
export const ANSWER: SceneDefP = {
  topic: "ゴールデンドロップ",
  shot: answerShot,
  World: AnswerWorld,
  Overlay: AnswerOverlay,
  bloom: (b) => 0.35 + (b.f >= LAND ? 0.45 * Math.exp(-(b.f - LAND) / 14) : 0),
};
