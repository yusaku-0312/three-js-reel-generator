import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { Chip, Headline } from "./overlays";

/** Colour code for the two drinks (kept on every label of the reel): amber cup vs cream foam glass. */
export const MILK_ACCENT = "#f0a04b";
export const LATTE_ACCENT = "#f6e7cc";
const INK = "#2a150a";

const CupIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80">
    <path d="M10 14 H72 V40 Q72 70 41 70 Q10 70 10 40 Z" fill={color} stroke="#fff6e6" strokeWidth={6} />
    <path d="M72 24 Q92 24 90 40 Q88 54 70 52" fill="none" stroke="#fff6e6" strokeWidth={6} />
  </svg>
);

/** Tall glass with a foam cap: the tea-latte icon. */
const GlassIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 80 100">
    <path d="M14 26 L18 92 H58 L62 26 Z" fill="#c48f5e" stroke="#fff6e6" strokeWidth={5} strokeLinejoin="round" />
    <path d="M12 28 Q14 8 38 10 Q62 8 64 28 Z" fill="#fffaf0" stroke="#fff6e6" strokeWidth={4} />
    <path d="M62 40 Q78 40 76 56 Q74 70 60 68" fill="none" stroke="#fff6e6" strokeWidth={5} />
  </svg>
);

/** Name label for one of the two drinks: milk tea = amber cup icon, tea latte = cream edge, foam glass icon. */
export const DrinkChip: React.FC<{ kind: "milk" | "latte"; size?: number; text?: string }> = ({ kind, size = 50, text }) =>
  kind === "milk" ? (
    <Chip text={text ?? "ミルクティー"} size={size} accent={MILK_ACCENT}>
      <CupIcon size={size * 0.9} color={MILK_ACCENT} />
    </Chip>
  ) : (
    <Chip text={text ?? "ティーラテ"} size={size} accent={LATTE_ACCENT}>
      <GlassIcon size={size * 1.05} />
    </Chip>
  );

const thump = (f: number, at: number) =>
  interpolate(f, [at, at + 5, at + 9], [1.9, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** A big glyph (？, 1 : 1) that thumps in with a little overshoot. */
export const Thump: React.FC<{ text: string; f: number; at: number; size?: number }> = ({ text, f, at, size = 220 }) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  return (
    <div style={{ transform: `scale(${thump(f, at)})`, opacity: k }}>
      <Headline text={text} size={size} f={f} at={at - 10} />
    </div>
  );
};

/** Small cream label with a coloured dot, used to name the two layers of the half-and-half diagram. */
export const LayerTag: React.FC<{ text: string; color: string; size?: number }> = ({ text, color, size = 46 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: size * 0.3,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      color: C.cream,
      WebkitTextStroke: `9px ${INK}`,
      paintOrder: "stroke fill",
      whiteSpace: "nowrap",
    }}
  >
    <div style={{ width: size * 0.62, height: size * 0.62, borderRadius: 999, background: color, border: "4px solid #fff6e6", boxShadow: `0 0 14px ${color}` }} />
    {text}
  </div>
);

/** End card: one row per drink, name chip on top and its recipe underneath. */
export const SummaryCard: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const row = (k: number, kind: "milk" | "latte", recipe: string, accent: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: k, transform: `translateY(${(1 - k) * 24}px)` }}>
      <DrinkChip kind={kind} size={42} />
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: accent, WebkitTextStroke: `9px ${INK}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
        {recipe}
      </div>
    </div>
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        padding: "24px 36px",
        borderRadius: 36,
        background: "linear-gradient(180deg, rgba(74,42,23,0.9), rgba(43,23,12,0.92))",
        border: "4px solid #f3c27a",
        boxShadow: "0 14px 34px rgba(30,12,4,0.45)",
      }}
    >
      {row(ease(f, at, 12, EASE.out), "milk", "紅茶＋ミルク少し", MILK_ACCENT)}
      {row(ease(f, at + 10, 12, EASE.out), "latte", "濃い紅茶＋スチームミルク＋泡", LATTE_ACCENT)}
    </div>
  );
};
