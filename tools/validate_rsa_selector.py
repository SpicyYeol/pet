#!/usr/bin/env python3
"""Directional test: does RSA coupling prefer the near-true-HR candidate over the
~100-bpm artifact? Lightweight extraction of multiple ROI x method candidates from a
probe video + keypoints, then rank by SNR vs by RSA coupling and compare to target.

    python tools/validate_rsa_selector.py --stems 3 6 7
"""
from __future__ import annotations
import argparse, sys
from pathlib import Path
import numpy as np, pandas as pd, cv2
from scipy.signal import butter, filtfilt

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT)); sys.path.insert(0, str(_ROOT / "tools"))
from petvitals.signal import instantaneous_hr, rsa_coupling  # noqa: E402
import dual_respiratory_proxies as drp  # noqa: E402

TARGET = {"1": 175, "3": 210, "4": 115.5, "5": 135, "6": 90, "7": 189.5, "8": 110.5}
ROIS = ["throat_base", "left_earbase", "right_earbase", "nose", "upper_jaw",
        "lower_jaw", "mouth_end_left", "mouth_end_right"]  # last few are panting/motion-prone


def _resolve(stem):
    for p in [f"reports/rppg_pet_keypoints/dlc_probe_{stem}_gpu",
              f"reports/rppg_pet_keypoints/dlc_probe_{stem}", "reports/rppg_pet_keypoints/dlc_full4"]:
        d = _ROOT / p
        csv = d / "pet_keypoints_normalized.csv"
        vids = list(d.glob("*_dlc_probe.mp4"))
        if csv.exists() and vids:
            return csv, vids[0]
    return None, None


def _bp(x, fs, lo=0.7, hi=4.0):
    b, a = butter(3, [lo / (fs / 2), hi / (fs / 2)], btype="band")
    return filtfilt(b, a, x)


def _peak_bpm_snr(sig, fs, lo=50, hi=240):
    m = sig - sig.mean(); P = np.abs(np.fft.rfft(m)) ** 2
    f = np.fft.rfftfreq(len(m), 1 / fs) * 60
    band = (f >= lo) & (f <= hi)
    if not band.any():
        return np.nan, 0.0
    fb, Pb = f[band], P[band]
    k = int(np.argmax(Pb)); bpm = fb[k]
    sig_pow = Pb[max(0, k - 1):k + 2].sum()
    snr = 10 * np.log10(sig_pow / (Pb.sum() - sig_pow + 1e-9))
    return float(bpm), float(snr)


def extract(stem):
    csv, vid = _resolve(stem)
    if csv is None:
        return None
    kps = pd.read_csv(csv)
    n = int(kps["frame_index"].nunique())
    # per-frame keypoint centers
    cen = {r: {} for r in ROIS}
    for r in ROIS:
        g = kps[(kps.keypoint == r) & (kps.confidence > 0.3)]
        for row in g.itertuples():
            cen[r][int(row.frame_index)] = (row.x, row.y)
    cap = cv2.VideoCapture(str(vid)); fs = cap.get(cv2.CAP_PROP_FPS) or 10.0
    rgb = {r: [] for r in ROIS}
    fi = 0
    while True:
        ok, img = cap.read()
        if not ok:
            break
        h, w = img.shape[:2]
        for r in ROIS:
            c = cen[r].get(fi)
            if c is None:
                rgb[r].append([np.nan] * 3); continue
            x, y = int(c[0]), int(c[1]); rad = 8
            patch = img[max(0, y - rad):min(h, y + rad), max(0, x - rad):min(w, x + rad)]
            rgb[r].append(patch.reshape(-1, 3).mean(0)[::-1] if patch.size else [np.nan] * 3)  # BGR->RGB
        fi += 1
    cap.release()
    resp = drp.compute_thoracic_breathing_proxy(kps, n)
    return rgb, fs, resp


def methods(R, G, B):
    yield "green", G
    yield "g_minus_r", G - R
    # simple CHROM
    Rn, Gn, Bn = [c / (np.mean(c) + 1e-9) for c in (R, G, B)]
    x = 3 * Rn - 2 * Gn; y = 1.5 * Rn + Gn - 1.5 * Bn
    yield "chrom", x - (np.std(x) / (np.std(y) + 1e-9)) * y


def run(stem):
    out = extract(stem)
    if out is None:
        print(f"stem {stem}: no data"); return None
    rgb, fs, resp = out
    rr_hz = None
    rrate, _ = drp.estimate_thoracic_breathing_rate(resp, fs)
    if np.isfinite(rrate) and rrate > 0:
        rr_hz = rrate / 60.0
    cands = []
    for r, series in rgb.items():
        arr = np.asarray(series, float)
        if np.isnan(arr).mean() > 0.4:
            continue
        arr = pd.DataFrame(arr).interpolate().bfill().ffill().values
        R, G, B = arr[:, 0], arr[:, 1], arr[:, 2]
        for mname, raw in methods(R, G, B):
            try:
                sig = _bp(raw, fs)
            except Exception:
                continue
            bpm, snr = _peak_bpm_snr(sig, fs)
            if not np.isfinite(bpm):
                continue
            t, ihr, ifs = instantaneous_hr(sig, fs)
            c = rsa_coupling(ihr, ifs, resp=resp, resp_fs=fs, rr_hz=rr_hz) if len(ihr) else {"rsa_coupling": None}
            cands.append({"roi": r, "method": mname, "bpm": round(bpm, 1), "snr": round(snr, 1),
                          "rsa": c["rsa_coupling"], "err": round(abs(bpm - TARGET[stem]), 1)})
    df = pd.DataFrame(cands).dropna(subset=["rsa"])
    if df.empty:
        print(f"stem {stem}: no candidates"); return None
    def z(s):
        s = pd.to_numeric(s, errors="coerce"); return (s - s.mean()) / (s.std(ddof=0) + 1e-9)
    df = df.copy()
    df["combined"] = z(df.snr) + z(df.rsa)           # SNR + RSA
    by_snr = df.sort_values("snr", ascending=False).iloc[0]
    by_rsa = df.sort_values("rsa", ascending=False).iloc[0]
    # RSA within a physiological HR band (dogs ~70-220; excludes sub-harmonic artifacts)
    plaus = df[(df.bpm >= 70) & (df.bpm <= 220)]
    by_rsa_p = (plaus if len(plaus) else df).sort_values("rsa", ascending=False).iloc[0]
    oracle = df.sort_values("err").iloc[0]
    print(f"\n=== stem {stem}  target {TARGET[stem]}  RR~{rrate:.0f}/min  ({len(df)} candidates) ===")
    print(f"  pick by SNR          : bpm={by_snr.bpm:6.1f}  err={by_snr.err:5.1f}")
    print(f"  pick by RSA          : bpm={by_rsa.bpm:6.1f}  err={by_rsa.err:5.1f}")
    print(f"  pick by RSA+plausible: bpm={by_rsa_p.bpm:6.1f}  err={by_rsa_p.err:5.1f}")
    print(f"  oracle best          : bpm={oracle.bpm:6.1f}  err={oracle.err:5.1f}")
    return by_snr.err, by_rsa.err, by_rsa_p.err, oracle.err


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stems", nargs="+", default=["3", "6", "7"])
    args = ap.parse_args()
    res = [run(s) for s in args.stems]
    res = [r for r in res if r]
    if res:
        a = np.array(res)
        print(f"\n[summary] MAE  by-SNR={a[:,0].mean():.1f}  by-RSA={a[:,1].mean():.1f}  "
              f"by-RSA+plausible={a[:,2].mean():.1f}  oracle={a[:,3].mean():.1f}  (n={len(res)})")


if __name__ == "__main__":
    main()
