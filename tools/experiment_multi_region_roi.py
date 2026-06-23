#!/usr/bin/env python3
"""
Experiment: Improving ROI strategy beyond single small patch.

Problem: Small patches (low pixel count) are very noise-prone, especially under motion/panting.

Ideas tested:
1. Multi-keypoint "region" extraction (e.g., throat_base + throat_end + neck_end as one region)
   → Effectively samples a larger, more stable anatomical area.
2. Multiple small disjoint patches per anatomical region + trace-level fusion (median / mean / PCA).

Compared against current best single-keypoint ROIs on videos 3 and 7.

Metrics: G-R variance after best preprocessing + downstream best BPM/SNR.
"""

from __future__ import annotations

from pathlib import Path
from typing import List, Dict

import cv2
import numpy as np
import pandas as pd
from scipy import signal

import sys
sys.path.insert(0, 'tools')
from evaluate_rppg_methods import METHOD_FUNCTIONS, estimate_bpm_from_signal

FS = 10.0
WIN = 200

# Current best single ROIs
SINGLE_ROIS = {
    "throat_exposed": {"kps": ["throat_base"], "radius": 22},
    "right_ear_base": {"kps": ["right_earbase"], "radius": 16},
    "muzzle_skin": {"kps": ["nose"], "radius": 13},
}

# Multi-keypoint region definitions (larger effective sampling area)
MULTI_REGION_ROIS = {
    "throat_region": {
        "kps": ["throat_base", "throat_end", "neck_end"],
        "radius": 20,   # slightly smaller per point but union covers more stable area
        "description": "throat_base + throat_end + neck_end"
    },
    "right_ear_region": {
        "kps": ["right_earbase", "right_earend"],
        "radius": 14,
        "description": "earbase + earend (inner ear area)"
    },
    "muzzle_region": {
        "kps": ["nose", "upper_jaw", "mouth_end_right"],
        "radius": 12,
        "description": "nose + upper_jaw + mouth corner"
    },
}

def get_keypoint_center(kps_df: pd.DataFrame, frame_idx: int, kp_names: List[str]) -> tuple[float, float] | None:
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(kp_names))]
    if len(row) == 0:
        return None
    return float(row["x"].mean()), float(row["y"].mean())

def load_probe(stem: str):
    base = Path("reports/rppg_pet_keypoints")
    for folder in [base / f"dlc_probe_{stem}_gpu", base / f"dlc_probe_{stem}"]:
        if folder.exists():
            kps_path = folder / "pet_keypoints_normalized.csv"
            clip_path = folder / f"{stem}_dlc_probe.mp4"
            if kps_path.exists() and clip_path.exists():
                kps = pd.read_csv(kps_path)
                cap = cv2.VideoCapture(str(clip_path))
                frames = []
                while True:
                    ok, f = cap.read()
                    if not ok:
                        break
                    frames.append(f)
                cap.release()
                return folder, kps, frames
    return None, None, None

def extract_rgb_multi_keypoint(frames, kps, kp_list: List[str], radius: int, start: int, win: int) -> np.ndarray:
    """Extract using multiple keypoints — centers are averaged per frame."""
    rgb_series = []
    for off in range(win):
        fi = start + off
        if fi >= len(frames):
            break
        centers = []
        for kp_name in kp_list:
            c = get_keypoint_center(kps, fi, [kp_name])
            if c is not None:
                centers.append(c)
        if not centers:
            rgb_series.append([np.nan, np.nan, np.nan])
            continue
        cx, cy = np.mean(centers, axis=0)
        h, w = frames[fi].shape[:2]
        x1, y1 = max(0, int(cx - radius)), max(0, int(cy - radius))
        x2, y2 = min(w, int(cx + radius)), min(h, int(cy + radius))
        crop = frames[fi][y1:y2, x1:x2]
        if crop.size == 0:
            rgb_series.append([np.nan, np.nan, np.nan])
        else:
            rgb_series.append(crop.mean(axis=(0, 1))[::-1].astype(float))
    arr = np.array(rgb_series)
    for c in range(3):
        col = pd.Series(arr[:, c])
        arr[:, c] = col.interpolate().ffill().bfill().to_numpy()
    return arr

def strong_cleaning(rgb: np.ndarray, proxy: np.ndarray, strength: float = 0.85) -> np.ndarray:
    gr = rgb[:, 1] - rgb[:, 0]
    if len(proxy) != len(gr) or proxy.std() < 1e-6:
        return rgb
    beta = np.cov(gr, proxy)[0, 1] / (np.var(proxy) + 1e-12)
    cleaned = gr - strength * beta * proxy
    p5, p95 = np.percentile(cleaned, [5, 95])
    cleaned = np.clip(cleaned, p5, p95)
    out = rgb.copy()
    out[:, 1] = out[:, 0] + cleaned
    return out

def get_best_bpm_snr(rgb: np.ndarray) -> tuple[float, float, str]:
    best_bpm, best_snr, best_name = 0., -np.inf, ""
    for name, fn in METHOD_FUNCTIONS.items():
        pulse = fn(rgb, FS, 70, 240)
        bpm, snr, _ = estimate_bpm_from_signal(pulse, FS, 70, 240)
        if snr > best_snr:
            best_snr = snr
            best_bpm = bpm
            best_name = name
    return best_bpm, best_snr, best_name

def main():
    for stem in ["3", "7"]:
        print(f"\n=== Multi-Region ROI Test: Video {stem} ===")
        probe = load_probe(stem)
        if probe[0] is None:
            print("  No probe data")
            continue
        folder, kps, frames = probe

        # Use a representative difficult window (start=0 has been used in previous bests)
        start = 0

        # Test 1: Single best keypoint (current style)
        # Test 2: Multi-keypoint region (larger effective area)
        tests = [
            ("Single throat_base", ["throat_base"], 22),
            ("Multi Throat Region", ["throat_base", "throat_end", "neck_end"], 20),
            ("Single right_earbase", ["right_earbase"], 16),
            ("Multi Right Ear Region", ["right_earbase", "right_earend"], 14),
        ]

        for name, kp_list, radius in tests:
            rgb = extract_rgb_multi_keypoint(frames, kps, kp_list, radius, start, WIN)
            gr_var = np.var(rgb[:,1] - rgb[:,0])
            print(f"\n{name} (radius={radius}):")
            print(f"  Raw G-R variance: {gr_var:.2f}")

            # Apply current best preprocessing (strong subtraction)
            gr = rgb[:,1] - rgb[:,0]
            proxy = signal.savgol_filter(gr, 11, 2)
            proxy = (proxy - proxy.mean()) / (proxy.std() + 1e-8)
            cleaned = strong_cleaning(rgb, proxy)

            cleaned_var = np.var(cleaned[:,1] - cleaned[:,0])
            print(f"  After strong subtraction G-R var: {cleaned_var:.2f}")

            bpm, snr, method = get_best_bpm_snr(cleaned)
            print(f"  Best after cleaning: {bpm:.1f} bpm (SNR {snr:.2f}) via {method}")

if __name__ == "__main__":
    main()