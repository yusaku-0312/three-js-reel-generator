"""Time every subtitle chunk on the chosen take and emit narration.wav + timeline.json for Remotion, plus
projects/<name>/timing.md (the per-line table the animation plan is written against).

Scribe character timestamps (stt_check.py) are aligned to script.json with difflib; a chunk start that
falls in a pause is snapped to the next voice onset. Scenes split halfway through the gap between lines.

Usage: .venv/bin/python scripts/narration_reel/build_timeline.py <name> <take> --slug <public folder>
"""
import argparse
import difflib
import json
import subprocess
import wave

import numpy as np

from common import ALIGN_SKIP, PUBLIC, load_script, project_dir

FPS = 30
SR = 44100
LEAD_IN = 0.25      # first word almost immediately (no head fade)
TAIL = 3.0          # end card hold after the last word
ONSET_DB = -40.0    # voiced threshold for snapping chunk starts to the voice
SNAP_FWD = 0.35     # a chunk timestamp may sit this far inside the preceding pause
# Scribe writes some kana words in kanji (and the reverse); script.json "spelling" adds project-specific pairs.
SPELLING = {"一つ": "ひとつ", "二つ": "ふたつ", "香り付け": "香りづけ"}


def decode(path) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def voiced_mask(samples: np.ndarray, hop: int = SR // 100) -> np.ndarray:
    frames = len(samples) // hop
    rms = np.sqrt(np.mean(samples[: frames * hop].reshape(frames, hop) ** 2, axis=1) + 1e-12)
    return 20 * np.log10(rms) > ONSET_DB


def snap_to_onset(t: float, voiced: np.ndarray) -> float:
    """In a pause: move to the next voiced 10 ms frame. Voiced: walk back to the start of this voiced run (≤80 ms)."""
    i = int(t * 100)
    if i >= len(voiced):
        return t
    if voiced[i]:
        j = i
        while j > 0 and voiced[j - 1] and (i - j) < 8:
            j -= 1
        return j / 100 if j < i and not voiced[max(j - 1, 0)] else t
    j = i
    while j < len(voiced) and not voiced[j] and (j - i) < SNAP_FWD * 100:
        j += 1
    return j / 100


def respell(chars: list, spelling: dict) -> list:
    """Replace heard spellings with the script's (合言葉 → あいことば) on the character sequence, so it works
    whether Scribe returns whole words or one character per word; each new character gets an even share of
    the replaced span."""
    keys = sorted(spelling, key=len, reverse=True)
    out, i = [], 0
    while i < len(chars):
        for key in keys:
            n = len(key)
            if "".join(c["text"] for c in chars[i:i + n]) == key:
                start, end, text = chars[i]["start"], chars[i + n - 1]["end"], spelling[key]
                step = (end - start) / len(text)
                out += [{"text": ch, "start": start + k * step, "end": start + (k + 1) * step} for k, ch in enumerate(text)]
                i += n
                break
        else:
            out.append(chars[i])
            i += 1
    return out


def heard_chars(stt: dict, spelling: dict) -> list:
    chars = []
    for w in stt["words"]:
        if w["type"] != "word":
            continue
        cs = w.get("characters") or [{"text": w["text"], "start": w["start"], "end": w["end"]}]
        if len(cs) == 1 and len(w["text"]) > 1:  # multi-character word without character times
            step = (w["end"] - w["start"]) / len(w["text"])
            cs = [{"text": ch, "start": w["start"] + k * step, "end": w["start"] + (k + 1) * step} for k, ch in enumerate(w["text"])]
        chars += [c for c in cs if c["text"] not in ALIGN_SKIP]
    return respell(chars, spelling)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("take")
    ap.add_argument("--slug", required=True, help="remotion-composer/public/<slug> receives narration.wav + timeline.json")
    args = ap.parse_args()
    proj = project_dir(args.name)
    script = load_script(proj)
    stt = json.loads((proj / "audio" / f"take{args.take}_x.stt.json").read_text())
    samples = decode(proj / "audio" / f"take{args.take}_x.wav")
    voiced = voiced_mask(samples)

    heard = heard_chars(stt, {**SPELLING, **script.get("spelling", {})})
    owners, wanted = [], []
    for scene in script["scenes"]:
        for li, chunks in enumerate(scene["lines"]):
            for ci, (_, tts) in enumerate(chunks):
                for ch in tts:
                    if ch not in ALIGN_SKIP:
                        wanted.append(ch)
                        owners.append((scene["id"], li, ci))
    sm = difflib.SequenceMatcher(None, "".join(wanted), "".join(c["text"] for c in heard), autojunk=False)
    to_heard = {a + k: b + k for a, b, n in sm.get_matching_blocks() for k in range(n)}
    print(f"aligned {len(to_heard)}/{len(wanted)} script characters")

    def char_time(idx: int, end: bool = False) -> float:
        order = range(idx, -1, -1) if end else range(idx, len(wanted))
        for k in order:
            if k in to_heard:
                c = heard[to_heard[k]]
                return c["end"] if end else c["start"]
        raise SystemExit(f"no aligned character near {idx}")

    first_idx, last_idx = {}, {}
    for i, o in enumerate(owners):
        first_idx.setdefault(o, i)
        last_idx[o] = i

    scenes, subtitles, last_end = [], [], 0.0
    for scene in script["scenes"]:
        lines = []
        for li, chunks in enumerate(scene["lines"]):
            starts = [round(LEAD_IN + snap_to_onset(char_time(first_idx[(scene["id"], li, ci)]), voiced), 3) for ci in range(len(chunks))]
            end = round(LEAD_IN + char_time(last_idx[(scene["id"], li, len(chunks) - 1)], end=True), 3)
            lines.append({"start": starts[0], "end": end, "chunks": starts})
            subtitles += [{"text": d, "start": s} for (d, _), s in zip(chunks, starts)]
            last_end = end
        scenes.append({"id": scene["id"], "lines": lines})

    total = last_end + TAIL
    for i, s in enumerate(scenes):
        s["start"] = 0.0 if i == 0 else round((scenes[i - 1]["lines"][-1]["end"] + s["lines"][0]["start"]) / 2, 3)
    for i, s in enumerate(scenes):
        s["end"] = round(scenes[i + 1]["start"] if i + 1 < len(scenes) else total, 3)
        s["duration"] = round(s["end"] - s["start"], 3)
    for i, sub in enumerate(subtitles):
        nxt = subtitles[i + 1]["start"] if i + 1 < len(subtitles) else total - 0.6
        sub["end"] = round(min(nxt, sub["start"] + 3.2), 3)

    # timing.md uses absolute times (what the plan is written in); timeline.json uses scene-local times.
    md = [f"# {script['title']} — narration timing (take{args.take}, {script['speed']}x, total {total:.2f} s / {int(round(total * FPS))} frames)", "",
          "| # | scene | line time (s) | chunks (start s) |", "|---|---|---|---|"]
    n = 0
    for s, sc in zip(scenes, script["scenes"]):
        for ln, chunks in zip(s["lines"], sc["lines"]):
            parts = " / ".join(f"{d} {t:.2f}" for (d, _), t in zip(chunks, ln["chunks"]))
            md.append(f"| {n} | {s['id']} ({s['start']:.2f}–{s['end']:.2f}) | {ln['start']:.2f}–{ln['end']:.2f} | {parts} |")
            n += 1
    (proj / "timing.md").write_text("\n".join(md) + "\n")

    for s in scenes:
        for ln in s["lines"]:
            ln["start"] = round(ln["start"] - s["start"], 3)
            ln["end"] = round(ln["end"] - s["start"], 3)
            ln["chunks"] = [round(c - s["start"], 3) for c in ln["chunks"]]

    out = PUBLIC / args.slug
    out.mkdir(parents=True, exist_ok=True)
    mix = np.zeros(int(total * SR) + SR, dtype=np.float32)
    a = int(LEAD_IN * SR)
    mix[a:a + len(samples)] += samples
    with wave.open(str(out / "narration.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
    timeline = {"fps": FPS, "durationInFrames": int(round(total * FPS)), "scenes": scenes, "subtitles": subtitles, "mouth": []}
    (out / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    print(f"total {total:.2f}s → {out}/timeline.json, {proj}/timing.md")
    print("\n".join(md[4:]))


if __name__ == "__main__":
    main()
