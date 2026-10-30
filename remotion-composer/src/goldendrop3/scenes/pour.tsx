import React from "react";
import { FONT } from "../../koucha/theme";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles, Steam } from "../../golden2/three/fx";
import { Drop, DropLight, Splash, Stream } from "../../golden2/three/liquid";
import { Cup, CupPose, PotPose, spoutLip, Teapot, teaRadius, teaSurface } from "../../golden2/three/models";
import { lin } from "../../golden/core";
import { add3, Beat, clamp01, lerp, lerp3, V3 } from "../core";
import { Chip, Headline, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { SceneDefP } from "../types";

// Three cups on a diagonal, poured in turns 1→2→3→3→2→1 (each pour stronger), then the golden drop into cup 1.
// Line 0: 何杯か淹れるときは / カップに少しずつ / 順番に注いで / 濃さをそろえます。
// Line 1: そして最後の / 黄金の一滴で / お客さまのカップを / 仕上げるんです。
const CUPS: CupPose[] = [
  { pos: [-0.45, 0, 1.1], scale: 0.8, yaw: -0.5 },
  { pos: [0, 0, 0], scale: 0.8, yaw: -0.5 },
  { pos: [0.45, 0, -1.1], scale: 0.8, yaw: -0.5 },
];
const ORDER = [0, 1, 2, 2, 1, 0];
const STEP = 13;
const PER_POUR = 0.28;
const POT_SCALE = 0.55;
const POUR_STRENGTH = ORDER.map((_, i) => 0.35 + (0.65 * i) / (ORDER.length - 1));
const LAST_DROP_FALL = 24;

const pourStart = (b: Beat) => b.ck(0, 1) - 6;
const evenAt = (b: Beat) => b.ck(0, 3);
const lastAt = (b: Beat) => b.ck(1, 0);
const fallAt = (b: Beat) => b.ck(1, 1);
const above = (c: number): V3 => add3(teaSurface(CUPS[c], 0.5), [0.02, 0.62, 0.02]);

type PourState = { tip: V3; tilt: number; stream: [number, number] | null; target: number; fills: number[]; strength: number[] };

const pourState = (b: Beat): PourState => {
  const { f } = b;
  const t0 = pourStart(b);
  const fills = [0, 0, 0];
  const dose = [0, 0, 0];
  if (f < t0) {
    const enter = ease(f, t0 - 26, 26, EASE.cam);
    return { tip: lerp3(add3(above(0), [1.6, 1.4, 0]), above(0), enter), tilt: 0.3, stream: null, target: 0, fills, strength: [NaN, NaN, NaN] };
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
  };
};

/** Tea colour from strength: weak first pours read pale amber. */
const paleFor = (s: number) => (Number.isNaN(s) ? 0 : clamp01((0.8 - s) / 0.5));
const potPose = (b: Beat, s: PourState): PotPose => ({ tip: s.tip, tilt: lerp(s.tilt, 1.05, ease(b.f, lastAt(b), 36, EASE.inOut)), scale: POT_SCALE, yaw: 0.1 });

const pourShot = (b: Beat): Shot2 => {
  const cup0 = teaSurface(CUPS[0], 0.56);
  return breathe(
    keys2(b.f, [
      [0, { pos: [1.2, 5.0, 9.6], target: [0.05, 0.55, 0.05], fov: 33, focus: [0, 0.5, 0], aperture: 3 }],
      [b.ck(0, 3), { pos: [1.3, 5.2, 9.9], target: [0.05, 0.5, 0], fov: 33, focus: [0, 0.5, 0], aperture: 3 }, 40],
      [lastAt(b), { pos: add3(cup0, [0.5, 1.75, 3.6]), target: add3(cup0, [0, 0.55, 0]), fov: 33, focus: add3(cup0, [0, 0.4, 0]), aperture: 9 }, 40],
    ]),
    b.f,
  );
};

const PourWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const s = pourState(b);
  const pose = potPose(b, s);
  const lip = spoutLip(pose);
  const fallStart = fallAt(b);
  const surface0 = teaSurface(CUPS[0], s.fills[0]);
  const t = lin(f, fallStart, LAST_DROP_FALL);
  const landed = f >= fallStart + LAST_DROP_FALL;
  const since = f - fallStart - LAST_DROP_FALL;
  const hang = add3(lip, [0, -0.04, 0]);
  const dropPos: V3 = [lerp(hang[0], surface0[0], t), lerp(hang[1], surface0[1] + 0.02, t * t), lerp(hang[2], surface0[2], t)];
  const dribble = f >= lastAt(b) + 4 && f < lastAt(b) + 30;
  const gold = ease(f, lastAt(b) + 34, 18);
  const even = ease(f, evenAt(b), 12) * (1 - ease(f, lastAt(b), 10));
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
          {even > 0 && <Sparkles center={teaSurface(c, s.fills[i])} f={f - evenAt(b)} mode="burst" radius={0.45} count={8} size={0.04} seed={40 + i} intensity={2 * even} />}
        </React.Fragment>
      ))}
      <Teapot pose={pose} />
      {s.stream && <Stream from={s.tip} to={teaSurface(CUPS[s.target], s.fills[s.target])} s0={s.stream[0]} s1={s.stream[1]} radius={0.03} bend={0.1} f={f} />}
      {dribble && <Stream from={s.tip} to={surface0} s0={ease(f, lastAt(b) + 18, 12, EASE.in)} radius={0.014} bend={0.06} f={f} />}
      {!landed && (
        <Drop pos={dropPos} size={0.042 * ease(f, lastAt(b) + 30, 18, EASE.out)} shape={f >= fallStart ? 0.75 : 0.6} gold={gold} stretch={f >= fallStart ? 1.15 : 1} />
      )}
      <DropLight pos={landed ? add3(surface0, [0, 0.12, 0]) : dropPos} intensity={landed ? 0.3 * glow0 : gold * 0.35} />
      {!landed && gold > 0 && <Glow pos={dropPos} size={0.2} intensity={gold * 0.55} />}
      <Splash center={surface0} t={(since / 30) * 0.45} size={0.04} gold={1} />
      {landed && <Sparkles center={surface0} f={since} mode="burst" radius={0.55} count={14} size={0.045} seed={17} intensity={2.4} />}
      {landed && <Glow pos={add3(surface0, [0, 0.04, 0])} size={teaRadius(CUPS[0], s.fills[0]) * 2.6} intensity={0.15 * glow0} />}
    </>
  );
};

/** 1→2→3→3→2→1 strip; the current pour is lit. */
const PourOrder: React.FC<{ active: number }> = ({ active }) => (
  <Chip text="" size={34}>
    {ORDER.map((c, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={{ color: "#e9b955", fontSize: 26 }}>→</span>}
        <span
          style={{
            width: 54, height: 54, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 34, fontFamily: FONT,
            background: i <= active ? "linear-gradient(180deg,#ffe27a,#e8961e)" : "rgba(255,255,255,0.12)",
            color: i <= active ? "#2a1206" : "#f5e6cc",
            transform: `scale(${i === active ? 1.12 : 1})`,
          }}
        >
          {c + 1}
        </span>
      </React.Fragment>
    ))}
  </Chip>
);

/** Numbered badge with a small strength bar: shows each cup's 濃さ as the turns go round. */
const CupGauge: React.FC<{ n: number; strength: number; even: number }> = ({ n, strength, even }) => {
  const fill = Number.isNaN(strength) ? 0 : clamp01(strength / 0.9);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
      <div
        style={{
          width: 66, height: 66, borderRadius: "50%", background: "linear-gradient(180deg,#ffe27a,#e8961e)",
          border: "3px solid #2a1206", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#2a1206", boxShadow: "0 6px 14px rgba(0,0,0,0.5)",
        }}
      >
        {n}
      </div>
      <div style={{ width: 30, height: 128, borderRadius: 15, background: "rgba(20,9,4,0.8)", border: "2px solid rgba(233,185,85,0.8)", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, height: `${fill * 100}%`,
            background: `linear-gradient(180deg, rgb(${Math.round(255 - 120 * fill)},${Math.round(200 - 140 * fill)},${Math.round(90 - 70 * fill)}), #6a2408)`,
            boxShadow: even > 0 ? `0 0 ${12 * even}px rgba(255,200,90,${even})` : undefined,
          }}
        />
      </div>
    </div>
  );
};

const PourOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const s = pourState(b);
  const t0 = pourStart(b);
  const active = f < t0 ? -1 : Math.min(ORDER.length - 1, Math.floor((f - t0) / STEP));
  const part1 = reveal(f, b.ck(0, 0), lastAt(b) - 6);
  const even = ease(f, evenAt(b), 12);
  const gauges = CUPS.map((c) => project2(shot, add3(c.pos, [-0.8, 0.45, 0])));
  const cup0 = project2(shot, add3(CUPS[0].pos, [0, 1.2, 0]));
  const landAt = fallAt(b) + LAST_DROP_FALL;
  return (
    <>
      {part1 > 0 && (
        <>
          <Scrim y={600} k={part1} height={260} />
          <Layer x={SAFE_CX} y={590} k={part1}>
            <Headline text="少しずつ順番に" size={84} f={f} at={b.ck(0, 0) + 2} />
          </Layer>
          <Layer x={SAFE_CX} y={712} k={reveal(f, t0 - 8, lastAt(b) - 6)}>
            <PourOrder active={active} />
          </Layer>
          {gauges.map((p, i) => (
            <Layer key={i} x={Math.max(195, p.x)} y={p.y} k={reveal(f, t0 + i * 2, lastAt(b) - 6)}>
              <CupGauge n={i + 1} strength={s.strength[i]} even={even} />
            </Layer>
          ))}
          <Layer x={SAFE_CX} y={1300} k={reveal(f, evenAt(b), lastAt(b) - 6)}>
            <Chip text="どのカップも同じ濃さ" size={48} />
          </Layer>
        </>
      )}
      {f >= lastAt(b) - 2 && (
        <>
          <Scrim y={600} k={reveal(f, lastAt(b))} height={260} />
          <Layer x={SAFE_CX} y={590} k={1}>
            <Headline text="最後の一滴で仕上げ" size={80} f={f} at={lastAt(b) + 2} sweepAt={landAt} />
          </Layer>
          <Layer x={Math.min(760, Math.max(320, cup0.x))} y={Math.min(1330, Math.max(820, cup0.y))} k={reveal(f, b.ck(1, 2))}>
            <Chip text="お客さまのカップ" size={46} />
          </Layer>
        </>
      )}
    </>
  );
};

export const POUR: SceneDefP = { topic: "注ぎ方のコツ", shot: pourShot, World: PourWorld, Overlay: PourOverlay, dipIn: true };
