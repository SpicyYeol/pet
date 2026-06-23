#!/usr/bin/env python3
"""
Comprehensive Anatomical ROI rPPG Analysis for Pet Videos (DLC + YOLO mask).

This script is a more flexible/generalized version of evaluate_dlc_keypoint_roi_probe.py.
It is designed to work with:
- Full-length videos (not just short probes)
- Any set of anatomical ROIs defined from DLC SuperAnimal quadruped keypoints
- Proper YOLO segmentation mask intersection
- Multiple rPPG methods (green, g-r, chrom, pos)
- Direct comparison against face-box baseline (from previous caches)

Usage after you have a full DLC H5:
1. Normalize the H5 into the standard pet_keypoints_normalized.csv schema
   (see evaluate_pet_keypoint_readiness.py or the 30s probe example).
2. Run this script pointing at the full keypoints CSV + the original video.

Example:
    python tools/analyze_anatomical_rois_full.py \
        --keypoints-csv reports/rppg_pet_keypoints/dlc_full4/pet_keypoints_normalized.csv \
        --video dataset_front/4.mp4 \
        --out-dir reports/rppg_pet_keypoints/dlc_full4_roi_analysis \
        --yolo-model yolo11n-seg.pt \
        --device 0
"""

from __future__ import annotations

import argparse
import json
import math
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2
import numpy as np
import pandas as pd
from scipy import signal
from ultralytics import YOLO


# =============================================================================
# rPPG signal functions (same as project core)
# =============================================================================

def safe_bandpass(x: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    x = np.asarray(x, dtype=float)
    if len(x) < 12:
        return x - np.nanmean(x)
    x = signal.detrend(x, type="linear")
    lo = min_bpm / 60.0
    hi = min(max_bpm / 60.0, fs * 0.45)
    if lo >= hi:
        return x - np.mean(x)
    sos = signal.butter(3, [lo, hi], btype="bandpass", fs=fs, output="sos")
    try:
        return signal.sosfiltfilt(sos, x)
    except ValueError:
        return signal.sosfilt(sos, x)


def normalize_rgb(rgb: np.ndarray) -> np.ndarray:
    mean = np.nanmean(rgb, axis=0)
    mean[mean == 0] = 1.0
    return rgb / mean - 1.0


def sig_green(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    return safe_bandpass(rgb[:, 1], fs, min_bpm, max_bpm)


def sig_g_minus_r(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    norm = normalize_rgb(rgb)
    return safe_bandpass(norm[:, 1] - norm[:, 0], fs, min_bpm, max_bpm)


def sig_chrom(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    norm = normalize_rgb(rgb)
    x = 3.0 * norm[:, 0] - 2.0 * norm[:, 1]
    y = 1.5 * norm[:, 0] + norm[:, 1] - 1.5 * norm[:, 2]
    alpha = np.std(x) / (np.std(y) + 1e-9)
    return safe_bandpass(x - alpha * y, fs, min_bpm, max_bpm)


def sig_pos(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    norm = normalize_rgb(rgb)
    h1 = norm[:, 1] - norm[:, 2]
    h2 = -2.0 * norm[:, 0] + norm[:, 1] + norm[:, 2]
    alpha = np.std(h1) / (np.std(h2) + 1e-9)
    return safe_bandpass(h1 + alpha * h2, fs, min_bpm, max_bpm)


METHOD_FNS = {
    "green": sig_green,
    "g_minus_r": sig_g_minus_r,
    "chrom": sig_chrom,
    "pos": sig_pos,
}


def estimate_bpm_from_signal(x: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> tuple[float, float, float]:
    x = np.asarray(x, dtype=float)
    if len(x) < 16 or not np.isfinite(x).all() or np.std(x) < 1e-12:
        return np.nan, np.nan, np.nan
    x = x - np.mean(x)
    nfft = int(2 ** math.ceil(math.log2(max(len(x), 64))) * 4)
    freqs, power = signal.periodogram(x, fs=fs, window="hann", nfft=nfft, detrend=False)
    lo = min_bpm / 60.0
    hi = min(max_bpm / 60.0, fs * 0.45)
    mask = (freqs >= lo) & (freqs <= hi)
    if mask.sum() < 3:
        return np.nan, np.nan, np.nan
    band_freqs = freqs[mask]
    band_power = power[mask]
    idx = int(np.argmax(band_power))
    peak_freq = float(band_freqs[idx])
    peak_power = float(band_power[idx])
    noise = float(np.median(band_power) + 1e-12)
    snr = peak_power / noise
    total_ratio = peak_power / (float(np.sum(band_power)) + 1e-12)
    return peak_freq * 60.0, snr, total_ratio


# =============================================================================
# YOLO + mask helper (same spirit as existing probe)
# =============================================================================

def load_yolo_model(model_path: Path, disable: bool) -> Any | None:
    if disable:
        return None
    if not model_path.exists():
        print(f"[warn] YOLO model not found: {model_path}")
        return None
    return YOLO(str(model_path))


def animal_mask_for_frame(model: Any | None, frame: np.ndarray, device: str = "0") -> tuple[np.ndarray, float]:
    h, w = frame.shape[:2]
    if model is None:
        return np.ones((h, w), dtype=bool), math.nan
    result = model.predict(frame, imgsz=640, device=device, verbose=False)[0]
    if result.masks is None or result.boxes is None or len(result.boxes) == 0:
        return np.zeros((h, w), dtype=bool), math.nan
    cls = result.boxes.cls.detach().cpu().numpy().astype(int)
    conf = result.boxes.conf.detach().cpu().numpy().astype(float)
    masks = result.masks.data.detach().cpu().numpy() > 0.5
    # SuperAnimal quadruped + common animal classes in COCO/YOLO
    animal = np.isin(cls, [15, 16, 17, 18, 19, 20, 21, 22, 23])
    if not animal.any():
        animal = np.ones_like(cls, dtype=bool)
    selected = masks[animal]
    selected_conf = conf[animal]
    if selected.size == 0:
        return np.zeros((h, w), dtype=bool), math.nan
    combined = np.any(selected, axis=0).astype(np.uint8)
    if combined.shape != (h, w):
        combined = cv2.resize(combined, (w, h), interpolation=cv2.INTER_NEAREST)
    return combined.astype(bool), float(np.nanmax(selected_conf)) if selected_conf.size else math.nan


# =============================================================================
# Anatomical ROI definitions (extensible)
# =============================================================================

ANATOMICAL_ROI_SPECS = [
    {"name": "neck",          "kps": ["neck", "throat"],                  "radius": 28},
    {"name": "nose_bridge",   "kps": ["nose", "upper_jaw"],               "radius": 18},
    {"name": "left_ear_base", "kps": ["left_earbase", "right_earbase"],   "radius": 16},
    {"name": "right_ear_base","kps": ["right_earbase", "left_earbase"],   "radius": 16},
    {"name": "left_eye",      "kps": ["left_eye"],                        "radius": 14},
    {"name": "right_eye",     "kps": ["right_eye"],                       "radius": 14},
    {"name": "throat",        "kps": ["throat", "neck"],                  "radius": 22},
    {"name": "upper_chest",   "kps": ["neck", "withers"],                 "radius": 32},
    # Artifact ROIs (for rejection analysis)
    {"name": "mouth_artifact","kps": ["mouth_end_left", "mouth_end_right", "lower_jaw"], "radius": 20},
    {"name": "left_paw",      "kps": ["left_front_paw", "left_knee"],     "radius": 18},
]


def get_keypoint_xy(kps_df: pd.DataFrame, frame_idx: int, names: list[str]) -> tuple[float, float] | None:
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(names))]
    if row.empty:
        return None
    return float(row["x"].mean()), float(row["y"].mean())


def extract_patch_rgb(frame: np.ndarray, mask: np.ndarray, center: tuple[float, float], radius: int) -> tuple[np.ndarray, int]:
    h, w = frame.shape[:2]
    cx, cy = center
    x1 = max(0, int(cx - radius))
    y1 = max(0, int(cy - radius))
    x2 = min(w, int(cx + radius))
    y2 = min(h, int(cy + radius))
    crop = frame[y1:y2, x1:x2]
    m = mask[y1:y2, x1:x2] if mask is not None else np.ones((y2-y1, x2-x1), dtype=bool)
    if crop.size == 0 or m.sum() < 10:
        return np.full(3, np.nan), 0
    valid_pixels = crop[m]
    if len(valid_pixels) < 5:
        return np.full(3, np.nan), 0
    rgb = valid_pixels[:, ::-1].astype(float).mean(axis=0)
    return rgb, int(m.sum())


def main():
    parser = argparse.ArgumentParser(description="Full anatomical ROI rPPG sweep using DLC keypoints + YOLO mask")
    parser.add_argument("--keypoints-csv", type=Path, required=True)
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_pet_keypoints/anatomical_roi_sweep"))
    parser.add_argument("--yolo-model", type=Path, default=Path("yolo11n-seg.pt"))
    parser.add_argument("--device", default="0")
    parser.add_argument("--min-bpm", type=float, default=70)
    parser.add_argument("--max-bpm", type=float, default=240)
    parser.add_argument("--sample-fps", type=float, default=10.0)
    args = parser.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)

    print(f"[load] keypoints: {args.keypoints_csv}")
    kps = pd.read_csv(args.keypoints_csv)
    print(f"[load] video: {args.video}")

    cap = cv2.VideoCapture(str(args.video))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open {args.video}")
    src_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    yolo = load_yolo_model(args.yolo_model, False)

    # Read frames at target sample rate
    frame_step = max(1, int(round(src_fps / args.sample_fps)))
    frames: list[np.ndarray] = []
    frame_indices: list[int] = []
    idx = 0
    while True:
        ok, f = cap.read()
        if not ok:
            break
        if idx % frame_step == 0:
            frames.append(f)
            frame_indices.append(idx)
        idx += 1
    cap.release()

    print(f"[video] read {len(frames)} frames (step={frame_step})")

    # Process each frame
    records = []
    for local_i, (frame_idx, frame) in enumerate(zip(frame_indices, frames)):
        mask, mask_conf = animal_mask_for_frame(yolo, frame, device=args.device)
        for spec in ANATOMICAL_ROI_SPECS:
            center = get_keypoint_xy(kps, frame_idx, spec["kps"])
            if center is None:
                continue
            rgb, n_valid = extract_patch_rgb(frame, mask, center, spec["radius"])
            records.append({
                "frame_index": frame_idx,
                "local_idx": local_i,
                "roi": spec["name"],
                "r": rgb[0], "g": rgb[1], "b": rgb[2],
                "valid_pixels": n_valid,
                "mask_conf": mask_conf,
            })

    df = pd.DataFrame(records)
    print(f"[data] extracted {len(df)} ROI patches across {df['roi'].nunique()} anatomical regions")

    # Build clean per-ROI traces (handle missing keypoints / mask failures with interpolation)
    from scipy.interpolate import interp1d

    def build_clean_trace(roi_df: pd.DataFrame, n_frames: int) -> np.ndarray:
        """Return (n_frames, 3) RGB with NaNs interpolated / forward-filled."""
        arr = np.full((n_frames, 3), np.nan)
        for _, row in roi_df.iterrows():
            li = int(row["local_idx"])
            if 0 <= li < n_frames:
                arr[li] = [row["r"], row["g"], row["b"]]
        # Simple linear interpolation per channel, then ffill/bfill
        for c in range(3):
            valid = np.isfinite(arr[:, c])
            if valid.sum() >= 2:
                f = interp1d(np.where(valid)[0], arr[valid, c], kind="linear", fill_value="extrapolate")
                arr[~valid, c] = f(np.where(~valid)[0])
            # final ffill / bfill
            arr[:, c] = pd.Series(arr[:, c]).ffill().bfill().to_numpy()
        return arr

    n_total = len(frames)
    fs = args.sample_fps

    results = []
    for roi in sorted(df["roi"].unique()):
        roi_df = df[df["roi"] == roi]
        clean_rgb = build_clean_trace(roi_df, n_total)

        for method_name, fn in METHOD_FNS.items():
            try:
                pulse = fn(clean_rgb, fs, args.min_bpm, args.max_bpm)
                bpm, snr, ratio = estimate_bpm_from_signal(pulse, fs, args.min_bpm, args.max_bpm)
            except Exception:
                bpm, snr, ratio = np.nan, np.nan, np.nan
            results.append({
                "roi": roi,
                "method": method_name,
                "pred_bpm": round(float(bpm), 2) if np.isfinite(bpm) else None,
                "snr": round(float(snr), 2) if np.isfinite(snr) else None,
                "peak_power_ratio": round(float(ratio), 4) if np.isfinite(ratio) else None,
                "n_samples": len(roi_df),
            })

    out_df = pd.DataFrame(results)
    out_csv = args.out_dir / "anatomical_roi_results.csv"
    out_df.to_csv(out_csv, index=False)
    print(f"[saved] {out_csv}")

    # Simple ranking
    good = out_df[out_df["snr"].notna()].sort_values("snr", ascending=False)
    print("\n=== Top Anatomical ROI + Method by SNR ===")
    print(good.head(15).to_string(index=False))

    summary = {
        "generated_at": datetime.now().isoformat(),
        "video": str(args.video),
        "n_frames_analyzed": len(frames),
        "n_anatomical_rois": df["roi"].nunique(),
        "best_snr": float(good["snr"].iloc[0]) if len(good) else None,
        "best_entry": good.iloc[0].to_dict() if len(good) else None,
    }
    (args.out_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"\n[done] Summary written to {args.out_dir / 'summary.json'}")


if __name__ == "__main__":
    main()
