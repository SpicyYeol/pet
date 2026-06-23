#!/usr/bin/env python3
"""
One-command runner for a single video:
1. Normalize DLC H5 (if needed)
2. Run Anatomical + Aggressive Rejection analysis
3. Save standardized output

This is the companion to batch_generate_dlc_probes.py for Phase 1 validation.
"""

import argparse
from pathlib import Path
import subprocess
import sys

def run_for_video(video_stem: str):
    base = Path("reports/rppg_pet_keypoints") / f"dlc_probe_{video_stem}"
    h5_pattern = list(base.glob("*_superanimal*.h5"))

    if not h5_pattern:
        print(f"No H5 found in {base}. Generate probe first.")
        return

    h5 = h5_pattern[0]
    normalized_csv = base / "pet_keypoints_normalized.csv"
    clip = base / f"{video_stem}_dlc_probe.mp4"

    print(f"\n=== Processing {video_stem} ===")

    # 1. Normalize if not done
    if not normalized_csv.exists():
        print("Normalizing H5...")
        cmd = [
            sys.executable,
            "tools/normalize_dlc_h5.py",
            "--h5", str(h5),
            "--video-name", f"{video_stem}.mp4",
            "--out", str(normalized_csv)
        ]
        subprocess.run(cmd, check=True)
    else:
        print("Normalized CSV already exists.")

    # 2. Run the rejection anatomical analysis
    out_dir = Path("reports/rppg_pet_keypoints") / f"anatomical_rejection_{video_stem}"
    out_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        sys.executable,
        "tools/demo_rejection_anatomical_video4.py",  # We can generalize this later
        # For now we'll call a more generic version if we extract the core
    ]
    print("Note: Full end-to-end runner is still being refined.")
    print(f"Manually run analysis using the latest demo script on {normalized_csv} + {clip}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("video_stem", help="e.g. 3, 7, 1 etc.")
    args = parser.parse_args()
    run_for_video(args.video_stem)
