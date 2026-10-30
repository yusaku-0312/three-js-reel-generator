import * as THREE from "three";

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

const SCRIPT = `"Snell Roundhand", "Apple Chancery", "Brush Script MT", cursive`;
const SERIF = `"Didot", "Bodoni 72", "Times New Roman", serif`;

/** Tricolore for the toothpick flag (green / white / red). */
export const italyFlagTexture = () =>
  canvasTexture("italy", 192, 128, (ctx) => {
    ctx.fillStyle = "#009246";
    ctx.fillRect(0, 0, 64, 128);
    ctx.fillStyle = "#f6f3ec";
    ctx.fillRect(64, 0, 64, 128);
    ctx.fillStyle = "#ce2b37";
    ctx.fillRect(128, 0, 64, 128);
  });

/** Kraft-paper tag on the milk bottle: "latte" in script, "italiano" underneath. */
export const latteTagTexture = () =>
  canvasTexture("lattetag", 384, 256, (ctx) => {
    ctx.fillStyle = "#d9b98a";
    ctx.beginPath();
    ctx.moveTo(60, 8);
    ctx.lineTo(376, 8);
    ctx.lineTo(376, 248);
    ctx.lineTo(60, 248);
    ctx.lineTo(8, 128);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#a8834f";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = "#6b4426";
    ctx.beginPath();
    ctx.arc(52, 128, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a2010";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 120px ${SCRIPT}`;
    ctx.fillText("latte", 222, 112);
    ctx.font = `italic 34px ${SERIF}`;
    ctx.fillStyle = "#5a3a1e";
    ctx.fillText("italiano", 222, 200);
  });
