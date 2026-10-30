import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { SERIF } from "../golden2/overlays";
import { Chip, Headline } from "./overlays";

export { TanninIcon } from "../cookietea/labels";

/** Colour code kept on every label: pale amber = すっきり / 絞らない, red-brown = 渋み・濃い / 絞る. */
export const LIGHT = "#f6c77a";
export const STRONG = "#c8562a";
export const TANNIN = "#f0a04b";
export const NG = "#ff5a4a";
export const OK = "#3fc2a8";
const INK = "#2a150a";
const MILK = "#f6efe2";

const PANEL: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(74,42,23,0.94), rgba(43,23,12,0.96))",
  border: "4px solid #f3c27a",
  borderRadius: 32,
  boxShadow: "0 14px 34px rgba(30,12,4,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
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

/** Small round swatch inside a chip. */
export const Swatch: React.FC<{ color: string; size?: number }> = ({ color, size = 30 }) => (
  <div style={{ width: size, height: size, borderRadius: 999, background: color, boxShadow: `0 0 12px ${color}`, border: "3px solid rgba(255,250,240,0.85)" }} />
);

/** A chip that a red line slashes through at `strikeAt`, then dims (「…わけではありません」). */
export const StrikeChip: React.FC<{ f: number; at: number; strikeAt: number; text: string; accent?: string }> = ({ f, at, strikeAt, text, accent }) => {
  const s = ease(f, strikeAt, 8, EASE.out);
  return (
    <div style={{ position: "relative", opacity: 1 - 0.35 * s }}>
      <PopChip f={f} at={at} text={text} accent={accent} />
      {s > 0 && (
        <div
          style={{
            position: "absolute",
            left: -24,
            top: "50%",
            height: 14,
            width: `calc(${s * 100}% + ${s * 48}px)`,
            background: NG,
            borderRadius: 8,
            transform: "translateY(-50%) rotate(-5deg)",
            transformOrigin: "left center",
            boxShadow: "0 4px 12px rgba(30,12,4,0.5)",
          }}
        />
      )}
    </div>
  );
};

/** Timer ring that fills while the bag steeps (no minutes: the script names none), caption underneath. */
export const SteepRing: React.FC<{ f: number; at: number; dur: number; caption: string; size?: number }> = ({ f, at, dur, caption, size = 210 }) => {
  const k = ease(f, at, dur, EASE.inOut);
  const r = size * 0.4;
  const len = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r + 18} fill="rgba(43,23,12,0.9)" stroke="#f3c27a" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,240,220,0.18)" strokeWidth={18} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={TANNIN}
          strokeWidth={18}
          strokeLinecap="round"
          strokeDasharray={`${len * k} ${len}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <g transform={`rotate(${k * 360} ${size / 2} ${size / 2})`}>
          <line x1={size / 2} y1={size / 2} x2={size / 2} y2={size / 2 - r + 22} stroke={MILK} strokeWidth={8} strokeLinecap="round" />
        </g>
        <circle cx={size / 2} cy={size / 2} r={9} fill={MILK} />
      </svg>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.cream, WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
        {caption}
      </div>
    </div>
  );
};

/** Closing card: the question, 絞る派 / 絞らない派 as two chips, then a speech bubble asking for a comment. */
export const AskCard: React.FC<{ f: number; at: number; aAt: number; bAt: number; commentAt: number }> = ({ f, at, aAt, bAt, commentAt }) => {
  const c = ease(f, commentAt, 10, EASE.out);
  const side = (k: number, name: string, color: string, sub: string) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        border: `5px solid ${color}`,
        borderRadius: 28,
        padding: "12px 30px 14px",
        background: "rgba(30,14,6,0.55)",
        opacity: k,
        transform: `scale(${0.8 + 0.2 * k})`,
      }}
    >
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 58, color, whiteSpace: "nowrap" }}>{name}</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.cream, whiteSpace: "nowrap" }}>{sub}</div>
    </div>
  );
  return (
    <div style={{ ...PANEL, width: 800, padding: "22px 30px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ fontFamily: SERIF, fontSize: 34, letterSpacing: 8, color: "#f3c27a" }}>WHICH ARE YOU?</div>
      <Headline text="あなたはどっち？" size={72} f={f} at={at + 2} sweepAt={at + 22} />
      <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
        {side(ease(f, aAt, 8, EASE.out), "絞る派", STRONG, "しっかり濃いめ")}
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.cream, opacity: ease(f, bAt, 8, EASE.out) }}>or</div>
        {side(ease(f, bAt, 8, EASE.out), "絞らない派", LIGHT, "すっきり")}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 46,
          color: "#3a1d0e",
          whiteSpace: "nowrap",
          background: MILK,
          borderRadius: 40,
          padding: "14px 40px",
          opacity: c,
          transform: `scale(${0.85 + 0.15 * c})`,
          boxShadow: "0 8px 22px rgba(30,12,4,0.4)",
        }}
      >
        コメントで教えてね！
      </div>
    </div>
  );
};
