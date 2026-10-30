import * as THREE from "three";
import { rng } from "../core";

const cache = new Map<string, THREE.CanvasTexture>();

const canvasTexture = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, srgb = true) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d") as CanvasRenderingContext2D);
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
};

/** Screen-space sky behind everything: deep turquoise at the top fading to a pale haze. */
export const skyTexture = () =>
  canvasTexture("p-sky", 32, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#1f9fc0");
    g.addColorStop(0.55, "#7fd6df");
    g.addColorStop(1, "#e8f7ef");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 512);
  });

/** One palm silhouette: curved trunk and drooping fronds. */
const palm = (ctx: CanvasRenderingContext2D, x: number, base: number, h: number, lean: number, r: () => number) => {
  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.lineCap = "round";
  ctx.lineWidth = h * 0.035;
  ctx.beginPath();
  ctx.moveTo(x, base);
  const topX = x + lean * h;
  const topY = base - h;
  ctx.quadraticCurveTo(x + lean * h * 0.2, base - h * 0.6, topX, topY);
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i / 8 - 0.5) * Math.PI * 1.7 + (r() - 0.5) * 0.25;
    const len = h * (0.42 + r() * 0.16);
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.55 + len * 0.35;
    ctx.lineWidth = h * 0.05;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * len * 0.5, topY + Math.sin(a) * len * 0.5 - len * 0.12, ex, ey);
    ctx.stroke();
  }
};

/**
 * Far backdrop painted once: sky, a soft sun, the sea at the horizon, a strip of sand and a few palms.
 * It sits far behind the set, so the depth-of-field pass turns it into a sunny blur.
 */
export const backdropTexture = () =>
  canvasTexture("p-backdrop", 2048, 1024, (ctx) => {
    const r = rng(77);
    const sky = ctx.createLinearGradient(0, 0, 0, 640);
    sky.addColorStop(0, "#2aa6c6");
    sky.addColorStop(0.6, "#8fdbe2");
    sky.addColorStop(1, "#f3f7e6");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 2048, 640);
    const sun = ctx.createRadialGradient(560, 300, 0, 560, 300, 420);
    sun.addColorStop(0, "rgba(255,252,236,1)");
    sun.addColorStop(0.12, "rgba(255,246,214,0.95)");
    sun.addColorStop(0.4, "rgba(255,236,190,0.35)");
    sun.addColorStop(1, "rgba(255,236,190,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, 2048, 700);
    for (let i = 0; i < 7; i++) {
      const cx = r() * 2048;
      const cy = 120 + r() * 300;
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        ctx.ellipse(cx + (r() - 0.5) * 220, cy + (r() - 0.5) * 30, 70 + r() * 90, 22 + r() * 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const sea = ctx.createLinearGradient(0, 640, 0, 780);
    sea.addColorStop(0, "#22a9bf");
    sea.addColorStop(1, "#63d3cf");
    ctx.fillStyle = sea;
    ctx.fillRect(0, 640, 2048, 140);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 60; i++) ctx.fillRect(r() * 2048, 650 + r() * 120, 30 + r() * 120, 2);
    const sand = ctx.createLinearGradient(0, 780, 0, 1024);
    sand.addColorStop(0, "#f4e3c0");
    sand.addColorStop(1, "#e8cfa2");
    ctx.fillStyle = sand;
    ctx.fillRect(0, 780, 2048, 244);
    ctx.fillStyle = "#2f5b45";
    palm(ctx, 120, 820, 520, 0.18, r);
    palm(ctx, 260, 830, 380, -0.12, r);
    palm(ctx, 1780, 830, 560, -0.2, r);
    palm(ctx, 1930, 840, 400, 0.1, r);
    ctx.fillStyle = "#3f7a5a";
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.ellipse(r() < 0.5 ? r() * 420 : 1620 + r() * 428, 830 + r() * 30, 40 + r() * 70, 26 + r() * 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });

/** Pale terrazzo: warm stone with small chips of sand, coral and sea green. */
export const terrazzoTexture = () =>
  canvasTexture("p-terrazzo", 1024, 1024, (ctx) => {
    const r = rng(31);
    ctx.fillStyle = "#efe6d6";
    ctx.fillRect(0, 0, 1024, 1024);
    const chips = ["#d9c7ab", "#c9b08e", "#f2b9a0", "#9fcfc4", "#ffffff", "#e3d4bd"];
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = chips[Math.floor(r() * chips.length)];
      ctx.globalAlpha = 0.45 + r() * 0.5;
      const x = r() * 1024;
      const y = r() * 1024;
      const s = 2 + r() * (r() < 0.1 ? 14 : 5);
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + r();
        ctx.lineTo(x + Math.cos(a) * s * (0.6 + r() * 0.5), y + Math.sin(a) * s * (0.6 + r() * 0.5));
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });

/** Gobo for the sun spot: white light broken by palm fronds (dark), blurred so the shade is soft. */
export const palmGoboTexture = () =>
  canvasTexture(
    "p-gobo",
    512,
    512,
    (ctx) => {
      const r = rng(5);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.filter = "blur(5px)";
      ctx.fillStyle = "#2a2a2a";
      const frond = (cx: number, cy: number, len: number, ang: number) => {
        for (let i = 0; i < 16; i++) {
          const t = i / 15;
          const px = cx + Math.cos(ang) * len * t;
          const py = cy + Math.sin(ang) * len * t + Math.sin(t * Math.PI) * len * 0.12;
          for (const side of [-1, 1]) {
            const la = ang + side * (1.1 - t * 0.4);
            const ll = len * 0.3 * (1 - t * 0.6);
            ctx.beginPath();
            ctx.ellipse(px + Math.cos(la) * ll * 0.5, py + Math.sin(la) * ll * 0.5, ll * 0.5, len * 0.022, la, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      };
      frond(-40, 40, 420, 0.5);
      frond(560, -30, 380, 2.4);
      frond(540, 520, 340, -2.5 + r() * 0.1);
      frond(-30, 470, 300, -0.45);
      ctx.filter = "none";
    },
    false,
  );

/** Out-of-focus light: flat disc with a slightly brighter rim and a soft edge. */
export const bokehTexture = () =>
  canvasTexture("p-bokeh", 128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(0.78, "rgba(255,255,255,0.7)");
    g.addColorStop(0.9, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(64, 64, 62, 0, Math.PI * 2);
    ctx.fill();
  });

/** Soft ribbon of scent: bright core fading to the edges across v, and to both ends along u. */
export const ribbonTexture = () =>
  canvasTexture(
    "p-ribbon",
    256,
    64,
    (ctx) => {
      const across = ctx.createLinearGradient(0, 0, 0, 64);
      across.addColorStop(0, "rgba(255,255,255,0)");
      across.addColorStop(0.5, "rgba(255,255,255,1)");
      across.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = across;
      ctx.fillRect(0, 0, 256, 64);
      ctx.globalCompositeOperation = "destination-in";
      const along = ctx.createLinearGradient(0, 0, 256, 0);
      along.addColorStop(0, "rgba(0,0,0,0)");
      along.addColorStop(0.2, "rgba(0,0,0,1)");
      along.addColorStop(0.75, "rgba(0,0,0,1)");
      along.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = along;
      ctx.fillRect(0, 0, 256, 64);
    },
    false,
  );

/** Dry black tea seen from above: twisted dark leaves on a near-black heap. */
export const teaLeavesTexture = () =>
  canvasTexture("p-leaves", 512, 512, (ctx) => {
    const r = rng(9);
    ctx.fillStyle = "#1d0f07";
    ctx.fillRect(0, 0, 512, 512);
    const tones = ["#2c170b", "#3b200f", "#4a2a13", "#241208", "#5a3518"];
    for (let i = 0; i < 2200; i++) {
      ctx.strokeStyle = tones[Math.floor(r() * tones.length)];
      ctx.lineWidth = 2 + r() * 3;
      const x = r() * 512;
      const y = r() * 512;
      const a = r() * Math.PI;
      const l = 6 + r() * 12;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 6, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
  });
