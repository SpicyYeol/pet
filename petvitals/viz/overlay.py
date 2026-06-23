"""Draw posture labels + DLC skeleton on the probe video for eyeball checks."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from ..core.keypoints import HEAD, LIMBS, PAWS, SPINE, pt

# Clinical severity color (BGR) per posture
SEVERITY = {
    "orthopnea_resp_distress": (0, 0, 255),
    "seizure_or_tremor":       (0, 0, 255),
    "hunched_abdominal_pain":  (0, 140, 255),
    "lateral_recumbency":      (0, 200, 255),
    "sternal_recumbency":      (0, 255, 255),
    "sitting":                 (0, 220, 0),
    "standing_normal":         (0, 220, 0),
    "uncertain":               (160, 160, 160),
}

SKELETON = [
    ("nose", "upper_jaw"), ("upper_jaw", "lower_jaw"),
    ("nose", "left_eye"), ("nose", "right_eye"),
    ("left_earbase", "neck_base"), ("right_earbase", "neck_base"),
    ("nose", "throat_base"), ("throat_base", "neck_base"),
    ("neck_base", "back_base"), ("back_base", "back_middle"),
    ("back_middle", "back_end"), ("back_end", "tail_base"), ("tail_base", "tail_end"),
    ("neck_base", "front_left_thai"), ("neck_base", "front_right_thai"),
    ("front_left_thai", "front_left_knee"), ("front_left_knee", "front_left_paw"),
    ("front_right_thai", "front_right_knee"), ("front_right_knee", "front_right_paw"),
    ("tail_base", "back_left_thai"), ("tail_base", "back_right_thai"),
    ("back_left_thai", "back_left_knee"), ("back_left_knee", "back_left_paw"),
    ("back_right_thai", "back_right_knee"), ("back_right_knee", "back_right_paw"),
]

DRAW_KP = HEAD + SPINE + PAWS + LIMBS + ["tail_end"]


def _conf_color(c: float) -> tuple[int, int, int]:
    c = max(0.0, min(1.0, c))
    return (0, int(255 * c), int(255 * (1 - c)))


def _draw_panel(cv2, img, posture, row, summary, t, color):
    h, w = img.shape[:2]
    overlay = img.copy()
    cv2.rectangle(overlay, (0, 0), (w, 96), (20, 20, 20), -1)
    img[:] = cv2.addWeighted(overlay, 0.55, img, 0.45, 0)
    cv2.putText(img, posture.upper(), (12, 38),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 2, cv2.LINE_AA)
    cv2.putText(img, f"t={t:5.1f}s", (w - 150, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (230, 230, 230), 1, cv2.LINE_AA)

    def fmt(key):
        v = row.get(key, "")
        return f"{float(v):.2f}" if v not in ("", None) else "--"
    line2 = (f"sep={fmt('vertical_separation')}  arch={fmt('back_curvature')}  "
             f"tilt={fmt('spine_tilt')}  neck={fmt('neck_extension')}  "
             f"motion={fmt('motion_energy')}  kp={int(row.get('n_valid_kp', 0))}")
    cv2.putText(img, line2, (12, 64),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (210, 210, 210), 1, cv2.LINE_AA)
    ews = summary["behavioral_ews_subscore"]
    ews_col = (0, 0, 255) if ews >= 3 else (0, 140, 255) if ews >= 1 else (0, 220, 0)
    cv2.putText(img, f"behavioral EWS: {ews}/3", (12, 88),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, ews_col, 1, cv2.LINE_AA)
    flags = [k for k, v in summary["flags"].items() if v]
    if flags:
        cv2.putText(img, "FLAGS: " + ", ".join(flags), (200, 88),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1, cv2.LINE_AA)


def render_pose_overlay(session, result, out_dir: Path,
                        write_video: bool = True, sample_frames: int = 4,
                        min_conf: float = 0.30) -> dict:
    """Render the annotated overlay. Returns paths of what was written."""
    import cv2  # local import so the package imports without opencv

    if session.video_path is None or not Path(session.video_path).exists():
        raise FileNotFoundError(f"No video for stem {session.stem}")
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    by_idx = {session.frame_index[i]: (session.frames[i], session.times[i])
              for i in range(session.n_frames)}
    rows_by_idx = {int(r["frame_index"]): r for r in result.per_frame.to_dict("records")}
    summary = result.summary

    cap = cv2.VideoCapture(str(session.video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video {session.video_path}")
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    vfps = cap.get(cv2.CAP_PROP_FPS) or session.fps
    n_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or session.n_frames

    writer = None
    out_mp4 = out_dir / f"{session.stem}_pose_overlay.mp4"
    if write_video:
        writer = cv2.VideoWriter(str(out_mp4), cv2.VideoWriter_fourcc(*"mp4v"),
                                 vfps, (w, h))
    sample_at = set()
    if sample_frames > 0:
        sample_at = set(np.linspace(0, max(n_total - 1, 0),
                                    sample_frames, dtype=int).tolist())

    written = {"video": None, "frames": []}
    fidx = 0
    while True:
        ok, img = cap.read()
        if not ok:
            break
        if fidx in by_idx and fidx in rows_by_idx:
            fr, t = by_idx[fidx]
            row = rows_by_idx[fidx]
            posture = row["posture_smoothed"]
            color = SEVERITY.get(posture, (200, 200, 200))
            for a, b in SKELETON:
                pa, pb = pt(fr, a, min_conf), pt(fr, b, min_conf)
                if pa is not None and pb is not None:
                    cv2.line(img, tuple(pa.astype(int)), tuple(pb.astype(int)),
                             (180, 180, 90), 1, cv2.LINE_AA)
            for name in DRAW_KP:
                p = pt(fr, name, min_conf)
                if p is not None:
                    c = fr[name][2]
                    cv2.circle(img, tuple(p.astype(int)), 3, _conf_color(c), -1, cv2.LINE_AA)
            _draw_panel(cv2, img, posture, row, summary, t, color)
            cv2.rectangle(img, (0, 0), (w - 1, h - 1), color, 3)
        if writer is not None:
            writer.write(img)
        if fidx in sample_at:
            sp = out_dir / f"{session.stem}_pose_sample_{fidx:04d}.jpg"
            cv2.imwrite(str(sp), img)
            written["frames"].append(sp)
        fidx += 1

    cap.release()
    if writer is not None:
        writer.release()
        written["video"] = out_mp4
    return written
