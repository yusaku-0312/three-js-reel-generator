import React from "react";
import { interpolate } from "remotion";
import { sec } from "../koucha/anim";
import { C, FONT, H, W } from "../koucha/theme";
import { sceneAt, TL } from "../golden/core";
import { GOLD_GRADIENT, SERIF } from "../golden/overlays";
import { ease, EASE } from "./shot";
import { SceneDef2 } from "./types";

export { GoldText, SERIF } from "../golden/overlays";

const INK = "#24110a";
/** Centre of the readable band x 140–940 (right of 940 sits under the Reels action column). */
export const SAFE_CX = 540;

/** Fade + small rise for an overlay that enters at `at` and leaves at `out` (scene-local frames). */
export const reveal = (f: number, at: number, out?: number) => {
  const inK = ease(f, at, 9, EASE.out);
  const outK = out === undefined ? 1 : 1 - ease(f, out, 8, EASE.in);
  return Math.min(inK, outK);
};

export const Layer: React.FC<{ x: number; y: number; k: number; children: React.ReactNode; rise?: number }> = ({
  x,
  y,
  k,
  children,
  rise = 18,
}) =>
  k <= 0.001 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${(1 - k) * rise}px)`,
        opacity: k,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );

/** Series band: same copy and position as the other 紅茶の雑学 reels, restyled espresso + gold hairlines. */
export const Band: React.FC<{ frame: number; scenes: Record<string, SceneDef2> }> = ({ frame, scenes }) => {
  const scene = sceneAt(frame);
  const k = ease(frame, sec(scene.start) + 2, 10, EASE.out);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="band2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1d0e" stopOpacity="0.96" />
          <stop offset="1" stopColor="#1f0e06" stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id="hair" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9962e" stopOpacity="0" />
          <stop offset="0.2" stopColor="#f2c86a" />
          <stop offset="0.8" stopColor="#f2c86a" />
          <stop offset="1" stopColor="#c9962e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={0} y={276} width={W} height={196} fill="url(#band2)" />
      <rect x={0} y={283} width={W} height={2} fill="url(#hair)" />
      <rect x={0} y={463} width={W} height={2} fill="url(#hair)" />
      <text x={SAFE_CX} y={362} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={74} fill={C.cream} letterSpacing={2}>
        知ってた？紅茶の雑学
      </text>
      <text
        x={SAFE_CX}
        y={430}
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight={900}
        fontSize={44}
        fill="#f6c45a"
        opacity={k}
        letterSpacing={4}
      >
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
        fontFamily: FONT, fontWeight: 900, fontSize: 70, color: C.white, lineHeight: 1.2,
        WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill",
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
      }}
    >
      {sub.text}
    </div>
  );
};

/** Letters arrive one by one (stagger), settle without bounce. */
export const Stagger: React.FC<{ text: string; f: number; at: number; step?: number; style: React.CSSProperties }> = ({
  text,
  f,
  at,
  step = 2,
  style,
}) => (
  <div style={{ display: "flex", whiteSpace: "pre" }}>
    {[...text].map((ch, i) => {
      const k = ease(f, at + i * step, 10, EASE.out);
      return (
        <span key={i} style={{ ...style, opacity: k, transform: `translateY(${(1 - k) * 22}px)`, display: "inline-block" }}>
          {ch}
        </span>
      );
    })}
  </div>
);

/** Japanese headline in a gold gradient with a dark edge, plus a light sweep across it once. */
export const Headline: React.FC<{ text: string; size: number; f: number; at: number; sweepAt?: number }> = ({
  text,
  size,
  f,
  at,
  sweepAt,
}) => {
  const sweep = sweepAt === undefined ? -1 : interpolate(f, [sweepAt, sweepAt + 22], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const base: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: 2 };
  return (
    <div style={{ position: "relative", filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.65))" }}>
      <Stagger text={text} f={f} at={at} style={{ ...base, color: INK, WebkitTextStroke: `${size * 0.16}px #2a1206` }} />
      <div style={{ position: "absolute", inset: 0 }}>
        <Stagger
          text={text}
          f={f}
          at={at}
          style={{
            ...base,
            // Longhand only: React re-applying the `background` shorthand would reset background-clip.
            backgroundImage: sweep > -0.3 && sweep < 1.3
              ? `linear-gradient(100deg, rgba(255,255,255,0) ${(sweep - 0.12) * 100}%, rgba(255,255,255,0.95) ${sweep * 100}%, rgba(255,255,255,0) ${(sweep + 0.12) * 100}%), ${GOLD_GRADIENT}`
              : GOLD_GRADIENT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        />
      </div>
    </div>
  );
};

/** Letter-spaced serif kicker, e.g. GOLDEN DROP. */
export const Kicker: React.FC<{ text: string; f: number; at: number; size?: number }> = ({ text, f, at, size = 44 }) => (
  <Stagger
    text={text}
    f={f}
    at={at}
    step={1.5}
    style={{ fontFamily: SERIF, fontSize: size, letterSpacing: size * 0.3, color: "#ffe2a0", textShadow: "0 3px 12px rgba(0,0,0,0.8)" }}
  />
);

/** Dark smoked-glass chip with a thin gold edge. */
export const Chip: React.FC<{ text: string; size?: number; accent?: string; children?: React.ReactNode }> = ({
  text,
  size = 44,
  accent = "#e9b955",
  children,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: size * 0.35,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      color: C.cream,
      background: "linear-gradient(180deg, rgba(48,24,11,0.86), rgba(24,11,5,0.86))",
      border: `3px solid ${accent}`,
      borderRadius: 999,
      padding: `${size * 0.24}px ${size * 0.62}px`,
      whiteSpace: "nowrap",
      boxShadow: "0 10px 26px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,235,190,0.25)",
    }}
  >
    {children}
    {text}
  </div>
);

/** Thin gold ring drawn around a tracked point (draws itself on, then breathes). */
export const FocusRing: React.FC<{ x: number; y: number; r: number; f: number; at: number; out?: number }> = ({ x, y, r, f, at, out }) => {
  const draw = ease(f, at, 14, EASE.out);
  const k = reveal(f, at, out);
  if (k <= 0) return null;
  const c = 2 * Math.PI * r;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0 }} width={W} height={H}>
      <circle
        cx={x}
        cy={y}
        r={r * (1 + 0.03 * Math.sin(f / 7))}
        fill="none"
        stroke="#ffd36a"
        strokeWidth={4}
        strokeDasharray={`${c * draw} ${c}`}
        transform={`rotate(-90 ${x} ${y})`}
        opacity={k}
        style={{ filter: "drop-shadow(0 0 8px rgba(255,190,80,0.8))" }}
      />
    </svg>
  );
};

/** Small hedge note such as ※諸説あり. */
export const Note: React.FC<{ text: string; size?: number }> = ({ text, size = 34 }) => (
  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, color: "#f5e6cc", textShadow: "0 2px 8px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
    {text}
  </div>
);

/** Soft dark pool behind a headline so it reads over bright porcelain without a hard box. */
export const Scrim: React.FC<{ y: number; k: number; height?: number }> = ({ y, k, height = 300 }) =>
  k <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: SAFE_CX - 560,
        top: y - height / 2,
        width: 1120,
        height,
        opacity: k,
        background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(14,6,2,0.62) 0%, rgba(14,6,2,0.35) 55%, rgba(14,6,2,0) 100%)",
      }}
    />
  );
