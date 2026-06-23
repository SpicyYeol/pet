#!/usr/bin/env python3
"""
Dog-Specific rPPG Signal Model (Highest Leverage Improvement)

Current baseline methods (green, g-r, CHROM, POS, PCA, ICA) are designed for human skin reflectance.

Dog-specific challenges:
- Fur scatters and attenuates light differently than human skin.
- Thin-fur regions (ears, muzzle, throat) still have different pigmentation and subsurface scattering.
- High HR (often 160-220 bpm) + strong panting artifact.

This module provides a data-driven "DogChrom" or "DogPOS" style model:
- Learns optimal linear combination weights for normalized RGB on actual dog data.
- Can be tuned to maximize SNR at the known HR band or periodicity strength.
- Designed to be dropped in as a new method alongside the existing ones.

Key idea for highest leverage:
Instead of hand-crafted human chrominance (e.g., CHROM: 3R-2G, POS: orthogonal to skin tone),
we optimize w = [w_r, w_g, w_b] on many good windows from our dog videos to maximize
the quality of the extracted pulse at the approximate ground-truth HR.

This is the practical "강아지 전용 신호 모델" with only RGB video.

Usage:
    from tools.dog_specific_rppg import sig_dog_learned, learn_dog_weights

    # One-time learning on your best windows
    weights = learn_dog_weights(good_rgb_windows, target_bpms)

    # Then use in the pipeline
    pulse = sig_dog_learned(rgb_window, fs, min_bpm, max_bpm, weights=weights)
"""

from __future__ import annotations

from typing import List, Tuple, Optional

import numpy as np
from scipy import signal, optimize


def _get_rppg_helpers():
    """Lazy import to avoid circular dependency with evaluate_rppg_methods (which may import us)."""
    try:
        from evaluate_rppg_methods import safe_bandpass, normalize_rgb, estimate_bpm_from_signal
        return safe_bandpass, normalize_rgb, estimate_bpm_from_signal
    except Exception:
        try:
            from tools.evaluate_rppg_methods import safe_bandpass, normalize_rgb, estimate_bpm_from_signal
            return safe_bandpass, normalize_rgb, estimate_bpm_from_signal
        except Exception:
            # Minimal fallbacks (rare)
            def _safe_bandpass(x, fs, lo, hi):
                from scipy import signal as _sig
                x = np.asarray(x, float)
                x = x - np.mean(x)
                sos = _sig.butter(4, [lo/60, min(hi/60, 0.45*fs)], btype="band", fs=fs, output="sos")
                return _sig.sosfiltfilt(sos, x)
            def _normalize_rgb(rgb):
                rgb = np.asarray(rgb, float)
                m = np.mean(rgb, axis=0, keepdims=True)
                s = np.std(rgb, axis=0, keepdims=True) + 1e-9
                return (rgb - m) / s
            def _estimate_bpm_from_signal(x, fs, lo, hi):
                x = np.asarray(x, float) - np.mean(x)
                nfft = int(2 ** np.ceil(np.log2(max(len(x), 64))) * 4)
                freqs, power = signal.periodogram(x, fs=fs, window="hann", nfft=nfft)
                mask = (freqs >= lo/60) & (freqs <= min(hi/60, fs*0.45))
                if mask.sum() < 3: return np.nan, np.nan, np.nan
                bp = power[mask]
                idx = int(np.argmax(bp))
                pf = freqs[mask][idx]
                snr = float(bp[idx] / (np.median(bp) + 1e-12))
                return pf*60, snr, float(bp[idx] / (np.sum(bp)+1e-12))
            return _safe_bandpass, _normalize_rgb, _estimate_bpm_from_signal


def sig_dog_learned(
    rgb: np.ndarray,
    fs: float,
    min_bpm: float,
    max_bpm: float,
    weights: Optional[np.ndarray] = None,
) -> np.ndarray:
    """
    Dog-optimized linear projection of normalized RGB.

    If weights is None, falls back to a reasonable default tuned on our dog data
    (you should call learn_dog_weights on your dataset for best results).
    """
    _, normalize_rgb, _ = _get_rppg_helpers()
    norm = normalize_rgb(rgb)

    if weights is None:
        # Recommended default (trained with combined_correct objective that directly targets low BPM error vs ground truth)
        weights = np.array([0.286, -0.7886, 0.5443])

    w = np.asarray(weights, dtype=float)
    w = w / (np.linalg.norm(w) + 1e-9)

    projected = np.dot(norm, w)

    safe_bandpass, _, _ = _get_rppg_helpers()
    return safe_bandpass(projected, fs, min_bpm, max_bpm)


def periodicity_strength(x: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> float:
    """Simple proxy for how periodic the signal is in the HR band."""
    if len(x) < 20:
        return 0.0
    x = x - np.mean(x)
    ac = np.correlate(x, x, mode='full')
    ac = ac[len(x)-1:]
    lo = int(fs * 60 / max_bpm)
    hi = int(fs * 60 / min_bpm)
    if hi >= len(ac):
        hi = len(ac) - 1
    if lo >= hi:
        return 0.0
    peak = np.max(ac[lo:hi])
    noise = np.median(ac[lo:hi]) + 1e-12
    return float(peak / noise)


def band_power_ratio(x: np.ndarray, fs: float, target_bpm: float, artifact_band: tuple[float, float] = (90, 115), bandwidth: float = 8.0) -> float:
    """
    Stronger objective for dog data:
    Power in narrow band around target HR  /  Power in artifact band (90-115 bpm)
    Higher is better.
    """
    x = np.asarray(x, dtype=float)
    if len(x) < 30:
        return 0.0

    x = x - np.mean(x)
    nfft = int(2 ** np.ceil(np.log2(len(x))) * 4)
    freqs, power = signal.periodogram(x, fs=fs, window="hann", nfft=nfft)

    # Target band
    lo_t = (target_bpm - bandwidth/2) / 60.0
    hi_t = (target_bpm + bandwidth/2) / 60.0
    mask_t = (freqs >= lo_t) & (freqs <= hi_t)
    target_power = np.sum(power[mask_t]) + 1e-12

    # Artifact band
    lo_a, hi_a = artifact_band
    mask_a = (freqs >= lo_a/60) & (freqs <= hi_a/60)
    artifact_power = np.sum(power[mask_a]) + 1e-12

    return float(target_power / artifact_power)


def bpm_correctness_score(est_bpm: float, target_bpm: float, max_err: float = 60.0) -> float:
    """
    Higher score when estimated BPM is close to the known ground truth.
    This is the direct 'HR 정답' term the user wants.
    """
    if not np.isfinite(est_bpm) or not np.isfinite(target_bpm):
        return 0.0
    err = abs(est_bpm - target_bpm)
    # Smooth inverse error, capped
    return float(max(0.0, 1.0 - min(err, max_err) / max_err))


def learn_dog_weights(
    rgb_windows: List[np.ndarray],
    target_bpms: List[float],
    fs: float = 10.0,
    min_bpm: float = 70.0,
    max_bpm: float = 240.0,
    method: str = "combined_correct",   # "snr" | "band_power" | "combined" | "correctness" | "combined_correct" (best for HR accuracy)
) -> np.ndarray:
    """
    Learn optimal [wr, wg, wb] for dog data.

    IMPORTANT: The real goal is not high SNR — it is accurate BPM (low error vs ground truth).
    This function now supports objectives that directly optimize for HR correctness.

    method options:
      - "correctness"       : directly maximizes 1 - normalized |est_bpm - target|
      - "combined_correct"  : 0.4*snr + 0.3*band_power + 0.3*correctness   ← recommended for your goal
      - "combined"          : old SNR + artifact focus (still useful)
    """
    rgb_windows = [np.asarray(w, dtype=float) for w in rgb_windows]
    target_bpms = np.asarray(target_bpms, dtype=float)

    def objective(w: np.ndarray) -> float:
        w = np.asarray(w)
        w = w / (np.linalg.norm(w) + 1e-9)

        scores = []
        for rgb, target in zip(rgb_windows, target_bpms):
            if len(rgb) < 30:
                continue
            _, normalize_rgb, estimate_bpm_from_signal = _get_rppg_helpers()
            norm = normalize_rgb(rgb)
            proj = np.dot(norm, w)
            safe_bandpass, _, _ = _get_rppg_helpers()
            pulse = safe_bandpass(proj, fs, min_bpm, max_bpm)

            est_bpm, snr2, _ = estimate_bpm_from_signal(pulse, fs, min_bpm, max_bpm)
            bpr = band_power_ratio(pulse, fs, float(target))
            correctness = bpm_correctness_score(est_bpm, float(target))

            if method == "snr":
                sc = snr2 if np.isfinite(snr2) else 0.0
            elif method == "band_power":
                sc = bpr
            elif method == "correctness":
                sc = correctness
            elif method == "combined":
                sc = 0.55 * (snr2 if np.isfinite(snr2) else 0.0) + 0.45 * (np.log1p(bpr) if np.isfinite(bpr) else 0.0)
            else:  # combined_correct — directly pushes toward correct HR number
                sc = (0.35 * (snr2 if np.isfinite(snr2) else 0.0)
                      + 0.30 * (np.log1p(bpr) if np.isfinite(bpr) else 0.0)
                      + 0.35 * correctness)

            scores.append(sc)

        if not scores:
            return -1e9
        return -np.mean(scores)

    # Multiple random starts + targeted hand-crafted (including the known good one)
    best_score = -np.inf
    best_w = np.array([0.0, 1.0, 0.0])

    for _ in range(30):
        w0 = np.random.randn(3)
        res = optimize.minimize(objective, w0, method="Nelder-Mead", tol=1e-6)
        if -res.fun > best_score:
            best_score = -res.fun
            best_w = res.x / (np.linalg.norm(res.x) + 1e-9)

    # Hand-crafted starts biased toward dog-like (negative G, positive B correction)
    for w0 in [
        np.array([0.2116, -0.8323, 0.5124]),  # previous best
        np.array([0.3, 1.0, -0.5]), np.array([0.5, 1.0, -0.8]),
        np.array([0.2, 1.0, -0.3]), np.array([0.1, -0.9, 0.6]),
        np.array([0.0, 0.8, 0.6])
    ]:
        res = optimize.minimize(objective, w0, method="Nelder-Mead", tol=1e-6)
        if -res.fun > best_score:
            best_score = -res.fun
            best_w = res.x / (np.linalg.norm(res.x) + 1e-9)

    return best_w


def get_default_dog_weights() -> np.ndarray:
    """Return the currently recommended dog-specific weights (trained with combined_correct to directly improve HR accuracy)."""
    return np.array([0.286, -0.7886, 0.5443])


def estimate_bpm_with_prior(
    pulse: np.ndarray,
    fs: float,
    min_bpm: float,
    max_bpm: float,
    target_prior: float | None = None,
    prior_strength: float = 0.5,
) -> tuple[float, float, float]:
    """
    BPM estimator that biases toward an expected HR range.
    This is now the recommended way to estimate BPM when using dog_learned.
    """
    _, _, base_estimate = _get_rppg_helpers()
    bpm, snr, ratio = base_estimate(pulse, fs, min_bpm, max_bpm)

    if target_prior is None or not np.isfinite(bpm):
        return bpm, snr, ratio

    dist = abs(bpm - target_prior)
    adjusted_snr = snr * (1.0 - prior_strength * min(dist / 80.0, 0.9))

    if dist > 30:
        x = np.asarray(pulse, dtype=float) - np.mean(pulse)
        nfft = int(2 ** np.ceil(np.log2(max(len(x), 64))) * 4)
        freqs, power = signal.periodogram(x, fs=fs, window="hann", nfft=nfft)
        lo = (target_prior - 30) / 60.0
        hi = (target_prior + 30) / 60.0
        mask = (freqs >= lo) & (freqs <= hi)
        if mask.sum() >= 2:
            idx = int(np.argmax(power[mask]))
            new_bpm = float(freqs[mask][idx] * 60)
            new_snr = float(power[mask][idx] / (np.median(power[mask]) + 1e-12))
            return new_bpm, max(new_snr, 0.5), ratio

    return bpm, max(adjusted_snr, 0.1), ratio


def estimate_bpm_dog_learned_sequential(
    pulses: list[np.ndarray],
    fs: float,
    min_bpm: float,
    max_bpm: float,
    weights: np.ndarray | None = None,
    initial_prior: float = 160.0,
    prior_strength: float = 0.55,
) -> list[tuple[float, float, float]]:
    """
    Process windows sequentially, using the previous window's BPM as prior.
    This is the recommended default behavior for dog_learned in production.
    """
    results = []
    prev_bpm = initial_prior
    for pulse in pulses:
        bpm, snr, ratio = estimate_bpm_with_prior(
            pulse, fs, min_bpm, max_bpm,
            target_prior=prev_bpm,
            prior_strength=prior_strength
        )
        results.append((bpm, snr, ratio))
        if np.isfinite(bpm):
            prev_bpm = bpm
    return results


# Convenience: a version that can be registered in METHOD_FUNCTIONS
def make_sig_dog_learned(weights: Optional[np.ndarray] = None):
    def _sig(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
        return sig_dog_learned(rgb, fs, min_bpm, max_bpm, weights=weights)
    return _sig


if __name__ == "__main__":
    print("Dog-specific rPPG model module loaded.")
    print("Use learn_dog_weights() on your best RGB windows, then sig_dog_learned().")
    print("This is the highest-leverage next step for dog rPPG accuracy.")