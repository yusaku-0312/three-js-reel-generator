import React from "react";
import type { Beat } from "./core";
import { Shot2 } from "../golden2/shot";
import { RoomLight, RoomState } from "./three/room";

/** Grade beats on top of the base look: colour drain, synthetic-image glitch, red danger wash. */
export type Grade = { desat?: number; glitch?: number; danger?: number };

export type SceneDefP = {
  topic: string;
  shot: (b: Beat) => Shot2;
  World: React.FC<{ b: Beat }>;
  Overlay?: React.FC<{ b: Beat; shot: Shot2 }>;
  light?: (b: Beat) => RoomLight;
  room?: (b: Beat) => RoomState;
  grade?: (b: Beat) => Grade;
  /** Bloom strength over the scene (default 0.35). */
  bloom?: (b: Beat) => number;
  /** 0..1 white camera-shutter flash (the screenshot). */
  shutter?: (b: Beat) => number;
  /** Enter through a warm light dip instead of a straight continuation. */
  dipIn?: boolean;
  /** Narration lines inside the scene that start on a new framing through the same dip. */
  dipLines?: number[];
  /** Chunks [line, chunk] inside a line where the framing changes through the same dip. */
  dipChunks?: Array<[number, number]>;
};
