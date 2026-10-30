import * as THREE from "three";
import { rng } from "../core";
import { canvasTexture, JP } from "../../aimukae/three/textures";

export { canvasTexture, JP, woodGrainTexture } from "../../aimukae/three/textures";

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

const repeat = (t: THREE.CanvasTexture, x: number, y: number) => {
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(x, y);
  t.needsUpdate = true;
  return t;
};

/** Honey oak floor planks. */
export const floorTexture = () =>
  canvasTexture("k-floor", 512, 512, (ctx) => {
    const r = rng(7);
    for (let i = 0; i < 8; i++) {
      const tone = 150 + r() * 30;
      ctx.fillStyle = `rgb(${tone + 40},${tone - 2},${tone - 55})`;
      ctx.fillRect(0, i * 64, 512, 64);
      ctx.fillStyle = "rgba(70,40,15,0.5)";
      ctx.fillRect(0, i * 64, 512, 2);
      const cut = r() * 512;
      ctx.fillRect(cut, i * 64, 2, 64);
      for (let g = 0; g < 10; g++) {
        ctx.strokeStyle = `rgba(110,70,30,${0.06 + r() * 0.08})`;
        ctx.beginPath();
        const y = i * 64 + 6 + r() * 52;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(170, y + 4, 340, y - 4, 512, y);
        ctx.stroke();
      }
    }
  });

export const floorMap = () => repeat(floorTexture().clone(), 3, 3);

/** Cream subway tiles behind the counter. */
export const tileTexture = () =>
  canvasTexture("k-tile", 512, 256, (ctx) => {
    ctx.fillStyle = "#d9cdb8";
    ctx.fillRect(0, 0, 512, 256);
    for (let row = 0; row < 8; row++) {
      for (let col = -1; col < 9; col++) {
        const x = col * 64 + (row % 2) * 32;
        ctx.fillStyle = row % 3 === 0 && col % 4 === 1 ? "#e9f3f1" : "#f5efe3";
        roundRect(ctx, x + 2, row * 32 + 2, 60, 28, 4);
        ctx.fill();
      }
    }
  });

export const tileMap = () => repeat(tileTexture().clone(), 3, 2);

/** The window at night: deep blue sky, a few lit windows far away. */
export const nightTexture = () =>
  canvasTexture("k-night", 512, 384, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 384);
    g.addColorStop(0, "#0c1a3a");
    g.addColorStop(1, "#2a3f73");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 384);
    const r = rng(5);
    ctx.fillStyle = "#18264a";
    for (let i = 0; i < 6; i++) {
      const w = 60 + r() * 70;
      const h = 80 + r() * 160;
      const x = i * 90 - 20 + r() * 20;
      ctx.fillRect(x, 384 - h, w, h);
      for (let k = 0; k < 6; k++) {
        if (r() > 0.45) continue;
        ctx.fillStyle = "#ffd98a";
        ctx.fillRect(x + 8 + r() * (w - 24), 384 - h + 10 + r() * (h - 30), 10, 12);
        ctx.fillStyle = "#18264a";
      }
    }
    ctx.fillStyle = "#fff6d8";
    ctx.beginPath();
    ctx.arc(410, 70, 26, 0, Math.PI * 2);
    ctx.fill();
  });

// ---------- dish illustrations (menu cards and the phone list) ----------

export type Dish = "oyakodon" | "omurice" | "curry";

export const DISHES: Record<Dish, { name: string; color: string }> = {
  oyakodon: { name: "親子丼", color: "#f2a93b" },
  omurice: { name: "オムライス", color: "#ff7a3d" },
  curry: { name: "野菜カレー", color: "#c9822f" },
};

const plate = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d9e2ea";
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.82, r * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();
};

/** Simple flat illustration of a dish centred on (cx, cy), about 2r wide. */
export const drawDish = (ctx: CanvasRenderingContext2D, dish: Dish, cx: number, cy: number, r: number) => {
  if (dish === "oyakodon") {
    ctx.fillStyle = "#2f5d8a"; // bowl
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.9, r * 0.32, 0, 0, Math.PI);
    ctx.lineTo(cx - r * 0.55, cy + r * 0.55);
    ctx.lineTo(cx + r * 0.55, cy + r * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd25a";
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.88, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4c8";
    [[-0.4, -0.05], [0.1, 0.06], [0.45, -0.06]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.ellipse(cx + dx * r, cy + dy * r, r * 0.2, r * 0.1, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#c98a4a";
    [[-0.15, -0.1], [0.3, 0.12], [-0.5, 0.1]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.ellipse(cx + dx * r, cy + dy * r, r * 0.13, r * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(cx - r * 0.05, cy - r * 0.14, r * 0.18, r * 0.06);
  } else if (dish === "omurice") {
    plate(ctx, cx, cy + r * 0.12, r);
    ctx.fillStyle = "#ffcf3f";
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.66, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.2, cy - r * 0.12, r * 0.25, r * 0.07, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e0262b";
    ctx.lineWidth = r * 0.07;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.45, cy);
    for (let i = 0; i <= 8; i++) ctx.lineTo(cx - r * 0.45 + i * r * 0.11, cy + (i % 2 ? -1 : 1) * r * 0.08);
    ctx.stroke();
  } else {
    plate(ctx, cx, cy + r * 0.12, r);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.3, cy, r * 0.38, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b8742a";
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.22, cy + r * 0.04, r * 0.48, r * 0.27, 0, 0, Math.PI * 2);
    ctx.fill();
    [["#ff8c2a", 0.1, -0.02], ["#4caf50", 0.35, 0.08], ["#ff8c2a", 0.45, -0.06], ["#f2e3b0", 0.2, 0.12]].forEach(([c, dx, dy]) => {
      ctx.fillStyle = c as string;
      ctx.fillRect(cx + (dx as number) * r, cy + (dy as number) * r, r * 0.14, r * 0.1);
    });
  }
};

/** Front of a 3D menu card (512×640): dish picture and its name. `pick` marks the chosen one. */
export const menuCardTexture = (dish: Dish) =>
  canvasTexture(`k-menu-${dish}`, 512, 640, (ctx) => {
    const d = DISHES[dish];
    ctx.fillStyle = "#fffaf0";
    roundRect(ctx, 0, 0, 512, 640, 48);
    ctx.fill();
    ctx.fillStyle = "#fff0d6";
    roundRect(ctx, 32, 32, 448, 380, 36);
    ctx.fill();
    drawDish(ctx, dish, 256, 230, 180);
    ctx.textAlign = "center";
    ctx.fillStyle = "#3b2414";
    ctx.font = `900 ${d.name.length > 4 ? 72 : 88}px ${JP}`;
    ctx.fillText(d.name, 256, 530);
    ctx.fillStyle = d.color;
    roundRect(ctx, 156, 566, 200, 14, 7);
    ctx.fill();
  });

// ---------- phone screens (512×1024) ----------

export type ScreenKind = "home" | "camera" | "chat" | "prompt" | "menus" | "menusSafe";

const bg = (ctx: CanvasRenderingContext2D, top: string, bottom: string) => {
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 1024);
};

/** The open fridge as the camera sees it (matches the 3D fridge contents, simplified). */
const drawFridgePhoto = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.clip();
  ctx.fillStyle = "#eef6f8";
  ctx.fillRect(x, y, w, h);
  const shelf = (yy: number) => {
    ctx.fillStyle = "rgba(160,200,215,0.8)";
    ctx.fillRect(x, y + yy * h, w, h * 0.018);
  };
  [0.34, 0.66].forEach(shelf);
  const u = w / 10;
  // top shelf: milk, eggs
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + u * 0.8, y + h * 0.07, u * 1.6, h * 0.26);
  ctx.fillStyle = "#3d8bd9";
  ctx.fillRect(x + u * 0.8, y + h * 0.18, u * 1.6, h * 0.05);
  ctx.fillStyle = "#e7d3b0";
  ctx.fillRect(x + u * 3.4, y + h * 0.24, u * 4.4, h * 0.09);
  ctx.fillStyle = "#fff6e6";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(x + u * (3.9 + i * 0.85), y + h * 0.235, u * 0.35, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // middle shelf: chicken pack, tomato, pepper
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + u * 0.6, y + h * 0.53, u * 3.4, h * 0.12);
  ctx.fillStyle = "#f2a3a0";
  ctx.fillRect(x + u * 0.9, y + h * 0.555, u * 2.8, h * 0.07);
  ctx.fillStyle = "#e5382b";
  ctx.beginPath();
  ctx.arc(x + u * 5.2, y + h * 0.6, u * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a9a3a";
  ctx.beginPath();
  ctx.ellipse(x + u * 7.6, y + h * 0.6, u * 0.8, u * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  // bottom: carrots, onion
  ctx.fillStyle = "#ff8a1f";
  [0, 1].forEach((i) => {
    ctx.beginPath();
    ctx.moveTo(x + u * (1 + i * 1.2), y + h * 0.78);
    ctx.lineTo(x + u * (4 + i * 1.2), y + h * (0.86 + i * 0.03));
    ctx.lineTo(x + u * (1 + i * 1.2), y + h * (0.86 + i * 0.03));
    ctx.fill();
  });
  ctx.fillStyle = "#d9a15a";
  ctx.beginPath();
  ctx.arc(x + u * 7.2, y + h * 0.85, u * 0.95, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const statusBar = (ctx: CanvasRenderingContext2D, ink: string) => {
  ctx.fillStyle = ink;
  ctx.font = `700 28px ${JP}`;
  ctx.textAlign = "left";
  ctx.fillText("19:02", 40, 52);
  ctx.textAlign = "center";
};

const chatHeader = (ctx: CanvasRenderingContext2D) => {
  bg(ctx, "#f3fbfd", "#e3f3f7");
  statusBar(ctx, "#174a57");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 70, 512, 96);
  ctx.fillStyle = "#80f2ff";
  ctx.beginPath();
  ctx.arc(70, 118, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0b3b47";
  ctx.font = `900 30px ${JP}`;
  ctx.fillText("AI", 70, 129);
  ctx.textAlign = "left";
  ctx.font = `900 38px ${JP}`;
  ctx.fillText("AIアシスタント", 118, 132);
  ctx.textAlign = "center";
};

const userBubble = (ctx: CanvasRenderingContext2D, y: number, lines: string[], size = 34) => {
  const h = lines.length * (size + 12) + 34;
  ctx.fillStyle = "#ff8a3d";
  roundRect(ctx, 96, y, 384, h, 30);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${size}px ${JP}`;
  ctx.textAlign = "left";
  lines.forEach((l, i) => ctx.fillText(l, 124, y + 26 + size + i * (size + 12) - 6));
  ctx.textAlign = "center";
  return y + h;
};

const photoBubble = (ctx: CanvasRenderingContext2D, y: number) => {
  ctx.fillStyle = "#ff8a3d";
  roundRect(ctx, 236, y, 244, 300, 26);
  ctx.fill();
  drawFridgePhoto(ctx, 248, y + 12, 220, 276);
  return y + 300;
};

const menuRows = (ctx: CanvasRenderingContext2D, y: number, safe: boolean) => {
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 28, y, 400, 470, 30);
  ctx.fill();
  ctx.fillStyle = "#0b3b47";
  ctx.font = `900 32px ${JP}`;
  ctx.textAlign = "left";
  ctx.fillText("今夜のおすすめ 3品", 56, y + 56);
  (["oyakodon", "omurice", "curry"] as Dish[]).forEach((d, i) => {
    const yy = y + 86 + i * 124;
    ctx.fillStyle = "#fff4e0";
    roundRect(ctx, 48, yy, 360, 108, 20);
    ctx.fill();
    drawDish(ctx, d, 112, yy + 50, 46);
    ctx.fillStyle = "#3b2414";
    ctx.font = `900 36px ${JP}`;
    ctx.fillText(DISHES[d].name, 178, yy + 66);
  });
  if (safe) {
    ctx.fillStyle = "#16b8a4";
    ctx.font = `900 26px ${JP}`;
    ctx.fillText("✓ ピーマンなし", 56, y + 452);
  }
  ctx.textAlign = "center";
};

export const screenTexture = (kind: ScreenKind) =>
  canvasTexture(`k-screen-${kind}`, 512, 1024, (ctx) => {
    ctx.textAlign = "center";
    if (kind === "home") {
      bg(ctx, "#2f6f8a", "#173b55");
      statusBar(ctx, "#ffffff");
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 110px ${JP}`;
      ctx.fillText("19:02", 256, 250);
      const icons = ["#80f2ff", "#ffcf3f", "#ff8a3d", "#7fd6a0", "#c7a2ff", "#ff7ab6", "#9fc2ff", "#ffe6a0"];
      icons.forEach((c, i) => {
        ctx.fillStyle = c;
        roundRect(ctx, 66 + (i % 4) * 100, 600 + Math.floor(i / 4) * 120, 80, 80, 22);
        ctx.fill();
      });
      ctx.fillStyle = "#0b3b47";
      ctx.font = `900 34px ${JP}`;
      ctx.fillText("AI", 106, 652);
    } else if (kind === "camera") {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, 512, 1024);
      drawFridgePhoto(ctx, 20, 140, 472, 660);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      [177, 335].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, 140);
        ctx.lineTo(x, 800);
        ctx.stroke();
      });
      [360, 580].forEach((yy) => {
        ctx.beginPath();
        ctx.moveTo(20, yy);
        ctx.lineTo(492, yy);
        ctx.stroke();
      });
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(256, 905, 62, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(256, 905, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffcf3f";
      ctx.font = `900 30px ${JP}`;
      ctx.fillText("写真", 256, 110);
    } else if (kind === "chat") {
      chatHeader(ctx);
      photoBubble(ctx, 210);
    } else if (kind === "prompt") {
      chatHeader(ctx);
      const y = photoBubble(ctx, 190);
      userBubble(ctx, y + 24, ["この食材で作れる", "晩ごはんを", "3つ考えて"], 40);
    } else {
      chatHeader(ctx);
      userBubble(ctx, 190, ["晩ごはんを3つ考えて"], 30);
      menuRows(ctx, 300, kind === "menusSafe");
    }
  });
