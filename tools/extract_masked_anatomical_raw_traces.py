#!/usr/bin/env python3
"""
B option: Actively combine anatomical keypoint ROIs with YOLO segmentation mask
to re-extract cleaner raw RGB traces (before any rPPG method).

Goal: See if intersecting the keypoint patch with the animal body mask
significantly reduces the massive non-cardiac variance we saw in raw traces
for videos 3 and 7 (and improves overall waveform quality upstream of rejection).

Usage (focused on the worst cases first):
    python tools/extract_masked_anatomical_raw_traces.py --stem 3,7

It will:
- Load the existing "best" window info from rejection_anatomical_results.csv
- Run YOLO seg on the small probe clip
- Re-extract raw RGB using (keypoint patch ∩ animal mask)
- Compare old (unmasked) vs new (masked) raw traces quantitatively + visually
- Save plots and .npz with both versions
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy import signal
from ultralytics import YOLO

# Same anatomical ROIs
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


def find_best_row(stem: str) -> Dict | None:
    base = Path("reports/rppg_pet_keypoints")
    candidates = list(base.glob(f"dlc_probe_{stem}*"))
    candidates += list(base.glob(f"dlc_probe_{stem}*analysis*"))
    if stem == "4":
        candidates += [base / "dlc_full4_roi_analysis_v2"]

    csvs = []
    for c in candidates:
        for p in c.rglob("rejection_anatomical_results.csv"):
            csvs.append(p)
    if not csvs:
        return None
    csvs.sort(key=lambda p: -p.stat().st_mtime)
    df = pd.read_csv(csvs[0])
    if df.empty:
        return None
    idx = df["snr"].idxmax()
    row = df.loc[idx].to_dict()
    row["_csv_path"] = str(csvs[0])
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
                    if not ok:
                        break
                    frames.append(f)
                cap.release()
                return folder, kps, frames
    return None, None, None


def get_animal_mask(frame: np.ndarray, model: YOLO, conf: float = 0.2, imgsz: int = 640) -> np.ndarray:
    """Run YOLO seg and return a boolean mask for the main animal instance (largest area)."""
    h, w = frame.shape[:2]
    results = model.predict(frame, conf=conf, imgsz=imgsz, verbose=False, device=0 if model.device.type == 'cuda' else 'cpu')
    if not results or results[0].masks is None:
        return np.ones((h, w), dtype=bool)

    masks = results[0].masks.data.cpu().numpy()  # (N, mh, mw)
    boxes = results[0].boxes
    if len(masks) == 0:
        return np.ones((h, w), dtype=bool)

    # Resize masks to frame size and find the largest "animal" mask
    best_mask = None
    best_area = 0
    for i, m in enumerate(masks):
        m_resized = cv2.resize(m.astype(np.float32), (w, h), interpolation=cv2.INTER_NEAREST) > 0.5
        area = m_resized.sum()
        if area > best_area:
            best_area = area
            best_mask = m_resized

    if best_mask is None:
        return np.ones((h, w), dtype=bool)
    return best_mask


def extract_masked_rgb_series(
    frames: List[np.ndarray],
    kps: pd.DataFrame,
    roi_spec: dict,
    start_frame: int,
    win_len: int,
    seg_model: YOLO,
    old_rgb: np.ndarray | None = None
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Returns:
      masked_rgb: (win_len, 3)  -- mean RGB only inside (patch ∩ animal_mask)
      mask_coverage: (win_len,)  -- fraction of patch pixels that were inside the animal mask
    """
    rgb_series = []
    coverage_series = []

    for offset in range(win_len):
        fi = start_frame + offset
        if fi >= len(frames):
            break

        center = get_keypoint_center(kps, fi, roi_spec["kps"])
        if center is None:
            rgb_series.append([np.nan, np.nan, np.nan])
            coverage_series.append(0.0)
            continue

        cx, cy = center
        r = roi_spec["radius"]
        h, w = frames[fi].shape[:2]
        x1, y1 = max(0, int(cx - r)), max(0, int(cy - r))
        x2, y2 = min(w, int(cx + r)), min(h, int(cy + r))

        # Get animal mask for this frame (expensive if done every frame, but probes are tiny)
        animal_mask = get_animal_mask(frames[fi], seg_model)

        # Patch mask
        patch_mask = np.zeros((h, w), dtype=bool)
        patch_mask[y1:y2, x1:x2] = True

        # Intersection
        valid = patch_mask & animal_mask
        n_valid = valid.sum()

        if n_valid < 4:  # almost no overlap with animal
            rgb_series.append([np.nan, np.nan, np.nan])
            coverage_series.append(0.0)
            continue

        crop = frames[fi][valid]
        mean_rgb = crop.mean(axis=0)[::-1]  # BGR -> RGB
        rgb_series.append(mean_rgb.astype(float))

        # Coverage relative to the original patch area
        patch_area = (y2 - y1) * (x2 - x1)
        coverage = n_valid / max(patch_area, 1)
        coverage_series.append(float(coverage))

    masked_rgb = np.array(rgb_series)
    # Interpolate small gaps
    for c in range(3):
        col = pd.Series(masked_rgb[:, c])
        masked_rgb[:, c] = col.interpolate().ffill().bfill().to_numpy()

    return masked_rgb, np.array(coverage_series)


def plot_comparison(stem: str, old_rgb: np.ndarray, new_rgb: np.ndarray, coverage: np.ndarray,
                    roi: str, start: int, fs: float, out_dir: Path):
    t = np.arange(len(old_rgb)) / fs
    fig, axes = plt.subplots(3, 1, figsize=(12, 10))

    # 1. Raw G channel comparison (most commonly used)
    axes[0].plot(t, old_rgb[:, 1], label="Old (no mask)", color="#d62728", linewidth=0.9, alpha=0.8)
    axes[0].plot(t, new_rgb[:, 1], label="Masked (patch ∩ animal)", color="#2ca02c", linewidth=0.9)
    axes[0].set_ylabel("Green channel (raw)")
    axes[0].set_title(f"Video {stem} — Raw Green trace: Unmasked vs Masked (ROI={roi}, start={start})")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # 2. G-R (common simple rPPG input)
    old_gr = old_rgb[:, 1] - old_rgb[:, 0]
    new_gr = new_rgb[:, 1] - new_rgb[:, 0]
    axes[1].plot(t, old_gr, label="Old G-R", color="#d62728", linewidth=0.9, alpha=0.8)
    axes[1].plot(t, new_gr, label="Masked G-R", color="#2ca02c", linewidth=0.9)
    axes[1].set_ylabel("G-R (raw)")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    # 3. Spectra comparison (raw, no advanced preprocessing)
    nfft = int(2 ** np.ceil(np.log2(max(len(old_gr), 64))) * 4)
    for name, sig in [("Old G-R", old_gr), ("Masked G-R", new_gr)]:
        f, P = signal.periodogram(sig - np.mean(sig), fs=fs, window="hann", nfft=nfft)
        bpm = f * 60
        band = (bpm >= 40) & (bpm <= 300)
        color = "#d62728" if "Old" in name else "#2ca02c"
        axes[2].plot(bpm[band], 10 * np.log10(P[band] + 1e-12), label=name, linewidth=0.9, color=color)
    axes[2].axvspan(95, 105, alpha=0.12, color="orange", label="~100 bpm artifact")
    axes[2].set_xlabel("BPM")
    axes[2].set_ylabel("Power (dB)")
    axes[2].set_xlim(40, 280)
    axes[2].legend(fontsize=8)
    axes[2].grid(True, alpha=0.3)
    axes[2].set_title("Raw spectrum comparison (before any rPPG method)")

    plt.tight_layout()
    out_path = out_dir / f"video{stem}_masked_vs_unmasked_raw.png"
    out_dir.mkdir(parents=True, exist_ok=True)
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved comparison plot: {out_path.name}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stem", default="3,7", help="Comma-separated stems, e.g. 3,7 or all")
    parser.add_argument("--seg-model", type=Path, default=Path("yolo11n-seg.pt"))
    parser.add_argument("--out", type=Path, default=Path("reports/rppg_pet_keypoints/masked_anatomical_traces"))
    args = parser.parse_args()

    if args.stem.lower() == "all":
        stems = ["1", "3", "4", "5", "6", "7", "8"]
    else:
        stems = [s.strip() for s in args.stem.split(",")]

    out_dir = args.out
    out_dir.mkdir(parents=True, exist_ok=True)

    print("Loading YOLO segmentation model...")
    seg_model = YOLO(str(args.seg_model))
    # Force GPU if available
    try:
        seg_model.to("cuda:0")
    except Exception:
        pass

    fs = 10.0
    win = 200

    for stem in stems:
        print(f"\n=== Processing masked traces for video {stem} ===")
        best = find_best_row(stem)
        if best is None:
            print(f"  No previous results for {stem}, skipping")
            continue

        probe_dir, kps, frames = load_probe(stem)
        if probe_dir is None:
            print(f"  Probe data not found")
            continue

        roi_name = best.get("roi", "nose_bridge")
        start = int(best.get("start_frame", 0))
        spec = ANATOMICAL_ROIS.get(roi_name, ANATOMICAL_ROIS["nose_bridge"])

        # Load the old (unmasked) raw trace that we already have from the previous diagnostic
        old_npz = Path("reports/rppg_pet_keypoints/raw_trace_diagnostics") / f"video{stem}_raw_rgb_window.npz"
        old_rgb = None
        if old_npz.exists():
            old_rgb = np.load(old_npz)["rgb"]

        print(f"  Extracting masked raw RGB for ROI={roi_name}, window start={start}...")
        masked_rgb, coverage = extract_masked_rgb_series(
            frames, kps, spec, start, win, seg_model, old_rgb
        )

        # Basic stats comparison
        if old_rgb is not None:
            old_var = np.var(old_rgb[:, 1] - old_rgb[:, 0])
            new_var = np.var(masked_rgb[:, 1] - masked_rgb[:, 0])
            print(f"  G-R AC variance: old={old_var:.1f}  →  masked={new_var:.1f}  (reduction: {100*(1-new_var/old_var):.1f}%)")
            print(f"  Mean mask coverage in patch: {np.mean(coverage)*100:.1f}%")

        # Save
        np.savez_compressed(
            out_dir / f"video{stem}_masked_raw_rgb.npz",
            masked_rgb=masked_rgb.astype(np.float32),
            coverage=coverage.astype(np.float32),
            meta={
                "stem": stem,
                "roi": roi_name,
                "start_frame": start,
                "old_variance_gr": float(np.var(old_rgb[:,1]-old_rgb[:,0])) if old_rgb is not None else None,
                "new_variance_gr": float(np.var(masked_rgb[:,1]-masked_rgb[:,0])),
            }
        )

        if old_rgb is not None:
            plot_comparison(stem, old_rgb, masked_rgb, coverage, roi_name, start, fs, out_dir)

    print(f"\nAll masked anatomical raw traces saved under: {out_dir}")


if __name__ == "__main__":
    main()
