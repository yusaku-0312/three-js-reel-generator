import React from "react";
import { sec } from "../koucha/anim";
import { FONT, H, W } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { SAFE_CX } from "../golden2/overlays";
import { COL, INK } from "../aimukae/overlays";
import { sceneAt, TL } from "./core";
import { SceneDefP } from "./types";

export { Layer, reveal, SAFE_CX, Stagger } from "../golden2/overlays";
export { At, Bubble, Chip, COL, Headline, INK, Mark, NoteCard, Scrim, Stamp } from "../aimukae/overlays";

/** Series title on the band (the account's band colour, black type). */
export const SERIES = "親子で守る AI防犯";
export const BAND = "rgb(128,242,255)";

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

/** Numbered advice pill (① 投稿しない): the three pieces of advice keep the same look. */
export const StepPill: React.FC<{ n: number; text: string; size?: number }> = ({ n, text, size = 52 }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: size * 0.3, fontFamily: FONT, fontWeight: 900, fontSize: size,
      color: INK, background: BAND, border: `6px solid ${INK}`, borderRadius: 999,
      padding: `${size * 0.16}px ${size * 0.55}px ${size * 0.16}px ${size * 0.18}px`, whiteSpace: "nowrap",
      boxShadow: "0 10px 26px rgba(0,0,0,0.4)",
    }}
  >
    <div style={{ width: size * 1.25, height: size * 1.25, borderRadius: 999, background: INK, color: BAND, textAlign: "center", lineHeight: `${size * 1.25}px` }}>{n}</div>
    {text}
  </div>
);

/** Source card: who issued the warning and when (no claim beyond the source). */
export const SourceCard: React.FC<{ k: number; who: string; when: string }> = ({ k, who, when }) =>
  k <= 0 ? null : (
    <div
      style={{
        opacity: k, transform: `translateY(${(1 - k) * 20}px)`, fontFamily: FONT, fontWeight: 900, whiteSpace: "nowrap",
        background: "rgba(255,255,255,0.96)", border: `6px solid ${INK}`, borderRadius: 28, padding: "18px 38px",
        boxShadow: "0 12px 28px rgba(0,0,0,0.45)", textAlign: "center", color: INK,
      }}
    >
      <div style={{ fontSize: 50 }}>{who}</div>
      <div style={{ fontSize: 36, color: "#4a5568", marginTop: 4 }}>{when}</div>
    </div>
  );
