from __future__ import annotations

import argparse
import json
import os
import warnings
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from joblib import load
from sklearn.exceptions import ConvergenceWarning

from evaluate_single_view_sqi import (
    METHODS,
    METHOD_FUNCTIONS,
    candidate_feature_frame,
    box_motion_for_window,
    draw_region_overlay,
    existing_vite_url,
    extract_candidate_traces,
    hr_points,
    interpolate_rgb,
    make_region_catalog,
    markdown_table,
    median_valid_for_window,
    natural_sort_key,
    quality_score,
    rows_for_ui,
    spectrum_peaks,
    track_video_candidates,
    weighted_median,
    weighted_prediction,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Apply the trained single-view RGB selector to unlabeled multi-view RGB videos."
    )
    parser.add_argument("--multi-dir", type=Path, default=Path("dataset_multi"))
    parser.add_argument("--model", type=Path, default=Path("DogFaceModel_Deploy/best.pt"))
    parser.add_argument("--single-view-dir", type=Path, default=Path("reports/rppg_single_view_sqi"))
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_multiview_rgb"))
    parser.add_argument("--ui-data", type=Path, default=Path("ui/src/generated/rppgMultiViewRgb.ts"))
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


def evaluate_unlabeled_region_candidates(
    view: str,
    video_name: str,
    times: np.ndarray,
    boxes: np.ndarray,
    rgb: np.ndarray,
    valid: np.ndarray,
    region: Any,
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
                row: dict[str, Any] = {
                    "view": view,
                    "video": video_name,
                    "window_index": window_index,
                    "window_start_sec": round(start_sec, 3),
                    "window_end_sec": round(end_sec, 3),
                    "region_id": region.id,
                    "region_label": region.label,
                    "region_kind": region.kind,
                    "method": method,
                    "peak_rank": int(peak["peak_rank"]),
                    "peak_bpm": round(float(peak["peak_bpm"]), 3),
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


def score_with_trained_selector(candidates: pd.DataFrame, model_path: Path) -> tuple[pd.DataFrame, dict[str, Any]]:
    if candidates.empty:
        candidates["trained_selector_score"] = []
        return candidates, {}
    artifact = load(model_path)
    model = artifact["model"]
    feature_columns = list(artifact["feature_columns"])
    feature_frame = candidate_feature_frame(candidates).reindex(columns=feature_columns, fill_value=0.0)
    scored = candidates.copy()
    scored["trained_selector_score"] = model.predict_proba(feature_frame)[:, 1]
    return scored, {
        "model_path": model_path.as_posix(),
        "feature_columns": feature_columns,
        "positive_definition": artifact.get("positive_definition", ""),
        "training_rows": artifact.get("training_rows", ""),
        "positive_rows": artifact.get("positive_rows", ""),
        "videos": artifact.get("videos", []),
        "warning": artifact.get("warning", ""),
    }


def select_view_tracks(candidates: pd.DataFrame, args: argparse.Namespace) -> pd.DataFrame:
    rows: list[pd.DataFrame] = []
    for view, group in candidates.groupby("view"):
        path = track_video_candidates(group, args, score_col="trained_selector_score")
        if path.empty:
            continue
        selected = path.copy()
        selected["selector"] = "trained_tracked_selector_current"
        selected["view"] = view
        rows.append(selected)
    return pd.concat(rows, ignore_index=True) if rows else pd.DataFrame()


def fused_hr_by_window(selected: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    if selected.empty:
        return pd.DataFrame()
    for window_index, group in selected.groupby("window_index"):
        values = pd.to_numeric(group["peak_bpm"], errors="coerce").to_numpy(dtype=float)
        scores = pd.to_numeric(group["trained_selector_score"], errors="coerce").to_numpy(dtype=float)
        good = np.isfinite(values) & np.isfinite(scores)
        if good.sum() == 0:
            continue
        values = values[good]
        scores = scores[good]
        weights = np.clip(scores - np.nanmin(scores) + 0.05, 0.05, None)
        rows.append(
            {
                "window_index": int(window_index),
                "window_start_sec": round(float(pd.to_numeric(group["window_start_sec"], errors="coerce").median()), 3),
                "fused_bpm": round(float(weighted_median(values, weights)), 3),
                "weighted_mean_bpm": round(float(np.average(values, weights=weights)), 3),
                "view_count": int(good.sum()),
                "min_view_bpm": round(float(np.nanmin(values)), 3),
                "max_view_bpm": round(float(np.nanmax(values)), 3),
                "view_spread_bpm": round(float(np.nanmax(values) - np.nanmin(values)), 3),
                "median_selector_score": round(float(np.nanmedian(scores)), 4),
                "views": ",".join(sorted(group.loc[good, "view"].astype(str).tolist())),
            }
        )
    return pd.DataFrame(rows).sort_values("window_index").reset_index(drop=True)


def summarize_views(selected: pd.DataFrame, extraction_stats: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    stats_by_view = {row["view"]: row for row in rows_for_ui(extraction_stats)}
    if selected.empty:
        return pd.DataFrame()
    for view, group in selected.groupby("view"):
        bpms = pd.to_numeric(group["peak_bpm"], errors="coerce").dropna()
        scores = pd.to_numeric(group["trained_selector_score"], errors="coerce").dropna()
        top_source = group.groupby(["method", "region_id"]).size().sort_values(ascending=False).index[0]
        pred, pred_mean = weighted_prediction(group, score_col="trained_selector_score")
        stats = stats_by_view.get(str(view), {})
        rows.append(
            {
                "view": view,
                "pred_bpm": round(float(pred), 3) if np.isfinite(pred) else "",
                "weighted_mean_bpm": round(float(pred_mean), 3) if np.isfinite(pred_mean) else "",
                "median_bpm": round(float(bpms.median()), 3) if len(bpms) else "",
                "iqr_bpm": round(float(bpms.quantile(0.75) - bpms.quantile(0.25)), 3) if len(bpms) else "",
                "windows": int(group["window_index"].nunique()),
                "median_selector_score": round(float(scores.median()), 4) if len(scores) else "",
                "top_method": str(top_source[0]),
                "top_region": str(top_source[1]),
                "detected_pct": stats.get("detected_pct", ""),
                "median_box_conf": stats.get("median_box_conf", ""),
                "samples": stats.get("samples", ""),
            }
        )
    return pd.DataFrame(rows).sort_values("view").reset_index(drop=True)


def write_plots(selected: pd.DataFrame, fusion: pd.DataFrame, out_dir: Path) -> None:
    try:
        import matplotlib.pyplot as plt
    except Exception:
        return
    if selected.empty:
        return
    fig, ax = plt.subplots(figsize=(11, 5), facecolor="#101418")
    ax.set_facecolor("#101418")
    colors = {
        "front": "#00daf3",
        "left": "#ffbc7c",
        "right": "#ff4fd8",
        "up": "#8ee66b",
    }
    for view, group in selected.groupby("view"):
        track = group.sort_values("window_start_sec")
        ax.plot(track["window_start_sec"], track["peak_bpm"], marker="o", ms=3, lw=1.4, label=view, color=colors.get(view))
    if not fusion.empty:
        ax.plot(fusion["window_start_sec"], fusion["fused_bpm"], color="#ffffff", lw=2.8, label="fused")
    ax.set_title("Multi-View RGB HR Track (Unlabeled Consistency Check)")
    ax.set_xlabel("Window start (sec)")
    ax.set_ylabel("BPM")
    ax.set_ylim(70, 250)
    ax.tick_params(colors="#d8dee9")
    ax.xaxis.label.set_color("#d8dee9")
    ax.yaxis.label.set_color("#d8dee9")
    ax.title.set_color("#f5f7fb")
    for spine in ax.spines.values():
        spine.set_color("#3a4658")
    ax.grid(alpha=0.22, color="#d8dee9")
    ax.legend(ncol=5, fontsize=9, facecolor="#f5f7fb", edgecolor="#cdd4df")
    fig.tight_layout()
    fig.savefig(out_dir / "multiview_hr_track.png", dpi=180, facecolor="#101418")
    plt.close(fig)


def draw_multiview_overlays(
    summary: pd.DataFrame,
    args: argparse.Namespace,
    regions: list[Any],
) -> None:
    regions_by_id = {region.id: region for region in regions}
    overlay_dir = args.out_dir / "region_overlays"
    for row in rows_for_ui(summary):
        view = str(row["view"])
        video_path = args.multi_dir / f"{view}.mp4"
        if not video_path.exists():
            continue
        draw_region_overlay(
            video_path=video_path,
            cache_path=args.out_dir / "cache" / f"{view}_candidate_traces.npz",
            out_path=overlay_dir / f"{view}_region_overlay.jpg",
            regions_by_id=regions_by_id,
            trained_row={
                "selected_method": row.get("top_method", ""),
                "selected_region": row.get("top_region", ""),
                "pred_bpm": row.get("pred_bpm", ""),
            },
            oracle_row=None,
            args=args,
        )


def write_report(summary: pd.DataFrame, fusion: pd.DataFrame, model_meta: dict[str, Any], out_path: Path, args: argparse.Namespace) -> None:
    lines = [
        "# Multi-View RGB rPPG Consistency Check",
        "",
        "## Setup",
        "",
        f"- Inputs: `{args.multi_dir.as_posix()}/*.mp4`",
        f"- Selector model: `{model_meta.get('model_path', '')}`",
        f"- Window / step: {args.window_sec}s / {args.step_sec}s",
        f"- BPM search band: {args.min_bpm}-{args.max_bpm}",
        f"- Candidate regions: 4 aggregate face ROIs + {args.grid_rows}x{args.grid_cols} face patches",
        f"- Candidate methods: {', '.join(METHODS)}",
        "",
        "## Important Interpretation",
        "",
        "- These multi-view videos do not have synchronized monitor labels in this dataset.",
        "- The reported values are view consistency/stability checks, not accuracy metrics.",
        "- The selector is the current-label single-view RGB model, so results should be treated as stage-2 feasibility signals.",
        "",
        "## View Summary",
        "",
        markdown_table(summary) if not summary.empty else "No view predictions.",
        "",
        "## Fusion Track Preview",
        "",
        markdown_table(fusion.head(20)) if not fusion.empty else "No fusion track.",
        "",
    ]
    out_path.write_text("\n".join(lines), encoding="utf-8")


def build_view_assets(summary: pd.DataFrame, args: argparse.Namespace) -> list[dict[str, Any]]:
    summary_by_view = {row["view"]: row for row in rows_for_ui(summary)}
    labels = {
        "front": "Front RGB",
        "left": "Left RGB",
        "right": "Right RGB",
        "up": "Top RGB",
    }
    rows: list[dict[str, Any]] = []
    for path in sorted(args.multi_dir.glob("*.mp4"), key=natural_sort_key):
        item = summary_by_view.get(path.stem, {})
        rows.append(
            {
                "id": path.stem,
                "label": labels.get(path.stem, path.stem.title()),
                "path": path.as_posix(),
                "videoUrl": existing_vite_url(path),
                "regionOverlayUrl": existing_vite_url(args.out_dir / "region_overlays" / f"{path.stem}_region_overlay.jpg"),
                **item,
            }
        )
    return rows


def write_ui_data(
    summary: pd.DataFrame,
    fusion: pd.DataFrame,
    selected: pd.DataFrame,
    model_meta: dict[str, Any],
    out_path: Path,
    args: argparse.Namespace,
) -> None:
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "setup": {
            "multiDir": args.multi_dir.as_posix(),
            "outDir": args.out_dir.as_posix(),
            "sampleFps": args.sample_fps,
            "windowSec": args.window_sec,
            "stepSec": args.step_sec,
            "minBpm": args.min_bpm,
            "maxBpm": args.max_bpm,
            "grid": f"{args.grid_rows}x{args.grid_cols}",
            "methods": list(METHODS),
            "interpretation": "Unlabeled multi-view consistency/stability check, not an accuracy estimate.",
        },
        "assets": {
            "reportUrl": existing_vite_url(args.out_dir / "multiview_rgb_report.md"),
            "summaryCsvUrl": existing_vite_url(args.out_dir / "multiview_summary.csv"),
            "windowPredictionsCsvUrl": existing_vite_url(args.out_dir / "multiview_window_predictions.csv"),
            "fusionCsvUrl": existing_vite_url(args.out_dir / "multiview_fusion.csv"),
            "trackPlotUrl": existing_vite_url(args.out_dir / "multiview_hr_track.png"),
        },
        "model": model_meta,
        "views": build_view_assets(summary, args),
        "summary": rows_for_ui(summary),
        "fusion": rows_for_ui(fusion),
        "selectedWindows": rows_for_ui(
            selected.sort_values(["view", "window_index"], key=lambda s: s.map(natural_sort_key) if s.name == "view" else s)
        ),
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        "export const RPPG_MULTI_VIEW_RGB = "
        + json.dumps(payload, indent=2, ensure_ascii=False)
        + " as const;\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    warnings.filterwarnings("ignore", category=ConvergenceWarning)
    warnings.filterwarnings("ignore", category=FutureWarning)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("YOLO_CONFIG_DIR", str(Path.cwd()))
    os.environ.setdefault("YOLO_VERBOSE", "False")

    from ultralytics import YOLO

    model_path = args.single_view_dir / "models" / "current_label_peak_selector.joblib"
    if not model_path.exists():
        raise FileNotFoundError(f"Missing trained selector model: {model_path}")

    regions = make_region_catalog(args.grid_rows, args.grid_cols)
    model = YOLO(str(args.model))
    # Auto GPU (previous GPT forced CPU in some scripts)
    import torch
    if args.device in ("0", "cuda") and not torch.cuda.is_available():
        print("[warn] CUDA not available, falling back to CPU")
        args.device = "cpu"
    print(f"[device] multiview YOLO device: {args.device} (cuda={torch.cuda.is_available()})")
    cache_dir = args.out_dir / "cache"
    all_rows: list[dict[str, Any]] = []
    extraction_stats: list[dict[str, Any]] = []

    for video_path in sorted(args.multi_dir.glob("*.mp4"), key=natural_sort_key):
        view = video_path.stem
        print(f"[extract/multiview] {video_path}")
        traces = extract_candidate_traces(
            video_path=video_path,
            model=model,
            args=args,
            cache_path=cache_dir / f"{view}_candidate_traces.npz",
            regions=regions,
        )
        times = traces["times"]
        boxes = traces["boxes"]
        detected_pct = float(np.isfinite(boxes[:, :4]).all(axis=1).mean() * 100.0) if len(boxes) else 0.0
        extraction_stats.append(
            {
                "view": view,
                "video": video_path.name,
                "samples": int(len(times)),
                "effective_fps": round(float(traces["effective_fps"][0]), 3),
                "detected_pct": round(detected_pct, 2),
                "median_box_conf": round(float(np.nanmedian(boxes[:, 4])), 3) if len(boxes) else "",
                "regions": len(regions),
            }
        )
        for region in regions:
            all_rows.extend(
                evaluate_unlabeled_region_candidates(
                    view=view,
                    video_name=video_path.name,
                    times=times,
                    boxes=boxes,
                    rgb=traces[f"rgb__{region.id}"],
                    valid=traces[f"valid__{region.id}"],
                    region=region,
                    args=args,
                )
            )

    candidates = pd.DataFrame(all_rows)
    candidates, model_meta = score_with_trained_selector(candidates, model_path)
    candidates.to_csv(args.out_dir / "multiview_candidate_window_peaks.csv", index=False)
    extraction_stats_df = pd.DataFrame(extraction_stats)
    extraction_stats_df.to_csv(args.out_dir / "multiview_extraction_stats.csv", index=False)

    selected = select_view_tracks(candidates, args)
    selected.to_csv(args.out_dir / "multiview_window_predictions.csv", index=False)
    fusion = fused_hr_by_window(selected)
    fusion.to_csv(args.out_dir / "multiview_fusion.csv", index=False)
    summary = summarize_views(selected, extraction_stats_df)
    summary.to_csv(args.out_dir / "multiview_summary.csv", index=False)
    draw_multiview_overlays(summary, args, regions)
    write_plots(selected, fusion, args.out_dir)
    write_report(summary, fusion, model_meta, args.out_dir / "multiview_rgb_report.md", args)
    write_ui_data(summary, fusion, selected, model_meta, args.ui_data, args)

    print(
        json.dumps(
            {
                "out_dir": str(args.out_dir),
                "ui_data": str(args.ui_data),
                "summary": rows_for_ui(summary),
                "fusion_windows": int(len(fusion)),
            },
            indent=2,
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
