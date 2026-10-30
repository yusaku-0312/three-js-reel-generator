import * as THREE from "three";
import { geoContains, geoGraticule10, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-50m.json";
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

const GOTHIC = `"Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif`;
const SERIF = `"Didot", "Bodoni 72", "Times New Roman", serif`;

/** CHAGEE's colour: cobalt of blue-and-white porcelain. */
export const COBALT = "#1f4fa8";
const COBALT_DEEP = "#173a86";

// ---------------------------------------------------------------------------
// Blue-and-white (青花) band for the takeaway cup: cobalt field with white scrolls and blossoms,
// white rims above and below, and the name in a thin serif. u wraps around the cup, v runs up it.
// ---------------------------------------------------------------------------

const blossom = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5, r * 0.32, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.fillStyle = COBALT_DEEP;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const porcelainCupTexture = () =>
  canvasTexture("chagee-cup", 2048, 1024, (ctx) => {
    ctx.fillStyle = "#f7f6f2";
    ctx.fillRect(0, 0, 2048, 1024);
    // canvas y 0 = top of the cup
    const top = 150;
    const bottom = 900;
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, COBALT_DEEP);
    g.addColorStop(0.5, COBALT);
    g.addColorStop(1, COBALT_DEEP);
    ctx.fillStyle = g;
    ctx.fillRect(0, top, 2048, bottom - top);
    ctx.strokeStyle = "#f7f6f2";
    ctx.fillStyle = "#f7f6f2";
    ctx.lineCap = "round";
    const r = rng(42);
    // scrolling vines
    for (let k = 0; k < 7; k++) {
      ctx.lineWidth = 6 + r() * 6;
      ctx.beginPath();
      const y0 = top + 60 + r() * (bottom - top - 120);
      ctx.moveTo(0, y0);
      for (let x = 0; x <= 2048; x += 32) ctx.lineTo(x, y0 + Math.sin(x / (90 + k * 20) + k) * (40 + r() * 40));
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // curls and blossoms along the vines
    for (let i = 0; i < 70; i++) {
      const x = r() * 2048;
      const y = top + 40 + r() * (bottom - top - 80);
      if (r() < 0.45) {
        blossom(ctx, x, y, 26 + r() * 34);
      } else {
        ctx.lineWidth = 5;
        ctx.beginPath();
        const rad = 14 + r() * 22;
        ctx.arc(x, y, rad, r() * 6, r() * 6 + 4.2);
        ctx.stroke();
      }
    }
    // white plaque with the name, on the side facing the camera (u ≈ 0.25 faces +z)
    const cx = 512;
    ctx.fillStyle = "rgba(247,246,242,0.94)";
    ctx.beginPath();
    ctx.ellipse(cx, 520, 300, 120, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COBALT;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = COBALT_DEEP;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 120px ${SERIF}`;
    ctx.fillText("CHAGEE", cx, 528);
    // rims
    ctx.fillStyle = COBALT;
    ctx.fillRect(0, top - 26, 2048, 10);
    ctx.fillRect(0, bottom + 16, 2048, 10);
  });

// ---------------------------------------------------------------------------
// Pacific-centred paper map (world-atlas 50m + d3 Mercator): China warm, the other countries sand,
// the sea pale aqua with a dotted graticule. Covers lon 66°E → 98°W, lat 22°S → 60°N, so Yunnan,
// South-East Asia, Korea, Japan and Los Angeles sit on one sheet with margin past every camera.
// ---------------------------------------------------------------------------

const LON0 = 66;
const LON1 = 262;
const LAT_N = 60;
const LAT_S = -22;
const MAP_W = 4096;
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const SCALE = MAP_W / (((LON1 - LON0) * Math.PI) / 180);
export const MAP_PX = { w: MAP_W, h: Math.round(SCALE * (merc(LAT_N) - merc(LAT_S))) };

const projection = geoMercator()
  .rotate([-(LON0 + LON1) / 2, 0])
  .scale(SCALE)
  .translate([MAP_PX.w / 2, SCALE * merc(LAT_N)]);

/** Canvas pixel of a lon/lat on the map texture. */
export const mapPx = (lon: number, lat: number): [number, number] => projection([lon, lat]) ?? [0, 0];

// world-atlas is a TopoJSON topology; the object name is fixed by the package.
const COUNTRIES = feature(world, (world as unknown as { objects: { countries: unknown } }).objects.countries).features;
const byName = (name: string) => COUNTRIES.find((c) => c.properties.name === name);
const CHINA = byName("China");

/** True when lon/lat is inside mainland China (for scattering the store pins). */
export const inChina = (lon: number, lat: number) => (CHINA ? geoContains(CHINA, [lon, lat]) : false);

const LABELS: Array<[string, number, number, number]> = [
  ["中国", 104, 33.5, 150],
  ["韓国", 128.2, 35.4, 64],
  ["日本", 139.5, 39.2, 76],
  ["東南アジア", 113.5, 13.5, 70],
  ["アメリカ", 241.5, 41.5, 92],
  ["太平洋", 175, 25, 120],
];

export const mapTexture = () =>
  canvasTexture("chagee-map", MAP_PX.w, MAP_PX.h, (ctx) => {
    const { w, h } = MAP_PX;
    ctx.fillStyle = "#c6e2e3";
    ctx.fillRect(0, 0, w, h);
    const path = geoPath(projection, ctx);
    ctx.setLineDash([6, 14]);
    ctx.strokeStyle = "rgba(70,120,130,0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    path(geoGraticule10());
    ctx.stroke();
    ctx.setLineDash([]);
    for (const c of COUNTRIES) {
      ctx.beginPath();
      path(c);
      ctx.fillStyle = c === CHINA ? "#f3cf9c" : "#efe4c8";
      ctx.fill();
      ctx.strokeStyle = "#9b7a55";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    // paper grain
    const r = rng(9);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(90,60,30,${0.02 + r() * 0.04})`;
      ctx.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3);
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const [text, lon, lat, size] of LABELS) {
      const [x, y] = mapPx(lon, lat);
      ctx.font = `800 ${size}px ${GOTHIC}`;
      ctx.lineWidth = size * 0.18;
      ctx.strokeStyle = "rgba(255,250,238,0.9)";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = text === "太平洋" ? "rgba(50,105,115,0.55)" : "#6b4a2c";
      ctx.fillText(text, x, y);
    }
    // a soft vignette at the paper edge
    const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, w * 0.62);
    v.addColorStop(0, "rgba(120,80,40,0)");
    v.addColorStop(1, "rgba(120,80,40,0.28)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  });

// ---------------------------------------------------------------------------
// Travel props for the closing shot.
// ---------------------------------------------------------------------------

export const passportTexture = () =>
  canvasTexture("chagee-passport", 512, 720, (ctx) => {
    ctx.fillStyle = "#1d2b52";
    ctx.fillRect(0, 0, 512, 720);
    ctx.strokeStyle = "#d8b66a";
    ctx.fillStyle = "#d8b66a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 330, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(256, 330, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = `600 64px ${SERIF}`;
    ctx.fillText("PASSPORT", 256, 560);
  });

export const ticketTexture = () =>
  canvasTexture("chagee-ticket", 1024, 420, (ctx) => {
    ctx.fillStyle = "#fbfaf6";
    ctx.fillRect(0, 0, 1024, 420);
    ctx.fillStyle = COBALT;
    ctx.fillRect(0, 0, 1024, 90);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 52px ${GOTHIC}`;
    ctx.textBaseline = "middle";
    ctx.fillText("BOARDING PASS", 40, 46);
    ctx.fillStyle = "#1d2b52";
    ctx.font = `800 120px ${GOTHIC}`;
    ctx.fillText("TYO", 60, 230);
    ctx.fillText("SEL", 560, 230);
    ctx.font = `800 90px ${GOTHIC}`;
    ctx.fillText("✈", 380, 230);
    ctx.setLineDash([14, 12]);
    ctx.strokeStyle = "#9aa3b5";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(820, 100);
    ctx.lineTo(820, 420);
    ctx.stroke();
  });
