import React from "react";
import { interpolate } from "remotion";
import { sec } from "../koucha/anim";
import { FONT, H, W } from "../koucha/theme";
import { Layer, reveal, SAFE_CX, Stagger } from "../golden2/overlays";
import { ease, EASE, project2, Shot2 } from "../golden2/shot";
import { sceneAt, TL, V3 } from "./core";
import { SceneDefP } from "./types";

export { Layer, reveal, SAFE_CX, Stagger } from "../golden2/overlays";

/** Series title on the band (the account's band colour, black type). */
export const SERIES = "親子で守る AI防犯";
export const INK = "#0f1626";
const BAND = "rgb(128,242,255)";

export const COL = {
  pink: "#ff7ab6",
  teal: "#16b8a4",
  red: "#ff3b4a",
  cyan: "#5ff0ff",
  cream: "#fff7e8",
  white: "#ffffff",
};

/** Series band: brand cyan, series name on top, the scene's topic below. */
export const Band: React.FC<{ frame: number; scenes: Record<string, SceneDefP> }> = ({ frame, scenes }) => {
  const scene = sceneAt(frame);
  const k = ease(frame, sec(scene.start) + 2, 10, EASE.out);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <rect x={0} y={276} width={W} height={196} fill={BAND} />
      <rect x={0} y={466} width={W} height={6} fill={INK} opacity={0.85} />
      <text x={SAFE_CX} y={362} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={74} fill={INK} letterSpacing={2}>
        {SERIES}
      </text>
      <text x={SAFE_CX} y={432} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#0b5560" opacity={k} letterSpacing={3}>
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
        fontFamily: FONT, fontWeight: 900, fontSize: 70, color: COL.white, lineHeight: 1.2,
        WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill",
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.55))",
      }}
    >
      {sub.text}
    </div>
  );
};

const GRADS = {
  light: "linear-gradient(180deg, #ffffff 0%, #e9fdff 50%, #9ff4ff 100%)",
  teal: "linear-gradient(180deg, #e9fffb 0%, #7ff0de 55%, #22c7b0 100%)",
  red: "linear-gradient(180deg, #fff0f0 0%, #ff9a9a 50%, #ff3b4a 100%)",
  pink: "linear-gradient(180deg, #fff2f8 0%, #ffb3d6 55%, #ff7ab6 100%)",
} as const;
export type Tone = keyof typeof GRADS;

/** Headline: gradient fill with a thick ink edge, letters rising in one after another. */
export const Headline: React.FC<{ text: string; size: number; f: number; at: number; tone?: Tone }> = ({ text, size, f, at, tone = "light" }) => {
  const base: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.12, letterSpacing: 2 };
  return (
    <div style={{ position: "relative", filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.55))" }}>
      <Stagger text={text} f={f} at={at} style={{ ...base, color: INK, WebkitTextStroke: `${size * 0.17}px ${INK}` }} />
      <div style={{ position: "absolute", inset: 0 }}>
        <Stagger
          text={text}
          f={f}
          at={at}
          style={{ ...base, backgroundImage: GRADS[tone], WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
        />
      </div>
    </div>
  );
};

/** Smoked-navy pill with a coloured edge. `mark` puts a ✓ or ✕ disc in front. */
export const Chip: React.FC<{ text: string; size?: number; accent?: string; mark?: "ok" | "ng" }> = ({ text, size = 46, accent = COL.cyan, mark }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: size * 0.3,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      color: COL.cream,
      background: "linear-gradient(180deg, rgba(20,30,56,0.92), rgba(10,16,32,0.92))",
      border: `5px solid ${accent}`,
      borderRadius: 999,
      padding: `${size * 0.22}px ${size * 0.6}px`,
      whiteSpace: "nowrap",
      boxShadow: "0 10px 26px rgba(0,0,0,0.4)",
    }}
  >
    {mark && <Mark kind={mark} size={size * 1.05} />}
    {text}
  </div>
);

export const Mark: React.FC<{ kind: "ok" | "ng"; size?: number }> = ({ kind, size = 60 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      background: kind === "ok" ? COL.teal : COL.red,
      color: "#fff",
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size * 0.7,
      lineHeight: `${size}px`,
      textAlign: "center",
      flexShrink: 0,
    }}
  >
    {kind === "ok" ? "✓" : "✕"}
  </div>
);

/** Round rubber stamp that thumps in, e.g. 偽物の声. */
export const Stamp: React.FC<{ f: number; at: number; text: string; color?: string; size?: number }> = ({ f, at, text, color = COL.red, size = 380 }) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  const scale = interpolate(f, [at, at + 5, at + 9], [1.8, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lines = text.split("\n");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: `14px solid ${color}`,
        background: "rgba(255,248,246,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale}) rotate(-10deg)`,
        opacity: k,
        boxShadow: "0 14px 34px rgba(0,0,0,0.4)",
        fontFamily: FONT,
        fontWeight: 900,
        color,
        lineHeight: 1.05,
      }}
    >
      {lines.map((l) => (
        <div key={l} style={{ fontSize: size * (lines.length > 1 ? 0.24 : 0.3) }}>
          {l}
        </div>
      ))}
    </div>
  );
};

const BUBBLE = {
  pink: { bg: "#ffe3ef", edge: COL.pink, ink: "#7a1d48" },
  red: { bg: "#ffe6e6", edge: COL.red, ink: "#7a1218" },
  teal: { bg: "#e2fbf6", edge: COL.teal, ink: "#0b4a42" },
  white: { bg: "#ffffff", edge: "#9aa6bf", ink: INK },
} as const;
export type BubbleTone = keyof typeof BUBBLE;

/**
 * Speech bubble whose tail points at a 3D point (a figure's head, a phone speaker). The bubble sits
 * `dy` px above that point, clamped inside the safe area.
 */
export const Bubble: React.FC<{
  shot: Shot2;
  at3: V3;
  text: string;
  k: number;
  tone?: BubbleTone;
  dy?: number;
  dx?: number;
  size?: number;
}> = ({ shot, at3, text, k, tone = "white", dy = 170, dx = 0, size = 52 }) => {
  if (k <= 0.001) return null;
  const p = project2(shot, at3);
  const c = BUBBLE[tone];
  const x = Math.min(Math.max(p.x + dx, 330), 750);
  const y = Math.min(Math.max(p.y - dy, 560), 1340);
  const tailX = Math.min(Math.max(p.x - x, -120), 120);
  const scale = interpolate(k, [0, 0.7, 1], [0.6, 1.06, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: Math.min(1, k * 1.5),
        transformOrigin: `${50 + (tailX / 4)}% 100%`,
      }}
    >
      <div
        style={{
          position: "relative",
          background: c.bg,
          border: `6px solid ${c.edge}`,
          borderRadius: 40,
          padding: `${size * 0.32}px ${size * 0.55}px`,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          color: c.ink,
          whiteSpace: "pre",
          textAlign: "center",
          lineHeight: 1.2,
          boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
        }}
      >
        {text}
        <div
          style={{
            position: "absolute",
            left: `calc(50% + ${tailX}px - 22px)`,
            bottom: -34,
            width: 0,
            height: 0,
            borderLeft: "22px solid transparent",
            borderRight: "22px solid transparent",
            borderTop: `34px solid ${c.edge}`,
          }}
        />
      </div>
    </div>
  );
};

/** HTML label pinned to a 3D point (no tail). */
export const At: React.FC<{ shot: Shot2; p: V3; k: number; dy?: number; children: React.ReactNode }> = ({ shot, p, k, dy = 0, children }) => {
  const s = project2(shot, p);
  return (
    <Layer x={Math.min(Math.max(s.x, 300), 780)} y={Math.min(Math.max(s.y - dy, 540), 1380)} k={k}>
      {children}
    </Layer>
  );
};

/** Soft dark pool behind overlays so they read over a busy set without a hard box. */
export const Scrim: React.FC<{ y: number; k: number; height?: number; strength?: number }> = ({ y, k, height = 320, strength = 0.55 }) =>
  k <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: SAFE_CX - 560,
        top: y - height / 2,
        width: 1120,
        height,
        opacity: k,
        background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(8,12,26,${strength}) 0%, rgba(8,12,26,${strength * 0.55}) 55%, rgba(8,12,26,0) 100%)`,
      }}
    />
  );

/** Hand-lettered parent's note: cream paper card with the words of the promise. */
export const NoteCard: React.FC<{ lines: Array<{ text: string; at: number; hl?: boolean }>; f: number; k: number }> = ({ lines, f, k }) =>
  k <= 0 ? null : (
    <div
      style={{
        opacity: k,
        transform: `translateY(${(1 - k) * 24}px) rotate(-1.5deg)`,
        background: "linear-gradient(180deg, #fffaf0, #fff1d9)",
        borderRadius: 34,
        border: "6px solid #f2c97a",
        padding: "34px 44px",
        width: 760,
        boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
        fontFamily: FONT,
        fontWeight: 900,
      }}
    >
      {lines.map((l, i) => {
        const lk = ease(f, l.at, 10, EASE.out);
        return (
          <div
            key={i}
            style={{
              fontSize: 54,
              lineHeight: 1.45,
              color: l.hl ? "#0b7a6c" : "#3b2a20",
              opacity: 0.25 + 0.75 * lk,
              background: l.hl && lk > 0 ? `linear-gradient(transparent 62%, rgba(32,208,184,${0.35 * lk}) 62%)` : undefined,
            }}
          >
            {l.text}
          </div>
        );
      })}
    </div>
  );

/** Required disclosure on the last card. */
export const AiNote: React.FC<{ k: number }> = ({ k }) =>
  k <= 0 ? null : (
    <div style={{ position: "absolute", left: 150, top: 1384, opacity: k, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: "#ffffff", textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>
      ※AI制作のアニメーションです
    </div>
  );

export { reveal as rv };
export { FONT as FONT_STACK } from "../koucha/theme";
