from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import warnings
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2
import numpy as np
import pandas as pd
from joblib import dump
from scipy import signal
from sklearn.ensemble import RandomForestClassifier
from sklearn.exceptions import ConvergenceWarning

from evaluate_rppg_methods import (
    METHOD_FUNCTIONS,
    METHODS,
    ROI_MODES,
    BoxState,
    clamp_box,
    expand_box,
    interpolate_rgb,
    natural_sort_key,
    robust_rgb,
    roi_from_box,
    select_best_box,
    smooth_box,
    weighted_median,
)


@dataclass(frozen=True)
class RegionSpec:
    id: str
    label: str
    kind: str
    mode: str | None = None
    row: int | None = None
    col: int | None = None
    rows: int | None = None
    cols: int | None = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Evaluate single-view RGB rPPG with a candidate bank, SQI selector, and tracker."
    )
    parser.add_argument("--labels-csv", type=Path, default=Path("dataset_front/video_labels_ocr.csv"))
    parser.add_argument("--model", type=Path, default=Path("DogFaceModel_Deploy/best.pt"))
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_single_view_sqi"))
    parser.add_argument(
        "--ui-data",
        type=Path,
        default=Path("ui/src/generated/rppgSingleViewSqi.ts"),
        help="Generated TypeScript data consumed by the UI.",
    )
    parser.add_argument("--sample-fps", type=float, default=15.0)
    parser.add_argument("--detect-every", type=int, default=8)
    parser.add_argument("--conf", type=float, default=0.25)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="0", help="YOLO device (0=first GPU, cpu, cuda, etc.)")
    parser.add_argument("--window-sec", type=float, default=20.0)
    parser.add_argument("--step-sec", type=float, default=5.0)
    parser.add_argument("--min-bpm", type=float, default=80.0)
    parser.add_argument("--max-bpm", type=float, default=240.0)
    parser.add_argument("--max-box-age", type=int, default=30)
    parser.add_argument("--grid-rows", type=int, default=5)
    parser.add_argument("--grid-cols", type=int, default=5)
    parser.add_argument("--top-peaks", type=int, default=4)
    parser.add_argument("--track-candidates-per-window", type=int, default=40)
    parser.add_argument("--track-jump-bpm", type=float, default=18.0)
    parser.add_argument("--no-cache", action="store_true")
    return parser.parse_args()


def make_region_catalog(rows: int, cols: int) -> list[RegionSpec]:
    regions = [
        RegionSpec("face_full", "Full face", "roi", mode="face_full"),
        RegionSpec("upper_face", "Upper face", "roi", mode="upper_face"),
        RegionSpec("mid_face", "Mid face", "roi", mode="mid_face"),
        RegionSpec("lower_face", "Lower face", "roi", mode="lower_face"),
    ]
    for row in range(rows):
        for col in range(cols):
            regions.append(
                RegionSpec(
                    id=f"patch_r{row + 1:02d}_c{col + 1:02d}",
                    label=f"Patch R{row + 1} C{col + 1}",
                    kind="patch",
                    row=row,
                    col=col,
                    rows=rows,
                    cols=cols,
                )
            )
    return regions


def crop_region(frame: np.ndarray, box: np.ndarray, region: RegionSpec) -> np.ndarray:
    if region.kind == "roi" and region.mode is not None:
        return roi_from_box(frame, box, region.mode)

    height, width = frame.shape[:2]
    x1, y1, x2, y2 = clamp_box(box, width, height)
    bw = x2 - x1
    bh = y2 - y1

    # Avoid detector-box borders; fur/background edges tend to dominate there.
    core_x1 = x1 + bw * 0.12
    core_x2 = x1 + bw * 0.88
    core_y1 = y1 + bh * 0.12
    core_y2 = y1 + bh * 0.88
    rows = int(region.rows or 1)
    cols = int(region.cols or 1)
    row = int(region.row or 0)
    col = int(region.col or 0)
    patch_w = (core_x2 - core_x1) / cols
    patch_h = (core_y2 - core_y1) / rows
    pad_x = patch_w * 0.08
    pad_y = patch_h * 0.08
    crop_box = np.array(
        [
            core_x1 + patch_w * col - pad_x,
            core_y1 + patch_h * row - pad_y,
            core_x1 + patch_w * (col + 1) + pad_x,
            core_y1 + patch_h * (row + 1) + pad_y,
        ],
        dtype=float,
    )
    cx1, cy1, cx2, cy2 = clamp_box(crop_box, width, height).round().astype(int)
    return frame[cy1:cy2, cx1:cx2]


def region_box_from_face_box(frame_shape: tuple[int, int] | tuple[int, int, int], box: np.ndarray, region: RegionSpec) -> np.ndarray:
    height, width = frame_shape[:2]
    x1, y1, x2, y2 = clamp_box(box[:4], width, height)
    bw = x2 - x1
    bh = y2 - y1
    if region.kind == "roi" and region.mode is not None:
        rel = {
            "face_full": (0.12, 0.12, 0.88, 0.88),
            "upper_face": (0.22, 0.08, 0.78, 0.42),
            "mid_face": (0.18, 0.28, 0.82, 0.68),
            "lower_face": (0.20, 0.55, 0.80, 0.94),
        }[region.mode]
        rx1, ry1, rx2, ry2 = rel
        crop_box = np.array([x1 + bw * rx1, y1 + bh * ry1, x1 + bw * rx2, y1 + bh * ry2])
        return clamp_box(crop_box, width, height)

    core_x1 = x1 + bw * 0.12
    core_x2 = x1 + bw * 0.88
    core_y1 = y1 + bh * 0.12
    core_y2 = y1 + bh * 0.88
    rows = int(region.rows or 1)
    cols = int(region.cols or 1)
    row = int(region.row or 0)
    col = int(region.col or 0)
    patch_w = (core_x2 - core_x1) / cols
    patch_h = (core_y2 - core_y1) / rows
    pad_x = patch_w * 0.08
    pad_y = patch_h * 0.08
    crop_box = np.array(
        [
            core_x1 + patch_w * col - pad_x,
            core_y1 + patch_h * row - pad_y,
            core_x1 + patch_w * (col + 1) + pad_x,
            core_y1 + patch_h * (row + 1) + pad_y,
        ],
        dtype=float,
    )
    return clamp_box(crop_box, width, height)


def patch_grid_boxes(frame_shape: tuple[int, int] | tuple[int, int, int], box: np.ndarray, rows: int, cols: int) -> list[np.ndarray]:
    height, width = frame_shape[:2]
    x1, y1, x2, y2 = clamp_box(box[:4], width, height)
    bw = x2 - x1
    bh = y2 - y1
    core_x1 = x1 + bw * 0.12
    core_x2 = x1 + bw * 0.88
    core_y1 = y1 + bh * 0.12
    core_y2 = y1 + bh * 0.88
    patch_w = (core_x2 - core_x1) / cols
    patch_h = (core_y2 - core_y1) / rows
    grid: list[np.ndarray] = []
    for row in range(rows):
        for col in range(cols):
            grid.append(
                clamp_box(
                    np.array(
                        [
                            core_x1 + patch_w * col,
                            core_y1 + patch_h * row,
                            core_x1 + patch_w * (col + 1),
                            core_y1 + patch_h * (row + 1),
                        ],
                        dtype=float,
                    ),
                    width,
                    height,
                )
            )
    return grid


def extract_candidate_traces(
    video_path: Path,
    model: Any,
    args: argparse.Namespace,
    cache_path: Path,
    regions: list[RegionSpec],
) -> dict[str, Any]:
    required_keys = ["times", "boxes", "source_fps", "effective_fps", "frame_count"]
    required_keys.extend([f"rgb__{region.id}" for region in regions])
    required_keys.extend([f"valid__{region.id}" for region in regions])
    if cache_path.exists() and not args.no_cache:
        data = np.load(cache_path, allow_pickle=True)
        if all(key in data.files for key in required_keys):
            return {key: data[key] for key in data.files}

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")
    source_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_step = max(1, int(round(source_fps / args.sample_fps)))
    effective_fps = source_fps / frame_step

    times: list[float] = []
    box_rows: list[list[float]] = []
    rgb_by_region: dict[str, list[list[float]]] = {region.id: [] for region in regions}
    valid_by_region: dict[str, list[float]] = {region.id: [] for region in regions}
    state = BoxState()
    frame_index = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_index % frame_step != 0:
            frame_index += 1
            continue

        height, width = frame.shape[:2]
        should_detect = state.xyxy is None or state.age >= args.detect_every
        if should_detect:
            result = model.predict(
                frame,
                conf=args.conf,
                imgsz=args.imgsz,
                device=args.device,
                verbose=False,
            )[0]
            detected_box, detected_conf = select_best_box(result)
            if detected_box is not None:
                detected_box = expand_box(detected_box, width, height)
                state.xyxy = smooth_box(state.xyxy, detected_box)
                state.conf = detected_conf
                state.age = 0
            else:
                state.age += 1
        else:
            state.age += 1

        usable_box = state.xyxy if state.xyxy is not None and state.age <= args.max_box_age else None
        times.append(frame_index / source_fps)
        if usable_box is None:
            box_rows.append([np.nan, np.nan, np.nan, np.nan, 0.0, float(state.age)])
            for region in regions:
                rgb_by_region[region.id].append([np.nan, np.nan, np.nan])
                valid_by_region[region.id].append(0.0)
        else:
            box_rows.append([*usable_box.tolist(), state.conf, float(state.age)])
            for region in regions:
                crop = crop_region(frame, usable_box, region)
                rgb, valid_fraction = robust_rgb(crop)
                rgb_by_region[region.id].append(rgb.tolist())
                valid_by_region[region.id].append(valid_fraction)

        frame_index += 1

    cap.release()
    payload: dict[str, Any] = {
        "times": np.array(times, dtype=float),
        "boxes": np.array(box_rows, dtype=float),
        "source_fps": np.array([source_fps], dtype=float),
        "effective_fps": np.array([effective_fps], dtype=float),
        "frame_count": np.array([frame_count], dtype=int),
    }
    for region in regions:
        payload[f"rgb__{region.id}"] = np.array(rgb_by_region[region.id], dtype=float)
        payload[f"valid__{region.id}"] = np.array(valid_by_region[region.id], dtype=float)

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(cache_path, **payload)
    return payload


def range_error_for(pred: float, bpm_min: float, bpm_max: float) -> tuple[float, bool]:
    if not np.isfinite(pred):
        return np.nan, False
    if pred < bpm_min:
        return float(bpm_min - pred), False
    if pred > bpm_max:
        return float(pred - bpm_max), False
    return 0.0, True


def band_power_at(freqs: np.ndarray, power: np.ndarray, bpm: float) -> float:
    if len(freqs) == 0:
        return 0.0
    target_hz = bpm / 60.0
    idx = int(np.argmin(np.abs(freqs - target_hz)))
    return float(power[idx])


def spectrum_peaks(
    x: np.ndarray,
    fs: float,
    min_bpm: float,
    max_bpm: float,
    top_k: int,
) -> list[dict[str, float]]:
    x = np.asarray(x, dtype=float)
    if len(x) < 16 or not np.isfinite(x).all() or np.std(x) < 1e-12:
        return []
    x = x - np.mean(x)
    nfft = int(2 ** math.ceil(math.log2(max(len(x), 64))) * 4)
    freqs, power = signal.periodogram(x, fs=fs, window="hann", nfft=nfft, detrend=False)
    lo = min_bpm / 60.0
    hi = min(max_bpm / 60.0, fs * 0.45)
    mask = (freqs >= lo) & (freqs <= hi)
    if mask.sum() < 3:
        return []

    band_freqs = freqs[mask]
    band_power = power[mask]
    peak_indices, _ = signal.find_peaks(band_power)
    if len(peak_indices) == 0:
        peak_indices = np.arange(len(band_power))
    max_idx = int(np.argmax(band_power))
    peak_indices = np.unique(np.concatenate([peak_indices, np.array([max_idx])]))
    ordered = sorted(peak_indices.tolist(), key=lambda idx: float(band_power[idx]), reverse=True)[:top_k]

    total_power = float(np.sum(band_power) + 1e-12)
    median_noise = float(np.median(band_power) + 1e-12)
    probs = band_power / total_power
    entropy = float(-(probs * np.log(probs + 1e-12)).sum() / math.log(len(probs)))

    peaks: list[dict[str, float]] = []
    for rank, idx in enumerate(ordered, start=1):
        peak_power = float(band_power[idx])
        bpm = float(band_freqs[idx] * 60.0)
        h2_power = band_power_at(band_freqs, band_power, bpm * 2.0)
        half_power = band_power_at(band_freqs, band_power, bpm / 2.0)
        peaks.append(
            {
                "peak_rank": float(rank),
                "peak_bpm": bpm,
                "peak_power": peak_power,
                "snr": peak_power / median_noise,
                "total_power_ratio": peak_power / total_power,
                "spectral_entropy": entropy,
                "h2_ratio": h2_power / (peak_power + 1e-12),
                "half_ratio": half_power / (peak_power + 1e-12),
            }
        )
    return peaks


def box_motion_for_window(times: np.ndarray, boxes: np.ndarray, start_sec: float, end_sec: float) -> float:
    mask = (times >= start_sec) & (times <= end_sec)
    window_boxes = boxes[mask, :4] if len(boxes) else np.empty((0, 4))
    good = np.isfinite(window_boxes).all(axis=1)
    if good.sum() < 3:
        return 0.0
    b = window_boxes[good]
    centers = np.column_stack([(b[:, 0] + b[:, 2]) / 2.0, (b[:, 1] + b[:, 3]) / 2.0])
    diag = np.sqrt(np.maximum((b[:, 2] - b[:, 0]) ** 2 + (b[:, 3] - b[:, 1]) ** 2, 1.0))
    deltas = np.sqrt(np.sum(np.diff(centers, axis=0) ** 2, axis=1))
    scale = float(np.nanmedian(diag[:-1])) if len(diag) > 1 else 1.0
    return float(np.nanmedian(deltas) / max(scale, 1.0))


def median_valid_for_window(times: np.ndarray, valid: np.ndarray, start_sec: float, end_sec: float) -> float:
    mask = (times >= start_sec) & (times <= end_sec)
    values = valid[mask]
    values = values[np.isfinite(values)]
    if len(values) == 0:
        return 0.0
    return float(np.median(values))


def quality_score(row: dict[str, Any]) -> float:
    snr = max(float(row["snr"]), 0.0)
    ratio = max(float(row["total_power_ratio"]), 0.0)
    entropy_quality = 1.0 - min(max(float(row["spectral_entropy"]), 0.0), 1.0)
    valid = min(max(float(row["valid_fraction"]), 0.0), 1.0)
    motion = max(float(row["box_motion"]), 0.0)
    h2 = min(max(float(row["h2_ratio"]), 0.0), 1.5)
    half = min(max(float(row["half_ratio"]), 0.0), 2.0)
    rank = max(float(row["peak_rank"]), 1.0)
    return float(
        1.05 * min(math.log1p(snr), 5.0)
        + 0.85 * min(math.log1p(ratio * 100.0), 4.0)
        + 1.25 * entropy_quality
        + 0.65 * valid
        + 0.20 * h2
        - 0.18 * half
        - 0.45 * min(motion * 20.0, 3.0)
        - 0.22 * (rank - 1.0)
    )


def evaluate_region_candidates(
    video_name: str,
    label: dict[str, Any],
    times: np.ndarray,
    boxes: np.ndarray,
    rgb: np.ndarray,
    valid: np.ndarray,
    region: RegionSpec,
    args: argparse.Namespace,
) -> list[dict[str, Any]]:
    uniform_t, uniform_rgb = interpolate_rgb(times, rgb, args.sample_fps)
    if len(uniform_t) == 0:
        return []

    win = int(round(args.window_sec * args.sample_fps))
    step = int(round(args.step_sec * args.sample_fps))
    if len(uniform_t) < win:
        return []

    rows: list[dict[str, Any]] = []
    bpm_min = float(label["bpm_min"])
    bpm_max = float(label["bpm_max"])
    target = float(label["bpm_target"])

    for window_index, start in enumerate(range(0, len(uniform_t) - win + 1, step)):
        end = start + win
        rgb_win = uniform_rgb[start:end]
        if not np.isfinite(rgb_win).all() or np.min(np.mean(rgb_win, axis=0)) <= 1:
            continue
        start_sec = float(uniform_t[start])
        end_sec = float(uniform_t[end - 1])
        valid_fraction = median_valid_for_window(times, valid, start_sec, end_sec)
        box_motion = box_motion_for_window(times, boxes, start_sec, end_sec)
        color_cv = float(np.nanmean(np.nanstd(rgb_win, axis=0) / (np.nanmean(rgb_win, axis=0) + 1e-9)))

        for method in METHODS:
            try:
                pulse = METHOD_FUNCTIONS[method](rgb_win, args.sample_fps, args.min_bpm, args.max_bpm)
                peaks = spectrum_peaks(pulse, args.sample_fps, args.min_bpm, args.max_bpm, args.top_peaks)
            except Exception:
                peaks = []

            for peak in peaks:
                pred = float(peak["peak_bpm"])
                range_error, within_range = range_error_for(pred, bpm_min, bpm_max)
                row: dict[str, Any] = {
                    "video": video_name,
                    "window_index": window_index,
                    "window_start_sec": round(start_sec, 3),
                    "window_end_sec": round(end_sec, 3),
                    "region_id": region.id,
                    "region_label": region.label,
                    "region_kind": region.kind,
                    "method": method,
                    "peak_rank": int(peak["peak_rank"]),
                    "peak_bpm": round(pred, 3),
                    "bpm_min": bpm_min,
                    "bpm_max": bpm_max,
                    "bpm_target": target,
                    "target_abs_error": round(abs(pred - target), 3),
                    "range_error": round(float(range_error), 3) if np.isfinite(range_error) else "",
                    "within_range": bool(within_range),
                    "snr": round(float(peak["snr"]), 3),
                    "total_power_ratio": round(float(peak["total_power_ratio"]), 6),
                    "spectral_entropy": round(float(peak["spectral_entropy"]), 6),
                    "h2_ratio": round(float(peak["h2_ratio"]), 6),
                    "half_ratio": round(float(peak["half_ratio"]), 6),
                    "valid_fraction": round(valid_fraction, 4),
                    "box_motion": round(box_motion, 6),
                    "color_cv": round(color_cv, 6),
                }
                row["quality_score"] = round(quality_score(row), 6)
                rows.append(row)
    return rows


def weighted_prediction(
    group: pd.DataFrame,
    value_col: str = "peak_bpm",
    score_col: str = "quality_score",
) -> tuple[float, float]:
    values = pd.to_numeric(group[value_col], errors="coerce").to_numpy(dtype=float)
    scores = pd.to_numeric(group[score_col], errors="coerce").to_numpy(dtype=float)
    good = np.isfinite(values) & np.isfinite(scores)
    if good.sum() == 0:
        return np.nan, np.nan
    values = values[good]
    scores = scores[good]
    weights = scores - np.nanmin(scores) + 0.1
    weights = np.clip(weights, 0.05, None)
    return weighted_median(values, weights), float(np.average(values, weights=weights))


def make_candidate_video_predictions(candidates: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    if candidates.empty:
        return pd.DataFrame()
    rank1 = candidates[candidates["peak_rank"] == 1].copy()
    for (video, method, region_id, region_label, region_kind), group in rank1.groupby(
        ["video", "method", "region_id", "region_label", "region_kind"]
    ):
        if len(group) < 2:
            continue
        pred, pred_mean = weighted_prediction(group)
        if not np.isfinite(pred):
            continue
        first = group.iloc[0]
        bpm_min = float(first["bpm_min"])
        bpm_max = float(first["bpm_max"])
        target = float(first["bpm_target"])
        range_error, within_range = range_error_for(pred, bpm_min, bpm_max)
        rows.append(
            {
                "video": video,
                "method": method,
                "region_id": region_id,
                "region_label": region_label,
                "region_kind": region_kind,
                "pred_bpm": round(float(pred), 3),
                "pred_bpm_weighted_mean": round(float(pred_mean), 3),
                "bpm_min": bpm_min,
                "bpm_max": bpm_max,
                "bpm_target": target,
                "target_abs_error": round(abs(float(pred) - target), 3),
                "range_error": round(float(range_error), 3) if np.isfinite(range_error) else "",
                "within_range": bool(within_range),
                "window_count": int(group["window_index"].nunique()),
                "median_snr": round(float(pd.to_numeric(group["snr"], errors="coerce").median()), 3),
                "median_quality_score": round(float(pd.to_numeric(group["quality_score"], errors="coerce").median()), 3),
            }
        )
    return pd.DataFrame(rows)


def candidate_method_summary(predictions: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    if predictions.empty:
        return pd.DataFrame()
    frame = predictions.copy()
    frame["target_abs_error"] = pd.to_numeric(frame["target_abs_error"], errors="coerce")
    frame["range_error"] = pd.to_numeric(frame["range_error"], errors="coerce")
    frame["median_quality_score"] = pd.to_numeric(frame["median_quality_score"], errors="coerce")
    for (method, region_id, region_label, region_kind), group in frame.groupby(
        ["method", "region_id", "region_label", "region_kind"]
    ):
        if len(group) < 2:
            continue
        rows.append(
            {
                "method": method,
                "region_id": region_id,
                "region_label": region_label,
                "region_kind": region_kind,
                "n": int(len(group)),
                "target_mae": round(float(group["target_abs_error"].mean()), 3),
                "target_rmse": round(float(np.sqrt(np.mean(group["target_abs_error"] ** 2))), 3),
                "range_mae": round(float(group["range_error"].mean()), 3),
                "within_range_pct": round(float(group["within_range"].mean() * 100.0), 2),
                "median_quality_score": round(float(group["median_quality_score"].median()), 3),
            }
        )
    return pd.DataFrame(rows).sort_values(
        ["range_mae", "target_mae", "within_range_pct", "median_quality_score"],
        ascending=[True, True, False, False],
    ).reset_index(drop=True)


def build_selector_row(
    selector: str,
    video: str,
    pred: float,
    source: str,
    first: pd.Series,
    selected_method: str = "",
    selected_region: str = "",
) -> dict[str, Any]:
    bpm_min = float(first["bpm_min"])
    bpm_max = float(first["bpm_max"])
    target = float(first["bpm_target"])
    range_error, within_range = range_error_for(pred, bpm_min, bpm_max)
    return {
        "selector": selector,
        "video": video,
        "pred_bpm": round(float(pred), 3) if np.isfinite(pred) else "",
        "bpm_min": bpm_min,
        "bpm_max": bpm_max,
        "bpm_target": target,
        "target_abs_error": round(abs(float(pred) - target), 3) if np.isfinite(pred) else "",
        "range_error": round(float(range_error), 3) if np.isfinite(range_error) else "",
        "within_range": bool(within_range),
        "source": source,
        "selected_method": selected_method,
        "selected_region": selected_region,
    }


def select_fixed_candidate(predictions: pd.DataFrame, method: str, region_id: str, selector: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    subset = predictions[(predictions["method"] == method) & (predictions["region_id"] == region_id)]
    for video, group in subset.groupby("video"):
        item = group.iloc[0]
        rows.append(build_selector_row(selector, video, float(item["pred_bpm"]), f"{method}+{region_id}", item, method, region_id))
    return rows


def select_sqi_top_window(candidates: pd.DataFrame) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for video, group in candidates.groupby("video"):
        chosen = group.sort_values(["window_index", "quality_score"], ascending=[True, False]).groupby("window_index").head(1)
        pred, _ = weighted_prediction(chosen)
        if len(chosen) == 0 or not np.isfinite(pred):
            continue
        first = chosen.iloc[0]
        top_source = chosen.groupby(["method", "region_id"]).size().sort_values(ascending=False).index[0]
        rows.append(
            build_selector_row(
                "sqi_top_window",
                video,
                pred,
                "best SQI candidate per window",
                first,
                str(top_source[0]),
                str(top_source[1]),
            )
        )
    return rows


def track_video_candidates(
    group: pd.DataFrame,
    args: argparse.Namespace,
    score_col: str = "quality_score",
) -> pd.DataFrame:
    if group.empty:
        return pd.DataFrame()
    frame = group.copy()
    score = pd.to_numeric(frame[score_col], errors="coerce")
    std = float(score.std()) if np.isfinite(score.std()) and score.std() > 1e-9 else 1.0
    frame["score_norm"] = (score - float(score.mean())) / std
    layers: list[pd.DataFrame] = []
    for _, window_group in frame.groupby("window_index"):
        layer = window_group.sort_values(score_col, ascending=False).head(args.track_candidates_per_window).copy()
        layers.append(layer.reset_index(drop=True))
    if not layers:
        return pd.DataFrame()

    dp: list[np.ndarray] = [layers[0]["score_norm"].to_numpy(dtype=float)]
    back: list[np.ndarray] = []
    for idx in range(1, len(layers)):
        prev_bpms = layers[idx - 1]["peak_bpm"].to_numpy(dtype=float)
        curr_bpms = layers[idx]["peak_bpm"].to_numpy(dtype=float)
        curr_scores = layers[idx]["score_norm"].to_numpy(dtype=float)
        prev_scores = dp[-1]
        curr_dp = np.full(len(curr_bpms), -np.inf, dtype=float)
        curr_back = np.zeros(len(curr_bpms), dtype=int)
        for j, bpm in enumerate(curr_bpms):
            penalties = ((prev_bpms - bpm) / args.track_jump_bpm) ** 2
            transition_scores = prev_scores - penalties
            best_prev = int(np.argmax(transition_scores))
            curr_dp[j] = transition_scores[best_prev] + curr_scores[j]
            curr_back[j] = best_prev
        dp.append(curr_dp)
        back.append(curr_back)

    last_idx = int(np.argmax(dp[-1]))
    path_indices = [last_idx]
    for layer_idx in range(len(layers) - 1, 0, -1):
        last_idx = int(back[layer_idx - 1][last_idx])
        path_indices.append(last_idx)
    path_indices.reverse()
    path_rows = [layers[layer_idx].iloc[row_idx] for layer_idx, row_idx in enumerate(path_indices)]
    return pd.DataFrame(path_rows)


def select_tracked_sqi(candidates: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for video, group in candidates.groupby("video"):
        path = track_video_candidates(group, args)
        if path.empty:
            continue
        pred, _ = weighted_prediction(path)
        if not np.isfinite(pred):
            continue
        first = path.iloc[0]
        top_source = path.groupby(["method", "region_id"]).size().sort_values(ascending=False).index[0]
        rows.append(
            build_selector_row(
                "tracked_sqi",
                video,
                pred,
                "Viterbi path over SQI candidates",
                first,
                str(top_source[0]),
                str(top_source[1]),
            )
        )
    return rows


def patch_position(region_id: str) -> tuple[float, float]:
    match = re.match(r"patch_r(\d+)_c(\d+)", str(region_id))
    if not match:
        return 0.0, 0.0
    return float(match.group(1)), float(match.group(2))


def candidate_feature_frame(frame: pd.DataFrame) -> pd.DataFrame:
    features = pd.DataFrame(index=frame.index)
    numeric_columns = [
        "window_start_sec",
        "peak_rank",
        "peak_bpm",
        "snr",
        "total_power_ratio",
        "spectral_entropy",
        "h2_ratio",
        "half_ratio",
        "valid_fraction",
        "box_motion",
        "color_cv",
        "quality_score",
    ]
    for col in numeric_columns:
        features[col] = pd.to_numeric(frame[col], errors="coerce")
    positions = frame["region_id"].map(patch_position)
    features["patch_row"] = [row for row, _ in positions]
    features["patch_col"] = [col for _, col in positions]
    features["is_patch"] = (frame["region_kind"] == "patch").astype(float)
    for method in METHODS:
        features[f"method_{method}"] = (frame["method"] == method).astype(float)
    for roi in ROI_MODES:
        features[f"region_{roi}"] = (frame["region_id"] == roi).astype(float)
    return features.replace([np.inf, -np.inf], np.nan).fillna(0.0)


def positive_training_labels(frame: pd.DataFrame) -> np.ndarray:
    range_error = pd.to_numeric(frame["range_error"], errors="coerce")
    target_error = pd.to_numeric(frame["target_abs_error"], errors="coerce")
    return ((range_error <= 3.0) | (target_error <= 5.0)).fillna(False).to_numpy(dtype=int)


def select_supervised_ranker_loocv(candidates: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if candidates.empty:
        return rows
    frame = candidates.copy()
    videos = sorted(frame["video"].unique(), key=natural_sort_key)
    for video in videos:
        train = frame[frame["video"] != video].copy()
        test = frame[frame["video"] == video].copy()
        if train.empty or test.empty:
            continue
        y_train = positive_training_labels(train)
        if len(np.unique(y_train)) < 2:
            continue
        model = RandomForestClassifier(
            n_estimators=300,
            max_depth=8,
            min_samples_leaf=3,
            class_weight="balanced_subsample",
            random_state=7,
            n_jobs=-1,
        )
        model.fit(candidate_feature_frame(train), y_train)
        proba = model.predict_proba(candidate_feature_frame(test))[:, 1]
        test = test.copy()
        test["ranker_score"] = proba

        chosen = test.sort_values(["window_index", "ranker_score"], ascending=[True, False]).groupby("window_index").head(1)
        pred, _ = weighted_prediction(chosen, score_col="ranker_score")
        if len(chosen) and np.isfinite(pred):
            first = chosen.iloc[0]
            top_source = chosen.groupby(["method", "region_id"]).size().sort_values(ascending=False).index[0]
            rows.append(
                build_selector_row(
                    "supervised_peak_ranker_loocv",
                    video,
                    pred,
                    "leave-one-video-out supervised peak ranker",
                    first,
                    str(top_source[0]),
                    str(top_source[1]),
                )
            )

        path = track_video_candidates(test, args, score_col="ranker_score")
        pred, _ = weighted_prediction(path, score_col="ranker_score")
        if len(path) and np.isfinite(pred):
            first = path.iloc[0]
            top_source = path.groupby(["method", "region_id"]).size().sort_values(ascending=False).index[0]
            rows.append(
                build_selector_row(
                    "supervised_tracked_ranker_loocv",
                    video,
                    pred,
                    "LOOCV supervised ranker with temporal tracking",
                    first,
                    str(top_source[0]),
                    str(top_source[1]),
                )
            )
    return rows


def train_current_label_peak_selector(candidates: pd.DataFrame, args: argparse.Namespace) -> pd.DataFrame:
    frame = candidates.copy()
    if frame.empty:
        frame["trained_selector_score"] = []
        return frame
    y = positive_training_labels(frame)
    if len(np.unique(y)) < 2:
        frame["trained_selector_score"] = 0.0
        return frame
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=None,
        min_samples_leaf=1,
        class_weight="balanced_subsample",
        random_state=17,
        n_jobs=-1,
    )
    feature_frame = candidate_feature_frame(frame)
    model.fit(feature_frame, y)
    frame["trained_selector_score"] = model.predict_proba(feature_frame)[:, 1]
    model_dir = args.out_dir / "models"
    model_dir.mkdir(parents=True, exist_ok=True)
    dump(
        {
            "model": model,
            "feature_columns": list(feature_frame.columns),
            "positive_definition": "range_error <= 3 bpm OR target_abs_error <= 5 bpm",
            "training_rows": int(len(frame)),
            "positive_rows": int(np.sum(y)),
            "videos": sorted(frame["video"].unique().tolist(), key=natural_sort_key),
            "warning": "This selector is fitted on the current labeled videos. Use LOOCV rows for generalization risk.",
        },
        model_dir / "current_label_peak_selector.joblib",
    )
    metadata = {
        "model_path": (model_dir / "current_label_peak_selector.joblib").as_posix(),
        "feature_columns": list(feature_frame.columns),
        "positive_definition": "range_error <= 3 bpm OR target_abs_error <= 5 bpm",
        "training_rows": int(len(frame)),
        "positive_rows": int(np.sum(y)),
        "positive_rate": round(float(np.mean(y)), 6),
        "videos": sorted(frame["video"].unique().tolist(), key=natural_sort_key),
        "warning": "Fitted on the same labeled videos shown in the UI; not an unbiased estimate for new videos.",
    }
    (model_dir / "current_label_peak_selector_metadata.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return frame


def select_trained_current_ranker(candidates: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if candidates.empty or "trained_selector_score" not in candidates.columns:
        return rows
    for video, group in candidates.groupby("video"):
        chosen = group.sort_values(["window_index", "trained_selector_score"], ascending=[True, False]).groupby("window_index").head(1)
        pred, _ = weighted_prediction(chosen, score_col="trained_selector_score")
        if len(chosen) and np.isfinite(pred):
            first = chosen.iloc[0]
            top_source = chosen.groupby(["method", "region_id"]).size().sort_values(ascending=False).index[0]
            rows.append(
                build_selector_row(
                    "trained_peak_selector_current",
                    video,
                    pred,
                    "trained on current OCR labels",
                    first,
                    str(top_source[0]),
                    str(top_source[1]),
                )
            )

        path = track_video_candidates(group, args, score_col="trained_selector_score")
        pred, _ = weighted_prediction(path, score_col="trained_selector_score")
        if len(path) and np.isfinite(pred):
            first = path.iloc[0]
            top_source = path.groupby(["method", "region_id"]).size().sort_values(ascending=False).index[0]
            rows.append(
                build_selector_row(
                    "trained_tracked_selector_current",
                    video,
                    pred,
                    "trained on current OCR labels with temporal tracking",
                    first,
                    str(top_source[0]),
                    str(top_source[1]),
                )
            )
    return rows


def select_oracles(candidates: pd.DataFrame, predictions: pd.DataFrame) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not predictions.empty:
        pred_frame = predictions.copy()
        pred_frame["range_error_num"] = pd.to_numeric(pred_frame["range_error"], errors="coerce")
        pred_frame["target_abs_error_num"] = pd.to_numeric(pred_frame["target_abs_error"], errors="coerce")
        for video, group in pred_frame.groupby("video"):
            best = group.sort_values(["range_error_num", "target_abs_error_num"]).iloc[0]
            rows.append(
                build_selector_row(
                    "oracle_method_region",
                    video,
                    float(best["pred_bpm"]),
                    "label-leaked best method/region upper bound",
                    best,
                    str(best["method"]),
                    str(best["region_id"]),
                )
            )

    if not candidates.empty:
        cand_frame = candidates.copy()
        cand_frame["range_error_num"] = pd.to_numeric(cand_frame["range_error"], errors="coerce")
        cand_frame["target_abs_error_num"] = pd.to_numeric(cand_frame["target_abs_error"], errors="coerce")
        for video, group in cand_frame.groupby("video"):
            best = group.sort_values(["range_error_num", "target_abs_error_num", "peak_rank"]).iloc[0]
            rows.append(
                build_selector_row(
                    "oracle_window_peak",
                    video,
                    float(best["peak_bpm"]),
                    "label-leaked best window peak upper bound",
                    best,
                    str(best["method"]),
                    str(best["region_id"]),
                )
            )
    return rows


def select_loocv_calibrated(predictions: pd.DataFrame) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if predictions.empty:
        return rows
    frame = predictions.copy()
    frame["range_error_num"] = pd.to_numeric(frame["range_error"], errors="coerce")
    frame["target_abs_error_num"] = pd.to_numeric(frame["target_abs_error"], errors="coerce")
    videos = sorted(frame["video"].unique(), key=natural_sort_key)
    for video in videos:
        train = frame[frame["video"] != video]
        test = frame[frame["video"] == video]
        if train.empty or test.empty:
            continue
        perf_rows: list[dict[str, Any]] = []
        for (method, region_id), group in train.groupby(["method", "region_id"]):
            if len(group) < max(2, int(math.ceil(len(videos) * 0.5))):
                continue
            perf_rows.append(
                {
                    "method": method,
                    "region_id": region_id,
                    "range_mae": float(group["range_error_num"].mean()),
                    "target_mae": float(group["target_abs_error_num"].mean()),
                    "within": float(group["within_range"].mean()),
                }
            )
        if not perf_rows:
            continue
        best = pd.DataFrame(perf_rows).sort_values(
            ["range_mae", "target_mae", "within"],
            ascending=[True, True, False],
        ).iloc[0]
        selected = test[
            (test["method"] == best["method"])
            & (test["region_id"] == best["region_id"])
        ]
        if selected.empty:
            continue
        item = selected.iloc[0]
        rows.append(
            build_selector_row(
                "train_calibrated_fixed_loocv",
                video,
                float(item["pred_bpm"]),
                "leave-one-video-out best fixed method/region",
                item,
                str(best["method"]),
                str(best["region_id"]),
            )
        )
    return rows


def summarize_selectors(predictions: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    if predictions.empty:
        return pd.DataFrame()
    frame = predictions.copy()
    frame["target_abs_error"] = pd.to_numeric(frame["target_abs_error"], errors="coerce")
    frame["range_error"] = pd.to_numeric(frame["range_error"], errors="coerce")
    for selector, group in frame.groupby("selector"):
        valid = group["target_abs_error"].dropna()
        if valid.empty:
            continue
        rows.append(
            {
                "selector": selector,
                "n": int(len(valid)),
                "target_mae": round(float(group["target_abs_error"].mean()), 3),
                "target_rmse": round(float(np.sqrt(np.mean(group["target_abs_error"] ** 2))), 3),
                "range_mae": round(float(group["range_error"].mean()), 3),
                "within_range_pct": round(float(group["within_range"].mean() * 100.0), 2),
            }
        )
    return pd.DataFrame(rows).sort_values(
        ["range_mae", "target_mae", "within_range_pct"],
        ascending=[True, True, False],
    ).reset_index(drop=True)


def write_csv_rows(rows: list[dict[str, Any]], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        return
    with out_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def markdown_table(df: pd.DataFrame) -> str:
    if df.empty:
        return ""
    text_df = df.fillna("").copy()
    columns = list(text_df.columns)
    rows = [["" if pd.isna(value) else str(value) for value in row] for row in text_df.to_numpy()]
    widths = [
        max(len(str(col)), *(len(row[idx]) for row in rows)) if rows else len(str(col))
        for idx, col in enumerate(columns)
    ]
    header = "| " + " | ".join(str(col).ljust(widths[idx]) for idx, col in enumerate(columns)) + " |"
    divider = "| " + " | ".join("-" * widths[idx] for idx in range(len(columns))) + " |"
    body = [
        "| " + " | ".join(row[idx].ljust(widths[idx]) for idx in range(len(columns))) + " |"
        for row in rows
    ]
    return "\n".join([header, divider, *body])


def write_report(
    labels: pd.DataFrame,
    selector_summary: pd.DataFrame,
    selector_predictions: pd.DataFrame,
    method_summary: pd.DataFrame,
    out_path: Path,
    args: argparse.Namespace,
) -> None:
    tracked_rows = selector_predictions[selector_predictions["selector"] == "tracked_sqi"][
        [
            "video",
            "pred_bpm",
            "bpm_min",
            "bpm_max",
            "bpm_target",
            "target_abs_error",
            "range_error",
            "within_range",
            "selected_method",
            "selected_region",
        ]
    ]
    lines = [
        "# Single-View RGB rPPG Feasibility: Candidate/SQI Evaluation",
        "",
        "## Setup",
        "",
        f"- Labels: `{args.labels_csv.as_posix()}`",
        f"- Usable labeled videos: {len(labels)}",
        f"- Sample FPS: {args.sample_fps}",
        f"- Window / step: {args.window_sec}s / {args.step_sec}s",
        f"- BPM search band: {args.min_bpm}-{args.max_bpm}",
        f"- Candidate regions: 4 aggregate face ROIs + {args.grid_rows}x{args.grid_cols} face patches",
        f"- Candidate methods: {', '.join(METHODS)}",
        "",
        "## Selector Ranking",
        "",
        markdown_table(selector_summary),
        "",
        "## Tracked SQI Per Video",
        "",
        markdown_table(tracked_rows),
        "",
        "## Top Fixed Method/Region Candidates",
        "",
        markdown_table(method_summary.head(15)),
        "",
        "## Interpretation",
        "",
        "- `fixed_pos_face_full` is a direct POS baseline on the full dog-face ROI.",
        "- `sqi_top_window` chooses the highest quality candidate per window without labels.",
        "- `tracked_sqi` adds a temporal smoothness penalty so BPM does not jump between unrelated peaks.",
        "- `trained_peak_selector_current` is fitted on the current OCR labels and shows calibration potential, not unbiased generalization.",
        "- `trained_tracked_selector_current` adds temporal tracking to that current-label trained selector.",
        "- `supervised_*_loocv` rows train on all other videos and are the conservative generalization check.",
        "- `train_calibrated_fixed_loocv` chooses one fixed method/region using the other videos as calibration data.",
        "- `oracle_*` rows leak labels and should be treated as upper bounds, not deployable performance.",
        "",
        "## Caveats",
        "",
        "- Labels are video-level OCR-reviewed monitor ranges, not frame-synchronous ECG/PPG ground truth.",
        "- Patch-grid candidates can overfit this small dataset; leave-one-video-out numbers are more useful than in-sample winners.",
        "- The method is built for single-view RGB feasibility and is intentionally structured for later multi-view fusion.",
        "",
    ]
    out_path.write_text("\n".join(lines), encoding="utf-8")


def write_plots(selector_summary: pd.DataFrame, method_summary: pd.DataFrame, out_dir: Path) -> None:
    try:
        import matplotlib.pyplot as plt
    except Exception:
        return
    if not selector_summary.empty:
        fig, ax = plt.subplots(figsize=(10, 4.8))
        top = selector_summary.sort_values("range_mae").copy()
        ax.bar(top["selector"], top["range_mae"].astype(float), color="#2f6f73")
        ax.set_ylabel("Range MAE (bpm)")
        ax.set_title("Selector Ranking")
        ax.tick_params(axis="x", labelrotation=35)
        ax.grid(axis="y", alpha=0.25)
        fig.tight_layout()
        fig.savefig(out_dir / "selector_ranking.png", dpi=180)
        plt.close(fig)
    if not method_summary.empty:
        fig, ax = plt.subplots(figsize=(12, 5.2))
        top = method_summary.head(12).copy()
        labels = [f"{row.method}\n{row.region_label}" for row in top.itertuples()]
        ax.bar(labels, top["range_mae"].astype(float), color="#5a779e")
        ax.set_ylabel("Range MAE (bpm)")
        ax.set_title("Top Fixed Method/Region Candidates")
        ax.tick_params(axis="x", labelrotation=45)
        ax.grid(axis="y", alpha=0.25)
        fig.tight_layout()
        fig.savefig(out_dir / "method_region_ranking.png", dpi=180)
        plt.close(fig)


def rows_for_ui(df: pd.DataFrame, limit: int | None = None) -> list[dict[str, Any]]:
    if df.empty:
        return []
    frame = df.head(limit).copy() if limit else df.copy()
    return json.loads(frame.to_json(orient="records"))


def vite_fs_url(path: Path) -> str:
    return "/@fs/" + path.resolve().as_posix()


def existing_vite_url(path: Path) -> str:
    return vite_fs_url(path) if path.exists() else ""


def selector_lookup(selector_predictions: pd.DataFrame, selector: str) -> dict[str, dict[str, Any]]:
    if selector_predictions.empty:
        return {}
    rows = selector_predictions[selector_predictions["selector"] == selector]
    return {str(row["video"]): row for row in rows_for_ui(rows)}


def draw_text_block(frame: np.ndarray, lines: list[tuple[str, tuple[int, int, int]]]) -> None:
    if not lines:
        return
    margin = 14
    line_h = 24
    width = max(cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.58, 1)[0][0] for text, _ in lines)
    height = line_h * len(lines) + margin
    cv2.rectangle(frame, (8, 8), (width + 28, height + 10), (0, 0, 0), -1)
    for idx, (text, color) in enumerate(lines):
        y = 30 + idx * line_h
        cv2.putText(frame, text, (18, y), cv2.FONT_HERSHEY_SIMPLEX, 0.58, color, 1, cv2.LINE_AA)


def draw_region(frame: np.ndarray, box: np.ndarray, color: tuple[int, int, int], label: str, fill_alpha: float = 0.18) -> None:
    x1, y1, x2, y2 = box.round().astype(int)
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)
    cv2.addWeighted(overlay, fill_alpha, frame, 1.0 - fill_alpha, 0, dst=frame)
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
    tx = max(6, min(x1, frame.shape[1] - 160))
    ty = max(22, y1 - 8)
    cv2.putText(frame, label, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2, cv2.LINE_AA)


def representative_frame(video_path: Path, time_sec: float = 0.5) -> np.ndarray | None:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return None
    cap.set(cv2.CAP_PROP_POS_MSEC, max(0.0, time_sec) * 1000.0)
    ok, frame = cap.read()
    if not ok:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        ok, frame = cap.read()
    cap.release()
    return frame if ok else None


def finite_box_near_time(times: np.ndarray, boxes: np.ndarray, target_sec: float) -> np.ndarray | None:
    if len(times) == 0 or len(boxes) == 0:
        return None
    finite = np.isfinite(boxes[:, :4]).all(axis=1)
    if not finite.any():
        return None
    idxs = np.flatnonzero(finite)
    nearest = idxs[int(np.argmin(np.abs(times[idxs] - target_sec)))]
    return boxes[nearest, :4].astype(float)


def draw_region_overlay(
    video_path: Path,
    cache_path: Path,
    out_path: Path,
    regions_by_id: dict[str, RegionSpec],
    trained_row: dict[str, Any] | None,
    oracle_row: dict[str, Any] | None,
    args: argparse.Namespace,
) -> bool:
    if not cache_path.exists() or trained_row is None:
        return False
    data = np.load(cache_path, allow_pickle=True)
    times = data["times"]
    boxes = data["boxes"]
    frame_time = 0.5
    frame = representative_frame(video_path, frame_time)
    face_box = finite_box_near_time(times, boxes, frame_time)
    if frame is None or face_box is None:
        return False

    height, width = frame.shape[:2]
    face = clamp_box(face_box, width, height).round().astype(int)
    cv2.rectangle(frame, (face[0], face[1]), (face[2], face[3]), (255, 170, 70), 2)
    for patch_box in patch_grid_boxes(frame.shape, face_box, args.grid_rows, args.grid_cols):
        gx1, gy1, gx2, gy2 = patch_box.round().astype(int)
        cv2.rectangle(frame, (gx1, gy1), (gx2, gy2), (255, 255, 255), 1)

    trained_region = regions_by_id.get(str(trained_row.get("selected_region", "")))
    oracle_region = regions_by_id.get(str(oracle_row.get("selected_region", ""))) if oracle_row else None
    if oracle_region is not None:
        oracle_box = region_box_from_face_box(frame.shape, face_box, oracle_region)
        draw_region(frame, oracle_box, (60, 255, 80), "Oracle", fill_alpha=0.10)
    if trained_region is not None:
        trained_box = region_box_from_face_box(frame.shape, face_box, trained_region)
        draw_region(frame, trained_box, (255, 70, 230), "Trained", fill_alpha=0.20)

    trained_pred = trained_row.get("pred_bpm", "")
    oracle_pred = oracle_row.get("pred_bpm", "") if oracle_row else ""
    text_lines = [
        (
            f"Trained: {trained_row.get('selected_method', '')} / {trained_row.get('selected_region', '')} / {trained_pred} bpm",
            (255, 70, 230),
        )
    ]
    if oracle_row is not None:
        text_lines.append(
            (
                f"Oracle: {oracle_row.get('selected_method', '')} / {oracle_row.get('selected_region', '')} / {oracle_pred} bpm",
                (60, 255, 80),
            )
        )
    text_lines.append(("Blue: tracked dog-face box, White: candidate patch grid", (255, 255, 255)))
    draw_text_block(frame, text_lines)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    return bool(cv2.imwrite(str(out_path), frame, [int(cv2.IMWRITE_JPEG_QUALITY), 92]))


def write_region_overlays(
    all_labels: pd.DataFrame,
    selector_predictions: pd.DataFrame,
    regions: list[RegionSpec],
    args: argparse.Namespace,
) -> None:
    regions_by_id = {region.id: region for region in regions}
    trained_by_video = selector_lookup(selector_predictions, "trained_tracked_selector_current")
    oracle_by_video = selector_lookup(selector_predictions, "oracle_window_peak")
    overlay_dir = args.out_dir / "region_overlays"
    for label in all_labels.sort_values("video", key=lambda s: s.map(natural_sort_key)).to_dict(orient="records"):
        video_path = Path(label["path"])
        if not bool(label.get("usable", False)):
            continue
        draw_region_overlay(
            video_path=video_path,
            cache_path=args.out_dir / "cache" / f"{video_path.stem}_candidate_traces.npz",
            out_path=overlay_dir / f"{video_path.stem}_region_overlay.jpg",
            regions_by_id=regions_by_id,
            trained_row=trained_by_video.get(str(label["video"])),
            oracle_row=oracle_by_video.get(str(label["video"])),
            args=args,
        )


def load_json_if_exists(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def build_video_assets(
    all_labels: pd.DataFrame,
    extraction_stats: pd.DataFrame,
    selector_predictions: pd.DataFrame,
    args: argparse.Namespace,
) -> list[dict[str, Any]]:
    stats_by_video = {row["video"]: row for row in rows_for_ui(extraction_stats)}
    trained_by_video = selector_lookup(selector_predictions, "trained_tracked_selector_current")
    oracle_by_video = selector_lookup(selector_predictions, "oracle_window_peak")
    videos: list[dict[str, Any]] = []
    for label in all_labels.sort_values("video", key=lambda s: s.map(natural_sort_key)).to_dict(orient="records"):
        video_path = Path(label["path"])
        stem = video_path.stem
        trained = trained_by_video.get(str(label["video"]), {})
        oracle = oracle_by_video.get(str(label["video"]), {})
        videos.append(
            {
                "video": label["video"],
                "path": video_path.as_posix(),
                "usable": bool(label["usable"]),
                "bpm_min": "" if pd.isna(label["bpm_min"]) else float(label["bpm_min"]),
                "bpm_max": "" if pd.isna(label["bpm_max"]) else float(label["bpm_max"]),
                "bpm_target": "" if pd.isna(label["bpm_target"]) else float(label["bpm_target"]),
                "label_source": label["label_source"],
                "notes": label["notes"],
                "videoUrl": existing_vite_url(video_path),
                "frameUrl": existing_vite_url(Path("reports/ocr_preview/frames") / f"{stem}_0.5.jpg"),
                "monitorCropUrl": existing_vite_url(Path("reports/ocr_preview/frames") / f"{stem}_monitor_crop.jpg"),
                "monitorSheetUrl": existing_vite_url(Path("reports/ocr_preview/generated") / f"{stem}_monitor_sheet.jpg"),
                "regionOverlayUrl": existing_vite_url(args.out_dir / "region_overlays" / f"{stem}_region_overlay.jpg"),
                "trainedMethod": trained.get("selected_method", ""),
                "trainedRegion": trained.get("selected_region", ""),
                "trainedPredBpm": trained.get("pred_bpm", ""),
                "oracleMethod": oracle.get("selected_method", ""),
                "oracleRegion": oracle.get("selected_region", ""),
                "oraclePredBpm": oracle.get("pred_bpm", ""),
                "stats": stats_by_video.get(label["video"], {}),
            }
        )
    return videos


def build_multi_view_assets() -> list[dict[str, Any]]:
    labels = {
        "front": "Front RGB",
        "left": "Left RGB",
        "right": "Right RGB",
        "up": "Top RGB",
    }
    rows: list[dict[str, Any]] = []
    for path in sorted(Path("dataset_multi").glob("*.mp4"), key=natural_sort_key):
        rows.append(
            {
                "id": path.stem,
                "label": labels.get(path.stem, path.stem.title()),
                "path": path.as_posix(),
                "videoUrl": existing_vite_url(path),
                "status": "asset_ready",
            }
        )
    return rows


def downsample_frame(frame: pd.DataFrame, max_points: int = 600) -> pd.DataFrame:
    if len(frame) <= max_points:
        return frame
    idx = np.linspace(0, len(frame) - 1, max_points).round().astype(int)
    return frame.iloc[np.unique(idx)].reset_index(drop=True)


def normalize_for_ui(values: np.ndarray) -> np.ndarray:
    arr = np.asarray(values, dtype=float)
    if len(arr) == 0:
        return arr
    arr = arr - np.nanmedian(arr)
    scale = np.nanpercentile(np.abs(arr), 95)
    if not np.isfinite(scale) or scale < 1e-9:
        scale = np.nanstd(arr)
    if not np.isfinite(scale) or scale < 1e-9:
        scale = 1.0
    return np.clip(arr / scale, -1.5, 1.5)


def sampled_waveform_points(times: np.ndarray, rgb: np.ndarray, args: argparse.Namespace) -> list[dict[str, float]]:
    uniform_t, uniform_rgb = interpolate_rgb(times, rgb, args.sample_fps)
    if len(uniform_t) == 0:
        return []
    try:
        pos = METHOD_FUNCTIONS["pos"](uniform_rgb, args.sample_fps, args.min_bpm, args.max_bpm)
    except Exception:
        pos = np.full(len(uniform_t), np.nan)
    try:
        chrom = METHOD_FUNCTIONS["chrom"](uniform_rgb, args.sample_fps, args.min_bpm, args.max_bpm)
    except Exception:
        chrom = np.full(len(uniform_t), np.nan)

    trace = pd.DataFrame(
        {
            "t": uniform_t,
            "r": normalize_for_ui(uniform_rgb[:, 0]),
            "g": normalize_for_ui(uniform_rgb[:, 1]),
            "b": normalize_for_ui(uniform_rgb[:, 2]),
            "pos": normalize_for_ui(pos),
            "chrom": normalize_for_ui(chrom),
        }
    )
    trace = downsample_frame(trace, 620)
    return [
        {
            "t": round(float(row.t), 3),
            "r": round(float(row.r), 4),
            "g": round(float(row.g), 4),
            "b": round(float(row.b), 4),
            "pos": round(float(row.pos), 4),
            "chrom": round(float(row.chrom), 4),
        }
        for row in trace.itertuples()
        if np.isfinite(row.t)
    ]


def best_rows_per_window(frame: pd.DataFrame, sort_cols: list[str], ascending: list[bool]) -> pd.DataFrame:
    if frame.empty:
        return pd.DataFrame()
    return (
        frame.sort_values(["window_index", *sort_cols], ascending=[True, *ascending])
        .groupby("window_index")
        .head(1)
        .reset_index(drop=True)
    )


def hr_points(frame: pd.DataFrame) -> list[dict[str, float]]:
    if frame.empty:
        return []
    out = frame[["window_start_sec", "peak_bpm"]].copy()
    out["window_start_sec"] = pd.to_numeric(out["window_start_sec"], errors="coerce")
    out["peak_bpm"] = pd.to_numeric(out["peak_bpm"], errors="coerce")
    out = out.dropna().sort_values("window_start_sec")
    return [
        {"t": round(float(row.window_start_sec), 3), "bpm": round(float(row.peak_bpm), 3)}
        for row in out.itertuples()
    ]


def build_measurement_series(candidates: pd.DataFrame, labels: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    if candidates.empty:
        return []
    series_rows: list[dict[str, Any]] = []
    label_lookup = {row["video"]: row for row in labels.to_dict(orient="records")}
    for video in sorted(candidates["video"].unique(), key=natural_sort_key):
        label = label_lookup.get(video, {})
        stem = Path(video).stem
        cache_path = args.out_dir / "cache" / f"{stem}_candidate_traces.npz"
        waveform: list[dict[str, float]] = []
        duration_sec = 0.0
        if cache_path.exists():
            data = np.load(cache_path, allow_pickle=True)
            times = data["times"]
            duration_sec = round(float(np.nanmax(times)), 3) if len(times) else 0.0
            waveform = sampled_waveform_points(times, data["rgb__face_full"], args)

        video_candidates = candidates[candidates["video"] == video].copy()
        video_candidates["range_error_num"] = pd.to_numeric(video_candidates["range_error"], errors="coerce")
        video_candidates["target_abs_error_num"] = pd.to_numeric(video_candidates["target_abs_error"], errors="coerce")
        pos = video_candidates[
            (video_candidates["method"] == "pos")
            & (video_candidates["region_id"] == "face_full")
            & (video_candidates["peak_rank"] == 1)
        ]
        chrom = video_candidates[
            (video_candidates["method"] == "chrom")
            & (video_candidates["region_id"] == "face_full")
            & (video_candidates["peak_rank"] == 1)
        ]
        sqi = best_rows_per_window(video_candidates, ["quality_score"], [False])
        trained = (
            best_rows_per_window(video_candidates, ["trained_selector_score"], [False])
            if "trained_selector_score" in video_candidates.columns
            else pd.DataFrame()
        )
        oracle = best_rows_per_window(video_candidates, ["range_error_num", "target_abs_error_num", "peak_rank"], [True, True, True])
        series_rows.append(
            {
                "video": video,
                "durationSec": duration_sec,
                "label": {
                    "bpm_min": "" if pd.isna(label.get("bpm_min")) else float(label.get("bpm_min")),
                    "bpm_max": "" if pd.isna(label.get("bpm_max")) else float(label.get("bpm_max")),
                    "bpm_target": "" if pd.isna(label.get("bpm_target")) else float(label.get("bpm_target")),
                },
                "waveform": waveform,
                "hrTracks": {
                    "pos_face_full": hr_points(pos),
                    "chrom_face_full": hr_points(chrom),
                    "sqi_top_window": hr_points(sqi),
                    "trained_peak_selector_current": hr_points(trained),
                    "oracle_window_peak": hr_points(oracle),
                },
            }
        )
    return series_rows


def write_ui_data(
    all_labels: pd.DataFrame,
    selector_summary: pd.DataFrame,
    selector_predictions: pd.DataFrame,
    method_summary: pd.DataFrame,
    extraction_stats: pd.DataFrame,
    candidates: pd.DataFrame,
    out_path: Path,
    args: argparse.Namespace,
) -> None:
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "setup": {
            "labelsCsv": args.labels_csv.as_posix(),
            "outDir": args.out_dir.as_posix(),
            "sampleFps": args.sample_fps,
            "windowSec": args.window_sec,
            "stepSec": args.step_sec,
            "minBpm": args.min_bpm,
            "maxBpm": args.max_bpm,
            "grid": f"{args.grid_rows}x{args.grid_cols}",
            "methods": list(METHODS),
        },
        "assets": {
            "selectorRankingUrl": existing_vite_url(args.out_dir / "selector_ranking.png"),
            "methodRegionRankingUrl": existing_vite_url(args.out_dir / "method_region_ranking.png"),
            "reportUrl": existing_vite_url(args.out_dir / "single_view_sqi_report.md"),
            "candidateWindowPeaksCsvUrl": existing_vite_url(args.out_dir / "candidate_window_peaks.csv"),
            "selectorPredictionsCsvUrl": existing_vite_url(args.out_dir / "selector_predictions.csv"),
            "trainedSelectorModelUrl": existing_vite_url(args.out_dir / "models/current_label_peak_selector.joblib"),
            "trainedSelectorMetadataUrl": existing_vite_url(args.out_dir / "models/current_label_peak_selector_metadata.json"),
        },
        "trainedSelector": load_json_if_exists(args.out_dir / "models/current_label_peak_selector_metadata.json"),
        "videos": build_video_assets(all_labels, extraction_stats, selector_predictions, args),
        "multiViewAssets": build_multi_view_assets(),
        "measurementSeries": build_measurement_series(candidates, all_labels, args),
        "selectorSummary": rows_for_ui(selector_summary),
        "selectorPredictions": rows_for_ui(
            selector_predictions.sort_values(["video", "selector"], key=lambda s: s.map(natural_sort_key) if s.name == "video" else s)
        ),
        "topMethodRegions": rows_for_ui(method_summary.head(20)),
        "extractionStats": rows_for_ui(extraction_stats),
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    text = (
        "export const RPPG_SINGLE_VIEW_SQI = "
        + json.dumps(payload, indent=2, ensure_ascii=False)
        + " as const;\n"
    )
    out_path.write_text(text, encoding="utf-8")


def main() -> None:
    args = parse_args()
    warnings.filterwarnings("ignore", category=ConvergenceWarning)
    warnings.filterwarnings("ignore", category=FutureWarning)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("YOLO_CONFIG_DIR", str(Path.cwd()))
    os.environ.setdefault("YOLO_VERBOSE", "False")

    from ultralytics import YOLO

    all_labels_df = pd.read_csv(args.labels_csv)
    labels_df = all_labels_df[all_labels_df["usable"] == True].copy()  # noqa: E712
    labels_df = labels_df.sort_values("video", key=lambda s: s.map(natural_sort_key))
    regions = make_region_catalog(args.grid_rows, args.grid_cols)
    model = YOLO(str(args.model))
    # Auto GPU selection (fixes previous forced-CPU stupidity)
    import torch
    if args.device in ("0", "cuda") and not torch.cuda.is_available():
        print("[warn] CUDA not available, falling back to CPU for YOLO")
        args.device = "cpu"
    print(f"[device] SQI YOLO device: {args.device} (cuda={torch.cuda.is_available()})")

    all_rows: list[dict[str, Any]] = []
    extraction_stats: list[dict[str, Any]] = []
    cache_dir = args.out_dir / "cache"

    for label in labels_df.to_dict(orient="records"):
        video_path = Path(label["path"])
        print(f"[extract/candidate] {video_path}")
        traces = extract_candidate_traces(
            video_path=video_path,
            model=model,
            args=args,
            cache_path=cache_dir / f"{video_path.stem}_candidate_traces.npz",
            regions=regions,
        )
        times = traces["times"]
        boxes = traces["boxes"]
        detected_pct = float(np.isfinite(boxes[:, :4]).all(axis=1).mean() * 100.0) if len(boxes) else 0.0
        extraction_stats.append(
            {
                "video": video_path.name,
                "samples": int(len(times)),
                "effective_fps": round(float(traces["effective_fps"][0]), 3),
                "detected_pct": round(detected_pct, 2),
                "median_box_conf": round(float(np.nanmedian(boxes[:, 4])), 3) if len(boxes) else "",
                "regions": len(regions),
            }
        )

        for region in regions:
            rows = evaluate_region_candidates(
                video_name=video_path.name,
                label=label,
                times=times,
                boxes=boxes,
                rgb=traces[f"rgb__{region.id}"],
                valid=traces[f"valid__{region.id}"],
                region=region,
                args=args,
            )
            all_rows.extend(rows)

    candidates = pd.DataFrame(all_rows)
    candidates = train_current_label_peak_selector(candidates, args)
    candidate_path = args.out_dir / "candidate_window_peaks.csv"
    write_csv_rows(all_rows, candidate_path)
    extraction_stats_df = pd.DataFrame(extraction_stats)
    extraction_stats_df.to_csv(args.out_dir / "extraction_stats.csv", index=False)

    candidate_predictions = make_candidate_video_predictions(candidates)
    candidate_predictions.to_csv(args.out_dir / "candidate_video_predictions.csv", index=False)
    method_summary = candidate_method_summary(candidate_predictions)
    method_summary.to_csv(args.out_dir / "candidate_summary_by_method_region.csv", index=False)

    selector_rows: list[dict[str, Any]] = []
    selector_rows.extend(select_fixed_candidate(candidate_predictions, "pos", "face_full", "fixed_pos_face_full"))
    selector_rows.extend(select_fixed_candidate(candidate_predictions, "chrom", "face_full", "fixed_chrom_face_full"))
    selector_rows.extend(select_sqi_top_window(candidates))
    selector_rows.extend(select_tracked_sqi(candidates, args))
    selector_rows.extend(select_trained_current_ranker(candidates, args))
    selector_rows.extend(select_supervised_ranker_loocv(candidates, args))
    selector_rows.extend(select_loocv_calibrated(candidate_predictions))
    selector_rows.extend(select_oracles(candidates, candidate_predictions))
    selector_predictions = pd.DataFrame(selector_rows)
    selector_predictions.to_csv(args.out_dir / "selector_predictions.csv", index=False)
    selector_summary = summarize_selectors(selector_predictions)
    selector_summary.to_csv(args.out_dir / "selector_summary.csv", index=False)

    write_report(
        labels_df,
        selector_summary,
        selector_predictions,
        method_summary,
        args.out_dir / "single_view_sqi_report.md",
        args,
    )
    write_plots(selector_summary, method_summary, args.out_dir)
    write_region_overlays(all_labels_df, selector_predictions, regions, args)
    write_ui_data(
        all_labels_df,
        selector_summary,
        selector_predictions,
        method_summary,
        extraction_stats_df,
        candidates,
        args.ui_data,
        args,
    )

    print(
        json.dumps(
            {
                "out_dir": str(args.out_dir),
                "ui_data": str(args.ui_data),
                "selector_summary": rows_for_ui(selector_summary),
            },
            indent=2,
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
