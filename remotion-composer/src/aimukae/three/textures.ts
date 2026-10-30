import * as THREE from "three";
import { rng } from "../core";

export { bokehTexture } from "../../paradise/three/textures";
export { glowTexture, starTexture } from "../../golden/three/textures";

/** Canvas text uses a system font so the first frame never caches a fallback face. */
export const JP = `"Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif`;

const cache = new Map<string, THREE.CanvasTexture>();

export const canvasTexture = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, srgb = true) => {
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

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/** Dusk over the town: indigo at the top, coral in the middle, a warm glow at the horizon. */
export const duskSkyTexture = () =>
  canvasTexture("m-dusk", 32, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#28345f");
    g.addColorStop(0.45, "#7a5a86");
    g.addColorStop(0.72, "#e88a6a");
    g.addColorStop(1, "#ffd3a0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 512);
  });

/** The voice lab: deep navy, slightly lighter in the middle so the props separate from it. */
export const labTexture = () =>
  canvasTexture("m-lab", 512, 1024, (ctx) => {
    const g = ctx.createRadialGradient(256, 470, 40, 256, 520, 700);
    g.addColorStop(0, "#1b2d55");
    g.addColorStop(0.55, "#0c1733");
    g.addColorStop(1, "#050914");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 1024);
  });

/** Asphalt: dark grey with fine aggregate speckle. */
export const asphaltTexture = () =>
  canvasTexture("m-asphalt", 512, 512, (ctx) => {
    const r = rng(12);
    ctx.fillStyle = "#4a4b52";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) {
      const v = 60 + Math.floor(r() * 50);
      ctx.fillStyle = `rgba(${v},${v},${v + 6},${0.35 + r() * 0.4})`;
      ctx.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2);
    }
  });

/** Sidewalk tiles: warm grey squares with thin joints. */
export const pavingTexture = () =>
  canvasTexture("m-paving", 512, 512, (ctx) => {
    const r = rng(7);
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const v = 160 + Math.floor(r() * 18);
        ctx.fillStyle = `rgb(${v},${v - 6},${v - 14})`;
        ctx.fillRect(x * 128, y * 128, 128, 128);
      }
    ctx.strokeStyle = "rgba(90,80,70,0.6)";
    ctx.lineWidth = 3;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 128, 0);
      ctx.lineTo(i * 128, 512);
      ctx.moveTo(0, i * 128);
      ctx.lineTo(512, i * 128);
      ctx.stroke();
    }
  });

/** Light wood grain for the figurines (toy look, no faces). */
export const woodGrainTexture = () =>
  canvasTexture("m-wood", 256, 256, (ctx) => {
    const r = rng(19);
    ctx.fillStyle = "#e9cfa8";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(160,110,60,${0.08 + r() * 0.12})`;
      ctx.lineWidth = 1 + r() * 2;
      ctx.beginPath();
      const x = r() * 256;
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 10, 80, x - 10, 170, x + 4, 256);
      ctx.stroke();
    }
  });

export type ScreenKind = "call" | "gen" | "contacts" | "dial" | "incoming" | "noanswer" | "ended" | "home";

const screenBg = (ctx: CanvasRenderingContext2D, top: string, bottom: string) => {
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 1024);
};

const avatar = (ctx: CanvasRenderingContext2D, y: number, color: string, label: string, sub: string, subColor = "#cfe3ff") => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(256, y, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(256, y - 22, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(256, y + 52, 58, 38, 0, Math.PI, 0);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 76px ${JP}`;
  ctx.fillText(label, 256, y + 190);
  ctx.fillStyle = subColor;
  ctx.font = `700 40px ${JP}`;
  ctx.fillText(sub, 256, y + 250);
};

const roundButton = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, glyph: "end" | "call") => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (glyph === "end") {
    ctx.moveTo(x - 30, y + 6);
    ctx.quadraticCurveTo(x, y - 18, x + 30, y + 6);
  } else {
    ctx.moveTo(x - 22, y - 22);
    ctx.quadraticCurveTo(x - 22, y + 22, x + 22, y + 22);
  }
  ctx.stroke();
};

/** Phone screens (512×1024). The waveform itself is drawn in 3D on top, so screens stay static. */
export const screenTexture = (kind: ScreenKind) =>
  canvasTexture(`m-screen-${kind}`, 512, 1024, (ctx) => {
    ctx.textAlign = "center";
    if (kind === "call") {
      screenBg(ctx, "#3a2440", "#14101f");
      avatar(ctx, 300, "#f07aa8", "ママ", "通話中  00:12");
      roundButton(ctx, 256, 860, "#ff4b4b", "end");
    } else if (kind === "gen") {
      screenBg(ctx, "#0e1a2c", "#081018");
      ctx.fillStyle = "#7ff3ff";
      ctx.font = `900 50px ${JP}`;
      ctx.fillText("AI 音声生成", 256, 110);
      ctx.fillStyle = "#1c2b44";
      roundRect(ctx, 40, 160, 432, 120, 24);
      ctx.fill();
      ctx.fillStyle = "#ff9ac4";
      ctx.font = `700 34px ${JP}`;
      ctx.fillText("声: ママ（クローン）", 256, 232);
      ctx.fillStyle = "#1c2b44";
      roundRect(ctx, 40, 600, 432, 150, 24);
      ctx.fill();
      ctx.fillStyle = "#e9f2ff";
      ctx.font = `700 34px ${JP}`;
      ctx.fillText("「その人と", 256, 660);
      ctx.fillText("一緒に来てね」", 256, 712);
      ctx.fillStyle = "#ff3b5c";
      roundRect(ctx, 96, 800, 320, 110, 55);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 48px ${JP}`;
      ctx.fillText("▶ 再生", 256, 872);
    } else if (kind === "contacts") {
      screenBg(ctx, "#f4fbfb", "#dff2f1");
      ctx.fillStyle = "#0f5b5e";
      ctx.font = `900 50px ${JP}`;
      ctx.fillText("連絡先", 256, 110);
      const rows: Array<[string, boolean]> = [["ママ", true], ["パパ", true], ["おばあちゃん", false]];
      rows.forEach(([name, star], i) => {
        const y = 200 + i * 150;
        ctx.fillStyle = i === 0 ? "#bff0ea" : "#ffffff";
        roundRect(ctx, 30, y, 452, 120, 24);
        ctx.fill();
        ctx.fillStyle = i === 0 ? "#f07aa8" : "#8fb3b5";
        ctx.beginPath();
        ctx.arc(96, y + 60, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#123c3e";
        ctx.textAlign = "left";
        ctx.font = `900 46px ${JP}`;
        ctx.fillText(name, 156, y + 76);
        if (star) {
          ctx.fillStyle = "#14a39a";
          ctx.font = `700 28px ${JP}`;
          ctx.fillText("登録済み", 330, y + 74);
        }
        ctx.textAlign = "center";
      });
      roundButton(ctx, 256, 860, "#19b38a", "call");
    } else if (kind === "dial") {
      screenBg(ctx, "#0f4a4e", "#062226");
      avatar(ctx, 300, "#f07aa8", "ママ", "発信中…", "#9ff3e6");
      roundButton(ctx, 256, 860, "#ff4b4b", "end");
    } else if (kind === "incoming") {
      screenBg(ctx, "#33405e", "#141a2c");
      avatar(ctx, 300, "#9aa6c4", "非通知", "着信", "#cfd8ee");
      roundButton(ctx, 140, 860, "#ff4b4b", "end");
      roundButton(ctx, 372, 860, "#19b38a", "call");
    } else if (kind === "noanswer") {
      screenBg(ctx, "#3b4250", "#1b1f27");
      avatar(ctx, 300, "#a98a98", "ママ", "応答なし", "#ffb3b3");
      roundButton(ctx, 256, 860, "#7d8594", "end");
    } else if (kind === "ended") {
      screenBg(ctx, "#2b2f3a", "#121419");
      avatar(ctx, 300, "#6f7790", "非通知", "通話終了", "#ffb3b3");
    } else {
      screenBg(ctx, "#2b6f87", "#123b52");
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 110px ${JP}`;
      ctx.fillText("16:42", 256, 260);
    }
  });

/** Promise card face: a numbered disc and two short lines, safety teal. */
export const cardTexture = (n: number, lines: string[], accent = "#18b3a3") =>
  canvasTexture(`m-card-${n}-${lines.join("")}`, 512, 640, (ctx) => {
    ctx.fillStyle = "#fffaf0";
    roundRect(ctx, 0, 0, 512, 640, 56);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 18;
    roundRect(ctx, 14, 14, 484, 612, 46);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(256, 190, 104, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `900 150px ${JP}`;
    ctx.fillText(String(n), 256, 244);
    ctx.fillStyle = "#123c3e";
    const size = lines.some((l) => l.length > 5) ? 64 : 76;
    ctx.font = `900 ${size}px ${JP}`;
    lines.forEach((l, i) => ctx.fillText(l, 256, 410 + i * (size + 18)));
  });

/** Small word card (名前, 誕生日, a secret word). */
export const wordCardTexture = (text: string, bg = "#ffffff", ink = "#26324a") =>
  canvasTexture(`m-word-${text}-${bg}`, 512, 256, (ctx) => {
    ctx.fillStyle = bg;
    roundRect(ctx, 0, 0, 512, 256, 40);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.font = `900 ${text.length > 4 ? 82 : 104}px ${JP}`;
    ctx.fillText(text, 256, 166);
  });

/** Wall sign plate (子ども110番の家, a school name, a shop awning). */
export const signTexture = (text: string, bg: string, ink: string, w = 512, h = 160) =>
  canvasTexture(`m-sign-${text}-${bg}`, w, h, (ctx) => {
    ctx.fillStyle = bg;
    roundRect(ctx, 0, 0, w, h, 18);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.font = `900 ${Math.round(h * 0.5)}px ${JP}`;
    ctx.fillText(text, w / 2, h * 0.68);
  });

/** Window glass: warm room light with a curtain edge, varied per seed. */
export const windowTexture = (seed: number) =>
  canvasTexture(`m-window-${seed}`, 64, 64, (ctx) => {
    const r = rng(seed);
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "#fff0c8");
    g.addColorStop(1, r() > 0.5 ? "#ffc27a" : "#ffd9a0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = "rgba(190,120,80,0.45)";
    ctx.fillRect(0, 0, 10 + r() * 10, 64);
    ctx.fillRect(64 - 8 - r() * 10, 0, 18, 64);
    ctx.fillStyle = "rgba(80,50,30,0.6)";
    ctx.fillRect(30, 0, 3, 64);
  });

/** Hand-drawn route map (portrait): school at the top, home at the bottom, places to ask for help. */
export const MAP_SPOTS = [
  { label: "学校", u: 0.68, v: 0.12 },
  { label: "お店", u: 0.68, v: 0.4 },
  { label: "子ども110番の家", u: 0.3, v: 0.62 },
  { label: "家", u: 0.3, v: 0.88 },
] as const;
export const MAP_ROUTE: Array<[number, number]> = [
  [0.68, 0.12],
  [0.68, 0.72],
  [0.3, 0.72],
  [0.3, 0.88],
];

export const mapTexture = () =>
  canvasTexture("m-map", 768, 1024, (ctx) => {
    const r = rng(23);
    ctx.fillStyle = "#f6efdc";
    ctx.fillRect(0, 0, 768, 1024);
    // blocks
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = r() > 0.5 ? "#e7dcc0" : "#dfe9d2";
      const x = r() * 700;
      const y = r() * 960;
      ctx.beginPath();
      ctx.roundRect(x, y, 60 + r() * 90, 50 + r() * 80, 10);
      ctx.fill();
    }
    // streets
    ctx.strokeStyle = "#cfc6b0";
    ctx.lineWidth = 46;
    ctx.lineCap = "round";
    [[0.68, 0.0, 0.68, 1.0], [0.0, 0.72, 1.0, 0.72], [0.3, 0.3, 0.3, 1.0], [0.0, 0.3, 1.0, 0.3]].forEach(([a, b, c, d]) => {
      ctx.beginPath();
      ctx.moveTo(a * 768, b * 1024);
      ctx.lineTo(c * 768, d * 1024);
      ctx.stroke();
    });
    // school route, dashed
    ctx.strokeStyle = "#16b8a4";
    ctx.lineWidth = 14;
    ctx.setLineDash([26, 18]);
    ctx.beginPath();
    MAP_ROUTE.forEach(([u, v], i) => (i ? ctx.lineTo(u * 768, v * 1024) : ctx.moveTo(u * 768, v * 1024)));
    ctx.stroke();
    ctx.setLineDash([]);
    // place labels
    ctx.textAlign = "center";
    MAP_SPOTS.forEach((s) => {
      const x = s.u * 768;
      const y = s.v * 1024;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#16b8a4";
      ctx.lineWidth = 6;
      const label = s.label;
      ctx.font = `900 ${label.length > 4 ? 44 : 58}px ${JP}`;
      const w = ctx.measureText(label).width + 36;
      const lx = Math.min(Math.max(x, w / 2 + 10), 768 - w / 2 - 10);
      ctx.beginPath();
      ctx.roundRect(lx - w / 2, y + 26, w, 76, 22);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#123c3e";
      ctx.fillText(label, lx, y + 82);
    });
  });
