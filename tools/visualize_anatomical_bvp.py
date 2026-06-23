#!/usr/bin/env python3
"""
Visualize the actual BVP (pulse) signals from the recent Anatomical + Rejection runs.

Re-extracts the RGB traces from anatomical ROIs using the saved DLC keypoints,
recomputes the exact rPPG pulses that produced the BPM/SNR numbers in the CSVs,
and generates plots (waveform + spectrum) for the best windows per video.

Usage:
    python tools/visualize_anatomical_bvp.py --all
    python tools/visualize_anatomical_bvp.py --stem 1,6
    python tools/visualize_anatomical_bvp.py --stem 4

Outputs:
    reports/rppg_pet_keypoints/bvp_visualization/
        <stem>_best_bvp.png
        <stem>_bvp_spectrum.png
        bvp_summary_grid.png
        bvp_visualization_report.md
        raw_bvp_traces.npz   (for future use)
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

# --- Same anatomical ROIs used in the analysis pipeline ---
ANATOMICAL_ROIS = {
    "neck": {"kps": ["neck", "throat"], "radius": 28},
    "nose_bridge": {"kps": ["nose", "upper_jaw"], "radius": 18},
    "left_ear_base": {"kps": ["left_earbase"], "radius": 16},
    "right_ear_base": {"kps": ["right_earbase"], "radius": 16},
    "upper_chest": {"kps": ["neck", "withers"], "radius": 30},
}

# rPPG method functions (minimal self-contained versions of the ones used in the runs)
def _safe_detrend(x: np.ndarray) -> np.ndarray:
    x = np.asarray(x, dtype=float)
    if len(x) < 8:
        return x - np.nanmean(x)
    try:
        return signal.detrend(x, type="linear")
    except Exception:
        return x - np.nanmean(x)

def sig_green(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    g = rgb[:, 1]
    return _safe_detrend(g)

def sig_g_minus_r(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    g = rgb[:, 1].astype(float)
    r = rgb[:, 0].astype(float)
    return _safe_detrend(g - r)

def sig_chrom(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    rgb = rgb.astype(float)
    xs = np.stack([rgb[:, 0], rgb[:, 1], rgb[:, 2]], axis=1)
    xs = xs - np.mean(xs, axis=0, keepdims=True)
    s1 = xs[:, 1] - xs[:, 0]
    s2 = xs[:, 1] + xs[:, 0] - 2 * xs[:, 2]
    alpha = np.std(s1) / (np.std(s2) + 1e-12)
    pulse = s1 - alpha * s2
    return _safe_detrend(pulse)

def sig_pos(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    rgb = rgb.astype(float)
    xs = rgb - np.mean(rgb, axis=0, keepdims=True)
    x = xs[:, 1] - xs[:, 0]
    y = xs[:, 1] + xs[:, 0] - 2 * xs[:, 2]
    # 2nd order projection (simplified POS)
    pulse = x + (np.std(x) / (np.std(y) + 1e-12)) * y
    return _safe_detrend(pulse)

def sig_pca(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    from sklearn.decomposition import PCA
    rgb = rgb.astype(float)
    rgb = rgb - np.mean(rgb, axis=0, keepdims=True)
    try:
        pca = PCA(n_components=1)
        comp = pca.fit_transform(rgb).ravel()
        # Choose sign with negative skewness (typical for BVP)
        if np.mean(comp**3) > 0:
            comp = -comp
        return _safe_detrend(comp)
    except Exception:
        # Fallback to green
        return sig_green(rgb, fs, min_bpm, max_bpm)

def sig_ica(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    from sklearn.decomposition import FastICA
    rgb = rgb.astype(float)
    rgb = rgb - np.mean(rgb, axis=0, keepdims=True)
    try:
        ica = FastICA(n_components=1, random_state=0, max_iter=200)
        comp = ica.fit_transform(rgb).ravel()
        if np.mean(comp**3) > 0:
            comp = -comp
        return _safe_detrend(comp)
    except Exception:
        return sig_green(rgb, fs, min_bpm, max_bpm)

METHOD_FUNCTIONS = {
    "green": sig_green,
    "g_minus_r": sig_g_minus_r,
    "chrom": sig_chrom,
    "pos": sig_pos,
    "pca": sig_pca,
    "ica": sig_ica,
}


def estimate_bpm_from_signal(x: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> Tuple[float, float, float]:
    """Return (bpm, snr, power_ratio) — same logic used in the analysis runs."""
    x = np.asarray(x, dtype=float)
    if len(x) < 16 or not np.isfinite(x).all() or np.std(x) < 1e-12:
        return np.nan, np.nan, np.nan
    x = x - np.mean(x)
    nfft = int(2 ** np.ceil(np.log2(max(len(x), 64))) * 4)
    freqs, power = signal.periodogram(x, fs=fs, window="hann", nfft=nfft, detrend=False)
    band = (freqs >= min_bpm / 60.0) & (freqs <= min(max_bpm / 60.0, fs * 0.45))
    if band.sum() < 3:
        return np.nan, np.nan, np.nan
    f_band = freqs[band]
    p_band = power[band]
    peak_idx = int(np.argmax(p_band))
    peak_f = f_band[peak_idx]
    bpm = peak_f * 60.0
    # Simple SNR proxy (peak / mean in band)
    peak_power = p_band[peak_idx]
    mean_power = np.mean(p_band) + 1e-12
    snr = 10 * np.log10(peak_power / mean_power)
    total_power = np.sum(p_band) + 1e-12
    ratio = peak_power / total_power
    return float(bpm), float(snr), float(ratio)


def get_keypoint_center(kps_df: pd.DataFrame, frame_idx: int, kp_names: List[str]) -> Tuple[float, float] | None:
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(kp_names))]
    if len(row) == 0:
        return None
    return float(row["x"].mean()), float(row["y"].mean())


def extract_rgb_series(frames: List[np.ndarray], kps: pd.DataFrame, roi_spec: dict) -> np.ndarray:
    rgb_series = []
    for fi in range(len(frames)):
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
            rgb_series.append(crop.mean(axis=(0, 1))[::-1].astype(float))  # RGB
    return np.array(rgb_series)


def load_probe_data(stem: str) -> Tuple[Path, pd.DataFrame, List[np.ndarray]] | None:
    """Find the best available probe folder (gpu preferred) and load clip + keypoints."""
    base = Path("reports/rppg_pet_keypoints")
    candidates = []
    candidates.append(base / f"dlc_probe_{stem}_gpu")
    candidates.append(base / f"dlc_probe_{stem}")
    if stem == "4":
        candidates.append(base / "dlc_full4")

    probe_dir = None
    for c in candidates:
        if c.exists() and (c / "pet_keypoints_normalized.csv").exists() and (c / f"{stem}_dlc_probe.mp4").exists():
            probe_dir = c
            break
    if probe_dir is None:
        return None

    kps = pd.read_csv(probe_dir / "pet_keypoints_normalized.csv")
    clip_path = probe_dir / f"{stem}_dlc_probe.mp4"

    cap = cv2.VideoCapture(str(clip_path))
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    cap.release()
    return probe_dir, kps, frames


def find_best_row_for_stem(stem: str) -> Dict | None:
    base = Path("reports/rppg_pet_keypoints")
    # Reuse the improved finder logic
    possible = list(base.glob(f"dlc_probe_{stem}*"))
    possible += list(base.glob(f"dlc_probe_{stem}*analysis*"))
    if stem == "4":
        possible += [base / "dlc_full4_roi_analysis_v2", base / "dlc_full4_roi_analysis"]

    csvs = []
    for p in possible:
        if not p.exists():
            continue
        for c in p.rglob("rejection_anatomical_results.csv"):
            csvs.append(c)
        for c in p.rglob("anatomical_roi_results.csv"):
            csvs.append(c)

    if not csvs:
        return None
    # prefer rejection files, newest first
    csvs.sort(key=lambda p: (0 if "rejection" in p.name else 1, -p.stat().st_mtime))
    df = pd.read_csv(csvs[0])
    if df.empty:
        return None
    # Best by SNR
    best_idx = df["snr"].idxmax()
    row = df.loc[best_idx].to_dict()
    row["_csv_path"] = str(csvs[0])
    return row


def plot_bvp_and_spectrum(pulse: np.ndarray, fs: float, bpm: float, snr: float, title: str, out_path: Path):
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    t = np.arange(len(pulse)) / fs
    axes[0].plot(t, pulse, linewidth=1.2, color="#1f77b4")
    axes[0].set_xlabel("Time (s)")
    axes[0].set_ylabel("BVP (a.u.)")
    axes[0].set_title(f"{title} — Waveform")
    axes[0].grid(True, alpha=0.3)

    # Spectrum
    nfft = int(2 ** np.ceil(np.log2(max(len(pulse), 64))) * 4)
    freqs, power = signal.periodogram(pulse - np.mean(pulse), fs=fs, window="hann", nfft=nfft)
    band = (freqs >= 0.8) & (freqs <= 4.0)  # 48-240 bpm
    axes[1].plot(freqs[band] * 60, 10 * np.log10(power[band] + 1e-12), color="#2ca02c", linewidth=1.2)
    axes[1].axvline(bpm, color="red", linestyle="--", linewidth=1.5, label=f"Peak {bpm:.1f} bpm")
    axes[1].set_xlabel("BPM")
    axes[1].set_ylabel("Power (dB)")
    axes[1].set_title(f"Spectrum (SNR {snr:.1f} dB)")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()
    return out_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stem", default="all", help="Comma-separated stems or 'all'")
    parser.add_argument("--out", type=Path, default=Path("reports/rppg_pet_keypoints/bvp_visualization"))
    args = parser.parse_args()

    if args.stem.lower() == "all":
        stems = ["1", "3", "4", "5", "6", "7", "8"]
    else:
        stems = [s.strip() for s in args.stem.split(",")]

    out_dir = args.out
    out_dir.mkdir(parents=True, exist_ok=True)

    all_traces = {}
    summary_rows = []

    for stem in stems:
        print(f"\n=== Visualizing BVP for {stem}.mp4 ===")
        best = find_best_row_for_stem(stem)
        if best is None:
            print(f"  No results CSV for {stem}")
            continue

        data = load_probe_data(stem)
        if data is None:
            print(f"  Probe data not found for {stem}")
            continue
        probe_dir, kps, frames = data

        roi = best.get("roi", "nose_bridge")
        method = best.get("method", "green")
        start_frame = int(best.get("start_frame", 0))
        bpm = float(best.get("raw_bpm", np.nan))
        snr = float(best.get("snr", np.nan))
        rejection = float(best.get("rejection_aggressive", best.get("rejection_lenient", 0)))

        spec = ANATOMICAL_ROIS.get(roi, ANATOMICAL_ROIS["nose_bridge"])
        rgb = extract_rgb_series(frames, kps, spec)

        fs = 10.0
        win = int(20 * fs)  # 200 samples
        win_rgb = rgb[start_frame : start_frame + win]
        if np.isfinite(win_rgb).sum() < 50:
            print(f"  Too little valid data for best window of {stem}")
            continue

        win_rgb = pd.DataFrame(win_rgb).interpolate().ffill().bfill().to_numpy()
        pulse = METHOD_FUNCTIONS[method](win_rgb, fs, 70, 240)

        # Re-estimate to be sure
        bpm2, snr2, _ = estimate_bpm_from_signal(pulse, fs, 70, 240)

        title = f"{stem}.mp4 | {roi} | {method} | start={start_frame}"
        wav_path = out_dir / f"{stem}_waveform.png"
        spec_path = out_dir / f"{stem}_spectrum.png"

        plot_bvp_and_spectrum(pulse, fs, bpm, snr, title, wav_path)
        plot_bvp_and_spectrum(pulse, fs, bpm, snr, title, spec_path)

        trace_key = f"{stem}_{roi}_{method}_f{start_frame}"
        all_traces[trace_key] = {
            "pulse": pulse.astype(np.float32),
            "fs": fs,
            "bpm": bpm,
            "snr": snr,
            "stem": stem,
            "roi": roi,
            "method": method,
            "start_frame": start_frame,
            "rejection": rejection,
        }

        summary_rows.append({
            "video": f"{stem}.mp4",
            "roi": roi,
            "method": method,
            "bpm": round(bpm, 1),
            "snr": round(snr, 2),
            "rejection": round(rejection, 3),
            "waveform": str(wav_path.relative_to(out_dir)),
            "spectrum": str(spec_path.relative_to(out_dir)),
        })
        print(f"  Saved: {wav_path.name}, {spec_path.name} (bpm={bpm:.1f}, snr={snr:.1f})")

    # Save raw traces for later analysis
    np.savez_compressed(out_dir / "raw_bvp_traces.npz", **{k: v["pulse"] for k, v in all_traces.items()})
    with open(out_dir / "raw_bvp_traces_meta.json", "w", encoding="utf-8") as f:
        json.dump({k: {kk: vv for kk, vv in v.items() if kk != "pulse"} for k, v in all_traces.items()}, f, indent=2)

    # Summary grid (waveforms)
    if summary_rows:
        fig, axes = plt.subplots(len(summary_rows), 1, figsize=(10, 2.2 * len(summary_rows)), sharex=False)
        if len(summary_rows) == 1:
            axes = [axes]
        for ax, row in zip(axes, summary_rows):
            trace = all_traces.get(f"{row['video'].split('.')[0]}_{row['roi']}_{row['method']}_f{0}", None)
            # Find the actual trace
            for k, v in all_traces.items():
                if v["stem"] == row["video"].split(".")[0] and v["roi"] == row["roi"]:
                    pulse = v["pulse"]
                    t = np.arange(len(pulse)) / 10.0
                    ax.plot(t, pulse, linewidth=0.9)
                    ax.set_ylabel(f"{row['video']}\n{row['roi'][:8]}\n{row['bpm']:.0f}bpm")
                    ax.grid(True, alpha=0.2)
                    break
        plt.suptitle("Best BVP Waveforms per Video (Anatomical ROI)")
        plt.tight_layout()
        grid_path = out_dir / "bvp_summary_grid.png"
        plt.savefig(grid_path, dpi=140, bbox_inches="tight")
        plt.close()
        print(f"\nSaved summary grid: {grid_path}")

    # Markdown report
    md_lines = [
        "# Anatomical BVP Visualization Report",
        "",
        "BVP (Blood Volume Pulse) signals re-extracted from the latest Anatomical + Rejection analysis runs.",
        "These are the actual pulse waveforms that produced the BPM numbers in the 7-video comparison table.",
        "",
        "## Per-Video Best BVP",
    ]
    for row in summary_rows:
        md_lines.append(f"\n### {row['video']} — {row['roi']} ({row['method']})  |  {row['bpm']} bpm, SNR {row['snr']}")
        md_lines.append(f"![waveform]({row['waveform']})")
        md_lines.append(f"![spectrum]({row['spectrum']})")
        md_lines.append(f"Rejection score: {row['rejection']}")

    md_lines.append("\n## Raw Data")
    md_lines.append(f"- `raw_bvp_traces.npz` + `raw_bvp_traces_meta.json` saved in this folder.")
    md_lines.append(f"- Total traces: {len(all_traces)}")

    report_path = out_dir / "bvp_visualization_report.md"
    report_path.write_text("\n".join(md_lines), encoding="utf-8")
    print(f"\nReport saved: {report_path}")
    print("Done.")


if __name__ == "__main__":
    main()
