"""Session: the shared unit of analysis (one clip's video + keypoints)."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from .keypoints import load_frames, resolve_keypoints_path


@dataclass
class Session:
    """Everything an analyzer needs about one clip.

    Analyzers read from a Session and never touch disk paths directly, so the
    same analyzer works for a probe folder, an ad-hoc CSV, or (later) a live
    feed that fills `frames` in memory.
    """

    stem: str
    keypoints_path: Optional[Path]
    video_path: Optional[Path]
    frames: list[dict]
    frame_index: list[int]
    times: list[float]
    fps: float
    meta: dict = field(default_factory=dict)

    # ── constructors ──────────────────────────────────────────────
    @classmethod
    def from_keypoints(cls, csv_path, stem: Optional[str] = None,
                       video_path=None) -> "Session":
        csv_path = Path(csv_path)
        frames, idxs, times, fps = load_frames(csv_path)
        if stem is None:
            stem = csv_path.parent.name
        if video_path is None:
            video_path = _sibling_video(csv_path, stem)
        return cls(stem=stem, keypoints_path=csv_path, video_path=video_path,
                   frames=frames, frame_index=idxs, times=times, fps=fps)

    @classmethod
    def from_stem(cls, stem: str) -> "Session":
        csv_path = resolve_keypoints_path(stem)
        if csv_path is None:
            raise FileNotFoundError(f"No keypoints CSV found for stem {stem}")
        return cls.from_keypoints(csv_path, stem=stem)

    # ── convenience ───────────────────────────────────────────────
    @property
    def n_frames(self) -> int:
        return len(self.frames)

    @property
    def duration_sec(self) -> float:
        return round(self.n_frames / self.fps, 1) if self.fps else 0.0


def _sibling_video(csv_path: Path, stem: str) -> Optional[Path]:
    sib = list(csv_path.parent.glob("*_dlc_probe.mp4"))
    if sib:
        return sib[0]
    fallback = Path(f"dataset_front/{stem}.mp4")
    return fallback if fallback.exists() else None
