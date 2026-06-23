#!/usr/bin/env python3
"""
General-purpose script to run Anatomical + Rejection analysis on any video
that has a normalized DLC keypoint CSV and the corresponding clip.

Usage after a probe finishes:
    python tools/analyze_anatomical_rejection.py --video-stem 3 --aggressive
"""

import argparse
from pathlib import Path

# We will call the core logic from the demo script.
# For cleanliness, in a real refactor we would move the core function out.
# For now, we exec the logic with parameters.

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video-stem", required=True, help="e.g. 3, 4, 7, 1")
    parser.add_argument("--aggressive", action="store_true", help="Use tighter rejection thresholds")
    args = parser.parse_args()

    stem = args.video_stem
    base = Path(f"reports/rppg_pet_keypoints/dlc_probe_{stem}")

    keypoints_csv = base / "pet_keypoints_normalized.csv"
    clip = base / f"{stem}_dlc_probe.mp4"

    if not keypoints_csv.exists() or not clip.exists():
        print(f"Missing files for {stem}. Expected:")
        print(f"  {keypoints_csv}")
        print(f"  {clip}")
        return

    print(f"=== Running Anatomical + Rejection analysis for {stem} ===")
    print(f"Keypoints: {keypoints_csv}")
    print(f"Clip:      {clip}")

    # For now, we call the existing (slightly generalized) demo script
    # In the future this will be a clean function call.
    import subprocess
    import sys

    cmd = [
        sys.executable,
        "tools/demo_rejection_anatomical_video4.py",
        "--video-stem", stem,
    ]
    if args.aggressive:
        cmd.append("--aggressive")

    print("Running:", " ".join(cmd))
    subprocess.run(cmd)

if __name__ == "__main__":
    main()
