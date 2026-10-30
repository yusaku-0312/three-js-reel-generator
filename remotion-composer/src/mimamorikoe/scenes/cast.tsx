import React from "react";
import { V3 } from "../core";
import { RoomLight } from "../../kyouhaku/three/room";
import { Led, Shelf } from "../../camerahack/three/devices";
import { Figure, MonitorCam } from "../three/props";
import { CAM_AT, CAM_PITCH, CAM_S, CAM_YAW, SHELF } from "./cams";

/** Home alone in the evening: the desk lamp on, a little moonlight, the warm hall under the door. */
export const EVENING: RoomLight = { moon: 0.35, lamp: 1, hall: 0.55, fill: 0.4, front: 0.5 };
/** The child's yellow top (the same yellow as the pyjamas in src/camerahack). */
export const KID_BODY = "#f2c94a";

/** The shelf and its monitor camera. */
export const ShelfCam: React.FC<{ f: number; led?: Led; glitch?: number }> = ({ f, led = "blue", glitch = 0 }) => (
  <>
    <Shelf pos={SHELF} w={0.5} d={0.26} />
    <MonitorCam pos={CAM_AT} s={CAM_S} yaw={CAM_YAW} pitch={CAM_PITCH} led={led} glitch={glitch} f={f} />
  </>
);

/** The child at home (faceless wooden figure, no hat or bag). */
export const Kid: React.FC<{ pos: V3; yaw?: number; walk?: number; step?: number; headPitch?: number; headYaw?: number; armL?: number; armR?: number; hop?: number }> = (p) => (
  <Figure kind="child" bare body={KID_BODY} pose={{ ...p, pos: p.pos }} />
);
