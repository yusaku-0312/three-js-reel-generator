import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../koucha/theme";
const MINCHO = `"Hiragino Mincho ProN", "Yu Mincho", serif`;
import { ease, EASE } from "../golden2/shot";
import { Chip, Dot, Headline, Stagger, TEAL } from "./overlays";

/** Colour code of the reel: 紅 = the brewed tea's true colour, brown = how it looks in a mug, black = the leaves. */
export const KURENAI = "#e8442a";
export const KURENAI_GRADIENT = "linear-gradient(180deg, #ffd2b8 0%, #ff7a52 38%, #e8442a 70%, #b51e14 100%)";
export const BROWN = "#9a6a42";
export const LEAF_BLACK = "#2a1a12";
const INK = "#2a150a";

const pulseScale = (f: number, at: number) =>
  interpolate(f, [at, at + 5, at + 9], [1.8, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** A chip with a colour swatch: e.g. 茶色？ (brown dot), 紅色 (crimson dot). */
export const SwatchChip: React.FC<{ text: string; color: string; size?: number }> = ({ text, color, size = 52 }) => (
  <Chip text={text} size={size} accent={color}>
    <Dot color={color} size={size * 0.7} />
  </Chip>
);

/** The word 紅茶 in big brush-weight type: 紅 lights up crimson at `redAt`, a brush stroke underlines it at `lineAt`. */
export const KouchaTitle: React.FC<{ f: number; at: number; redAt: number; lineAt: number; size?: number }> = ({
  f,
  at,
  redAt,
  lineAt,
  size = 230,
}) => {
  const red = ease(f, redAt, 12, EASE.out);
  const line = ease(f, lineAt, 12, EASE.out);
  const glyph = (ch: string, k: number, fill: string, glow: number): React.ReactNode => (
    <span
      style={{
        display: "inline-block",
        fontFamily: MINCHO,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        opacity: k,
        transform: `translateY(${(1 - k) * 26}px)`,
        backgroundImage: fill,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextStroke: `3px rgba(42,21,10,0.9)`,
        filter: `drop-shadow(0 8px 18px rgba(20,8,2,0.7)) drop-shadow(0 0 ${28 * glow}px rgba(255,90,50,${0.85 * glow}))`,
      }}
    >
      {ch}
    </span>
  );
  const cream = "linear-gradient(180deg, #fffdf6 0%, #fbe6c2 60%, #e9c48e 100%)";
  return (
    <div style={{ position: "relative", display: "flex", gap: size * 0.06 }}>
      <div style={{ position: "relative" }}>
        {glyph("紅", ease(f, at, 10, EASE.out), red > 0.02 ? KURENAI_GRADIENT : cream, red)}
        <svg width={size} height={40} viewBox="0 0 100 16" style={{ position: "absolute", left: 0, top: size * 1.02 }}>
          <path
            d="M4 10 Q30 2 56 8 T96 7"
            fill="none"
            stroke={KURENAI}
            strokeWidth={6}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - line}
          />
        </svg>
      </div>
      {glyph("茶", ease(f, at + 3, 10, EASE.out), cream, 0)}
    </div>
  );
};

/** Round ◯ (teal) or ✕ (red) mark that thumps in. */
export const Mark: React.FC<{ kind: "ok" | "ng"; f: number; at: number; size?: number }> = ({ kind, f, at, size = 120 }) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  const color = kind === "ok" ? TEAL : "#e8442a";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `scale(${pulseScale(f, at)})`, opacity: k, filter: "drop-shadow(0 6px 12px rgba(20,8,2,0.6))" }}>
      {kind === "ok" ? (
        <circle cx={50} cy={50} r={36} fill="none" stroke={color} strokeWidth={14} />
      ) : (
        <path d="M20 20 L80 80 M80 20 L20 80" stroke={color} strokeWidth={15} strokeLinecap="round" />
      )}
    </svg>
  );
};

/** Headline with a reading above it (ruby), e.g. 水色 / すいしょく. */
export const RubyHeadline: React.FC<{ text: string; ruby: string; f: number; at: number; size?: number; sweepAt?: number }> = ({
  text,
  ruby,
  f,
  at,
  size = 150,
  sweepAt,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
    <Stagger
      text={ruby}
      f={f}
      at={at + 6}
      step={1.5}
      style={{ fontFamily: FONT, fontWeight: 900, fontSize: size * 0.3, color: C.cream, letterSpacing: size * 0.06, WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke fill" }}
    />
    <Headline text={text} size={size} f={f} at={at} sweepAt={sweepAt} />
  </div>
);

/** Theaflavin as a little crimson ring-system icon (three fused hexagons with OH ticks). */
export const MoleculeIcon: React.FC<{ size: number; k: number }> = ({ size, k }) => {
  const hex = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${cx + Math.cos(a) * 16},${cy + Math.sin(a) * 16}`;
    }).join(" ");
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 120 72" style={{ opacity: k }}>
      <g fill="rgba(232,68,42,0.18)" stroke={KURENAI} strokeWidth={4} strokeLinejoin="round">
        <polygon points={hex(32, 38)} />
        <polygon points={hex(60, 22)} />
        <polygon points={hex(88, 38)} />
      </g>
      <g stroke="#ffd2b8" strokeWidth={3} strokeLinecap="round">
        <path d="M18 58 L10 66" />
        <path d="M60 6 L60 0" />
        <path d="M102 58 L110 66" />
      </g>
    </svg>
  );
};

/** Two-row comparison card: a word and what its colour name comes from. */
export const CompareCard: React.FC<{
  f: number;
  at: number;
  rows: Array<{ word: string; wordColor: string; from: string; dot: string }>;
  title?: string;
}> = ({ f, at, rows, title }) => (
  <div
    style={{
      width: 780,
      background: "linear-gradient(180deg, rgba(74,42,23,0.94), rgba(43,23,12,0.96))",
      border: "4px solid #f3c27a",
      borderRadius: 34,
      padding: "22px 34px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      boxShadow: "0 16px 40px rgba(30,12,4,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
    }}
  >
    {title && (
      <div style={{ alignSelf: "center" }}>
        <Headline text={title} size={58} f={f} at={at} />
      </div>
    )}
    {rows.map((r, i) => {
      const k = ease(f, at + 6 + i * 8, 10, EASE.out);
      return (
        <div key={r.word} style={{ display: "flex", alignItems: "center", gap: 18, opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>
          <div style={{ width: 300, textAlign: "right", fontFamily: FONT, fontWeight: 900, fontSize: 56, color: r.wordColor, WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke fill" }}>
            {r.word}
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.cream }}>→</div>
          <Dot color={r.dot} size={34} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 50, color: C.cream, whiteSpace: "nowrap" }}>{r.from}</div>
        </div>
      );
    })}
  </div>
);

/** Big ≠ that thumps in. */
export const NotEqual: React.FC<{ f: number; at: number; size?: number }> = ({ f, at, size = 140 }) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  return (
    <div style={{ transform: `scale(${pulseScale(f, at)})`, opacity: k }}>
      <Headline text="≠" size={size} f={f} at={at - 10} />
    </div>
  );
};
