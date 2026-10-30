// Render selected frames of a composition as JPEG stills (one bundle, many frames).
// Usage: node golden-stills.mjs <outDir> <frame> [frame...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [outDir, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.tsx") });
const chromiumOptions = { gl: "angle" };
// Google Fonts can take longer than the 30 s default to arrive on a slow connection.
const timeoutInMilliseconds = 120000;
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? "GoldenDrop", chromiumOptions, timeoutInMilliseconds });
for (const frame of frames.map(Number)) {
  const output = path.join(outDir, `f${String(frame).padStart(4, "0")}.jpg`);
  try {
    await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 85, chromiumOptions, timeoutInMilliseconds });
    console.log("wrote", output);
  } catch (e) {
    console.log(`frame ${frame} failed: ${String(e.message ?? e).split("\n")[0]}`);
  }
}
