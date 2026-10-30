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
  cache.set(key, tex);
  return tex;
};

/** Soft white falloff; tint it with the sprite colour. */
export const glowTexture = () =>
  canvasTexture("glow", 128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.22, "rgba(255,255,255,0.6)");
    g.addColorStop(0.55, "rgba(255,255,255,0.14)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });

/** Four-point star with a soft core, for sparkles. */
export const starTexture = () =>
  canvasTexture("star", 128, 128, (ctx) => {
    ctx.translate(64, 64);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    for (const r of [0, Math.PI / 2]) {
      ctx.save();
      ctx.rotate(r);
      ctx.beginPath();
      ctx.moveTo(-62, 0);
      ctx.quadraticCurveTo(0, -5, 62, 0);
      ctx.quadraticCurveTo(0, 5, -62, 0);
      ctx.fill();
      ctx.restore();
    }
  });

/** Screen-space backdrop: dark cocoa with a warm band where the table meets the wall. */
export const backgroundTexture = () =>
  canvasTexture("bg", 32, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#160a05");
    g.addColorStop(0.42, "#3d1e0e");
    g.addColorStop(0.62, "#2c150a");
    g.addColorStop(1, "#120803");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 512);
  });

/** Tea seen from above in a white cup: deep red-brown centre, amber edge, thin golden ring. */
export const teaSurfaceTexture = () =>
  canvasTexture("tea", 256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "#5a1c06");
    g.addColorStop(0.62, "#7e2e0c");
    g.addColorStop(0.86, "#b4581a");
    g.addColorStop(0.95, "#e8a33f");
    g.addColorStop(1, "#f7cf72");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  });

/** Dark walnut grain, tiled across the table. */
export const woodTexture = () =>
  canvasTexture("wood", 512, 512, (ctx) => {
    ctx.fillStyle = "#4a2614";
    ctx.fillRect(0, 0, 512, 512);
    const rnd = rng(7);
    for (let i = 0; i < 150; i++) {
      const y = rnd() * 512;
      const alpha = 0.04 + rnd() * 0.08;
      ctx.strokeStyle = rnd() > 0.5 ? `rgba(170,96,52,${alpha})` : `rgba(18,7,2,${alpha * 1.5})`;
      ctx.lineWidth = 1 + rnd() * 5;
      const wobble = 3 + rnd() * 6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 16) ctx.lineTo(x, y + Math.sin((x / 512) * Math.PI * 2 + i) * wobble);
      ctx.stroke();
    }
  });
