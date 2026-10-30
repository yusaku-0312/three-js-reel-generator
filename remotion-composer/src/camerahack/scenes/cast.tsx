import React from "react";
import { V3 } from "../core";
import { RoomLight } from "../../kyouhaku/three/room";
import { Device, DeviceKind, GroundLine, Led, MonitorCam, Platform, Shelf, SleepingChild, ViewCone, AICore } from "../three/devices";
import { BED_AIM, CAM_AT, CAM_PITCH, CAM_S, CAM_YAW, DIO_C, DIO_R, HEAD, LENS, SHELF } from "./cams";

/** Night with the desk lamp off: moonlight, the warm hall under the door. */
export const DARK_NIGHT: RoomLight = { moon: 0.6, lamp: 0, hall: 0.55, fill: 0.32, front: 0.42 };

/** The bedroom beat: the sleeping child, the shelf and its camera, and the camera's view cone. */
export const Bedroom: React.FC<{ f: number; led?: Led; glitch?: number; cone?: number; coneColor?: string }> = ({ f, led = "blue", glitch = 0, cone = 1, coneColor }) => (
  <>
    <SleepingChild head={HEAD} f={f} />
    <Shelf pos={SHELF} w={0.5} d={0.26} />
    <MonitorCam pos={CAM_AT} s={CAM_S} yaw={CAM_YAW} pitch={CAM_PITCH} led={led} glitch={glitch} f={f} />
    <ViewCone from={LENS} to={BED_AIM} spread={0.42} k={cone} color={coneColor} />
  </>
);

/** Diorama devices round the camera: [kind, angle (rad, 0 = front), yaw]. */
export const RING: Array<[DeviceKind, number, number]> = [
  ["tvbox", 0.65, -0.3],
  ["speaker", -0.75, 0.3],
  ["router", 2.0, -0.4],
  ["oven", -2.05, 0.45],
  ["tv", Math.PI, 0],
];
const RING_R = 0.56;
export const DEVICE_S = 1.4;
export const devicePos = (i: number): V3 => [DIO_C[0] + Math.sin(RING[i][1]) * RING_R, 0.06, DIO_C[2] + Math.cos(RING[i][1]) * RING_R];
export const CENTER: V3 = [DIO_C[0], 0.06, DIO_C[2]];
/** Height above a device where its AI copy floats. */
export const CORE_UP = 0.55;
export const coreAt = (p: V3): V3 => [p[0], p[1] + CORE_UP, p[2]];

export type DioState = {
  /** Per device (ring order) 0..1 appearance, lamp, infected (copy floating above). */
  show: number[];
  leds: Led[];
  copies: number[];
  /** Centre camera. */
  camLed: Led;
  camGlitch?: number;
  camDim?: number;
  camCopy?: number;
  /** Ground links 0..1. */
  links: number;
};

/** The device diorama on its platform; the copies are drawn by the scene (they move). */
export const Diorama: React.FC<{ s: DioState; f: number }> = ({ s, f }) => (
  <>
    <Platform pos={DIO_C} r={DIO_R} />
    <pointLight position={[DIO_C[0] - 0.6, 1.6, DIO_C[2] + 1.2]} color="#dfe6ff" intensity={1.4} distance={4} decay={1.2} />
    <MonitorCam pos={CENTER} s={DEVICE_S} led={s.camLed} glitch={s.camGlitch} dim={s.camDim} f={f} />
    {s.camCopy !== undefined && s.camCopy > 0.01 && <AICore pos={coreAt(CENTER)} f={f} size={0.07 * s.camCopy} power={1} />}
    {RING.map(([kind, , yaw], i) => {
      const p = devicePos(i);
      const c = s.copies[i] ?? 0;
      return (
        <React.Fragment key={kind}>
          <Device kind={kind} pos={p} yaw={yaw} s={DEVICE_S} led={s.leds[i] ?? "blue"} k={s.show[i] ?? 1} />
          <GroundLine from={[CENTER[0], 0.0, CENTER[2]]} to={[p[0], 0.0, p[2]]} k={s.links} color="#9fb4ff" width={0.018} />
          {c > 0.01 && <AICore pos={coreAt(p)} f={f + i * 17} size={0.07 * c} power={1} />}
        </React.Fragment>
      );
    })}
  </>
);
