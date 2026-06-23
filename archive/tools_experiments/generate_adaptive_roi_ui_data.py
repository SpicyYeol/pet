from __future__ import annotations

import json
import math
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

from evaluate_single_view_sqi import existing_vite_url, rows_for_ui


ROOT = Path(".")
OUT_DIR = Path("reports/rppg_pet_keypoints/adaptive_roi_latest")
UI_DATA = Path("ui/src/generated/rppgAdaptiveRoiLatest.ts")


ZONE_PAIRS = {
    "throat": ("throat_exposed", "throat_area"),
    "right_ear": ("right_ear_base", "ear_area_right"),
    "left_ear": ("left_ear_base", "ear_area_left"),
    "muzzle": ("muzzle_skin", "muzzle_area"),
    "nose": ("nose_bridge", None),
}


ZONE_LABELS = {
    "throat": "Throat",
    "right_ear": "Right ear",
    "left_ear": "Left ear",
    "muzzle": "Muzzle",
    "nose": "Nose bridge",
}


GALLERIES = {
    3: {
        "frame": "frame 120",
        "keypoints": Path("presentation_images/3_frame120_keypoints_kr.jpg"),
        "allRois": Path("presentation_images/3_frame120_all_rois_kr.jpg"),
        "chosenRois": Path("presentation_images/3_frame120_chosen_rois_kr_with_quality.jpg"),
    },
    6: {
        "frame": "frame 100",
        "keypoints": Path("presentation_images/6_frame100_keypoints_kr.jpg"),
        "allRois": Path("presentation_images/6_frame100_all_rois_kr.jpg"),
        "chosenRois": Path("presentation_images/6_frame100_chosen_rois_kr_with_quality.jpg"),
    },
    7: {
        "frame": "frame 90",
        "keypoints": Path("presentation_images/7_frame90_keypoints_kr.jpg"),
        "allRois": Path("presentation_images/7_frame90_all_rois_kr.jpg"),
        "chosenRois": Path("presentation_images/7_frame90_chosen_rois_kr_with_quality.jpg"),
    },
}


def safe_float(value: Any) -> float:
    try:
        out = float(value)
    except (TypeError, ValueError):
        return math.nan
    return out


def finite_round(value: Any, digits: int = 3) -> float | str:
    f = safe_float(value)
    if not math.isfinite(f):
        return ""
    return round(f, digits)


def zone_quality(row: pd.Series) -> float:
    snr = safe_float(row.get("best_snr", 0))
    pixel = safe_float(row.get("pixel_mean", 500))
    post_var = safe_float(row.get("post_clean_gr_var", 999))
    dist_100 = safe_float(row.get("peak_dist_from_100", 0))
    if pixel < 400:
        return 0.0
    pix_factor = pixel / (pixel + 600)
    clean_factor = 1.0 / (1.0 + post_var / 250)
    artifact_factor = 1.0 if dist_100 >= 30 else 0.55
    return float(snr * pix_factor * clean_factor * artifact_factor)


def row_for_candidate(row: pd.Series, high_hr_prior: bool) -> dict[str, Any]:
    quality = zone_quality(row)
    if high_hr_prior and safe_float(row.get("best_bpm")) > 160:
        quality *= 1.12
    return {
        "family": str(row.get("roi_family", "")),
        "baseName": str(row.get("base_name", "")),
        "name": str(row.get("full_name", "")),
        "pixelMean": finite_round(row.get("pixel_mean"), 1),
        "postCleanGrVar": finite_round(row.get("post_clean_gr_var"), 2),
        "bestBpm": finite_round(row.get("best_bpm"), 1),
        "bestSnr": finite_round(row.get("best_snr"), 2),
        "bestMethod": str(row.get("best_method", "")),
        "distFrom100": finite_round(row.get("peak_dist_from_100"), 1),
        "zoneQuality": round(quality, 3),
    }


def build_roi_decisions(dual_path: Path, full_eval_path: Path) -> list[dict[str, Any]]:
    dual = pd.read_csv(dual_path)
    targets = pd.read_csv(full_eval_path).set_index("video")["target_bpm"].to_dict()
    out: list[dict[str, Any]] = []
    for video in sorted(dual["video"].unique()):
        video_int = int(video)
        video_df = dual[dual["video"] == video_int]
        high_hr_prior = video_int in (3, 7)
        decisions = []
        for zone, (single_name, multi_name) in ZONE_PAIRS.items():
            rows = []
            single = video_df[(video_df["roi_family"] == "single") & (video_df["base_name"] == single_name)]
            if not single.empty:
                rows.append(row_for_candidate(single.iloc[0], high_hr_prior))
            if multi_name is not None:
                multi = video_df[(video_df["roi_family"] == "multi") & (video_df["base_name"] == multi_name)]
                if not multi.empty:
                    rows.append(row_for_candidate(multi.iloc[0], high_hr_prior))
            if not rows:
                continue
            chosen = rows[0]
            if len(rows) > 1:
                single_row = next((row for row in rows if row["family"] == "single"), rows[0])
                multi_row = next((row for row in rows if row["family"] == "multi"), rows[-1])
                if safe_float(multi_row["zoneQuality"]) > safe_float(single_row["zoneQuality"]) * 1.15:
                    chosen = multi_row
                    reason = (
                        f"multi wins: q={multi_row['zoneQuality']} > 1.15 * single q={single_row['zoneQuality']}"
                    )
                else:
                    chosen = single_row
                    reason = (
                        f"single kept: multi q={multi_row['zoneQuality']} <= 1.15 * single q={single_row['zoneQuality']}"
                    )
            else:
                reason = "single-only candidate"
            decisions.append(
                {
                    "zone": zone,
                    "label": ZONE_LABELS.get(zone, zone),
                    "chosenFamily": chosen["family"],
                    "chosenName": chosen["name"],
                    "chosenBpm": chosen["bestBpm"],
                    "chosenSnr": chosen["bestSnr"],
                    "chosenQuality": chosen["zoneQuality"],
                    "reason": reason,
                    "candidates": rows,
                }
            )
        gallery = GALLERIES.get(video_int, {})
        out.append(
            {
                "video": f"{video_int}.mp4",
                "targetBpm": finite_round(targets.get(video_int), 1),
                "highHrPrior": high_hr_prior,
                "decisions": decisions,
                "gallery": {
                    "frame": gallery.get("frame", ""),
                    "keypointsUrl": existing_vite_url(gallery["keypoints"]) if gallery.get("keypoints", Path()).exists() else "",
                    "allRoisUrl": existing_vite_url(gallery["allRois"]) if gallery.get("allRois", Path()).exists() else "",
                    "chosenRoisUrl": existing_vite_url(gallery["chosenRois"]) if gallery.get("chosenRois", Path()).exists() else "",
                },
            }
        )
    return out


def best_by_video_variant(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    df = pd.read_csv(path)
    rows = []
    for (video, variant), group in df.groupby(["video", "variant"], sort=True):
        best = group.sort_values(["best_snr", "pixel_mean"], ascending=[False, False]).iloc[0]
        rows.append(
            {
                "video": f"{int(video)}.mp4",
                "variant": str(variant),
                "name": str(best["name"]),
                "pixelMean": finite_round(best["pixel_mean"], 1),
                "grVar": finite_round(best["gr_var"], 2),
                "bestBpm": finite_round(best["best_bpm"], 1),
                "bestSnr": finite_round(best["best_snr"], 2),
                "bestMethod": str(best["best_method"]),
            }
        )
    return rows


def write_report(payload: dict[str, Any]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Adaptive ROI Latest UI Summary",
        "",
        f"- Generated: `{payload['generatedAt']}`",
        f"- Production command: `{payload['overview']['recommendedCommand']}`",
        f"- Full-evaluation MAE: `{payload['evaluation']['meanAbsError']}` bpm mean, `{payload['evaluation']['medianAbsError']}` bpm median.",
        "",
        "## Adaptive ROI Decisions",
        "",
    ]
    for video in payload["roiSelection"]["videos"]:
        lines.append(f"### {video['video']} target {video['targetBpm']} bpm")
        for decision in video["decisions"]:
            lines.append(
                f"- {decision['label']}: `{decision['chosenName']}` ({decision['chosenFamily']}), "
                f"q={decision['chosenQuality']}, bpm={decision['chosenBpm']}, snr={decision['chosenSnr']}"
            )
        lines.append("")
    lines.extend(
        [
            "## Keypoint / ROI Gallery",
            "",
            "- Frame-level keypoints, all ROI candidates, and chosen ROI overlays are exposed in the UI from `presentation_images/`.",
        ]
    )
    (OUT_DIR / "adaptive_roi_latest_report.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    full_eval_path = Path("reports/rppg_pet_keypoints/full_evaluation_current_best/full_evaluation_best_config.csv")
    smart_v2_path = Path("reports/rppg_pet_keypoints/full_evaluation_current_best/smart_selection_v2_comparison.csv")
    dual_path = Path("reports/rppg_pet_keypoints/dual_roi_candidates/dual_roi_candidates_results.csv")
    multi_area_path = Path("reports/rppg_pet_keypoints/multi_area_roi_v2/multi_area_roi_results.csv")

    full_eval = pd.read_csv(full_eval_path)
    smart_v2 = pd.read_csv(smart_v2_path)
    mean_abs_error = round(float(full_eval["abs_error"].mean()), 2)
    median_abs_error = round(float(full_eval["abs_error"].median()), 2)
    mean_v2_error = round(float(smart_v2["v2_err"].mean()), 2)
    high_hr_rows = full_eval[full_eval["video"].isin([3, 7])]
    high_hr_recovery = int(high_hr_rows["high_hr_recovery"].astype(bool).sum())

    payload: dict[str, Any] = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "overview": {
            "title": "Adaptive Pet ROI Pipeline",
            "status": "Integrated single-view dog-aware pipeline",
            "recommendedCommand": "python tools/analyze_video.py --stem <id> --dog_aware --relax_rejection",
            "selectorFormula": "quality = SNR * pixel_factor * clean_factor * artifact_factor",
            "selectorThreshold": 1.15,
            "keypointModel": "DeepLabCut SuperAnimal Quadruped HRNet-W32",
            "pipelineSteps": [
                "DLC keypoint detection",
                "Dual ROI candidate generation",
                "A+B panting subtraction and amplification",
                "Per-zone quality scoring",
                "Adaptive single/multi ROI decision",
                "Windowed rPPG with rejection",
                "Smart final BPM selection",
            ],
        },
        "evaluation": {
            "videos": int(len(full_eval)),
            "meanAbsError": mean_abs_error,
            "medianAbsError": median_abs_error,
            "highHrRecovery": f"{high_hr_recovery}/{len(high_hr_rows)}",
            "rows": rows_for_ui(full_eval),
            "smartV2Rows": rows_for_ui(smart_v2),
            "meanSmartV2Error": mean_v2_error,
        },
        "roiSelection": {
            "source": str(dual_path),
            "videos": build_roi_decisions(dual_path, full_eval_path),
        },
        "multiArea": {
            "source": str(multi_area_path),
            "bestByVideoVariant": best_by_video_variant(multi_area_path),
        },
        "assets": {
            "reportUrl": existing_vite_url(OUT_DIR / "adaptive_roi_latest_report.md"),
            "deploymentGuideUrl": existing_vite_url(Path("PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md")),
            "fullEvaluationReportUrl": existing_vite_url(Path("reports/rppg_pet_keypoints/full_evaluation_current_best/FULL_EVALUATION_REPORT.md")),
            "smartSelectionReportUrl": existing_vite_url(Path("reports/rppg_pet_keypoints/full_evaluation_current_best/SMART_SELECTION_REPORT.md")),
            "dualCandidatesCsvUrl": existing_vite_url(dual_path),
            "fullEvaluationCsvUrl": existing_vite_url(full_eval_path),
            "smartV2CsvUrl": existing_vite_url(smart_v2_path),
            "overviewImageUrl": existing_vite_url(Path("presentation_images/15.jpg")),
            "flowImagePage1Url": existing_vite_url(Path("presentation_images/18.jpg")),
            "flowImagePage2Url": existing_vite_url(Path("presentation_images/19.jpg")),
        },
    }
    write_report(payload)
    UI_DATA.parent.mkdir(parents=True, exist_ok=True)
    UI_DATA.write_text(
        "export const RPPG_ADAPTIVE_ROI_LATEST = "
        + json.dumps(payload, indent=2, ensure_ascii=False)
        + " as const;\n",
        encoding="utf-8",
    )
    print(f"Wrote adaptive ROI UI data to {UI_DATA}")


if __name__ == "__main__":
    main()
