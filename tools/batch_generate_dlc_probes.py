#!/usr/bin/env python3
"""
Batch generator for consistent short DLC probes optimized for anatomical rPPG analysis.

Recommended for Phase 1 validation across all usable videos.
"""

import argparse
import subprocess
from pathlib import Path

USABLE_VIDEOS = ["1.mp4", "3.mp4", "4.mp4", "5.mp4", "6.mp4", "7.mp4", "8.mp4"]

def generate_probe(video_name: str, seconds: float = 30, fps: float = 10, max_width: int = 640):
    video_path = Path("dataset_front") / video_name
    out_dir = Path("reports/rppg_pet_keypoints") / f"dlc_probe_{video_name.replace('.mp4','')}"

    cmd = [
        ".\\.venv-keypoint\\Scripts\\python.exe",
        "tools\\run_deeplabcut_probe.py",
        "--video", str(video_path),
        "--out-dir", str(out_dir),
        "--seconds", str(seconds),
        "--start-sec", "0",
        "--max-width", str(max_width),
        "--fps", str(fps),
        "--device", "cpu"
    ]

    print(f"\n=== Generating probe for {video_name} ===")
    print("Command:", " ".join(cmd))

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(result.stdout[-2000:] if result.stdout else "No stdout")
    except subprocess.CalledProcessError as e:
        print("FAILED")
        print(e.stdout[-1500:] if e.stdout else "")
        print(e.stderr[-1500:] if e.stderr else "")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--videos", nargs="+", default=USABLE_VIDEOS,
                        help="Which videos to process (default: all usable)")
    parser.add_argument("--seconds", type=float, default=30)
    parser.add_argument("--fps", type=float, default=10)
    args = parser.parse_args()

    for v in args.videos:
        generate_probe(v, seconds=args.seconds, fps=args.fps)
