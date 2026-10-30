import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, lerpShot2, Shot2 } from "../../golden2/shot";
import { Chip, Layer, SAFE_CX, StepPill } from "../overlays";
import { CallLine, Cross, EvidenceCard, Phone, PhotoCard, SAFE_TEAL, THREAT_RED } from "../three/props";
import { NIGHT } from "../three/room";
import { SceneDefP } from "../types";
import { HERO, HERO_CAM } from "./cams";
import { screenAt, span } from "./util";

// L0 floating threat chat: the reply box greys out (返信しない); a screenshot flash, and copies of the threat
// and of the account fly out as saved evidence; then 「警察」「利用サービス」 chips. L1 the hidden image card and a
// friend's phone: a forward arrow starts toward it and is cut by a red ✕.
const PHONE_AT: V3 = [HERO[0], HERO[1] + 0.12, HERO[2]];
const MSG_TO: V3 = [-0.5, 0.95, 1.25];
const ACCT_TO: V3 = [0.5, 0.95, 1.25];
const CARD_AT: V3 = [-0.42, 1.35, 0.9];
const FRIEND_AT: V3 = [0.45, 1.3, 0.9];

const shutterAt = (b: Beat) => b.ck(0, 2);
const isForward = (b: Beat) => b.f >= b.ln(1) - 4;

const shot = (b: Beat): Shot2 => breathe(lerpShot2(HERO_CAM, { ...HERO_CAM, pos: [0.15, 1.5, 8.1], target: [0.08, 1.3, 0.9] }, ease(b.f, b.ln(1), 60, EASE.cam)), b.f);

const Evidence: React.FC<{ b: Beat }> = ({ b }) => {
  const msg = ease(b.f, shutterAt(b) + 4, 14, EASE.out);
  const acct = ease(b.f, b.ck(0, 3), 14, EASE.out);
  const away = 1 - ease(b.f, b.ln(1) - 10, 8, EASE.in);
  return (
    <>
      <EvidenceCard pos={lerp3(PHONE_AT, MSG_TO, msg)} k={msg * away} kind="msg" rot={[0, 0.2, 0.05]} scale={0.8} />
      <EvidenceCard pos={lerp3(PHONE_AT, ACCT_TO, acct)} k={acct * away} kind="acct" rot={[0, -0.2, -0.05]} scale={0.8} />
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const out = ease(b.f, b.ln(1) - 6, 10, EASE.inOut);
  const s = screenAt(b.f, [
    [0, "dmThreat"],
    [b.ck(0, 1), "dmStop"],
  ]);
  const flash = ease(b.f, shutterAt(b), 2) * (1 - ease(b.f, shutterAt(b) + 2, 8));
  const fwdIn = ease(b.f, b.ln(1) - 2, 12, EASE.out);
  const arrow = ease(b.f, b.ck(1, 2), 18, EASE.inOut);
  const cut = ease(b.f, b.ck(1, 3), 8, EASE.out);
  return (
    <>
      {out < 1 && <Phone pos={PHONE_AT} h={1.25 * (1 - out * 0.4)} {...s} flash={flash} glow={0.35 * (1 - out)} glowColor={SAFE_TEAL} f={b.f} />}
      <Evidence b={b} />
      {isForward(b) && (
        <>
          <PhotoCard pos={CARD_AT} k={fwdIn} kind="hidden" scale={1.05} rot={[0, 0.2, -0.04]} />
          {fwdIn > 0.01 && <Phone pos={FRIEND_AT} h={0.8 * fwdIn} screen="friend" dim={0.2} glow={0} />}
          <CallLine from={[CARD_AT[0] + 0.24, 1.35, 1.05]} to={[FRIEND_AT[0] - 0.2, 1.35, 1.05]} f={b.f} grow={arrow} lift={0.12} radius={0.035} color={THREAT_RED} breakAt={0.6} />
          <Cross pos={[0.06, 1.42, 1.12]} k={cut} size={0.26} />
        </>
      )}
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={540} k={span(b.f, b.ck(0, 0))}>
      <StepPill n={3} text="やめる・残す・相談する" size={50} />
    </Layer>
    <Layer x={SAFE_CX} y={1335} k={span(b.f, b.ck(0, 1), b.ck(0, 4) - 4)}>
      <Chip text="返信しない" size={50} accent="#ff3b4a" mark="ng" />
    </Layer>
    <Layer x={SAFE_CX} y={1335} k={span(b.f, b.ck(0, 4), b.ck(0, 5) - 4)}>
      <Chip text="消さずに残す" size={50} accent="#16b8a4" mark="ok" />
    </Layer>
    <Layer x={SAFE_CX} y={1335} k={span(b.f, b.ck(0, 5), b.ln(1) - 6)}>
      <div style={{ display: "flex", gap: 24 }}>
        <Chip text="警察" size={48} accent="#6fa8ff" />
        <div style={{ opacity: ease(b.f, b.ck(0, 6), 8, EASE.out) }}>
          <Chip text="利用サービス" size={48} accent="#16b8a4" />
        </div>
      </div>
    </Layer>
    <Layer x={SAFE_CX} y={1335} k={span(b.f, b.ck(1, 3))}>
      <Chip text="友達へ転送しない" size={50} accent="#ff3b4a" mark="ng" />
    </Layer>
  </>
);

export const RULE3: SceneDefP = {
  topic: "やめる・残す・相談する",
  shot,
  World,
  Overlay,
  light: () => ({ ...NIGHT, lamp: 0.6, hall: 0.9 }),
  room: () => ({ door: 1 }),
  shutter: (b) => ease(b.f, shutterAt(b), 2) * (1 - ease(b.f, shutterAt(b) + 2, 10, EASE.out)) * 0.6,
  dipIn: true,
};
