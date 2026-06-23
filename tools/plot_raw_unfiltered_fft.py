#!/usr/bin/env python3
"""
Plot RAW (minimally processed) FFT of the BVP traces we just extracted.

No additional detrend, no mean subtraction in this step, no windowing (rectangular),
full spectrum up to Nyquist (300 bpm for our 10 fps data).

This answers: "raw data를 filter 없이 fft한 그림"

Usage:
    python tools/plot_raw_unfiltered_fft.py

Outputs go to: reports/rppg_pet_keypoints/bvp_visualization/raw_fft_unfiltered/
"""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from scipy.fft import rfft, rfftfreq

OUT_DIR = Path("reports/rppg_pet_keypoints/bvp_visualization")
RAW_NPZ = OUT_DIR / "raw_bvp_traces.npz"
META_JSON = OUT_DIR / "raw_bvp_traces_meta.json"
FFT_OUT_DIR = OUT_DIR / "raw_fft_unfiltered"


def main():
    FFT_OUT_DIR.mkdir(parents=True, exist_ok=True)

    traces = np.load(RAW_NPZ)
    meta = json.loads(META_JSON.read_text(encoding="utf-8"))

    fs = 10.0
    n = 200          # all traces are 200 samples
    freqs_hz = rfftfreq(n, d=1/fs)          # 0 ... 5 Hz
    freqs_bpm = freqs_hz * 60               # 0 ... 300 bpm

    all_keys = list(traces.files)
    print(f"Found {len(all_keys)} raw BVP traces")

    fig, axes = plt.subplots(7, 1, figsize=(11, 14), sharex=True)
    axes = axes.flatten()

    for idx, key in enumerate(sorted(all_keys)):
        pulse = traces[key].astype(float)          # the pulse as saved (after rPPG method)
        m = meta.get(key, {})

        stem = m.get("stem", "?")
        roi = m.get("roi", "?")
        method = m.get("method", "?")
        known_bpm = m.get("bpm", None)

        # === RAW FFT (no extra filtering, no window, no mean removal here) ===
        # We still remove DC for visualization clarity (user usually doesn't want the huge DC bin),
        # but we do NOT detrend, do NOT apply window, do NOT bandpass.
        X = rfft(pulse - np.mean(pulse))           # only DC removal for plot readability
        mag = np.abs(X) / (len(pulse) / 2)         # amplitude scaling
        power_db = 20 * np.log10(mag + 1e-12)

        ax = axes[idx]
        ax.plot(freqs_bpm, power_db, linewidth=0.9, color="#d62728")
        ax.set_xlim(0, 300)
        ax.set_ylabel(f"{stem}.mp4\n{roi[:12]}\n{method}", fontsize=8)

        if known_bpm is not None:
            ax.axvline(known_bpm, color="blue", linestyle="--", linewidth=1.2,
                       label=f"detected {known_bpm:.0f} bpm")
            ax.legend(fontsize=7, loc="upper right")

        # Highlight common artifact regions
        ax.axvspan(95, 105, alpha=0.12, color="orange", label="~100 bpm artifact zone")
        ax.grid(True, alpha=0.25)
        if idx == 0:
            ax.set_title("RAW FFT (no detrend / no window / no extra filter) — amplitude in dB")

    axes[-1].set_xlabel("BPM (0–300)")
    plt.tight_layout()
    grid_path = FFT_OUT_DIR / "all_videos_raw_unfiltered_fft.png"
    plt.savefig(grid_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Saved big grid: {grid_path}")

    # Individual clean plots (one per video) for easy inspection
    for key in sorted(all_keys):
        pulse = traces[key].astype(float)
        m = meta.get(key, {})
        stem = m.get("stem", key.split("_")[0])

        X = rfft(pulse - np.mean(pulse))
        mag = np.abs(X) / (len(pulse) / 2)
        power_db = 20 * np.log10(mag + 1e-12)

        plt.figure(figsize=(10, 4))
        plt.plot(freqs_bpm, power_db, linewidth=1.0, color="#d62728")
        plt.xlim(0, 300)
        plt.xlabel("BPM")
        plt.ylabel("Amplitude (dB)")
        plt.title(f"{stem}.mp4 — RAW FFT (no filter, no window) | {m.get('roi','')} / {m.get('method','')}")

        if m.get("bpm"):
            plt.axvline(m["bpm"], color="blue", ls="--", lw=1.5, label=f"peak {m['bpm']:.1f}")
        plt.axvspan(95, 105, alpha=0.15, color="orange")
        plt.legend(fontsize=8)
        plt.grid(True, alpha=0.3)

        individual = FFT_OUT_DIR / f"{stem}_raw_unfiltered_fft.png"
        plt.savefig(individual, dpi=140, bbox_inches="tight")
        plt.close()
        print(f"  Saved {individual.name}")

    print(f"\nAll raw unfiltered FFT plots saved under: {FFT_OUT_DIR}")
    print("Done.")


if __name__ == "__main__":
    main()
