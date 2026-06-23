#!/usr/bin/env python3
"""
A + B combined experiment:
- Spatial texture suppression (Laplacian / DoG) on actual image patches to suppress fur.
- Combined with previous temporal differencing + panting subtraction (from A+B prototype).

Focus on video 3 and 7 (hardest cases).
Goal: See if adding spatial fur suppression moves energy closer to the true high heart rate
instead of the 100bpm panting artifact.

This directly follows the user's suggestion of using differencing/spatial processing
to "remove fur and extract the remaining areas".
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import List, Tuple

import cv2
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy import signal

# Focused promising ROIs from previous experiments
FOCUSED_ROIS = {
    "throat_exposed": {"kps": ["throat_base", "throat_end"], "radius": 22},
    "right_ear_base": {"kps": ["right_earbase"], "radius": 16},
    "muzzle_skin": {"kps": ["nose", "upper_jaw"], "radius": 13},
    "nose_bridge": {"kps": ["nose", "upper_jaw"], "radius": 18},
}


def get_keypoint_center(kps_df: pd.DataFrame, frame_idx: int, kp_names: List[str]) -> Tuple[float, float] | None:
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(kp_names))]
    if len(row) == 0:
        return None
    return float(row["x"].mean()), float(row["y"].mean())


def extract_patch_image(frame: np.ndarray, center: Tuple[float, float], radius: int) -> np.ndarray:
    """Return the actual small image patch (not mean)."""
    h, w = frame.shape[:2]
    cx, cy = center
    x1, y1 = max(0, int(cx - radius)), max(0, int(cy - radius))
    x2, y2 = min(w, int(cx + radius)), min(h, int(cy + radius))
    return frame[y1:y2, x1:x2]


def compute_spatial_suppressed_mean(patch: np.ndarray, method: str = "laplacian") -> np.ndarray:
    """
    Apply spatial processing to suppress fur texture and return a 3-channel "enhanced" mean.
    """
    if patch.size == 0:
        return np.array([np.nan, np.nan, np.nan])

    # Convert to float
    p = patch.astype(np.float32)

    if method == "laplacian":
        # Laplacian highlights edges/changes, suppresses uniform fur areas
        lap = cv2.Laplacian(p, cv2.CV_32F, ksize=3)
        # Take absolute and mean (or we can use the variance as signal strength)
        enhanced = np.abs(lap)
        mean_val = enhanced.mean(axis=(0, 1))
    elif method == "dog":
        # Difference of Gaussians (band-pass like, good for texture suppression)
        g1 = cv2.GaussianBlur(p, (0, 0), sigmaX=1.0)
        g2 = cv2.GaussianBlur(p, (0, 0), sigmaX=3.0)
        dog = g1 - g2
        enhanced = np.abs(dog)
        mean_val = enhanced.mean(axis=(0, 1))
    else:
        mean_val = p.mean(axis=(0, 1))

    return mean_val[::-1]  # BGR -> RGB


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stem", default="3,7")
    parser.add_argument("--method", default="laplacian", choices=["laplacian", "dog"])
    args = parser.parse_args()
    stems = [s.strip() for s in args.stem.split(",")]

    fs = 10.0
    win = 200
    out_dir = Path("reports/rppg_pet_keypoints/fur_spatial_differencing")
    out_dir.mkdir(parents=True, exist_ok=True)

    for stem in stems:
        print(f"\n=== Spatial + Temporal Fur Suppression Experiment: video {stem} ===")

        base = Path("reports/rppg_pet_keypoints")
        probe = base / f"dlc_probe_{stem}_gpu"
        if not probe.exists():
            probe = base / f"dlc_probe_{stem}"
        if not probe.exists():
            print("  Probe not found")
            continue

        kps = pd.read_csv(probe / "pet_keypoints_normalized.csv")
        clip_path = probe / f"{stem}_dlc_probe.mp4"

        cap = cv2.VideoCapture(str(clip_path))
        frames = []
        while True:
            ok, f = cap.read()
            if not ok:
                break
            frames.append(f)
        cap.release()

        start = 0
        print(f"  Processing window starting at frame {start} with {args.method} spatial suppression...")

        all_traces = {}

        for roi_name, spec in FOCUSED_ROIS.items():
            rgb_series = []
            for fi in range(start, start + win):
                if fi >= len(frames):
                    break
                center = get_keypoint_center(kps, fi, spec["kps"])
                if center is None:
                    rgb_series.append([np.nan, np.nan, np.nan])
                    continue

                patch = extract_patch_image(frames[fi], center, spec["radius"])
                enhanced_mean = compute_spatial_suppressed_mean(patch, method=args.method)
                rgb_series.append(enhanced_mean)

            rgb = np.array(rgb_series)
            # Interpolate
            for c in range(3):
                col = pd.Series(rgb[:, c])
                rgb[:, c] = col.interpolate().ffill().bfill().to_numpy()

            all_traces[f"{roi_name}_spatial_{args.method}"] = rgb

            # Also compute a simple temporal 1st difference version
            diff1 = np.diff(rgb, axis=0)
            all_traces[f"{roi_name}_spatial+1st_diff"] = diff1

        # Quick spectrum comparison for key ROIs
        plt.figure(figsize=(12, 8))
        key_rois = ["throat_exposed", "right_ear_base", "nose_bridge"]

        for roi_name in key_rois:
            for variant in [f"{roi_name}_spatial_{args.method}", f"{roi_name}_spatial+1st_diff"]:
                if variant not in all_traces:
                    continue
                sig = all_traces[variant]
                if sig.ndim == 2:
                    ch = sig[:, 1]  # green-like
                else:
                    ch = sig
                if len(ch) < 8:
                    continue
                nfft = 1024
                f, P = signal.periodogram(ch - np.mean(ch), fs=fs, window="hann", nfft=nfft)
                bpm = f * 60
                band = (bpm >= 40) & (bpm <= 260)
                label = variant.replace("_", " ")
                plt.plot(bpm[band], 10 * np.log10(P[band] + 1e-12), linewidth=0.9, label=label)

        plt.axvspan(95, 105, alpha=0.15, color="red", label="100bpm artifact zone")
        plt.title(f"Video {stem} — Spatial Fur Suppression ({args.method}) + Temporal Diff Spectra")
        plt.xlabel("BPM")
        plt.ylabel("Power (dB)")
        plt.legend(fontsize=7, loc="upper right")
        plt.grid(True, alpha=0.3)
        plt.xlim(40, 260)

        plot_path = out_dir / f"video{stem}_spatial_fur_suppression_{args.method}.png"
        plt.savefig(plot_path, dpi=150, bbox_inches="tight")
        plt.close()
        print(f"  Saved: {plot_path.name}")

    print(f"\nAll A+B spatial differencing results saved under: {out_dir}")


if __name__ == "__main__":
    main()
