import React from "react";
import { staticFile } from "remotion";
import { ease, EASE } from "../golden2/shot";
import { Layer, reveal, SAFE_CX } from "../golden2/overlays";
import { FONT } from "../koucha/theme";

// Closing call to action of the AI-account narration reels (pattern "ai", 生成AIみんなの検定): the picture dims,
// the series band fades out, and the closing line sits above the account's profile screenshot whose フォロー
// button is ringed and pulsing. Not used by the tea reels (pattern "tea").
// The screenshot lives at public/<slug>/profile.png (scaffold_remotion.py --pattern ai copies the template).

const INK = "#0f1626";
const BAND = "rgb(128,242,255)";
/** Profile screenshot size (px) and the フォロー button on it; update both when the screenshot is replaced. */
export const PROFILE_SHOT = { w: 1055, h: 2000, follow: { x: 43, y: 624, w: 427, h: 86 } } as const;
const SHOT_H = 860;
const SHOT_W = (SHOT_H * PROFILE_SHOT.w) / PROFILE_SHOT.h;
const PX = SHOT_H / PROFILE_SHOT.h;

/** 0..1 how far the series band is hidden: pass as the last scene's `bandOff`. */
export const profileBandOff = (f: number, at: number) => reveal(f, at - 2);

const Card: React.FC<{ f: number; at: number; lines: string[]; src: string }> = ({ f, at, lines, src }) => {
  const img = ease(f, at + 4, 12, EASE.out);
  const ring = ease(f, at + 16, 8, EASE.out);
  const pulse = 1 + Math.max(0, Math.sin((f - at - 16) / 5)) * 0.06;
  const btn = PROFILE_SHOT.follow;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, fontFamily: FONT, fontWeight: 900 }}>
      <div style={{ whiteSpace: "nowrap", fontSize: 80, color: "#fff", WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill", lineHeight: 1.18, textAlign: "center" }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div
        style={{
          position: "relative", width: SHOT_W, height: SHOT_H, opacity: img, transform: `translateY(${(1 - img) * 30}px)`,
          borderRadius: 34, border: `8px solid ${BAND}`, overflow: "hidden", boxShadow: "0 18px 44px rgba(0,0,0,0.6)",
        }}
      >
        <img src={staticFile(src)} style={{ width: "100%", height: "100%", display: "block" }} />
        <div
          style={{
            position: "absolute", left: btn.x * PX - 8, top: btn.y * PX - 8, width: btn.w * PX + 16, height: btn.h * PX + 16,
            borderRadius: 20, border: "6px solid #ffcf3f", opacity: ring, transform: `scale(${pulse})`, boxShadow: "0 0 24px rgba(255,207,63,0.8)",
          }}
        />
      </div>
    </div>
  );
};

/**
 * Full-frame closing card from `at` (the chunk 「プロフィールから」 starts): dim plate, up to two short lines
 * (≤9 characters each at 80 px), the profile screenshot below; fits between y 300 and 1410 (above the subtitles).
 */
export const ProfileCta: React.FC<{ f: number; at: number; lines: string[]; src: string }> = ({ f, at, lines, src }) => {
  const k = reveal(f, at - 2);
  if (k <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,12,26,0.72)", opacity: k }} />
      <Layer x={SAFE_CX} y={880} k={k}>
        <Card f={f} at={at} lines={lines} src={src} />
      </Layer>
    </>
  );
};
