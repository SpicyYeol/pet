#!/usr/bin/env python3
"""
Time-domain cardiac signal amplification experiments.

Core idea: After removing as much low-frequency artifact as possible (using the best proxy subtraction we have),
try to amplify the remaining weak cardiac component using purely or mostly time-domain operations,
without aggressive frequency filtering.

Techniques tested on cleaned RGB traces:
1. Standard rPPG methods on cleaned signal (baseline after artifact removal)
2. PCA across the 3 RGB channels on the cleaned trace; pick the component with strongest periodicity (measured via autocorrelation in plausible cardiac lag range)
3. Simple periodicity reinforcement: average the signal with time-shifted versions at estimated cardiac period (iterative)
4. Channel re-weighting optimized for maximum autocorrelation at cardiac lags
5. Using keypoint motion as a weak additional reference to boost the component most consistent with it

All methods aim to "amplify" the weak pulsatile component rather than just suppress artifact further.

Results reported in actual BPM using the project's METHOD_FUNCTIONS.
"""

from __future__ import annotations

from pathlib import Path
from typing import Tuple

import numpy as np
import pandas as pd
from scipy import signal, linalg
from sklearn.decomposition import PCA

import sys
sys.path.insert(0, 'tools')
from evaluate_rppg_methods import METHOD_FUNCTIONS, estimate_bpm_from_signal

FS = 10.0
MIN_BPM = 70
MAX_BPM = 240

def load_raw_rgb(stem: str) -> np.ndarray:
    npz = Path(f"reports/rppg_pet_keypoints/raw_trace_diagnostics/video{stem}_raw_rgb_window.npz")
    return np.load(npz)["rgb"]

def load_panting_proxy(stem: str, n: int) -> np.ndarray:
    # Approximate proxy from the trace (in real use we have keypoints)
    rgb = load_raw_rgb(stem)[:n]
    gr = rgb[:, 1] - rgb[:, 0]
    proxy = signal.savgol_filter(gr, window_length=11, polyorder=2)
    if proxy.std() > 1e-6:
        proxy = (proxy - proxy.mean()) / proxy.std()
    return proxy[:n]

def apply_strong_cleaning(rgb: np.ndarray, proxy: np.ndarray) -> np.ndarray:
    """Current best artifact removal."""
    gr = rgb[:, 1] - rgb[:, 0]
    if len(proxy) != len(gr):
        proxy = proxy[:len(gr)]
    beta = np.cov(gr, proxy)[0, 1] / (np.var(proxy) + 1e-12)
    cleaned_gr = gr - 0.85 * beta * proxy
    p5, p95 = np.percentile(cleaned_gr, [5, 95])
    cleaned_gr = np.clip(cleaned_gr, p5, p95)
    out = rgb.copy()
    out[:, 1] = out[:, 0] + cleaned_gr
    return out

def estimate_bpm_methods(rgb: np.ndarray) -> dict:
    results = {}
    for name, fn in METHOD_FUNCTIONS.items():
        pulse = fn(rgb, FS, MIN_BPM, MAX_BPM)
        bpm, snr, _ = estimate_bpm_from_signal(pulse, FS, MIN_BPM, MAX_BPM)
        results[name] = (round(bpm, 1), round(snr, 2))
    return results

def periodicity_score(x: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> float:
    """Rough periodicity score using max autocorrelation in cardiac lag range."""
    lags = np.arange(int(fs * 60 / max_bpm), int(fs * 60 / min_bpm))
    if len(x) < lags[-1] + 10:
        return 0.0
    ac = np.correlate(x - x.mean(), x - x.mean(), mode='full')
    ac = ac[len(x)-1:]
    ac = ac[lags]
    return float(np.max(ac))

def pca_periodicity_component(rgb: np.ndarray) -> np.ndarray:
    """Take the PCA component of the 3 channels with highest periodicity score."""
    pca = PCA(n_components=3)
    comps = pca.fit_transform(rgb)
    scores = [periodicity_score(comps[:, i], FS, MIN_BPM, MAX_BPM) for i in range(3)]
    best_idx = int(np.argmax(scores))
    return comps[:, best_idx]

def simple_periodicity_reinforcement(x: np.ndarray, fs: float, target_bpm: float | None = None) -> np.ndarray:
    """
    Very simple time-domain periodicity reinforcement.
    If target_bpm is None, use a rough estimate from autocorrelation.
    """
    if target_bpm is None:
        # rough period from autocorrelation
        ac = np.correlate(x - x.mean(), x - x.mean(), mode='full')
        ac = ac[len(x)-1:]
        lags = np.arange(int(fs * 60 / MAX_BPM), int(fs * 60 / MIN_BPM))
        best_lag = lags[np.argmax(ac[lags])]
        period = best_lag
    else:
        period = int(fs * 60 / target_bpm)

    if period < 3:
        return x

    # Average a few shifted versions
    out = x.copy().astype(float)
    count = 1
    for shift in [period, 2*period]:
        if shift < len(x):
            out[shift:] += x[:-shift]
            count += 1
    return out / count

def main():
    for stem in ['3', '7']:
        print(f"\n=== Time-domain Cardiac Amplification Experiments: Video {stem} ===")
        rgb = load_raw_rgb(stem)
        proxy = load_panting_proxy(stem, len(rgb))

        # 1. After best cleaning only
        cleaned = apply_strong_cleaning(rgb, proxy)
        print("\nAfter strong cleaning only:")
        for name, (bpm, snr) in estimate_bpm_methods(cleaned).items():
            print(f"  {name:10s}: {bpm:6.1f} bpm (SNR {snr:5.2f})")

        # 2. PCA on cleaned RGB, take most periodic component
        pca_comp = pca_periodicity_component(cleaned)
        # Turn it back into a "pulse-like" signal for the methods
        pca_rgb = np.tile(pca_comp, (3, 1)).T   # fake 3-channel with the component
        print("\nAfter PCA (most periodic component) on cleaned RGB:")
        for name, (bpm, snr) in estimate_bpm_methods(pca_rgb).items():
            print(f"  {name:10s}: {bpm:6.1f} bpm (SNR {snr:5.2f})")

        # 3. Periodicity reinforcement on cleaned trace (using green)
        g_clean = cleaned[:, 1]
        reinforced = simple_periodicity_reinforcement(g_clean, FS)
        reinforced_rgb = np.tile(reinforced, (3, 1)).T
        print("\nAfter simple time-domain periodicity reinforcement:")
        for name, (bpm, snr) in estimate_bpm_methods(reinforced_rgb).items():
            print(f"  {name:10s}: {bpm:6.1f} bpm (SNR {snr:5.2f})")

if __name__ == "__main__":
    main()