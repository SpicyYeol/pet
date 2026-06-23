from __future__ import annotations

import argparse
import json
import traceback
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a short DeepLabCut SuperAnimal probe on one pet video.")
    parser.add_argument("--video", type=Path, default=Path("dataset_front/4.mp4"))
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_pet_keypoints/dlc_probe"))
    parser.add_argument("--seconds", type=float, default=1.5)
    parser.add_argument("--start-sec", type=float, default=0.0)
    parser.add_argument("--max-width", type=int, default=512)
    parser.add_argument("--fps", type=float, default=5.0)
    parser.add_argument("--device", default="cuda", help="DLC device: 'cuda' (GPU), 'cpu', or 'cuda:0'")
    parser.add_argument("--skip-inference", action="store_true")
    return parser.parse_args()


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def make_probe_clip(video: Path, out_dir: Path, seconds: float, start_sec: float, max_width: int, fps_limit: float) -> dict[str, Any]:
    if not video.exists():
        raise FileNotFoundError(video)
    out_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        raise RuntimeError(f"Could not open {video}")

    src_fps = float(cap.get(cv2.CAP_PROP_FPS) or 30.0)
    src_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    src_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    start_frame = int(round(start_sec * src_fps))
    end_frame = int(round((start_sec + seconds) * src_fps))
    frame_step = max(1, int(round(src_fps / fps_limit))) if fps_limit > 0 else 1

    scale = min(1.0, max_width / src_w) if src_w > 0 else 1.0
    out_w = max(2, int(round(src_w * scale)))
    out_h = max(2, int(round(src_h * scale)))
    if out_w % 2:
        out_w -= 1
    if out_h % 2:
        out_h -= 1

    clip_path = out_dir / f"{video.stem}_dlc_probe.mp4"
    writer = cv2.VideoWriter(
        str(clip_path),
        cv2.VideoWriter_fourcc(*"mp4v"),
        min(src_fps, fps_limit) if fps_limit > 0 else src_fps,
        (out_w, out_h),
    )
    if not writer.isOpened():
        raise RuntimeError(f"Could not create {clip_path}")

    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
    written = 0
    read = 0
    frame_idx = start_frame
    while frame_idx < end_frame:
        ok, frame = cap.read()
        if not ok:
            break
        if read % frame_step == 0:
            if scale != 1.0:
                frame = cv2.resize(frame, (out_w, out_h), interpolation=cv2.INTER_AREA)
            writer.write(frame)
            written += 1
        read += 1
        frame_idx += 1

    cap.release()
    writer.release()
    if written == 0:
        raise RuntimeError(f"No frames written from {video}")

    return {
        "sourceVideo": str(video),
        "clipPath": str(clip_path),
        "sourceFps": src_fps,
        "clipFps": min(src_fps, fps_limit) if fps_limit > 0 else src_fps,
        "sourceSize": [src_w, src_h],
        "clipSize": [out_w, out_h],
        "startSec": start_sec,
        "seconds": seconds,
        "framesWritten": written,
    }


def run_deeplabcut(clip_path: Path, out_dir: Path, device: str) -> None:
    import deeplabcut

    deeplabcut.video_inference_superanimal(
        videos=[str(clip_path)],
        superanimal_name="superanimal_quadruped",
        model_name="hrnet_w32",
        detector_name="fasterrcnn_resnet50_fpn_v2",
        dest_folder=str(out_dir),
        video_adapt=False,
        create_labeled_video=False,
        plot_bboxes=False,
        batch_size=1,
        detector_batch_size=1,
        max_individuals=1,
        pcutoff=0.1,
        bbox_threshold=0.5,
        device=device,
    )


def main() -> None:
    args = parse_args()
    # Robust GPU default for DLC (previous default was cpu)
    import torch
    if args.device == "cuda" and not torch.cuda.is_available():
        print("[warn] CUDA not available for DLC, using cpu")
        args.device = "cpu"
    print(f"[device] DeepLabCut device: {args.device} (cuda={torch.cuda.is_available()})")
    manifest_path = args.out_dir / "dlc_probe_manifest.json"
    manifest: dict[str, Any] = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "status": "started",
        "device": args.device,
        "superanimal": "superanimal_quadruped",
        "poseModel": "hrnet_w32",
        "detector": "fasterrcnn_resnet50_fpn_v2",
    }
    try:
        clip = make_probe_clip(args.video, args.out_dir, args.seconds, args.start_sec, args.max_width, args.fps)
        manifest["clip"] = clip
        write_json(manifest_path, manifest)
        if not args.skip_inference:
            run_deeplabcut(Path(clip["clipPath"]), args.out_dir, args.device)
        manifest["status"] = "completed"
        manifest["outputs"] = sorted(str(path) for path in args.out_dir.glob("*"))
        write_json(manifest_path, manifest)
        print(f"Wrote DLC probe outputs to {args.out_dir}")
    except Exception as exc:  # noqa: BLE001 - this is an experiment runner, so persist full failure context.
        manifest["status"] = "failed"
        manifest["error"] = repr(exc)
        manifest["tracebackPath"] = str(args.out_dir / "dlc_probe_error.txt")
        args.out_dir.mkdir(parents=True, exist_ok=True)
        (args.out_dir / "dlc_probe_error.txt").write_text(traceback.format_exc(), encoding="utf-8")
        write_json(manifest_path, manifest)
        raise


if __name__ == "__main__":
    main()
