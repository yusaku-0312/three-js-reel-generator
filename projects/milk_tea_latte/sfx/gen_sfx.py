"""Sound effects for milk_tea_latte via ElevenLabs sound-generation (works on the free key); the rest is copied from royalmilk."""
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "narration_reel"))
from common import PUBLIC, api_key  # noqa: E402

SOUNDS = {
    "steam": ("Espresso machine steam wand frothing milk in a steel pitcher, short hiss and gentle gurgle, cafe, close up", 2.2),
    "foam": ("Soft airy milk foam spooned onto a latte, gentle soft plop, quiet", 0.8),
}

key = api_key()
out = PUBLIC / "milktealatte"
for name, (text, dur) in SOUNDS.items():
    dst = out / f"{name}.mp3"
    if dst.exists():
        continue
    body = {"text": text, "duration_seconds": dur, "prompt_influence": 0.5}
    r = requests.post("https://api.elevenlabs.io/v1/sound-generation", headers={"xi-api-key": key}, json=body, timeout=180)
    if r.status_code != 200:
        print(name, "failed", r.status_code, r.text[:200])
        continue
    dst.write_bytes(r.content)
    print(name, len(r.content))
