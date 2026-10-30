import * as THREE from "three";
import { rng } from "../core";
import { canvasTexture, JP } from "../../aimukae/three/textures";

export { canvasTexture, JP, woodGrainTexture } from "../../aimukae/three/textures";
export { floorMap, nightTexture } from "../../kondate/three/textures";

/**
 * Phone screens and photo cards. The fake image is never drawn: wherever it appears it is a grey mosaic with
 * a warning mark and 「非表示」.
 */
const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

const ACCOUNT = "user_8x2k";
const RED = "#e8303f";
const TEAL = "#16b8a4";

/** Ordinary photo the child posted: a sunny park, the figurine in its navy hoodie making a peace sign. */
export const drawOrdinaryPhoto = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.save();
  roundRect(ctx, x, y, w, h, w * 0.04);
  ctx.clip();
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, "#8fd3ff");
  sky.addColorStop(0.62, "#dff4ff");
  sky.addColorStop(0.62, "#8fd36a");
  sky.addColorStop(1, "#5fb24a");
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  // trees
  ctx.fillStyle = "#3f9a4a";
  [0.12, 0.85].forEach((u) => {
    ctx.beginPath();
    ctx.arc(x + w * u, y + h * 0.5, w * 0.16, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#7a5a3a";
  [0.12, 0.85].forEach((u) => ctx.fillRect(x + w * u - w * 0.02, y + h * 0.55, w * 0.04, h * 0.12));
  // the child figurine: navy hoodie, wooden head, black hair, a peace sign
  const cx = x + w * 0.5;
  ctx.fillStyle = "#2f4a8a";
  roundRect(ctx, cx - w * 0.17, y + h * 0.56, w * 0.34, h * 0.5, w * 0.12);
  ctx.fill();
  ctx.fillStyle = "#e9cfa8";
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.43, w * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#221a16";
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.41, w * 0.15, Math.PI * 1.05, Math.PI * 1.95);
  ctx.fill();
  ctx.strokeStyle = "#2f4a8a";
  ctx.lineWidth = w * 0.07;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.14, y + h * 0.66);
  ctx.lineTo(cx + w * 0.27, y + h * 0.48);
  ctx.stroke();
  ctx.fillStyle = "#e9cfa8";
  ctx.lineWidth = w * 0.028;
  ctx.strokeStyle = "#e9cfa8";
  [-0.035, 0.035].forEach((d) => {
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.27, y + h * 0.47);
    ctx.lineTo(cx + w * (0.27 + d), y + h * 0.38);
    ctx.stroke();
  });
  ctx.restore();
};

/** The fake: never shown. A grey-violet mosaic, a warning triangle and 「非表示」. */
export const drawHiddenImage = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.save();
  roundRect(ctx, x, y, w, h, w * 0.04);
  ctx.clip();
  const r = rng(23);
  const cells = 9;
  const cw = w / cells;
  const rows = Math.ceil(h / cw);
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < rows; j++) {
      const v = 70 + r() * 50;
      ctx.fillStyle = `rgb(${v},${v - 6},${v + 18})`;
      ctx.fillRect(x + i * cw, y + j * cw, cw + 1, cw + 1);
    }
  }
  ctx.fillStyle = "rgba(20,18,30,0.35)";
  ctx.fillRect(x, y, w, h);
  const cx = x + w / 2;
  const cy = y + h * 0.44;
  const s = w * 0.2;
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx + s * 1.1, cy + s * 0.8);
  ctx.lineTo(cx - s * 1.1, cy + s * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "center";
  ctx.font = `900 ${s * 1.1}px ${JP}`;
  ctx.fillText("!", cx, cy + s * 0.62);
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${w * 0.11}px ${JP}`;
  ctx.fillText("非表示", cx, y + h * 0.8);
  ctx.restore();
};

export const ordinaryPhotoTexture = () => canvasTexture("y-photo", 400, 500, (ctx) => drawOrdinaryPhoto(ctx, 0, 0, 400, 500));
export const hiddenImageTexture = () => canvasTexture("y-hidden", 400, 500, (ctx) => drawHiddenImage(ctx, 0, 0, 400, 500));

export type ScreenKind = "friend" | "notify" | "dmEmpty" | "dmImage" | "dmThreat" | "dmMore" | "dmStop" | "privacyAll" | "privacyFriends";

const bg = (ctx: CanvasRenderingContext2D, top: string, bottom: string) => {
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 1024);
};

const statusBar = (ctx: CanvasRenderingContext2D, ink: string) => {
  ctx.fillStyle = ink;
  ctx.font = `700 28px ${JP}`;
  ctx.textAlign = "left";
  ctx.fillText("22:14", 40, 52);
  ctx.textAlign = "center";
};

const unknownAvatar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.fillStyle = "#8a8f9a";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${r * 1.2}px ${JP}`;
  ctx.textAlign = "center";
  ctx.fillText("?", x, y + r * 0.42);
};

const dmHeader = (ctx: CanvasRenderingContext2D) => {
  bg(ctx, "#f4f5f8", "#e9ebf0");
  statusBar(ctx, "#2a2f3a");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 70, 512, 110);
  unknownAvatar(ctx, 68, 125, 32);
  ctx.textAlign = "left";
  ctx.fillStyle = "#1f2430";
  ctx.font = `900 36px ${JP}`;
  ctx.fillText(ACCOUNT, 116, 120);
  ctx.fillStyle = RED;
  ctx.font = `700 24px ${JP}`;
  ctx.fillText("知らないアカウント", 116, 156);
  ctx.textAlign = "center";
};

/** Incoming bubble on the left; returns the y under it. */
const inBubble = (ctx: CanvasRenderingContext2D, y: number, lines: string[], size = 36, color = RED) => {
  const h = lines.length * (size + 12) + 34;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 30, y, 400, h, 28);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = color === RED ? "#9a1422" : "#2a2f3a";
  ctx.font = `900 ${size}px ${JP}`;
  ctx.textAlign = "left";
  lines.forEach((l, i) => ctx.fillText(l, 56, y + 24 + size + i * (size + 12) - 6));
  ctx.textAlign = "center";
  return y + h;
};

const imageBubble = (ctx: CanvasRenderingContext2D, y: number, h = 330) => {
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 30, y, h * 0.8 + 24, h + 24, 26);
  ctx.fill();
  drawHiddenImage(ctx, 42, y + 12, h * 0.8, h);
  return y + h + 24;
};

const inputBar = (ctx: CanvasRenderingContext2D, stopped: boolean) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 900, 512, 124);
  ctx.fillStyle = stopped ? "#d9dbe0" : "#eef0f4";
  roundRect(ctx, 30, 928, 452, 70, 35);
  ctx.fill();
  ctx.fillStyle = stopped ? "#7a7f8a" : "#a0a5ae";
  ctx.font = `700 28px ${JP}`;
  ctx.textAlign = "left";
  ctx.fillText(stopped ? "返信しない" : "メッセージを入力", 62, 973);
  ctx.textAlign = "center";
};

const privacy = (ctx: CanvasRenderingContext2D, friends: boolean) => {
  bg(ctx, "#f6f8fb", "#eaf0f5");
  statusBar(ctx, "#2a2f3a");
  ctx.fillStyle = "#1f2430";
  ctx.font = `900 40px ${JP}`;
  ctx.fillText("写真の公開範囲", 256, 150);
  const opts = ["全体に公開", "フォロワーのみ", "友達のみ"];
  const sel = friends ? 2 : 0;
  opts.forEach((o, i) => {
    const y = 220 + i * 130;
    ctx.fillStyle = i === sel ? (friends ? "#e3faf6" : "#ffecee") : "#ffffff";
    roundRect(ctx, 34, y, 444, 104, 24);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = i === sel ? (friends ? TEAL : RED) : "#d5d9e0";
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.fillStyle = "#1f2430";
    ctx.font = `900 36px ${JP}`;
    ctx.fillText(o, 70, y + 66);
    ctx.beginPath();
    ctx.arc(430, y + 52, 20, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = i === sel ? (friends ? TEAL : RED) : "#b8bdc6";
    ctx.stroke();
    if (i === sel) {
      ctx.fillStyle = friends ? TEAL : RED;
      ctx.beginPath();
      ctx.arc(430, y + 52, 11, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = "center";
  });
  drawOrdinaryPhoto(ctx, 136, 640, 240, 300);
};

export const screenTexture = (kind: ScreenKind) =>
  canvasTexture(`y-screen-${kind}`, 512, 1024, (ctx) => {
    ctx.textAlign = "center";
    if (kind === "notify") {
      bg(ctx, "#1d2440", "#0e1222");
      statusBar(ctx, "#ffffff");
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 110px ${JP}`;
      ctx.fillText("22:14", 256, 250);
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      roundRect(ctx, 26, 330, 460, 150, 30);
      ctx.fill();
      unknownAvatar(ctx, 86, 405, 34);
      ctx.textAlign = "left";
      ctx.fillStyle = "#1f2430";
      ctx.font = `900 30px ${JP}`;
      ctx.fillText(ACCOUNT, 136, 392);
      ctx.fillStyle = RED;
      ctx.font = `900 30px ${JP}`;
      ctx.fillText("画像が届きました", 136, 438);
      ctx.textAlign = "center";
      return;
    }
    if (kind === "friend") {
      bg(ctx, "#f3fbfa", "#e3f3f0");
      statusBar(ctx, "#2a2f3a");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 70, 512, 110);
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.arc(68, 125, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = "left";
      ctx.fillStyle = "#1f2430";
      ctx.font = `900 40px ${JP}`;
      ctx.fillText("友達", 116, 140);
      ctx.textAlign = "center";
      inputBar(ctx, false);
      return;
    }
    if (kind === "privacyAll" || kind === "privacyFriends") {
      privacy(ctx, kind === "privacyFriends");
      return;
    }
    dmHeader(ctx);
    ctx.fillStyle = "#8a8f9a";
    ctx.font = `700 24px ${JP}`;
    ctx.fillText("メッセージリクエスト", 256, 226);
    if (kind === "dmEmpty") {
      inputBar(ctx, false);
      return;
    }
    if (kind === "dmMore") {
      let y = imageBubble(ctx, 250, 200);
      y = inBubble(ctx, y + 18, ["お金を払わないと", "友達に送る"], 32);
      y = inBubble(ctx, y + 18, ["もっと送れ"], 32);
      inBubble(ctx, y + 18, ["あと3万円"], 32);
      inputBar(ctx, false);
      return;
    }
    const y = imageBubble(ctx, 250);
    if (kind !== "dmImage") inBubble(ctx, y + 22, ["お金を払わないと", "友達に送る"], 38);
    inputBar(ctx, kind === "dmStop");
  });

/** Saved evidence: a copy of the threat (left) and the account details (right). */
export const evidenceTexture = (kind: "msg" | "acct") =>
  canvasTexture(`y-evidence-${kind}`, 400, 300, (ctx) => {
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 0, 0, 400, 300, 30);
    ctx.fill();
    ctx.textAlign = "center";
    if (kind === "msg") {
      ctx.fillStyle = "#fff0f1";
      roundRect(ctx, 30, 60, 340, 120, 24);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = RED;
      ctx.stroke();
      ctx.fillStyle = "#9a1422";
      ctx.font = `900 30px ${JP}`;
      ctx.fillText("お金を払わないと", 200, 112);
      ctx.fillText("友達に送る", 200, 154);
      ctx.fillStyle = "#1f2430";
      ctx.font = `900 34px ${JP}`;
      ctx.fillText("メッセージ", 200, 250);
    } else {
      unknownAvatar(ctx, 200, 100, 46);
      ctx.fillStyle = "#1f2430";
      ctx.font = `900 34px ${JP}`;
      ctx.fillText(ACCOUNT, 200, 196);
      ctx.font = `900 34px ${JP}`;
      ctx.fillText("アカウント情報", 200, 250);
    }
  });

export const tint = (c: string, k: number) => new THREE.Color(c).lerp(new THREE.Color("#ffffff"), k);
