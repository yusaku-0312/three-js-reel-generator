import * as THREE from "three";
import { canvasTexture, JP } from "../../aimukae/three/textures";
import { screenTexture as hackScreen, ScreenKind as HackKind } from "../../camerahack/three/screens";
import { photoTexture } from "../../snsyuukai/three/textures";

/**
 * Canvas screens of this reel: the monitor app with the talk button (the room feed shows the child awake at
 * home), the same app on the stranger's laptop (red), the child's phone calling the usual number, the call that
 * does not connect, and a family video post. The update / login / two-step screens come from src/camerahack.
 */
export type OwnKind = "talk" | "talkOn" | "calling" | "noAnswer" | "videoPost";
export type Screen = OwnKind | HackKind;

const RED = "#e8303f";
const TEAL = "#16b8a4";
const INK = "#1f2430";
const WARM = "#f0a64a";

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

const bg = (ctx: CanvasRenderingContext2D, top: string, bottom: string) => {
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 1024);
};

const statusBar = (ctx: CanvasRenderingContext2D, ink: string, time: string) => {
  ctx.fillStyle = ink;
  ctx.font = `700 28px ${JP}`;
  ctx.textAlign = "left";
  ctx.fillText(time, 40, 52);
  ctx.textAlign = "center";
};

/** Evening view of the child's room from the shelf camera: lamp-lit wall, the bed, the child standing. */
export const drawRoomFeed = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, stolen = false) => {
  ctx.save();
  roundRect(ctx, x, y, w, h, w * 0.03);
  ctx.clip();
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#c9b79a");
  g.addColorStop(1, "#6d5a46");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,226,170,0.35)";
  ctx.beginPath();
  ctx.arc(x + w * 0.18, y + h * 0.3, w * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8a6e52";
  ctx.fillRect(x, y + h * 0.62, w, h * 0.38);
  ctx.fillStyle = "#6f9ad0";
  roundRect(ctx, x + w * 0.45, y + h * 0.5, w * 0.5, h * 0.2, w * 0.03);
  ctx.fill();
  ctx.fillStyle = "#f4f1ea";
  roundRect(ctx, x + w * 0.78, y + h * 0.46, w * 0.15, h * 0.08, w * 0.02);
  ctx.fill();
  // the child, standing, small
  ctx.fillStyle = "#f2c94a";
  roundRect(ctx, x + w * 0.27, y + h * 0.52, w * 0.1, h * 0.17, w * 0.03);
  ctx.fill();
  ctx.fillStyle = "#2f3b5c";
  ctx.fillRect(x + w * 0.285, y + h * 0.68, w * 0.07, h * 0.1);
  ctx.fillStyle = "#e9cfa8";
  ctx.beginPath();
  ctx.arc(x + w * 0.32, y + h * 0.47, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1612";
  ctx.beginPath();
  ctx.arc(x + w * 0.32, y + h * 0.455, w * 0.052, Math.PI * 1.05, Math.PI * 1.95);
  ctx.fill();
  const fs = Math.round(w * 0.06);
  ctx.font = `700 ${fs}px ${JP}`;
  ctx.textAlign = "left";
  ctx.fillStyle = stolen ? RED : "#ffffff";
  ctx.beginPath();
  ctx.arc(x + w * 0.07, y + h * 0.09, fs * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText("LIVE", x + w * 0.11, y + h * 0.09 + fs * 0.36);
  ctx.restore();
  ctx.textAlign = "center";
};

/** Microphone glyph centred at (x, y). */
const mic = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) => {
  ctx.fillStyle = color;
  roundRect(ctx, x - s * 0.18, y - s * 0.45, s * 0.36, s * 0.6, s * 0.18);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.07;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y - s * 0.05, s * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.25);
  ctx.lineTo(x, y + s * 0.42);
  ctx.stroke();
};

/** The monitor app: room feed and the big talk button (`on`: held down, talking). */
const talkScreen = (ctx: CanvasRenderingContext2D, on: boolean, stolen = false) => {
  bg(ctx, "#1a2033", "#0d1120");
  statusBar(ctx, "#ffffff", "17:40");
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 36px ${JP}`;
  ctx.fillText("見守りカメラ", 256, 130);
  ctx.fillStyle = "#9aa3b8";
  ctx.font = `700 24px ${JP}`;
  ctx.fillText("リビング", 256, 168);
  drawRoomFeed(ctx, 26, 200, 460, 400, stolen);
  const c = stolen ? RED : on ? TEAL : "#3a83e8";
  if (on) {
    ctx.fillStyle = stolen ? "rgba(232,48,63,0.25)" : "rgba(22,184,164,0.25)";
    ctx.beginPath();
    ctx.arc(256, 780, 132, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(256, 780, 104, 0, Math.PI * 2);
  ctx.fill();
  mic(ctx, 256, 790, 120, "#ffffff");
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 38px ${JP}`;
  ctx.fillText(on ? "話しています…" : "話しかける", 256, 950);
};

/** The child's phone calling the usual number (Mama). */
const callScreen = (ctx: CanvasRenderingContext2D, failed: boolean) => {
  bg(ctx, failed ? "#3a3f4a" : "#123a3a", failed ? "#22262e" : "#0b2222");
  statusBar(ctx, "#ffffff", "17:42");
  ctx.fillStyle = failed ? "#9aa0aa" : "#bff3ea";
  ctx.font = `700 30px ${JP}`;
  ctx.fillText("いつもの番号", 256, 170);
  ctx.fillStyle = failed ? "#c9ced8" : "#ffffff";
  ctx.beginPath();
  ctx.arc(256, 330, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = failed ? "#3a3f4a" : "#123a3a";
  ctx.font = `900 96px ${JP}`;
  ctx.fillText("マ", 256, 364);
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 64px ${JP}`;
  ctx.fillText("ママ", 256, 540);
  ctx.font = `700 32px ${JP}`;
  ctx.fillStyle = failed ? "#ffb3ba" : "#bff3ea";
  ctx.fillText(failed ? "つながりません" : "発信中…", 256, 610);
  ctx.fillStyle = failed ? "#6a7080" : RED;
  ctx.beginPath();
  ctx.arc(256, 860, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(256, 860);
  ctx.rotate(Math.PI * 0.75);
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, -40, -14, 80, 28, 14);
  ctx.fill();
  ctx.restore();
};

/** A family video post on SNS: the clip with a play button and a sound mark, public. */
const videoPostScreen = (ctx: CanvasRenderingContext2D) => {
  bg(ctx, "#ffffff", "#ffffff");
  ctx.fillStyle = INK;
  ctx.font = `900 34px ${JP}`;
  ctx.fillText("投稿", 256, 110);
  const img = photoTexture("birthday").image as CanvasImageSource;
  ctx.drawImage(img, 16, 150, 480, 600);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.arc(256, 450, 76, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(232, 408);
  ctx.lineTo(300, 450);
  ctx.lineTo(232, 492);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  roundRect(ctx, 30, 690, 150, 46, 23);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 26px ${JP}`;
  ctx.fillText("♪ 0:24", 105, 722);
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = `800 32px ${JP}`;
  ctx.fillText("ママと歌ったよ♪", 30, 820);
  ctx.fillStyle = WARM;
  ctx.font = `900 30px ${JP}`;
  ctx.fillText("公開", 30, 880);
  ctx.textAlign = "center";
};

const own = (kind: OwnKind) =>
  canvasTexture(`mk-screen-${kind}`, 512, 1024, (ctx) => {
    ctx.textAlign = "center";
    if (kind === "talk") talkScreen(ctx, false);
    else if (kind === "talkOn") talkScreen(ctx, true);
    else if (kind === "calling") callScreen(ctx, false);
    else if (kind === "noAnswer") callScreen(ctx, true);
    else videoPostScreen(ctx);
  });

const OWN: OwnKind[] = ["talk", "talkOn", "calling", "noAnswer", "videoPost"];

export const screenTexture = (kind: Screen): THREE.Texture => (OWN.includes(kind as OwnKind) ? own(kind as OwnKind) : hackScreen(kind as HackKind));

/** The stranger's laptop: the same app in red, the talk button held. */
export const laptopTalkTexture = () =>
  canvasTexture("mk-laptop-talk", 800, 500, (ctx) => {
    ctx.fillStyle = "#0b0d14";
    ctx.fillRect(0, 0, 800, 500);
    drawRoomFeed(ctx, 24, 24, 470, 452, true);
    ctx.fillStyle = "rgba(232,48,63,0.25)";
    ctx.beginPath();
    ctx.arc(650, 230, 118, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(650, 230, 92, 0, Math.PI * 2);
    ctx.fill();
    mic(ctx, 650, 240, 110, "#ffffff");
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `900 36px ${JP}`;
    ctx.fillText("話しかける", 650, 400);
    ctx.lineWidth = 10;
    ctx.strokeStyle = RED;
    ctx.strokeRect(5, 5, 790, 490);
  });

/** Frosted glass of the front door with a dark-red figure standing outside. */
export const frostTexture = (figure: boolean) =>
  canvasTexture(`mk-frost-${figure}`, 128, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#d9dde6");
    g.addColorStop(1, "#aab2c2");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 512);
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + (i % 7) * 0.012})`;
      ctx.fillRect((i * 37) % 128, (i * 91) % 512, 3, 3);
    }
    if (!figure) return;
    ctx.filter = "blur(10px)";
    ctx.fillStyle = "rgba(90,20,30,0.85)";
    ctx.beginPath();
    ctx.arc(64, 150, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(64, 360, 52, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = "none";
  });
