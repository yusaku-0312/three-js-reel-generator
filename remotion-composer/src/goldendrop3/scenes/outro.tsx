import React from "react";
import { C, FONT } from "../../koucha/theme";
import { ease, EASE, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles, Steam } from "../../golden2/three/fx";
import { Drop, DropLight } from "../../golden2/three/liquid";
import { Cup, CupPose, PotPose, spoutLip, Teapot, teaSurface } from "../../golden2/three/models";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { Badge, Headline, Kicker, Layer, reveal, SAFE_CX } from "../overlays";
import { SceneDefP } from "../types";

// Four cups round a table; the pot hovers with the golden drop and drifts from cup to cup on 「誰のカップに」.
// Chunks: 0 次の一杯 / 1 その一滴は / 2 誰のカップに / 3 注ぎますか？
const R = 1.0;
const CUPS: CupPose[] = [0, 1, 2, 3].map((i) => {
  const a = Math.PI / 4 + (i * Math.PI) / 2;
  return { pos: [Math.sin(a) * R * 0.85, 0, Math.cos(a) * R], scale: 0.62, yaw: a };
});
/** Visiting order: front-right, front-left, back-left, back-right. */
const VISIT = [0, 3, 2, 1];
const FILL = 0.55;
const HOVER = 1.05;
const DROP = 0.045;
const HOP = 20;

const aboveCup = (i: number): V3 => add3(teaSurface(CUPS[i], FILL), [0.02, HOVER - 0.3, 0.02]);
const CENTER_TIP: V3 = [0.05, 1.25, 0.05];

const tipAt = (b: Beat): V3 => {
  const start = b.ck(0, 2);
  if (b.f < start) return lerp3(add3(CENTER_TIP, [1.6, 0.8, 0.2]), CENTER_TIP, ease(b.f, 0, 40, EASE.cam));
  const k = (b.f - start) / HOP;
  const i = Math.min(VISIT.length - 1, Math.floor(k));
  const from = i === 0 ? CENTER_TIP : aboveCup(VISIT[i - 1]);
  const to = aboveCup(VISIT[i]);
  const u = Math.min(1, k - i);
  return lerp3(from, to, u * u * (3 - 2 * u));
};

const pose = (b: Beat): PotPose => ({ tip: tipAt(b), tilt: 0.5, scale: 0.44, yaw: -0.5 });
const CARD_AT = (b: Beat) => b.ck(0, 3) + 22;

const outroShot = (b: Beat): Shot2 => {
  const k = ease(b.f, 0, b.dur, EASE.cam);
  const a = lerp(-0.3, 0.18, k);
  const r = lerp(6.9, 6.5, k);
  return { pos: [Math.sin(a) * r, 6.0, Math.cos(a) * r], target: [0, 0.45, 0.05], fov: 33, focus: [0, 0.6, 0], aperture: 4 };
};

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const p = pose(b);
  const hang = add3(spoutLip(p), [0, -DROP * 0.9, 0]);
  const gold = ease(f, b.ck(0, 1), 18);
  return (
    <>
      {CUPS.map((c, i) => (
        <React.Fragment key={i}>
          <Cup pose={c} fill={FILL} />
          <Steam base={teaSurface(c, FILL)} f={f + i * 61} opacity={0.35} seed={i + 11} />
        </React.Fragment>
      ))}
      <Teapot pose={p} />
      <Drop pos={hang} size={DROP * ease(f, 4, 20, EASE.out)} shape={0.6} gold={gold} stretch={1 + 0.05 * Math.sin(f / 4)} />
      <DropLight pos={hang} intensity={0.15 + gold * 0.35} />
      <Glow pos={hang} size={DROP * 5} intensity={0.2 + gold * 0.5} />
      {gold > 0 && <Sparkles center={hang} f={f} radius={0.16} count={6} size={0.035} intensity={1.8 * gold} seed={5} />}
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const card = reveal(f, CARD_AT(b));
  const marks = CUPS.map((c) => project2(shot, add3(c.pos, [0, 0.95, 0])));
  return (
    <>
      {marks.map((m, i) => (
        <Layer key={i} x={Math.min(900, Math.max(180, m.x))} y={m.y} k={reveal(f, b.ck(0, 2) + i * 4, CARD_AT(b) - 6)}>
          <div style={{ transform: `scale(${1 + 0.06 * Math.sin(f / 5 + i)})` }}>
            <Badge text="？" size={70} />
          </div>
        </Layer>
      ))}
      <Layer x={SAFE_CX} y={1130} k={card}>
        <div
          style={{
            background: "linear-gradient(180deg, rgba(44,21,9,0.92), rgba(20,9,4,0.94))",
            border: "3px solid #e9b955",
            borderRadius: 34,
            padding: "26px 46px 26px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 16px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,235,190,0.25)",
          }}
        >
          <Kicker text="GOLDEN DROP" f={f} at={CARD_AT(b)} size={30} />
          <Headline text="ゴールデンドロップ" size={70} f={f} at={CARD_AT(b) + 2} sweepAt={CARD_AT(b) + 20} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.cream, whiteSpace: "nowrap" }}>＝ ポットの最後の一滴</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: "#f6c45a", whiteSpace: "nowrap", opacity: ease(f, CARD_AT(b) + 12, 10, EASE.out) }}>
            その一滴、誰のカップに？
          </div>
        </div>
      </Layer>
    </>
  );
};

export const OUTRO: SceneDefP = { topic: "その一滴は誰に？", shot: outroShot, World: OutroWorld, Overlay: OutroOverlay, dipIn: true };
