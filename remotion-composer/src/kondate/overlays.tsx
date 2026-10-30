import React from "react";
import { interpolate } from "remotion";
import { sec } from "../koucha/anim";
import { FONT, H, W } from "../koucha/theme";
import { ease, EASE, project2, Shot2 } from "../golden2/shot";
import { Layer, SAFE_CX } from "../golden2/overlays";
import { COL, INK } from "../aimukae/overlays";
import { sceneAt, TL, V3 } from "./core";
import { SceneDefP } from "./types";

export { Layer, reveal, SAFE_CX, Stagger } from "../golden2/overlays";
export { AiNote, At, Chip, COL, Headline, INK, Mark, Scrim } from "../aimukae/overlays";

/** Series title on the band (the account's band colour, black type). */
export const SERIES = "親のための AIライフハック";
const BAND = "rgb(128,242,255)";
export const ORANGE = "#ff8a3d";

/** Series band: brand cyan, series name on top, the scene's topic below. */
export const Band: React.FC<{ frame: number; scenes: Record<string, SceneDefP> }> = ({ frame, scenes }) => {
  const scene = sceneAt(frame);
  const k = ease(frame, sec(scene.start) + 2, 10, EASE.out);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <rect x={0} y={276} width={W} height={196} fill={BAND} />
      <rect x={0} y={466} width={W} height={6} fill={INK} opacity={0.85} />
      <text x={SAFE_CX} y={362} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={74} fill={INK} letterSpacing={2}>
        {SERIES}
      </text>
      <text x={SAFE_CX} y={432} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#0b5560" opacity={k} letterSpacing={3}>
        {scenes[scene.id].topic}
      </text>
    </svg>
  );
};

/** Plain spoken words, cut in with the voice (no animation), inside the safe width. */
export const Subtitle: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / TL.fps;
  const sub = TL.subtitles.find((s) => t >= s.start && t < s.end);
  if (!sub) return null;
  return (
    <div
      style={{
        position: "absolute", top: 1450, left: SAFE_CX - 400, width: 800, textAlign: "center",
        fontFamily: FONT, fontWeight: 900, fontSize: 70, color: COL.white, lineHeight: 1.2,
        WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill",
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.55))",
      }}
    >
      {sub.text}
    </div>
  );
};

const BUBBLE = {
  white: { bg: "#ffffff", edge: "#9aa6bf", ink: INK },
  orange: { bg: "#fff0e2", edge: ORANGE, ink: "#7a3410" },
  grey: { bg: "#eef0f3", edge: "#9aa0aa", ink: "#4a505a" },
  cyan: { bg: "#ecfdff", edge: "#3fd6e8", ink: "#0b4652" },
} as const;
export type BubbleTone = keyof typeof BUBBLE;

/** Speech bubble whose tail points at a 3D point, placed `dy` px above (or `dx` beside) it, inside the safe area. */
export const Bubble: React.FC<{
  shot: Shot2;
  at3: V3;
  text: string;
  k: number;
  tone?: BubbleTone;
  dy?: number;
  dx?: number;
  size?: number;
}> = ({ shot, at3, text, k, tone = "white", dy = 170, dx = 0, size = 54 }) => {
  if (k <= 0.001) return null;
  const p = project2(shot, at3);
  const c = BUBBLE[tone];
  const x = Math.min(Math.max(p.x + dx, 330), 750);
  const y = Math.min(Math.max(p.y - dy, 560), 1340);
  const tailX = Math.min(Math.max(p.x - x, -150), 150);
  const scale = interpolate(k, [0, 0.7, 1], [0.6, 1.06, 1]);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})`, opacity: Math.min(1, k * 1.5), transformOrigin: `${50 + tailX / 4}% 100%` }}>
      <div
        style={{
          position: "relative", background: c.bg, border: `6px solid ${c.edge}`, borderRadius: 40,
          padding: `${size * 0.32}px ${size * 0.55}px`, fontFamily: FONT, fontWeight: 900, fontSize: size, color: c.ink,
          whiteSpace: "pre", textAlign: "center", lineHeight: 1.2, boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
        }}
      >
        {text}
        <div
          style={{
            position: "absolute", left: `calc(50% + ${tailX}px - 22px)`, bottom: -34, width: 0, height: 0,
            borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: `34px solid ${c.edge}`,
          }}
        />
      </div>
    </div>
  );
};

/** Numbered step pill (① 冷蔵庫を撮る): the three steps keep the same look everywhere. */
export const StepPill: React.FC<{ n: number; text: string; size?: number }> = ({ n, text, size = 52 }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: size * 0.3, fontFamily: FONT, fontWeight: 900, fontSize: size,
      color: INK, background: "rgb(128,242,255)", border: `6px solid ${INK}`, borderRadius: 999,
      padding: `${size * 0.16}px ${size * 0.55}px ${size * 0.16}px ${size * 0.18}px`, whiteSpace: "nowrap",
      boxShadow: "0 10px 26px rgba(0,0,0,0.4)",
    }}
  >
    <div style={{ width: size * 1.25, height: size * 1.25, borderRadius: 999, background: INK, color: "rgb(128,242,255)", textAlign: "center", lineHeight: `${size * 1.25}px` }}>{n}</div>
    {text}
  </div>
);

/** A labelled bar that shrinks from `from` to `to` of its width at `at` and turns teal. */
export const TimeBar: React.FC<{ f: number; at: number; label: string; from?: number; to?: number }> = ({ f, at, label, from = 1, to = 0.22 }) => {
  const k = ease(f, at, 22, EASE.inOut);
  const w = 640 * (from + (to - from) * k);
  const color = `color-mix(in srgb, ${COL.red} ${Math.round((1 - k) * 100)}%, ${COL.teal})`;
  return (
    <div style={{ width: 720, padding: "26px 40px", borderRadius: 36, background: "rgba(255,250,240,0.95)", border: `6px solid ${INK}`, boxShadow: "0 16px 36px rgba(0,0,0,0.4)", fontFamily: FONT, fontWeight: 900 }}>
      <div style={{ fontSize: 50, color: INK, marginBottom: 18 }}>{label}</div>
      <div style={{ width: 640, height: 56, borderRadius: 28, background: "#e7e0d4", overflow: "hidden" }}>
        <div style={{ width: w, height: 56, borderRadius: 28, background: color }} />
      </div>
    </div>
  );
};
