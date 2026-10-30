import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import fontManifest from "../../public/fonts/zenmaru/manifest.json";

// Zen Maru Gothic 700/900 from the local cache (node cache-fonts.mjs), so renders never wait on Google Fonts.
const fontFamily = fontManifest.family;
if (typeof FontFace !== "undefined" && typeof document !== "undefined") {
  const handle = delayRender(`Loading local ${fontFamily}`);
  Promise.all(
    fontManifest.faces.map(({ weight, file, range }) => {
      const face = new FontFace(fontFamily, `url(${staticFile(`fonts/zenmaru/${file}`)}) format("woff2")`, { weight, style: "normal", unicodeRange: range });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => cancelRender(e));
}

export const FONT = `${fontFamily}, "Hiragino Maru Gothic ProN", sans-serif`;

export const C = {
  ink: "#3B2A24",
  cream: "#FFF6E6",
  white: "#FFFFFF",
  greenTea: "#9CCB4F",
  greenLeaf: "#5FA83A",
  oolong: "#D9962B",
  oolongLeaf: "#B07A2A",
  blackTea: "#B0412A",
  blackLeaf: "#6E3B26",
  gold: "#FFC93C",
  band: "#7A3E2B",
  bandAccent: "#FFC93C",
  skin: "#F6CFAE",
  skinShade: "#E9B48F",
  blush: "#F59A8B",
};

export const W = 1080;
export const H = 1920;
