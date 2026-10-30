import { rng } from "../core";
import { canvasTexture, JP } from "../../aimukae/three/textures";

export { canvasTexture, JP } from "../../aimukae/three/textures";

/**
 * Posted photos, phone screens and the picture map. The child is always the faceless figurine of src/aimukae
 * (yellow cap, white shirt, red school bag). The fake kidnapping image is never drawn: a grey mosaic with a
 * warning mark and 「偽」.
 */
const RED = "#e8303f";
const TEAL = "#16b8a4";
const INK = "#1d2433";

const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/** The figurine child standing at (cx, foot) with height `s`: cap, wooden head, white shirt, red bag, navy legs. */
const drawChild = (ctx: CanvasRenderingContext2D, cx: number, foot: number, s: number, peace = false) => {
  ctx.fillStyle = "#2f3b5c";
  ctx.fillRect(cx - s * 0.1, foot - s * 0.32, s * 0.08, s * 0.32);
  ctx.fillRect(cx + s * 0.02, foot - s * 0.32, s * 0.08, s * 0.32);
  ctx.fillStyle = "#d8262f";
  rr(ctx, cx - s * 0.2, foot - s * 0.66, s * 0.4, s * 0.3, s * 0.06);
  ctx.fill();
  ctx.fillStyle = "#f4f1ea";
  rr(ctx, cx - s * 0.15, foot - s * 0.68, s * 0.3, s * 0.38, s * 0.1);
  ctx.fill();
  ctx.fillStyle = "#e9cfa8";
  ctx.beginPath();
  ctx.arc(cx, foot - s * 0.8, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd23a";
  ctx.beginPath();
  ctx.arc(cx, foot - s * 0.84, s * 0.15, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - s * 0.04, foot - s * 0.85, s * 0.24, s * 0.04);
  if (!peace) return;
  ctx.strokeStyle = "#f4f1ea";
  ctx.lineWidth = s * 0.07;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.13, foot - s * 0.58);
  ctx.lineTo(cx + s * 0.27, foot - s * 0.78);
  ctx.stroke();
};

const sky = (ctx: CanvasRenderingContext2D, w: number, h: number, horizon: number, top = "#8fd3ff", ground = "#8fd36a") => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(horizon, "#e4f6ff");
  g.addColorStop(horizon, ground);
  g.addColorStop(1, ground);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

const tree = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color = "#3f9a4a") => {
  ctx.fillStyle = "#7a5a3a";
  ctx.fillRect(x - r * 0.12, y, r * 0.24, r * 0.9);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

/** A plate or sign with text (school name plate, shop sign). */
const plate = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string, bg: string, ink: string, size: number) => {
  ctx.fillStyle = bg;
  rr(ctx, x, y, w, h, h * 0.18);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.font = `900 ${size}px ${JP}`;
  ctx.fillText(text, x + w / 2, y + h * 0.5 + size * 0.36);
};

export type PhotoKind = "park" | "birthday" | "ceremony" | "school" | "home" | "shop" | "postText" | "fake";

/** Where the give-away detail sits on each photo (0..1 of the card), for the red highlight circle. */
export const CLUE: Partial<Record<PhotoKind, [number, number, number]>> = {
  school: [0.5, 0.2, 0.2],
  home: [0.5, 0.36, 0.3],
  shop: [0.5, 0.17, 0.24],
  postText: [0.5, 0.52, 0.32],
};
/** Where the child's face sits on the park photo (0..1), for the face-scan frame. */
export const FACE_UV: [number, number] = [0.5, 0.42];

const drawPhoto = (ctx: CanvasRenderingContext2D, kind: PhotoKind, w: number, h: number) => {
  ctx.textAlign = "center";
  if (kind === "park") {
    sky(ctx, w, h, 0.62);
    tree(ctx, w * 0.14, h * 0.5, w * 0.15);
    tree(ctx, w * 0.86, h * 0.48, w * 0.17, "#4aa84f");
    ctx.fillStyle = "#f0d48a";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.95, w * 0.55, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    drawChild(ctx, w * 0.5, h * 0.93, h * 0.62, true);
    return;
  }
  if (kind === "birthday") {
    ctx.fillStyle = "#ffe6c8";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffb3c8";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(w * (0.08 + i * 0.17), h * 0.08, w * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
    drawChild(ctx, w * 0.5, h * 0.78, h * 0.5);
    ctx.fillStyle = "#c58a5a";
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    ctx.fillStyle = "#fff6ee";
    rr(ctx, w * 0.3, h * 0.62, w * 0.4, h * 0.16, 12);
    ctx.fill();
    ctx.fillStyle = "#ff7ab6";
    ctx.fillRect(w * 0.3, h * 0.68, w * 0.4, h * 0.03);
    ctx.fillStyle = "#ffd23a";
    [0.4, 0.5, 0.6].forEach((u) => ctx.fillRect(w * u - 4, h * 0.55, 8, h * 0.07));
    return;
  }
  if (kind === "ceremony") {
    sky(ctx, w, h, 0.66, "#bfe6ff", "#d8cfc0");
    ctx.fillStyle = "#ffc6d9";
    for (let i = 0; i < 18; i++) {
      const r = rng(i + 4);
      ctx.beginPath();
      ctx.arc(w * r(), h * r() * 0.5, w * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    drawChild(ctx, w * 0.5, h * 0.94, h * 0.6);
    plate(ctx, w * 0.62, h * 0.58, w * 0.32, h * 0.26, "入学式", "#ffffff", INK, w * 0.08);
    return;
  }
  if (kind === "school") {
    sky(ctx, w, h, 0.6, "#a8dcff", "#cfc6b4");
    ctx.fillStyle = "#e9e2d2";
    ctx.fillRect(0, h * 0.28, w, h * 0.32);
    ctx.fillStyle = "#9db7d6";
    for (let i = 0; i < 5; i++) ctx.fillRect(w * (0.06 + i * 0.19), h * 0.34, w * 0.12, h * 0.08);
    ctx.fillStyle = "#8a8f99";
    ctx.fillRect(w * 0.12, h * 0.36, w * 0.08, h * 0.32);
    ctx.fillRect(w * 0.8, h * 0.36, w * 0.08, h * 0.32);
    plate(ctx, w * 0.24, h * 0.13, w * 0.52, h * 0.13, "さくら小学校", "#ffffff", INK, w * 0.075);
    drawChild(ctx, w * 0.5, h * 0.95, h * 0.58, true);
    return;
  }
  if (kind === "home") {
    sky(ctx, w, h, 0.66, "#9fd8ff", "#b9b2a6");
    ctx.fillStyle = "#f1c9a0";
    ctx.fillRect(w * 0.14, h * 0.28, w * 0.72, h * 0.4);
    ctx.fillStyle = "#3d6aa8";
    ctx.beginPath();
    ctx.moveTo(w * 0.06, h * 0.3);
    ctx.lineTo(w * 0.5, h * 0.08);
    ctx.lineTo(w * 0.94, h * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#7a4a2a";
    ctx.fillRect(w * 0.6, h * 0.44, w * 0.14, h * 0.24);
    ctx.fillStyle = "#cfe8ff";
    ctx.fillRect(w * 0.22, h * 0.36, w * 0.2, h * 0.12);
    ctx.fillStyle = "#2e9a5a";
    ctx.fillRect(w * 0.76, h * 0.52, w * 0.08, h * 0.16);
    drawChild(ctx, w * 0.36, h * 0.95, h * 0.5);
    return;
  }
  if (kind === "shop") {
    sky(ctx, w, h, 0.62, "#a8dcff", "#c8c0b4");
    ctx.fillStyle = "#f4f4f0";
    ctx.fillRect(w * 0.04, h * 0.26, w * 0.92, h * 0.36);
    ctx.fillStyle = "#bfe4ff";
    ctx.fillRect(w * 0.1, h * 0.4, w * 0.8, h * 0.18);
    plate(ctx, w * 0.14, h * 0.1, w * 0.72, h * 0.15, "まるやスーパー", "#e8303f", "#ffffff", w * 0.08);
    drawChild(ctx, w * 0.5, h * 0.95, h * 0.56, true);
    return;
  }
  if (kind === "postText") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#e9edf5";
    ctx.beginPath();
    ctx.arc(w * 0.16, h * 0.12, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.font = `800 ${w * 0.06}px ${JP}`;
    ctx.fillText("mama_diary", w * 0.28, h * 0.14);
    ctx.font = `900 ${w * 0.085}px ${JP}`;
    ctx.fillText("今日は", w * 0.1, h * 0.36);
    ctx.fillStyle = RED;
    ctx.fillText("ひかり公園", w * 0.1, h * 0.52);
    ctx.fillStyle = INK;
    ctx.fillText("でピクニック♪", w * 0.1, h * 0.68);
    ctx.fillStyle = "#6a7488";
    ctx.font = `800 ${w * 0.06}px ${JP}`;
    ctx.fillText("場所：〇〇市 ひかり公園", w * 0.1, h * 0.86);
    return;
  }
  // fake: never shown
  const r = rng(23);
  const cells = 9;
  const cw = w / cells;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < Math.ceil(h / cw); j++) {
      const v = 60 + r() * 50;
      ctx.fillStyle = `rgb(${v},${v - 8},${v + 14})`;
      ctx.fillRect(i * cw, j * cw, cw + 1, cw + 1);
    }
  }
  ctx.fillStyle = "rgba(20,10,20,0.35)";
  ctx.fillRect(0, 0, w, h);
  const s = w * 0.2;
  const cy = h * 0.4;
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.moveTo(w / 2, cy - s);
  ctx.lineTo(w / 2 + s * 1.1, cy + s * 0.8);
  ctx.lineTo(w / 2 - s * 1.1, cy + s * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `900 ${s * 1.1}px ${JP}`;
  ctx.fillText("!", w / 2, cy + s * 0.62);
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${w * 0.16}px ${JP}`;
  ctx.fillText("偽", w / 2, h * 0.82);
};

export const photoTexture = (kind: PhotoKind) => canvasTexture(`s-photo-${kind}`, 400, 500, (ctx) => drawPhoto(ctx, kind, 400, 500));

export type ScreenKind =
  | "profile"
  | "post"
  | "fakeMsg"
  | "fakeCall"
  | "compose"
  | "privacy"
  | "review0"
  | "review1"
  | "review2"
  | "review3";

const screenBg = (ctx: CanvasRenderingContext2D, top: string, bottom: string) => {
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 1024);
};

const header = (ctx: CanvasRenderingContext2D, title: string, color = INK) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 512, 120);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.font = `900 44px ${JP}`;
  ctx.fillText(title, 256, 82);
  ctx.fillStyle = "#e3e7ef";
  ctx.fillRect(0, 118, 512, 3);
};

const photoAt = (ctx: CanvasRenderingContext2D, kind: PhotoKind, x: number, y: number, w: number, h: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  ctx.scale(w / 400, h / 500);
  drawPhoto(ctx, kind, 400, 500);
  ctx.restore();
};

const globe = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.16;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.45, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - r, y);
  ctx.lineTo(x + r, y);
  ctx.stroke();
};

const heart = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s, y - s * 0.3, x - s * 0.4, y - s * 0.9, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.4, y - s * 0.9, x + s, y - s * 0.3, x, y + s * 0.35);
  ctx.fill();
};

const REVIEW_ROWS: PhotoKind[] = ["park", "school", "home"];

const drawScreen = (ctx: CanvasRenderingContext2D, kind: ScreenKind) => {
  ctx.textAlign = "center";
  if (kind === "profile") {
    screenBg(ctx, "#ffffff", "#f3f5fa");
    header(ctx, "mama_diary");
    ctx.fillStyle = "#e9edf5";
    ctx.beginPath();
    ctx.arc(110, 210, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = `900 40px ${JP}`;
    ctx.textAlign = "left";
    ctx.fillText("子どもの記録", 200, 200);
    ctx.fillStyle = "#6a7488";
    ctx.font = `700 30px ${JP}`;
    ctx.fillText("投稿 128", 200, 246);
    const grid: PhotoKind[] = ["park", "birthday", "ceremony", "school", "home", "shop", "birthday", "park", "ceremony"];
    grid.forEach((k, i) => photoAt(ctx, k, 6 + (i % 3) * 168, 310 + Math.floor(i / 3) * 210, 164, 205));
    return;
  }
  if (kind === "post") {
    screenBg(ctx, "#ffffff", "#ffffff");
    header(ctx, "投稿");
    photoAt(ctx, "park", 16, 150, 480, 600);
    heart(ctx, 60, 810, 30, RED);
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.font = `900 36px ${JP}`;
    ctx.fillText("128", 100, 822);
    globe(ctx, 330, 808, 22, TEAL);
    ctx.fillStyle = TEAL;
    ctx.fillText("公開", 362, 822);
    ctx.fillStyle = INK;
    ctx.font = `800 32px ${JP}`;
    ctx.fillText("家族でお出かけ♪", 30, 900);
    return;
  }
  if (kind === "fakeMsg") {
    screenBg(ctx, "#2a0c12", "#120609");
    ctx.fillStyle = "#3a141c";
    ctx.fillRect(0, 0, 512, 120);
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 40px ${JP}`;
    ctx.fillText("知らない番号", 256, 80);
    ctx.fillStyle = "#ffffff";
    rr(ctx, 30, 170, 452, 120, 26);
    ctx.fill();
    ctx.fillStyle = RED;
    ctx.font = `900 36px ${JP}`;
    ctx.fillText("お子さんを", 256, 222);
    ctx.fillText("預かっている", 256, 268);
    photoAt(ctx, "fake", 56, 320, 400, 500);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 8;
    ctx.strokeRect(56, 320, 400, 500);
    ctx.fillStyle = "#ffd0d5";
    ctx.font = `900 36px ${JP}`;
    ctx.fillText("今すぐ連絡しろ", 256, 900);
    return;
  }
  if (kind === "fakeCall") {
    screenBg(ctx, "#3a0f22", "#12060c");
    ctx.fillStyle = "#ffd0e4";
    ctx.font = `800 36px ${JP}`;
    ctx.fillText("着信中…", 256, 150);
    photoAt(ctx, "fake", 136, 200, 240, 300);
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 56px ${JP}`;
    ctx.fillText("非通知", 256, 590);
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(150, 880, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2fbf6a";
    ctx.beginPath();
    ctx.arc(362, 880, 62, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (kind === "compose") {
    screenBg(ctx, "#ffffff", "#f3f5fa");
    header(ctx, "新しい投稿");
    photoAt(ctx, "park", 56, 160, 400, 500);
    ctx.fillStyle = "#9aa3b5";
    ctx.textAlign = "left";
    ctx.font = `700 32px ${JP}`;
    ctx.fillText("キャプションを入力…", 56, 720);
    ctx.fillStyle = "#3b82f6";
    rr(ctx, 106, 820, 300, 96, 48);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `900 46px ${JP}`;
    ctx.fillText("投稿する", 256, 884);
    return;
  }
  if (kind === "privacy") {
    screenBg(ctx, "#ffffff", "#f3f5fa");
    header(ctx, "公開範囲");
    const rows: Array<[string, boolean]> = [["全員", false], ["友だちのみ", true], ["自分のみ", false]];
    rows.forEach(([label, on], i) => {
      const y = 220 + i * 150;
      ctx.fillStyle = on ? "#e2fbf6" : "#ffffff";
      rr(ctx, 30, y, 452, 120, 24);
      ctx.fill();
      ctx.strokeStyle = on ? TEAL : "#d5dbe6";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.textAlign = "left";
      ctx.font = `900 44px ${JP}`;
      ctx.fillText(label, 70, y + 76);
      ctx.beginPath();
      ctx.arc(430, y + 60, 26, 0, Math.PI * 2);
      ctx.strokeStyle = on ? TEAL : "#b5bdcc";
      ctx.stroke();
      if (on) {
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.arc(430, y + 60, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    return;
  }
  // review0..3: past posts, the first n switched to 非公開
  const n = Number(kind.slice(-1));
  screenBg(ctx, "#ffffff", "#f3f5fa");
  header(ctx, "過去の投稿");
  REVIEW_ROWS.forEach((k, i) => {
    const y = 160 + i * 270;
    const off = i < n;
    photoAt(ctx, k, 30, y, 190, 238);
    ctx.fillStyle = off ? "#e2fbf6" : "#fff0f1";
    rr(ctx, 240, y + 80, 240, 80, 40);
    ctx.fill();
    ctx.fillStyle = off ? TEAL : RED;
    ctx.textAlign = "center";
    ctx.font = `900 40px ${JP}`;
    ctx.fillText(off ? "非公開" : "公開中", 360, y + 134);
  });
};

export const screenTexture = (kind: ScreenKind) => canvasTexture(`s-screen-${kind}`, 512, 1024, (ctx) => drawScreen(ctx, kind));

/** Picture map (square): school top right, supermarket, park top left, home bottom left. Spots in 0..1. */
export const MAP_SPOTS = {
  school: { label: "さくら小学校", u: 0.72, v: 0.18 },
  shop: { label: "まるやスーパー", u: 0.74, v: 0.62 },
  park: { label: "ひかり公園", u: 0.24, v: 0.24 },
  home: { label: "", u: 0.3, v: 0.72 },
} as const;
export type SpotId = keyof typeof MAP_SPOTS;

export const mapTexture = () =>
  canvasTexture("s-map", 1024, 1024, (ctx) => {
    const r = rng(31);
    ctx.fillStyle = "#f6efdc";
    ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = r() > 0.5 ? "#e7dcc0" : "#dfe9d2";
      rr(ctx, r() * 960, r() * 960, 60 + r() * 90, 50 + r() * 80, 10);
      ctx.fill();
    }
    ctx.fillStyle = "#bfe3b0";
    ctx.beginPath();
    ctx.ellipse(0.24 * 1024, 0.24 * 1024, 150, 110, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d4cbb4";
    ctx.lineWidth = 54;
    ctx.lineCap = "round";
    [[0.5, 0, 0.5, 1], [0, 0.45, 1, 0.45], [0, 0.85, 1, 0.85], [0.9, 0, 0.9, 1]].forEach(([a, b, c, d]) => {
      ctx.beginPath();
      ctx.moveTo(a * 1024, b * 1024);
      ctx.lineTo(c * 1024, d * 1024);
      ctx.stroke();
    });
    // buildings at the spots
    const block = (u: number, v: number, color: string, w = 120, h = 90) => {
      ctx.fillStyle = color;
      rr(ctx, u * 1024 - w / 2, v * 1024 - h / 2, w, h, 12);
      ctx.fill();
    };
    block(MAP_SPOTS.school.u, MAP_SPOTS.school.v, "#e9e2d2", 190, 120);
    block(MAP_SPOTS.shop.u, MAP_SPOTS.shop.v, "#f4c4c4", 170, 100);
    block(MAP_SPOTS.home.u, MAP_SPOTS.home.v, "#f1c9a0", 110, 90);
    ctx.textAlign = "center";
    (Object.keys(MAP_SPOTS) as SpotId[]).forEach((id) => {
      const s = MAP_SPOTS[id];
      if (!s.label) return;
      ctx.font = `900 50px ${JP}`;
      const w = ctx.measureText(s.label).width + 36;
      const x = Math.min(Math.max(s.u * 1024, w / 2 + 10), 1024 - w / 2 - 10);
      const y = s.v * 1024 + 70;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#5a6478";
      ctx.lineWidth = 5;
      rr(ctx, x - w / 2, y, w, 72, 20);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.fillText(s.label, x, y + 54);
    });
  });
