#!/usr/bin/env python3
"""Ablation: which physiological SQI best selects the true-HR candidate (and fixes
stem 7)? Extract ROI x method candidates, compute every SQI, then for each selection
rule report held-out MAE vs targets.

    python tools/eval_physio_sqi.py
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
FEATURES = ["rsa", "skew", "period", "pi", "plv", "lf", "multisite", "snr"]


def candidates(stem):
    sess = Session.from_stem(stem)
    kps = pd.read_csv(sess.keypoints_path); n = int(kps["frame_index"].nunique())
    rgb, fs = _extract_rgb(sess.video_path, kps, ROIS)
    resp = drp.compute_thoracic_breathing_proxy(kps, n)
    rrate, _ = drp.estimate_thoracic_breathing_rate(resp, fs)
    rr_hz = rrate / 60.0 if np.isfinite(rrate) and rrate > 0 else None
    # green bandpassed per ROI for the multisite metric
    green = {}
    rows = []
    for r, series in rgb.items():
        arr = np.asarray(series, float)
        if np.isnan(arr).mean() > 0.4:
            continue
        arr = pd.DataFrame(arr).interpolate().bfill().ffill().values
        R, G, B = arr[:, 0], arr[:, 1], arr[:, 2]
        try:
            green[r] = _bandpass(G, fs)
        except Exception:
            pass
        for m, raw in _methods(R, G, B):
            try:
                sig = _bandpass(raw, fs)
            except Exception:
                continue
            bpm, snr = _peak_bpm_snr(sig, fs)
            if not np.isfinite(bpm):
                continue
            t, ihr, ifs = instantaneous_hr(sig, fs)
            if not len(ihr):
                continue
            rc = rsa_coupling(ihr, ifs, resp=resp, resp_fs=fs, rr_hz=rr_hz)
            rows.append({"roi": r, "method": m, "bpm": round(bpm, 1), "snr": snr,
                         "rsa": rc["rsa_coupling"] or 0.0,
                         "skew": sqi.skewness_sqi(sig),
                         "period": sqi.periodicity_sqi(sig, fs, bpm),
                         "pi": sqi.perfusion_index(sig, G.mean()),
                         "plv": sqi.harmonic_plv(sig, fs, bpm),
                         "lf": sqi.lf_coupling(ihr, ifs),
                         "sig": sig, "fs": fs})
    # multisite phase for each candidate at its own bpm
    roi_greens = list(green.values())
    for row in rows:
        row["multisite"] = sqi.multisite_phase(row["bpm"], roi_greens, row["fs"]) if len(roi_greens) >= 3 else 0.0
    df = pd.DataFrame(rows)
    return df, TARGET[stem]


def main():
    stems = [s for s in TARGET if resolve_keypoints_path(s)]
    COMBOS = ["rsa*plv", "2z(rsa)+z(plv)", "rsa_top3->plv",
              "plvVeto->rsa", "lfVeto->rsa"]
    ALL = FEATURES + COMBOS
    per_feat = {f: [] for f in ALL}
    stem7 = {}
    for s in stems:
        df, tgt = candidates(s)
        plaus = df[(df.bpm >= 70) & (df.bpm <= 220)].copy()
        pool = (plaus if len(plaus) else df.copy()).reset_index(drop=True)

        def z(c):
            v = pd.to_numeric(pool[c], errors="coerce"); return (v - v.mean()) / (v.std(ddof=0) + 1e-9)
        pool["rsa*plv"] = pool.rsa * pool.plv
        pool["z(rsa)+z(plv)"] = z("rsa") + z("plv")
        pool["2z(rsa)+z(plv)"] = 2 * z("rsa") + z("plv")
        pool["rsa*plv*lf"] = pool.rsa * pool.plv * (pool.lf + 1e-3)

        def pick_of(f):
            if f == "rsa_top3->plv":       # among top-3 by RSA, take highest harmonic PLV
                top = pool.sort_values("rsa", ascending=False).head(3)
                return top.sort_values("plv", ascending=False).iloc[0]
            if f == "plvVeto->rsa":        # keep real pulses (PLV>=median), rank by RSA
                v = pool[pool.plv >= pool.plv.median()]
                return (v if len(v) else pool).sort_values("rsa", ascending=False).iloc[0]
            if f == "lfVeto->rsa":
                v = pool[pool.lf >= pool.lf.median()]
                return (v if len(v) else pool).sort_values("rsa", ascending=False).iloc[0]
            return pool.sort_values(f, ascending=False).iloc[0]
        for f in ALL:
            p = pick_of(f)
            per_feat[f].append(abs(p.bpm - tgt))
            if s == "7":
                stem7[f] = (p.bpm, round(abs(p.bpm - tgt), 1))
    print("feature          MAE    (lower=better; RSA-alone baseline 30.8)")
    for f in ALL:
        print(f"  {f:16s} {np.mean(per_feat[f]):6.1f}")
    print("\nstem 7 (target 189.5) pick by feature:")
    for f, (b, e) in stem7.items():
        print(f"  {f:12s} bpm={b:6.1f}  err={e}")


if __name__ == "__main__":
    main()
