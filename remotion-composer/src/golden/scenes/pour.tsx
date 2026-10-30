import React from "react";
import { ramp } from "../../koucha/anim";
import { add3, Beat, drift, lerp, lin, project, Shot, shotKeys, V3 } from "../core";
import { appear, At, GoldText, SERIF, Spotlight } from "../overlays";
import { Drop, Glow, Ripples, Sparkles, Splash, Steam, Stream } from "../three/fx";
import { Cup, CupPose, PotPose, Teapot, teaRadius, teaSurface } from "../three/models";

// Hook and name share one set: a pot pouring into a cup, then the last drop.
const CUP: CupPose = { pos: [0, 0, 0] };
const TIP: V3 = [-0.12, 1.72, 0.05];
const POT = (tilt: number): PotPose => ({ tip: TIP, tilt, scale: 0.8, yaw: -0.45 });
const LIP: V3 = add3(TIP, [-0.012, -0.062, 0.01]);
const FILL = 0.55;
const DROP_SIZE = 0.06;

// ---------------------------------------------------------------------------
// Hook: the pour ends and the last drop clings to the spout.
// ---------------------------------------------------------------------------

const hookDrop = (b: Beat) => DROP_SIZE * ramp(b.f, 44, 22);

const hookShot = (b: Beat): Shot =>
  shotKeys(b.f, [
    [0, { pos: [1.5, 1.55, 5.4], target: [-0.15, 1.05, 0], fov: 36 }],
    [b.ck(0, 1) - 8, { pos: [0.55, 1.95, 2.6], target: add3(LIP, [0.05, 0.12, 0]), fov: 34 }, 34],
  ]);

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const tilt = lerp(0.78, 0.62, ramp(f, 38, 24));
  const surface = teaSurface(CUP, lerp(0.42, FILL, ramp(f, 0, 48)));
  const radius = lerp(0.045, 0.018, ramp(f, 0, 36));
  const tail = ramp(f, 34, 14);
  const wobble = 1 + 0.18 * Math.sin(f / 3) * Math.exp(-Math.max(0, f - 50) / 25);
  return (
    <>
      <Teapot pose={POT(tilt)} />
      <Cup pose={CUP} fill={lerp(0.42, FILL, ramp(f, 0, 48))} />
      <Stream from={TIP} to={surface} s0={tail} radius={radius} bend={0.18} />
      {f < 60 && <Ripples center={surface} f={f % 18} maxR={0.25} color="#d98a3a" rings={2} />}
      <Drop pos={LIP} size={hookDrop(b)} shape={0.55} stretch={wobble} gold={0.15 * ramp(f, b.ck(0, 1), 20)} />
      <Steam base={surface} f={f + 200} opacity={0.6} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot }> = ({ b, shot }) => {
  const p = project(shot, LIP);
  const k = appear(b.f, b.ck(0, 1) + 10);
  return (
    <>
      <Spotlight x={p.x} y={p.y} k={k} f={b.f} r={95} />
      <At x={p.x + 150} y={p.y - 120} k={appear(b.f, b.ck(0, 1) + 16)} rotate={12}>
        <GoldText text="？" size={150} />
      </At>
    </>
  );
};

// ---------------------------------------------------------------------------
// Name: the drop turns gold, falls in slow motion, and lights up the cup.
// ---------------------------------------------------------------------------

const FALL_FRAMES = 44;
const fallStart = (b: Beat) => b.ck(0, 1) + 4;
const landFrame = (b: Beat) => fallStart(b) + FALL_FRAMES;
const SURFACE = teaSurface(CUP, FILL);

const dropPos = (b: Beat, f = b.f): V3 => {
  const t = lin(f, fallStart(b), FALL_FRAMES);
  return [lerp(LIP[0], SURFACE[0], t), lerp(LIP[1], SURFACE[1] + 0.03, t * t), lerp(LIP[2], SURFACE[2], t)];
};

const LANDING: Shot = { pos: [0.55, 2.75, 3.1], target: [0, 0.5, 0], fov: 36 };

const nameShot = (b: Beat): Shot => {
  const fall = ramp(b.f, fallStart(b), FALL_FRAMES + 6);
  const start: Shot = { pos: [0.55, 1.95, 2.6], target: add3(LIP, [0.05, 0.12, 0]), fov: 34 };
  const follow: Shot = {
    pos: [lerp(start.pos[0], LANDING.pos[0], fall), lerp(start.pos[1], LANDING.pos[1], fall), lerp(start.pos[2], LANDING.pos[2], fall)],
    target: [lerp(start.target[0], LANDING.target[0], fall), lerp(start.target[1], LANDING.target[1], fall), 0],
    fov: lerp(start.fov, LANDING.fov, fall),
  };
  return drift(
    shotKeys(b.f, [
      [0, follow],
      [b.ln(1) - 6, { pos: [0.1, 2.75, 1.55], target: [0, 0.4, 0], fov: 33 }, 40],
    ]),
    b.f,
    0.04,
  );
};

const NameWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const gold = ramp(f, b.ck(0, 0), 34);
  const falling = f >= fallStart(b);
  const landed = f >= landFrame(b);
  const since = f - landFrame(b);
  const cupGlow = landed ? Math.max(0.55 + 0.1 * Math.sin(f / 9), 1.4 * Math.exp(-since / 14)) : 0;
  const trail = [3, 6, 9, 12].map((d) => dropPos(b, f - d));
  return (
    <>
      <Teapot pose={POT(0.62)} />
      <Cup pose={CUP} fill={FILL} glow={cupGlow} />
      {!landed && (
        <Drop
          pos={dropPos(b)}
          size={DROP_SIZE * (falling ? 0.95 : 1)}
          shape={falling ? lerp(0.55, 1, ramp(f, fallStart(b), 10)) : 0.55}
          stretch={falling ? 1.15 : 1 + 0.06 * Math.sin(f / 4)}
          gold={gold}
        />
      )}
      {falling &&
        !landed &&
        trail.map((p, i) => <Glow key={i} pos={p} size={0.22 - i * 0.04} opacity={0.5 - i * 0.1} />)}
      {!landed && <Sparkles center={dropPos(b)} f={f - 6} radius={0.32} count={18} size={0.075} opacity={gold} />}
      <Splash center={SURFACE} f={since} scale={0.9} />
      <Ripples center={SURFACE} f={since} maxR={teaRadius(CUP, FILL) * 0.98} rings={4} />
      {landed && <Sparkles center={SURFACE} f={since} mode="burst" radius={0.9} count={26} size={0.11} seed={8} />}
      {landed && <Sparkles center={SURFACE} f={f} mode="rise" radius={0.45} count={34} size={0.08} seed={9} opacity={ramp(f, landFrame(b) + 10, 20)} />}
      {landed && <Glow pos={add3(SURFACE, [0, 0.05, 0])} size={1.6} opacity={0.35 * cupGlow} />}
      <Steam base={SURFACE} f={f + 313} opacity={0.6} />
    </>
  );
};

const NameOverlay: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const k = appear(f, b.ck(0, 1));
  const toTop = ramp(f, b.ln(1) - 6, 20);
  const meaning = appear(f, b.ck(1, 1));
  return (
    <>
      <At x={500} y={lerp(578, 568, toTop)} k={k * lerp(1, 0.86, toTop)}>
        <div style={{ fontFamily: SERIF, fontSize: 46, letterSpacing: 10, color: "#ffe6a3", textShadow: "0 3px 10px rgba(0,0,0,0.7)" }}>
          GOLDEN DROP
        </div>
        <GoldText text="ゴールデンドロップ" size={104} />
      </At>
      <At x={500} y={705} k={meaning}>
        <GoldText text="＝ 黄金のしずく" size={72} stroke={12} />
      </At>
    </>
  );
};

export const HOOK = { topic: "最後の一滴のヒミツ", shot: hookShot, World: HookWorld, Overlay: HookOverlay };
export const NAME = { topic: "ゴールデンドロップ", shot: nameShot, World: NameWorld, Overlay: NameOverlay };
