import React from "react";
import { interpolate } from "remotion";
import { sec } from "../koucha/anim";
import { C, FONT, H, W } from "../koucha/theme";
import { Layer, reveal, SAFE_CX, SERIF, Stagger } from "../golden2/overlays";
import { ease, EASE } from "../golden2/shot";
import { sceneAt, TL } from "./core";
import { SceneDefP } from "./types";

export { Layer, reveal, SAFE_CX, Stagger } from "../golden2/overlays";

/** Series title on the band (the same copy on every reel of the series). */
export const SERIES = "知ってた？紅茶の雑学";
const INK = "#0d3a40";
const TEAL = "#0e5a63";
/** Sunny yellow into coral: the headline fill. */
export const SUN_GRADIENT = "linear-gradient(180deg, #fffbd0 0%, #ffe066 35%, #ffa23a 72%, #ff7a5c 100%)";

/** Series band: same copy and position as the other 紅茶の雑学 reels, restyled deep lagoon + sun hairlines. */
export const Band: React.FC<{ frame: number; scenes: Record<string, SceneDefP> }> = ({ frame, scenes }) => {
  const scene = sceneAt(frame);
  const k = ease(frame, sec(scene.start) + 2, 10, EASE.out);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="pband" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f6670" stopOpacity="0.95" />
          <stop offset="1" stopColor="#08434b" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="phair" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffb347" stopOpacity="0" />
          <stop offset="0.2" stopColor="#ffd86b" />
          <stop offset="0.8" stopColor="#ff9a6b" />
          <stop offset="1" stopColor="#ff9a6b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={0} y={276} width={W} height={196} fill="url(#pband)" />
      <rect x={0} y={283} width={W} height={2} fill="url(#phair)" />
      <rect x={0} y={463} width={W} height={2} fill="url(#phair)" />
      <text x={SAFE_CX} y={362} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={74} fill={C.cream} letterSpacing={2}>
        {SERIES}
      </text>
      <text x={SAFE_CX} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#ffd86b" opacity={k} letterSpacing={4}>
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
        filter: "drop-shadow(0 4px 10px rgba(0,30,35,0.55))",
      }}
    >
      {sub.text}
    </div>
  );
};

/** Japanese headline in the sun gradient with a lagoon edge, plus one light sweep. */
export const Headline: React.FC<{ text: string; size: number; f: number; at: number; sweepAt?: number }> = ({ text, size, f, at, sweepAt }) => {
  const sweep = sweepAt === undefined ? -1 : interpolate(f, [sweepAt, sweepAt + 22], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const base: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: 2 };
  return (
    <div style={{ position: "relative", filter: "drop-shadow(0 6px 16px rgba(0,40,45,0.55))" }}>
      <Stagger text={text} f={f} at={at} style={{ ...base, color: INK, WebkitTextStroke: `${size * 0.16}px ${INK}` }} />
      <div style={{ position: "absolute", inset: 0 }}>
        <Stagger
          text={text}
          f={f}
          at={at}
          style={{
            ...base,
            // Longhand only: React re-applying the `background` shorthand would reset background-clip.
            backgroundImage:
              sweep > -0.3 && sweep < 1.3
                ? `linear-gradient(100deg, rgba(255,255,255,0) ${(sweep - 0.12) * 100}%, rgba(255,255,255,0.95) ${sweep * 100}%, rgba(255,255,255,0) ${(sweep + 0.12) * 100}%), ${SUN_GRADIENT}`
                : SUN_GRADIENT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        />
      </div>
    </div>
  );
};

/** Letter-spaced serif kicker, e.g. PARADISE TEA. */
export const Kicker: React.FC<{ text: string; f: number; at: number; size?: number; color?: string }> = ({ text, f, at, size = 44, color = "#fff6d8" }) => (
  <Stagger
    text={text}
    f={f}
    at={at}
    step={1.5}
    style={{ fontFamily: SERIF, fontSize: size, letterSpacing: size * 0.3, color, textShadow: "0 3px 12px rgba(0,40,45,0.8)" }}
  />
);

/** Lagoon smoked-glass chip with a coloured edge (the flower's colour, or sun yellow). */
export const Chip: React.FC<{ text: string; size?: number; accent?: string; children?: React.ReactNode }> = ({
  text,
  size = 44,
  accent = "#ffd86b",
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
      background: "linear-gradient(180deg, rgba(14,90,99,0.9), rgba(8,58,64,0.9))",
      border: `4px solid ${accent}`,
      borderRadius: 999,
      padding: `${size * 0.24}px ${size * 0.62}px`,
      whiteSpace: "nowrap",
      boxShadow: "0 10px 26px rgba(0,40,45,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
    }}
  >
    {children}
    {text}
  </div>
);

/** Coloured dot used inside chips (flower swatch). */
export const Dot: React.FC<{ color: string; size?: number }> = ({ color, size = 30 }) => (
  <div style={{ width: size, height: size, borderRadius: 999, background: color, boxShadow: `0 0 12px ${color}`, border: "3px solid rgba(255,255,255,0.8)" }} />
);

/** Round rubber stamp that thumps in (slight overshoot), e.g. 果物 0個. */
export const Stamp: React.FC<{ f: number; at: number; top: string; big: string; color?: string }> = ({ f, at, top, big, color = "#ff5a4a" }) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  const scale = interpolate(f, [at, at + 5, at + 9], [1.8, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        width: 360,
        height: 360,
        borderRadius: 999,
        border: `12px solid ${color}`,
        background: "rgba(255,250,240,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale}) rotate(-10deg)`,
        opacity: k,
        boxShadow: "0 14px 34px rgba(0,40,45,0.35)",
        fontFamily: FONT,
        fontWeight: 900,
        color,
      }}
    >
      <div style={{ fontSize: 64, lineHeight: 1 }}>{top}</div>
      <div style={{ fontSize: 150, lineHeight: 1 }}>{big}</div>
    </div>
  );
};

/** Big number that counts up (eased) and lands; `suffix` follows it, e.g. 年以上. */
export const CountUp: React.FC<{ f: number; at: number; to: number; dur?: number; suffix: string; size?: number }> = ({
  f,
  at,
  to,
  dur = 20,
  suffix,
  size = 170,
}) => {
  const n = Math.round(to * ease(f, at, dur, EASE.out));
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <Headline text={String(n)} size={size} f={f} at={at - 1} />
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size * 0.36, color: C.cream, WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill" }}>
        {suffix}
      </div>
    </div>
  );
};

/** Soft lagoon pool behind overlays so they read over the bright set without a hard box. */
export const Scrim: React.FC<{ y: number; k: number; height?: number; strength?: number }> = ({ y, k, height = 320, strength = 0.5 }) =>
  k <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: SAFE_CX - 560,
        top: y - height / 2,
        width: 1120,
        height,
        opacity: k,
        background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(6,45,52,${strength}) 0%, rgba(6,45,52,${strength * 0.55}) 55%, rgba(6,45,52,0) 100%)`,
      }}
    />
  );

export { TEAL };
