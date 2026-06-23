#!/usr/bin/env python3
"""
Experiment: Differencing-based approaches to suppress fur texture and enhance dynamic signal.

User idea: Standard rPPG (CHROM, Green, POS) works great on exposed human skin,
but on furry animals we may need explicit "차분 / differencing" to remove static or slowly-varying fur
and keep the underlying pulsatile changes.

We apply several temporal differencing transforms on the raw RGB traces (before any rPPG method)
from the best windows of video 3 and 7, then look at the resulting spectra.

Focus: Does any form of differencing move energy away from the strong 100bpm artifact toward the true high HR?

Data source: raw_rgb_window.npz saved from previous diagnostics.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from scipy import signal

def temporal_diff(x: np.ndarray, order: int = 1) -> np.ndarray:
    """Simple discrete derivative (1st or 2nd difference)."""
    for _ in range(order):
        x = np.diff(x, n=1)
    # Pad to original length for fair spectrum comparison (or just use shorter)
    return x

def process_and_plot(stem: str, rgb: np.ndarray, fs: float, out_dir: Path):
    t = np.arange(len(rgb)) / fs

    transforms = {
        "raw": rgb,
        "1st_diff": temporal_diff(rgb, 1),
        "2nd_diff": temporal_diff(rgb, 2),
    }

    # Also try on G-R channel (common in rPPG)
    gr = rgb[:, 1] - rgb[:, 0]
    transforms["gr_raw"] = gr
    transforms["gr_1st_diff"] = temporal_diff(gr, 1)
    transforms["gr_2nd_diff"] = temporal_diff(gr, 2)

    fig, axes = plt.subplots(len(transforms), 2, figsize=(14, 3.2 * len(transforms)))

    for idx, (name, sig) in enumerate(transforms.items()):
        if sig.ndim == 2:
            # Use G channel for visualization of multi-channel transforms
            vis_sig = sig[:, 1] if sig.shape[1] == 3 else sig
        else:
            vis_sig = sig

        # Time series (shortened if differenced)
        tt = np.arange(len(vis_sig)) / fs
        axes[idx, 0].plot(tt, vis_sig, linewidth=0.8)
        axes[idx, 0].set_ylabel(name)
        if idx == 0:
            axes[idx, 0].set_title(f"Video {stem} - Transformed signals")
        axes[idx, 0].grid(True, alpha=0.3)

        # Spectrum - compute everything fresh for this (possibly shorter) signal
        n = len(vis_sig)
        nfft = int(2 ** np.ceil(np.log2(max(n, 64))) * 4)
        f, P = signal.periodogram(vis_sig - np.mean(vis_sig), fs=fs, window="hann", nfft=nfft)
        bpm = f * 60
        band = (bpm >= 40) & (bpm <= 280)
        axes[idx, 1].plot(bpm[band], 10 * np.log10(P[band] + 1e-12), linewidth=0.8)
        axes[idx, 1].axvspan(95, 105, alpha=0.12, color="red", label="~100 bpm artifact")
        if idx == 0:
            axes[idx, 1].set_title("Spectra after transform")
        axes[idx, 1].set_xlim(40, 260)
        axes[idx, 1].grid(True, alpha=0.3)

    axes[-1, 0].set_xlabel("Time (s)")
    axes[-1, 1].set_xlabel("BPM")
    plt.tight_layout()
    out_path = out_dir / f"video{stem}_differencing_experiment.png"
    out_dir.mkdir(parents=True, exist_ok=True)
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {out_path.name}")

    # Also compute a simple "best BPM" for each transform using green channel (or G-R)
    print(f"\nVideo {stem} - Rough peak BPM after each transform (green channel or G-R):")
    for name, sig in transforms.items():
        if sig.ndim == 2:
            ch = sig[:, 1]  # green
        else:
            ch = sig
        n = len(ch)
        if n < 8:
            print(f"    {name:12s}: too short after diff")
            continue
        nfft = int(2 ** np.ceil(np.log2(max(n, 64))) * 4)
        f, P = signal.periodogram(ch - np.mean(ch), fs=fs, window="hann", nfft=nfft)
        bpm_arr = f * 60
        band = (bpm_arr >= 40) & (bpm_arr <= 240)
        f_band = bpm_arr[band]
        P_band = P[band]
        if len(P_band) > 0:
            peak_bpm = f_band[np.argmax(P_band)]
            print(f"    {name:12s}: {peak_bpm:6.1f} bpm")
        else:
            print(f"    {name:12s}: N/A")


def main():
    out_dir = Path("reports/rppg_pet_keypoints/fur_differencing_experiment")
    out_dir.mkdir(parents=True, exist_ok=True)

    fs = 10.0

    for stem in ["3", "7"]:
        print(f"\n=== Fur differencing experiment on video {stem} ===")
        npz = Path(f"reports/rppg_pet_keypoints/raw_trace_diagnostics/video{stem}_raw_rgb_window.npz")
        if not npz.exists():
            print(f"  Raw data not found for {stem}")
            continue

        data = np.load(npz)
        rgb = data["rgb"]
        print(f"  Loaded raw RGB: {rgb.shape}")

        process_and_plot(stem, rgb, fs, out_dir)

    print(f"\nAll differencing experiment plots saved under: {out_dir}")


if __name__ == "__main__":
    main()
