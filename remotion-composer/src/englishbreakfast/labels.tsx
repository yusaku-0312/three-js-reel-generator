import React from "react";
import { C, FONT } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { SERIF } from "../golden2/overlays";
import { Headline } from "./overlays";

export { GOLD } from "../hightea/labels";

/** Brand colours of the four teas (chips, bars). */
export const TEA_COLOR = { eb: "#f3c27a", earl: "#9fb7c9", darj: "#a9c97a", assam: "#e08a5a" };
export const MILK = "#f6efe2";

const PANEL: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(74,42,23,0.94), rgba(43,23,12,0.96))",
  border: "4px solid #f3c27a",
  borderRadius: 32,
  boxShadow: "0 14px 34px rgba(30,12,4,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
};

const text = (size: number, color: string = C.cream): React.CSSProperties => ({
  fontFamily: FONT,
  fontWeight: 900,
  fontSize: size,
  color,
  whiteSpace: "nowrap",
});

type Bar = { name: string; pct: number; at: number; color: string };

/** 2020 poll: one bar per tea that grows from its `at`; `winAt` makes the winner's bar glow. */
export const PollCard: React.FC<{ f: number; bars: Bar[]; winAt: number }> = ({ f, bars, winAt }) => {
  const MAXW = 380;
  const win = ease(f, winAt, 10, EASE.out);
  return (
    <div style={{ ...PANEL, width: 820, padding: "22px 30px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...text(40, "#f3c27a"), textAlign: "center" }}>2020年の調査（イギリス）</div>
      {bars.map((b, i) => {
        const k = ease(f, b.at, 18, EASE.out);
        const glow = i === 0 ? win : 0;
        return (
          <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, k * 3) }}>
            <div style={{ ...text(30), width: 240, textAlign: "right", lineHeight: 1.15, whiteSpace: "pre" }}>{b.name}</div>
            <div style={{ width: MAXW, height: 64, borderRadius: 16, background: "rgba(255,240,220,0.08)", position: "relative" }}>
              <div
                style={{
                  width: (MAXW * b.pct * k) / 60,
                  height: 64,
                  borderRadius: 16,
                  background: b.color,
                  boxShadow: `0 0 ${10 + glow * 30}px ${b.color}`,
                  transform: `scaleY(${1 + glow * 0.08})`,
                }}
              />
            </div>
            <div style={{ ...text(54, b.color), width: 120 }}>{Math.round(b.pct * k)}%</div>
          </div>
        );
      })}
    </div>
  );
};

/** Ring gauge that fills to `pct` from `at`, the number counting up in the middle; caption above and below. */
export const RingStat: React.FC<{ f: number; at: number; pct: number; top: string; bottom: string; bottomAt: number }> = ({ f, at, pct, top, bottom, bottomAt }) => {
  const k = ease(f, at, 24, EASE.out);
  const R = 120;
  const L = 2 * Math.PI * R;
  return (
    <div style={{ ...PANEL, width: 800, padding: "22px 30px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ ...text(36, "#e9d6bc"), textAlign: "center", whiteSpace: "pre", lineHeight: 1.3 }}>{top}</div>
      <div style={{ position: "relative", width: 2 * R + 40, height: 2 * R + 40 }}>
        <svg width={2 * R + 40} height={2 * R + 40} style={{ position: "absolute", left: 0, top: 0, transform: "rotate(-90deg)" }}>
          <circle cx={R + 20} cy={R + 20} r={R} stroke="rgba(255,240,220,0.15)" strokeWidth={30} fill="none" />
          <circle
            cx={R + 20}
            cy={R + 20}
            r={R}
            stroke={MILK}
            strokeWidth={30}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(L * pct * k) / 100} ${L}`}
            style={{ filter: "drop-shadow(0 0 10px rgba(255,250,235,0.7))" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...text(96, MILK) }}>
          {f < at ? "？" : `${Math.round(pct * k)}%`}
        </div>
      </div>
      <div style={{ ...text(46), opacity: ease(f, bottomAt, 10, EASE.out) }}>{bottom}</div>
    </div>
  );
};

const TEAS: Array<[string, string]> = [
  ["アールグレイ", TEA_COLOR.earl],
  ["ダージリン", TEA_COLOR.darj],
  ["アッサム", TEA_COLOR.assam],
  ["イングリッシュブレックファスト", TEA_COLOR.eb],
];

/** Closing card: the question, the four teas as chips, then a speech bubble asking for a comment. */
export const AskCard: React.FC<{ f: number; at: number; chipsAt: number; commentAt: number }> = ({ f, at, chipsAt, commentAt }) => {
  const c = ease(f, commentAt, 10, EASE.out);
  return (
    <div style={{ ...PANEL, width: 820, padding: "24px 30px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ fontFamily: SERIF, fontSize: 36, letterSpacing: 8, color: "#f3c27a" }}>YOUR FAVOURITE?</div>
      <Headline text="あなたの一番好きな紅茶は？" size={60} f={f} at={at + 2} sweepAt={at + 22} />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, width: 760 }}>
        {TEAS.map(([name, color], i) => {
          const k = ease(f, chipsAt + i * 4, 8, EASE.out);
          return (
            <div
              key={name}
              style={{ ...text(34), border: `4px solid ${color}`, borderRadius: 999, padding: "6px 22px", opacity: k, transform: `scale(${0.8 + 0.2 * k})` }}
            >
              {name}
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...text(46, "#3a1d0e"),
          background: MILK,
          borderRadius: 40,
          padding: "14px 40px",
          position: "relative",
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
