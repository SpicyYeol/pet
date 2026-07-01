#!/usr/bin/env python3
"""Ballistocardiography (BCG) from keypoint micro-motion — an INDEPENDENT HR channel
(motion, not color) to cross-check rPPG. Cardiac ejection recoils the body at the HR;
extract it from stable trunk keypoints, band-pass in the HR band, and read the peak.

    python tools/eval_bcg.py

RESULT (honest negative): this does not work on the available data. On 10 fps DLC
keypoints, MAE ~73 (3 stems n/a). On the 30 fps originals via sub-pixel phase-
correlation of a torso ROI, it locks onto ~72-82 bpm regardless of target — i.e. gross
body / respiratory motion, not the cardiac recoil. The recoil is too small relative to
a freely-moving (anesthetized, hand-held) dog's gross motion. Viable BCG here would need
torso stabilization + motion source-separation (cardiac vs gross vs respiratory), or a
contact/radar BCG sensor. rPPG + RSA (MAE 30.8) remains the working HR channel.
"""
from __future__ import annotations
import sys
from pathlib import Path
import numpy as np, pandas as pd
from scipy.signal import butter, filtfilt, detrend

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))
from petvitals.core.keypoints import resolve_keypoints_path, load_frames, pt  # noqa: E402
from petvitals.core.geometry import body_scale  # noqa: E402

TARGET = {"1": 175, "3": 210, "4": 115.5, "5": 135, "6": 90, "7": 189.5, "8": 110.5}
# stable, cardiac-recoil-bearing trunk points (avoid head/mouth = panting motion)
BODY = ["neck_base", "back_base", "back_middle", "back_end", "tail_base",
        "body_middle_left", "body_middle_right"]


def bcg_hr(stem):
    csv = resolve_keypoints_path(stem)
    frames, idx, times, fs = load_frames(csv)
    n = len(frames)
    scale = np.nanmedian([body_scale(f, 0.3) or np.nan for f in frames])
    if not np.isfinite(scale):
        scale = 200.0
    # per-keypoint x,y displacement series (normalized), gaps interpolated
    sigs = []
    for k in BODY:
        xs = np.array([(pt(f, k, 0.3)[0] if pt(f, k, 0.3) is not None else np.nan) for f in frames])
        ys = np.array([(pt(f, k, 0.3)[1] if pt(f, k, 0.3) is not None else np.nan) for f in frames])
        for s in (xs, ys):
            if np.isnan(s).mean() > 0.4:
                continue
            s = pd.Series(s).interpolate().bfill().ffill().values / scale
            sigs.append(detrend(s))
    if len(sigs) < 3:
        return None
    # band-pass each in the HR band, aggregate power spectra
    lo, hi = 1.0, min(4.0, fs / 2 - 0.1)
    b, a = butter(3, [lo / (fs / 2), hi / (fs / 2)], btype="band")
    Psum = None; L = min(len(s) for s in sigs)
    for s in sigs:
        y = filtfilt(b, a, s[:L])
        P = np.abs(np.fft.rfft((y - y.mean()) * np.hanning(len(y)))) ** 2
        Psum = P if Psum is None else Psum + P
    f = np.fft.rfftfreq(L, 1 / fs) * 60
    band = (f >= 70) & (f <= 220)
    if not band.any():
        return None
    fb, Pb = f[band], Psum[band]
    k = int(np.argmax(Pb))
    prom = float(Pb[k] / (Pb.mean() + 1e-9))   # peak prominence = quality
    return float(fb[k]), prom, fs


def main():
    print("stem  target   BCG_HR   err    quality   (fs)")
    errs = []
    for s, tgt in TARGET.items():
        if resolve_keypoints_path(s) is None:
            continue
        r = bcg_hr(s)
        if r is None:
            print(f"  {s}   {tgt:6.1f}   n/a"); continue
        hr, q, fs = r; e = abs(hr - tgt); errs.append(e)
        print(f"  {s}   {tgt:6.1f}   {hr:6.1f}  {e:5.1f}   {q:5.1f}   ({fs:.0f}fps)")
    if errs:
        print(f"\n[BCG] MAE = {np.mean(errs):.1f} bpm  (rPPG-RSA was 30.8; oracle 10.1)")
        print("  BCG is an INDEPENDENT (motion) channel -> value is cross-check, not standalone accuracy")


if __name__ == "__main__":
    main()
