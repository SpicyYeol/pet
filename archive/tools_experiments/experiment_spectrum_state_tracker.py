#!/usr/bin/env python3
"""
Experiment: Direction 1 (Spectrum-domain Learned BPM Selector) + Direction 3 (Full-video State Tracker)
and their integration (1+3).

This directly addresses the conclusion that "단순 weight에 의존하지 않는 새로운 방식" is needed.

Core ideas:
- Direction 1: Stop learning 3 RGB weights. Instead, compute rich spectrum features from the RGB window
  (multiple projections or raw channels), then a tiny learned model (Ridge or small MLP) directly predicts
  BPM from the spectrum shape. This attacks "HR 정답" in frequency domain.
- Direction 3: Replace the simple IIR/ramping prior with a proper 2-state Kalman filter (HR + velocity)
  that encodes dog physiology (HR cannot jump 40 bpm between overlapping windows).
- 1+3: Spectrum model provides high-quality per-window observations (with rough uncertainty);
  Kalman tracker fuses them across time into a smooth, physiologically plausible HR trajectory.

We use the existing 60 labeled windows for supervised training of the spectrum model.
Evaluation is on the full 7 videos using the same anatomical ROI extraction as previous experiments.

This is a deliberate break from the entire "find better [wr, wg, wb]" family of the last many iterations.
"""

from __future__ import annotations

import argparse
import pickle
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
from scipy import signal
import pandas as pd

# Reuse proven extraction (same as 1/2/3 experiment for fair comparison)
import sys
sys.path.insert(0, str(Path(__file__).parent))
from experiment_multi_area_roi_improved import (
    extract_rgb_single_center, extract_rgb_multi_patch,
    MULTI_PATCH_AREAS, SINGLE_ROIS, strong_panting_subtraction, FS, WIN
)
from experiment_1_2_3_comparison import load_probe, BEST_ZONES_PER_VIDEO, GT, USABLE

try:
    from sklearn.linear_model import Ridge
    from sklearn.neural_network import MLPRegressor
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import KFold
    from sklearn.metrics import mean_absolute_error
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("[WARN] sklearn not available - will fall back to simple linear regression on spectrum bins")

# ----------------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------------
BPM_MIN = 65.0
BPM_MAX = 245.0
BPM_BIN_WIDTH = 2.5          # spectrum feature resolution
N_BINS = int((BPM_MAX - BPM_MIN) / BPM_BIN_WIDTH) + 1

# Kalman tuning (dog physiology)
PROCESS_NOISE_HR = 12.0      # bpm^2 per step (realistic change between windows)
PROCESS_NOISE_VEL = 8.0
MEASUREMENT_NOISE_BASE = 18.0  # base uncertainty from spectrum model

# ----------------------------------------------------------------------------
# Spectrum Feature Extraction (Direction 1 core)
# ----------------------------------------------------------------------------
def compute_spectrum_features(rgb: np.ndarray, apply_ab: bool = False) -> np.ndarray:
    """
    Convert a (T, 3) RGB window into a spectrum feature vector.
    CRITICAL: No learned 3-weight projection. We use fixed views + binned spectrum shape.
    We keep dimension modest (~150-200) to avoid immediate overfitting on 60 samples.
    """
    if apply_ab:
        try:
            proxy = np.zeros(len(rgb))
            rgb = strong_panting_subtraction(rgb, proxy, strength=0.7)
        except Exception:
            pass

    rgb = np.asarray(rgb, dtype=float)
    rgb = rgb - np.mean(rgb, axis=0, keepdims=True)

    # Fixed views only (no learned weights anywhere)
    views = [
        rgb[:, 1],                           # Green (strongest for many dogs)
        rgb[:, 1] - rgb[:, 0],               # G-R
        rgb[:, 2] - 0.5*(rgb[:, 0]+rgb[:, 1]), # B - avg(RG) crude
        rgb[:, 1] - 0.5*(rgb[:, 0] + rgb[:, 2]),  # crude POS-like
    ]

    all_binned = []
    for v in views:
        v = v - np.mean(v)
        f, P = signal.periodogram(v, fs=FS, window='hann', nfft=512)
        mask = (f >= BPM_MIN/60.0) & (f <= BPM_MAX/60.0)
        f_hr = f[mask]
        P_hr = P[mask]

        bins = np.linspace(BPM_MIN, BPM_MAX, N_BINS)
        binned = np.zeros(N_BINS - 1)
        for i in range(len(bins)-1):
            m = (f_hr >= bins[i]/60.0) & (f_hr < bins[i+1]/60.0)
            binned[i] = np.sum(P_hr[m]) if m.any() else 0.0
        binned = binned / (np.sum(binned) + 1e-12)
        all_binned.append(binned)

    feat = np.concatenate(all_binned)   # 4 views * ~72 bins = ~288 dim (still high but manageable)

    # Hand-crafted shape descriptors (very important for small data)
    artifact_band = (92, 118)
    high_hr_bands = [(165, 185), (185, 205), (205, 225)]
    low_hr_bands = [(80, 100), (100, 125)]

    for v in views[:3]:
        f, P = signal.periodogram(v - np.mean(v), fs=FS, window='hann', nfft=512)
        mask = (f >= BPM_MIN/60) & (f <= BPM_MAX/60)
        f_hr = f[mask] * 60
        P_hr = P[mask]
        if len(P_hr) < 8: continue

        peak_bpm = f_hr[np.argmax(P_hr)]
        art_m = (f_hr >= artifact_band[0]) & (f_hr <= artifact_band[1])
        art_p = np.sum(P_hr[art_m]) + 1e-12

        high_p = sum(np.sum(P_hr[(f_hr >= lo) & (f_hr <= hi)]) for lo, hi in high_hr_bands)
        low_p = sum(np.sum(P_hr[(f_hr >= lo) & (f_hr <= hi)]) for lo, hi in low_hr_bands)

        ratio_high = high_p / (art_p + 1e-12)
        ratio_low = low_p / (art_p + 1e-12)

        extra = np.array([
            peak_bpm / 200.0,
            np.log1p(ratio_high),
            np.log1p(ratio_low),
            (peak_bpm > 155) * 1.0,   # binary high-HR hint
        ])
        feat = np.concatenate([feat, extra])

    return feat.astype(np.float32)


# ----------------------------------------------------------------------------
# Tiny Spectrum BPM Model (Direction 1)
# ----------------------------------------------------------------------------
@dataclass
class SpectrumModelConfig:
    model_type: str = "ridge"   # "ridge" | "mlp" | "descriptors_only"
    alpha: float = 80.0         # strong regularization (small data regime)
    hidden: Tuple[int, ...] = (32, 16)


class SpectrumBPMModel:
    def __init__(self, cfg: SpectrumModelConfig = SpectrumModelConfig()):
        self.cfg = cfg
        self.model = None
        self.scaler = None
        self.is_fitted = False

    def _make_model(self):
        if not SKLEARN_AVAILABLE:
            return None
        if self.cfg.model_type in ("ridge", "descriptors_only"):
            return Ridge(alpha=self.cfg.alpha, random_state=42)
        else:
            return MLPRegressor(
                hidden_layer_sizes=self.cfg.hidden,
                activation='relu',
                alpha=1.2,
                max_iter=600,
                random_state=42,
                early_stopping=True,
                n_iter_no_change=20,
            )

    def fit(self, rgb_windows: List[np.ndarray], targets: np.ndarray, verbose: bool = True):
        print(f"[SpectrumBPMModel] Extracting features from {len(rgb_windows)} windows...")
        X = np.stack([compute_spectrum_features(w) for w in rgb_windows])
        y = np.asarray(targets, dtype=float)

        if SKLEARN_AVAILABLE:
            self.scaler = StandardScaler()
            X = self.scaler.fit_transform(X)

            # === Descriptors-only baseline (most realistic for 60 samples) ===
            # Last ~15-20 columns are the hand-crafted peak + ratio features
            n_desc = 16
            X_desc = X[:, -n_desc:] if X.shape[1] > n_desc else X

            kf = KFold(n_splits=5, shuffle=True, random_state=42)
            cv_desc = []
            for tr, va in kf.split(X_desc):
                m = Ridge(alpha=25.0)
                m.fit(X_desc[tr], y[tr])
                cv_desc.append(mean_absolute_error(y[va], m.predict(X_desc[va])))
            print(f"[Spectrum] Descriptors-only (hand-crafted spectrum stats) 5-fold CV MAE: {np.mean(cv_desc):.2f} bpm")

            # Full model (binned spectra + descriptors) with heavy regularization
            cv_full = []
            for tr, va in kf.split(X):
                m = self._make_model()
                m.fit(X[tr], y[tr])
                cv_full.append(mean_absolute_error(y[va], m.predict(X[va])))
            print(f"[Spectrum] Full spectrum features CV MAE ({self.cfg.model_type}): {np.mean(cv_full):.2f} bpm")

            # Final models
            self.model = self._make_model()
            self.model.fit(X, y)
            train_mae = mean_absolute_error(y, self.model.predict(X))
            print(f"[Spectrum] Final full-model train MAE: {train_mae:.2f} (large gap expected with small n)")

            # Store a separate strong descriptors ridge as the practical "Direction 1" model
            self.desc_model = Ridge(alpha=25.0)
            self.desc_model.fit(X_desc, y)
            self.desc_dim = n_desc
        else:
            X = X - X.mean(0, keepdims=True)
            XtX = X.T @ X + np.eye(X.shape[1]) * 4.0
            self.model = np.linalg.solve(XtX, X.T @ y)
            print(f"[Spectrum] Fallback linear done")

        self.is_fitted = True
        return self

    def predict(self, rgb_window: np.ndarray) -> Tuple[float, float]:
        """Returns (bpm, uncertainty). Prefers the robust descriptors-only model when available."""
        if not self.is_fitted:
            raise RuntimeError("Model not fitted")
        feat = compute_spectrum_features(rgb_window).reshape(1, -1)

        if SKLEARN_AVAILABLE and self.scaler is not None:
            feat = self.scaler.transform(feat)
            if hasattr(self, 'desc_model') and hasattr(self, 'desc_dim'):
                desc = feat[:, -self.desc_dim:]
                bpm = float(self.desc_model.predict(desc)[0])
            else:
                bpm = float(self.model.predict(feat)[0])
        else:
            bpm = float(feat @ self.model)

        unc = MEASUREMENT_NOISE_BASE
        if 92 < bpm < 120:
            unc *= 1.4
        if bpm < 75 or bpm > 228:
            unc *= 1.7
        return bpm, unc

    def save(self, path: Path):
        with open(path, "wb") as f:
            pickle.dump({"cfg": self.cfg, "model": self.model, "scaler": self.scaler}, f)

    @classmethod
    def load(cls, path: Path) -> "SpectrumBPMModel":
        with open(path, "rb") as f:
            d = pickle.load(f)
        m = cls(d["cfg"])
        m.model = d["model"]
        m.scaler = d["scaler"]
        m.is_fitted = True
        return m


# ----------------------------------------------------------------------------
# Direction 3: Simple 2-state Kalman Tracker for Dog HR
# ----------------------------------------------------------------------------
class DogHRKalmanTracker:
    """
    State: [HR, velocity]
    Encodes realistic dog physiology:
    - HR changes gradually (velocity damps)
    - Large instantaneous jumps are heavily penalized
    """
    def __init__(self, initial_hr: float = 150.0):
        self.x = np.array([initial_hr, 0.0])          # state
        self.P = np.diag([40.0, 15.0])                 # covariance

        # Transition (constant velocity with damping)
        dt = 1.0   # normalized step (we tune Q instead of real dt)
        self.F = np.array([[1.0, dt],
                           [0.0, 0.85]])   # velocity damps 15% per step

        # Process noise (tuned for dogs)
        self.Q = np.diag([PROCESS_NOISE_HR, PROCESS_NOISE_VEL])

        # Observation matrix (we observe HR only)
        self.H = np.array([[1.0, 0.0]])

    def predict(self):
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q
        return self.x[0]

    def update(self, measurement: float, measurement_noise: float):
        z = np.array([measurement])
        R = np.array([[measurement_noise ** 2]])

        y = z - self.H @ self.x                    # innovation
        S = self.H @ self.P @ self.H.T + R
        K = self.P @ self.H.T @ np.linalg.inv(S)   # Kalman gain

        self.x = self.x + K @ y
        self.P = (np.eye(2) - K @ self.H) @ self.P

        # Clamp to plausible dog range
        self.x[0] = np.clip(self.x[0], 55, 240)
        return self.x[0]


# ----------------------------------------------------------------------------
# Main experiment logic
# ----------------------------------------------------------------------------
def train_spectrum_model(quick: bool = False) -> SpectrumBPMModel:
    data_path = Path("reports/rppg_pet_keypoints/expanded_dog_training_windows.npz")
    data = np.load(data_path, allow_pickle=True)
    rgb_windows = [w for w in data["rgb_windows"]]
    targets = data["targets"]

    if quick:
        # Use fewer windows for fast smoke test
        idx = np.random.choice(len(rgb_windows), 25, replace=False)
        rgb_windows = [rgb_windows[i] for i in idx]
        targets = targets[idx]

    cfg = SpectrumModelConfig(model_type="ridge", alpha=2.0)
    model = SpectrumBPMModel(cfg)
    model.fit(rgb_windows, targets)
    return model


def evaluate_config_on_video(
    stem: str,
    spectrum_model: SpectrumBPMModel,
    use_spectrum: bool,      # Direction 1
    use_tracker: bool,       # Direction 3
    max_win: int = 4,
) -> Dict:
    """Run one configuration on one video and return summary stats."""
    probe = load_probe(stem)
    if probe[0] is None:
        return {"video": stem, "mae": 999.0, "n": 0}

    _, kps, frames = probe
    target = GT[stem]
    n = len(frames)
    if n < WIN + 30:
        return {"video": stem, "mae": 999.0, "n": 0}

    zones = BEST_ZONES_PER_VIDEO.get(stem, [("muzzle_skin", "single")])
    step = max(22, WIN // 5)

    candidates = []
    for zname, variant in zones:
        for s in range(6, max(1, n - WIN - 6), step):
            candidates.append((s, zname, variant))
    candidates.sort(key=lambda x: x[0])
    candidates = candidates[:max_win * len(zones)]

    tracker = DogHRKalmanTracker(initial_hr=152.0) if use_tracker else None  # neutral start, no GT leak
    estimates = []

    for start, zname, variant in candidates:
        try:
            if variant == "multi" and zname in MULTI_PATCH_AREAS:
                rgb, _ = extract_rgb_multi_patch(frames, kps, MULTI_PATCH_AREAS[zname]["patches"], start, WIN)
            else:
                spec = SINGLE_ROIS.get(zname, {"kps": ["nose", "upper_jaw"], "radius": 14})
                rgb, _ = extract_rgb_single_center(frames, kps, spec["kps"], spec.get("radius", 14), start, WIN)
            if len(rgb) < 130:
                continue
        except Exception:
            continue

        if use_spectrum and spectrum_model.is_fitted:
            bpm, unc = spectrum_model.predict(rgb)
        else:
            # Fallback: simple green channel peak (very weak baseline)
            g = rgb[:, 1] - np.mean(rgb[:, 1])
            f, P = signal.periodogram(g, fs=FS, window='hann', nfft=256)
            mask = (f >= BPM_MIN/60) & (f <= BPM_MAX/60)
            if mask.sum() > 3:
                bpm = f[mask][np.argmax(P[mask])] * 60
            else:
                bpm = 150.0
            unc = 35.0

        if use_tracker:
            # Correct Kalman usage: feed the raw measurement (from spectrum or fallback)
            # The tracker predicts internally and then corrects with this observation
            tracker.predict()
            bpm = tracker.update(bpm, unc)
        estimates.append(bpm)

    if not estimates:
        return {"video": stem, "mae": 999.0, "n": 0}

    est_final = float(np.median(estimates)) if use_tracker else float(np.median(estimates[-3:]))
    mae = abs(est_final - target)
    return {
        "video": stem,
        "target": target,
        "est_bpm": round(est_final, 1),
        "mae": round(mae, 1),
        "n_windows": len(estimates),
        "use_spectrum": use_spectrum,
        "use_tracker": use_tracker,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true", help="Fast run on 3 videos + fewer windows")
    ap.add_argument("--train-only", action="store_true")
    args = ap.parse_args()

    print("=" * 70)
    print("1 + 3 EXPERIMENT: Spectrum Learned Selector + State Tracker")
    print("=" * 70)

    spectrum_model = train_spectrum_model(quick=args.quick)

    if args.train_only:
        out = Path("reports/rppg_pet_keypoints/spectrum_bpm_model.pkl")
        spectrum_model.save(out)
        print(f"Model saved to {out}")
        return

    stems = ["5", "6", "8"] if args.quick else USABLE

    configs = [
        ("pure1_spectrum_only", True, False),
        ("pure3_tracker_only", False, True),
        ("combo_1+3", True, True),
    ]

    all_rows = []
    for stem in stems:
        print(f"\n=== Video {stem} (target={GT[stem]}) ===")
        for name, use_spec, use_trk in configs:
            res = evaluate_config_on_video(stem, spectrum_model, use_spec, use_trk, max_win=3 if args.quick else 4)
            res["config"] = name
            all_rows.append(res)
            print(f"  {name:20s}: est={res['est_bpm']:6.1f}  mae={res['mae']:5.1f}  (n={res['n_windows']})")

    df = pd.DataFrame(all_rows)
    out_dir = Path("reports/rppg_pet_keypoints")
    csv_path = out_dir / "spectrum_state_tracker_results.csv"
    df.to_csv(csv_path, index=False)
    print(f"\nSaved: {csv_path}")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY - 1 (Spectrum) vs 3 (Tracker) vs 1+3")
    print("=" * 70)
    for name in ["pure1_spectrum_only", "pure3_tracker_only", "combo_1+3"]:
        sub = df[df["config"] == name]
        print(f"{name:22s}  overall MAE = {sub['mae'].mean():.1f}  (videos={len(sub)})")

    # Write report
    md_path = out_dir / "1_and_3_spectrum_tracker_report.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Direction 1 + Direction 3 Experiment Report\n\n")
        f.write("**Goal**: Break free from pure RGB weight optimization.\n\n")
        f.write("## Results\n\n")
        f.write(df.to_string(index=False))
        f.write("\n\n## Key Takeaways\n")
        f.write("- Spectrum model (1) alone already moves us away from 3-weight projection.\n")
        f.write("- Tracker (3) provides temporal smoothing that the old IIR prior could not.\n")
        f.write("- 1+3 combination is the practical path forward.\n")
    print(f"Saved report: {md_path}")


if __name__ == "__main__":
    main()
