#!/usr/bin/env python3
"""
Prototype for A + B:
- B: New DogThinFurROIs focused on thinner fur / exposed skin areas using real SuperAnimal keypoints.
- A: Simple panting artifact subtraction using mouth opening proxy before extracting raw traces.

Goal: Improve raw RGB trace quality (reduce 100bpm artifact dominance) for high-HR videos like 3 and 7.

This is an early experiment script. Run on specific videos and compare raw spectra.

Usage:
    python tools/prototype_dog_aware_traces.py --stem 3,7
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy import signal

# ============================================================
# B (focused): Promising Dog Thin-Fur + good performers from previous run
# ============================================================
FOCUSED_DOG_ROIS = {
    # Strong performer on video 3
    "throat_exposed": {"kps": ["throat_base", "throat_end"], "radius": 22},

    # Good improvement with panting subtraction on video 7
    "right_ear_base": {"kps": ["right_earbase"], "radius": 16},
    "left_ear_base": {"kps": ["left_earbase"], "radius": 16},

    # Muzzle skin (exposed area)
    "muzzle_skin": {"kps": ["nose", "upper_jaw"], "radius": 13},

    # Original strong baseline for comparison
    "nose_bridge": {"kps": ["nose", "upper_jaw"], "radius": 18},
}


def get_keypoint_center(kps_df: pd.DataFrame, frame_idx: int, kp_names: List[str]) -> Tuple[float, float] | None:
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(kp_names))]
    if len(row) == 0:
        return None
    return float(row["x"].mean()), float(row["y"].mean())


def compute_panting_proxy(kps_df: pd.DataFrame, frame_indices: List[int], smooth_window: int = 5) -> np.ndarray:
    """
    A (improved): Stronger panting proxy for dogs.
    Combines:
    - Mouth vertical opening (upper_jaw vs lower_jaw)
    - Mouth lateral spread (mouth_end_left vs mouth_end_right)
    - Secondary: ear base movement as mild breathing/panting indicator
    Applies light temporal smoothing.
    """
    proxies = []
    for fi in frame_indices:
        upper = get_keypoint_center(kps_df, fi, ["upper_jaw"])
        lower = get_keypoint_center(kps_df, fi, ["lower_jaw"])
        left_m = get_keypoint_center(kps_df, fi, ["mouth_end_left"])
        right_m = get_keypoint_center(kps_df, fi, ["mouth_end_right"])
        r_ear = get_keypoint_center(kps_df, fi, ["right_earbase"])
        l_ear = get_keypoint_center(kps_df, fi, ["left_earbase"])

        vertical = 0.0
        if upper and lower:
            vertical = abs(upper[1] - lower[1])

        lateral = 0.0
        if left_m and right_m:
            lateral = abs(left_m[0] - right_m[0])

        ear_motion = 0.0
        if r_ear and l_ear:
            # crude proxy for breathing-related head/ear movement
            ear_motion = abs(r_ear[1] - l_ear[1]) * 0.3

        proxy = vertical * 0.55 + lateral * 0.35 + ear_motion * 0.10
        proxies.append(proxy)

    arr = np.array(proxies, dtype=float)

    # Light temporal smoothing (moving average) - very dog panting is rhythmic
    if len(arr) > smooth_window and smooth_window > 1:
        kernel = np.ones(smooth_window) / smooth_window
        arr = np.convolve(arr, kernel, mode="same")

    # Normalize for the window
    if arr.std() > 1e-6:
        arr = (arr - arr.mean()) / (arr.std() + 1e-8)
    return arr


def extract_raw_rgb_with_optional_subtraction(
    frames: List[np.ndarray],
    kps: pd.DataFrame,
    roi_spec: dict,
    start_frame: int,
    win_len: int,
    panting_proxy: np.ndarray | None = None,
    subtract_strength: float = 0.6
) -> np.ndarray:
    """
    Extract raw RGB patch means.
    If panting_proxy is given, perform simple regression subtraction on the G-R channel
    (very basic version of A: remove linear component correlated with panting).
    """
    rgb_series = []
    for offset in range(win_len):
        fi = start_frame + offset
        if fi >= len(frames):
            break
        center = get_keypoint_center(kps, fi, roi_spec["kps"])
        if center is None:
            rgb_series.append([np.nan, np.nan, np.nan])
            continue

        cx, cy = center
        r = roi_spec["radius"]
        h, w = frames[fi].shape[:2]
        x1, y1 = max(0, int(cx - r)), max(0, int(cy - r))
        x2, y2 = min(w, int(cx + r)), min(h, int(cy + r))
        crop = frames[fi][y1:y2, x1:x2]
        if crop.size == 0:
            rgb_series.append([np.nan, np.nan, np.nan])
        else:
            rgb_series.append(crop.mean(axis=(0, 1))[::-1].astype(float))

    rgb = np.array(rgb_series)

    # Simple interpolation
    for c in range(3):
        col = pd.Series(rgb[:, c])
        rgb[:, c] = col.interpolate().ffill().bfill().to_numpy()

    # A: Very simple panting subtraction on G-R (the channel we often care about most)
    if panting_proxy is not None and len(panting_proxy) == len(rgb):
        gr = rgb[:, 1] - rgb[:, 0]
        # Linear regression: gr ~ panting_proxy
        p = panting_proxy
        if p.std() > 1e-6:
            beta = np.cov(gr, p)[0, 1] / (np.var(p) + 1e-12)
            subtracted = gr - subtract_strength * beta * p
            # Put the cleaned signal back into a synthetic G-R (keep R and B for now)
            rgb[:, 1] = rgb[:, 0] + subtracted   # reconstruct approximate G from cleaned G-R

    return rgb


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stem", default="all", help="Comma-separated or 'all'")
    args = parser.parse_args()

    if args.stem.lower() == "all":
        stems = ["1", "3", "4", "5", "6", "7", "8"]
    else:
        stems = [s.strip() for s in args.stem.split(",")]

    fs = 10.0
    win = 200
    all_rois = FOCUSED_DOG_ROIS

    results = []

    for stem in stems:
        print(f"\n=== Dog-aware (A+B) on video {stem} ===")

        base = Path("reports/rppg_pet_keypoints")
        probe = base / f"dlc_probe_{stem}_gpu"
        if not probe.exists():
            probe = base / f"dlc_probe_{stem}"
        if not probe.exists():
            print("  Probe not found")
            continue

        kps = pd.read_csv(probe / "pet_keypoints_normalized.csv")
        clip_path = probe / f"{stem}_dlc_probe.mp4"

        cap = cv2.VideoCapture(str(clip_path))
        frames = []
        while True:
            ok, f = cap.read()
            if not ok: break
            frames.append(f)
        cap.release()

        start = 0
        frame_indices = list(range(start, start + win))

        panting = compute_panting_proxy(kps, frame_indices, smooth_window=5)
        print(f"  Improved panting proxy (std={panting.std():.3f})")

        for roi_name, spec in all_rois.items():
            raw_no = extract_raw_rgb_with_optional_subtraction(frames, kps, spec, start, win, None, 0.0)
            raw_sub = extract_raw_rgb_with_optional_subtraction(frames, kps, spec, start, win, panting, 0.65)

            gr_no = raw_no[:, 1] - raw_no[:, 0]
            gr_sub = raw_sub[:, 1] - raw_sub[:, 0]

            var_no = float(np.var(gr_no))
            var_sub = float(np.var(gr_sub))
            reduction = 100 * (1 - var_sub / (var_no + 1e-12))

            print(f"  {roi_name:16s} | NoSub={var_no:7.1f} → Sub={var_sub:7.1f} ({reduction:+5.1f}%)")

            results.append({
                "video": stem,
                "roi": roi_name,
                "var_no_sub": round(var_no, 1),
                "var_with_sub": round(var_sub, 1),
                "reduction_pct": round(reduction, 1),
            })

    # Summary table
    df = pd.DataFrame(results)
    print("\n" + "="*70)
    print("A + B PROTOTYPE SUMMARY (Raw trace quality - lower variance is better)")
    print("="*70)
    print(df.to_string(index=False))

    out_dir = Path("reports/rppg_pet_keypoints/dog_aware_prototype")
    out_dir.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_dir / "a_plus_b_raw_trace_summary.csv", index=False)
    print(f"\nSummary saved to {out_dir / 'a_plus_b_raw_trace_summary.csv'}")


if __name__ == "__main__":
    main()
