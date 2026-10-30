"""Time every subtitle chunk on the chosen narration take and emit narration.wav + timeline.json for Remotion.

The take is one continuous ElevenLabs render (UI, Eleven v4 / Otani / [narrative]) sped up 1.1x with
atempo; Scribe character timestamps (stt_check.py) give the times, aligned to script.json with difflib.

Usage: python projects/paradise_tea/build_timeline.py [take2]
"""
import difflib
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT.parents[1] / "remotion-composer" / "public" / "paradise"
FPS = 30
SR = 44100
LEAD_IN = 0.25      # first word almost immediately (no head fade)
TAIL = 3.0          # end card hold after the last word
ONSET_DB = -40.0    # voiced threshold for snapping chunk starts to the voice
SNAP_BACK = 0.35    # a chunk timestamp may sit this far inside the preceding pause
PUNCT = set("、。，．！？!?「」 　")
# Scribe writes some kana words in kanji; map them back so the alignment stays character-exact.
SPELLING = {"一つ": "ひとつ", "香り付け": "香りづけ"}


def decode(path: Path) -> np.ndarray:
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
    """If `t` falls in a pause, move it to the next voiced 10 ms frame (never more than SNAP_BACK later)."""
    i = int(t * 100)
    if i >= len(voiced) or voiced[i]:
        # Already voiced: walk back to the onset of this voiced run (Scribe can start a char late).
        j = i
        while j > 0 and voiced[j - 1] and (i - j) < 8:
            j -= 1
        return j / 100 if j < i and not voiced[max(j - 1, 0)] else t
    j = i
    while j < len(voiced) and not voiced[j] and (j - i) < SNAP_BACK * 100:
        j += 1
    return j / 100


def stt_chars(stt: dict) -> list:
    chars = []
    for w in stt["words"]:
        if w["type"] != "word":
            continue
        text = SPELLING.get(w["text"], w["text"])
        cs = w.get("characters") or [{"text": w["text"], "start": w["start"], "end": w["end"]}]
        if text != w["text"]:  # respelled word: spread its span over the new characters
            step = (w["end"] - w["start"]) / len(text)
            cs = [{"text": ch, "start": w["start"] + k * step, "end": w["start"] + (k + 1) * step} for k, ch in enumerate(text)]
        chars += [c for c in cs if c["text"] not in PUNCT]
    return chars


def main() -> None:
    take = sys.argv[1] if len(sys.argv) > 1 else "take2"
    script = json.loads((ROOT / "script.json").read_text())
    stt = json.loads((ROOT / "audio" / f"{take}_x11.stt.json").read_text())
    samples = decode(ROOT / "audio" / f"{take}_x11.wav")
    voiced = voiced_mask(samples)

    heard = stt_chars(stt)
    heard_text = "".join(c["text"] for c in heard)
    # Script characters with (line key, chunk index) owners.
    owners, wanted = [], []
    for scene in script["scenes"]:
        for li, chunks in enumerate(scene["lines"]):
            for ci, (_, tts) in enumerate(chunks):
                for ch in tts:
                    if ch not in PUNCT:
                        wanted.append(ch)
                        owners.append((scene["id"], li, ci))
    sm = difflib.SequenceMatcher(None, "".join(wanted), heard_text, autojunk=False)
    to_heard = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            to_heard[a + k] = b + k
    print(f"aligned {len(to_heard)}/{len(wanted)} script chars")

    def char_time(idx: int, end: bool = False) -> float:
        # Nearest aligned neighbour (forward for starts, backward for ends).
        rng = range(idx, len(wanted)) if not end else range(idx, -1, -1)
        for k in rng:
            if k in to_heard:
                c = heard[to_heard[k]]
                return c["end"] if end else c["start"]
        raise SystemExit(f"no aligned char near {idx}")

    first_idx, last_idx = {}, {}
    for i, o in enumerate(owners):
        first_idx.setdefault(o, i)
        last_idx[o] = i

    scenes, subtitles = [], []
    line_spans = []
    for scene in script["scenes"]:
        lines = []
        for li, chunks in enumerate(scene["lines"]):
            starts = [round(LEAD_IN + snap_to_onset(char_time(first_idx[(scene["id"], li, ci)]), voiced), 3)
                      for ci in range(len(chunks))]
            end = round(LEAD_IN + char_time(last_idx[(scene["id"], li, len(chunks) - 1)], end=True), 3)
            lines.append({"start": starts[0], "end": end, "chunks": starts})
            subtitles += [{"text": d, "start": s} for (d, _), s in zip(chunks, starts)]
            line_spans.append((starts[0], end))
        scenes.append({"id": scene["id"], "lines": lines})

    total = line_spans[-1][1] + TAIL
    for i, s in enumerate(scenes):
        first = s["lines"][0]["start"]
        if i == 0:
            s["start"] = 0.0
        else:
            prev_end = scenes[i - 1]["lines"][-1]["end"]
            s["start"] = round((prev_end + first) / 2, 3)
    for i, s in enumerate(scenes):
        s["end"] = round(scenes[i + 1]["start"] if i + 1 < len(scenes) else total, 3)
        s["duration"] = round(s["end"] - s["start"], 3)
        for ln in s["lines"]:  # scene-local times, like the other trivia reels
            ln["start"] = round(ln["start"] - s["start"], 3)
            ln["end"] = round(ln["end"] - s["start"], 3)
            ln["chunks"] = [round(c - s["start"], 3) for c in ln["chunks"]]
    for i, sub in enumerate(subtitles):
        nxt = subtitles[i + 1]["start"] if i + 1 < len(subtitles) else total - 0.6
        sub["end"] = round(min(nxt, sub["start"] + 3.2), 3)

    mix = np.zeros(int(total * SR) + SR, dtype=np.float32)
    a = int(LEAD_IN * SR)
    mix[a:a + len(samples)] += samples
    PUBLIC.mkdir(parents=True, exist_ok=True)
    with wave.open(str(PUBLIC / "narration.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())

    total_frames = int(round(total * FPS))
    timeline = {"fps": FPS, "durationInFrames": total_frames, "scenes": scenes, "subtitles": subtitles, "mouth": []}
    (PUBLIC / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    print(f"total {total:.2f}s, {total_frames} frames")
    for s in scenes:
        print(f"{s['id']:8s} {s['start']:6.2f}-{s['end']:6.2f}")
        for ln in s["lines"]:
            print("   line", ln["start"], ln["end"], ln["chunks"])
    for sub in subtitles:
        print(f"  {sub['start']:6.2f}-{sub['end']:6.2f} {sub['text']}")


if __name__ == "__main__":
    main()
