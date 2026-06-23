#!/usr/bin/env python3
"""
One-command analysis tool for a single video after DLC probe is ready.

Usage:
    python tools/analyze_video.py --stem 3 --aggressive
    python tools/analyze_video.py --stem 7
"""

import argparse
import subprocess
import sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Run full Anatomical + Rejection analysis on a video")
    parser.add_argument("--stem", required=True, help="Video stem, e.g. 3, 4, 7")
    parser.add_argument("--aggressive", action="store_true", help="Use tighter rejection thresholds")
    parser.add_argument("--dog_aware", action="store_true", help="Use dog thin-fur ROIs + panting preprocessing (A+B)")
    parser.add_argument("--relax_rejection", action="store_true", help="Use relaxed rejection thresholds for dog_aware preprocessing")
    parser.add_argument("--multi_area", action="store_true", help="Use multi-patch ROIs (higher pixel stability)")
    parser.add_argument("--force-normalize", action="store_true", help="Force re-normalization of H5")
    args = parser.parse_args()

    stem = args.stem

    # Support GPU probe folders (_gpu suffix) and full4 special case
    base_dir = Path(f"reports/rppg_pet_keypoints/dlc_probe_{stem}_gpu")
    if not base_dir.exists():
        base_dir = Path(f"reports/rppg_pet_keypoints/dlc_probe_{stem}")
    if not base_dir.exists() and stem == "4":
        base_dir = Path("reports/rppg_pet_keypoints/dlc_full4")
    if not base_dir.exists():
        print(f"ERROR: No probe folder found for {stem} (tried _gpu and normal)")
        sys.exit(1)

    # Find the H5
    h5_files = list(base_dir.glob("*_superanimal*.h5"))
    if not h5_files:
        print(f"ERROR: No H5 file found in {base_dir}")
        sys.exit(1)

    h5_path = h5_files[0]
    normalized_csv = base_dir / "pet_keypoints_normalized.csv"
    clip_path = base_dir / f"{stem}_dlc_probe.mp4"

    print(f"=== Analyzing {stem} ===")
    print(f"H5: {h5_path}")

    # Step 1: Normalize if needed
    if args.force_normalize or not normalized_csv.exists():
        print("\n[1/2] Normalizing H5...")
        cmd = [
            sys.executable,
            "tools/normalize_dlc_h5.py",
            "--h5", str(h5_path),
            "--video-name", f"{stem}.mp4",
            "--out", str(normalized_csv)
        ]
        subprocess.run(cmd, check=True)
    else:
        print("\n[1/2] Normalized CSV already exists. Skipping normalization.")

    if not clip_path.exists():
        print(f"ERROR: Clip not found: {clip_path}")
        sys.exit(1)

    # Step 2: Run the rejection anatomical analysis
    print("\n[2/2] Running Anatomical + Rejection analysis...")
    analysis_cmd = [
        sys.executable,
        "tools/demo_rejection_anatomical_video4.py",
        "--video-stem", stem,
    ]
    if args.aggressive:
        analysis_cmd.append("--aggressive")
    if args.dog_aware:
        analysis_cmd.append("--dog_aware")
    if args.multi_area:
        analysis_cmd.append("--multi_area")
    if args.relax_rejection:
        analysis_cmd.append("--relax_rejection")

    subprocess.run(analysis_cmd, check=True)

    print(f"\n[Done] Analysis complete for {stem}.")
    print(f"Results saved under: reports/rppg_pet_keypoints/dlc_probe_{stem}_analysis*/")

if __name__ == "__main__":
    main()
