"""Find a camera for a 9:16 shot by brute force instead of guessing: every listed world point must land inside
the screen box (default x 140–940, y range given), and the shot that spreads them tallest wins. Same
projection as golden2/shot.ts project2 (fov 30 vertical, 1080x1920, camera on the z axis looking at -z).

Usage: python3 scripts/narration_reel/cam_search.py '{"pts": {"tinTop": [0,1.1,0.75], "base": [0,0,1.15]},
         "y": [520, 1080], "z0": 0.2, "x": 0}'
Prints the best three as (spread, distance, camera y, target y, screen points); use
pos [x, camera y, z0 + distance], target [x, target y, z0].
"""
import json
import math
import sys

W, H = 1080, 1920


def project(pos, target, fov, p):
    f = [target[i] - pos[i] for i in range(3)]
    n = math.sqrt(sum(v * v for v in f))
    f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]  # f × up(0,1,0)
    n = math.sqrt(sum(v * v for v in r))
    r = [v / n for v in r]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [p[i] - pos[i] for i in range(3)]
    z = sum(d[i] * f[i] for i in range(3))
    t = math.tan(math.radians(fov) / 2)
    x = sum(d[i] * r[i] for i in range(3)) / z / (t * W / H)
    y = sum(d[i] * u[i] for i in range(3)) / z / t
    return round(W / 2 + x * W / 2), round(H / 2 - y * H / 2)


def main() -> None:
    c = json.loads(sys.argv[1])
    xmin, xmax = c.get("xs", [140, 940])
    cx = c.get("x", 0)
    found = []
    for dist in [v / 10 for v in range(55, 130, 3)]:
        for elev in [v / 10 for v in range(15, 55, 3)]:
            for ty in [v / 20 for v in range(-14, 24)]:
                pos, tgt = [cx, elev, c["z0"] + dist], [cx, ty, c["z0"]]
                pr = {k: project(pos, tgt, c.get("fov", 30), v) for k, v in c["pts"].items()}
                xs = [p[0] for p in pr.values()]
                ys = [p[1] for p in pr.values()]
                if min(ys) < c["y"][0] or max(ys) > c["y"][1] or min(xs) < xmin or max(xs) > xmax:
                    continue
                found.append((max(ys) - min(ys), dist, elev, ty, pr))
    found.sort(key=lambda s: s[0], reverse=True)
    for s in found[:3]:
        print(s)
    if not found:
        print("no camera fits; widen the y range or move the points")


if __name__ == "__main__":
    main()
