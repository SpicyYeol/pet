# Physiology-grounded features & priors

Well-established physiology used to (a) improve HR selection and (b) add clinically
meaningful signals. Implemented items are live in the analyzers; the rest are
documented hooks for when the data/inputs exist.

## Implemented ✅

| Feature | Physiology | Where | Effect |
|---|---|---|---|
| **Allometric HR prior** | HR ≈ 241·M^−0.25 (Stahl) — small dogs faster, giants slower | `core/baselines.py` (`hr_prior_center`) | Chihuahua→183, Frenchie→130, Great Dane→88; soft plausibility filter in HR selection |
| **Fever-tachycardia adjust** | HR rises ~10 bpm/°C above normal | `core/baselines.py` | shifts `hr_prior_center` up when a temperature reading is present |
| **Rest / motion gating** | HR/RR are stablest at rest (why sleeping-RR is the CHF standard) | `analyzers/rppg.py` (`hr_rest_gated`) | HR taken from low-motion windows |
| **Poincaré SD1/SD2, pNN50, RSA index** | dogs have strong respiratory sinus arrhythmia; SD1 ≈ short-term vagal/RSA; loss of RSA/HRV ↔ cardiac disease/pain | `analyzers/hrv.py` | richer, clinically-interpretable HRV |
| **Cyanosis Hb caveat** | cyanosis needs ≥5 g/dL deoxy-Hb → anemia masks hypoxemia | `analyzers/mucous.py` (`physiology_note`) | pallor flags "cyanosis may be masked; check SpO₂" |
| **Breath-amplitude variability** | waxing/waning (Cheyne–Stokes cue in heart failure) | `analyzers/respeffort.py` (`amplitude_cv`) | observational flag (needs a longer record to confirm) |

**Measured effect on HR** (in-sample dev set, rppg analyzer): rest-gating + allometric
plausibility moved MAE **~58 → 53.6 bpm** — a real but modest gain (mostly stems 1/3/7/8).
The core artifact overestimation on some clips persists → see below.

## The big remaining lever — RSA selector (core built 🧪, extraction pending 🔜)

**RSA-based cardio-respiratory coupling as a cardiac-vs-artifact *selector*.**
Physiology: in dogs the true heart rate is modulated at the respiratory frequency
(strong RSA); the ~100-bpm motion/panting artifact is not. Scoring each candidate by
how much its instantaneous-HR series is modulated at the measured RR gives a
**label-free discriminator** that generic SQI lacks — the exact gap in
[`PRELIMINARY_VALIDATION.md`](PRELIMINARY_VALIDATION.md) §4b.

The **core algorithm is now built and verified** ([`petvitals/signal/ihr.py`](../../petvitals/signal/ihr.py):
smooth iHR via spectrogram+Viterbi+sub-bin interpolation, then RSA coupling; synthetic
self-test separates cardiac+RSA 0.78 vs flat/artifact 0.36). What remains is the
**signal-extraction change** to emit per-candidate wideband instantaneous-HR (not the
single per-window BPM we cache today). Full spec: [`RSA_SELECTOR_DESIGN.md`](RSA_SELECTOR_DESIGN.md).

## Pulse-vs-artifact SQI library 🧪 ([`petvitals/signal/sqi.py`](../../petvitals/signal/sqi.py))

Seven physiological features a real cardiac pulse has and an artifact lacks: RSA
coupling, waveform skewness, periodicity, perfusion index (AC/DC), **harmonic
phase-locking (PLV)**, **Mayer/LF (~0.1 Hz) coupling**, multi-site phase consistency.
Ablation (`tools/eval_physio_sqi.py`, RSA_SELECTOR_DESIGN §4d): RSA is the best single
selector (MAE 30.8); PLV/LF are **complementary** — they alone fix RSA's stem-7 failure
(a respiratory artifact with RSA coupling but no harmonic structure). Naive fusion
doesn't beat RSA on n=7, so these are shipped as inputs for a future *learned*
multi-feature selector (needs labeled data).

## Other documented hooks 🔜

- **Pulse transit time (PTT) → blood pressure** and multi-site pulse consistency — needs
  synchronized multi-view pulse (`dataset_multi`); PTT inversely tracks BP.
- **IR peripheral perfusion** — ear/paw thermal gradient reflects vasoconstriction
  (shock/low perfusion); needs a thermal camera.
- **ROI physiology** — ear pinna (AV shunts) and nasal planum are highly vascular →
  stronger rPPG; add to the extraction ROI set (`tools/`).
- **Frequency-domain HRV (LF/HF)** — sympathovagal balance; needs longer clean beat series.
- **Breathing pathophysiology classifier** — Cheyne–Stokes, agonal, apnea types over
  longer records.

> All thresholds/priors are configurable defaults, not clinical cutoffs.
