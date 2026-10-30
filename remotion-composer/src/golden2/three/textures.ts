import * as THREE from "three";

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

/** Out-of-focus light: flat disc with a slightly brighter rim and a soft edge. */
export const bokehTexture = () =>
  canvasTexture("bokeh", 128, 128, (ctx) => {
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

/** Contact shadow: dense at the centre, gone at the edge. Used with a black material's alphaMap. */
export const contactTexture = () =>
  canvasTexture(
    "contact",
    128,
    128,
    (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgb(255,255,255)");
      g.addColorStop(0.55, "rgb(150,150,150)");
      g.addColorStop(1, "rgb(0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    },
    false,
  );

/** Tea seen from above: deep red-brown centre, amber where the layer thins at the wall, a bright meniscus. */
export const teaTexture = () =>
  canvasTexture("tea2", 512, 512, (ctx) => {
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    g.addColorStop(0, "#4a1504");
    g.addColorStop(0.55, "#6a2408");
    g.addColorStop(0.82, "#9a4012");
    g.addColorStop(0.93, "#d27a28");
    g.addColorStop(0.985, "#f2b65a");
    g.addColorStop(1, "#ffe0a0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
  });

/** Folded place card: cream stock, gold border, serif "Guest of Honour". */
export const placeCardTexture = (serif: string) =>
  canvasTexture(`card-${serif}`, 1024, 512, (ctx) => {
    ctx.fillStyle = "#fbf3e2";
    ctx.fillRect(0, 0, 1024, 512);
    ctx.strokeStyle = "#c9962e";
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 964, 452);
    ctx.lineWidth = 3;
    ctx.strokeRect(58, 58, 908, 396);
    ctx.fillStyle = "#6b4512";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `italic 700 118px ${serif}`;
    ctx.fillText("Guest of Honour", 512, 236);
    ctx.font = `600 54px ${serif}`;
    ctx.fillStyle = "#a07424";
    ctx.fillText("— ✦ —", 512, 360);
  });
