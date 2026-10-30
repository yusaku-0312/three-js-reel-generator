import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { Chip, Headline } from "./overlays";

export { Thump } from "../milktealatte/labels";

/** Colour code kept on every label: amber = tea / astringency / aroma, gold = butter fat, biscuit = cookie. */
export const TEA_ACCENT = "#f0a04b";
export const OIL_ACCENT = "#ffd84a";
export const COOKIE_ACCENT = "#d9a25a";
const INK = "#2a150a";
const STRIKE = "#ff5a4a";

/** Tannin as a little amber ring-system icon (two fused hexagons with OH ticks). */
export const TanninIcon: React.FC<{ size: number }> = ({ size }) => {
  const hex = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${cx + Math.cos(a) * 16},${cy + Math.sin(a) * 16}`;
    }).join(" ");
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 96 72">
      <g fill="rgba(240,160,75,0.22)" stroke={TEA_ACCENT} strokeWidth={4} strokeLinejoin="round">
        <polygon points={hex(34, 40)} />
        <polygon points={hex(62, 24)} />
      </g>
      <g stroke="#ffe2b0" strokeWidth={3} strokeLinecap="round">
        <path d="M20 60 L12 68" />
        <path d="M62 8 L62 1" />
        <path d="M80 30 L90 26" />
      </g>
    </svg>
  );
};

export const DropIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.75} height={size} viewBox="0 0 60 80">
    <path d="M30 6 Q52 38 52 52 A22 22 0 0 1 8 52 Q8 38 30 6 Z" fill="#8fd3ff" stroke="#fff6e6" strokeWidth={5} />
  </svg>
);

export const FlameIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.75} height={size} viewBox="0 0 60 80">
    <path d="M30 4 Q50 28 48 50 A18 18 0 0 1 12 50 Q10 36 22 26 Q24 38 30 40 Q26 22 30 4 Z" fill="#ff8a3a" stroke="#fff6e6" strokeWidth={5} />
  </svg>
);

/** Small round swatch inside a chip. */
export const Swatch: React.FC<{ color: string; size?: number }> = ({ color, size = 30 }) => (
  <div style={{ width: size, height: size, borderRadius: 999, background: color, boxShadow: `0 0 12px ${color}`, border: "3px solid rgba(255,250,240,0.85)" }} />
);

/** Two chips side by side; at `strikeAt` a red line slashes through both (「…だからではありません」). */
export const StrikeChips: React.FC<{ f: number; leftAt: number; rightAt: number; strikeAt: number }> = ({ f, leftAt, rightAt, strikeAt }) => {
  const l = ease(f, leftAt, 10, EASE.out);
  const r = ease(f, rightAt, 10, EASE.out);
  const s = ease(f, strikeAt, 8, EASE.out);
  return (
    <div style={{ position: "relative", display: "flex", gap: 28, alignItems: "center" }}>
      <div style={{ opacity: l, transform: `translateY(${(1 - l) * 20}px)` }}>
        <Chip text="甘い" size={58} accent={COOKIE_ACCENT}>
          <Swatch color={COOKIE_ACCENT} />
        </Chip>
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.cream, WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", opacity: r }}>＋</div>
      <div style={{ opacity: r, transform: `translateY(${(1 - r) * 20}px)` }}>
        <Chip text="苦い" size={58} accent={TEA_ACCENT}>
          <Swatch color="#8a3a10" />
        </Chip>
      </div>
      {s > 0 && (
        <div
          style={{
            position: "absolute",
            left: -20,
            top: "50%",
            height: 14,
            width: `calc(${s * 100}% + ${s * 40}px)`,
            background: STRIKE,
            borderRadius: 8,
            transform: "translateY(-50%) rotate(-6deg)",
            transformOrigin: "left center",
            boxShadow: "0 4px 12px rgba(30,12,4,0.5)",
          }}
        />
      )}
    </div>
  );
};

/** Chip that springs in with a small overshoot. */
export const PopChip: React.FC<{ f: number; at: number; text: string; size?: number; accent?: string; children?: React.ReactNode }> = ({
  f,
  at,
  text,
  size = 54,
  accent,
  children,
}) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  const scale = interpolate(f, [at, at + 5, at + 9], [0.6, 1.06, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: k, transform: `scale(${scale})` }}>
      <Chip text={text} size={size} accent={accent}>
        {children}
      </Chip>
    </div>
  );
};

/** End card: title, then one row per reason (number badge + statement) in the reason's colour. */
export const SummaryCard: React.FC<{ f: number; at: number; row1At: number; row2At: number; sweepAt?: number }> = ({ f, at, row1At, row2At, sweepAt }) => {
  const row = (k: number, n: string, top: string, bottom: string, accent: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: k, transform: `translateY(${(1 - k) * 24}px)` }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          background: accent,
          color: INK,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "4px solid #fff6e6",
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: accent, WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
          {top}
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.cream, WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
          {bottom}
        </div>
      </div>
    </div>
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "26px 40px 30px",
        borderRadius: 36,
        background: "linear-gradient(180deg, rgba(74,42,23,0.9), rgba(43,23,12,0.92))",
        border: "4px solid #f3c27a",
        boxShadow: "0 14px 34px rgba(30,12,4,0.45)",
      }}
    >
      <Headline text="紅茶 × クッキー" size={86} f={f} at={at} sweepAt={sweepAt} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignSelf: "stretch" }}>
        {row(ease(f, row1At, 12, EASE.out), "1", "紅茶の渋みが", "脂っぽさを和らげる", TEA_ACCENT)}
        {row(ease(f, row2At, 12, EASE.out), "2", "紅茶に浸すと", "香りが広がる", COOKIE_ACCENT)}
      </div>
    </div>
  );
};
