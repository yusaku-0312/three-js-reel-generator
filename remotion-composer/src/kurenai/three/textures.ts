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

const SERIF = `"Didot", "Bodoni 72", "Times New Roman", serif`;
const MINCHO = `"Hiragino Mincho ProN", "Yu Mincho", serif`;

/** Sunset window: four panes of warm sky behind a dark cross frame (drawn white-ish; the material sets brightness). */
export const windowTexture = () =>
  canvasTexture("window", 512, 640, (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 512, 640);
    const sky = ctx.createLinearGradient(0, 0, 0, 640);
    sky.addColorStop(0, "#fff4dc");
    sky.addColorStop(0.55, "#ffd08a");
    sky.addColorStop(1, "#ff9c4a");
    const panes: Array<[number, number, number, number]> = [
      [28, 28, 214, 282], [270, 28, 214, 282], [28, 330, 214, 282], [270, 330, 214, 282],
    ];
    // soft-edged panes: light through glass lands on the counter blurred, not as a cut-out
    ctx.filter = "blur(22px)";
    ctx.fillStyle = sky;
    for (const [x, y, w, h] of panes) ctx.fillRect(x + 14, y + 14, w - 28, h - 28);
    ctx.filter = "none";
    // a low sun disc in the lower right pane
    const sun = ctx.createRadialGradient(390, 470, 4, 390, 470, 120);
    sun.addColorStop(0, "rgba(255,255,255,1)");
    sun.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(270, 330, 214, 282);
  });

/** Cream paper band for the tea tin: BLACK TEA in a framed cartouche. */
export const tinLabelTexture = () =>
  canvasTexture("tinlabel", 1024, 320, (ctx) => {
    ctx.fillStyle = "#efe2c4";
    ctx.fillRect(0, 0, 1024, 320);
    ctx.strokeStyle = "#8a6a2a";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, 996, 292);
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, 972, 268);
    ctx.fillStyle = "#1f1712";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // the text faces the camera when the tin's seam is at the back (u 0.25..0.5 is the front half)
    ctx.font = `bold 92px ${SERIF}`;
    ctx.fillText("BLACK TEA", 384, 150);
    ctx.font = `36px ${SERIF}`;
    ctx.fillStyle = "#8a6a2a";
    ctx.fillText("— FINE LEAF —", 384, 235);
    ctx.fillText("✦", 384, 70);
  });

/** Compressed pu-erh leaves: dark umber with coppery streaks pressed in rings. */
export const puerhTexture = () =>
  canvasTexture("puerh", 512, 512, (ctx) => {
    ctx.fillStyle = "#3a2214";
    ctx.fillRect(0, 0, 512, 512);
    const r = rng(17);
    for (let i = 0; i < 2600; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 250;
      const x = 256 + Math.cos(a) * d;
      const y = 256 + Math.sin(a) * d;
      const len = 6 + r() * 16;
      const ang = a + Math.PI / 2 + (r() - 0.5) * 1.2;
      ctx.strokeStyle = ["#5e3a1e", "#2a170c", "#7a4a24", "#4a2c16", "#8a5a2c"][Math.floor(r() * 5)];
      ctx.lineWidth = 1.5 + r() * 2.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
  });

/** Cotton wrapping paper with a red seal reading 普洱茶. */
export const wrapperTexture = () =>
  canvasTexture("wrapper", 512, 512, (ctx) => {
    ctx.fillStyle = "#f2ecdf";
    ctx.fillRect(0, 0, 512, 512);
    const r = rng(23);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(150,130,100,${0.05 + r() * 0.08})`;
      ctx.fillRect(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 3);
    }
    ctx.strokeStyle = "#b8281e";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(256, 256, 214, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 196, 0, Math.PI * 2);
    ctx.stroke();
  });

/** The seal text on the wrapper rim (drawn separately so it sits outside the cake). */
export const sealTexture = () =>
  canvasTexture("seal", 256, 256, (ctx) => {
    ctx.fillStyle = "#b8281e";
    ctx.fillRect(18, 18, 220, 220);
    ctx.fillStyle = "#f6eee0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold 78px ${MINCHO}`;
    ctx.fillText("普洱", 128, 88);
    ctx.fillText("茶", 128, 172);
  });
