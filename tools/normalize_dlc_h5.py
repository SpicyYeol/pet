#!/usr/bin/env python3
"""
Simple wrapper to normalize a DeepLabCut SuperAnimal .h5 output
into the standard long-format CSV used by this project's anatomical ROI tools.

Usage (after DLC finishes):
    python tools/normalize_dlc_h5.py \
        --h5 reports/rppg_pet_keypoints/dlc_full4/4_dlc_probe_superanimal_....h5 \
        --video-name "4.mp4" \
        --out reports/rppg_pet_keypoints/dlc_full4/pet_keypoints_normalized.csv

The output CSV will have columns:
    video, time_sec, frame_index, keypoint, x, y, confidence, source
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd
import sys
from pathlib import Path

# Make it runnable directly even when not installed as a package
sys.path.insert(0, str(Path(__file__).resolve().parent))

from evaluate_pet_keypoint_readiness import normalize_dlc_keypoints


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--h5", type=Path, required=True, help="Path to the DLC .h5 file")
    parser.add_argument("--video-name", default="4.mp4", help="Logical video name to store in the CSV (e.g. 4.mp4)")
    parser.add_argument("--out", type=Path, required=True, help="Output normalized CSV path")
    args = parser.parse_args()

    print(f"[normalize] Reading DLC H5: {args.h5}")
    normalized = normalize_dlc_keypoints(args.h5)

    if normalized.empty:
        raise RuntimeError("Normalization produced empty DataFrame — check the H5 file.")

    # Override video name to the logical source video
    normalized["video"] = args.video_name

    args.out.parent.mkdir(parents=True, exist_ok=True)
    normalized.to_csv(args.out, index=False)

    print(f"[normalize] Wrote {len(normalized)} rows to {args.out}")
    print(f"         Unique keypoints: {normalized['keypoint'].nunique()}")
    print(f"         Frames: {normalized['frame_index'].nunique()}")
    print(f"         Median confidence: {normalized['confidence'].median():.3f}")


if __name__ == "__main__":
    main()
