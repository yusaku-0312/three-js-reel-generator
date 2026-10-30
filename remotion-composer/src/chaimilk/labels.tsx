import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { Chip } from "./overlays";

export { Hanko, StepChip } from "../royalmilk/labels";

/** Colour code for the two drinks (kept on every label of the reel). */
export const MILK_ACCENT = "#f0a04b";
export const CHAI_ACCENT = "#e07a3c";

const CupIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80">
    <path d="M10 14 H72 V40 Q72 70 41 70 Q10 70 10 40 Z" fill={color} stroke="#fff6e6" strokeWidth={6} />
    <path d="M72 24 Q92 24 90 40 Q88 54 70 52" fill="none" stroke="#fff6e6" strokeWidth={6} />
  </svg>
);

/** Kulhad icon: a tapered clay cup without a handle. */
const KulhadIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 80 80">
    <path d="M14 10 H66 L58 72 H22 Z" fill={CHAI_ACCENT} stroke="#fff6e6" strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

export const DrinkChip: React.FC<{ kind: "milk" | "chai"; size?: number; text?: string }> = ({ kind, size = 50, text }) =>
  kind === "milk" ? (
    <Chip text={text ?? "ミルクティー"} size={size} accent={MILK_ACCENT}>
      <CupIcon size={size * 0.9} color={MILK_ACCENT} />
    </Chip>
  ) : (
    <Chip text={text ?? "チャイ"} size={size} accent={CHAI_ACCENT}>
      <KulhadIcon size={size} />
    </Chip>
  );

/** Red ✕ drawn in two strokes (each stroke wipes on). */
export const CrossMark: React.FC<{ f: number; at: number; size?: number }> = ({ f, at, size = 260 }) => {
  const a = ease(f, at, 5, EASE.out);
  const b = ease(f, at + 4, 5, EASE.out);
  if (a <= 0) return null;
  const len = 120;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 6px 14px rgba(30,12,4,0.5))" }}>
      {[
        ["M16 16 L84 84", a],
        ["M84 16 L16 84", b],
      ].map(([d, k]) => (
        <path
          key={d as string}
          d={d as string}
          stroke="#ff4a3a"
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - (k as number))}
        />
      ))}
    </svg>
  );
};

const Bar: React.FC<{ label: string; color: string; k: number; to: number }> = ({ label, color, k, to }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
    <div style={{ width: 250, textAlign: "right", fontFamily: FONT, fontWeight: 900, fontSize: 38, color: C.cream, whiteSpace: "nowrap" }}>{label}</div>
    <div style={{ width: 380, height: 40, borderRadius: 999, background: "rgba(255,240,220,0.18)", overflow: "hidden" }}>
      <div style={{ width: `${k * to * 100}%`, height: "100%", borderRadius: 999, background: color, boxShadow: `0 0 16px ${color}` }} />
    </div>
  </div>
);

/** Tea strength: milk tea short amber, chai long terracotta. */
export const StrengthBars: React.FC<{ f: number; milkAt: number; chaiAt: number }> = ({ f, milkAt, chaiAt }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: "22px 34px",
      borderRadius: 32,
      background: "linear-gradient(180deg, rgba(74,42,23,0.92), rgba(43,23,12,0.92))",
      border: "4px solid #f3c27a",
      boxShadow: "0 12px 30px rgba(30,12,4,0.45)",
    }}
  >
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: "#f3c27a", textAlign: "center" }}>紅茶の濃さ</div>
    <Bar label="ミルクティー" color={MILK_ACCENT} k={ease(f, milkAt, 18, EASE.out)} to={0.45} />
    <Bar label="チャイ" color={CHAI_ACCENT} k={ease(f, chaiAt, 24, EASE.out)} to={1} />
  </div>
);

/** Word label pinned to a map point: the form of the word, big, with a small reading underneath. */
export const WordTag: React.FC<{ word: string; note: string; f: number; at: number; accent?: string }> = ({ word, note, f, at, accent = "#f3c27a" }) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  const s = interpolate(f, [at, at + 5, at + 9], [0.6, 1.06, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: k, transform: `scale(${s})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Chip text={word} size={50} accent={accent} />
      <div style={{ marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: "#fff6e6", WebkitTextStroke: "8px #2a150a", paintOrder: "stroke fill" }}>
        {note}
      </div>
    </div>
  );
};
