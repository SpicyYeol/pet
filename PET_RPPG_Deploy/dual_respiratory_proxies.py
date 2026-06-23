#!/usr/bin/env python3
"""
Dual Respiratory Proxies for Dog Video Monitoring

Architecture decided by user:
- Chest proxy → Main "Respiratory Rate" (Thoracic Breathing Rate)
  This is the primary value to report, as it is closer to clinical hand-on-chest measurement.

- Facial proxy → Secondary "Panting Rate" + Artifact Indicator
  Useful for:
    - Detecting strong panting (which heavily corrupts rPPG HR signal)
    - Reporting separate "Panting Rate" when relevant
    - Potentially triggering stronger artifact rejection in HR pipeline

This file provides clean, role-separated functions.
"""

import numpy as np
from scipy import signal
import pandas as pd
from typing import Tuple, Optional


def get_keypoint_center(kps_df: pd.DataFrame, frame_idx: int, kp_names: list[str]) -> Optional[tuple[float, float]]:
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(kp_names))]
    if len(row) == 0:
        return None
    return float(row["x"].mean()), float(row["y"].mean())


# ============================================================
# 1. CHEST PROXY → Main Respiratory Rate (Thoracic Breathing)
# ============================================================

def compute_thoracic_breathing_proxy(kps_df: pd.DataFrame, n_frames: int) -> np.ndarray:
    """
    Chest / Thoracic motion proxy.
    Intended as the PRIMARY respiratory rate signal.
    Closer to how vets measure breathing rate by hand on the chest.
    """
    proxies = []
    for fi in range(n_frames):
        # Upper reference
        neck = get_keypoint_center(kps_df, fi, ["neck_base", "neck_end"])
        # Lower reference (thoracic area)
        back = get_keypoint_center(kps_df, fi, ["back_base", "back_middle", "belly_bottom"])

        if neck and back:
            vertical = abs(neck[1] - back[1])
            proxy = vertical * 0.9
        else:
            proxy = 0.0
        proxies.append(proxy)

    arr = np.array(proxies, dtype=float)

    # Smoothing suitable for slower breathing
    if len(arr) > 7:
        arr = signal.savgol_filter(arr, min(9, len(arr)//2*2+1 or 7), 2)

    if arr.std() > 1e-6:
        arr = (arr - arr.mean()) / (arr.std() + 1e-8)
    return arr


def estimate_thoracic_breathing_rate(proxy: np.ndarray, fs: float = 10.0) -> Tuple[float, float]:
    """
    Main respiratory rate (breaths per minute) from chest motion.
    This is the value you should treat as the primary '호흡수'.
    """
    if len(proxy) < fs * 8:
        return np.nan, 0.0

    x = proxy - np.mean(proxy)
    if np.std(x) < 1e-6:
        return np.nan, 0.0

    nfft = 4096
    f, Pxx = signal.periodogram(x, fs=fs, window='hann', nfft=nfft)

    # Normal dog breathing range + light panting
    mask = (f >= 8/60) & (f <= 80/60)
    if mask.sum() < 3:
        return np.nan, 0.0

    f_band = f[mask]
    P_band = Pxx[mask]

    peak_idx = np.argmax(P_band)
    rate_bpm = f_band[peak_idx] * 60
    confidence = float(P_band[peak_idx] / (np.median(P_band) + 1e-12))

    if confidence < 1.5:
        return np.nan, confidence

    return rate_bpm, confidence


# ============================================================
# 2. FACIAL PROXY → Panting Rate + Artifact Indicator
# ============================================================

def compute_facial_panting_proxy(kps_df: pd.DataFrame, n_frames: int) -> np.ndarray:
    """
    Facial (jaw + mouth + ear) proxy.
    Primary use: Panting rate + strong artifact detection for HR pipeline.
    """
    proxies = []
    for fi in range(n_frames):
        upper = get_keypoint_center(kps_df, fi, ["upper_jaw"])
        lower = get_keypoint_center(kps_df, fi, ["lower_jaw"])
        lm = get_keypoint_center(kps_df, fi, ["mouth_end_left"])
        rm = get_keypoint_center(kps_df, fi, ["mouth_end_right"])
        re = get_keypoint_center(kps_df, fi, ["right_earbase"])
        le = get_keypoint_center(kps_df, fi, ["left_earbase"])

        vertical = abs(upper[1] - lower[1]) if (upper and lower) else 0.0
        lateral = abs(lm[0] - rm[0]) if (lm and rm) else 0.0
        ear_m = abs(re[1] - le[1]) * 0.3 if (re and le) else 0.0

        proxy = vertical * 0.55 + lateral * 0.35 + ear_m * 0.10
        proxies.append(proxy)

    arr = np.array(proxies, dtype=float)
    if len(arr) > 5:
        arr = signal.savgol_filter(arr, min(11, len(arr)//2*2+1 or 5), 2)
    if arr.std() > 1e-6:
        arr = (arr - arr.mean()) / (arr.std() + 1e-8)
    return arr


def estimate_panting_rate(proxy: np.ndarray, fs: float = 10.0) -> Tuple[float, float]:
    """
    Panting rate + confidence.
    Use this as:
    - Separate 'Panting Rate' metric
    - Strong indicator that HR estimation may be heavily corrupted
    """
    if len(proxy) < fs * 5:
        return np.nan, 0.0

    x = proxy - np.mean(proxy)
    if np.std(x) < 1e-6:
        return np.nan, 0.0

    nfft = 2048
    f, Pxx = signal.periodogram(x, fs=fs, window='hann', nfft=nfft)

    # Panting range in dogs
    mask = (f >= 50/60) & (f <= 320/60)
    if mask.sum() < 3:
        return np.nan, 0.0

    f_band = f[mask]
    P_band = Pxx[mask]

    peak_idx = np.argmax(P_band)
    rate_bpm = f_band[peak_idx] * 60
    confidence = float(P_band[peak_idx] / (np.median(P_band) + 1e-12))

    if confidence < 2.0:
        return np.nan, confidence

    return rate_bpm, confidence


def get_panting_intensity(proxy: np.ndarray) -> float:
    """
    Simple intensity score of panting motion (0~1+ range).
    Can be used to dynamically strengthen artifact rejection in HR pipeline.
    """
    if len(proxy) < 10:
        return 0.0
    return float(np.std(proxy))


# ============================================================
# Convenience: Compute both at once
# ============================================================

def compute_dual_respiratory_proxies(kps_df: pd.DataFrame, n_frames: int) -> dict:
    """
    Returns both proxies and their rates in one call.
    Recommended usage in main pipeline.
    """
    facial_proxy = compute_facial_panting_proxy(kps_df, n_frames)
    chest_proxy = compute_thoracic_breathing_proxy(kps_df, n_frames)

    thoracic_rate, thoracic_conf = estimate_thoracic_breathing_rate(chest_proxy)
    panting_rate, panting_conf = estimate_panting_rate(facial_proxy)
    panting_intensity = get_panting_intensity(facial_proxy)

    return {
        "thoracic_breathing_rate": thoracic_rate,
        "thoracic_confidence": thoracic_conf,
        "panting_rate": panting_rate,
        "panting_confidence": panting_conf,
        "panting_intensity": panting_intensity,
        "chest_proxy": chest_proxy,
        "facial_proxy": facial_proxy,
    }


if __name__ == "__main__":
    # Quick test
    from pathlib import Path
    csv = Path("reports/rppg_pet_keypoints/dlc_probe_3_gpu/pet_keypoints_normalized.csv")
    if csv.exists():
        kps = pd.read_csv(csv)
        n = kps["frame_index"].nunique()
        result = compute_dual_respiratory_proxies(kps, n)
        print("Video 3 Dual Respiratory Results:")
        print(f"  Thoracic Breathing Rate (Main 호흡수): {result['thoracic_breathing_rate']:.1f} bpm")
        print(f"  Panting Rate (Artifact indicator):     {result['panting_rate']:.1f} bpm")
        print(f"  Panting Intensity:                     {result['panting_intensity']:.3f}")
    else:
        print("Test data not found.")
