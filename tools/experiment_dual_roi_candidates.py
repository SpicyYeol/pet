#!/usr/bin/env python3
"""
Dual-Candidate ROI Experiment (Single + Multi-patch in one run)

Implements the design from the latest diagnostic:

- For the key anatomical zones, we extract BOTH the traditional single-keypoint-centered patch
  AND the new multi-patch averaged version.
- Each candidate is tagged with `roi_family` ("single" or "multi") and `base_name`.
- Extra quality signals are recorded:
    - post_clean_gr_var (after A+B)
    - peak_bpm (from the best method for that candidate)
    - peak_distance_from_100
    - effective_pixel_mean

This data feeds a much more powerful downstream scoring / smart selection that can decide,
per video and per anatomical zone, whether the merged version or the tight single patch is superior.

No forcing of merge. Both families compete fairly.

Run example:
    python tools/experiment_dual_roi_candidates.py --stems 6,3,7 --apply-ab

Output goes to reports/rppg_pet_keypoints/dual_roi_candidates/
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import List, Dict, Tuple

import cv2
import numpy as np
import pandas as pd

import sys
sys.path.insert(0, 'tools')
from evaluate_rppg_methods import METHOD_FUNCTIONS, estimate_bpm_from_signal

# Reuse helpers from the multi-area experiment (they are already good)
from experiment_multi_area_roi_improved import (
    load_probe, get_keypoint_center, extract_rgb_single_center,
    strong_panting_subtraction, periodicity_reinforcement, FS, WIN
)

# The two families we want to compare fairly
SINGLE_FAMILY = {
    "throat_exposed": {"kps": ["throat_base", "throat_end"], "radius": 22},
    "right_ear_base": {"kps": ["right_earbase"], "radius": 16},
    "left_ear_base": {"kps": ["left_earbase"], "radius": 16},
    "muzzle_skin": {"kps": ["nose", "upper_jaw"], "radius": 13},
    "nose_bridge": {"kps": ["nose", "upper_jaw"], "radius": 18},
}

MULTI_FAMILY = {
    "throat_area": {
        "patches": [
            {"kps": ["throat_base", "throat_end"], "radius": 20},
            {"kps": ["neck", "throat_end"], "radius": 18},
        ]
    },
    "ear_area_right": {
        "patches": [
            {"kps": ["right_earbase"], "radius": 15},
            {"kps": ["right_earend"], "radius": 12},
        ]
    },
    "ear_area_left": {
        "patches": [
            {"kps": ["left_earbase"], "radius": 15},
            {"kps": ["left_earend"], "radius": 12},
        ]
    },
    "muzzle_area": {
        "patches": [
            {"kps": ["nose", "upper_jaw"], "radius": 12},
            {"kps": ["upper_jaw", "mouth_end_right"], "radius": 10},
        ]
    },
}


def get_best_bpm_snr(rgb: np.ndarray) -> Tuple[float, float, str, float]:
    """Return best BPM, SNR, method, and also the post-clean G-R variance for this candidate."""
    best_bpm, best_snr, best_name = 0., -np.inf, ""
    gr = rgb[:, 1] - rgb[:, 0]
    post_clean_var = float(np.var(gr))

    for name, fn in METHOD_FUNCTIONS.items():
        try:
            pulse = fn(rgb, FS, 70, 240)
            bpm, snr, _ = estimate_bpm_from_signal(pulse, FS, 70, 240)
            if snr > best_snr:
                best_snr = snr
                best_bpm = bpm
                best_name = name
        except Exception:
            continue
    return best_bpm, best_snr, best_name, post_clean_var


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stems", default="6,3,7")
    parser.add_argument("--apply-ab", action="store_true")
    args = parser.parse_args()

    stems = [s.strip() for s in args.stems.split(",")]
    out_dir = Path("reports/rppg_pet_keypoints/dual_roi_candidates")
    out_dir.mkdir(parents=True, exist_ok=True)

    all_rows = []

    for stem in stems:
        print(f"\n=== Dual-candidate extraction for Video {stem} (A+B={args.apply_ab}) ===")
        probe = load_probe(stem)
        if probe[0] is None:
            print("  No probe")
            continue
        folder, kps, frames = probe

        # Use first 20s for consistency with previous experiments
        start = 0

        proxy = None
        if args.apply_ab:
            from experiment_multi_area_roi_improved import compute_panting_proxy_simple
            proxy = compute_panting_proxy_simple(kps, start, WIN)

        # Extract all single-family candidates
        for name, spec in SINGLE_FAMILY.items():
            rgb, pstats = extract_rgb_single_center(frames, kps, spec["kps"], spec["radius"], start, WIN)
            if args.apply_ab and proxy is not None:
                rgb = strong_panting_subtraction(rgb, proxy, 0.85)
                rgb[:, 1] = periodicity_reinforcement(rgb[:, 1])

            bpm, snr, method, post_var = get_best_bpm_snr(rgb)
            dist_100 = abs(bpm - 100)

            all_rows.append({
                "video": stem,
                "roi_family": "single",
                "base_name": name,
                "full_name": f"{name}_single",
                "pixel_mean": round(pstats["pixel_mean"], 1),
                "post_clean_gr_var": round(post_var, 2),
                "best_bpm": round(bpm, 1),
                "best_snr": round(snr, 2),
                "best_method": method,
                "peak_dist_from_100": round(dist_100, 1),
                "apply_ab": args.apply_ab,
            })

        # Extract all multi-patch family candidates
        for name, area in MULTI_FAMILY.items():
            from experiment_multi_area_roi_improved import extract_rgb_multi_patch
            rgb, pstats = extract_rgb_multi_patch(frames, kps, area["patches"], start, WIN)
            if args.apply_ab and proxy is not None:
                rgb = strong_panting_subtraction(rgb, proxy, 0.85)
                rgb[:, 1] = periodicity_reinforcement(rgb[:, 1])

            bpm, snr, method, post_var = get_best_bpm_snr(rgb)
            dist_100 = abs(bpm - 100)

            all_rows.append({
                "video": stem,
                "roi_family": "multi",
                "base_name": name,
                "full_name": f"{name}_multi",
                "pixel_mean": round(pstats["pixel_mean"], 1),
                "post_clean_gr_var": round(post_var, 2),
                "best_bpm": round(bpm, 1),
                "best_snr": round(snr, 2),
                "best_method": method,
                "peak_dist_from_100": round(dist_100, 1),
                "apply_ab": args.apply_ab,
            })

    df = pd.DataFrame(all_rows)
    out_csv = out_dir / "dual_roi_candidates_results.csv"
    df.to_csv(out_csv, index=False)
    print(f"\nSaved richer dual-candidate results: {out_csv}")
    print("Columns now include: roi_family, base_name, post_clean_gr_var, peak_dist_from_100")
    print("This data is ready for a scoring function that can intelligently prefer single vs merged per video/zone.")


if __name__ == "__main__":
    main()