import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { Chip, Headline, TEAL } from "./overlays";

/** Colour code for the two drinks (kept on every label of the reel). */
export const MILK_ACCENT = "#f0a04b";
export const ROYAL_GOLD = "#f3cf7a";
const ROYAL_NAVY = "linear-gradient(180deg, rgba(34,44,98,0.95), rgba(18,24,62,0.95))";

const Crown: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 100 78">
    <path d="M6 70 L12 20 L33 44 L50 8 L67 44 L88 20 L94 70 Z" fill={ROYAL_GOLD} stroke="#a77a1e" strokeWidth={4} strokeLinejoin="round" />
    <circle cx={50} cy={8} r={7} fill="#fff3c8" />
    <circle cx={12} cy={20} r={6} fill="#fff3c8" />
    <circle cx={88} cy={20} r={6} fill="#fff3c8" />
  </svg>
);

const CupIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80">
    <path d="M10 14 H72 V40 Q72 70 41 70 Q10 70 10 40 Z" fill={color} stroke="#fff6e6" strokeWidth={6} />
    <path d="M72 24 Q92 24 90 40 Q88 54 70 52" fill="none" stroke="#fff6e6" strokeWidth={6} />
  </svg>
);

/** Name label for one of the two drinks: milk tea = amber cup icon, royal = navy chip with a gold crown. */
export const DrinkChip: React.FC<{ kind: "milk" | "royal"; size?: number; text?: string }> = ({ kind, size = 50, text }) =>
  kind === "milk" ? (
    <Chip text={text ?? "ミルクティー"} size={size} accent={MILK_ACCENT}>
      <CupIcon size={size * 0.9} color={MILK_ACCENT} />
    </Chip>
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.3,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color: ROYAL_GOLD,
        background: ROYAL_NAVY,
        border: `4px solid ${ROYAL_GOLD}`,
        borderRadius: 999,
        padding: `${size * 0.24}px ${size * 0.62}px`,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 26px rgba(10,10,40,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      <Crown size={size * 0.95} />
      {text ?? "ロイヤルミルクティー"}
    </div>
  );

/** Big ≠ that thumps in with a little overshoot. */
export const NotEqual: React.FC<{ f: number; at: number; size?: number }> = ({ f, at, size = 220 }) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  const scale = interpolate(f, [at, at + 5, at + 9], [1.9, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ transform: `scale(${scale})`, opacity: k }}>
      <Headline text="≠" size={size} f={f} at={at - 10} />
    </div>
  );
};

/** One labelled bar that grows to `to` (0..1 of the max width). */
const Bar: React.FC<{ label: string; color: string; k: number; to: number; note: string }> = ({ label, color, k, to, note }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, fontWeight: 900, color: C.cream }}>
    <div style={{ width: 120, fontSize: 46, textAlign: "right" }}>{label}</div>
    <div style={{ width: 420, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
      <div style={{ width: `${Math.max(0.02, to * k) * 100}%`, height: "100%", borderRadius: 23, background: color, boxShadow: `0 0 16px ${color}` }} />
    </div>
    <div style={{ width: 170, fontSize: 38, color, opacity: k, whiteSpace: "nowrap" }}>{note}</div>
  </div>
);

/** お湯 (short) vs 牛乳 (long): the royal milk tea ratio. */
export const RatioBars: React.FC<{ f: number; waterAt: number; milkAt: number }> = ({ f, waterAt, milkAt }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 18,
      padding: "26px 34px",
      borderRadius: 32,
      background: "linear-gradient(180deg, rgba(74,42,23,0.9), rgba(43,23,12,0.92))",
      border: "4px solid #f3c27a",
      boxShadow: "0 14px 34px rgba(30,12,4,0.45)",
    }}
  >
    <Bar label="お湯" color="#8fd3ff" k={ease(f, waterAt, 14, EASE.out)} to={0.22} note="少し" />
    <Bar label="牛乳" color="#fff6e8" k={ease(f, milkAt, 22, EASE.out)} to={1} note="たっぷり" />
  </div>
);

/** Numbered how-to step in the teal "tip" colour. */
export const StepChip: React.FC<{ n: string; text: string; size?: number }> = ({ n, text, size = 46 }) => (
  <Chip text={text} size={size} accent="#7fe0d3">
    <div
      style={{
        width: size * 1.15,
        height: size * 1.15,
        borderRadius: 999,
        background: TEAL,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.8,
        border: "3px solid #bff3ea",
      }}
    >
      {n}
    </div>
  </Chip>
);

/** Square vermilion seal (hanko) that thumps in, e.g. 和製/英語. */
export const Hanko: React.FC<{ f: number; at: number; lines: [string, string] }> = ({ f, at, lines }) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  const scale = interpolate(f, [at, at + 5, at + 9], [1.8, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        width: 300,
        height: 300,
        borderRadius: 28,
        border: "14px solid #d8382a",
        background: "rgba(255,248,236,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale}) rotate(-8deg)`,
        opacity: k,
        boxShadow: "0 14px 34px rgba(30,12,4,0.45)",
        fontFamily: FONT,
        fontWeight: 900,
        color: "#d8382a",
        fontSize: 110,
        lineHeight: 1.05,
      }}
    >
      <div>{lines[0]}</div>
      <div>{lines[1]}</div>
    </div>
  );
};

/** Year that counts up from `from` to `to` and lands, with a suffix (1965年ごろ). */
export const YearCount: React.FC<{ f: number; at: number; from: number; to: number; suffix: string; size?: number }> = ({
  f,
  at,
  from,
  to,
  suffix,
  size = 150,
}) => {
  const n = Math.round(from + (to - from) * ease(f, at, 22, EASE.out));
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, opacity: ease(f, at - 2, 6, EASE.out) }}>
      <Headline text={String(n)} size={size} f={f} at={at - 10} />
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size * 0.4, color: C.cream, WebkitTextStroke: "10px #2a150a", paintOrder: "stroke fill" }}>
        {suffix}
      </div>
    </div>
  );
};
