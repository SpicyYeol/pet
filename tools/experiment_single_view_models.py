from __future__ import annotations

import argparse
import json
import math
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

import numpy as np
import pandas as pd
import cv2
from scipy import signal
from sklearn.base import clone
from sklearn.ensemble import (
    ExtraTreesClassifier,
    ExtraTreesRegressor,
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from evaluate_single_view_sqi import (
    candidate_feature_frame,
    existing_vite_url,
    make_region_catalog,
    markdown_table,
    natural_sort_key,
    region_box_from_face_box,
    rows_for_ui,
    track_video_candidates,
    weighted_median,
    weighted_prediction,
)


@dataclass(frozen=True)
class ModelSpec:
    name: str
    task: str
    factory: Callable[[], Any]
    harmonic: bool = False
    selector_mode: str = "rank"
    smoother: str = "none"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run additional single-view RGB rPPG selector experiments.")
    parser.add_argument("--candidates", type=Path, default=Path("reports/rppg_single_view_sqi/candidate_window_peaks.csv"))
    parser.add_argument("--labels-csv", type=Path, default=Path("dataset_front/video_labels_ocr.csv"))
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_single_view_experiments"))
    parser.add_argument("--ui-data", type=Path, default=Path("ui/src/generated/rppgSingleViewExperiments.ts"))
    parser.add_argument("--min-bpm", type=float, default=80.0)
    parser.add_argument("--max-bpm", type=float, default=240.0)
    parser.add_argument("--track-candidates-per-window", type=int, default=40)
    parser.add_argument("--track-jump-bpm", type=float, default=18.0)
    parser.add_argument("--consensus-tolerance-bpm", type=float, default=3.0)
    parser.add_argument("--motion-reject-tolerance-bpm", type=float, default=5.0)
    parser.add_argument("--cache-dir", type=Path, default=None)
    parser.add_argument("--top-n-ui", type=int, default=32)
    return parser.parse_args()


def range_error_for(pred: float, bpm_min: float, bpm_max: float) -> tuple[float, bool]:
    if not np.isfinite(pred):
        return np.nan, False
    if pred < bpm_min:
        return float(bpm_min - pred), False
    if pred > bpm_max:
        return float(pred - bpm_max), False
    return 0.0, True


def recompute_errors(frame: pd.DataFrame) -> pd.DataFrame:
    out = frame.copy()
    target = pd.to_numeric(out["bpm_target"], errors="coerce")
    pred = pd.to_numeric(out["peak_bpm"], errors="coerce")
    bpm_min = pd.to_numeric(out["bpm_min"], errors="coerce")
    bpm_max = pd.to_numeric(out["bpm_max"], errors="coerce")
    out["target_abs_error"] = (pred - target).abs()
    out["range_error"] = np.where(pred < bpm_min, bpm_min - pred, np.where(pred > bpm_max, pred - bpm_max, 0.0))
    out["within_range"] = (pred >= bpm_min) & (pred <= bpm_max)
    return out


def load_candidates(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    numeric_cols = [
        "window_index",
        "window_start_sec",
        "window_end_sec",
        "peak_rank",
        "peak_bpm",
        "bpm_min",
        "bpm_max",
        "bpm_target",
        "target_abs_error",
        "range_error",
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
    for col in numeric_cols:
        frame[col] = pd.to_numeric(frame[col], errors="coerce")
    frame["within_range"] = frame["within_range"].astype(str).str.lower().eq("true")
    frame["raw_peak_bpm"] = frame["peak_bpm"]
    frame["harmonic_factor"] = 1.0
    frame["harmonic_adjusted"] = False
    frame["harmonic_score"] = frame["quality_score"]
    return frame.replace([np.inf, -np.inf], np.nan).dropna(subset=["peak_bpm", "bpm_target"])


def expand_harmonics(frame: pd.DataFrame, min_bpm: float, max_bpm: float) -> pd.DataFrame:
    factors = [
        (0.5, "half", "half_ratio"),
        (1.0, "original", ""),
        (1.5, "one_point_five", ""),
        (2.0, "double", "h2_ratio"),
    ]
    parts: list[pd.DataFrame] = []
    for factor, label, support_col in factors:
        part = frame.copy()
        part["raw_peak_bpm"] = frame["raw_peak_bpm"]
        part["peak_bpm"] = frame["raw_peak_bpm"] * factor
        part["harmonic_factor"] = factor
        part["harmonic_label"] = label
        part["harmonic_adjusted"] = factor != 1.0
        support = pd.Series(0.0, index=part.index)
        if support_col:
            support = np.log1p(pd.to_numeric(part[support_col], errors="coerce").fillna(0.0).clip(lower=0.0))
        penalty = 0.16 if factor in (0.5, 2.0) else (0.38 if factor == 1.5 else 0.0)
        part["harmonic_score"] = pd.to_numeric(part["quality_score"], errors="coerce") + 0.85 * support - penalty
        part = part[(part["peak_bpm"] >= min_bpm) & (part["peak_bpm"] <= max_bpm)].copy()
        parts.append(part)
    return recompute_errors(pd.concat(parts, ignore_index=True))


def positive_labels(frame: pd.DataFrame) -> np.ndarray:
    range_error = pd.to_numeric(frame["range_error"], errors="coerce")
    target_error = pd.to_numeric(frame["target_abs_error"], errors="coerce")
    return ((range_error <= 3.0) | (target_error <= 5.0)).fillna(False).to_numpy(dtype=int)


def feature_frame(frame: pd.DataFrame) -> pd.DataFrame:
    features = candidate_feature_frame(frame)
    raw_peak = pd.to_numeric(frame.get("raw_peak_bpm", frame["peak_bpm"]), errors="coerce")
    peak = pd.to_numeric(frame["peak_bpm"], errors="coerce")
    factor = pd.to_numeric(frame.get("harmonic_factor", 1.0), errors="coerce").fillna(1.0)
    features["raw_peak_bpm"] = raw_peak
    features["harmonic_factor"] = factor
    features["harmonic_adjusted"] = (factor != 1.0).astype(float)
    features["harmonic_score"] = pd.to_numeric(frame.get("harmonic_score", frame["quality_score"]), errors="coerce")
    features["harmonic_delta_bpm"] = peak - raw_peak
    for value in (0.5, 1.0, 1.5, 2.0):
        label = str(value).replace(".", "p")
        features[f"harmonic_factor_{label}"] = (np.isclose(factor, value)).astype(float)
    optional_columns = [
        "consensus_count",
        "consensus_method_count",
        "consensus_region_count",
        "consensus_patch_neighbor_count",
        "window_candidate_count",
        "global_consensus_ratio",
        "localized_consensus_score",
        "consensus_score",
        "motion_peak_bpm",
        "motion_peak_power_ratio",
        "motion_overlap",
        "motion_artifact_score",
        "panting_score",
        "panting_peak_bpm",
        "panting_overlap",
        "mouth_region_score",
        "lower_face_candidate",
        "fur_texture_score",
        "edge_density",
        "dog_artifact_score",
        "dog_prior_score",
        "dog_upper_mid_score",
        "dog_upper_mid_prior_score",
        "consensus_motion_score",
        "localized_consensus_motion_score",
    ]
    for col in optional_columns:
        if col in frame.columns:
            features[col] = pd.to_numeric(frame[col], errors="coerce")
        else:
            features[col] = 0.0
    return features.replace([np.inf, -np.inf], np.nan).fillna(0.0)


def weighted_prediction_from_values(values: np.ndarray, scores: np.ndarray) -> float:
    good = np.isfinite(values) & np.isfinite(scores)
    if good.sum() == 0:
        return np.nan
    values = values[good]
    scores = scores[good]
    weights = scores - np.nanmin(scores) + 0.1
    weights = np.clip(weights, 0.05, None)
    return float(weighted_median(values, weights))


def kalman_smooth_constant(values: np.ndarray, scores: np.ndarray, process_var: float = 5.0, base_meas_var: float = 110.0) -> np.ndarray:
    values = np.asarray(values, dtype=float)
    scores = np.asarray(scores, dtype=float)
    if len(values) == 0:
        return values
    finite = np.isfinite(values)
    if not finite.any():
        return values
    values = values.copy()
    values[~finite] = np.nanmedian(values[finite])
    if not np.isfinite(scores).any():
        scores = np.ones_like(values)
    score_min = float(np.nanmin(scores))
    score_max = float(np.nanmax(scores))
    confidence = (scores - score_min) / (score_max - score_min + 1e-9)
    confidence = np.clip(confidence, 0.05, 1.0)
    meas_var = base_meas_var / confidence

    n = len(values)
    filt_x = np.zeros(n)
    filt_p = np.zeros(n)
    pred_x = np.zeros(n)
    pred_p = np.zeros(n)
    filt_x[0] = values[0]
    filt_p[0] = meas_var[0]
    for idx in range(1, n):
        pred_x[idx] = filt_x[idx - 1]
        pred_p[idx] = filt_p[idx - 1] + process_var
        gain = pred_p[idx] / (pred_p[idx] + meas_var[idx])
        filt_x[idx] = pred_x[idx] + gain * (values[idx] - pred_x[idx])
        filt_p[idx] = (1.0 - gain) * pred_p[idx]

    smooth_x = filt_x.copy()
    smooth_p = filt_p.copy()
    for idx in range(n - 2, -1, -1):
        denom = pred_p[idx + 1] if pred_p[idx + 1] > 1e-9 else 1e-9
        gain = filt_p[idx] / denom
        smooth_x[idx] = filt_x[idx] + gain * (smooth_x[idx + 1] - pred_x[idx + 1])
        smooth_p[idx] = filt_p[idx] + gain * gain * (smooth_p[idx + 1] - pred_p[idx + 1])
    return smooth_x


def best_rows_per_window(frame: pd.DataFrame, score_col: str) -> pd.DataFrame:
    if frame.empty:
        return pd.DataFrame()
    return (
        frame.sort_values(["window_index", score_col], ascending=[True, False])
        .groupby("window_index")
        .head(1)
        .reset_index(drop=True)
    )


def patch_rc(region_id: str) -> tuple[int | None, int | None]:
    match = re.match(r"patch_r(\d+)_c(\d+)", str(region_id))
    if not match:
        return None, None
    return int(match.group(1)), int(match.group(2))


def robust_norm(series: pd.Series) -> pd.Series:
    values = pd.to_numeric(series, errors="coerce").replace([np.inf, -np.inf], np.nan).fillna(0.0)
    lo = float(values.quantile(0.05))
    hi = float(values.quantile(0.95))
    if not np.isfinite(hi - lo) or abs(hi - lo) < 1e-9:
        return pd.Series(0.0, index=series.index)
    return ((values - lo) / (hi - lo)).clip(0.0, 1.0)


def add_consensus_features(frame: pd.DataFrame, tolerance_bpm: float) -> pd.DataFrame:
    out = frame.copy()
    for col in [
        "consensus_count",
        "consensus_method_count",
        "consensus_region_count",
        "consensus_patch_neighbor_count",
        "window_candidate_count",
        "global_consensus_ratio",
        "localized_consensus_score",
        "consensus_score",
    ]:
        out[col] = 0.0

    for _, group in out.groupby(["video", "window_index"], sort=False):
        idx = group.index.to_numpy()
        bpms = pd.to_numeric(group["peak_bpm"], errors="coerce").to_numpy(dtype=float)
        methods = group["method"].astype(str).to_numpy()
        regions = group["region_id"].astype(str).to_numpy()
        bins = np.floor(bpms / tolerance_bpm).astype(int)
        bin_to_positions: dict[int, list[int]] = {}
        for pos, bin_id in enumerate(bins):
            bin_to_positions.setdefault(int(bin_id), []).append(pos)

        rows = [patch_rc(region) for region in regions]
        consensus_count = np.zeros(len(group), dtype=float)
        method_count = np.zeros(len(group), dtype=float)
        region_count = np.zeros(len(group), dtype=float)
        neighbor_count = np.zeros(len(group), dtype=float)
        window_count = np.full(len(group), float(len(group)), dtype=float)

        for pos, bpm in enumerate(bpms):
            if not np.isfinite(bpm):
                continue
            nearby_positions: list[int] = []
            bin_id = int(bins[pos])
            for candidate_bin in (bin_id - 1, bin_id, bin_id + 1):
                nearby_positions.extend(bin_to_positions.get(candidate_bin, []))
            if not nearby_positions:
                continue
            nearby = np.array(nearby_positions, dtype=int)
            nearby = nearby[np.abs(bpms[nearby] - bpm) <= tolerance_bpm]
            if len(nearby) == 0:
                continue
            consensus_count[pos] = float(len(nearby))
            method_count[pos] = float(len(np.unique(methods[nearby])))
            region_count[pos] = float(len(np.unique(regions[nearby])))
            row, col = rows[pos]
            if row is not None and col is not None:
                neighbors = 0
                for other_pos in nearby:
                    other_row, other_col = rows[int(other_pos)]
                    if other_row is None or other_col is None:
                        continue
                    if abs(other_row - row) <= 1 and abs(other_col - col) <= 1:
                        neighbors += 1
                neighbor_count[pos] = float(neighbors)

        out.loc[idx, "consensus_count"] = consensus_count
        out.loc[idx, "consensus_method_count"] = method_count
        out.loc[idx, "consensus_region_count"] = region_count
        out.loc[idx, "consensus_patch_neighbor_count"] = neighbor_count
        out.loc[idx, "window_candidate_count"] = window_count

    out["consensus_score"] = (
        0.52 * np.log1p(pd.to_numeric(out["consensus_count"], errors="coerce").fillna(0.0))
        + 0.95 * np.log1p(pd.to_numeric(out["consensus_method_count"], errors="coerce").fillna(0.0))
        + 0.62 * np.log1p(pd.to_numeric(out["consensus_region_count"], errors="coerce").fillna(0.0))
        + 0.20 * np.log1p(pd.to_numeric(out["consensus_patch_neighbor_count"], errors="coerce").fillna(0.0))
    )
    out["global_consensus_ratio"] = (
        pd.to_numeric(out["consensus_count"], errors="coerce").fillna(0.0)
        / pd.to_numeric(out["window_candidate_count"], errors="coerce").replace(0, np.nan).fillna(1.0)
    )
    out["localized_consensus_score"] = (
        0.88 * np.log1p(pd.to_numeric(out["consensus_method_count"], errors="coerce").fillna(0.0))
        + 0.92 * np.log1p(pd.to_numeric(out["consensus_patch_neighbor_count"], errors="coerce").fillna(0.0))
        + 0.18 * np.log1p(pd.to_numeric(out["consensus_count"], errors="coerce").fillna(0.0))
        - 0.48 * np.log1p(pd.to_numeric(out["consensus_region_count"], errors="coerce").fillna(0.0))
        - 1.40 * pd.to_numeric(out["global_consensus_ratio"], errors="coerce").fillna(0.0)
    )
    return out


def motion_peak_for_window(times: np.ndarray, boxes: np.ndarray, start_sec: float, end_sec: float, min_bpm: float, max_bpm: float) -> tuple[float, float]:
    if len(times) == 0 or len(boxes) == 0:
        return np.nan, 0.0
    mask = (times >= start_sec) & (times <= end_sec) & np.isfinite(boxes[:, :4]).all(axis=1)
    if mask.sum() < 16:
        return np.nan, 0.0
    t = times[mask].astype(float)
    b = boxes[mask, :4].astype(float)
    dt = np.nanmedian(np.diff(t))
    if not np.isfinite(dt) or dt <= 0:
        return np.nan, 0.0
    fs = 1.0 / dt
    cx = (b[:, 0] + b[:, 2]) / 2.0
    cy = (b[:, 1] + b[:, 3]) / 2.0
    area = np.maximum((b[:, 2] - b[:, 0]) * (b[:, 3] - b[:, 1]), 1.0)
    traces = [cx, cy, np.sqrt(area)]
    best_bpm = np.nan
    best_ratio = 0.0
    lo = min_bpm / 60.0
    hi = min(max_bpm / 60.0, fs * 0.45)
    for trace in traces:
        x = np.asarray(trace, dtype=float)
        x = x - np.nanmedian(x)
        if not np.isfinite(x).all() or np.nanstd(x) < 1e-9:
            continue
        freqs, power = signal.periodogram(x, fs=fs, window="hann", nfft=max(256, int(2 ** math.ceil(math.log2(len(x))) * 4)))
        band = (freqs >= lo) & (freqs <= hi)
        if band.sum() < 3:
            continue
        band_freqs = freqs[band]
        band_power = power[band]
        total = float(np.sum(band_power) + 1e-12)
        peak_idx = int(np.argmax(band_power))
        ratio = float(band_power[peak_idx] / total)
        if ratio > best_ratio:
            best_ratio = ratio
            best_bpm = float(band_freqs[peak_idx] * 60.0)
    return best_bpm, best_ratio


def add_motion_features(frame: pd.DataFrame, args: argparse.Namespace) -> pd.DataFrame:
    out = frame.copy()
    out["motion_peak_bpm"] = np.nan
    out["motion_peak_power_ratio"] = 0.0
    cache_dir = args.cache_dir or (args.candidates.parent / "cache")
    motion_lookup: dict[tuple[str, int], tuple[float, float]] = {}
    for video in sorted(out["video"].unique(), key=natural_sort_key):
        cache_path = cache_dir / f"{Path(str(video)).stem}_candidate_traces.npz"
        if not cache_path.exists():
            continue
        data = np.load(cache_path, allow_pickle=True)
        times = data["times"]
        boxes = data["boxes"]
        video_windows = out[out["video"] == video][["window_index", "window_start_sec", "window_end_sec"]].drop_duplicates()
        for row in video_windows.itertuples():
            motion_lookup[(str(video), int(row.window_index))] = motion_peak_for_window(
                times,
                boxes,
                float(row.window_start_sec),
                float(row.window_end_sec),
                args.min_bpm,
                args.max_bpm,
            )
    for (video, window_index), (motion_bpm, motion_ratio) in motion_lookup.items():
        mask = (out["video"] == video) & (out["window_index"] == window_index)
        out.loc[mask, "motion_peak_bpm"] = motion_bpm
        out.loc[mask, "motion_peak_power_ratio"] = motion_ratio
    bpm = pd.to_numeric(out["peak_bpm"], errors="coerce")
    motion_bpm = pd.to_numeric(out["motion_peak_bpm"], errors="coerce")
    motion_ratio = pd.to_numeric(out["motion_peak_power_ratio"], errors="coerce").fillna(0.0)
    diff = (bpm - motion_bpm).abs()
    out["motion_overlap"] = np.exp(-0.5 * (diff / args.motion_reject_tolerance_bpm) ** 2).fillna(0.0) * motion_ratio
    out["motion_artifact_score"] = (
        pd.to_numeric(out["motion_overlap"], errors="coerce").fillna(0.0)
        + 0.26 * robust_norm(out["box_motion"])
        + 0.18 * robust_norm(out["color_cv"])
    )
    return out


def trace_peak(times: np.ndarray, values: np.ndarray, start_sec: float, end_sec: float, min_bpm: float, max_bpm: float) -> tuple[float, float, float]:
    mask = (times >= start_sec) & (times <= end_sec)
    x = np.asarray(values[mask], dtype=float)
    t = np.asarray(times[mask], dtype=float)
    good = np.isfinite(x) & np.isfinite(t)
    if good.sum() < 16:
        return np.nan, 0.0, 0.0
    x = x[good]
    t = t[good]
    dt = np.nanmedian(np.diff(t))
    if not np.isfinite(dt) or dt <= 0:
        return np.nan, 0.0, 0.0
    fs = 1.0 / dt
    x = x - np.nanmedian(x)
    scale = np.nanmedian(np.abs(x)) + 1e-9
    norm_std = float(np.nanstd(x) / scale)
    if np.nanstd(x) < 1e-9:
        return np.nan, 0.0, norm_std
    freqs, power = signal.periodogram(x, fs=fs, window="hann", nfft=max(256, int(2 ** math.ceil(math.log2(len(x))) * 4)))
    lo = min_bpm / 60.0
    hi = min(max_bpm / 60.0, fs * 0.45)
    band = (freqs >= lo) & (freqs <= hi)
    if band.sum() < 3:
        return np.nan, 0.0, norm_std
    band_freqs = freqs[band]
    band_power = power[band]
    peak_idx = int(np.argmax(band_power))
    ratio = float(band_power[peak_idx] / (np.sum(band_power) + 1e-12))
    return float(band_freqs[peak_idx] * 60.0), ratio, norm_std


def add_panting_features(frame: pd.DataFrame, args: argparse.Namespace) -> pd.DataFrame:
    out = frame.copy()
    out["panting_peak_bpm"] = np.nan
    out["panting_score"] = 0.0
    cache_dir = args.cache_dir or (args.candidates.parent / "cache")
    pant_lookup: dict[tuple[str, int], tuple[float, float]] = {}
    for video in sorted(out["video"].unique(), key=natural_sort_key):
        cache_path = cache_dir / f"{Path(str(video)).stem}_candidate_traces.npz"
        if not cache_path.exists():
            continue
        data = np.load(cache_path, allow_pickle=True)
        if not all(key in data.files for key in ("times", "rgb__lower_face", "rgb__upper_face", "rgb__mid_face")):
            continue
        times = data["times"]
        lower_rgb = data["rgb__lower_face"].astype(float)
        upper_rgb = data["rgb__upper_face"].astype(float)
        mid_rgb = data["rgb__mid_face"].astype(float)
        lower_luma = lower_rgb.mean(axis=1)
        upper_luma = upper_rgb.mean(axis=1)
        mid_luma = mid_rgb.mean(axis=1)
        lower_redness = lower_rgb[:, 0] - 0.5 * (lower_rgb[:, 1] + lower_rgb[:, 2])
        video_windows = out[out["video"] == video][["window_index", "window_start_sec", "window_end_sec"]].drop_duplicates()
        for row in video_windows.itertuples():
            start_sec = float(row.window_start_sec)
            end_sec = float(row.window_end_sec)
            lower_bpm, lower_ratio, lower_std = trace_peak(times, lower_luma, start_sec, end_sec, 60.0, 300.0)
            red_bpm, red_ratio, red_std = trace_peak(times, lower_redness, start_sec, end_sec, 60.0, 300.0)
            _, upper_ratio, upper_std = trace_peak(times, upper_luma, start_sec, end_sec, 60.0, 300.0)
            _, mid_ratio, mid_std = trace_peak(times, mid_luma, start_sec, end_sec, 60.0, 300.0)
            activity_ratio = max(0.0, lower_std / (0.5 * (upper_std + mid_std) + 1e-6) - 1.0)
            score = max(
                0.0,
                1.05 * lower_ratio
                + 0.75 * red_ratio
                + 0.26 * min(activity_ratio, 4.0)
                - 0.40 * max(upper_ratio, mid_ratio),
            )
            peak_bpm = lower_bpm if lower_ratio >= red_ratio or not np.isfinite(red_bpm) else red_bpm
            pant_lookup[(str(video), int(row.window_index))] = (peak_bpm, score)

    for (video, window_index), (pant_bpm, pant_score) in pant_lookup.items():
        mask = (out["video"] == video) & (out["window_index"] == window_index)
        out.loc[mask, "panting_peak_bpm"] = pant_bpm
        out.loc[mask, "panting_score"] = pant_score

    bpm = pd.to_numeric(out["peak_bpm"], errors="coerce")
    pant_bpm = pd.to_numeric(out["panting_peak_bpm"], errors="coerce")
    diffs = pd.concat(
        [
            (bpm - pant_bpm).abs(),
            (bpm - pant_bpm * 0.5).abs(),
            (bpm - pant_bpm * 2.0).abs(),
        ],
        axis=1,
    ).min(axis=1)
    out["panting_overlap"] = np.exp(-0.5 * (diffs / max(args.motion_reject_tolerance_bpm, 1e-6)) ** 2).fillna(0.0) * pd.to_numeric(
        out["panting_score"], errors="coerce"
    ).fillna(0.0)
    return out


def dog_mouth_region_score(region_id: str) -> float:
    region = str(region_id)
    if region == "lower_face":
        return 1.0
    if region == "face_full":
        return 0.35
    if region == "mid_face":
        return 0.30
    if region == "upper_face":
        return 0.0
    row, col = patch_rc(region)
    if row is None or col is None:
        return 0.0
    if row >= 5:
        return 1.0
    if row == 4:
        return 0.85 if 2 <= col <= 4 else 0.65
    if row == 3:
        return 0.55 if 2 <= col <= 4 else 0.25
    return 0.0


def dog_upper_mid_score_for_region(region_id: str) -> float:
    region = str(region_id)
    if region in ("upper_face", "mid_face"):
        return 1.0
    if region == "face_full":
        return 0.25
    if region == "lower_face":
        return 0.0
    row, _ = patch_rc(region)
    if row is None:
        return 0.0
    if row <= 2:
        return 1.0
    if row == 3:
        return 0.55
    return 0.0


def finite_box_near_time(times: np.ndarray, boxes: np.ndarray, target_sec: float) -> np.ndarray | None:
    if len(times) == 0 or len(boxes) == 0:
        return None
    finite = np.isfinite(boxes[:, :4]).all(axis=1)
    if not finite.any():
        return None
    idxs = np.flatnonzero(finite)
    nearest = idxs[int(np.argmin(np.abs(times[idxs] - target_sec)))]
    return boxes[nearest, :4].astype(float)


def frame_at(video_path: Path, time_sec: float) -> np.ndarray | None:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return None
    cap.set(cv2.CAP_PROP_POS_MSEC, max(time_sec, 0.0) * 1000.0)
    ok, frame = cap.read()
    cap.release()
    return frame if ok else None


def crop_texture(crop: np.ndarray) -> tuple[float, float]:
    if crop.size == 0:
        return 0.0, 0.0
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 130)
    edge_density = float((edges > 0).mean())
    lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    texture = math.log1p(max(lap_var, 0.0)) * 0.10 + edge_density
    return edge_density, texture


def add_texture_features(frame: pd.DataFrame, args: argparse.Namespace) -> pd.DataFrame:
    out = frame.copy()
    out["edge_density"] = 0.0
    out["fur_texture_score"] = 0.0
    labels = pd.read_csv(args.labels_csv)
    path_by_video = {str(row.video): Path(str(row.path)) for row in labels.itertuples() if bool(row.usable)}
    cache_dir = args.cache_dir or (args.candidates.parent / "cache")
    regions = {region.id: region for region in make_region_catalog(5, 5)}
    texture_rows: list[dict[str, Any]] = []
    sample_times = [0.5, 5.0, 10.0]
    for video in sorted(out["video"].unique(), key=natural_sort_key):
        video_path = path_by_video.get(str(video))
        cache_path = cache_dir / f"{Path(str(video)).stem}_candidate_traces.npz"
        if video_path is None or not video_path.exists() or not cache_path.exists():
            continue
        data = np.load(cache_path, allow_pickle=True)
        times = data["times"]
        boxes = data["boxes"]
        region_metrics: dict[str, list[tuple[float, float]]] = {region_id: [] for region_id in regions}
        for time_sec in sample_times:
            img = frame_at(video_path, time_sec)
            box = finite_box_near_time(times, boxes, time_sec)
            if img is None or box is None:
                continue
            for region_id, region in regions.items():
                crop_box = region_box_from_face_box(img.shape, box, region).round().astype(int)
                x1, y1, x2, y2 = crop_box
                crop = img[y1:y2, x1:x2]
                region_metrics[region_id].append(crop_texture(crop))
        for region_id, values in region_metrics.items():
            if not values:
                continue
            edge = float(np.median([value[0] for value in values]))
            texture = float(np.median([value[1] for value in values]))
            texture_rows.append({"video": str(video), "region_id": region_id, "edge_density": edge, "texture_raw": texture})

    if not texture_rows:
        return out
    texture_df = pd.DataFrame(texture_rows)
    texture_df["fur_texture_score"] = 0.0
    for video, group in texture_df.groupby("video"):
        texture_df.loc[group.index, "fur_texture_score"] = robust_norm(group["texture_raw"]).to_numpy(dtype=float)
    out = out.merge(texture_df[["video", "region_id", "edge_density", "fur_texture_score"]], on=["video", "region_id"], how="left", suffixes=("", "_tex"))
    out["edge_density"] = pd.to_numeric(out.get("edge_density_tex", out["edge_density"]), errors="coerce").fillna(out["edge_density"])
    out["fur_texture_score"] = pd.to_numeric(out.get("fur_texture_score_tex", out["fur_texture_score"]), errors="coerce").fillna(
        out["fur_texture_score"]
    )
    for col in ("edge_density_tex", "fur_texture_score_tex"):
        if col in out.columns:
            out = out.drop(columns=[col])
    return out


def add_dog_specific_features(frame: pd.DataFrame, args: argparse.Namespace) -> pd.DataFrame:
    out = add_panting_features(frame, args)
    out = add_texture_features(out, args)
    out["mouth_region_score"] = out["region_id"].map(dog_mouth_region_score).astype(float)
    out["lower_face_candidate"] = (out["mouth_region_score"] >= 0.65).astype(float)
    out["dog_upper_mid_score"] = out["region_id"].map(dog_upper_mid_score_for_region).astype(float)
    panting = pd.to_numeric(out["panting_score"], errors="coerce").fillna(0.0)
    mouth = pd.to_numeric(out["mouth_region_score"], errors="coerce").fillna(0.0)
    fur = pd.to_numeric(out["fur_texture_score"], errors="coerce").fillna(0.0)
    pant_overlap = pd.to_numeric(out["panting_overlap"], errors="coerce").fillna(0.0)
    motion = pd.to_numeric(out["motion_artifact_score"], errors="coerce").fillna(0.0)
    out["dog_artifact_score"] = 0.95 * panting * (0.20 + mouth) + 1.10 * pant_overlap + 0.65 * fur + 0.35 * motion
    upper_mid = pd.to_numeric(out["dog_upper_mid_score"], errors="coerce").fillna(0.0)
    localized = pd.to_numeric(out["localized_consensus_score"], errors="coerce").fillna(0.0)
    harmonic = pd.to_numeric(out["harmonic_score"], errors="coerce").fillna(0.0)
    out["dog_prior_score"] = harmonic + 0.56 * localized + 0.42 * upper_mid - 1.25 * out["dog_artifact_score"]
    out["dog_upper_mid_prior_score"] = harmonic + 0.36 * localized + 0.78 * upper_mid - 1.45 * mouth - 1.05 * pant_overlap - 0.72 * fur
    return out.replace([np.inf, -np.inf], np.nan).fillna(0.0)


def prepare_enhanced_harmonic(frame: pd.DataFrame, args: argparse.Namespace) -> pd.DataFrame:
    harmonic = expand_harmonics(frame, args.min_bpm, args.max_bpm)
    harmonic = add_consensus_features(harmonic, args.consensus_tolerance_bpm)
    harmonic = add_motion_features(harmonic, args)
    harmonic = add_dog_specific_features(harmonic, args)
    harmonic["consensus_harmonic_score"] = pd.to_numeric(harmonic["harmonic_score"], errors="coerce").fillna(0.0) + harmonic[
        "consensus_score"
    ]
    harmonic["consensus_motion_score"] = (
        pd.to_numeric(harmonic["harmonic_score"], errors="coerce").fillna(0.0)
        + 0.92 * pd.to_numeric(harmonic["consensus_score"], errors="coerce").fillna(0.0)
        + 0.24 * pd.to_numeric(harmonic["valid_fraction"], errors="coerce").fillna(0.0)
        - 1.75 * pd.to_numeric(harmonic["motion_artifact_score"], errors="coerce").fillna(0.0)
    )
    harmonic["localized_consensus_motion_score"] = (
        pd.to_numeric(harmonic["harmonic_score"], errors="coerce").fillna(0.0)
        + 1.10 * pd.to_numeric(harmonic["localized_consensus_score"], errors="coerce").fillna(0.0)
        + 0.24 * pd.to_numeric(harmonic["valid_fraction"], errors="coerce").fillna(0.0)
        - 1.75 * pd.to_numeric(harmonic["motion_artifact_score"], errors="coerce").fillna(0.0)
    )
    return harmonic.replace([np.inf, -np.inf], np.nan).fillna(0.0)


def track_harmonic_aware_candidates(
    group: pd.DataFrame,
    args: argparse.Namespace,
    score_col: str,
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
        prev = layers[idx - 1]
        curr = layers[idx]
        prev_bpms = prev["peak_bpm"].to_numpy(dtype=float)
        curr_bpms = curr["peak_bpm"].to_numpy(dtype=float)
        prev_factors = pd.to_numeric(prev["harmonic_factor"], errors="coerce").fillna(1.0).to_numpy(dtype=float)
        curr_factors = pd.to_numeric(curr["harmonic_factor"], errors="coerce").fillna(1.0).to_numpy(dtype=float)
        prev_methods = prev["method"].astype(str).to_numpy()
        curr_methods = curr["method"].astype(str).to_numpy()
        curr_scores = curr["score_norm"].to_numpy(dtype=float)
        prev_scores = dp[-1]
        curr_dp = np.full(len(curr_bpms), -np.inf, dtype=float)
        curr_back = np.zeros(len(curr_bpms), dtype=int)
        for j, bpm in enumerate(curr_bpms):
            bpm_penalty = ((prev_bpms - bpm) / args.track_jump_bpm) ** 2
            factor_penalty = np.where(np.isclose(prev_factors, curr_factors[j]), 0.0, 0.10)
            method_penalty = np.where(prev_methods == curr_methods[j], 0.0, 0.035)
            penalties = bpm_penalty + factor_penalty + method_penalty
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


def selector_row(
    selector: str,
    video: str,
    path: pd.DataFrame,
    score_col: str,
    source: str,
    smoothed: bool = False,
) -> dict[str, Any] | None:
    if path.empty:
        return None
    frame = path.copy().sort_values("window_index")
    if smoothed:
        values = pd.to_numeric(frame["peak_bpm"], errors="coerce").to_numpy(dtype=float)
        scores = pd.to_numeric(frame[score_col], errors="coerce").to_numpy(dtype=float)
        smooth_values = kalman_smooth_constant(values, scores)
        pred = weighted_prediction_from_values(smooth_values, scores)
    else:
        pred, _ = weighted_prediction(frame, score_col=score_col)
    if not np.isfinite(pred):
        return None
    first = frame.iloc[0]
    bpm_min = float(first["bpm_min"])
    bpm_max = float(first["bpm_max"])
    target = float(first["bpm_target"])
    range_error, within_range = range_error_for(float(pred), bpm_min, bpm_max)
    top_source = frame.groupby(["method", "region_id"]).size().sort_values(ascending=False).index[0]
    factor = float(pd.to_numeric(frame["harmonic_factor"], errors="coerce").median()) if "harmonic_factor" in frame else 1.0
    return {
        "selector": selector,
        "video": video,
        "pred_bpm": round(float(pred), 3),
        "bpm_min": bpm_min,
        "bpm_max": bpm_max,
        "bpm_target": target,
        "target_abs_error": round(abs(float(pred) - target), 3),
        "range_error": round(float(range_error), 3) if np.isfinite(range_error) else "",
        "within_range": bool(within_range),
        "source": source,
        "selected_method": str(top_source[0]),
        "selected_region": str(top_source[1]),
        "window_count": int(frame["window_index"].nunique()),
        "median_score": round(float(pd.to_numeric(frame[score_col], errors="coerce").median()), 5),
        "harmonic_factor_median": round(factor, 3),
        "harmonic_adjusted_pct": round(float(frame.get("harmonic_adjusted", pd.Series(False, index=frame.index)).mean() * 100.0), 2),
    }


def summarize_predictions(predictions: pd.DataFrame) -> pd.DataFrame:
    if predictions.empty:
        return pd.DataFrame()
    rows: list[dict[str, Any]] = []
    frame = predictions.copy()
    frame["target_abs_error"] = pd.to_numeric(frame["target_abs_error"], errors="coerce")
    frame["range_error"] = pd.to_numeric(frame["range_error"], errors="coerce")
    for selector, group in frame.groupby("selector"):
        valid = group.dropna(subset=["target_abs_error"])
        if valid.empty:
            continue
        rows.append(
            {
                "selector": selector,
                "n": int(len(valid)),
                "target_mae": round(float(valid["target_abs_error"].mean()), 3),
                "target_rmse": round(float(np.sqrt(np.mean(valid["target_abs_error"] ** 2))), 3),
                "range_mae": round(float(valid["range_error"].mean()), 3),
                "within_range_pct": round(float(valid["within_range"].mean() * 100.0), 2),
                "median_harmonic_adjusted_pct": round(float(valid["harmonic_adjusted_pct"].median()), 2)
                if "harmonic_adjusted_pct" in valid
                else 0.0,
            }
        )
    return pd.DataFrame(rows).sort_values(
        ["range_mae", "target_mae", "within_range_pct"],
        ascending=[True, True, False],
    ).reset_index(drop=True)


def evaluate_unsupervised(frame: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    harmonic = expand_harmonics(frame, args.min_bpm, args.max_bpm)
    for name, data, score_col in [
        ("sqi_top_window_recheck", frame, "quality_score"),
        ("sqi_tracked_recheck", frame, "quality_score"),
        ("harmonic_sqi_top_window", harmonic, "harmonic_score"),
        ("harmonic_sqi_tracked", harmonic, "harmonic_score"),
        ("harmonic_sqi_tracked_kalman_ssm", harmonic, "harmonic_score"),
    ]:
        for video, group in data.groupby("video"):
            if "tracked" in name:
                path = track_video_candidates(group, args, score_col=score_col)
            else:
                path = best_rows_per_window(group, score_col)
            row = selector_row(
                name,
                str(video),
                path,
                score_col,
                "unsupervised signal-quality selector",
                smoothed="kalman_ssm" in name,
            )
            if row:
                rows.append(row)
    return rows


def evaluate_prior_selectors(enhanced: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    selector_specs = [
        ("harmonic_aware_viterbi_quality", "harmonic_score", False),
        ("consensus_harmonic_aware_viterbi", "consensus_harmonic_score", False),
        ("localized_consensus_harmonic_aware_viterbi", "localized_consensus_motion_score", False),
        ("consensus_motion_reject_top_window", "consensus_motion_score", False),
        ("consensus_motion_reject_harmonic_aware_viterbi", "consensus_motion_score", False),
        ("localized_consensus_motion_reject_harmonic_aware_viterbi", "localized_consensus_motion_score", False),
        ("consensus_motion_reject_harmonic_aware_viterbi_kalman_ssm", "consensus_motion_score", True),
        ("localized_consensus_motion_reject_harmonic_aware_viterbi_kalman_ssm", "localized_consensus_motion_score", True),
        ("dog_panting_texture_reject_harmonic_aware_viterbi", "dog_prior_score", False),
        ("dog_panting_texture_reject_harmonic_aware_viterbi_kalman_ssm", "dog_prior_score", True),
        ("dog_upper_mid_mouth_reject_harmonic_aware_viterbi", "dog_upper_mid_prior_score", False),
        ("dog_upper_mid_mouth_reject_harmonic_aware_viterbi_kalman_ssm", "dog_upper_mid_prior_score", True),
    ]
    for name, score_col, smooth in selector_specs:
        for video, group in enhanced.groupby("video"):
            if "top_window" in name:
                path = best_rows_per_window(group, score_col)
            else:
                path = track_harmonic_aware_candidates(group, args, score_col)
            row = selector_row(
                name,
                str(video),
                path,
                score_col,
                "harmonic-aware tracker with consensus and motion rejection",
                smoothed=smooth,
            )
            if row:
                rows.append(row)
    return rows


def classifier_score(model: Any, features: pd.DataFrame) -> np.ndarray:
    proba = model.predict_proba(features)
    classes = list(model.classes_)
    if 1 in classes:
        return proba[:, classes.index(1)]
    return np.zeros(len(features), dtype=float)


def evaluate_rank_model(frame: pd.DataFrame, spec: ModelSpec, args: argparse.Namespace) -> list[dict[str, Any]]:
    data = expand_harmonics(frame, args.min_bpm, args.max_bpm) if spec.harmonic else frame.copy()
    rows: list[dict[str, Any]] = []
    videos = sorted(data["video"].unique(), key=natural_sort_key)
    for video in videos:
        train = data[data["video"] != video].copy()
        test = data[data["video"] == video].copy()
        if train.empty or test.empty:
            continue
        x_train = feature_frame(train)
        x_test = feature_frame(test)
        if spec.task == "classifier":
            y_train = positive_labels(train)
            if len(np.unique(y_train)) < 2:
                continue
            model = spec.factory()
            model.fit(x_train, y_train)
            test["model_score"] = classifier_score(model, x_test)
        elif spec.task == "error_regressor":
            y_train = pd.to_numeric(train["target_abs_error"], errors="coerce").fillna(999.0)
            model = spec.factory()
            model.fit(x_train, y_train)
            test["model_score"] = -np.asarray(model.predict(x_test), dtype=float)
        else:
            raise ValueError(f"Unsupported rank task: {spec.task}")

        if spec.selector_mode == "top":
            path = best_rows_per_window(test, "model_score")
        else:
            path = track_video_candidates(test, args, score_col="model_score")
        row = selector_row(
            spec.name,
            str(video),
            path,
            "model_score",
            f"LOOCV {spec.task}",
            smoothed=spec.smoother == "kalman_ssm",
        )
        if row:
            rows.append(row)
    return rows


def evaluate_direct_hr_model(frame: pd.DataFrame, spec: ModelSpec, args: argparse.Namespace) -> list[dict[str, Any]]:
    data = expand_harmonics(frame, args.min_bpm, args.max_bpm) if spec.harmonic else frame.copy()
    rows: list[dict[str, Any]] = []
    videos = sorted(data["video"].unique(), key=natural_sort_key)
    for video in videos:
        train = data[data["video"] != video].copy()
        test = data[data["video"] == video].copy()
        if train.empty or test.empty:
            continue
        model = spec.factory()
        model.fit(feature_frame(train), pd.to_numeric(train["bpm_target"], errors="coerce"))
        test = test.copy()
        test["direct_hr_pred"] = np.asarray(model.predict(feature_frame(test)), dtype=float)
        test["direct_hr_score"] = pd.to_numeric(test.get("harmonic_score", test["quality_score"]), errors="coerce")
        window_rows: list[dict[str, Any]] = []
        for window_index, group in test.groupby("window_index"):
            values = pd.to_numeric(group["direct_hr_pred"], errors="coerce").to_numpy(dtype=float)
            scores = pd.to_numeric(group["direct_hr_score"], errors="coerce").to_numpy(dtype=float)
            pred = weighted_prediction_from_values(values, scores)
            top = group.sort_values("direct_hr_score", ascending=False).iloc[0].copy()
            top["window_index"] = window_index
            top["peak_bpm"] = pred
            top["model_score"] = float(np.nanmedian(scores))
            window_rows.append(top.to_dict())
        path = pd.DataFrame(window_rows)
        row = selector_row(
            spec.name,
            str(video),
            path,
            "model_score",
            "LOOCV direct HR regression",
            smoothed=spec.smoother == "kalman_ssm",
        )
        if row:
            rows.append(row)
    return rows


def evaluate_enhanced_loocv_models(enhanced: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    specs: list[tuple[str, str, Any]] = [
        (
            "loocv_rf_classifier_consensus_motion_harmonic_aware_viterbi",
            "classifier",
            RandomForestClassifier(
                n_estimators=180,
                max_depth=10,
                min_samples_leaf=2,
                class_weight="balanced_subsample",
                random_state=201,
                n_jobs=-1,
            ),
        ),
        (
            "loocv_extra_trees_classifier_consensus_motion_harmonic_aware_viterbi",
            "classifier",
            ExtraTreesClassifier(
                n_estimators=200,
                max_depth=12,
                min_samples_leaf=2,
                class_weight="balanced",
                random_state=202,
                n_jobs=-1,
            ),
        ),
        (
            "loocv_histgb_classifier_consensus_motion_harmonic_aware_viterbi",
            "classifier",
            HistGradientBoostingClassifier(max_iter=150, learning_rate=0.05, l2_regularization=0.06, random_state=203),
        ),
        (
            "loocv_rf_error_regressor_consensus_motion_harmonic_aware_viterbi",
            "error_regressor",
            RandomForestRegressor(n_estimators=170, max_depth=10, min_samples_leaf=2, random_state=204, n_jobs=-1),
        ),
    ]
    videos = sorted(enhanced["video"].unique(), key=natural_sort_key)
    for name, task, model_template in specs:
        print(f"[single-view-exp] {name}")
        for video in videos:
            train = enhanced[enhanced["video"] != video].copy()
            test = enhanced[enhanced["video"] == video].copy()
            if train.empty or test.empty:
                continue
            model = clone(model_template)
            x_train = feature_frame(train)
            x_test = feature_frame(test)
            if task == "classifier":
                y_train = positive_labels(train)
                if len(np.unique(y_train)) < 2:
                    continue
                model.fit(x_train, y_train)
                test["model_score"] = classifier_score(model, x_test)
            else:
                y_train = pd.to_numeric(train["target_abs_error"], errors="coerce").fillna(999.0)
                model.fit(x_train, y_train)
                test["model_score"] = -np.asarray(model.predict(x_test), dtype=float)
            test["enhanced_model_score"] = (
                pd.to_numeric(test["model_score"], errors="coerce").fillna(0.0)
                + 0.18 * robust_norm(test["consensus_score"])
                - 0.12 * robust_norm(test["motion_artifact_score"])
            )
            path = track_harmonic_aware_candidates(test, args, "enhanced_model_score")
            row = selector_row(
                name,
                str(video),
                path,
                "enhanced_model_score",
                f"LOOCV {task} with consensus/motion priors",
                smoothed=False,
            )
            if row:
                rows.append(row)
    return rows


def evaluate_dog_prior_loocv_models(enhanced: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    specs: list[tuple[str, str, Any]] = [
        (
            "loocv_rf_classifier_dog_panting_texture_harmonic_aware_viterbi",
            "classifier",
            RandomForestClassifier(
                n_estimators=180,
                max_depth=10,
                min_samples_leaf=2,
                class_weight="balanced_subsample",
                random_state=301,
                n_jobs=-1,
            ),
        ),
        (
            "loocv_histgb_classifier_dog_panting_texture_harmonic_aware_viterbi",
            "classifier",
            HistGradientBoostingClassifier(max_iter=160, learning_rate=0.05, l2_regularization=0.08, random_state=302),
        ),
        (
            "loocv_rf_error_regressor_dog_panting_texture_harmonic_aware_viterbi",
            "error_regressor",
            RandomForestRegressor(n_estimators=170, max_depth=10, min_samples_leaf=2, random_state=303, n_jobs=-1),
        ),
    ]
    videos = sorted(enhanced["video"].unique(), key=natural_sort_key)
    for name, task, model_template in specs:
        print(f"[single-view-exp] {name}")
        for video in videos:
            train = enhanced[enhanced["video"] != video].copy()
            test = enhanced[enhanced["video"] == video].copy()
            if train.empty or test.empty:
                continue
            model = clone(model_template)
            x_train = feature_frame(train)
            x_test = feature_frame(test)
            if task == "classifier":
                y_train = positive_labels(train)
                if len(np.unique(y_train)) < 2:
                    continue
                model.fit(x_train, y_train)
                test["model_score"] = classifier_score(model, x_test)
            else:
                y_train = pd.to_numeric(train["target_abs_error"], errors="coerce").fillna(999.0)
                model.fit(x_train, y_train)
                test["model_score"] = -np.asarray(model.predict(x_test), dtype=float)
            test["dog_model_score"] = (
                pd.to_numeric(test["model_score"], errors="coerce").fillna(0.0)
                + 0.22 * robust_norm(test["dog_prior_score"])
                + 0.10 * robust_norm(test["dog_upper_mid_score"])
                - 0.18 * robust_norm(test["dog_artifact_score"])
            )
            path = track_harmonic_aware_candidates(test, args, "dog_model_score")
            row = selector_row(
                name,
                str(video),
                path,
                "dog_model_score",
                f"LOOCV {task} with dog panting/texture priors",
                smoothed=False,
            )
            if row:
                rows.append(row)
    return rows


def evaluate_current_fit(frame: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    data = expand_harmonics(frame, args.min_bpm, args.max_bpm)
    rows: list[dict[str, Any]] = []
    x = feature_frame(data)
    classifier_specs: list[tuple[str, Any]] = [
        (
            "current_fit_rf_harmonic_tracked",
            RandomForestClassifier(
                n_estimators=180,
                max_depth=None,
                min_samples_leaf=1,
                class_weight="balanced_subsample",
                random_state=101,
                n_jobs=-1,
            ),
        ),
        (
            "current_fit_extra_trees_harmonic_tracked",
            ExtraTreesClassifier(
                n_estimators=220,
                max_depth=None,
                min_samples_leaf=1,
                class_weight="balanced",
                random_state=102,
                n_jobs=-1,
            ),
        ),
        (
            "current_fit_histgb_harmonic_tracked",
            HistGradientBoostingClassifier(max_iter=220, learning_rate=0.055, l2_regularization=0.02, random_state=103),
        ),
    ]
    y_class = positive_labels(data)
    if len(np.unique(y_class)) >= 2:
        for name, model in classifier_specs:
            model.fit(x, y_class)
            scored = data.copy()
            scored["model_score"] = classifier_score(model, x)
            for video, group in scored.groupby("video"):
                path = track_video_candidates(group, args, score_col="model_score")
                for suffix, smooth in [("", False), ("_kalman_ssm", True)]:
                    row = selector_row(name + suffix, str(video), path, "model_score", "current-label fit", smoothed=smooth)
                    if row:
                        rows.append(row)

    regressor_specs: list[tuple[str, Any]] = [
        (
            "current_fit_rf_error_regressor_harmonic_tracked",
            RandomForestRegressor(n_estimators=180, max_depth=None, min_samples_leaf=1, random_state=111, n_jobs=-1),
        ),
        (
            "current_fit_extra_trees_error_regressor_harmonic_tracked",
            ExtraTreesRegressor(n_estimators=220, max_depth=None, min_samples_leaf=1, random_state=112, n_jobs=-1),
        ),
    ]
    y_error = pd.to_numeric(data["target_abs_error"], errors="coerce").fillna(999.0)
    for name, model in regressor_specs:
        model.fit(x, y_error)
        scored = data.copy()
        scored["model_score"] = -np.asarray(model.predict(x), dtype=float)
        for video, group in scored.groupby("video"):
            path = track_video_candidates(group, args, score_col="model_score")
            row = selector_row(name, str(video), path, "model_score", "current-label fit", smoothed=False)
            if row:
                rows.append(row)

    direct_model = RandomForestRegressor(n_estimators=220, max_depth=None, min_samples_leaf=1, random_state=121, n_jobs=-1)
    direct_model.fit(feature_frame(frame), pd.to_numeric(frame["bpm_target"], errors="coerce"))
    direct = frame.copy()
    direct["direct_hr_pred"] = np.asarray(direct_model.predict(feature_frame(direct)), dtype=float)
    direct["direct_hr_score"] = pd.to_numeric(direct["quality_score"], errors="coerce")
    for video, group in direct.groupby("video"):
        window_rows: list[dict[str, Any]] = []
        for window_index, window_group in group.groupby("window_index"):
            values = pd.to_numeric(window_group["direct_hr_pred"], errors="coerce").to_numpy(dtype=float)
            scores = pd.to_numeric(window_group["direct_hr_score"], errors="coerce").to_numpy(dtype=float)
            pred = weighted_prediction_from_values(values, scores)
            top = window_group.sort_values("direct_hr_score", ascending=False).iloc[0].copy()
            top["window_index"] = window_index
            top["peak_bpm"] = pred
            top["model_score"] = float(np.nanmedian(scores))
            window_rows.append(top.to_dict())
        row = selector_row(
            "current_fit_rf_direct_hr_regression",
            str(video),
            pd.DataFrame(window_rows),
            "model_score",
            "current-label direct HR fit",
            smoothed=False,
        )
        if row:
            rows.append(row)
    return rows


def evaluate_oracles(frame: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    harmonic = expand_harmonics(frame, args.min_bpm, args.max_bpm)
    for name, data in [
        ("oracle_existing_window_peak", frame),
        ("oracle_harmonic_window_peak", harmonic),
    ]:
        work = data.copy()
        work["range_error_num"] = pd.to_numeric(work["range_error"], errors="coerce")
        work["target_abs_error_num"] = pd.to_numeric(work["target_abs_error"], errors="coerce")
        for video, group in work.groupby("video"):
            best = group.sort_values(["range_error_num", "target_abs_error_num", "peak_rank"]).head(1).copy()
            best["oracle_score"] = 1.0
            row = selector_row(name, str(video), best, "oracle_score", "label-leaked oracle", smoothed=False)
            if row:
                rows.append(row)
    return rows


def build_model_specs() -> list[ModelSpec]:
    return [
        ModelSpec(
            "loocv_rf_classifier_tracked",
            "classifier",
            lambda: RandomForestClassifier(
                n_estimators=160,
                max_depth=10,
                min_samples_leaf=2,
                class_weight="balanced_subsample",
                random_state=11,
                n_jobs=-1,
            ),
        ),
        ModelSpec(
            "loocv_rf_classifier_harmonic_tracked",
            "classifier",
            lambda: RandomForestClassifier(
                n_estimators=160,
                max_depth=10,
                min_samples_leaf=2,
                class_weight="balanced_subsample",
                random_state=12,
                n_jobs=-1,
            ),
            harmonic=True,
        ),
        ModelSpec(
            "loocv_rf_classifier_harmonic_tracked_kalman_ssm",
            "classifier",
            lambda: RandomForestClassifier(
                n_estimators=160,
                max_depth=10,
                min_samples_leaf=2,
                class_weight="balanced_subsample",
                random_state=13,
                n_jobs=-1,
            ),
            harmonic=True,
            smoother="kalman_ssm",
        ),
        ModelSpec(
            "loocv_extra_trees_classifier_harmonic_tracked",
            "classifier",
            lambda: ExtraTreesClassifier(
                n_estimators=180,
                max_depth=12,
                min_samples_leaf=2,
                class_weight="balanced",
                random_state=21,
                n_jobs=-1,
            ),
            harmonic=True,
        ),
        ModelSpec(
            "loocv_histgb_classifier_harmonic_tracked",
            "classifier",
            lambda: HistGradientBoostingClassifier(max_iter=140, learning_rate=0.055, l2_regularization=0.05, random_state=31),
            harmonic=True,
        ),
        ModelSpec(
            "loocv_rf_error_regressor_harmonic_tracked",
            "error_regressor",
            lambda: RandomForestRegressor(
                n_estimators=150,
                max_depth=10,
                min_samples_leaf=2,
                random_state=41,
                n_jobs=-1,
            ),
            harmonic=True,
        ),
        ModelSpec(
            "loocv_extra_trees_error_regressor_harmonic_tracked",
            "error_regressor",
            lambda: ExtraTreesRegressor(
                n_estimators=180,
                max_depth=12,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1,
            ),
            harmonic=True,
        ),
        ModelSpec(
            "loocv_histgb_error_regressor_harmonic_tracked",
            "error_regressor",
            lambda: HistGradientBoostingRegressor(max_iter=160, learning_rate=0.055, l2_regularization=0.04, random_state=43),
            harmonic=True,
        ),
        ModelSpec(
            "loocv_ridge_error_regressor_harmonic_tracked",
            "error_regressor",
            lambda: make_pipeline(StandardScaler(), Ridge(alpha=8.0)),
            harmonic=True,
        ),
        ModelSpec(
            "loocv_rf_direct_hr_regression",
            "direct_hr",
            lambda: RandomForestRegressor(
                n_estimators=180,
                max_depth=8,
                min_samples_leaf=4,
                random_state=51,
                n_jobs=-1,
            ),
        ),
        ModelSpec(
            "loocv_rf_direct_hr_regression_kalman_ssm",
            "direct_hr",
            lambda: RandomForestRegressor(
                n_estimators=180,
                max_depth=8,
                min_samples_leaf=4,
                random_state=52,
                n_jobs=-1,
            ),
            smoother="kalman_ssm",
        ),
        ModelSpec(
            "loocv_histgb_direct_hr_regression",
            "direct_hr",
            lambda: HistGradientBoostingRegressor(max_iter=160, learning_rate=0.06, l2_regularization=0.05, random_state=53),
        ),
    ]


def build_ensemble_rows(predictions: pd.DataFrame) -> list[dict[str, Any]]:
    selectors = [
        "loocv_rf_classifier_harmonic_tracked",
        "loocv_extra_trees_classifier_harmonic_tracked",
        "loocv_histgb_classifier_harmonic_tracked",
        "loocv_rf_error_regressor_harmonic_tracked",
        "loocv_rf_direct_hr_regression",
    ]
    frame = predictions[predictions["selector"].isin(selectors)].copy()
    rows: list[dict[str, Any]] = []
    if frame.empty:
        return rows
    for video, group in frame.groupby("video"):
        values = pd.to_numeric(group["pred_bpm"], errors="coerce").to_numpy(dtype=float)
        if not np.isfinite(values).any():
            continue
        pred = float(np.nanmedian(values))
        first = group.iloc[0]
        bpm_min = float(first["bpm_min"])
        bpm_max = float(first["bpm_max"])
        target = float(first["bpm_target"])
        range_error, within = range_error_for(pred, bpm_min, bpm_max)
        rows.append(
            {
                "selector": "loocv_model_ensemble_median",
                "video": video,
                "pred_bpm": round(pred, 3),
                "bpm_min": bpm_min,
                "bpm_max": bpm_max,
                "bpm_target": target,
                "target_abs_error": round(abs(pred - target), 3),
                "range_error": round(float(range_error), 3),
                "within_range": bool(within),
                "source": "median ensemble of LOOCV rankers/regressors",
                "selected_method": "ensemble",
                "selected_region": "ensemble",
                "window_count": int(group["window_count"].median()),
                "median_score": "",
                "harmonic_factor_median": "",
                "harmonic_adjusted_pct": round(float(pd.to_numeric(group["harmonic_adjusted_pct"], errors="coerce").median()), 2),
            }
        )
    return rows


def write_plots(summary: pd.DataFrame, out_dir: Path) -> None:
    try:
        import matplotlib.pyplot as plt
    except Exception:
        return
    if summary.empty:
        return
    top = summary.head(16).copy()
    fig, ax = plt.subplots(figsize=(12, 6), facecolor="#101418")
    ax.set_facecolor("#101418")
    labels = [row.selector.replace("loocv_", "").replace("_", "\n") for row in top.itertuples()]
    colors = ["#00e639" if "current_fit" in row.selector else "#00daf3" if "harmonic" in row.selector else "#ffbc7c" for row in top.itertuples()]
    ax.bar(labels, top["range_mae"].astype(float), color=colors)
    ax.set_ylabel("Range MAE (bpm)")
    ax.set_title("Single-View Additional Model Experiments")
    ax.tick_params(axis="x", labelrotation=0, labelsize=8, colors="#d8dee9")
    ax.tick_params(axis="y", colors="#d8dee9")
    ax.yaxis.label.set_color("#d8dee9")
    ax.title.set_color("#f5f7fb")
    ax.grid(axis="y", alpha=0.2, color="#d8dee9")
    for spine in ax.spines.values():
        spine.set_color("#3a4658")
    fig.tight_layout()
    fig.savefig(out_dir / "single_view_experiment_ranking.png", dpi=180)
    plt.close(fig)


def write_report(summary: pd.DataFrame, predictions: pd.DataFrame, out_path: Path) -> None:
    top_cols = [
        "selector",
        "n",
        "target_mae",
        "target_rmse",
        "range_mae",
        "within_range_pct",
        "median_harmonic_adjusted_pct",
    ]
    pred_cols = [
        "selector",
        "video",
        "pred_bpm",
        "bpm_min",
        "bpm_max",
        "target_abs_error",
        "range_error",
        "within_range",
        "selected_method",
        "selected_region",
        "harmonic_adjusted_pct",
    ]
    lines = [
        "# Single-View RGB Additional Model Experiments",
        "",
        "## Interpretation Rules",
        "",
        "- `loocv_*` rows are the fairer check: train on six videos and test on the held-out video.",
        "- `current_fit_*` rows are calibration/upper-bound style checks fitted on the same seven labeled videos.",
        "- `oracle_*` rows leak the label and are only used to check whether the right peak exists in the candidate bank.",
        "- Harmonic rows expand each spectral peak into half/original/1.5x/double BPM candidates.",
        "- `consensus_*` rows add method/ROI/neighbor agreement within each window.",
        "- `motion_reject_*` rows penalize candidates close to detector-box motion frequencies.",
        "- `dog_*` rows add panting/mouth-motion, lower-face, texture/fur, and respiration-overlap penalties.",
        "- `harmonic_aware_viterbi` rows use a temporal tracker that preserves HR continuity while allowing harmonic-state candidates.",
        "- `kalman_ssm` rows apply a constant-HR state-space smoother over selected window BPM values.",
        "",
        "## Selector Ranking",
        "",
        markdown_table(summary[top_cols]) if not summary.empty else "No results.",
        "",
        "## Per-Video Predictions For Top 8 Selectors",
        "",
        markdown_table(predictions[predictions["selector"].isin(summary.head(8)["selector"])][pred_cols])
        if not predictions.empty and not summary.empty
        else "No predictions.",
        "",
    ]
    out_path.write_text("\n".join(lines), encoding="utf-8")


def write_ui_data(summary: pd.DataFrame, predictions: pd.DataFrame, out_path: Path, args: argparse.Namespace) -> None:
    top_selectors = summary.head(args.top_n_ui)["selector"].tolist() if not summary.empty else []
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "setup": {
            "candidates": args.candidates.as_posix(),
            "labelsCsv": args.labels_csv.as_posix(),
            "outDir": args.out_dir.as_posix(),
            "minBpm": args.min_bpm,
            "maxBpm": args.max_bpm,
            "trackCandidatesPerWindow": args.track_candidates_per_window,
            "trackJumpBpm": args.track_jump_bpm,
        },
        "assets": {
            "reportUrl": existing_vite_url(args.out_dir / "single_view_experiment_report.md"),
            "summaryCsvUrl": existing_vite_url(args.out_dir / "single_view_experiment_summary.csv"),
            "predictionsCsvUrl": existing_vite_url(args.out_dir / "single_view_experiment_predictions.csv"),
            "rankingPlotUrl": existing_vite_url(args.out_dir / "single_view_experiment_ranking.png"),
        },
        "summary": rows_for_ui(summary.head(args.top_n_ui)),
        "predictions": rows_for_ui(predictions[predictions["selector"].isin(top_selectors)]),
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        "export const RPPG_SINGLE_VIEW_EXPERIMENTS = "
        + json.dumps(payload, indent=2, ensure_ascii=False)
        + " as const;\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    candidates = load_candidates(args.candidates)
    print("[single-view-exp] prepare consensus/motion harmonic candidates")
    enhanced_harmonic = prepare_enhanced_harmonic(candidates, args)
    rows: list[dict[str, Any]] = []
    rows.extend(evaluate_unsupervised(candidates, args))
    rows.extend(evaluate_prior_selectors(enhanced_harmonic, args))
    rows.extend(evaluate_enhanced_loocv_models(enhanced_harmonic, args))
    rows.extend(evaluate_dog_prior_loocv_models(enhanced_harmonic, args))
    for spec in build_model_specs():
        print(f"[single-view-exp] {spec.name}")
        if spec.task == "direct_hr":
            rows.extend(evaluate_direct_hr_model(candidates, spec, args))
        else:
            rows.extend(evaluate_rank_model(candidates, spec, args))
    rows.extend(evaluate_current_fit(candidates, args))
    rows.extend(evaluate_oracles(candidates, args))
    predictions = pd.DataFrame(rows)
    predictions = pd.concat([predictions, pd.DataFrame(build_ensemble_rows(predictions))], ignore_index=True)
    predictions = predictions.sort_values(["selector", "video"], key=lambda s: s.map(natural_sort_key) if s.name == "video" else s)
    summary = summarize_predictions(predictions)

    predictions.to_csv(args.out_dir / "single_view_experiment_predictions.csv", index=False)
    summary.to_csv(args.out_dir / "single_view_experiment_summary.csv", index=False)
    write_plots(summary, args.out_dir)
    write_report(summary, predictions, args.out_dir / "single_view_experiment_report.md")
    write_ui_data(summary, predictions, args.ui_data, args)
    print(
        json.dumps(
            {
                "out_dir": str(args.out_dir),
                "ui_data": str(args.ui_data),
                "top_summary": rows_for_ui(summary.head(12)),
            },
            indent=2,
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
