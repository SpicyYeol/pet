"""Instantaneous heart rate (iHR) and RSA cardio-respiratory coupling.

Core of the RSA selector (see docs/research/RSA_SELECTOR_DESIGN.md): the true
cardiac rPPG signal has its rate modulated at the respiratory frequency (strong
respiratory sinus arrhythmia in dogs); a ~100-bpm motion/panting artifact is not.
So per candidate we (1) derive a *smooth* iHR track from the BVP and (2) score how
much that track is modulated in the respiratory band — a label-free discriminator
that generic signal-quality metrics lack.

Key detail proven in prototyping: naive per-frame argmax frequency tracking jumps
between the true HR and artifacts, swamping the gentle RSA modulation. We therefore
smooth the track with a Viterbi path over the spectrogram (power reward + a jump
penalty), which is what makes the RSA modulation measurable.
"""

from __future__ import annotations

import numpy as np


def _spectrogram(bvp, fs, lo, hi, win_sec, step_sec):
    x = np.asarray(bvp, dtype=float)
    w = max(4, int(win_sec * fs))
    step = max(1, int(step_sec * fs))
    hann = np.hanning(w)
    freqs = np.fft.rfftfreq(w, 1 / fs)
    band = (freqs >= lo) & (freqs <= hi)
    fb = freqs[band]
    frames, times = [], []
    for s in range(0, len(x) - w + 1, step):
        seg = (x[s:s + w] - np.mean(x[s:s + w])) * hann
        P = np.abs(np.fft.rfft(seg)) ** 2
        frames.append(P[band])
        times.append((s + w / 2) / fs)
    return np.array(times), fb, np.array(frames)  # (T,), (F,), (T,F)


def _viterbi_track_idx(P, fb, jump_penalty):
    """Smooth frequency-bin path: maximize log-power minus a quadratic jump cost."""
    T, F = P.shape
    logP = np.log(P + 1e-12)
    logP -= logP.max()
    D = fb[None, :] - fb[:, None]          # (F,F) jumps in Hz
    jump = jump_penalty * (D ** 2)
    score = np.full((T, F), -np.inf)
    back = np.zeros((T, F), dtype=int)
    score[0] = logP[0]
    for t in range(1, T):
        prev = score[t - 1][:, None] - jump   # (F_prev, F_cur)
        back[t] = np.argmax(prev, axis=0)
        score[t] = logP[t] + prev[back[t], np.arange(F)]
    path = np.zeros(T, dtype=int)
    path[-1] = int(np.argmax(score[-1]))
    for t in range(T - 1, 0, -1):
        path[t - 1] = back[t, path[t]]
    return path


def _parabolic_offset(y0, y1, y2):
    """Sub-bin peak offset in [-0.5, 0.5] from 3 log-power samples."""
    denom = (y0 - 2 * y1 + y2)
    return 0.5 * (y0 - y2) / denom if abs(denom) > 1e-12 else 0.0


def instantaneous_hr(bvp, fs, lo_hz=1.0, hi_hz=4.0, win_sec=4.0, step_sec=0.25,
                     jump_penalty=1.5):
    """Return (t_sec, ihr_bpm, ihr_fs) — a smooth, sub-bin instantaneous-HR track.

    Viterbi picks a smooth bin path (rejects artifact jumps); parabolic interpolation
    then refines each frame to sub-bin precision so the small RSA frequency modulation
    (~±10-20 bpm) survives despite the coarse FFT bin width.
    """
    t, fb, P = _spectrogram(bvp, fs, lo_hz, hi_hz, win_sec, step_sec)
    if len(t) < 3 or fb.size < 3:
        return np.array([]), np.array([]), 0.0
    idx = _viterbi_track_idx(P, fb, jump_penalty)
    df = fb[1] - fb[0]
    logP = np.log(P + 1e-12)
    freqs = np.empty(len(t))
    for i, j in enumerate(idx):
        if 0 < j < fb.size - 1:
            off = _parabolic_offset(logP[i, j - 1], logP[i, j], logP[i, j + 1])
            freqs[i] = fb[j] + np.clip(off, -0.5, 0.5) * df
        else:
            freqs[i] = fb[j]
    return t, freqs * 60.0, 1.0 / step_sec


def _bandpower_ratio(sig, fs, band):
    m = sig - np.mean(sig)
    P = np.abs(np.fft.rfft(m)) ** 2
    f = np.fft.rfftfreq(len(m), 1 / fs)
    sel = (f >= band[0]) & (f <= band[1])
    tot = P.sum() + 1e-12
    return float(P[sel].sum() / tot)


def rsa_coupling(ihr, ihr_fs, resp=None, resp_fs=None, rr_hz=None,
                 rr_band=(0.2, 0.9)):
    """Score how much iHR is modulated in the respiratory band (0..1).

    Primary: fraction of iHR-modulation power inside `rr_band` (or a narrow band
    around `rr_hz` if given). Secondary (if a respiration signal is provided):
    |correlation| of band-limited iHR modulation with resampled respiration.
    Returns dict(rsa_power_ratio, rsa_resp_corr|None, rsa_coupling).
    """
    ihr = np.asarray(ihr, dtype=float)
    if ihr.size < 6:
        return {"rsa_power_ratio": None, "rsa_resp_corr": None, "rsa_coupling": None}
    band = (max(rr_band[0], rr_hz - 0.1), min(rr_band[1], rr_hz + 0.1)) if rr_hz else rr_band
    ratio = _bandpower_ratio(ihr, ihr_fs, band)

    corr = None
    if resp is not None and resp_fs:
        # resample respiration onto the iHR time grid
        n = ihr.size
        tr = np.arange(len(resp)) / resp_fs
        ti = np.arange(n) / ihr_fs
        rr = np.interp(ti, tr, np.asarray(resp, dtype=float))

        def bp(sig):  # crude band-limit via FFT mask
            m = sig - np.mean(sig)
            F = np.fft.rfft(m); f = np.fft.rfftfreq(len(m), 1 / ihr_fs)
            F[(f < band[0]) | (f > band[1])] = 0
            return np.fft.irfft(F, len(m))
        a, b = bp(ihr), bp(rr)
        if a.std() > 1e-9 and b.std() > 1e-9:
            corr = float(abs(np.corrcoef(a, b)[0, 1]))
    coupling = ratio if corr is None else float(0.5 * ratio + 0.5 * corr)
    return {"rsa_power_ratio": round(ratio, 3),
            "rsa_resp_corr": round(corr, 3) if corr is not None else None,
            "rsa_coupling": round(coupling, 3)}


# ── self-test: synthetic FM (RSA) vs constant-rate vs artifact ────────
def _self_test():
    fs, dur = 50.0, 30.0
    t = np.arange(int(fs * dur)) / fs
    rr_hz = 0.4  # 24 breaths/min
    # (1) cardiac with RSA: HR ~150 bpm (2.5 Hz) modulated +/-0.25 Hz at rr
    f_inst = 2.5 + 0.25 * np.sin(2 * np.pi * rr_hz * t)
    phase = 2 * np.pi * np.cumsum(f_inst) / fs
    cardiac = np.sin(phase) + 0.1 * np.random.default_rng(0).standard_normal(t.size)
    # (2) constant-rate cardiac (no RSA)
    flat = np.sin(2 * np.pi * 2.5 * t) + 0.1 * np.random.default_rng(1).standard_normal(t.size)
    # (3) broadband motion artifact around ~1.7 Hz (~100 bpm)
    art = np.cumsum(np.random.default_rng(2).standard_normal(t.size))
    art = np.sin(2 * np.pi * 1.7 * t) * (1 + 0.5 * np.sin(2 * np.pi * 0.05 * t)) + 0.4 * (art / np.abs(art).max())
    resp = np.sin(2 * np.pi * rr_hz * t)
    print("[self-test] RSA coupling should be HIGH for cardiac+RSA, LOW for flat/artifact")
    for name, sig in [("cardiac+RSA", cardiac), ("flat-rate", flat), ("artifact", art)]:
        ti, ihr, ifs = instantaneous_hr(sig, fs)
        c = rsa_coupling(ihr, ifs, resp=resp, resp_fs=fs, rr_hz=rr_hz)
        print(f"  {name:12s} iHR mean={np.mean(ihr):6.1f} std={np.std(ihr):5.1f} "
              f"power_ratio={c['rsa_power_ratio']} resp_corr={c['rsa_resp_corr']} "
              f"coupling={c['rsa_coupling']}")


if __name__ == "__main__":
    _self_test()
