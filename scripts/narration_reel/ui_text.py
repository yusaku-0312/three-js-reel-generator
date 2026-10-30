"""Print the narration exactly as it goes into the ElevenLabs Text to Speech editor: one line per
narration line, each starting with the tag ([narrative]). With script.json "parts", each part is printed
(and generated) separately. Writes projects/<name>/ui_text.txt (all) and ui_text_part<K>.txt.

Usage: .venv/bin/python scripts/narration_reel/ui_text.py <name>
"""
import sys

from common import load_script, parts, project_dir, ui_lines


def main() -> None:
    proj = project_dir(sys.argv[1])
    script = load_script(proj)
    lines = ui_lines(script)
    (proj / "ui_text.txt").write_text("\n".join(lines) + "\n")
    print(f"# {script['model_name']} / {script['voice_name']} / speed {script['speed']}x applied after download")
    groups = parts(script)
    for k, ids in enumerate(groups, 1):
        part = ui_lines(script, ids)
        if len(groups) > 1:
            (proj / f"ui_text_part{k}.txt").write_text("\n".join(part) + "\n")
            print(f"\n## part {k} ({', '.join(ids)}): {sum(len(l) for l in part)} characters, {len(part)} lines")
        print("\n".join(part))
    print(f"\n# {sum(len(l) for l in lines)} characters, {len(lines)} lines, {len(groups)} part(s)")


if __name__ == "__main__":
    main()
