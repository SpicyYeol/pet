"""Unified command line for petvitals.

    python -m petvitals list
    python -m petvitals run  --stem 3 [--analyzers pose] [--out reports/pose_3]
    python -m petvitals viz  --stem 3 [--sample-frames 4] [--no-video]

Both `run` and `viz` accept either --stem (auto-resolve probe folder) or an
explicit --keypoints CSV (with optional --video).
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from . import analyzers  # noqa: F401  (triggers analyzer registration)
from .core.analyzer import available, describe, get_analyzer
from .core.session import Session
from .ews import fuse_ews


def _load_session(args) -> Session:
    if getattr(args, "keypoints", None):
        return Session.from_keypoints(args.keypoints, video_path=getattr(args, "video", None))
    return Session.from_stem(args.stem)


def _default_out(args, session) -> Path:
    if getattr(args, "out", None):
        return Path(args.out)
    return Path(f"reports/pose_{session.stem}")


def cmd_list(_args) -> None:
    print("Available analyzers:")
    for name, desc in describe().items():
        print(f"  {name:12s} {desc}")


def _run_on_session(session, names, out_dir, tag="run") -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"[{tag}] stem={session.stem}  frames={session.n_frames}  fps~{session.fps}")
    results = []
    for name in names:
        res = get_analyzer(name).analyze(session)
        results.append(res)
        res.per_frame.to_csv(out_dir / f"{name}_per_frame.csv", index=False)
        (out_dir / f"{name}_session_summary.json").write_text(
            json.dumps(res.summary, indent=2, ensure_ascii=False), encoding="utf-8")
        _print_summary(name, res)
    ews = fuse_ews(results)
    (out_dir / "ews_summary.json").write_text(
        json.dumps(ews, indent=2, ensure_ascii=False), encoding="utf-8")
    print("-" * 56)
    print(f"  COMBINED EWS: {ews['total_ews']}  ({ews['severity']})")
    for why in ews["reasons"]:
        print(f"    - {why}")
    print(f"[{tag}] wrote outputs to {out_dir}")


def cmd_analyze(args) -> None:
    """Raw video -> keypoints (DLC if needed) -> analyzers -> EWS."""
    from .pipeline import session_from_video
    video = Path(args.video)
    out_dir = Path(args.out) if args.out else Path(f"reports/analyze_{video.stem}")
    print(f"[analyze] video={video}")
    try:
        session = session_from_video(video, keypoints=args.keypoints,
                                     out_dir=out_dir, device=args.device)
    except (RuntimeError, FileNotFoundError) as e:
        print(f"\n[analyze] cannot proceed:\n{e}")
        raise SystemExit(1)
    _run_on_session(session, args.analyzers or available(), out_dir, tag="analyze")


def cmd_run(args) -> None:
    session = _load_session(args)
    names = args.analyzers or available()
    out_dir = _default_out(args, session)
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"[run] stem={session.stem}  frames={session.n_frames}  fps~{session.fps}")

    results = []
    for name in names:
        analyzer = get_analyzer(name)
        res = analyzer.analyze(session)
        results.append(res)
        res.per_frame.to_csv(out_dir / f"{name}_per_frame.csv", index=False)
        (out_dir / f"{name}_session_summary.json").write_text(
            json.dumps(res.summary, indent=2, ensure_ascii=False), encoding="utf-8")
        _print_summary(name, res)

    ews = fuse_ews(results)
    (out_dir / "ews_summary.json").write_text(
        json.dumps(ews, indent=2, ensure_ascii=False), encoding="utf-8")
    print("-" * 56)
    print(f"  COMBINED EWS: {ews['total_ews']}  ({ews['severity']})")
    for why in ews["reasons"]:
        print(f"    - {why}")
    print(f"[run] wrote outputs to {out_dir}")


_METRIC_LABELS = [
    ("hr_bpm", "heart rate (bpm)"), ("hr_snr", "  HR SNR"),
    ("rr_bpm", "respiration (brpm)"), ("rr_confidence", "  RR confidence"),
    ("rr_bpm_riiv", "RR RIIV/pulse (brpm)"), ("rsa_amplitude_bpm", "RSA amplitude (bpm)"),
    ("vasomotion_index", "vasomotion index"),
    ("panting_rate", "panting rate (bpm)"), ("panting_intensity", "panting intensity"),
    ("mean_hr_bpm", "HRV mean HR (bpm)"), ("n_beats", "HRV beats"),
    ("sdnn_ms", "HRV SDNN (ms)"), ("rmssd_ms", "HRV RMSSD (ms)"),
    ("sd1_ms", "HRV SD1/RSA (ms)"), ("pnn50_pct", "HRV pNN50 (%)"),
    ("oral_activity_fraction", "oral activity frac"), ("oral_events", "oral events"),
    ("mean_activity", "mean activity"), ("longest_immobile_sec", "longest immobile (s)"),
]


def _print_summary(name, res) -> None:
    s = res.summary
    dur = s.get("duration_sec", "")
    print("\n" + "=" * 56)
    print(f"  {name.upper()} SUMMARY  ({dur}s)")
    print("=" * 56)
    frac = s.get("posture_time_fraction", {})
    for k, v in sorted(frac.items(), key=lambda kv: -kv[1]):
        print(f"  {k:26s} {v*100:5.1f}%  {'#' * int(round(v * 30))}")
    shown = False
    for key, label in _METRIC_LABELS:
        if key in s and s[key] is not None:
            if not shown and frac:
                print("-" * 56)
            shown = True
            print(f"  {label:22s}: {s[key]}")
    active = [k for k, v in s.get("flags", {}).items() if v]
    if active:
        print(f"  flags                 : {', '.join(active)}")
    print(f"  {name} EWS sub-score   : {res.ews_subscore}/3")


def cmd_viz(args) -> None:
    from .viz import render_pose_overlay
    session = _load_session(args)
    res = get_analyzer("pose").analyze(session)
    out_dir = _default_out(args, session)
    written = render_pose_overlay(
        session, res, out_dir,
        write_video=not args.no_video, sample_frames=args.sample_frames)
    if written["video"]:
        print(f"[viz] wrote {written['video']}")
    if written["frames"]:
        print(f"[viz] wrote {len(written['frames'])} sample frame(s) to {out_dir}")
    mix = ", ".join(f"{k} {v*100:.0f}%" for k, v in sorted(
        res.summary["posture_time_fraction"].items(), key=lambda kv: -kv[1]))
    print(f"[viz] posture mix: {mix}")


def _add_source_args(p, with_video=False):
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--stem", help="Video stem, e.g. 3, 7")
    g.add_argument("--keypoints", type=Path, help="Path to pet_keypoints_normalized.csv")
    if with_video:
        p.add_argument("--video", type=Path, default=None, help="Video to overlay on")
    p.add_argument("--out", type=Path, default=None, help="Output dir (default reports/pose_<stem>)")


def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog="petvitals", description="Pet vital/behavior analysis")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("list", help="List available analyzers").set_defaults(func=cmd_list)

    pr = sub.add_parser("run", help="Run analyzers on a session")
    _add_source_args(pr)
    pr.add_argument("--analyzers", nargs="*", default=None,
                    help=f"Subset of analyzers (default: all = {available()})")
    pr.set_defaults(func=cmd_run)

    pa = sub.add_parser("analyze", help="Raw video -> keypoints -> analyzers -> EWS")
    pa.add_argument("video", help="Path to an mp4")
    pa.add_argument("--keypoints", type=Path, default=None,
                    help="Use this normalized keypoints CSV instead of generating (skips DLC)")
    pa.add_argument("--device", default="cpu", help="DLC device for generation (cpu/cuda)")
    pa.add_argument("--analyzers", nargs="*", default=None)
    pa.add_argument("--out", type=Path, default=None)
    pa.set_defaults(func=cmd_analyze)

    pv = sub.add_parser("viz", help="Render posture overlay video/frames")
    _add_source_args(pv, with_video=True)
    pv.add_argument("--sample-frames", type=int, default=4)
    pv.add_argument("--no-video", action="store_true")
    pv.set_defaults(func=cmd_viz)
    return ap


def main(argv=None) -> None:
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
