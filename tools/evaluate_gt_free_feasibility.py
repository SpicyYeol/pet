from __future__ import annotations

import argparse
import json
import math
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import warnings

from evaluate_rppg_methods import METHOD_FUNCTIONS, interpolate_rgb, robust_rgb, weighted_median
from evaluate_single_view_sqi import existing_vite_url, natural_sort_key, quality_score, rows_for_ui, spectrum_peaks


METHODS_FOR_CONTROLS = ("chrom", "pos", "green", "g_minus_r")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="GT-free feasibility checks for RGB rPPG: negative controls, perturbation robustness, and multi-view agreement."
    )
    parser.add_argument("--labels-csv", type=Path, default=Path("dataset_front/video_labels_ocr.csv"))
    parser.add_argument("--single-view-dir", type=Path, default=Path("reports/rppg_single_view_sqi"))
    parser.add_argument("--multi-view-dir", type=Path, default=Path("reports/rppg_multiview_rgb"))
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_gt_free_feasibility"))
    parser.add_argument("--ui-data", type=Path, default=Path("ui/src/generated/rppgGtFreeFeasibility.ts"))
    parser.add_argument("--sample-fps", type=float, default=15.0)
    parser.add_argument("--min-bpm", type=float, default=80.0)
    parser.add_argument("--max-bpm", type=float, default=240.0)
    parser.add_argument("--background-max-samples", type=int, default=900)
    parser.add_argument("--agreement-bpm", type=float, default=12.0)
    return parser.parse_args()


def finite_median(values: Any, fallback: float = np.nan) -> float:
    arr = pd.to_numeric(pd.Series(values), errors="coerce").to_numpy(dtype=float)
    arr = arr[np.isfinite(arr)]
    if len(arr) == 0:
        return float(fallback)
    return float(np.median(arr))


def clamp01(value: float) -> float:
    if not np.isfinite(value):
        return 0.0
    return float(min(1.0, max(0.0, value)))


def safe_round(value: float, digits: int = 3) -> float | str:
    if not np.isfinite(value):
        return ""
    return round(float(value), digits)


def overlap_fraction(a: np.ndarray, b: np.ndarray) -> float:
    x1 = max(float(a[0]), float(b[0]))
    y1 = max(float(a[1]), float(b[1]))
    x2 = min(float(a[2]), float(b[2]))
    y2 = min(float(a[3]), float(b[3]))
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    area = max(1.0, (float(a[2]) - float(a[0])) * (float(a[3]) - float(a[1])))
    return inter / area


def fixed_background_boxes(width: int, height: int) -> dict[str, np.ndarray]:
    return {
        "bg_top_left": np.array([0.02 * width, 0.02 * height, 0.22 * width, 0.22 * height], dtype=float),
        "bg_top_right": np.array([0.78 * width, 0.02 * height, 0.98 * width, 0.22 * height], dtype=float),
        "bg_bottom_left": np.array([0.02 * width, 0.76 * height, 0.22 * width, 0.98 * height], dtype=float),
        "bg_bottom_right": np.array([0.78 * width, 0.76 * height, 0.98 * width, 0.98 * height], dtype=float),
    }


def extract_background_traces(
    video_path: Path,
    times: np.ndarray,
    boxes: np.ndarray,
    max_samples: int,
) -> dict[str, np.ndarray]:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    source_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    sample_indices = np.arange(len(times))
    if len(sample_indices) > max_samples:
        sample_indices = np.unique(np.linspace(0, len(times) - 1, max_samples).round().astype(int))

    frame_targets = np.rint(times[sample_indices] * source_fps).astype(int)
    frame_targets = np.clip(frame_targets, 0, max(0, frame_count - 1))
    target_to_sample = {int(frame): int(sample) for frame, sample in zip(frame_targets, sample_indices)}
    wanted = set(target_to_sample)

    traces: dict[str, np.ndarray] = {}
    valid: dict[str, np.ndarray] = {}
    for name in fixed_background_boxes(1, 1):
        traces[name] = np.full((len(times), 3), np.nan, dtype=float)
        valid[name] = np.zeros(len(times), dtype=float)

    frame_index = 0
    while wanted:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_index not in wanted:
            frame_index += 1
            continue

        sample_idx = target_to_sample[frame_index]
        height, width = frame.shape[:2]
        face_box = boxes[sample_idx, :4].astype(float) if boxes.shape[1] >= 4 else np.full(4, np.nan)
        rects = fixed_background_boxes(width, height)
        for name, rect in rects.items():
            if np.isfinite(face_box).all() and overlap_fraction(rect, face_box) > 0.05:
                continue
            x1, y1, x2, y2 = rect.round().astype(int)
            crop = frame[y1:y2, x1:x2]
            rgb, valid_fraction = robust_rgb(crop)
            traces[name][sample_idx] = rgb
            valid[name][sample_idx] = valid_fraction

        wanted.remove(frame_index)
        frame_index += 1

    cap.release()
    traces.update({f"valid__{name}": values for name, values in valid.items()})
    return traces


def build_uniform_cache(cache: dict[str, np.ndarray], sample_fps: float) -> dict[str, tuple[np.ndarray, np.ndarray]]:
    times = cache["times"].astype(float)
    uniform: dict[str, tuple[np.ndarray, np.ndarray]] = {}
    for key, rgb in cache.items():
        if key.startswith("rgb__"):
            region_id = key.replace("rgb__", "")
            uniform[region_id] = interpolate_rgb(times, rgb.astype(float), sample_fps)
    return uniform


def best_peak_from_rgb_window(
    rgb_win: np.ndarray,
    fs: float,
    min_bpm: float,
    max_bpm: float,
    methods: tuple[str, ...] = METHODS_FOR_CONTROLS,
    valid_fraction: float = 1.0,
) -> dict[str, float | str]:
    if len(rgb_win) < int(fs * 5) or not np.isfinite(rgb_win).all() or np.min(np.nanmean(rgb_win, axis=0)) <= 1:
        return {}
    color_cv = float(np.nanmean(np.nanstd(rgb_win, axis=0) / (np.nanmean(rgb_win, axis=0) + 1e-9)))
    best: dict[str, float | str] = {}
    best_score = -np.inf
    for method in methods:
        try:
            pulse = METHOD_FUNCTIONS[method](rgb_win, fs, min_bpm, max_bpm)
            peaks = spectrum_peaks(pulse, fs, min_bpm, max_bpm, top_k=3)
        except Exception:
            peaks = []
        for peak in peaks:
            row: dict[str, Any] = {
                "snr": float(peak["snr"]),
                "total_power_ratio": float(peak["total_power_ratio"]),
                "spectral_entropy": float(peak["spectral_entropy"]),
                "h2_ratio": float(peak["h2_ratio"]),
                "half_ratio": float(peak["half_ratio"]),
                "valid_fraction": float(valid_fraction),
                "box_motion": 0.0,
                "color_cv": color_cv,
                "peak_rank": float(peak["peak_rank"]),
            }
            score = quality_score(row)
            if np.isfinite(score) and score > best_score:
                best_score = score
                best = {
                    "method": method,
                    "peak_bpm": float(peak["peak_bpm"]),
                    "snr": float(peak["snr"]),
                    "total_power_ratio": float(peak["total_power_ratio"]),
                    "spectral_entropy": float(peak["spectral_entropy"]),
                    "quality_score": float(score),
                }
    return best


def rgb_window(uniform: dict[str, tuple[np.ndarray, np.ndarray]], region_id: str, start_sec: float, end_sec: float) -> np.ndarray:
    times, rgb = uniform.get(region_id, (np.array([]), np.empty((0, 3))))
    if len(times) == 0:
        return np.empty((0, 3))
    mask = (times >= start_sec) & (times <= end_sec)
    return rgb[mask]


def drop_every_third(rgb_win: np.ndarray) -> np.ndarray:
    if len(rgb_win) < 12:
        return rgb_win
    x = np.arange(len(rgb_win))
    keep = np.ones(len(rgb_win), dtype=bool)
    keep[2::3] = False
    if keep.sum() < 8:
        return rgb_win
    out = np.empty_like(rgb_win)
    for channel in range(3):
        out[:, channel] = np.interp(x, x[keep], rgb_win[keep, channel])
    return out


def brightness_normalized(rgb_win: np.ndarray) -> np.ndarray:
    luma = np.nanmean(rgb_win, axis=1, keepdims=True)
    median_luma = float(np.nanmedian(luma))
    return rgb_win / np.maximum(luma, 1.0) * max(median_luma, 1.0)


def perturbation_stability(
    rgb_win: np.ndarray,
    method: str,
    selected_bpm: float,
    fs: float,
    min_bpm: float,
    max_bpm: float,
) -> tuple[float, float, str]:
    variants = {
        "brightness_norm": brightness_normalized(rgb_win),
        "drop_every_3": drop_every_third(rgb_win),
    }
    bpms: list[float] = []
    labels: list[str] = []
    for name, variant in variants.items():
        peak = best_peak_from_rgb_window(variant, fs, min_bpm, max_bpm, methods=(method,))
        bpm = float(peak.get("peak_bpm", np.nan)) if peak else np.nan
        if np.isfinite(bpm):
            bpms.append(bpm)
            labels.append(f"{name}:{bpm:.1f}")
    if not bpms or not np.isfinite(selected_bpm):
        return 0.0, np.nan, ""
    median_dev = float(np.median(np.abs(np.array(bpms) - selected_bpm)))
    score = float(math.exp(-median_dev / 8.0))
    return clamp01(score), median_dev, "; ".join(labels)


def evaluate_single_view(args: argparse.Namespace) -> tuple[pd.DataFrame, pd.DataFrame]:
    labels = pd.read_csv(args.labels_csv)
    usable = labels[labels["usable"].astype(str).str.lower() == "true"].copy()
    candidates_path = args.single_view_dir / "candidate_window_peaks.csv"
    candidates = pd.read_csv(candidates_path)
    candidates["quality_score"] = pd.to_numeric(candidates["quality_score"], errors="coerce")

    window_rows: list[dict[str, Any]] = []
    summary_rows: list[dict[str, Any]] = []

    for row in usable.sort_values("video", key=lambda s: s.map(natural_sort_key)).itertuples(index=False):
        video = str(row.video)
        stem = Path(video).stem
        video_path = Path(str(row.path))
        cache_path = args.single_view_dir / "cache" / f"{stem}_candidate_traces.npz"
        if not cache_path.exists():
            continue

        print(f"[gt-free/single] {video}")
        npz = np.load(cache_path, allow_pickle=True)
        cache = {key: npz[key] for key in npz.files}
        uniform = build_uniform_cache(cache, args.sample_fps)
        background_raw = extract_background_traces(
            video_path,
            cache["times"].astype(float),
            cache["boxes"].astype(float),
            max_samples=args.background_max_samples,
        )
        bg_uniform: dict[str, tuple[np.ndarray, np.ndarray]] = {}
        for bg_name, bg_rgb in background_raw.items():
            if bg_name.startswith("valid__"):
                continue
            bg_uniform[bg_name] = interpolate_rgb(cache["times"].astype(float), bg_rgb.astype(float), args.sample_fps)

        video_candidates = candidates[candidates["video"] == video].copy()
        control_candidates = video_candidates[video_candidates["method"].isin(METHODS_FOR_CONTROLS)].copy()
        if not control_candidates.empty:
            video_candidates = control_candidates
        if video_candidates.empty:
            continue
        selected = (
            video_candidates.sort_values(["window_index", "quality_score"], ascending=[True, False])
            .groupby("window_index", as_index=False)
            .head(1)
            .sort_values("window_index")
        )

        selected_bpms: list[float] = []
        for selected_row in selected.itertuples(index=False):
            start_sec = float(selected_row.window_start_sec)
            end_sec = float(selected_row.window_end_sec)
            region_id = str(selected_row.region_id)
            method = str(selected_row.method)
            selected_bpm = float(selected_row.peak_bpm)
            selected_bpms.append(selected_bpm)
            face_snr = float(selected_row.snr)
            face_quality = float(selected_row.quality_score)

            bg_best: dict[str, Any] = {}
            bg_score = -np.inf
            for bg_name in bg_uniform:
                bg_win = rgb_window(bg_uniform, bg_name, start_sec, end_sec)
                bg_peak = best_peak_from_rgb_window(
                    bg_win,
                    args.sample_fps,
                    args.min_bpm,
                    args.max_bpm,
                    valid_fraction=1.0,
                )
                if bg_peak and float(bg_peak.get("quality_score", -np.inf)) > bg_score:
                    bg_score = float(bg_peak["quality_score"])
                    bg_best = {"background_region": bg_name, **bg_peak}

            bg_snr = float(bg_best.get("snr", np.nan)) if bg_best else np.nan
            bg_ratio = bg_snr / (face_snr + 1e-9) if np.isfinite(bg_snr) and np.isfinite(face_snr) else np.nan
            background_margin_score = clamp01(math.log(max(face_snr, 1e-9) / max(bg_snr, 1e-9)) / math.log(3.0)) if np.isfinite(bg_ratio) else 0.0

            face_win = rgb_window(uniform, region_id, start_sec, end_sec)
            shuffle_peak: dict[str, Any] = {}
            if len(face_win) >= int(args.sample_fps * 5):
                rng_seed = abs(hash((video, int(selected_row.window_index), region_id, method))) % (2**32)
                rng = np.random.default_rng(rng_seed)
                shuffled = face_win[rng.permutation(len(face_win))]
                shuffle_peak = best_peak_from_rgb_window(
                    shuffled,
                    args.sample_fps,
                    args.min_bpm,
                    args.max_bpm,
                    methods=(method,),
                    valid_fraction=1.0,
                )
            shuffle_snr = float(shuffle_peak.get("snr", np.nan)) if shuffle_peak else np.nan
            shuffle_drop_score = clamp01(1.0 - shuffle_snr / (face_snr + 1e-9)) if np.isfinite(shuffle_snr) else 0.0

            perturb_score, perturb_dev, perturb_detail = perturbation_stability(
                face_win,
                method,
                selected_bpm,
                args.sample_fps,
                args.min_bpm,
                args.max_bpm,
            )
            face_quality_score = clamp01(face_quality / 5.0)

            window_evidence_score = 100.0 * (
                0.36 * background_margin_score
                + 0.28 * perturb_score
                + 0.24 * shuffle_drop_score
                + 0.12 * face_quality_score
            )
            flags: list[str] = []
            if np.isfinite(bg_ratio) and bg_ratio >= 0.75:
                flags.append("background_peak_competes")
            if shuffle_drop_score < 0.25:
                flags.append("time_shuffle_survives")
            if perturb_score < 0.45:
                flags.append("perturbation_unstable")

            window_rows.append(
                {
                    "video": video,
                    "window_index": int(selected_row.window_index),
                    "window_start_sec": round(start_sec, 3),
                    "window_end_sec": round(end_sec, 3),
                    "selected_region": region_id,
                    "selected_method": method,
                    "selected_bpm": round(selected_bpm, 3),
                    "face_snr": round(face_snr, 3),
                    "face_quality": round(face_quality, 3),
                    "background_region": bg_best.get("background_region", ""),
                    "background_bpm": safe_round(float(bg_best.get("peak_bpm", np.nan)), 3) if bg_best else "",
                    "background_snr": safe_round(bg_snr, 3),
                    "background_snr_ratio": safe_round(bg_ratio, 3),
                    "background_margin_score": round(background_margin_score, 3),
                    "shuffle_bpm": safe_round(float(shuffle_peak.get("peak_bpm", np.nan)), 3) if shuffle_peak else "",
                    "shuffle_snr": safe_round(shuffle_snr, 3),
                    "shuffle_drop_score": round(shuffle_drop_score, 3),
                    "perturbation_median_dev_bpm": safe_round(perturb_dev, 3),
                    "perturbation_stability_score": round(perturb_score, 3),
                    "perturbation_detail": perturb_detail,
                    "face_quality_score": round(face_quality_score, 3),
                    "window_evidence_score": round(window_evidence_score, 1),
                    "flags": ", ".join(flags),
                }
            )

        video_window_rows = [item for item in window_rows if item["video"] == video]
        selected_track = np.array(selected_bpms, dtype=float)
        if len(selected_track) >= 2:
            temporal_dev = float(np.median(np.abs(np.diff(selected_track))))
            temporal_score = clamp01(math.exp(-temporal_dev / 12.0))
        else:
            temporal_dev = np.nan
            temporal_score = 0.0

        bg_margin = finite_median([item["background_margin_score"] for item in video_window_rows])
        shuffle_drop = finite_median([item["shuffle_drop_score"] for item in video_window_rows])
        perturb = finite_median([item["perturbation_stability_score"] for item in video_window_rows])
        face_quality = finite_median([item["face_quality_score"] for item in video_window_rows])
        artifact_100_share = float(np.mean((selected_track >= 95.0) & (selected_track <= 105.0))) if len(selected_track) else 0.0

        evidence_score = 100.0 * (
            0.30 * bg_margin
            + 0.25 * perturb
            + 0.20 * shuffle_drop
            + 0.15 * temporal_score
            + 0.10 * face_quality
        )
        if artifact_100_share >= 0.50:
            evidence_score *= 0.85

        reasons: list[str] = []
        if finite_median([item["background_snr_ratio"] for item in video_window_rows], fallback=0.0) >= 0.75:
            reasons.append("background_peak_competes")
        if shuffle_drop < 0.25:
            reasons.append("time_shuffle_survives")
        if perturb < 0.45:
            reasons.append("perturbation_unstable")
        if temporal_score < 0.45:
            reasons.append("temporal_track_unstable")
        if artifact_100_share >= 0.50:
            reasons.append("100bpm_artifact_risk")

        if evidence_score >= 70.0 and not reasons:
            status = "supportive"
        elif evidence_score >= 45.0:
            status = "inconclusive"
        else:
            status = "weak"

        summary_rows.append(
            {
                "video": video,
                "windows": len(video_window_rows),
                "median_selected_bpm": safe_round(finite_median(selected_track), 3),
                "median_background_snr_ratio": safe_round(
                    finite_median([item["background_snr_ratio"] for item in video_window_rows]), 3
                ),
                "background_margin_score": round(bg_margin, 3),
                "shuffle_drop_score": round(shuffle_drop, 3),
                "perturbation_stability_score": round(perturb, 3),
                "temporal_stability_score": round(temporal_score, 3),
                "temporal_median_step_bpm": safe_round(temporal_dev, 3),
                "face_quality_score": round(face_quality, 3),
                "artifact_100bpm_window_share": round(artifact_100_share, 3),
                "evidence_score": round(evidence_score, 1),
                "status": status,
                "rejection_reasons": ", ".join(reasons) if reasons else "none",
            }
        )

    return pd.DataFrame(summary_rows), pd.DataFrame(window_rows)


def evaluate_multiview(args: argparse.Namespace) -> tuple[pd.DataFrame, dict[str, Any]]:
    selected_path = args.multi_view_dir / "multiview_window_predictions.csv"
    if not selected_path.exists():
        return pd.DataFrame(), {}

    selected = pd.read_csv(selected_path)
    rows: list[dict[str, Any]] = []
    for window_index, group in selected.groupby("window_index"):
        values = pd.to_numeric(group["peak_bpm"], errors="coerce").to_numpy(dtype=float)
        scores = pd.to_numeric(group["trained_selector_score"], errors="coerce").to_numpy(dtype=float)
        views = group["view"].astype(str).to_numpy()
        good = np.isfinite(values)
        values = values[good]
        scores = scores[good]
        views = views[good]
        if len(values) == 0:
            continue
        median = float(np.median(values))
        if len(values) >= 3:
            mad = float(np.median(np.abs(values - median)))
            tolerance = max(args.agreement_bpm, 2.5 * 1.4826 * mad)
            accepted = np.abs(values - median) <= tolerance
        elif len(values) == 2:
            accepted = np.repeat(float(np.max(values) - np.min(values)) <= args.agreement_bpm, len(values))
        else:
            accepted = np.array([True])

        accepted_values = values[accepted]
        accepted_scores = scores[accepted]
        accepted_views = views[accepted]
        rejected_views = views[~accepted]
        if len(accepted_values) >= 2:
            fused = weighted_median(accepted_values, np.nan_to_num(accepted_scores, nan=0.5) + 0.05)
            spread_after = float(np.max(accepted_values) - np.min(accepted_values))
            agreement = bool(spread_after <= args.agreement_bpm)
        elif len(accepted_values) == 1:
            fused = float(accepted_values[0])
            spread_after = 0.0
            agreement = False
        else:
            fused = np.nan
            spread_after = np.nan
            agreement = False

        first = group.iloc[0]
        rows.append(
            {
                "window_index": int(window_index),
                "window_start_sec": round(float(first["window_start_sec"]), 3),
                "raw_view_count": int(len(values)),
                "accepted_view_count": int(len(accepted_values)),
                "raw_spread_bpm": round(float(np.max(values) - np.min(values)), 3),
                "accepted_spread_bpm": safe_round(spread_after, 3),
                "consensus_bpm": safe_round(float(fused), 3),
                "agreement": agreement,
                "accepted_views": ", ".join(accepted_views.tolist()),
                "rejected_views": ", ".join(rejected_views.tolist()) if len(rejected_views) else "none",
                "raw_values": ", ".join(f"{view}:{value:.1f}" for view, value in zip(views, values)),
            }
        )

    agreement = pd.DataFrame(rows)
    if agreement.empty:
        return agreement, {}
    usable = agreement[agreement["raw_view_count"] >= 2]
    agreement_pct = float(usable["agreement"].mean() * 100.0) if not usable.empty else 0.0
    summary = {
        "windows": int(len(agreement)),
        "windows_with_two_or_more_views": int(len(usable)),
        "agreement_windows": int(agreement["agreement"].sum()),
        "agreement_pct": round(agreement_pct, 1),
        "median_raw_spread_bpm": safe_round(finite_median(agreement["raw_spread_bpm"]), 3),
        "median_accepted_spread_bpm": safe_round(finite_median(agreement["accepted_spread_bpm"]), 3),
        "status": "supportive" if agreement_pct >= 70 else "inconclusive" if agreement_pct >= 40 else "weak",
        "interpretation": "Agreement is GT-free: it checks cross-view consistency after rejecting isolated view outliers.",
    }
    return agreement, summary


def write_plots(summary: pd.DataFrame, agreement: pd.DataFrame, out_dir: Path) -> None:
    if not summary.empty:
        order = summary.sort_values("evidence_score", ascending=True)
        colors = order["status"].map({"supportive": "#00c46a", "inconclusive": "#e7b84e", "weak": "#d35f5f"}).fillna("#8aa1c1")
        fig, ax = plt.subplots(figsize=(9.5, 4.8))
        ax.barh(order["video"], order["evidence_score"].astype(float), color=colors)
        ax.set_xlim(0, 100)
        ax.set_xlabel("GT-free evidence score")
        ax.set_title("Single-View GT-Free Feasibility Evidence")
        ax.grid(axis="x", alpha=0.25)
        fig.tight_layout()
        fig.savefig(out_dir / "gt_free_evidence_ranking.png", dpi=180)
        plt.close(fig)

    if not agreement.empty:
        fig, ax = plt.subplots(figsize=(9.5, 4.4))
        x = agreement["window_start_sec"].astype(float)
        raw = agreement["raw_spread_bpm"].astype(float)
        accepted = pd.to_numeric(agreement["accepted_spread_bpm"], errors="coerce")
        ax.plot(x, raw, marker="o", color="#d35f5f", label="raw spread")
        ax.plot(x, accepted, marker="o", color="#00c46a", label="accepted spread")
        ax.axhline(12.0, color="#666", linestyle="--", linewidth=1, label="agreement threshold")
        ax.set_xlabel("Window start (sec)")
        ax.set_ylabel("View spread (bpm)")
        ax.set_title("Multi-View Agreement After Outlier Rejection")
        ax.legend()
        ax.grid(alpha=0.25)
        fig.tight_layout()
        fig.savefig(out_dir / "gt_free_multiview_agreement.png", dpi=180)
        plt.close(fig)


def markdown_table(df: pd.DataFrame) -> str:
    if df.empty:
        return "No rows."
    table = df.copy()
    table = table.fillna("")
    headers = [str(col) for col in table.columns]
    rows = [[str(value) for value in row] for row in table.to_numpy()]
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    lines.extend("| " + " | ".join(row) + " |" for row in rows)
    return "\n".join(lines)


def write_report(summary: pd.DataFrame, windows: pd.DataFrame, agreement: pd.DataFrame, multi_summary: dict[str, Any], out_dir: Path) -> None:
    counts = summary["status"].value_counts().to_dict() if not summary.empty else {}
    lines = [
        "# GT-Free rPPG Feasibility Evidence",
        "",
        "This report does not estimate accuracy against HR ground truth. It asks whether the extracted signal behaves more like a physiological rPPG signal than a camera/background artifact.",
        "",
        "## Checks",
        "",
        "- Spatial negative control: selected face/patch peak must beat fixed background ROI peaks.",
        "- Time-order negative control: the peak should weaken after shuffling the same RGB samples.",
        "- Perturbation robustness: BPM should survive brightness normalization and periodic sample drop.",
        "- Multi-view agreement: synchronized views should agree after rejecting isolated view outliers.",
        "",
        "## Single-View Summary",
        "",
        f"- Supportive: {counts.get('supportive', 0)}",
        f"- Inconclusive: {counts.get('inconclusive', 0)}",
        f"- Weak: {counts.get('weak', 0)}",
        "",
        markdown_table(summary.sort_values("evidence_score", ascending=False) if not summary.empty else summary),
        "",
        "## Multi-View Summary",
        "",
        markdown_table(pd.DataFrame([multi_summary]) if multi_summary else pd.DataFrame()),
        "",
        markdown_table(agreement),
        "",
        "## Window Evidence Preview",
        "",
        markdown_table(windows.head(40)),
        "",
        "## Interpretation",
        "",
        "A supportive score is evidence for feasibility, not validation. A weak score means the present RGB signal is not separable from controls strongly enough to claim GT-free feasibility.",
    ]
    (out_dir / "gt_free_feasibility_report.md").write_text("\n".join(lines), encoding="utf-8")


def write_ui_data(
    summary: pd.DataFrame,
    windows: pd.DataFrame,
    agreement: pd.DataFrame,
    multi_summary: dict[str, Any],
    out_path: Path,
    args: argparse.Namespace,
) -> None:
    status_counts = summary["status"].value_counts().to_dict() if not summary.empty else {}
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "setup": {
            "labelsCsv": args.labels_csv.as_posix(),
            "singleViewDir": args.single_view_dir.as_posix(),
            "multiViewDir": args.multi_view_dir.as_posix(),
            "outDir": args.out_dir.as_posix(),
            "sampleFps": args.sample_fps,
            "minBpm": args.min_bpm,
            "maxBpm": args.max_bpm,
            "agreementBpm": args.agreement_bpm,
            "interpretation": "GT-free evidence only; this is not an HR accuracy estimate.",
        },
        "assets": {
            "reportUrl": existing_vite_url(args.out_dir / "gt_free_feasibility_report.md"),
            "singleSummaryCsvUrl": existing_vite_url(args.out_dir / "gt_free_single_view_summary.csv"),
            "singleWindowsCsvUrl": existing_vite_url(args.out_dir / "gt_free_single_view_windows.csv"),
            "multiAgreementCsvUrl": existing_vite_url(args.out_dir / "gt_free_multiview_agreement.csv"),
            "rankingPlotUrl": existing_vite_url(args.out_dir / "gt_free_evidence_ranking.png"),
            "multiAgreementPlotUrl": existing_vite_url(args.out_dir / "gt_free_multiview_agreement.png"),
        },
        "overview": {
            "singleViewVideos": int(len(summary)),
            "supportive": int(status_counts.get("supportive", 0)),
            "inconclusive": int(status_counts.get("inconclusive", 0)),
            "weak": int(status_counts.get("weak", 0)),
            "bestEvidenceScore": safe_round(float(summary["evidence_score"].max()), 1) if not summary.empty else "",
            "medianEvidenceScore": safe_round(finite_median(summary["evidence_score"]), 1) if not summary.empty else "",
            "multiViewAgreementPct": multi_summary.get("agreement_pct", "") if multi_summary else "",
            "multiViewStatus": multi_summary.get("status", "") if multi_summary else "",
        },
        "singleSummary": rows_for_ui(summary.sort_values("evidence_score", ascending=False) if not summary.empty else summary),
        "singleWindows": rows_for_ui(windows),
        "multiSummary": multi_summary,
        "multiAgreement": rows_for_ui(agreement),
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        "export const RPPG_GT_FREE_FEASIBILITY = "
        + json.dumps(payload, indent=2, ensure_ascii=False)
        + " as const;\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    warnings.filterwarnings("ignore")

    summary, windows = evaluate_single_view(args)
    agreement, multi_summary = evaluate_multiview(args)

    summary.to_csv(args.out_dir / "gt_free_single_view_summary.csv", index=False)
    windows.to_csv(args.out_dir / "gt_free_single_view_windows.csv", index=False)
    agreement.to_csv(args.out_dir / "gt_free_multiview_agreement.csv", index=False)

    write_plots(summary, agreement, args.out_dir)
    write_report(summary, windows, agreement, multi_summary, args.out_dir)
    write_ui_data(summary, windows, agreement, multi_summary, args.ui_data, args)

    print(f"Wrote GT-free feasibility artifacts to {args.out_dir}")


if __name__ == "__main__":
    main()
