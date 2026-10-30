import React from "react";
import { ramp } from "../../koucha/anim";
import { C, FONT } from "../../koucha/theme";
import { add3, Beat, drift, lerp, lerp3, lin, project, rng, Shot, shotKeys, V3 } from "../core";
import { appear, At, GoldText, Pill } from "../overlays";
import { Drop, Glow, Sparkles, Stream } from "../three/fx";
import { GlassPot } from "../three/glass";
import { Cup, CupPose, poseAbout, potToWorld, teaSurface } from "../three/models";

// X-ray teapot: the tea pours away, the last of it stays with the leaves and gets concentrated.
const CENTER: V3 = [-0.25, 1.75, 0];
const SCALE = 0.85;
const YAW = -0.5;
const LEAVES_LOCAL: V3 = [0.1, -0.72, 0];

const tiltAt = (b: Beat) => lerp(0, 0.55, ramp(b.f, 4, 70)) + lerp(0, 0.12, ramp(b.f, b.ck(1, 1) - 10, 30));
const pose = (b: Beat) => poseAbout(CENTER, tiltAt(b), SCALE, YAW);
const CATCH: CupPose = { pos: [1.55, 0, 0.75], scale: 0.8 };
const lip = (b: Beat): V3 => add3(pose(b).tip, [-0.01, -0.06, 0.01]);

const whyShot = (b: Beat): Shot => {
  const tip = add3(poseAbout(CENTER, 0.67, SCALE, YAW).tip, [-0.01, -0.06, 0.01]);
  return drift(
    shotKeys(b.f, [
      [0, { pos: [0.8, 2.6, 8.8], target: [0.35, 1.25, 0.2], fov: 32 }],
      [b.ck(1, 1) - 6, { pos: add3(tip, [0.1, 0.55, 2.6]), target: add3(tip, [-0.15, -0.08, 0]), fov: 32 }, 36],
    ]),
    b.f,
  );
};

/** Aroma and umami motes: rise from the leaves, then squeeze into the drop at the spout. */
const Motes: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const start = b.ck(1, 0);
  const squeeze = ramp(f, b.ck(1, 1), 34);
  if (f < start) return null;
  const leaves = potToWorld(pose(b), LEAVES_LOCAL);
  const target = lip(b);
  const r = rng(31);
  return (
    <>
      {Array.from({ length: 30 }, (_, i) => {
        const aroma = i % 2 === 0;
        const a = r() * Math.PI * 2;
        const rise = 0.25 + r() * 0.55;
        const delay = r() * 18;
        const t = lin(f, start + delay, 30);
        const swirl = f / 25 + a;
        const free: V3 = add3(leaves, [Math.cos(swirl) * 0.45 * t, rise * t + Math.sin(f / 9 + a) * 0.04, Math.sin(swirl) * 0.3 * t]);
        const p = lerp3(free, target, Math.pow(squeeze, 1.4 + r()));
        const size = (aroma ? 0.36 : 0.3) * t * (1 - squeeze * 0.75);
        return <Glow key={i} pos={p} size={size} color={aroma ? "#ff9fb8" : "#ffd04a"} opacity={0.9} />;
      })}
    </>
  );
};

const WhyWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const p = pose(b);
  const center = potToWorld(p, [0, 0, 0]);
  const drain = ramp(f, 6, 92);
  const level = center[1] + lerp(0.42, -0.78, drain) * SCALE;
  const pourTail = ramp(f, 86, 16);
  const dropK = ramp(f, b.ck(1, 1) + 12, 24);
  const gold = ramp(f, b.ck(1, 2), 20);
  return (
    <>
      <GlassPot pose={p} level={level} f={f} dark={ramp(f, 30, 120) * 0.75} settle={ramp(f, 40, 50)} />
      <Cup pose={CATCH} fill={lerp(0.2, 0.6, drain)} />
      <Stream from={p.tip} to={teaSurface(CATCH, lerp(0.2, 0.6, drain))} s0={pourTail} radius={0.04} bend={0.15} />
      <Motes b={b} />
      <Drop pos={lip(b)} size={0.055 * dropK} shape={0.55} gold={gold} />
      {gold > 0 && <Sparkles center={lip(b)} f={f - b.ck(1, 2)} radius={0.3} count={16} size={0.07} />}
    </>
  );
};

/** 濃さ gauge: five segments filling to MAX. */
const Meter: React.FC<{ k: number; fill: number }> = ({ k, fill }) => (
  <At x={500} y={1300} k={k}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(43,20,8,0.88)", border: "5px solid #ffc93c", borderRadius: 24, padding: "14px 26px" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.cream, whiteSpace: "nowrap" }}>濃さ</div>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 54,
            height: 40,
            borderRadius: 8,
            background: fill * 5 > i ? "linear-gradient(180deg,#ffe27a,#f0a020)" : "rgba(255,255,255,0.15)",
          }}
        />
      ))}
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#ffd34d", opacity: fill >= 1 ? 1 : 0 }}>MAX</div>
    </div>
  </At>
);

const WhyOverlay: React.FC<{ b: Beat; shot: Shot }> = ({ b, shot }) => {
  const { f } = b;
  const leaves = project(shot, potToWorld(pose(b), LEAVES_LOCAL));
  const motes = project(shot, add3(potToWorld(pose(b), LEAVES_LOCAL), [0, 0.5, 0]));
  const leafK = appear(f, b.ck(0, 1), b.ck(1, 1) - 10);
  const aromaK = appear(f, b.ck(1, 0) + 4, b.ck(1, 1));
  const umamiK = appear(f, b.ck(1, 0) + 18, b.ck(1, 1));
  return (
    <>
      <At x={leaves.x - 40} y={leaves.y + 140} k={leafK}>
        <Pill text="茶葉" />
      </At>
      <At x={Math.max(170, motes.x - 190)} y={motes.y - 40} k={aromaK}>
        <Pill text="香り" border="#ff9fb8" />
      </At>
      <At x={Math.min(840, motes.x + 200)} y={motes.y - 150} k={umamiK}>
        <Pill text="うまみ" />
      </At>
      <At x={500} y={600} k={appear(f, b.ck(1, 2))}>
        <GoldText text="いちばん濃い一滴" size={84} stroke={12} />
      </At>
      <Meter k={appear(f, b.ck(1, 2) + 6)} fill={ramp(f, b.ck(1, 2) + 10, 24)} />
    </>
  );
};

export const WHY = { topic: "なぜおいしいの？", shot: whyShot, World: WhyWorld, Overlay: WhyOverlay, wipeIn: true };
