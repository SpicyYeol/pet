"""RSA-based HR selection: pick the candidate whose instantaneous HR is modulated at
the respiratory frequency (true cardiac RSA), within a physiological band.

Validated directionally (docs/research/RSA_SELECTOR_DESIGN.md §4b): on the 7 probe
clips this fixed, label-free rule gives MAE ~30.8 bpm vs 81.8 for SNR selection.
Extraction here is lightweight (green / g-r / CHROM on small keypoint ROIs); a
production version would reuse the A+B anatomical extractor.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

from .ihr import instantaneous_hr, rsa_coupling

_ROOT = Path(__file__).resolve().parents[2]

# thin-fur anatomical ROIs (+ panting-prone mouth ROIs as controls the selector rejects).
# NOTE: A+B extraction (multi-kp zones + panting subtraction) was tested and *regressed*
# the RSA selector (MAE 30.8 -> 48.9) — it attenuated the high-HR pulse — so the simple
# single-keypoint extraction below is the production choice. See RSA_SELECTOR_DESIGN §4c.
ROIS = ["throat_base", "left_earbase", "right_earbase", "nose", "upper_jaw",
        "lower_jaw", "mouth_end_left", "mouth_end_right"]


def _bandpass(x, fs, lo=0.7, hi=4.0):
    from scipy.signal import butter, filtfilt
    b, a = butter(3, [lo / (fs / 2), hi / (fs / 2)], btype="band")
    return filtfilt(b, a, x)


def _peak_bpm_snr(sig, fs, lo=50, hi=240):
    m = sig - sig.mean(); P = np.abs(np.fft.rfft(m)) ** 2
    f = np.fft.rfftfreq(len(m), 1 / fs) * 60
    band = (f >= lo) & (f <= hi)
    if not band.any():
        return np.nan, 0.0
    fb, Pb = f[band], P[band]
    k = int(np.argmax(Pb)); sig_pow = Pb[max(0, k - 1):k + 2].sum()
    return float(fb[k]), float(10 * np.log10(sig_pow / (Pb.sum() - sig_pow + 1e-9)))


def _methods(R, G, B):
    yield "green", G
    yield "g_minus_r", G - R
    Rn, Gn, Bn = [c / (np.mean(c) + 1e-9) for c in (R, G, B)]
    x = 3 * Rn - 2 * Gn; y = 1.5 * Rn + Gn - 1.5 * Bn
    yield "chrom", x - (np.std(x) / (np.std(y) + 1e-9)) * y


def _extract_rgb(video_path, kps_df, rois, rad=8):
    import cv2
    cen = {r: {} for r in rois}
    for r in rois:
        g = kps_df[(kps_df.keypoint == r) & (kps_df.confidence > 0.3)]
        for row in g.itertuples():
            cen[r][int(row.frame_index)] = (row.x, row.y)
    cap = cv2.VideoCapture(str(video_path))
    fs = cap.get(cv2.CAP_PROP_FPS) or 10.0
    rgb = {r: [] for r in rois}; fi = 0
    while True:
        ok, img = cap.read()
        if not ok:
            break
        h, w = img.shape[:2]
        for r in rois:
            c = cen[r].get(fi)
            if c is None:
                rgb[r].append([np.nan] * 3); continue
            x, y = int(c[0]), int(c[1])
            patch = img[max(0, y - rad):min(h, y + rad), max(0, x - rad):min(w, x + rad)]
            rgb[r].append(patch.reshape(-1, 3).mean(0)[::-1] if patch.size else [np.nan] * 3)
        fi += 1
    cap.release()
    return rgb, fs


def estimate_hr_rsa(session, hr_band=(70.0, 220.0)) -> dict:
    """RSA-selected HR for a Session (needs video + keypoints). Returns {} if unavailable."""
    if session.video_path is None or session.keypoints_path is None:
        return {}
    try:
        import pandas as pd
        if str(_ROOT / "tools") not in sys.path:
            sys.path.insert(0, str(_ROOT / "tools"))
        import dual_respiratory_proxies as drp
        kps = pd.read_csv(session.keypoints_path)
        n = int(kps["frame_index"].nunique())
        rgb, fs = _extract_rgb(session.video_path, kps, ROIS)
        resp = drp.compute_thoracic_breathing_proxy(kps, n)      # RSA target (thoracic)
        rrate, _ = drp.estimate_thoracic_breathing_rate(resp, fs)
        rr_hz = rrate / 60.0 if np.isfinite(rrate) and rrate > 0 else None
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}

    import pandas as pd
    cands = []
    for r, series in rgb.items():
        arr = np.asarray(series, float)
        if np.isnan(arr).mean() > 0.4:
            continue
        arr = pd.DataFrame(arr).interpolate().bfill().ffill().values
        R, G, B = arr[:, 0], arr[:, 1], arr[:, 2]
        for mname, raw in _methods(R, G, B):
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
            c = rsa_coupling(ihr, ifs, resp=resp, resp_fs=fs, rr_hz=rr_hz)
            if c["rsa_coupling"] is None:
                continue
            cands.append((r, mname, bpm, snr, c["rsa_coupling"]))
    if not cands:
        return {}
    df = pd.DataFrame(cands, columns=["roi", "method", "bpm", "snr", "rsa"])
    plaus = df[(df.bpm >= hr_band[0]) & (df.bpm <= hr_band[1])]
    pick = (plaus if len(plaus) else df).sort_values("rsa", ascending=False).iloc[0]
    return {"hr_bpm": round(float(pick.bpm), 1), "hr_rsa_coupling": round(float(pick.rsa), 3),
            "hr_roi": pick.roi, "hr_method": f"rsa:{pick.method}",
            "n_candidates": int(len(df)), "rr_bpm_thoracic": round(float(rrate), 1)}
