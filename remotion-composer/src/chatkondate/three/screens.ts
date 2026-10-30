import { canvasTexture, DISHES, drawDish, JP, screenTexture as kondateScreen } from "../../kondate/three/textures";
import type { Dish as KondateDish, ScreenKind as KondateScreen } from "../../kondate/three/textures";

// Chat screens for "send the fridge photo to ChatGPT" and the extra dishes (生姜焼き, 焼き魚, ？) the parent
// proposes one by one. Phone screens are 512×1024, cards 512×640.

export type Dish = KondateDish | "shogayaki" | "sakana" | "mystery";
export type ChatScreen = "attach" | "photo" | "prompt" | "menus" | "conds";
export type Screen = KondateScreen | ChatScreen;

export const MENU: KondateDish[] = ["oyakodon", "omurice", "curry"];
const MINUTES: Record<KondateDish, string> = { oyakodon: "15分", omurice: "20分", curry: "20分" };
const NAMES: Record<Dish, string> = {
  ...Object.fromEntries(Object.entries(DISHES).map(([k, v]) => [k, v.name])),
  shogayaki: "生姜焼き",
  sakana: "焼き魚",
  mystery: "次は…？",
} as Record<Dish, string>;
const ACCENT: Record<Dish, string> = {
  ...Object.fromEntries(Object.entries(DISHES).map(([k, v]) => [k, v.color])),
  shogayaki: "#b5652a",
  sakana: "#5a8fc2",
  mystery: "#9aa0aa",
} as Record<Dish, string>;

const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
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

/** Flat dish picture about 2r wide; the kondate dishes plus the three new ones. */
const drawAnyDish = (ctx: CanvasRenderingContext2D, dish: Dish, cx: number, cy: number, r: number) => {
  if (dish === "shogayaki") {
    plate(ctx, cx, cy + r * 0.12, r);
    ctx.fillStyle = "#cfe8a0"; // shredded cabbage
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.38, cy - r * 0.02, r * 0.3, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    [[-0.38, 0.02, -0.2], [-0.1, -0.04, 0.15], [0.12, 0.1, -0.1]].forEach(([dx, dy, a]) => {
      ctx.fillStyle = "#a35a22";
      ctx.beginPath();
      ctx.ellipse(cx + dx * r, cy + dy * r, r * 0.32, r * 0.15, a, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,220,170,0.45)";
      ctx.beginPath();
      ctx.ellipse(cx + dx * r - r * 0.06, cy + dy * r - r * 0.04, r * 0.14, r * 0.04, a, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (dish === "sakana") {
    plate(ctx, cx, cy + r * 0.12, r);
    ctx.fillStyle = "#8c9aa8";
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.05, cy, r * 0.55, r * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.45, cy);
    ctx.lineTo(cx + r * 0.75, cy - r * 0.16);
    ctx.lineTo(cx + r * 0.75, cy + r * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5b4a3a";
    ctx.lineWidth = r * 0.04;
    [-0.3, -0.1, 0.1].forEach((dx) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * r, cy - r * 0.12);
      ctx.lineTo(cx + dx * r + r * 0.08, cy + r * 0.1);
      ctx.stroke();
    });
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(cx - r * 0.55, cy + r * 0.22, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (dish === "mystery") {
    plate(ctx, cx, cy + r * 0.12, r);
    ctx.fillStyle = "#9aa0aa";
    ctx.font = `900 ${r * 0.9}px ${JP}`;
    ctx.textAlign = "center";
    ctx.fillText("？", cx, cy + r * 0.3);
  } else {
    drawDish(ctx, dish, cx, cy, r);
  }
};

/** Front of a 3D dish card: picture and name. */
export const dishCardTexture = (dish: Dish) =>
  canvasTexture(`ck-card-${dish}`, 512, 640, (ctx) => {
    ctx.fillStyle = "#fffaf0";
    rr(ctx, 0, 0, 512, 640, 48);
    ctx.fill();
    ctx.fillStyle = dish === "mystery" ? "#eef0f3" : "#fff0d6";
    rr(ctx, 32, 32, 448, 380, 36);
    ctx.fill();
    drawAnyDish(ctx, dish, 256, 230, 180);
    ctx.textAlign = "center";
    ctx.fillStyle = "#3b2414";
    const name = NAMES[dish];
    ctx.font = `900 ${name.length > 4 ? 72 : 88}px ${JP}`;
    ctx.fillText(name, 256, 530);
    ctx.fillStyle = ACCENT[dish];
    rr(ctx, 156, 566, 200, 14, 7);
    ctx.fill();
  });

// ---------- the fridge photo (with a lidded container and a wrapped pack that a photo can't explain) ----------

export const drawFridgePhoto = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.save();
  rr(ctx, x, y, w, h, 18);
  ctx.clip();
  ctx.fillStyle = "#eef6f8";
  ctx.fillRect(x, y, w, h);
  [0.34, 0.66].forEach((s) => {
    ctx.fillStyle = "rgba(160,200,215,0.8)";
    ctx.fillRect(x, y + s * h, w, h * 0.018);
  });
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
  // middle shelf: an opaque lidded container (left), tomato, pepper
  ctx.fillStyle = "#f4f1ea";
  rr(ctx, x + u * 0.6, y + h * 0.5, u * 3.4, h * 0.15, 10);
  ctx.fill();
  ctx.fillStyle = "#2f8f9d";
  rr(ctx, x + u * 0.5, y + h * 0.48, u * 3.6, h * 0.04, 8);
  ctx.fill();
  ctx.fillStyle = "#e5382b";
  ctx.beginPath();
  ctx.arc(x + u * 5.4, y + h * 0.6, u * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a9a3a";
  ctx.beginPath();
  ctx.ellipse(x + u * 7.8, y + h * 0.6, u * 0.8, u * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  // bottom: carrots and a newspaper-wrapped pack (right)
  ctx.fillStyle = "#ff8a1f";
  [0, 1].forEach((i) => {
    ctx.beginPath();
    ctx.moveTo(x + u * (0.8 + i * 1.1), y + h * 0.76);
    ctx.lineTo(x + u * (3.6 + i * 1.1), y + h * (0.84 + i * 0.03));
    ctx.lineTo(x + u * (0.8 + i * 1.1), y + h * (0.84 + i * 0.03));
    ctx.fill();
  });
  ctx.fillStyle = "#d9d2c0";
  rr(ctx, x + u * 5.6, y + h * 0.74, u * 3.6, h * 0.17, 14);
  ctx.fill();
  ctx.strokeStyle = "#b8ae98";
  ctx.lineWidth = u * 0.12;
  [0.78, 0.82, 0.86].forEach((s) => {
    ctx.beginPath();
    ctx.moveTo(x + u * 6.0, y + h * s);
    ctx.lineTo(x + u * 8.8, y + h * s);
    ctx.stroke();
  });
  ctx.restore();
};

/** Where the two puzzling items sit on the photo, as fractions of its width/height (for the "?" pins). */
export const PHOTO_PINS = { box: [0.23, 0.57], pack: [0.74, 0.825] } as const;

export const photoTexture = () => canvasTexture("ck-photo", 512, 640, (ctx) => drawFridgePhoto(ctx, 0, 0, 512, 640));

// ---------- chat screens ----------

const statusBar = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "#1d1d1f";
  ctx.font = `700 28px ${JP}`;
  ctx.textAlign = "left";
  ctx.fillText("19:02", 40, 52);
};

const chatFrame = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "#f7f7f8";
  ctx.fillRect(0, 0, 512, 1024);
  statusBar(ctx);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 70, 512, 92);
  ctx.fillStyle = "#e3e3e6";
  ctx.fillRect(0, 160, 512, 3);
  ctx.fillStyle = "#1d1d1f";
  ctx.font = `900 40px ${JP}`;
  ctx.textAlign = "center";
  ctx.fillText("ChatGPT", 256, 130);
  // input bar
  ctx.fillStyle = "#ffffff";
  rr(ctx, 24, 920, 464, 76, 38);
  ctx.fill();
  ctx.strokeStyle = "#d4d4d8";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#6b6b70";
  ctx.font = `700 48px ${JP}`;
  ctx.fillText("＋", 70, 975);
};

const userBubble = (ctx: CanvasRenderingContext2D, y: number, lines: string[], size = 30) => {
  const h = lines.length * (size + 12) + 30;
  ctx.fillStyle = "#ff8a3d";
  rr(ctx, 80, y, 408, h, 28);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${size}px ${JP}`;
  ctx.textAlign = "left";
  lines.forEach((l, i) => ctx.fillText(l, 104, y + 20 + size + i * (size + 12) - 6));
  return y + h;
};

const photoBubble = (ctx: CanvasRenderingContext2D, y: number, w = 220) => {
  const h = w * 1.25;
  ctx.fillStyle = "#ff8a3d";
  rr(ctx, 488 - w - 24, y, w + 24, h + 24, 24);
  ctx.fill();
  drawFridgePhoto(ctx, 488 - w - 12, y + 12, w, h);
  return y + h + 24;
};

const aiMenus = (ctx: CanvasRenderingContext2D, y: number, note?: string) => {
  ctx.textAlign = "left";
  ctx.fillStyle = "#1d1d1f";
  ctx.font = `900 30px ${JP}`;
  ctx.fillText("20分でできる夕飯 3つ", 32, y + 34);
  MENU.forEach((d, i) => {
    const yy = y + 60 + i * 140;
    ctx.fillStyle = "#ffffff";
    rr(ctx, 24, yy, 464, 124, 22);
    ctx.fill();
    drawDish(ctx, d, 92, yy + 58, 48);
    ctx.fillStyle = "#3b2414";
    ctx.font = `900 34px ${JP}`;
    ctx.fillText(DISHES[d].name, 158, yy + 52);
    ctx.fillStyle = "#6b6b70";
    ctx.font = `700 24px ${JP}`;
    ctx.fillText(`${MINUTES[d]}・材料と作り方 ▼`, 158, yy + 94);
  });
  if (note) {
    ctx.fillStyle = "#16b8a4";
    ctx.font = `900 26px ${JP}`;
    ctx.fillText(note, 32, y + 500);
  }
};

const PROMPT = ["この写真の食材で", "作れる夕飯を3つ考えて。", "20分以内で、", "材料と作り方も教えて"];

const chatTexture = (kind: ChatScreen) =>
  canvasTexture(`ck-screen-${kind}`, 512, 1024, (ctx) => {
    chatFrame(ctx);
    if (kind === "attach") {
      ctx.fillStyle = "#ffffff";
      rr(ctx, 24, 700, 464, 296, 38);
      ctx.fill();
      ctx.strokeStyle = "#d4d4d8";
      ctx.lineWidth = 3;
      ctx.stroke();
      drawFridgePhoto(ctx, 48, 722, 150, 188);
      ctx.fillStyle = "#6b6b70";
      ctx.font = `700 28px ${JP}`;
      ctx.textAlign = "left";
      ctx.fillText("写真を添付", 220, 820);
    } else if (kind === "photo") {
      photoBubble(ctx, 200, 260);
    } else if (kind === "prompt") {
      const y = photoBubble(ctx, 190, 170);
      userBubble(ctx, y + 22, PROMPT, 29);
    } else if (kind === "menus") {
      userBubble(ctx, 186, ["夕飯を3つ考えて。20分以内で"], 24);
      aiMenus(ctx, 270);
    } else {
      userBubble(ctx, 186, ["4人分・ピーマン苦手", "辛くしない・洗い物少なめ"], 26);
      aiMenus(ctx, 300, "✓ 条件に合わせました");
    }
  });

export const screenTex = (kind: Screen) =>
  ["attach", "photo", "prompt", "menus", "conds"].includes(kind) ? chatTexture(kind as ChatScreen) : kondateScreen(kind as KondateScreen);
