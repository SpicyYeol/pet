from __future__ import annotations

import argparse
import importlib.util
import json
import math
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

from evaluate_single_view_sqi import existing_vite_url, rows_for_ui


GENERIC_COLUMNS = ["video", "time_sec", "frame_index", "keypoint", "x", "y", "confidence", "source"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Check pet keypoint provider readiness and normalize optional keypoint CSV outputs."
    )
    parser.add_argument("--keypoints-csv", type=Path, default=None)
    parser.add_argument("--keypoints-file", type=Path, default=None)
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_pet_keypoints"))
    parser.add_argument("--ui-data", type=Path, default=Path("ui/src/generated/rppgPetKeypointReadiness.ts"))
    parser.add_argument("--provider-python", type=Path, default=Path(".venv-keypoint/Scripts/python.exe"))
    parser.add_argument("--workspace-python", default="python")
    return parser.parse_args()


def module_available(name: str) -> bool:
    return importlib.util.find_spec(name) is not None


def module_available_in_python(name: str, python_exe: Path | None) -> bool:
    if python_exe is None or not python_exe.exists():
        return False
    script = f"import importlib.util; raise SystemExit(0 if importlib.util.find_spec({name!r}) else 1)"
    try:
        subprocess.run([str(python_exe), "-c", script], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except (OSError, subprocess.CalledProcessError):
        return False
    return True


def module_available_in_command(name: str, python_cmd: str | None) -> bool:
    if not python_cmd:
        return False
    script = f"import importlib.util; raise SystemExit(0 if importlib.util.find_spec({name!r}) else 1)"
    try:
        subprocess.run([python_cmd, "-c", script], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except (OSError, subprocess.CalledProcessError):
        return False
    return True


def provider_status(name: str, provider_python: Path | None, workspace_python: str | None) -> tuple[bool, str]:
    if module_available(name):
        return True, "current Python"
    if module_available_in_python(name, provider_python):
        return True, str(provider_python)
    if module_available_in_command(name, workspace_python):
        return True, str(workspace_python)
    return False, "not installed"


def normalize_generic_keypoints(path: Path) -> pd.DataFrame:
    raw = pd.read_csv(path)
    lowered = {str(col).lower(): col for col in raw.columns}
    required_any_time = "time_sec" in lowered or "frame_index" in lowered
    required = {"video", "keypoint", "x", "y"}
    if required.issubset(lowered) and required_any_time:
        frame = pd.DataFrame()
        for col in GENERIC_COLUMNS:
            source_col = lowered.get(col)
            frame[col] = raw[source_col] if source_col in raw.columns else ""
        frame["source"] = frame["source"].replace("", "generic_csv")
        return frame
    raise ValueError(
        "Unsupported keypoint CSV. Expected columns: video, keypoint, x, y, and either time_sec or frame_index."
    )


def probe_manifest_for(path: Path) -> dict[str, Any]:
    manifest_path = path.parent / "dlc_probe_manifest.json"
    if not manifest_path.exists():
        return {}
    try:
        return json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def normalize_dlc_keypoints(path: Path) -> pd.DataFrame:
    if path.suffix.lower() in {".h5", ".hdf", ".hdf5"}:
        raw = pd.read_hdf(path)
    elif path.suffix.lower() == ".csv":
        raw = pd.read_csv(path, header=[0, 1, 2, 3], index_col=0)
    else:
        raise ValueError(f"Unsupported DLC keypoint file: {path}")

    if not isinstance(raw.columns, pd.MultiIndex):
        raise ValueError("DLC keypoint file must have MultiIndex columns.")

    names = list(raw.columns.names)
    coord_level = names.index("coords") if "coords" in names else raw.columns.nlevels - 1
    bodypart_level = names.index("bodyparts") if "bodyparts" in names else max(0, coord_level - 1)
    individual_level = names.index("individuals") if "individuals" in names else None

    manifest = probe_manifest_for(path)
    clip = manifest.get("clip", {}) if isinstance(manifest, dict) else {}
    fps = float(clip.get("clipFps") or 0.0)
    clip_path = Path(clip.get("clipPath", path.name)) if clip.get("clipPath") else path

    grouped: dict[tuple[str, str], dict[str, Any]] = {}
    for col in raw.columns:
        levels = tuple(str(item) for item in col)
        coord = levels[coord_level].lower()
        bodypart = levels[bodypart_level]
        individual = levels[individual_level] if individual_level is not None else "animal0"
        grouped.setdefault((individual, bodypart), {})[coord] = col

    multi_individual = len({key[0] for key in grouped}) > 1
    records: list[dict[str, Any]] = []
    for seq_idx, frame_idx in enumerate(raw.index):
        time_sec = seq_idx / fps if fps > 0 else math.nan
        for (individual, bodypart), cols in grouped.items():
            if "x" not in cols or "y" not in cols:
                continue
            likelihood_col = cols.get("likelihood")
            confidence = raw.at[frame_idx, likelihood_col] if likelihood_col is not None else math.nan
            keypoint = f"{individual}:{bodypart}" if multi_individual else bodypart
            records.append(
                {
                    "video": clip_path.name,
                    "time_sec": time_sec,
                    "frame_index": int(seq_idx),
                    "keypoint": keypoint,
                    "x": float(raw.at[frame_idx, cols["x"]]),
                    "y": float(raw.at[frame_idx, cols["y"]]),
                    "confidence": float(confidence) if pd.notna(confidence) else math.nan,
                    "source": "deeplabcut_superanimal_quadruped",
                }
            )
    return pd.DataFrame.from_records(records, columns=GENERIC_COLUMNS)


def normalize_keypoints(path: Path) -> pd.DataFrame:
    if path.suffix.lower() in {".h5", ".hdf", ".hdf5"}:
        return normalize_dlc_keypoints(path)
    try:
        return normalize_generic_keypoints(path)
    except ValueError:
        return normalize_dlc_keypoints(path)


def write_schema(out_dir: Path) -> None:
    schema = [
        "# Pet Keypoint Input Schema",
        "",
        "The rPPG keypoint adapter expects a normalized long CSV. One row is one keypoint at one video time/frame.",
        "",
        "Required columns:",
        "",
        "| column | meaning |",
        "| --- | --- |",
        "| video | Video filename, e.g. `1.mp4` |",
        "| time_sec | Timestamp in seconds. Use this when available. |",
        "| frame_index | Frame index. Use this if `time_sec` is unavailable. |",
        "| keypoint | Anatomical keypoint name, e.g. `nose`, `left_eye`, `right_eye`, `left_ear_base`, `mouth`, `left_shoulder` |",
        "| x | Pixel x coordinate |",
        "| y | Pixel y coordinate |",
        "| confidence | Keypoint confidence/probability, 0-1 preferred |",
        "| source | Provider name, e.g. `mmpose_ap10k`, `deeplabcut_superanimal_quadruped`, `sleap`, `manual` |",
        "",
        "Minimum useful keypoints for this project:",
        "",
        "- Face: `nose`, `left_eye`, `right_eye`, `left_ear_base`, `right_ear_base`, `mouth`",
        "- Body: `neck`, `left_shoulder`, `right_shoulder`, `left_hip`, `right_hip`",
        "",
        "Recommended ROI policy:",
        "",
        "- Use eye/ear/nose bridge for face rPPG candidates.",
        "- Use mouth/muzzle keypoints as panting artifact state, not HR source.",
        "- Use shoulder/neck/chest body ROIs for body rPPG candidates.",
        "- Intersect all keypoint ROIs with the YOLO animal mask before RGB extraction.",
    ]
    (out_dir / "pet_keypoint_input_schema.md").write_text("\n".join(schema), encoding="utf-8")
    example = pd.DataFrame(
        [
            {
                "video": "1.mp4",
                "time_sec": 0.5,
                "frame_index": "",
                "keypoint": "nose",
                "x": 512.0,
                "y": 340.0,
                "confidence": 0.92,
                "source": "mmpose_ap10k",
            },
            {
                "video": "1.mp4",
                "time_sec": 0.5,
                "frame_index": "",
                "keypoint": "left_eye",
                "x": 470.0,
                "y": 305.0,
                "confidence": 0.88,
                "source": "mmpose_ap10k",
            },
        ]
    )
    example.to_csv(out_dir / "pet_keypoint_input_example.csv", index=False)


def write_report(
    providers: list[dict[str, Any]],
    normalized: pd.DataFrame,
    out_dir: Path,
    keypoints_file: Path | None,
    probe: dict[str, Any],
    provider_python: Path | None,
) -> None:
    provider_rows = ["| provider | installed | runtime | role | note |", "| --- | --- | --- | --- | --- |"]
    for provider in providers:
        provider_rows.append(
            f"| {provider['provider']} | {provider['installed']} | {provider['runtime']} | {provider['role']} | {provider['note']} |"
        )
    dlc_ready = any(provider["provider"].startswith("DeepLabCut") and provider["installed"] for provider in providers)
    current_decision = [
        "- Generic YOLO animal segmentation is already integrated.",
        "- DeepLabCut SuperAnimal-Quadruped has been installed in the separate keypoint runtime and was tested on a real probe clip."
        if dlc_ready
        else "- Real pet keypoints are not installed in the current Python environment.",
        "- The first DLC probe is a short, downscaled CPU sanity check; it proves the animal keypoint stack can run on this data, not that the rPPG ROI is solved yet."
        if not normalized.empty
        else "- Export a provider keypoint file, then feed that file here.",
        "- Next technical step: combine DLC keypoints with the YOLO animal mask to extract eye/ear/neck/chest ROI signals and reject mouth/paw/motion artifact states.",
    ]
    lines = [
        "# Pet Keypoint Readiness",
        "",
        f"- Python: `{sys.version.split()[0]}`",
        f"- Provider Python: `{provider_python.as_posix() if provider_python else 'none'}`",
        f"- Input keypoint file: `{keypoints_file.as_posix() if keypoints_file else 'none'}`",
        "",
        "## Providers",
        "",
        "\n".join(provider_rows),
        "",
        "## Current Decision",
        "",
        "\n".join(current_decision),
        "",
        "## DLC Probe",
        "",
    ]
    if probe:
        clip = probe.get("clip", {})
        lines.extend(
            [
                f"- Status: `{probe.get('status', 'unknown')}`",
                f"- Source video: `{clip.get('sourceVideo', 'unknown')}`",
                f"- Clip: `{clip.get('clipPath', 'unknown')}`",
                f"- Clip frames: `{clip.get('framesWritten', 'unknown')}` at `{clip.get('clipFps', 'unknown')}` fps",
                f"- Clip size: `{clip.get('clipSize', 'unknown')}`",
            ]
        )
    else:
        lines.append("No DLC probe manifest found.")
    lines.extend(
        [
            "",
            "## Normalized Keypoints",
            "",
        ]
    )
    if normalized.empty:
        lines.append("No normalized keypoint rows were generated.")
    else:
        confidence = pd.to_numeric(normalized["confidence"], errors="coerce")
        high_conf = int((confidence >= 0.5).sum())
        top = (
            normalized.assign(confidence=confidence)
            .groupby("keypoint", dropna=False)["confidence"]
            .median()
            .sort_values(ascending=False)
            .head(10)
        )
        lines.extend(
            [
                f"- Rows: {len(normalized)}",
                f"- Videos: {normalized['video'].nunique()}",
                f"- Keypoints: {', '.join(sorted(normalized['keypoint'].astype(str).unique()))}",
                f"- Median confidence: {confidence.median():.3f}",
                f"- Rows with confidence >= 0.5: {high_conf}",
                "",
                "Top median-confidence keypoints:",
                "",
                "\n".join(f"- `{name}`: {value:.3f}" for name, value in top.items()),
            ]
        )
    (out_dir / "pet_keypoint_readiness_report.md").write_text("\n".join(lines), encoding="utf-8")


def write_ui_data(
    providers: list[dict[str, Any]],
    normalized: pd.DataFrame,
    out_dir: Path,
    ui_data: Path,
    probe: dict[str, Any],
    keypoints_file: Path | None,
) -> None:
    confidence = pd.to_numeric(normalized["confidence"], errors="coerce") if not normalized.empty else pd.Series(dtype=float)
    high_conf_rows = int((confidence >= 0.5).sum()) if not normalized.empty else 0
    probe_dir = keypoints_file.parent if keypoints_file is not None else out_dir / "dlc_probe"
    manifest_path = probe_dir / "dlc_probe_manifest.json"
    h5_files = sorted(probe_dir.glob("*.h5"))
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "pythonVersion": sys.version.split()[0],
        "providers": providers,
        "normalized": {
            "rows": int(len(normalized)),
            "videos": int(normalized["video"].nunique()) if not normalized.empty else 0,
            "keypoints": sorted(normalized["keypoint"].astype(str).unique().tolist()) if not normalized.empty else [],
            "medianConfidence": round(float(confidence.median()), 3) if not normalized.empty else None,
            "highConfidenceRows": high_conf_rows,
        },
        "probe": {
            "status": probe.get("status", "not_run") if probe else "not_run",
            "sourceVideo": probe.get("clip", {}).get("sourceVideo") if probe else None,
            "clipPath": probe.get("clip", {}).get("clipPath") if probe else None,
            "framesWritten": probe.get("clip", {}).get("framesWritten") if probe else None,
            "clipFps": probe.get("clip", {}).get("clipFps") if probe else None,
            "clipSize": probe.get("clip", {}).get("clipSize") if probe else None,
        },
        "assets": {
            "reportUrl": existing_vite_url(out_dir / "pet_keypoint_readiness_report.md"),
            "schemaUrl": existing_vite_url(out_dir / "pet_keypoint_input_schema.md"),
            "exampleCsvUrl": existing_vite_url(out_dir / "pet_keypoint_input_example.csv"),
            "normalizedCsvUrl": existing_vite_url(out_dir / "pet_keypoints_normalized.csv"),
            "probeManifestUrl": existing_vite_url(manifest_path) if manifest_path.exists() else "",
            "probeH5Url": existing_vite_url(h5_files[0]) if h5_files else "",
        },
        "nextStep": "Use DLC keypoints plus the YOLO animal mask to build anatomical ROI candidates, then reject mouth/paw/motion states before HR peak selection."
        if not normalized.empty
        else "Run MMPose AP-10K or DeepLabCut SuperAnimal-Quadruped in Python 3.10/3.11, export the normalized CSV, then use it for anatomical ROI extraction.",
    }
    ui_data.parent.mkdir(parents=True, exist_ok=True)
    ui_data.write_text(
        "export const RPPG_PET_KEYPOINT_READINESS = "
        + json.dumps(payload, indent=2, ensure_ascii=False)
        + " as const;\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    provider_python = args.provider_python if args.provider_python and args.provider_python.exists() else None
    workspace_python = args.workspace_python
    mmpose_installed, mmpose_runtime = provider_status("mmpose", provider_python, workspace_python)
    dlc_installed, dlc_runtime = provider_status("deeplabcut", provider_python, workspace_python)
    sleap_installed, sleap_runtime = provider_status("sleap", provider_python, workspace_python)
    yolo_installed, yolo_runtime = provider_status("ultralytics", provider_python, workspace_python)
    providers = [
        {
            "provider": "MMPose AP-10K / AnimalPose",
            "installed": mmpose_installed,
            "runtime": mmpose_runtime,
            "role": "real animal keypoints",
            "note": "Preferred for AP-10K style dog/cat anatomical landmarks.",
        },
        {
            "provider": "DeepLabCut SuperAnimal-Quadruped",
            "installed": dlc_installed,
            "runtime": dlc_runtime,
            "role": "quadruped keypoints",
            "note": "Installed in the separate keypoint runtime and tested with a real probe clip.",
        },
        {
            "provider": "SLEAP",
            "installed": sleap_installed,
            "runtime": sleap_runtime,
            "role": "custom animal pose training/tracking",
            "note": "Best if we create our own annotation set.",
        },
        {
            "provider": "Ultralytics YOLO segmentation",
            "installed": yolo_installed,
            "runtime": yolo_runtime,
            "role": "animal foreground mask",
            "note": "Already used for dog/cat mask ROI extraction.",
        },
    ]
    keypoints_file = args.keypoints_file or args.keypoints_csv
    normalized = pd.DataFrame(columns=GENERIC_COLUMNS)
    if keypoints_file is not None:
        normalized = normalize_keypoints(keypoints_file)
    normalized.to_csv(args.out_dir / "pet_keypoints_normalized.csv", index=False)
    probe = probe_manifest_for(keypoints_file) if keypoints_file is not None else probe_manifest_for(args.out_dir / "dlc_probe" / "placeholder.h5")
    write_schema(args.out_dir)
    write_report(providers, normalized, args.out_dir, keypoints_file, probe, provider_python)
    write_ui_data(providers, normalized, args.out_dir, args.ui_data, probe, keypoints_file)
    print(f"Wrote pet keypoint readiness artifacts to {args.out_dir}")


if __name__ == "__main__":
    main()
