// Cache the Zen Maru Gothic subsets (700 and 900) under public/fonts/zenmaru so renders never wait on Google Fonts.
// The headless browser fetches ~240 subset files per render and @remotion/google-fonts gives each only 18 s,
// which fails on a slow connection. Usage: node cache-fonts.mjs  (re-run is a no-op for files already present)
import { getInfo } from "@remotion/google-fonts/ZenMaruGothic";
import fs from "node:fs/promises";
import path from "node:path";

const WEIGHTS = ["700", "900"];
const OUT = path.resolve("public/fonts/zenmaru");
const CONCURRENCY = 8;

const info = getInfo();
const jobs = WEIGHTS.flatMap((weight) =>
  Object.entries(info.fonts.normal[weight]).map(([subset, url], i) => ({
    weight,
    subset,
    url,
    file: `${weight}/${String(i).padStart(3, "0")}.woff2`,
    range: info.unicodeRanges[subset],
  })),
);

const fetchOne = async (job) => {
  const dest = path.join(OUT, job.file);
  const have = await fs.stat(dest).catch(() => null);
  if (have && have.size > 0) return;
  const res = await fetch(job.url);
  if (!res.ok) throw new Error(`${res.status} ${job.url}`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
};

const queue = [...jobs];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await fetchOne(queue.shift());
  }),
);
const faces = jobs.map(({ weight, file, range }) => ({ weight, file, range }));
await fs.writeFile(path.join(OUT, "manifest.json"), JSON.stringify({ family: info.fontFamily, faces }, null, 1) + "\n");
console.log(`cached ${faces.length} faces of ${info.fontFamily} in ${OUT}`);
