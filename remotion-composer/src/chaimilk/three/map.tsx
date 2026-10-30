import React, { useMemo } from "react";
import * as THREE from "three";
import { geoGraticule10, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-50m.json";
import { rng, V3 } from "../core";

// ---------------------------------------------------------------------------
// Paper map of the word's journey: lon 34°E → 150°E, lat 2°N → 52°N (Persia, India, China and Japan on one
// sheet). The four countries are tinted; the rest is sand on a pale aqua sea.
// ---------------------------------------------------------------------------

const LON0 = 34;
const LON1 = 150;
const LAT_N = 52;
const LAT_S = 2;
const MAP_W = 3072;
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const SCALE = MAP_W / (((LON1 - LON0) * Math.PI) / 180);
const MAP_H = Math.round(SCALE * (merc(LAT_N) - merc(LAT_S)));

const projection = geoMercator()
  .rotate([-(LON0 + LON1) / 2, 0])
  .scale(SCALE)
  .translate([MAP_W / 2, SCALE * merc(LAT_N)]);
const mapPx = (lon: number, lat: number): [number, number] => projection([lon, lat]) ?? [0, 0];

const COUNTRIES = feature(world, (world as unknown as { objects: { countries: unknown } }).objects.countries).features;
const TINT: Record<string, string> = { China: "#f3cf9c", Iran: "#f1c2a0", India: "#f4b98a", Japan: "#f6d3b8" };
const LABELS: Array<[string, number, number, number]> = [
  ["中国", 104, 36, 120],
  ["ペルシャ", 54, 31.4, 92],
  ["インド", 79.5, 19, 100],
  ["日本", 138.5, 40.8, 80],
];

let texture: THREE.CanvasTexture | null = null;
const mapTexture = () => {
  if (texture) return texture;
  const canvas = document.createElement("canvas");
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "#c6e2e3";
  ctx.fillRect(0, 0, MAP_W, MAP_H);
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
    ctx.fillStyle = TINT[c.properties.name] ?? "#efe4c8";
    ctx.fill();
    ctx.strokeStyle = "#9b7a55";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  const r = rng(9);
  for (let i = 0; i < 7000; i++) {
    ctx.fillStyle = `rgba(90,60,30,${0.02 + r() * 0.04})`;
    ctx.fillRect(r() * MAP_W, r() * MAP_H, 2 + r() * 3, 2 + r() * 3);
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [text, lon, lat, size] of LABELS) {
    const [x, y] = mapPx(lon, lat);
    ctx.font = `800 ${size}px "Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif`;
    ctx.lineWidth = size * 0.18;
    ctx.strokeStyle = "rgba(255,250,238,0.9)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = "#6b4a2c";
    ctx.fillText(text, x, y);
  }
  const v = ctx.createRadialGradient(MAP_W / 2, MAP_H / 2, MAP_H * 0.4, MAP_W / 2, MAP_H / 2, MAP_W * 0.62);
  v.addColorStop(0, "rgba(120,80,40,0)");
  v.addColorStop(1, "rgba(120,80,40,0.28)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

export const SHEET_W = 4.6;
export const SHEET_H = (SHEET_W * MAP_H) / MAP_W;
const SHEET_Y = 0.004;

export const mapPoint = (lon: number, lat: number, y = SHEET_Y): V3 => {
  const [px, py] = mapPx(lon, lat);
  return [(px / MAP_W - 0.5) * SHEET_W, y, (py / MAP_H - 0.5) * SHEET_H];
};

/** Where each form of the word sits: Chinese chá (Xi'an), Persian chāy (Tehran), Hindi chai (Delhi), Japanese cha (Kyoto). */
export const WORD_AT = {
  china: mapPoint(108.9, 34.3),
  persia: mapPoint(51.4, 35.7),
  india: mapPoint(77.2, 28.6),
  japan: mapPoint(135.8, 35.0),
};

export const MapSheet: React.FC = () => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.85 }), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={SHEET_Y} material={mat} receiveShadow>
      <planeGeometry args={[SHEET_W, SHEET_H]} />
    </mesh>
  );
};
