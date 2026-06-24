"""End-to-end glue: a raw video -> DLC keypoints -> a Session.

Keypoint generation needs DeepLabCut SuperAnimal (heavy; GPU recommended) and the
YOLO assets. That dependency is intentionally NOT in requirements.txt, so this
module imports it lazily and fails with actionable guidance when it is absent.
The post-keypoint half (Session -> analyzers -> EWS) has no such dependency.
"""

from __future__ import annotations

import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent


def keypoints_csv_beside(video: Path) -> Path | None:
    """If a normalized keypoints CSV already sits next to the video, use it."""
    cand = video.with_name("pet_keypoints_normalized.csv")
    return cand if cand.exists() else None


def generate_keypoints(video: Path, out_dir: Path, device: str = "cpu",
                       fps: float = 10.0) -> Path:
    """Run DLC SuperAnimal on `video` and write a normalized keypoints CSV.

    Returns the CSV path. Raises RuntimeError with guidance if DeepLabCut is not
    installed in the active environment.
    """
    video = Path(video)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    sys.path.insert(0, str(_REPO_ROOT / "tools"))

    try:
        import deeplabcut  # noqa: F401
    except Exception as e:  # ImportError or backend issues
        raise RuntimeError(
            "DeepLabCut is not available in this environment, so keypoints cannot "
            "be generated here.\n"
            "  - Use the project's DLC environment (e.g. .venv-dlc-gpu), or\n"
            "  - pre-generate keypoints and pass --keypoints <pet_keypoints_normalized.csv>.\n"
            "  - See tools/run_deeplabcut_probe.py + tools/normalize_dlc_h5.py.\n"
            f"(import error: {type(e).__name__}: {e})"
        ) from e

    import deeplabcut  # real import
    from evaluate_pet_keypoint_readiness import normalize_dlc_keypoints

    deeplabcut.video_inference_superanimal(
        [str(video)],
        superanimal_name="superanimal_quadruped",
        model_name="hrnet_w32",
        detector_name="fasterrcnn_resnet50_fpn_v2",
        dest_folder=str(out_dir),
        device=device,
    )
    h5s = sorted(out_dir.glob("*superanimal*.h5"))
    if not h5s:
        raise RuntimeError(f"DLC produced no .h5 in {out_dir}")
    df = normalize_dlc_keypoints(h5s[0])
    csv_path = out_dir / "pet_keypoints_normalized.csv"
    df.to_csv(csv_path, index=False)
    return csv_path


def session_from_video(video, keypoints=None, out_dir=None, device="cpu"):
    """Resolve keypoints (explicit -> beside-video -> generate) and build a Session."""
    from .core.session import Session

    video = Path(video)
    if keypoints is not None:
        return Session.from_keypoints(Path(keypoints), video_path=video)
    beside = keypoints_csv_beside(video)
    if beside is not None:
        return Session.from_keypoints(beside, video_path=video)
    out_dir = Path(out_dir) if out_dir else (_REPO_ROOT / f"reports/analyze_{video.stem}")
    csv_path = generate_keypoints(video, out_dir, device=device)
    return Session.from_keypoints(csv_path, video_path=video)
