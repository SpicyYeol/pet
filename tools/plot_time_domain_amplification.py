#!/usr/bin/env python3
"""
Generate plots for the Time-domain Cardiac Amplification experiments.

Stages compared:
1. After strong cleaning (best artifact removal)
2. After PCA (most periodic component)
3. After time-domain periodicity reinforcement

For each video (3 and 7), we plot:
- Waveform of the best pulse signal at each stage
- Spectrum of that pulse
- Comparison of the three stages side-by-side

This makes the amplification effect visible.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from scipy import signal

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
    rgb = load_raw_rgb(stem)[:n]
    gr = rgb[:, 1] - rgb[:, 0]
    proxy = signal.savgol_filter(gr, window_length=11, polyorder=2)
    if proxy.std() > 1e-6:
        proxy = (proxy - proxy.mean()) / proxy.std()
    return proxy[:n]

def apply_strong_cleaning(rgb: np.ndarray, proxy: np.ndarray) -> np.ndarray:
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

def get_best_pulse(rgb: np.ndarray) -> Tuple[np.ndarray, str, float, float]:
    """Return the best pulse (highest SNR) among the 6 methods."""
    best_pulse = None
    best_name = ""
    best_snr = -np.inf
    best_bpm = 0.0

    for name, fn in METHOD_FUNCTIONS.items():
        pulse = fn(rgb, FS, MIN_BPM, MAX_BPM)
        bpm, snr, _ = estimate_bpm_from_signal(pulse, FS, MIN_BPM, MAX_BPM)
        if snr > best_snr:
            best_snr = snr
            best_bpm = bpm
            best_pulse = pulse
            best_name = name

    return best_pulse, best_name, best_bpm, best_snr

def plot_stage(ax_wave, ax_spec, pulse: np.ndarray, title: str, bpm: float, snr: float):
    t = np.arange(len(pulse)) / FS
    ax_wave.plot(t, pulse, linewidth=0.9)
    ax_wave.set_title(f"{title}\n{bpm:.1f} bpm (SNR {snr:.1f})")
    ax_wave.set_ylabel("Amplitude")
    ax_wave.grid(True, alpha=0.3)

    # Spectrum
    nfft = int(2 ** np.ceil(np.log2(max(len(pulse), 64))) * 4)
    f, P = signal.periodogram(pulse - np.mean(pulse), fs=FS, window="hann", nfft=nfft)
    bpm_axis = f * 60
    band = (bpm_axis >= 40) & (bpm_axis <= 260)
    ax_spec.plot(bpm_axis[band], 10 * np.log10(P[band] + 1e-12), linewidth=0.9)
    ax_spec.axvline(bpm, color="red", linestyle="--", linewidth=1.2, label=f"Peak {bpm:.1f}")
    ax_spec.axvspan(95, 105, alpha=0.12, color="orange")
    ax_spec.set_xlabel("BPM")
    ax_spec.set_ylabel("Power (dB)")
    ax_spec.set_xlim(40, 260)
    ax_spec.grid(True, alpha=0.3)

def main():
    out_dir = Path("reports/rppg_pet_keypoints/time_domain_amplification_plots")
    out_dir.mkdir(parents=True, exist_ok=True)

    for stem in ["3", "7"]:
        print(f"Generating plots for Video {stem} ...")
        rgb = load_raw_rgb(stem)
        proxy = load_panting_proxy(stem, len(rgb))

        # Stage 1: After strong cleaning
        cleaned = apply_strong_cleaning(rgb, proxy)
        pulse1, name1, bpm1, snr1 = get_best_pulse(cleaned)

        # Stage 2: PCA most periodic component
        from sklearn.decomposition import PCA
        pca = PCA(n_components=3)
        comps = pca.fit_transform(cleaned)
        scores = []
        for i in range(3):
            p = comps[:, i]
            _, snr, _ = estimate_bpm_from_signal(p, FS, MIN_BPM, MAX_BPM)
            scores.append(snr)
        best_idx = int(np.argmax(scores))
        pca_pulse = comps[:, best_idx]
        # Make it 3-channel fake for method functions
        pca_rgb = np.tile(pca_pulse, (3, 1)).T
        pulse2, name2, bpm2, snr2 = get_best_pulse(pca_rgb)

        # Stage 3: Periodicity reinforcement on cleaned green
        g_clean = cleaned[:, 1]
        period = int(FS * 60 / max(bpm1, 60)) if bpm1 > 60 else 10
        reinforced = g_clean.copy()
        for shift in [period, 2 * period]:
            if shift < len(g_clean):
                reinforced[shift:] += g_clean[:-shift]
                reinforced[:shift] += g_clean[-shift:] * 0.3   # wrap around lightly
        reinforced = reinforced / 3.0
        reinforced_rgb = np.tile(reinforced, (3, 1)).T
        pulse3, name3, bpm3, snr3 = get_best_pulse(reinforced_rgb)

        # Create figure
        fig, axes = plt.subplots(3, 2, figsize=(14, 10))
        fig.suptitle(f"Video {stem} - Time-domain Cardiac Amplification Stages", fontsize=14)

        plot_stage(axes[0, 0], axes[0, 1], pulse1, f"Stage 1: After Strong Cleaning\nBest: {name1}", bpm1, snr1)
        plot_stage(axes[1, 0], axes[1, 1], pulse2, f"Stage 2: After PCA (Periodic Component)\nBest: {name2}", bpm2, snr2)
        plot_stage(axes[2, 0], axes[2, 1], pulse3, f"Stage 3: After Periodicity Reinforcement\nBest: {name3}", bpm3, snr3)

        axes[0, 0].set_xlabel("Time (s)")
        axes[1, 0].set_xlabel("Time (s)")
        axes[2, 0].set_xlabel("Time (s)")

        plt.tight_layout()
        save_path = out_dir / f"video{stem}_amplification_stages.png"
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        plt.close()
        print(f"  Saved: {save_path}")

    print(f"\nAll amplification plots saved under: {out_dir}")

if __name__ == "__main__":
    main()