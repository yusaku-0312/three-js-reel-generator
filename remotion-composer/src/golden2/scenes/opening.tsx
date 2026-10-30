import React from "react";
import { add3, Beat, lerp, lerp3, lin, V3 } from "../../golden/core";
import { Chip, FocusRing, Headline, Kicker, Layer, Note, reveal, SAFE_CX, Scrim } from "../overlays";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../shot";
import { Glow, Sparkles, Steam } from "../three/fx";
import { Drop, DropLight, Neck, Splash, Stream } from "../three/liquid";
import { Cup, CupPose, PotPose, spoutLip, Teapot, teaRadius, teaSurface } from "../three/models";
import { SceneDef2 } from "../types";

// Hook and name share one set: a pot finishing its pour into a cup, then the last drop.
const CUP: CupPose = { pos: [0, 0, 0] };
const TIP: V3 = [-0.12, 1.72, 0.05];
const POT = (tilt: number): PotPose => ({ tip: TIP, tilt, scale: 0.8, yaw: -0.45 });
const REST_TILT = 0.62;
const LIP = spoutLip(POT(REST_TILT));
const FILL = 0.55;
const SURFACE = teaSurface(CUP, FILL);
const DROP = 0.058;
/** Teardrop with its tip up, so the hanging drop narrows into the spout lip. */
const HANG_SHAPE = 0.6;

/** Centre of a drop hanging from `lip`, its tip touching the lip; `sag` lowers it on a thread. */
const hanging = (lip: V3, size: number, stretch: number, sag = 0): V3 => add3(lip, [0, -(size * stretch * 0.9 + sag), 0]);

const MACRO: Shot2 = { pos: add3(LIP, [0.42, 0.0, 1.55]), target: add3(LIP, [0.02, -0.1, 0]), fov: 30, focus: LIP, aperture: 13 };
const IMPACT: Shot2 = { pos: add3(SURFACE, [0.45, 1.85, 2.55]), target: add3(SURFACE, [0, 0.06, 0]), fov: 30, focus: SURFACE, aperture: 8 };
const TOP: Shot2 = { pos: add3(SURFACE, [0, 4.0, 0.55]), target: add3(SURFACE, [0, 0, -0.14]), fov: 30, focus: SURFACE, aperture: 4 };

// ---------------------------------------------------------------------------
// Hook: the pour thins, breaks into drips, and the last drop gathers at the spout.
// ---------------------------------------------------------------------------

const hookTilt = (f: number) => lerp(0.8, REST_TILT, ease(f, 30, 30, EASE.out));
const hookDropSize = (f: number) => DROP * ease(f, 50, 26, EASE.out);

const hookShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [1.55, 1.35, 4.9], target: [-0.05, 1.08, 0], fov: 32, focus: add3(TIP, [0.1, -0.5, 0]), aperture: 6 }],
      [24, MACRO, 70],
    ]),
    b.f,
    0.02,
  );

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const pose = POT(hookTilt(f));
  const lip = spoutLip(pose);
  const fill = lerp(0.44, FILL, ease(f, 0, 50, EASE.out));
  const surface = teaSurface(CUP, fill);
  const radius = lerp(0.04, 0.012, ease(f, 0, 38));
  const tail = ease(f, 34, 14, EASE.in);
  const size = hookDropSize(f);
  const wobble = 1 + 0.1 * Math.sin(f / 3.2) * Math.exp(-Math.max(0, f - 62) / 22);
  return (
    <>
      <Teapot pose={pose} />
      <Cup pose={CUP} fill={fill} ripple={{ t: ((f % 16) + 4) / 30, amp: f < 52 ? 0.012 : 0.004 }} />
      <Stream from={TIP} to={surface} s0={tail} radius={radius} bend={0.16} f={f} />
      {[0, 1].map((i) => {
        const t = lin(f, 46 + i * 7, 12);
        if (t <= 0 || t >= 1) return null;
        return <Drop key={i} pos={[lerp(lip[0], surface[0], t), lerp(lip[1], surface[1], t * t), lerp(lip[2], surface[2], t)]} size={0.02} shape={0.8} stretch={1.3} />;
      })}
      <Drop pos={hanging(lip, size, wobble)} size={size} shape={HANG_SHAPE} stretch={wobble} />
      <DropLight pos={hanging(lip, size, wobble)} intensity={0} />
      <Steam base={surface} f={f + 200} opacity={0.5} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const p = project2(shot, hanging(LIP, DROP, 1));
  return <FocusRing x={p.x} y={p.y} r={92} f={b.f} at={b.ck(0, 1) + 6} />;
};

// ---------------------------------------------------------------------------
// Name: the drop lights up gold, sags (anticipation), snaps off, falls in slow motion, lights the cup.
// ---------------------------------------------------------------------------

const SNAP = 44;
const FALL = 50;
const LAND = SNAP + FALL;
/** Slow motion after impact: crown and ripples run at 35% speed. */
const SLOW = 0.35;

const sagAt = (f: number) => (f < SNAP ? DROP * 0.55 * ease(f, 24, SNAP - 24, EASE.in) : 0);
const stretchAt = (f: number) => {
  if (f < SNAP) return lerp(1, 1.25, ease(f, 24, SNAP - 24, EASE.in)) + 0.025 * Math.sin(f / 4);
  const s = f - SNAP;
  return 1 + 0.2 * Math.cos(s / 2.2) * Math.exp(-s / 9); // follow-through wobble after letting go
};

const nameDropPos = (f: number): V3 => {
  if (f < SNAP) return hanging(LIP, DROP, stretchAt(f), sagAt(f));
  const from = hanging(LIP, DROP, 1.25, DROP * 0.55);
  const t = lin(f, SNAP, FALL);
  return [lerp(from[0], SURFACE[0], t), lerp(from[1], SURFACE[1] + DROP * 0.5, t * t), lerp(from[2], SURFACE[2], t)];
};

const impactT = (f: number) => ((f - LAND) / 30) * SLOW;

/** Tilt down with the drop (kept just above centre) while craning up so the cup rim clears the view at impact. */
const fallShot = (f: number): Shot2 => {
  const follow = ease(f, SNAP - 4, FALL + 6, EASE.inOut);
  const drop = nameDropPos(Math.min(f, LAND));
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

const nameShot = (b: Beat): Shot2 =>
  breathe(keys2(b.f, [[0, fallShot(b.f)], [b.ln(1) - 8, TOP, 46]]), b.f, 0.012);

const NameWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const gold = ease(f, b.ck(0, 0), 30);
  const landed = f >= LAND;
  const t = impactT(f);
  const cupGlow = landed ? 0.55 + 0.06 * Math.sin(f / 9) + 0.9 * Math.exp(-(f - LAND) / 12) : 0;
  const pos = nameDropPos(f);
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

const NameOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const at = b.ck(0, 1);
  return (
    <>
      <Scrim y={600} k={ease(f, at - 4, 12, EASE.out)} />
      <Layer x={SAFE_CX} y={590} k={1}>
        <Kicker text="GOLDEN DROP" f={f} at={at - 2} />
        <div style={{ height: 6 }} />
        <Headline text="ゴールデンドロップ" size={84} f={f} at={at} sweepAt={LAND + 4} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(1, 1) - 4)}>
        <Chip text="名前の由来：黄金色の輝き" size={44} />
        <div style={{ height: 14 }} />
        <Note text="※諸説あり" size={30} />
      </Layer>
    </>
  );
};

export const HOOK: SceneDef2 = { topic: "最後の一滴のヒミツ", shot: hookShot, World: HookWorld, Overlay: HookOverlay };
export const NAME: SceneDef2 = {
  topic: "ゴールデンドロップ",
  shot: nameShot,
  World: NameWorld,
  Overlay: NameOverlay,
  bloom: (b) => 0.35 + (b.f >= LAND ? 0.45 * Math.exp(-(b.f - LAND) / 14) : 0),
};
