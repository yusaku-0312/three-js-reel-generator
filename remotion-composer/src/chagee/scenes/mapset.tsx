import React from "react";
import { add3 } from "../core";
import { CHINA_PINS, LightColumn, MapSheet, mapPoint, Pin, SEA_PINS } from "../three/parts";
import { KUNMING, LA, SEOUL } from "./set";

const DONE = -1000;

/**
 * The map with every pin the story has placed so far. Each `*At` is the frame (scene clock) its pins start
 * dropping; omit one to show those pins already standing, or pass null to leave them out.
 */
export const MapPins: React.FC<{ f: number; chinaAt?: number; seaAt?: number; laAt?: number | null; seoulAt?: number | null; beam?: number }> = ({
  f,
  chinaAt = DONE,
  seaAt = DONE,
  laAt = DONE,
  seoulAt = DONE,
  beam = 0,
}) => (
  <>
    <MapSheet />
    <Pin at={KUNMING} f={f} dropAt={DONE} size={1.6} />
    {CHINA_PINS.map(([lon, lat], i) => (
      <Pin key={`c${i}`} at={mapPoint(lon, lat)} f={f} dropAt={chinaAt + (i % 24) * 1.6 + Math.floor(i / 24) * 6} />
    ))}
    {SEA_PINS.map(([lon, lat], i) => (
      <Pin key={`s${i}`} at={mapPoint(lon, lat)} f={f} dropAt={seaAt + i * 2.2} />
    ))}
    {laAt !== null && <Pin at={LA} f={f} dropAt={laAt} size={1.8} />}
    {laAt !== null && <LightColumn base={add3(LA, [0, 0.3, 0])} k={beam} />}
    {seoulAt !== null && <Pin at={SEOUL} f={f} dropAt={seoulAt} size={1.8} />}
  </>
);
