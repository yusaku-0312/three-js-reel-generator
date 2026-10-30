export type LineT = { start: number; end: number; chunks: number[] };

export type SceneT = { id: string; start: number; end: number; duration: number; lines: LineT[] };

export type TimelineT = {
  fps: number;
  durationInFrames: number;
  scenes: SceneT[];
  subtitles: Array<{ text: string; start: number; end: number }>;
  mouth: number[];
};

/** What every scene gets: local frame, lip-flap amount, and frame lookups for lines/chunks. */
export type Ctx = {
  f: number;
  talk: number;
  ln: (i: number) => number;
  ck: (i: number, j: number) => number;
};
