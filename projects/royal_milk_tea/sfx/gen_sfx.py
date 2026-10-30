"""Sound effects / BGM for royal_milk_tea via ElevenLabs sound-generation (works on the free key)."""
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "narration_reel"))
from common import PUBLIC, api_key  # noqa: E402

SOUNDS = {
    "bgm_cafe": ("Soft cozy cafe background music loop, gentle jazz piano and brushed drums, warm afternoon, relaxed, no vocals, 88 bpm", 22, True),
    "simmer": ("Milk gently simmering in a small pan on a gas stove, soft bubbling, close up", 4, False),
    "leaves": ("Dry loose tea leaves sprinkled into a pan, light rustle and patter", 1.2, False),
    "chalk": ("Writing quickly on a chalkboard with chalk, short", 1.5, False),
    "stamp": ("Rubber stamp pressed firmly on paper, single soft thump", 0.8, False),
    "flame_off": ("Gas stove knob turned off, click and the soft whoosh of the flame going out", 1.2, False),
    "clink": ("Porcelain teacup set down on a saucer, gentle clink", 0.8, False),
}

key = api_key()
out = PUBLIC / "royalmilk"
for name, (text, dur, loop) in SOUNDS.items():
    dst = out / f"{name}.mp3"
    if dst.exists():
        continue
    body = {"text": text, "duration_seconds": dur, "prompt_influence": 0.5}
    if loop:
        body["loop"] = True
    r = requests.post("https://api.elevenlabs.io/v1/sound-generation", headers={"xi-api-key": key}, json=body, timeout=180)
    if r.status_code != 200:
        print(name, "failed", r.status_code, r.text[:200])
        continue
    dst.write_bytes(r.content)
    print(name, len(r.content))
