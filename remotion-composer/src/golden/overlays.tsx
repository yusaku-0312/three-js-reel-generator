import React from "react";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { pop, ramp } from "../koucha/anim";
import { C, FONT } from "../koucha/theme";

const { fontFamily: serif } = loadFont("normal", { weights: ["700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true });

export const SERIF = `${serif}, Georgia, serif`;
export const GOLD_GRADIENT = "linear-gradient(180deg, #fff3b0 0%, #ffd34d 38%, #f0a020 70%, #ffe27a 100%)";
const SHADOW = "drop-shadow(0 6px 14px rgba(0,0,0,0.55))";

/** Pop-in scale for an overlay that appears at `at` and leaves at `out` (frames, scene-local). */
export const appear = (f: number, at: number, out?: number) =>
  out === undefined ? pop(f, at) : Math.min(pop(f, at), 1 - ramp(f, out, 8));

/** Gold text with a dark outline: outline layer under a gradient-clipped fill layer. */
export const GoldText: React.FC<{ text: string; size: number; font?: string; stroke?: number; spacing?: number }> = ({
  text,
  size,
  font = FONT,
  stroke = 14,
  spacing = 0,
}) => {
  const base: React.CSSProperties = {
    fontFamily: font,
    fontWeight: 900,
    fontSize: size,
    letterSpacing: spacing,
    whiteSpace: "nowrap",
    lineHeight: 1.1,
  };
  return (
    <div style={{ position: "relative", filter: SHADOW }}>
      <div style={{ ...base, color: C.ink, WebkitTextStroke: `${stroke}px #3a1a08` }}>{text}</div>
      <div
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          background: GOLD_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Centred block at a screen position with a pop scale. */
export const At: React.FC<{ x: number; y: number; k: number; children: React.ReactNode; rotate?: number }> = ({
  x,
  y,
  k,
  children,
  rotate = 0,
}) =>
  k <= 0.001 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${k}) rotate(${rotate}deg)`,
        opacity: Math.min(1, k * 1.5),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );

export const Pill: React.FC<{ text: string; size?: number; bg?: string; color?: string; border?: string }> = ({
  text,
  size = 46,
  bg = "rgba(43,20,8,0.88)",
  color = C.cream,
  border = "#ffc93c",
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      color,
      background: bg,
      border: `5px solid ${border}`,
      borderRadius: 999,
      padding: `${size * 0.22}px ${size * 0.6}px`,
      whiteSpace: "nowrap",
      boxShadow: "0 8px 22px rgba(0,0,0,0.45)",
    }}
  >
    {text}
  </div>
);

/** Dashed gold ring around a tracked point, gently pulsing. */
export const Spotlight: React.FC<{ x: number; y: number; k: number; f: number; r?: number }> = ({ x, y, k, f, r = 80 }) =>
  k <= 0.001 ? null : (
    <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
      <circle
        cx={x}
        cy={y}
        r={r * k * (1 + 0.06 * Math.sin(f / 5))}
        fill="none"
        stroke="#ffd34d"
        strokeWidth={7}
        strokeDasharray="18 14"
        strokeDashoffset={-f * 2}
        opacity={k}
      />
    </svg>
  );

/** Simplified Union Jack. */
export const UnionJack: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w / 2} viewBox="0 0 60 30" style={{ borderRadius: 6, boxShadow: "0 6px 16px rgba(0,0,0,0.5)" }}>
    <clipPath id="uj">
      <rect width="60" height="30" />
    </clipPath>
    <g clipPath="url(#uj)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2.4" />
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

/** Round hanko-style stamp. */
export const Stamp: React.FC<{ text: string; color: string; size?: number }> = ({ text, color, size = 200 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `${size * 0.06}px solid ${color}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size * (text.length > 3 ? 0.19 : text.length > 2 ? 0.26 : 0.46),
      color,
      background: "rgba(255,246,230,0.92)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);
