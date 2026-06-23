#!/usr/bin/env python3
"""
Head-to-head comparison of advanced time-domain methods:

1. Patch-level stabilization using keypoint motion (before RGB averaging)
2. Normalized LMS (NLMS) adaptive filtering for panting proxy subtraction

Compared against:
- No stabilization + strong linear subtraction (current best)

Tested on videos 3 and 7 using the best windows from latest rejection results.

Metrics:
- G-R variance after preprocessing (lower = cleaner raw trace)
- Best BPM and SNR across the 6 standard rPPG methods on the preprocessed trace

This directly tests whether these techniques meaningfully improve the weak cardiac signal
in the presence of strong low-frequency artifacts.
"""

from __future__ import annotations

from pathlib import Path
from typing import Dict, Tuple

import cv2
import numpy as np
import pandas as pd
from scipy import signal

import sys
sys.path.insert(0, 'tools')
from evaluate_rppg_methods import METHOD_FUNCTIONS, estimate_bpm_from_signal

FS = 10.0
WIN = 200

ANATOMICAL_ROIS = {
    "throat_exposed": {"kps": ["throat_base", "throat_end"], "radius": 22},
    "right_ear_base": {"kps": ["right_earbase"], "radius": 16},
    "muzzle_skin": {"kps": ["nose", "upper_jaw"], "radius": 13},
    "nose_bridge": {"kps": ["nose", "upper_jaw"], "radius": 18},
}

def get_keypoint_center(kps_df: pd.DataFrame, frame_idx: int, kp_names: list[str]) -> tuple[float, float] | None:
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

def load_best_window(stem: str) -> Dict | None:
    base = Path("reports/rppg_pet_keypoints")
    candidates = list(base.glob(f"dlc_probe_{stem}*"))
    candidates += list(base.glob(f"dlc_probe_{stem}*analysis*"))
    if stem == "4":
        candidates += [base / "dlc_full4_roi_analysis_v2"]

    csvs = []
    for c in candidates:
        for p in c.rglob("rejection_anatomical_results.csv"):
            csvs.append(p)
    if not csvs:
        return None
    csvs.sort(key=lambda p: -p.stat().st_mtime)
    df = pd.read_csv(csvs[0])
    if df.empty:
        return None
    best_idx = df["snr"].idxmax()
    row = df.loc[best_idx].to_dict()
    return row

def extract_original_rgb(frames, kps, roi_spec, start_frame: int, win_len: int) -> np.ndarray:
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
    arr = np.array(rgb_series)
    for c in range(3):
        col = pd.Series(arr[:, c])
        arr[:, c] = col.interpolate().ffill().bfill().to_numpy()
    return arr

def extract_stabilized_rgb(frames, kps, roi_spec, start_frame: int, win_len: int) -> np.ndarray:
    """
    Patch-level stabilization:
    Use keypoint center at the first frame of the window as reference.
    For each subsequent frame, shift the extraction location to compensate for keypoint movement.
    This keeps the physical anatomical region more consistent across frames.
    """
    rgb_series = []
    ref_center = get_keypoint_center(kps, start_frame, roi_spec["kps"])
    if ref_center is None:
        return extract_original_rgb(frames, kps, roi_spec, start_frame, win_len)

    for offset in range(win_len):
        fi = start_frame + offset
        if fi >= len(frames):
            break
        curr_center = get_keypoint_center(kps, fi, roi_spec["kps"])
        if curr_center is None:
            rgb_series.append([np.nan, np.nan, np.nan])
            continue

        # Delta to compensate (negative to follow the anatomy)
        dx = curr_center[0] - ref_center[0]
        dy = curr_center[1] - ref_center[1]

        cx = ref_center[0] - dx
        cy = ref_center[1] - dy

        r = roi_spec["radius"]
        h, w = frames[fi].shape[:2]
        x1, y1 = max(0, int(cx - r)), max(0, int(cy - r))
        x2, y2 = min(w, int(cx + r)), min(h, int(cy + r))
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

def strong_linear_subtraction(rgb: np.ndarray, proxy: np.ndarray, strength: float = 0.85) -> np.ndarray:
    """Current best linear subtraction."""
    gr = rgb[:, 1] - rgb[:, 0]
    if len(proxy) != len(gr) or proxy.std() < 1e-6:
        return rgb
    beta = np.cov(gr, proxy)[0, 1] / (np.var(proxy) + 1e-12)
    cleaned_gr = gr - strength * beta * proxy
    p5, p95 = np.percentile(cleaned_gr, [5, 95])
    cleaned_gr = np.clip(cleaned_gr, p5, p95)
    out = rgb.copy()
    out[:, 1] = out[:, 0] + cleaned_gr
    return out

def normalized_lms_subtraction(signal: np.ndarray, reference: np.ndarray, mu: float = 0.05, order: int = 5) -> np.ndarray:
    """
    Normalized LMS adaptive filter.
    More stable than basic LMS. Uses the proxy as reference noise.
    """
    n = len(signal)
    w = np.zeros(order)
    y = np.zeros(n)
    for i in range(order, n):
        x = reference[i-order:i][::-1]
        x_norm = np.dot(x, x) + 1e-8
        y[i] = np.dot(w, x)
        e = signal[i] - y[i]
        w = w + (mu / x_norm) * e * x
    # Fill initial part
    for i in range(order):
        x = reference[max(0, i-order):i+1][::-1]
        if len(x) == order:
            y[i] = np.dot(w, x)
    output = signal - y
    return output

def compute_gr_variance(rgb: np.ndarray) -> float:
    gr = rgb[:, 1] - rgb[:, 0]
    return float(np.var(gr))

def get_best_bpm_snr(rgb: np.ndarray) -> Tuple[float, float, str]:
    """Run all 6 methods and return the best (BPM, SNR, method)."""
    best_bpm, best_snr, best_method = 0.0, -np.inf, ""
    for name, fn in METHOD_FUNCTIONS.items():
        pulse = fn(rgb, FS, 70, 240)
        bpm, snr, _ = estimate_bpm_from_signal(pulse, FS, 70, 240)
        if snr > best_snr:
            best_snr = snr
            best_bpm = bpm
            best_method = name
    return best_bpm, best_snr, best_method

def main():
    for stem in ["3", "7"]:
        print(f"\n=== Advanced Time-Domain Comparison on Video {stem} ===")

        best = load_best_window(stem)
        if best is None:
            print("  No best window info")
            continue

        roi_name = best.get("roi", "nose_bridge")
        start = int(best.get("start_frame", 0))
        spec = ANATOMICAL_ROIS.get(roi_name, ANATOMICAL_ROIS["nose_bridge"])

        folder, kps, frames = load_probe(stem)
        if frames is None:
            print("  No probe data")
            continue

        # Original extraction
        raw_orig = extract_original_rgb(frames, kps, spec, start, WIN)

        # Stabilized extraction
        raw_stab = extract_stabilized_rgb(frames, kps, spec, start, WIN)

        print(f"  ROI: {roi_name}, Window start: {start}")
        print(f"  Original raw G-R var : {compute_gr_variance(raw_orig):8.2f}")
        print(f"  Stabilized raw G-R var: {compute_gr_variance(raw_stab):8.2f}")

        # Apply current best subtraction on both
        # (We approximate proxy from the trace for this comparison)
        gr_orig = raw_orig[:, 1] - raw_orig[:, 0]
        proxy_orig = signal.savgol_filter(gr_orig, 11, 2)
        proxy_orig = (proxy_orig - proxy_orig.mean()) / (proxy_orig.std() + 1e-8)

        cleaned_orig = strong_linear_subtraction(raw_orig, proxy_orig)
        cleaned_stab = strong_linear_subtraction(raw_stab, proxy_orig)  # use same proxy for fair comparison

        print(f"  After strong sub on original : {compute_gr_variance(cleaned_orig):8.2f}")
        print(f"  After strong sub on stabilized: {compute_gr_variance(cleaned_stab):8.2f}")

        # Downstream
        bpm_o, snr_o, m_o = get_best_bpm_snr(cleaned_orig)
        bpm_s, snr_s, m_s = get_best_bpm_snr(cleaned_stab)
        print(f"  Best after sub (original)  : {bpm_o:6.1f} bpm (SNR {snr_o:5.2f}) via {m_o}")
        print(f"  Best after sub (stabilized): {bpm_s:6.1f} bpm (SNR {snr_s:5.2f}) via {m_s}")

        # Try NLMS on the stabilized trace (more sophisticated ANC)
        gr_stab = raw_stab[:, 1] - raw_stab[:, 0]
        proxy_for_anc = signal.savgol_filter(gr_stab, 11, 2)
        proxy_for_anc = (proxy_for_anc - proxy_for_anc.mean()) / (proxy_for_anc.std() + 1e-8)

        anc_output = normalized_lms_subtraction(gr_stab, proxy_for_anc, mu=0.03, order=6)
        anc_rgb = raw_stab.copy()
        anc_rgb[:, 1] = raw_stab[:, 0] + anc_output

        var_anc = compute_gr_variance(anc_rgb)
        bpm_anc, snr_anc, m_anc = get_best_bpm_snr(anc_rgb)
        print(f"  After NLMS on stabilized   : {var_anc:8.2f}  |  {bpm_anc:6.1f} bpm (SNR {snr_anc:5.2f}) via {m_anc}")

if __name__ == "__main__":
    main()