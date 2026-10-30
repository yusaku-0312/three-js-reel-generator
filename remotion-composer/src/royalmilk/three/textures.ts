import * as THREE from "three";
import { rng } from "../core";

const cache = new Map<string, THREE.CanvasTexture>();

const canvasTexture = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d") as CanvasRenderingContext2D);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
};

const CHALK = `"Chalkboard SE", "Marker Felt", "Comic Sans MS", sans-serif`;
const JP = `"Hiragino Mincho ProN", "Yu Mincho", serif`;

/** Screen-space backdrop: warm cocoa, a little lighter where the counter meets the wall. */
export const cafeBackground = () =>
  canvasTexture("bg", 32, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#1e1009");
    g.addColorStop(0.45, "#4a2a16");
    g.addColorStop(0.65, "#32190c");
    g.addColorStop(1, "#140904");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 512);
  });

/** Cream subway tiles with darker grout (tiled on the back wall). */
export const tileTexture = () =>
  canvasTexture("tile", 256, 256, (ctx) => {
    ctx.fillStyle = "#6e5642";
    ctx.fillRect(0, 0, 256, 256);
    const r = rng(5);
    for (let row = 0; row < 4; row++) {
      for (let col = -1; col < 3; col++) {
        const x = col * 128 + (row % 2) * 64 + 3;
        const shade = 225 + Math.floor(r() * 20);
        ctx.fillStyle = `rgb(${shade},${shade - 14},${shade - 34})`;
        ctx.fillRect(x, row * 64 + 3, 122, 58);
      }
    }
  });

const chalkboard = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.fillStyle = "#6b4426";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#1f2a24";
  ctx.fillRect(28, 28, w - 56, h - 56);
  const r = rng(9);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.015 + r() * 0.03})`;
    ctx.fillRect(28 + r() * (w - 56), 28 + r() * (h - 56), 2 + r() * 30, 1 + r() * 3);
  }
};

/** Chalk text revealed left to right by `k` (0..1), the way a hand writes it. */
const chalkText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, k: number, color = "#f6efe2") => {
  if (k <= 0) return;
  ctx.save();
  ctx.font = `${size}px ${CHALK}`;
  ctx.textAlign = "center";
  const width = ctx.measureText(text).width;
  ctx.beginPath();
  ctx.rect(x - width / 2 - 4, y - size, (width + 8) * k, size * 1.4);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.fillText(text, x, y);
  ctx.restore();
};

const STEPS = 12;
const q = (k: number) => Math.round(Math.min(1, Math.max(0, k)) * STEPS) / STEPS;

/** Front of the board: the café's own menu with ロイヤルミルクティー written in at `write`. */
export const boardFrontTexture = (write: number) => {
  const k = q(write);
  return canvasTexture(`front${k}`, 512, 640, (ctx) => {
    chalkboard(ctx, 512, 640);
    chalkText(ctx, "MENU", 256, 120, 64, 1, "#f3c27a");
    ctx.fillStyle = "rgba(246,239,226,0.5)";
    ctx.fillRect(140, 150, 232, 3);
    chalkText(ctx, "Royal", 256, 280, 92, k * 3);
    chalkText(ctx, "Milk Tea", 256, 390, 92, k * 3 - 1);
    chalkText(ctx, "ロイヤルミルクティー", 256, 500, 40, k * 3 - 2, "#f3c27a");
  });
};

/** Back of the board: a London tea room menu. `royal` = how far the absent item is written, `cross` its strike-out. */
export const boardBackTexture = (royal: number, cross: number) => {
  const a = q(royal);
  const c = q(cross);
  return canvasTexture(`back${a}_${c}`, 512, 640, (ctx) => {
    chalkboard(ctx, 512, 640);
    chalkText(ctx, "LONDON", 256, 100, 52, 1, "#f3c27a");
    chalkText(ctx, "TEA ROOM", 256, 150, 40, 1, "#f3c27a");
    ["Milk Tea", "Earl Grey", "Assam", "Darjeeling"].forEach((item, i) => chalkText(ctx, item, 256, 240 + i * 66, 46, 1));
    chalkText(ctx, "Royal Milk Tea ?", 256, 540, 46, a, "#ffd9a0");
    if (c > 0) {
      ctx.save();
      ctx.strokeStyle = "#ff5a4a";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.shadowColor = "#ff5a4a";
      ctx.shadowBlur = 8;
      const stroke = (x0: number, y0: number, x1: number, y1: number, k: number) => {
        if (k <= 0) return;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + (x1 - x0) * Math.min(1, k), y0 + (y1 - y0) * Math.min(1, k));
        ctx.stroke();
      };
      stroke(70, 490, 442, 570, c * 2);
      stroke(442, 490, 70, 570, c * 2 - 1);
      ctx.restore();
    }
  });
};

/** Small Japanese flag for the toothpick pick. */
export const flagTexture = () =>
  canvasTexture("flag", 192, 128, (ctx) => {
    ctx.fillStyle = "#fbf8f2";
    ctx.fillRect(0, 0, 192, 128);
    ctx.fillStyle = "#c8102e";
    ctx.beginPath();
    ctx.arc(96, 64, 38, 0, Math.PI * 2);
    ctx.fill();
  });

/** Sepia postcard of a Kyoto townhouse tea shop (generic: no shop name), with 1965 in the corner. */
export const postcardTexture = () =>
  canvasTexture("postcard", 640, 448, (ctx) => {
    ctx.fillStyle = "#f1e2c4";
    ctx.fillRect(0, 0, 640, 448);
    ctx.fillStyle = "#d9bf92";
    ctx.fillRect(24, 24, 592, 400);
    // sky
    const sky = ctx.createLinearGradient(0, 24, 0, 220);
    sky.addColorStop(0, "#e9d2a6");
    sky.addColorStop(1, "#d6b585");
    ctx.fillStyle = sky;
    ctx.fillRect(24, 24, 592, 200);
    // roof (tiled, dark) and eaves
    ctx.fillStyle = "#4a3524";
    ctx.beginPath();
    ctx.moveTo(40, 170);
    ctx.lineTo(600, 170);
    ctx.lineTo(560, 110);
    ctx.lineTo(80, 110);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2e2016";
    ctx.lineWidth = 3;
    for (let x = 90; x < 560; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 112);
      ctx.lineTo(x - 8, 168);
      ctx.stroke();
    }
    // facade with lattice (koshi)
    ctx.fillStyle = "#7a5636";
    ctx.fillRect(60, 170, 520, 254);
    ctx.fillStyle = "#5b3f27";
    for (let x = 70; x < 250; x += 12) ctx.fillRect(x, 190, 5, 220);
    for (let x = 400; x < 570; x += 12) ctx.fillRect(x, 190, 5, 220);
    // doorway and noren
    ctx.fillStyle = "#2c1d12";
    ctx.fillRect(262, 200, 126, 224);
    ctx.fillStyle = "#3f5f6b";
    for (let i = 0; i < 3; i++) ctx.fillRect(262 + i * 42 + 2, 200, 38, 110);
    ctx.fillStyle = "#f6ecd6";
    ctx.font = `bold 52px ${JP}`;
    ctx.textAlign = "center";
    ctx.fillText("紅茶", 325, 275);
    // lantern glow
    const glow = ctx.createRadialGradient(230, 230, 0, 230, 230, 40);
    glow.addColorStop(0, "rgba(255,226,160,0.9)");
    glow.addColorStop(1, "rgba(255,226,160,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(190, 190, 80, 80);
    ctx.fillStyle = "#f0dcae";
    ctx.fillRect(220, 212, 20, 34);
    // caption
    ctx.fillStyle = "#4a3524";
    ctx.font = `italic 30px Georgia, serif`;
    ctx.textAlign = "left";
    ctx.fillText("KYOTO", 44, 64);
    ctx.textAlign = "right";
    ctx.fillText("1965", 596, 64);
    // sepia grain and vignette
    const r = rng(3);
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = `rgba(80,50,20,${r() * 0.08})`;
      ctx.fillRect(r() * 640, r() * 448, 2, 2);
    }
    const vig = ctx.createRadialGradient(320, 224, 120, 320, 224, 380);
    vig.addColorStop(0, "rgba(60,35,10,0)");
    vig.addColorStop(1, "rgba(60,35,10,0.45)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, 640, 448);
  });
