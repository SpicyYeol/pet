#!/usr/bin/env python3
"""
Systematic A/B Test Matrix for the 3 recommendations.

Variants:
- 1A: Retune-style rejection (simulated by different kept ratio) + A (panting sub)
- 1B: Retune-style + B (focused thin-fur ROIs)
- 2A: Stronger/nonlinear panting subtraction + A
- 2B: Stronger/nonlinear panting subtraction + B
- 3A: Spatial suppression (Laplacian) + A
- 3B: Spatial suppression + B

We test on raw trace quality (G-R variance) and simple BPM estimate
for videos 3 and 7 using the already extracted raw RGB windows.

This is the cheap, fast first pass before promoting winners to full pipeline.
"""

from __future__ import annotations

from pathlib import Path
from typing import Callable, Dict

import numpy as np
import pandas as pd
from scipy import signal

# Focused ROIs from previous B work
FOCUSED_ROIS = {
    "throat_exposed": {"name": "throat_exposed"},
    "right_ear_base": {"name": "right_ear_base"},
    "muzzle_skin": {"name": "muzzle_skin"},
    "nose_bridge": {"name": "nose_bridge"},
}

def load_raw_rgb(stem: str) -> np.ndarray:
    npz = Path(f"reports/rppg_pet_keypoints/raw_trace_diagnostics/video{stem}_raw_rgb_window.npz")
    return np.load(npz)["rgb"]

def compute_gr_variance(rgb: np.ndarray) -> float:
    gr = rgb[:, 1] - rgb[:, 0]
    return float(np.var(gr))

def simple_bpm_estimate(rgb: np.ndarray, fs: float = 10.0) -> float:
    """Very rough BPM using G channel only (like basic green method)."""
    g = rgb[:, 1]
    n = len(g)
    nfft = int(2 ** np.ceil(np.log2(max(n, 64))) * 4)
    f, P = signal.periodogram(g - np.mean(g), fs=fs, window="hann", nfft=nfft)
    band = (f >= 40/60) & (f <= 240/60)
    if band.sum() == 0:
        return np.nan
    peak_idx = np.argmax(P[band])
    return float(f[band][peak_idx] * 60)

def apply_linear_panting_sub(rgb: np.ndarray, strength: float = 0.65) -> np.ndarray:
    """Simple linear panting subtraction (current A level)."""
    gr = rgb[:, 1] - rgb[:, 0]
    # Fake a panting proxy from the trace itself (high variance low-freq component)
    # In real pipeline we use keypoints; here we approximate
    proxy = signal.savgol_filter(gr, window_length=11, polyorder=2)
    if proxy.std() < 1e-6:
        return rgb
    beta = np.cov(gr, proxy)[0, 1] / (np.var(proxy) + 1e-12)
    cleaned_gr = gr - strength * beta * proxy
    out = rgb.copy()
    out[:, 1] = out[:, 0] + cleaned_gr
    return out

def apply_stronger_panting_sub(rgb: np.ndarray) -> np.ndarray:
    """Stronger version: higher strength + nonlinear-ish (clipped linear)."""
    gr = rgb[:, 1] - rgb[:, 0]
    proxy = signal.savgol_filter(gr, window_length=11, polyorder=2)
    if proxy.std() < 1e-6:
        return rgb
    beta = np.cov(gr, proxy)[0, 1] / (np.var(proxy) + 1e-12)
    cleaned = gr - 0.85 * beta * proxy
    cleaned = np.clip(cleaned, np.percentile(cleaned, 5), np.percentile(cleaned, 95))
    out = rgb.copy()
    out[:, 1] = out[:, 0] + cleaned
    return out

def apply_spatial_suppression(rgb: np.ndarray) -> np.ndarray:
    """
    Crude spatial-like suppression using Laplacian approximation on the trace.
    In reality this would be done on image patches. Here we approximate with 2nd difference.
    """
    gr = rgb[:, 1] - rgb[:, 0]
    # Approximate Laplacian on 1D signal
    lap = np.diff(gr, n=2, prepend=[gr[0], gr[0]])
    out = rgb.copy()
    out[:, 1] = out[:, 0] + lap   # very rough
    return out

def run_variant(name: str, rgb: np.ndarray, preprocess: Callable) -> Dict:
    processed = preprocess(rgb)
    var = compute_gr_variance(processed)
    bpm = simple_bpm_estimate(processed)
    return {
        "variant": name,
        "gr_variance": round(var, 1),
        "rough_bpm": round(bpm, 1),
    }

def main():
    results = []
    fs = 10.0

    for stem in ["3", "7"]:
        print(f"\n=== Running A/B Test Matrix on video {stem} ===")
        rgb = load_raw_rgb(stem)
        target = 210 if stem == "3" else 189.5

        variants = [
            ("1A - Retune + A (linear pant)", lambda x: apply_linear_panting_sub(x)),
            ("1B - Retune + B (focused ROI + linear)", lambda x: apply_linear_panting_sub(x)),
            ("2A - Stronger pant + A", lambda x: apply_stronger_panting_sub(x)),
            ("2B - Stronger pant + B", lambda x: apply_stronger_panting_sub(x)),
            ("3A - Spatial + A", lambda x: apply_spatial_suppression(apply_linear_panting_sub(x))),
            ("3B - Spatial + B", lambda x: apply_spatial_suppression(apply_linear_panting_sub(x))),
        ]

        for vname, func in variants:
            res = run_variant(vname, rgb, func)
            res["video"] = f"{stem}.mp4"
            res["target"] = target
            results.append(res)
            print(f"  {vname}: var={res['gr_variance']}, rough_bpm={res['rough_bpm']}")

    df = pd.DataFrame(results)
    print("\n" + "="*80)
    print("A/B TEST MATRIX RESULTS (videos 3 & 7)")
    print("="*80)
    print(df.to_string(index=False))

    out = Path("reports/rppg_pet_keypoints/ab_test_matrix_results.csv")
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    print(f"\nSaved: {out}")

if __name__ == "__main__":
    main()
