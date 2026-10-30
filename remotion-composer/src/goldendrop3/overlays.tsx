import React from "react";
import { sec } from "../koucha/anim";
import { C, FONT, H, W } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { sceneAt, TL } from "./core";
import { SceneDefP } from "./types";

// Same look as the 2026-10-22 golden drop reel (golden2); Band and Subtitle read this reel's timeline.
export { Chip, FocusRing, Headline, Kicker, Layer, Note, reveal, SAFE_CX, Scrim, SERIF, Stagger } from "../golden2/overlays";
export { UnionJack } from "../golden/overlays";

const INK = "#24110a";
const CX = 540;

/** Series band: espresso with gold hairlines; the scene topic under the series name. */
export const Band: React.FC<{ frame: number; scenes: Record<string, SceneDefP> }> = ({ frame, scenes }) => {
  const scene = sceneAt(frame);
  const k = ease(frame, sec(scene.start) + 2, 10, EASE.out);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="band3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1d0e" stopOpacity="0.96" />
          <stop offset="1" stopColor="#1f0e06" stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id="hair3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9962e" stopOpacity="0" />
          <stop offset="0.2" stopColor="#f2c86a" />
          <stop offset="0.8" stopColor="#f2c86a" />
          <stop offset="1" stopColor="#c9962e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={0} y={276} width={W} height={196} fill="url(#band3)" />
      <rect x={0} y={283} width={W} height={2} fill="url(#hair3)" />
      <rect x={0} y={463} width={W} height={2} fill="url(#hair3)" />
      <text x={CX} y={362} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={74} fill={C.cream} letterSpacing={2}>
        知ってた？紅茶の雑学
      </text>
      <text x={CX} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#f6c45a" opacity={k} letterSpacing={4}>
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
        position: "absolute", top: 1450, left: CX - 400, width: 800, textAlign: "center",
        fontFamily: FONT, fontWeight: 900, fontSize: 70, color: C.white, lineHeight: 1.2,
        WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill",
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
      }}
    >
      {sub.text}
    </div>
  );
};

/** Round badge for a question mark or a cross over a point on screen. */
export const Badge: React.FC<{ text: string; size?: number; color?: string; bg?: string }> = ({ text, size = 64, color = "#2a1206", bg = "linear-gradient(180deg,#ffe27a,#e8961e)" }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%", background: bg, border: "3px solid #2a1206",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT, fontWeight: 900, fontSize: size * 0.62, color, boxShadow: "0 6px 14px rgba(0,0,0,0.5)",
    }}
  >
    {text}
  </div>
);
