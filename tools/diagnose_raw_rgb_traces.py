#!/usr/bin/env python3
"""
Diagnostic: Plot RAW RGB traces (before ANY rPPG method) from the best anatomical ROI windows.

This directly addresses the user's question:
"waveform quality가 rejection 이전 단계부터 문제인가?"

For the top SNR window per video (from the existing rejection_anatomical_results.csv),
we extract only the raw per-frame RGB mean patch values using the keypoints.
No green, no chrom, no POS, no ICA, no detrending inside rPPG methods.

Focus: problematic videos 3 and 7 (and optionally good ones like 1, 6 for comparison).

Usage:
    python tools/diagnose_raw_rgb_traces.py --stem 3,7
    python tools/diagnose_raw_rgb_traces.py --stem all
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy import signal

# Same anatomical ROIs used throughout the project
ANATOMICAL_ROIS = {
    "neck": {"kps": ["neck", "throat"], "radius": 28},
    "nose_bridge": {"kps": ["nose", "upper_jaw"], "radius": 18},
    "left_ear_base": {"kps": ["left_earbase"], "radius": 16},
    "right_ear_base": {"kps": ["right_earbase"], "radius": 16},
    "upper_chest": {"kps": ["neck", "withers"], "radius": 30},
}


def get_keypoint_center(kps_df: pd.DataFrame, frame_idx: int, kp_names: List[str]) -> Tuple[float, float] | None:
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(kp_names))]
    if len(row) == 0:
        return None
    return float(row["x"].mean()), float(row["y"].mean())


def extract_raw_rgb_series(
    frames: List[np.ndarray], 
    kps: pd.DataFrame, 
    roi_spec: dict, 
    start_frame: int, 
    win_len: int = 200
) -> np.ndarray:
    """Return (win_len, 3) raw RGB means for the exact window. No rPPG method applied."""
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
        x1 = max(0, int(cx - r))
        y1 = max(0, int(cy - r))
        x2 = min(w, int(cx + r))
        y2 = min(h, int(cy + r))
        crop = frames[fi][y1:y2, x1:x2]
        if crop.size == 0:
            rgb_series.append([np.nan, np.nan, np.nan])
        else:
            mean_rgb = crop.mean(axis=(0, 1))[::-1]  # OpenCV BGR -> RGB
            rgb_series.append(mean_rgb.astype(float))
    arr = np.array(rgb_series)
    # Interpolate small gaps
    for c in range(3):
        col = pd.Series(arr[:, c])
        arr[:, c] = col.interpolate().ffill().bfill().to_numpy()
    return arr


def find_best_row(stem: str) -> Dict | None:
    base = Path("reports/rppg_pet_keypoints")
    candidates = list(base.glob(f"dlc_probe_{stem}*"))
    candidates += list(base.glob(f"dlc_probe_{stem}*analysis*"))
    if stem == "4":
        candidates += [base / "dlc_full4_roi_analysis_v2"]

    csv_paths = []
    for c in candidates:
        for p in c.rglob("rejection_anatomical_results.csv"):
            csv_paths.append(p)

    if not csv_paths:
        return None
    csv_paths.sort(key=lambda p: -p.stat().st_mtime)
    df = pd.read_csv(csv_paths[0])
    if df.empty:
        return None
    best_idx = df["snr"].idxmax()
    row = df.loc[best_idx].to_dict()
    row["_csv"] = str(csv_paths[0])
    return row


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
                    if not ok: break
                    frames.append(f)
                cap.release()
                return folder, kps, frames
    return None, None, None


def plot_raw_rgb_diagnostic(
    stem: str, 
    rgb: np.ndarray, 
    fs: float, 
    roi: str, 
    start_frame: int, 
    known_bpm: float, 
    snr: float, 
    out_dir: Path
):
    t = np.arange(len(rgb)) / fs
    fig, axes = plt.subplots(3, 1, figsize=(12, 9))

    # 1. Raw RGB time series
    colors = ['#d62728', '#2ca02c', '#1f77b4']  # R G B
    for i, ch in enumerate(['R', 'G', 'B']):
        axes[0].plot(t, rgb[:, i], label=ch, color=colors[i], linewidth=0.9, alpha=0.9)
    axes[0].set_ylabel("Raw RGB mean (a.u.)")
    axes[0].set_title(f"Video {stem} — Raw RGB (no rPPG method) | ROI: {roi} | start={start_frame} | Best SNR={snr:.1f}")
    axes[0].legend(loc="upper right", fontsize=8)
    axes[0].grid(True, alpha=0.3)

    # 2. Simple combinations (G, G-R) that are often used early in rPPG
    g = rgb[:, 1]
    gr = rgb[:, 1] - rgb[:, 0]
    axes[1].plot(t, g, label="G (green channel)", color="#2ca02c", linewidth=1.0)
    axes[1].plot(t, gr, label="G-R", color="#ff7f0e", linewidth=1.0, alpha=0.85)
    axes[1].set_ylabel("Simple combinations")
    axes[1].legend(loc="upper right", fontsize=8)
    axes[1].grid(True, alpha=0.3)

    # 3. Raw spectra (no fancy rPPG preprocessing)
    nfft = int(2 ** np.ceil(np.log2(max(len(g), 64))) * 4)
    for name, sig in [("G", g), ("G-R", gr)]:
        f, P = signal.periodogram(sig - np.mean(sig), fs=fs, window="hann", nfft=nfft)
        bpm = f * 60
        band = (bpm >= 40) & (bpm <= 300)
        axes[2].plot(bpm[band], 10 * np.log10(P[band] + 1e-12), label=name, linewidth=0.9)
    axes[2].axvline(known_bpm, color="blue", ls="--", lw=1.5, label=f"Selected peak {known_bpm:.0f} bpm")
    axes[2].axvspan(95, 105, alpha=0.15, color="red", label="~100 bpm artifact zone")
    axes[2].set_xlabel("BPM")
    axes[2].set_ylabel("Power (dB)")
    axes[2].set_xlim(40, 280)
    axes[2].legend(fontsize=8)
    axes[2].grid(True, alpha=0.3)
    axes[2].set_title("Raw spectrum of simple channels (before any advanced rPPG method)")

    plt.tight_layout()
    out_path = out_dir / f"video{stem}_raw_rgb_diagnostic.png"
    out_dir.mkdir(parents=True, exist_ok=True)
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {out_path.name}")
    return out_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stem", default="3,7", help="Comma separated or 'all'")
    parser.add_argument("--out", type=Path, default=Path("reports/rppg_pet_keypoints/raw_trace_diagnostics"))
    args = parser.parse_args()

    if args.stem.lower() == "all":
        stems = ["1", "3", "4", "5", "6", "7", "8"]
    else:
        stems = [s.strip() for s in args.stem.split(",")]

    out_dir = args.out
    out_dir.mkdir(parents=True, exist_ok=True)

    fs = 10.0
    win = 200

    for stem in stems:
        print(f"\n=== Diagnosing raw RGB for video {stem} ===")
        best = find_best_row(stem)
        if best is None:
            print(f"  No results for {stem}")
            continue

        probe_dir, kps, frames = load_probe(stem)
        if probe_dir is None:
            print(f"  Probe data not found for {stem}")
            continue

        roi_name = best.get("roi", "nose_bridge")
        start = int(best.get("start_frame", 0))
        bpm = float(best.get("raw_bpm", 0))
        snr = float(best.get("snr", 0))

        spec = ANATOMICAL_ROIS.get(roi_name, ANATOMICAL_ROIS["nose_bridge"])
        raw_rgb = extract_raw_rgb_series(frames, kps, spec, start, win)

        if np.isfinite(raw_rgb).sum() < 100:
            print(f"  Too little valid data in the window for {stem}")
            continue

        plot_raw_rgb_diagnostic(stem, raw_rgb, fs, roi_name, start, bpm, snr, out_dir)

        # Also save the raw RGB array for further analysis
        np.savez_compressed(
            out_dir / f"video{stem}_raw_rgb_window.npz",
            rgb=raw_rgb.astype(np.float32),
            meta={
                "stem": stem,
                "roi": roi_name,
                "start_frame": start,
                "selected_bpm": bpm,
                "snr": snr,
                "fs": fs,
            }
        )

    print(f"\nAll raw RGB diagnostics saved under: {out_dir}")
    print("Done.")


if __name__ == "__main__":
    main()
