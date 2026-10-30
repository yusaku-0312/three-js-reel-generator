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

/** Butter cookie face: pale gold centre, baked rim, speckles, sugar grains and a ring of docking holes. */
export const cookieTexture = () =>
  canvasTexture("cookie", 512, 512, (ctx) => {
    const g = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
    g.addColorStop(0, "#e9bb72");
    g.addColorStop(0.62, "#dca55c");
    g.addColorStop(0.86, "#c07c38");
    g.addColorStop(1, "#8f5221");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const r = rng(11);
    for (let i = 0; i < 1400; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 250;
      const x = 256 + Math.cos(a) * d;
      const y = 256 + Math.sin(a) * d;
      const dark = r() < 0.55;
      ctx.fillStyle = dark ? `rgba(120,64,22,${0.12 + r() * 0.2})` : `rgba(255,236,190,${0.18 + r() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + r() * (dark ? 3 : 2), 0, Math.PI * 2);
      ctx.fill();
    }
    const hole = (x: number, y: number) => {
      ctx.fillStyle = "rgba(110,56,18,0.75)";
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,230,180,0.35)";
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    };
    hole(256, 256);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      hole(256 + Math.cos(a) * 120, 256 + Math.sin(a) * 120);
    }
  });

/** Simplified Union flag for the toothpick pick. */
export const unionFlagTexture = () =>
  canvasTexture("union", 240, 160, (ctx) => {
    const W = 240;
    const H = 160;
    ctx.fillStyle = "#012169";
    ctx.fillRect(0, 0, W, H);
    const diag = (width: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(W, H);
      ctx.moveTo(W, 0);
      ctx.lineTo(0, H);
      ctx.stroke();
    };
    diag(32, "#ffffff");
    diag(11, "#c8102e");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(W / 2 - 26, 0, 52, H);
    ctx.fillRect(0, H / 2 - 26, W, 52);
    ctx.fillStyle = "#c8102e";
    ctx.fillRect(W / 2 - 16, 0, 32, H);
    ctx.fillRect(0, H / 2 - 16, W, 32);
  });

/** Soft round blob for the butter's top highlight-free shading (kept simple: one pale gradient). */
export const butterTexture = () =>
  canvasTexture("butter", 128, 128, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 128, 128);
    g.addColorStop(0, "#fbe9a6");
    g.addColorStop(1, "#f0d27a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
