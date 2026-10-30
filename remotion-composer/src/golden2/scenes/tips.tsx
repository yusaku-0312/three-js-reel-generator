import React from "react";
import { FONT } from "../../koucha/theme";
import { add3, Beat, clamp01 } from "../../golden/core";
import { Chip, Headline, Kicker, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../shot";
import { teaSurface } from "../three/models";
import { SceneDef2 } from "../types";
import { LeftoverSet, LEFTOVER_SECOND, leftoverPot, leftoverShot } from "./tipsLeftover";
import { CUPS, LAST_DROP_FALL, ORDER, pourStart, pourState, PourSet, STEP } from "./tipsPour";

const setB = (b: Beat) => b.f >= b.ln(3) - 4;

const tipsShot = (b: Beat): Shot2 => {
  if (setB(b)) return leftoverShot(b, b.f - (b.ln(3) - 4));
  const cup0 = teaSurface(CUPS[0], 0.56);
  return breathe(
    keys2(b.f, [
      [0, { pos: [1.2, 5.0, 9.6], target: [0.05, 0.55, 0.05], fov: 33, focus: [0, 0.5, 0], aperture: 3 }],
      [b.ln(1), { pos: [1.3, 5.2, 9.9], target: [0.05, 0.5, 0], fov: 33, focus: [0, 0.5, 0], aperture: 3 }, 40],
      [b.ck(2, 0), { pos: add3(cup0, [0.5, 1.75, 3.6]), target: add3(cup0, [0, 0.55, 0]), fov: 33, focus: add3(cup0, [0, 0.4, 0]), aperture: 9 }, 40],
    ]),
    b.f,
  );
};

const TipsWorld: React.FC<{ b: Beat }> = ({ b }) => (setB(b) ? <LeftoverSet b={b} /> : <PourSet b={b} />);

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
  const h = 128;
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
      <div style={{ width: 30, height: h, borderRadius: 15, background: "rgba(20,9,4,0.8)", border: "2px solid rgba(233,185,85,0.8)", position: "relative", overflow: "hidden" }}>
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
  const point1 = reveal(f, b.ck(0, 0), b.ck(2, 0) - 6);
  const point2 = b.ck(2, 0);
  const even = ease(f, b.ck(1, 0), 12);
  const gauges = CUPS.map((c) => project2(shot, add3(c.pos, [-0.8, 0.45, 0])));
  return (
    <>
      {point1 > 0 && (
        <>
          <Scrim y={620} k={point1} height={300} />
          <Layer x={SAFE_CX} y={585} k={point1}>
            <Kicker text="POINT 1" f={f} at={b.ck(0, 0)} size={40} />
            <div style={{ height: 4 }} />
            <Headline text="順番に注ぎ分け" size={80} f={f} at={b.ck(0, 0) + 2} />
          </Layer>
          <Layer x={SAFE_CX} y={712} k={reveal(f, t0 - 8, b.ck(2, 0) - 6)}>
            <PourOrder active={active} />
          </Layer>
          {gauges.map((p, i) => (
            <Layer key={i} x={Math.max(195, p.x)} y={p.y} k={reveal(f, t0 + i * 2, b.ck(2, 0) - 6)}>
              <CupGauge n={i + 1} strength={s.strength[i]} even={even} />
            </Layer>
          ))}
          <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(1, 0), b.ck(2, 0) - 6)}>
            <Chip text="どのカップも同じ濃さ" size={48} />
          </Layer>
        </>
      )}
      {f >= point2 - 2 && (
        <>
          <Scrim y={620} k={reveal(f, point2)} height={300} />
          <Layer x={SAFE_CX} y={585} k={1}>
            <Kicker text="POINT 2" f={f} at={point2} size={40} />
            <div style={{ height: 4 }} />
            <Headline text="最後の一滴まで" size={80} f={f} at={point2 + 2} sweepAt={b.ck(2, 1) + LAST_DROP_FALL} />
          </Layer>
          <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(2, 1) + LAST_DROP_FALL + 2)}>
            <Chip text="しっかり注ぎきる" size={52} />
          </Layer>
        </>
      )}
    </>
  );
};

/** Hanko-style seal for the stewed second cup. */
const Seal: React.FC<{ text: string; k: number }> = ({ text, k }) => (
  <div
    style={{
      width: 210, height: 210, borderRadius: "50%", border: "9px solid #b8321c", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#b8321c", background: "rgba(252,243,226,0.94)",
      transform: `rotate(-12deg) scale(${1.25 - 0.25 * k})`, boxShadow: "0 10px 26px rgba(0,0,0,0.5)",
    }}
  >
    {text}
  </div>
);

const LeftoverOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const second = project2(shot, add3(LEFTOVER_SECOND.pos, [0, 0.95, 0]));
  const pot = project2(shot, add3(leftoverPot, [0, 0.85, 0]));
  return (
    <>
      <Layer x={Math.min(725, Math.max(355, pot.x))} y={Math.max(600, pot.y - 40)} k={reveal(f, b.ck(3, 0))}>
        <Chip text="ポットに残すと…" size={46} />
      </Layer>
      <Layer x={Math.min(830, second.x)} y={second.y} k={reveal(f, b.ck(3, 1))}>
        <Chip text="2杯目" size={46} />
      </Layer>
      <Layer x={Math.min(780, second.x + 40)} y={second.y + 330} k={reveal(f, b.ck(3, 2) + 4)}>
        <Seal text="渋い…" k={ease(f, b.ck(3, 2) + 4, 8, EASE.out)} />
      </Layer>
    </>
  );
};

const TipsOverlay: React.FC<{ b: Beat; shot: Shot2 }> = (props) =>
  setB(props.b) ? <LeftoverOverlay {...props} /> : <PourOverlay {...props} />;

export const TIPS: SceneDef2 = {
  topic: "おいしく淹れるコツ",
  shot: tipsShot,
  World: TipsWorld,
  Overlay: TipsOverlay,
  dipIn: true,
  dipLines: [3],
};
