import React from "react";
import { C, FONT } from "../koucha/theme";
import { ease, EASE } from "../golden2/shot";
import { SERIF } from "../golden2/overlays";
import { Headline } from "./overlays";
import { AFTERNOON, HIGH_AMBER } from "../hightea/labels";

export { AFTERNOON, CrossMark, GOLD, HeightArrow, HIGH_AMBER, Note } from "../hightea/labels";

const PANEL: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(74,42,23,0.94), rgba(43,23,12,0.96))",
  border: "4px solid #f3c27a",
  borderRadius: 32,
  boxShadow: "0 14px 34px rgba(30,12,4,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
};

const MenuRow: React.FC<{ en: string; ja: string; color: string; k: number }> = ({ en, ja, color, k }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>
    <div style={{ width: 22, height: 22, borderRadius: 11, background: color, boxShadow: `0 0 14px ${color}` }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 34, color: "#e9d6bc", whiteSpace: "nowrap" }}>{en}</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color, whiteSpace: "nowrap" }}>{ja}</div>
    </div>
  </div>
);

/** A hotel lounge menu with the two teas; each row appears when named. */
export const MenuCard: React.FC<{ f: number; aAt: number; bAt: number }> = ({ f, aAt, bAt }) => (
  <div style={{ ...PANEL, width: 640, padding: "22px 44px 30px", display: "flex", flexDirection: "column", gap: 18 }}>
    <div style={{ fontFamily: SERIF, fontSize: 44, letterSpacing: 10, color: "#f3c27a", textAlign: "center" }}>— MENU —</div>
    <MenuRow en="Afternoon Tea" ja="アフタヌーンティー" color={AFTERNOON} k={ease(f, aAt, 10, EASE.out)} />
    <MenuRow en="High Tea" ja="ハイティー" color={HIGH_AMBER} k={ease(f, bAt, 10, EASE.out)} />
  </div>
);

export type TimeBand = { from: number; to: number; at: number; color: string; label: string };

/** Day timeline 13:00–20:00 with bands that grow in from their `at` frame. */
export const TimeBar: React.FC<{ f: number; bands: TimeBand[] }> = ({ f, bands }) => {
  const W = 700;
  const x = (hr: number) => ((hr - 13) / 7) * W;
  const ticks = [...new Set(bands.flatMap((b) => [b.from, b.to]))];
  return (
    <div style={{ ...PANEL, padding: "24px 30px 18px" }}>
      <div style={{ position: "relative", width: W, height: 70, borderRadius: 18, background: "rgba(255,240,220,0.08)" }}>
        {bands.map((b) => {
          const k = ease(f, b.at, 16, EASE.out);
          return (
            <div
              key={b.label}
              style={{ position: "absolute", left: x(b.from), top: 0, width: (x(b.to) - x(b.from)) * k, height: 70, borderRadius: 18, background: b.color, overflow: "hidden", boxShadow: `0 0 18px ${b.color}` }}
            >
              <div style={{ padding: "16px 0", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 28, color: "#3a1d0e", whiteSpace: "nowrap", opacity: k }}>{b.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "relative", width: W, height: 44, marginTop: 8 }}>
        {ticks.map((hr) => (
          <div key={hr} style={{ position: "absolute", left: x(hr) - 40, width: 80, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.cream }}>
            {hr}時
          </div>
        ))}
      </div>
    </div>
  );
};

/** Closing card: the question, then the two teas side by side (when, what, which table). */
export const SummaryCard: React.FC<{ f: number; at: number }> = ({ f, at }) => (
  <div style={{ ...PANEL, width: 820, padding: "24px 30px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
    <Headline text="どちらのティータイム？" size={64} f={f} at={at + 2} sweepAt={at + 22} />
    <div style={{ display: "flex", gap: 18, opacity: ease(f, at + 12, 10, EASE.out) }}>
      {[
        ["アフタヌーンティー", "夕食の前", "15〜17時ごろ", "スコーン・ケーキ", AFTERNOON],
        ["ハイティー", "夕食そのもの", "17〜19時ごろ", "肉のパイ・料理", HIGH_AMBER],
      ].map(([name, what, when, food, color]) => (
        <div key={name} style={{ width: 370, borderRadius: 24, border: `4px solid ${color}`, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color, whiteSpace: "nowrap" }}>{name}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.cream, whiteSpace: "nowrap" }}>{what}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: "#e9d6bc", whiteSpace: "nowrap" }}>{when}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: "#e9d6bc", whiteSpace: "nowrap" }}>{food}</div>
        </div>
      ))}
    </div>
  </div>
);
