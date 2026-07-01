"""Physiology-grounded signal-quality features for cardiac-vs-artifact selection.

Each targets a property a real cardiac pulse has and a motion/respiratory artifact
lacks. Used alongside RSA coupling (ihr.py) — see docs/research/RSA_SELECTOR_DESIGN.md
and tools/eval_physio_sqi.py for the ablation.
"""

from __future__ import annotations

import numpy as np


def skewness_sqi(sig) -> float:
    """PPG pulses are asymmetric (fast upstroke, slow decay) -> non-zero skew;
    a sinusoidal artifact is symmetric. |skew| of the signal (Elgendi-style)."""
    s = np.asarray(sig, float); s = s - s.mean()
    sd = s.std()
    return float(abs(np.mean((s / (sd + 1e-9)) ** 3)))


def periodicity_sqi(sig, fs, bpm) -> float:
    """Autocorrelation at the expected beat period: high = truly periodic pulse."""
    lag = int(round(fs * 60.0 / bpm))
    s = np.asarray(sig, float); s = s - s.mean()
    if lag < 2 or lag >= len(s):
        return 0.0
    ac = np.correlate(s, s, "full")[len(s) - 1:]
    return float(ac[lag] / (ac[0] + 1e-9))


def perfusion_index(ac_sig, dc) -> float:
    """Pulsatility = AC amplitude / DC. Very low = not perfused (artifact)."""
    return float(np.std(np.asarray(ac_sig, float)) / (abs(dc) + 1e-9))


def harmonic_plv(sig, fs, bpm, nseg=6) -> float:
    """Phase-locking between fundamental and 2nd harmonic. A real periodic pulse is
    non-sinusoidal with phase-locked harmonics; an artifact's harmonics are not locked."""
    f0 = bpm / 60.0
    n = len(sig) // nseg
    if n < int(fs):
        return 0.0
    phis = []
    for i in range(nseg):
        seg = np.asarray(sig[i * n:(i + 1) * n], float)
        F = np.fft.rfft((seg - seg.mean()) * np.hanning(len(seg)))
        f = np.fft.rfftfreq(len(seg), 1 / fs)
        i0 = int(np.argmin(abs(f - f0))); i1 = int(np.argmin(abs(f - 2 * f0)))
        phis.append(np.angle(F[i1]) - 2 * np.angle(F[i0]))
    return float(abs(np.mean(np.exp(1j * np.array(phis)))))


def lf_coupling(ihr, ihr_fs, band=(0.04, 0.15)) -> float:
    """iHR modulation in the Mayer-wave / LF band (baroreflex, ~0.1 Hz)."""
    m = np.asarray(ihr, float)
    if len(m) < 8:
        return 0.0
    m = m - m.mean(); P = np.abs(np.fft.rfft(m)) ** 2
    f = np.fft.rfftfreq(len(m), 1 / ihr_fs)
    sel = (f >= band[0]) & (f <= band[1])
    return float(P[sel].sum() / (P.sum() + 1e-9))


def riiv_rr(sig, fs, rr_band=(0.15, 1.5)):
    """Respiration from the pulse itself: breathing modulates rPPG *amplitude* (RIIV).
    Returns (rr_bpm, quality) from the peak of the amplitude-envelope spectrum in the
    RR band — an independent RR estimate to cross-check the keypoint chest proxy."""
    from scipy.signal import hilbert
    s = np.asarray(sig, float)
    env = np.abs(hilbert(s - s.mean())); env = env - env.mean()
    P = np.abs(np.fft.rfft(env * np.hanning(len(env)))) ** 2
    f = np.fft.rfftfreq(len(env), 1 / fs)
    sel = (f >= rr_band[0]) & (f <= rr_band[1])
    if not sel.any():
        return None, 0.0
    fb, Pb = f[sel], P[sel]; k = int(np.argmax(Pb))
    return float(fb[k] * 60), float(Pb[k] / (Pb.mean() + 1e-9))


def rsa_amplitude(ihr, ihr_fs, rr_hz=None, rr_band=(0.2, 0.9)) -> float:
    """RSA magnitude = the HR swing (bpm) at the respiratory frequency = a vagal-tone
    index (reduced in cardiac disease/pain/deep anesthesia)."""
    m = np.asarray(ihr, float)
    if len(m) < 6:
        return 0.0
    m = m - m.mean()
    band = (max(rr_band[0], rr_hz - 0.1), min(rr_band[1], rr_hz + 0.1)) if rr_hz else rr_band
    F = np.fft.rfft(m); f = np.fft.rfftfreq(len(m), 1 / ihr_fs)
    F[(f < band[0]) | (f > band[1])] = 0
    y = np.fft.irfft(F, len(m))
    return float(np.percentile(y, 95) - np.percentile(y, 5))


def vasomotion_index(dc_sig, fs, band=(0.05, 0.15)) -> float:
    """Myogenic-band (~0.05-0.15 Hz) oscillation fraction of the ROI baseline/DC =
    microcirculation vasomotion. (Short clips capture only the myogenic band; the
    slower endothelial/neurogenic bands need minutes.)"""
    s = np.asarray(dc_sig, float); s = s - s.mean()
    P = np.abs(np.fft.rfft(s * np.hanning(len(s)))) ** 2
    f = np.fft.rfftfreq(len(s), 1 / fs)
    tot = P[(f >= 0.01) & (f <= 1.5)].sum() + 1e-9
    return float(P[(f >= band[0]) & (f <= band[1])].sum() / tot)


def multisite_phase(bpm, roi_sigs, fs) -> float:
    """Power-weighted phase resultant across ROIs at the candidate frequency. A real
    pulse appears coherently in several vascular ROIs; a local artifact does not."""
    f0 = bpm / 60.0; ws, phs = [], []
    for s in roi_sigs:
        s = np.asarray(s, float)
        F = np.fft.rfft((s - s.mean()) * np.hanning(len(s)))
        f = np.fft.rfftfreq(len(s), 1 / fs)
        k = int(np.argmin(abs(f - f0)))
        ws.append(abs(F[k])); phs.append(np.angle(F[k]))
    ws = np.array(ws); phs = np.array(phs)
    if len(ws) < 3 or ws.sum() < 1e-9:
        return 0.0
    return float(abs(np.sum(ws * np.exp(1j * phs)) / ws.sum()))
