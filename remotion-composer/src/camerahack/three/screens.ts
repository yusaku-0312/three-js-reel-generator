import { canvasTexture, JP } from "../../aimukae/three/textures";

/**
 * Canvas screens: the monitor app's night-vision feed (the sleeping child is only a blanket and the back of a
 * head), the maker's app (update / up to date), the account login and two-step verification, the stranger's
 * laptop, the manual cover and the code on the shield.
 */
export type ScreenKind = "feed" | "update" | "updated" | "appOk" | "loginShort" | "loginLong" | "twoStep" | "twoStepOn";

const RED = "#e8303f";
const TEAL = "#16b8a4";
const INK = "#1f2430";

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/** Night-vision view of the bed seen from the shelf camera: grey-green, a blanket hump and a small head. */
export const drawFeed = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, stolen = false) => {
  ctx.save();
  roundRect(ctx, x, y, w, h, w * 0.03);
  ctx.clip();
  const g = ctx.createRadialGradient(x + w * 0.5, y + h * 0.55, w * 0.05, x + w * 0.5, y + h * 0.55, w * 0.75);
  g.addColorStop(0, "#9fb5a2");
  g.addColorStop(1, "#2c3a32");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  // the wall line and the window
  ctx.fillStyle = "rgba(20,30,24,0.35)";
  ctx.fillRect(x, y, w, h * 0.38);
  ctx.fillStyle = "rgba(220,235,220,0.25)";
  ctx.fillRect(x + w * 0.55, y + h * 0.08, w * 0.3, h * 0.2);
  // bed, blanket hump, pillow, the child's head
  ctx.fillStyle = "#5d7262";
  roundRect(ctx, x + w * 0.1, y + h * 0.45, w * 0.82, h * 0.36, w * 0.04);
  ctx.fill();
  ctx.fillStyle = "#c9d8c8";
  roundRect(ctx, x + w * 0.66, y + h * 0.47, w * 0.22, h * 0.13, w * 0.04);
  ctx.fill();
  ctx.fillStyle = "#7f9784";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.46, y + h * 0.6, w * 0.26, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e3eadf";
  ctx.beginPath();
  ctx.arc(x + w * 0.73, y + h * 0.53, w * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#26302a";
  ctx.beginPath();
  ctx.arc(x + w * 0.745, y + h * 0.52, w * 0.062, Math.PI * 1.4, Math.PI * 0.4);
  ctx.fill();
  // scan lines
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  for (let yy = 0; yy < h; yy += 6) ctx.fillRect(x, y + yy, w, 2);
  // corner info
  const fs = Math.round(w * 0.06);
  ctx.font = `700 ${fs}px ${JP}`;
  ctx.textAlign = "left";
  ctx.fillStyle = stolen ? RED : "#ffffff";
  ctx.beginPath();
  ctx.arc(x + w * 0.07, y + h * 0.09, fs * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText(stolen ? "REC" : "LIVE", x + w * 0.11, y + h * 0.09 + fs * 0.36);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "right";
  ctx.fillText("02:14", x + w * 0.95, y + h * 0.09 + fs * 0.36);
  ctx.restore();
  ctx.textAlign = "center";
};

const bg = (ctx: CanvasRenderingContext2D, top: string, bottom: string) => {
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 1024);
};

const statusBar = (ctx: CanvasRenderingContext2D, ink: string, time = "02:14") => {
  ctx.fillStyle = ink;
  ctx.font = `700 28px ${JP}`;
  ctx.textAlign = "left";
  ctx.fillText(time, 40, 52);
  ctx.textAlign = "center";
};

const title = (ctx: CanvasRenderingContext2D, text: string, sub?: string) => {
  ctx.fillStyle = INK;
  ctx.font = `900 40px ${JP}`;
  ctx.fillText(text, 256, 140);
  if (sub) {
    ctx.fillStyle = "#6a7080";
    ctx.font = `700 26px ${JP}`;
    ctx.fillText(sub, 256, 184);
  }
};

const card = (ctx: CanvasRenderingContext2D, y: number, h: number, edge = "#d5d9e0", fill = "#ffffff") => {
  ctx.fillStyle = fill;
  roundRect(ctx, 34, y, 444, h, 26);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = edge;
  ctx.stroke();
};

const button = (ctx: CanvasRenderingContext2D, y: number, text: string, color: string) => {
  ctx.fillStyle = color;
  roundRect(ctx, 60, y, 392, 92, 46);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 38px ${JP}`;
  ctx.fillText(text, 256, y + 60);
};

const check = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.24;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y + r * 0.02);
  ctx.lineTo(x - r * 0.1, y + r * 0.38);
  ctx.lineTo(x + r * 0.5, y - r * 0.36);
  ctx.stroke();
};

/** A small drawing of the dome camera (for the app screens). */
const camIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.fillStyle = "#e9ecf2";
  roundRect(ctx, x - s * 0.5, y + s * 0.35, s, s * 0.22, s * 0.08);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, s * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#b9bfca";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#1c2230";
  ctx.beginPath();
  ctx.arc(x, y, s * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6fd0ff";
  ctx.beginPath();
  ctx.arc(x, y - s * 0.3, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
};

const feedScreen = (ctx: CanvasRenderingContext2D) => {
  bg(ctx, "#1a2033", "#0d1120");
  statusBar(ctx, "#ffffff");
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 36px ${JP}`;
  ctx.fillText("見守りカメラ", 256, 130);
  ctx.fillStyle = "#9aa3b8";
  ctx.font = `700 24px ${JP}`;
  ctx.fillText("子ども部屋", 256, 168);
  drawFeed(ctx, 26, 210, 460, 520);
  ctx.fillStyle = TEAL;
  roundRect(ctx, 126, 780, 260, 76, 38);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 34px ${JP}`;
  ctx.fillText("見守り中", 256, 830);
};

const updateScreen = (ctx: CanvasRenderingContext2D, done: boolean) => {
  bg(ctx, "#f6f8fb", "#eaf0f5");
  statusBar(ctx, INK, "21:05");
  ctx.fillStyle = "#6a7080";
  ctx.font = `700 24px ${JP}`;
  ctx.fillText("メーカー公式アプリ", 256, 100);
  title(ctx, "カメラ本体の更新");
  camIcon(ctx, 256, 320, 170);
  card(ctx, 470, 190, done ? TEAL : "#f0a64a", done ? "#e3faf6" : "#fff6e8");
  ctx.fillStyle = INK;
  ctx.font = `900 34px ${JP}`;
  ctx.fillText(done ? "最新の状態です" : "新しい更新があります", 256, 545);
  ctx.fillStyle = "#6a7080";
  ctx.font = `700 26px ${JP}`;
  ctx.fillText(done ? "弱点の修正を適用しました" : "弱点の修正を含みます", 256, 605);
  if (done) check(ctx, 256, 780, 64);
  else button(ctx, 730, "更新する", TEAL);
};

const appOkScreen = (ctx: CanvasRenderingContext2D) => {
  bg(ctx, "#f6f8fb", "#eaf0f5");
  statusBar(ctx, INK, "21:06");
  title(ctx, "アプリ", "スマホのアプリ");
  card(ctx, 260, 170, TEAL, "#e3faf6");
  ctx.fillStyle = INK;
  ctx.font = `900 36px ${JP}`;
  ctx.fillText("アプリは最新です", 256, 360);
  check(ctx, 256, 560, 70);
  card(ctx, 700, 170, "#f0a64a", "#fff6e8");
  ctx.fillStyle = INK;
  ctx.font = `900 32px ${JP}`;
  ctx.fillText("カメラ本体は", 256, 772);
  ctx.fillText("別に確認", 256, 820);
};

const field = (ctx: CanvasRenderingContext2D, y: number, label: string, value: string, edge: string) => {
  ctx.textAlign = "left";
  ctx.fillStyle = "#6a7080";
  ctx.font = `700 26px ${JP}`;
  ctx.fillText(label, 44, y - 14);
  ctx.textAlign = "center";
  card(ctx, y, 96, edge);
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = `900 34px ${JP}`;
  ctx.fillText(value, 64, y + 62);
  ctx.textAlign = "center";
};

const loginScreen = (ctx: CanvasRenderingContext2D, long: boolean) => {
  bg(ctx, "#f6f8fb", "#eaf0f5");
  statusBar(ctx, INK, "21:08");
  title(ctx, "ログイン", "映像を見るためのアカウント");
  camIcon(ctx, 256, 300, 120);
  field(ctx, 450, "メールアドレス", "mama@example.jp", "#d5d9e0");
  field(ctx, 620, "パスワード", long ? "●●●●●●●●●●●●●●●●" : "●●●●", long ? TEAL : "#d5d9e0");
  if (long) {
    ctx.fillStyle = TEAL;
    roundRect(ctx, 290, 735, 188, 50, 25);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 26px ${JP}`;
    ctx.fillText("強い", 384, 769);
  }
  button(ctx, 840, "ログイン", "#3a4560");
};

const twoStepScreen = (ctx: CanvasRenderingContext2D, on: boolean) => {
  bg(ctx, "#f6f8fb", "#eaf0f5");
  statusBar(ctx, INK, "21:09");
  title(ctx, "2段階認証", "パスワード＋確認コード");
  card(ctx, 240, 130, on ? TEAL : "#d5d9e0", on ? "#e3faf6" : "#ffffff");
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = `900 36px ${JP}`;
  ctx.fillText(on ? "有効" : "無効", 70, 318);
  ctx.textAlign = "center";
  // the switch
  ctx.fillStyle = on ? TEAL : "#c4c9d2";
  roundRect(ctx, 330, 270, 120, 70, 35);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(on ? 415 : 365, 305, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a7080";
  ctx.font = `700 28px ${JP}`;
  ctx.fillText("確認コード", 256, 470);
  ["4", "8", "2", "9", "1", "3"].forEach((d, i) => {
    const x = 52 + i * 70;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, x, 500, 58, 84, 14);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = on ? TEAL : "#b8bdc6";
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `900 46px ${JP}`;
    ctx.fillText(d, x + 29, 560);
  });
  ctx.fillStyle = "#6a7080";
  ctx.font = `700 26px ${JP}`;
  ctx.fillText("ログインのたびに届きます", 256, 650);
  if (on) check(ctx, 256, 790, 64);
};

export const screenTexture = (kind: ScreenKind) =>
  canvasTexture(`ch-screen-${kind}`, 512, 1024, (ctx) => {
    ctx.textAlign = "center";
    if (kind === "feed") feedScreen(ctx);
    else if (kind === "update") updateScreen(ctx, false);
    else if (kind === "updated") updateScreen(ctx, true);
    else if (kind === "appOk") appOkScreen(ctx);
    else if (kind === "loginShort") loginScreen(ctx, false);
    else if (kind === "loginLong") loginScreen(ctx, true);
    else if (kind === "twoStep") twoStepScreen(ctx, false);
    else twoStepScreen(ctx, true);
  });

/** The stranger's laptop: the same feed, red-edged, REC blinking (two textures, blink by swapping). */
export const laptopTexture = (rec: boolean) =>
  canvasTexture(`ch-laptop-${rec}`, 800, 500, (ctx) => {
    ctx.fillStyle = "#0b0d14";
    ctx.fillRect(0, 0, 800, 500);
    drawFeed(ctx, 24, 24, 752, 452, rec);
    ctx.lineWidth = 10;
    ctx.strokeStyle = RED;
    ctx.strokeRect(5, 5, 790, 490);
  });

export const manualTexture = () =>
  canvasTexture("ch-manual", 360, 480, (ctx) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 360, 480);
    ctx.fillStyle = "#3a6ac0";
    ctx.fillRect(0, 0, 360, 70);
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.font = `900 46px ${JP}`;
    ctx.fillText("説明書", 180, 160);
    camIcon(ctx, 180, 300, 150);
    ctx.fillStyle = "#6a7080";
    ctx.font = `700 26px ${JP}`;
    ctx.fillText("見守りカメラ", 180, 430);
  });

/** Six-digit code on the shield face. */
export const codeTexture = () =>
  canvasTexture("ch-code", 512, 256, (ctx) => {
    ctx.clearRect(0, 0, 512, 256);
    ctx.textAlign = "center";
    ctx.fillStyle = "#eafffb";
    ctx.font = `900 64px ${JP}`;
    ctx.fillText("確認コード", 256, 86);
    ctx.font = `900 96px ${JP}`;
    ctx.fillText("482 913", 256, 206);
  });

/** Key tag 「パスワード」 for the stranger's key. */
export const tagTexture = () =>
  canvasTexture("ch-tag", 384, 128, (ctx) => {
    ctx.fillStyle = "#fff0f1";
    roundRect(ctx, 4, 4, 376, 120, 30);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = RED;
    ctx.stroke();
    ctx.fillStyle = "#8a1020";
    ctx.textAlign = "center";
    ctx.font = `900 60px ${JP}`;
    ctx.fillText("パスワード", 192, 86);
  });
