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

/** Non-woven bag paper: white fibres with the dark leaf grains showing through, denser towards the bottom. */
export const bagTexture = () =>
  canvasTexture("bag", 256, 256, (ctx) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 256, 256);
    const r = rng(11);
    for (let i = 0; i < 900; i++) {
      ctx.strokeStyle = `rgba(200,190,170,${0.12 + r() * 0.15})`;
      ctx.lineWidth = 0.6;
      const x = r() * 256;
      const y = r() * 256;
      const a = r() * Math.PI;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
      ctx.stroke();
    }
    for (let i = 0; i < 420; i++) {
      const y = 60 + Math.pow(r(), 0.6) * 190;
      ctx.fillStyle = `rgba(${60 + r() * 30},${28 + r() * 14},${10 + r() * 8},${0.25 + r() * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(r() * 256, 256 - y + 60, 1.5 + r() * 3, 1 + r() * 2, r() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  });

/** Paper tag: white card, an orange band with a leaf and TEA. */
export const tagTexture = () =>
  canvasTexture("tag", 176, 224, (ctx) => {
    ctx.fillStyle = "#fbf7ef";
    ctx.fillRect(0, 0, 176, 224);
    ctx.fillStyle = "#e0782c";
    ctx.fillRect(0, 40, 176, 110);
    ctx.fillStyle = "#fff6e6";
    ctx.beginPath();
    ctx.ellipse(88, 78, 16, 26, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "bold 40px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("TEA", 88, 140);
    ctx.fillStyle = "#c9b79a";
    ctx.beginPath();
    ctx.arc(88, 196, 6, 0, Math.PI * 2);
    ctx.fill();
  });
