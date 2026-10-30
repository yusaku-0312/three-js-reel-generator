import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { Chip, Headline } from "./overlays";

export { CrossMark } from "../chaimilk/labels";

/** Colour code: afternoon tea = pink (a snack), high tea = amber (supper), gold = height. */
export const AFTERNOON = "#f4a6b8";
export const HIGH_AMBER = "#f0a04b";
export const GOLD = "#f3cf7a";

const PANEL: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(74,42,23,0.94), rgba(43,23,12,0.96))",
  border: "4px solid #f3c27a",
  borderRadius: 32,
  boxShadow: "0 14px 34px rgba(30,12,4,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
};

/** Small footnote line (※諸説あり, ※お酒は20歳から). */
export const Note: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.cream, WebkitTextStroke: "8px #2a150a", paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
    {text}
  </div>
);

/** Analog clock whose hands sweep to `hour` from `at`, with a caption under it. */
export const Clock: React.FC<{ f: number; at: number; hour: number; caption: string; size?: number }> = ({ f, at, hour, caption, size = 230 }) => {
  const k = ease(f, at, 24, EASE.out);
  const h = 12 + (hour - 12) * k;
  const m = 60 * 3 * (1 - k);
  const hand = (deg: number, len: number, w: number, color: string) => (
    <line x1={50} y1={50} x2={50 + Math.sin((deg * Math.PI) / 180) * len} y2={50 - Math.cos((deg * Math.PI) / 180) * len} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <div style={{ ...PANEL, padding: "20px 34px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={46} fill="#fff8ec" stroke={GOLD} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={50 + Math.sin(a) * 38} cy={50 - Math.cos(a) * 38} r={i % 3 === 0 ? 2.6 : 1.4} fill="#4a2a17" />;
        })}
        {hand(((h % 12) / 12) * 360 + (m / 60) * 30, 22, 5, "#4a2a17")}
        {hand((m / 60) * 360, 32, 3, "#4a2a17")}
        <circle cx={50} cy={50} r={3.5} fill={GOLD} />
      </svg>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.cream, whiteSpace: "nowrap" }}>{caption}</div>
    </div>
  );
};

/** Day timeline 14:00–21:00: a pink afternoon-tea band (14–17) then an amber high-tea band (17–21). */
export const TimeBar: React.FC<{ f: number; afternoonAt: number; highAt: number }> = ({ f, afternoonAt, highAt }) => {
  const W = 700;
  const x = (hr: number) => ((hr - 14) / 7) * W;
  const a = ease(f, afternoonAt, 16, EASE.out);
  const b = ease(f, highAt, 22, EASE.out);
  const band = (from: number, to: number, k: number, color: string, label: string) => (
    <div style={{ position: "absolute", left: x(from), top: 0, width: (x(to) - x(from)) * k, height: 70, borderRadius: 18, background: color, overflow: "hidden", boxShadow: `0 0 18px ${color}` }}>
      <div style={{ padding: "16px 12px", fontFamily: FONT, fontWeight: 900, fontSize: 28, color: "#3a1d0e", whiteSpace: "nowrap", opacity: k }}>{label}</div>
    </div>
  );
  return (
    <div style={{ ...PANEL, padding: "24px 30px 18px" }}>
      <div style={{ position: "relative", width: W, height: 70 }}>
        {band(14, 17, a, AFTERNOON, "アフタヌーンティー")}
        {band(17, 21, b, HIGH_AMBER, "ハイティー")}
      </div>
      <div style={{ position: "relative", width: W, height: 44, marginTop: 8 }}>
        {[14, 17, 21].map((hr) => (
          <div key={hr} style={{ position: "absolute", left: x(hr) - 40, width: 80, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.cream }}>
            {hr}時
          </div>
        ))}
      </div>
    </div>
  );
};

const Row: React.FC<{ name: string; is: string; color: string; k: number }> = ({ name, is, color, k }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: k, transform: `translateX(${(1 - k) * -20}px)` }}>
    <Chip text={name} size={42} accent={color} />
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.cream, whiteSpace: "nowrap" }}>＝ {is}</div>
  </div>
);

/** Two-row comparison: afternoon tea = a snack, high tea = an early supper. */
export const CompareCard: React.FC<{ f: number; aAt: number; bAt: number }> = ({ f, aAt, bAt }) => (
  <div style={{ ...PANEL, padding: "26px 34px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 22 }}>
    <Row name="アフタヌーンティー" is="午後のおやつ" color={AFTERNOON} k={ease(f, aAt, 10, EASE.out)} />
    <Row name="ハイティー" is="早めの晩ごはん" color={HIGH_AMBER} k={ease(f, bAt, 10, EASE.out)} />
  </div>
);

/** Gold height arrow drawn on screen from a floor point up to a table-top point, growing from `at`. */
export const HeightArrow: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; f: number; at: number; label: string; left?: boolean }> = ({
  from,
  to,
  f,
  at,
  label,
  left = false,
}) => {
  const k = ease(f, at, 14, EASE.out);
  if (k <= 0) return null;
  const tip = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
  const s = interpolate(f, [at + 12, at + 17, at + 21], [0, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={from.x} y1={from.y} x2={tip.x} y2={tip.y} stroke="#2a150a" strokeWidth={16} strokeLinecap="round" />
        <line x1={from.x} y1={from.y} x2={tip.x} y2={tip.y} stroke={GOLD} strokeWidth={9} strokeLinecap="round" />
        <polygon points={`${tip.x - 22},${tip.y + 26} ${tip.x + 22},${tip.y + 26} ${tip.x},${tip.y - 6}`} fill={GOLD} stroke="#2a150a" strokeWidth={4} />
        <line x1={from.x - 26} y1={from.y} x2={from.x + 26} y2={from.y} stroke={GOLD} strokeWidth={8} strokeLinecap="round" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: left ? undefined : to.x + 34,
          right: left ? 1080 - to.x + 34 : undefined,
          top: (from.y + to.y) / 2 - 40,
          transform: `scale(${s})`,
          transformOrigin: left ? "right center" : "left center",
        }}
      >
        <Chip text={label} size={46} accent={GOLD} />
      </div>
    </>
  );
};

/** Closing card: the core in one line, then the two teas side by side. */
export const SummaryCard: React.FC<{ f: number; at: number }> = ({ f, at }) => (
  <div style={{ ...PANEL, width: 820, padding: "24px 30px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
    <Headline text="ハイティー＝晩ごはん" size={70} f={f} at={at + 2} sweepAt={at + 22} />
    <div style={{ display: "flex", gap: 18, opacity: ease(f, at + 12, 10, EASE.out) }}>
      {[
        ["アフタヌーンティー", "午後のおやつ", "低いテーブル", AFTERNOON],
        ["ハイティー", "早めの晩ごはん", "高いテーブル", HIGH_AMBER],
      ].map(([name, what, table, color]) => (
        <div key={name} style={{ width: 370, borderRadius: 24, border: `4px solid ${color}`, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color, whiteSpace: "nowrap" }}>{name}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.cream, whiteSpace: "nowrap" }}>{what}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: "#e9d6bc", whiteSpace: "nowrap" }}>{table}</div>
        </div>
      ))}
    </div>
  </div>
);
