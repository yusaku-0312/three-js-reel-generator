import React from "react";
import { ramp } from "../../koucha/anim";
import { C, FONT } from "../../koucha/theme";
import { add3, Beat, clamp01, drift, lerp, lerp3, lin, project, Shot, shotKeys, V3 } from "../core";
import { appear, At, GoldText, Pill, Stamp } from "../overlays";
import { Drop, Ripples, Sparkles, Splash, Steam, Stream } from "../three/fx";
import { GlassPot } from "../three/glass";
import { Cup, CupPose, PotPose, poseAbout, Teapot, teaRadius, teaSurface } from "../three/models";

// Set A: three cups on a diagonal, poured in turns 1→2→3→3→2→1, then the last drop.
// Set B (line 3): what happens to tea left in the pot.

const CUPS: CupPose[] = [
  { pos: [-0.45, 0, 1.1], scale: 0.8, yaw: -0.5 },
  { pos: [0, 0, 0], scale: 0.8, yaw: -0.5 },
  { pos: [0.45, 0, -1.1], scale: 0.8, yaw: -0.5 },
];
const ORDER = [0, 1, 2, 2, 1, 0];
const STEP = 15;
const PER_POUR = 0.28;
const POT_SCALE = 0.55;

const pourStart = (b: Beat) => b.ck(0, 1) - 6;
const above = (c: number): V3 => add3(teaSurface(CUPS[c], 0.5), [0.02, 0.62, 0.02]);

type PourState = { tip: V3; tilt: number; stream: [number, number] | null; target: number; fills: number[] };

const pourState = (b: Beat): PourState => {
  const { f } = b;
  const t0 = pourStart(b);
  const fills = [0, 0, 0];
  if (f < t0) {
    const enter = ramp(f, t0 - 24, 24);
    return { tip: lerp3(add3(above(0), [1.6, 1.4, 0]), above(0), enter), tilt: 0.3, stream: null, target: 0, fills };
  }
  const step = Math.min(ORDER.length - 1, Math.floor((f - t0) / STEP));
  const u = clamp01((f - t0 - step * STEP) / STEP);
  ORDER.forEach((c, i) => {
    if (i < step) fills[c] += PER_POUR;
    if (i === step) fills[c] += PER_POUR * clamp01((u - 0.35) / 0.6);
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
  };
};

const LAST_DROP_FALL = 22;
const lastTilt = (b: Beat) => ramp(b.f, b.ck(2, 0), 36);

const potPose = (b: Beat, s: PourState): PotPose => ({
  tip: s.tip,
  tilt: lerp(s.tilt, 1.05, lastTilt(b)),
  scale: POT_SCALE,
  yaw: 0.1,
});

// ---- Set B: the leftover tea in the pot ------------------------------------------------
const B_CENTER: V3 = [-0.4, 0.55, -0.3];
const B_POSE = poseAbout(B_CENTER, 0, 0.55, -0.5);
const SECOND: CupPose = { pos: [0.62, 0, 0.95], scale: 0.7, yaw: -0.4 };
const setB = (b: Beat) => b.f >= b.ln(3) - 4;

const tipsShot = (b: Beat): Shot => {
  if (setB(b)) {
    return drift(
      shotKeys(b.f - (b.ln(3) - 4), [
        [0, { pos: [0.25, 2.3, 6.4], target: [0.1, 0.5, 0.3], fov: 33 }],
        [40, { pos: [0.2, 2.15, 5.9], target: [0.1, 0.5, 0.3], fov: 33 }, 60],
      ]),
      b.f,
    );
  }
  const cup0 = teaSurface(CUPS[0], 0.56);
  return drift(
    shotKeys(b.f, [
      [0, { pos: [1.0, 4.2, 7.8], target: [0.05, 0.6, 0.05], fov: 33 }],
      [b.ln(1), { pos: [1.2, 4.5, 8.3], target: [0.05, 0.5, 0.0], fov: 33 }, 40],
      [b.ck(2, 0), { pos: add3(cup0, [0.5, 1.75, 3.6]), target: add3(cup0, [0.0, 0.55, 0]), fov: 33 }, 40],
    ]),
    b.f,
  );
};

const SetA: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const s = pourState(b);
  const pose = potPose(b, s);
  const lip = add3(s.tip, [-0.01, -0.05, 0.01]);
  const fallStart = b.ck(2, 1);
  const surface0 = teaSurface(CUPS[0], s.fills[0]);
  const t = lin(f, fallStart, LAST_DROP_FALL);
  const landed = f >= fallStart + LAST_DROP_FALL;
  const since = f - fallStart - LAST_DROP_FALL;
  const dropPos: V3 = [lerp(lip[0], surface0[0], t), lerp(lip[1], surface0[1] + 0.02, t * t), lerp(lip[2], surface0[2], t)];
  const dribble = f >= b.ck(2, 0) + 4 && f < b.ck(2, 0) + 30;
  const allGood = ramp(f, b.ck(1, 2), 10) * (1 - ramp(f, b.ck(2, 0), 10));
  return (
    <>
      {CUPS.map((c, i) => (
        <React.Fragment key={i}>
          <Cup pose={c} fill={s.fills[i]} glow={i === 0 && landed ? Math.max(0.5, 1.3 * Math.exp(-since / 14)) : 0} />
          {s.fills[i] > 0.3 && <Steam base={teaSurface(c, s.fills[i])} f={f + i * 50} opacity={0.45} seed={i + 4} />}
          {allGood > 0 && <Sparkles center={teaSurface(c, s.fills[i])} f={f - b.ck(1, 2)} mode="burst" radius={0.6} count={12} size={0.08} seed={40 + i} />}
        </React.Fragment>
      ))}
      <Teapot pose={pose} />
      {s.stream && <Stream from={s.tip} to={teaSurface(CUPS[s.target], s.fills[s.target])} s0={s.stream[0]} s1={s.stream[1]} radius={0.032} bend={0.1} />}
      {dribble && <Stream from={s.tip} to={surface0} s0={ramp(f, b.ck(2, 0) + 18, 12)} radius={0.016} bend={0.06} />}
      {!landed && (
        <Drop
          pos={dropPos}
          size={0.045 * ramp(f, b.ck(2, 0) + 30, 20)}
          shape={lerp(0.55, 1, ramp(f, fallStart, 8))}
          gold={ramp(f, b.ck(2, 0) + 40, 20)}
          stretch={f >= fallStart ? 1.15 : 1}
        />
      )}
      <Splash center={surface0} f={since} scale={0.7} />
      <Ripples center={surface0} f={since} maxR={teaRadius(CUPS[0], s.fills[0]) * 0.98} rings={4} />
      {landed && <Sparkles center={surface0} f={since} mode="burst" radius={0.8} count={24} size={0.1} seed={17} />}
    </>
  );
};

const SetB: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const dark = ramp(f, b.ck(3, 0) + 6, 50);
  const cupK = ramp(f, b.ck(3, 1) - 4, 12);
  return (
    <>
      <GlassPot pose={B_POSE} level={B_CENTER[1] - 0.3} f={f} dark={dark} settle={0.75} />
      {cupK > 0 && <Cup pose={{ ...SECOND, scale: 0.7 * (0.6 + 0.4 * cupK) }} fill={0.58} dark={0.85} />}
    </>
  );
};

const TipsWorld: React.FC<{ b: Beat }> = ({ b }) => (setB(b) ? <SetB b={b} /> : <SetA b={b} />);

const PourOrder: React.FC<{ active: number; k: number }> = ({ active, k }) => (
  <At x={500} y={720} k={k}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(43,20,8,0.85)", borderRadius: 999, padding: "10px 22px", border: "4px solid #ffc93c" }}>
      {ORDER.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div style={{ color: "#ffc93c", fontFamily: FONT, fontWeight: 900, fontSize: 30 }}>→</div>}
          <div
            style={{
              width: 62, height: 62, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FONT, fontWeight: 900, fontSize: 40,
              background: i <= active ? "linear-gradient(180deg,#ffe27a,#f0a020)" : "rgba(255,255,255,0.15)",
              color: i <= active ? C.ink : C.cream,
              transform: `scale(${i === active ? 1.15 : 1})`,
            }}
          >
            {c + 1}
          </div>
        </React.Fragment>
      ))}
    </div>
  </At>
);

const TipsOverlay: React.FC<{ b: Beat; shot: Shot }> = ({ b, shot }) => {
  const { f } = b;
  if (setB(b)) {
    const second = project(shot, add3(SECOND.pos, [0, 0.95, 0]));
    const pot = project(shot, add3(B_CENTER, [0, 0.8, 0]));
    return (
      <>
        <At x={Math.max(240, pot.x)} y={Math.max(580, pot.y - 40)} k={appear(f, b.ck(3, 0))}>
          <Pill text="ポットに残すと…" size={44} />
        </At>
        <At x={second.x} y={second.y} k={appear(f, b.ck(3, 1))}>
          <Pill text="2杯目" size={44} />
        </At>
        <At x={Math.min(820, second.x + 60)} y={second.y + 300} k={appear(f, b.ck(3, 2) + 4)} rotate={-12}>
          <Stamp text="渋い…" color="#8a2a12" size={200} />
        </At>
      </>
    );
  }
  const t0 = pourStart(b);
  const active = f < t0 ? -1 : Math.min(ORDER.length - 1, Math.floor((f - t0) / STEP));
  const labels = CUPS.map((c) => project(shot, add3(c.pos, [-0.62, 0.8, 0])));
  const numK = appear(f, b.ck(0, 0) + 8, b.ck(2, 0) - 6);
  return (
    <>
      <At x={500} y={600} k={appear(f, b.ck(0, 0), b.ck(2, 0) - 6)}>
        <GoldText text="POINT1 注ぎ分け" size={72} stroke={12} />
      </At>
      <PourOrder active={active} k={appear(f, b.ck(0, 1) - 6, b.ck(2, 0) - 6)} />
      {labels.map((p, i) => (
        <At key={i} x={Math.max(110, p.x)} y={p.y} k={numK}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: "#ffc93c", border: `5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 42, color: C.ink }}>
            {i + 1}
          </div>
        </At>
      ))}
      <At x={500} y={1290} k={appear(f, b.ck(1, 0), b.ck(2, 0) - 6)}>
        <Pill text="どのカップも同じ濃さ" size={48} />
      </At>
      <At x={500} y={600} k={appear(f, b.ck(2, 0))}>
        <GoldText text="POINT2 最後の一滴まで" size={66} stroke={12} />
      </At>
      <At x={760} y={1230} k={appear(f, b.ck(2, 1) + LAST_DROP_FALL + 2)} rotate={-10}>
        <Stamp text="注ぎきる！" color="#c0841a" size={240} />
      </At>
    </>
  );
};

export const TIPS = { topic: "おいしく淹れるコツ", shot: tipsShot, World: TipsWorld, Overlay: TipsOverlay, wipeIn: true, setCuts: [3] };
