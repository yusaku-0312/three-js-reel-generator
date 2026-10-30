import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { C, FONT } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { rng } from "./core";
import { Chip, Headline } from "./overlays";

/** CHAGEE cobalt (cup band, pins, chip edges); jasmine gold-green; LIVE red. */
export const COBALT = "#3d6fd6";
export const JASMINE = "#cfe08a";
export const LIVE_RED = "#ff3b4e";
const INK = "#2a150a";

const PHOTO = staticFile("chagee/wonyoung.webp");
/** The user's photo is 794 × 1402. */
const PHOTO_RATIO = 1402 / 794;

/** The user's photo as a tilted print with a white border; `glow` lights the frame (never the face). */
export const PhotoCard: React.FC<{ width: number; f: number; glow?: number; tilt?: number }> = ({ width, f, glow = 0, tilt = -3 }) => {
  const settle = ease(f, 0, 10, EASE.out);
  return (
    <div
      style={{
        width,
        height: width * PHOTO_RATIO,
        padding: 12,
        background: "#fffaf2",
        borderRadius: 22,
        transform: `rotate(${tilt * settle}deg)`,
        boxShadow: `0 18px 40px rgba(30,12,4,0.5), 0 0 ${40 * glow}px ${12 * glow}px rgba(140,190,255,${0.85 * glow})`,
        border: `${4 + 4 * glow}px solid ${glow > 0.01 ? `rgba(120,170,255,${0.4 + 0.6 * glow})` : "#fffaf2"}`,
      }}
    >
      <Img src={PHOTO} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12, display: "block" }} />
    </div>
  );
};

/** Phone showing the photo as a live stream: red LIVE badge, viewer count, a few comments. */
export const LivePhone: React.FC<{ width: number; f: number }> = ({ width, f }) => {
  const h = width * PHOTO_RATIO;
  const blink = 0.75 + 0.25 * Math.sin(f / 5);
  const viewers = Math.round(interpolate(f, [0, 200], [128400, 131900], { extrapolateRight: "clamp" })).toLocaleString("en-US");
  return (
    <div style={{ width: width + 28, height: h + 28, padding: 14, borderRadius: 64, background: "#121216", boxShadow: "0 24px 50px rgba(20,8,2,0.6), inset 0 0 0 3px #3a3a44" }}>
      <div style={{ position: "relative", width, height: h, borderRadius: 50, overflow: "hidden" }}>
        <Img src={PHOTO} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", top: 28, left: 24, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, color: "#fff", background: LIVE_RED, borderRadius: 10, padding: "4px 14px", opacity: blink, letterSpacing: 2 }}>
            LIVE
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 26, color: "#fff", background: "rgba(0,0,0,0.45)", borderRadius: 10, padding: "4px 12px" }}>
            👁 {viewers}
          </div>
        </div>
      </div>
    </div>
  );
};

/** White speech bubble with a tail pointing down-left, popping in at `at`. */
export const Bubble: React.FC<{ lines: string[]; f: number; at: number; size?: number }> = ({ lines, f, at, size = 50 }) => {
  const k = ease(f, at, 8, EASE.out);
  if (k <= 0) return null;
  const pop = interpolate(f, [at, at + 5, at + 9], [0.4, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", transform: `scale(${pop})`, opacity: k, transformOrigin: "20% 100%" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.15,
          color: INK,
          background: "#ffffff",
          borderRadius: 34,
          padding: `${size * 0.4}px ${size * 0.55}px`,
          border: `5px solid ${COBALT}`,
          boxShadow: "0 12px 30px rgba(30,12,4,0.45)",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 40, bottom: -26, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `30px solid ${COBALT}` }} />
    </div>
  );
};

/** Hearts drifting up from a point (live-stream reactions), starting at `at`. */
export const Hearts: React.FC<{ f: number; at: number; count?: number }> = ({ f, at, count = 12 }) => {
  const hearts = React.useMemo(() => {
    const r = rng(31);
    return Array.from({ length: count }, (_, i) => ({ d: i * 3 + r() * 2, x: (r() - 0.5) * 80, sw: r() * 6, s: 34 + r() * 22, c: ["#ff4d6d", "#ff8fab", "#ffb3c6"][i % 3] }));
  }, [count]);
  return (
    <div style={{ position: "relative", width: 0, height: 0 }}>
      {hearts.map((h, i) => {
        const t = (f - at - h.d) / 40;
        if (t < 0 || t > 1) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: h.x + Math.sin(t * 6 + h.sw) * 24,
              top: -t * 420,
              fontSize: h.s,
              color: h.c,
              opacity: 1 - t,
              transform: `scale(${0.6 + t * 0.6})`,
              textShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            ♥
          </div>
        );
      })}
    </div>
  );
};

/** Chip with a small clock face, for the queue time. */
export const ClockChip: React.FC<{ text: string; f: number; size?: number }> = ({ text, f, size = 54 }) => (
  <Chip text={text} size={size} accent="#f3c27a">
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={17} fill="#fff6e6" stroke="#f3c27a" strokeWidth={3} />
      <line x1={20} y1={20} x2={20} y2={8} stroke={INK} strokeWidth={3} strokeLinecap="round" transform={`rotate(${f * 12} 20 20)`} />
      <line x1={20} y1={20} x2={28} y2={20} stroke={INK} strokeWidth={3} strokeLinecap="round" transform={`rotate(${f * 1} 20 20)`} />
    </svg>
  </Chip>
);

/** Listing badge: NASDAQ ticker card with a line that climbs. */
export const ListingCard: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const draw = ease(f, at + 4, 20, EASE.out);
  const pts = [[0, 70], [40, 58], [80, 64], [120, 40], [160, 46], [200, 18], [240, 8]];
  const len = Math.max(2, Math.ceil(pts.length * draw));
  const d = pts.slice(0, len).map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "18px 30px",
        borderRadius: 30,
        background: "linear-gradient(180deg, rgba(74,42,23,0.92), rgba(43,23,12,0.92))",
        border: `4px solid ${COBALT}`,
        boxShadow: "0 14px 34px rgba(30,12,4,0.45)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color: "#9fc4ff", letterSpacing: 3 }}>NASDAQ</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.cream, whiteSpace: "nowrap" }}>米国で上場</div>
      </div>
      <svg width={250} height={80} viewBox="-5 0 255 80">
        <path d={d} fill="none" stroke="#7ee08a" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** End card: the name, then one fact per row. */
export const SummaryCard: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const rows: Array<[string, string]> = [
    ["雲南生まれ", "2017年〜"],
    ["看板", "ジャスミンミルクティー"],
    ["お店", "世界に7000店以上"],
    ["日本", "まだお店なし"],
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "26px 36px 30px",
        borderRadius: 36,
        background: "linear-gradient(180deg, rgba(74,42,23,0.92), rgba(43,23,12,0.94))",
        border: `4px solid ${COBALT}`,
        boxShadow: "0 14px 34px rgba(30,12,4,0.45)",
      }}
    >
      <Headline text="CHAGEE" size={88} f={f} at={at} />
      {rows.map(([key, val], i) => {
        const k = ease(f, at + 8 + i * 6, 12, EASE.out);
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 16, opacity: k, transform: `translateY(${(1 - k) * 20}px)` }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color: "#fff", background: COBALT, borderRadius: 999, padding: "4px 18px", whiteSpace: "nowrap" }}>
              {key}
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: key === "日本" ? "#ffb3a6" : C.cream, whiteSpace: "nowrap" }}>{val}</div>
          </div>
        );
      })}
    </div>
  );
};
