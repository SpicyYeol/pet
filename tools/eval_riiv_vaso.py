#!/usr/bin/env python3
"""Test RIIV (pulse-derived respiration), RSA amplitude (vagal index), and vasomotion
(microcirculation) on the RSA-selected candidate per clip.

Validatable part: RIIV-RR (from the pulse) vs the keypoint thoracic-proxy RR — two
INDEPENDENT respiration estimates; agreement = evidence of validity (no RR ground truth).

    python tools/eval_riiv_vaso.py
"""
from __future__ import annotations
import sys
from pathlib import Path
import numpy as np, pandas as pd

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT)); sys.path.insert(0, str(_ROOT / "tools"))
from petvitals.core.session import Session  # noqa: E402
from petvitals.core.keypoints import resolve_keypoints_path  # noqa: E402
from petvitals.signal.ihr import instantaneous_hr, rsa_coupling  # noqa: E402
from petvitals.signal import sqi  # noqa: E402
from petvitals.signal.rsa_select import _extract_rgb, ROIS, _bandpass, _methods, _peak_bpm_snr  # noqa: E402
import dual_respiratory_proxies as drp  # noqa: E402

TARGET = {"1": 175, "3": 210, "4": 115.5, "5": 135, "6": 90, "7": 189.5, "8": 110.5}


def best_candidate(stem):
    sess = Session.from_stem(stem)
    kps = pd.read_csv(sess.keypoints_path); n = int(kps["frame_index"].nunique())
    rgb, fs = _extract_rgb(sess.video_path, kps, ROIS)
    resp = drp.compute_thoracic_breathing_proxy(kps, n)
    rrate, _ = drp.estimate_thoracic_breathing_rate(resp, fs)
    rr_hz = rrate / 60.0 if np.isfinite(rrate) and rrate > 0 else None
    best = None
    for r, series in rgb.items():
        arr = np.asarray(series, float)
        if np.isnan(arr).mean() > 0.4:
            continue
        arr = pd.DataFrame(arr).interpolate().bfill().ffill().values
        R, G, B = arr[:, 0], arr[:, 1], arr[:, 2]
        for m, raw in _methods(R, G, B):
            try:
                sig = _bandpass(raw, fs)
            except Exception:
                continue
            bpm, snr = _peak_bpm_snr(sig, fs)
            if not (np.isfinite(bpm) and 70 <= bpm <= 220):
                continue
            t, ihr, ifs = instantaneous_hr(sig, fs)
            if not len(ihr):
                continue
            rc = rsa_coupling(ihr, ifs, resp=resp, resp_fs=fs, rr_hz=rr_hz)["rsa_coupling"] or 0.0
            cand = (rc, sig, ihr, ifs, G)
            if best is None or rc > best[0]:
                best = cand
    return best, fs, rr_hz, rrate


def main():
    print("stem  HRtgt   RIIV-RR  thoracic-RR  |Δ|   RSA-amp(bpm)  vasomotion")
    dd = []
    for s in TARGET:
        if resolve_keypoints_path(s) is None:
            continue
        best, fs, rr_hz, rrate = best_candidate(s)
        if best is None:
            print(f"  {s}   n/a"); continue
        rc, sig, ihr, ifs, G = best
        riiv, q = sqi.riiv_rr(sig, fs)
        rsa_amp = sqi.rsa_amplitude(ihr, ifs, rr_hz)
        vaso = sqi.vasomotion_index(G, fs)
        d = abs(riiv - rrate) if (riiv and np.isfinite(rrate)) else np.nan
        dd.append(d)
        print(f"  {s}   {TARGET[s]:6.1f}   {riiv:6.1f}    {rrate:6.1f}    {d:4.0f}    "
              f"{rsa_amp:8.1f}     {vaso:.2f}")
    dd = [x for x in dd if np.isfinite(x)]
    if dd:
        print(f"\n[RIIV vs thoracic RR]  mean |Δ| = {np.mean(dd):.1f} brpm  (independent RR cross-check)")
        print("  small Δ => the pulse-derived RR agrees with the keypoint chest proxy = validated RR")


if __name__ == "__main__":
    main()
