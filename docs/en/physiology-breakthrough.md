# Physiology-Based Contactless HR Discrimination — Breakthrough Summary

*한국어: [`docs/ko/physiology-breakthrough.md`](../ko/physiology-breakthrough.md)*

We attacked the core rPPG obstacle (cardiac-vs-artifact **selection failure**) with canine
physiology (RSA), cutting the error by more than half — label-free — and added clinical
signals (respiration cross-check, vagal tone, microcirculation) along the way. All numbers
are measured; successes **and** negative results are recorded honestly.

## 1. One-paragraph summary

Fur, panting and motion make dog rPPG collapse onto a **~100-bpm artifact** at high heart
rates; by generic signal quality (SNR) that artifact looks *cleaner* than the true pulse, so
selection fails. We showed the true HR **is already present** in the candidate pool (oracle
MAE 0.4 bpm) and used the **strong respiratory sinus arrhythmia (RSA)** of dogs — the real HR
is modulated at the respiratory rate, the artifact is not — to cut **held-out HR error from
81.8 → 30.8 bpm (−63%)**, label-free, **even on anesthetized dogs**. It is now the default HR
selector.

## 2. Problem & diagnosis — "signal is present, selection fails"

| metric | result | meaning |
|---|---|---|
| Oracle (label-leaked upper bound) | **MAE 0.4 bpm**, 95% LoA ±2 | the correct HR **is in** the candidate pool |
| honest held-out | MAE 45–82 bpm | **automatic selection is unsolved** |

The bottleneck is candidate **selection**, not signal. A fixed label-free SQI also gives MAE
49.5 with **every pick collapsing to ~100 bpm** — the artifact wins on SNR, periodicity and
cross-candidate consensus. Better *generic* quality cannot fix it.
(See [`PRELIMINARY_VALIDATION`](../research/PRELIMINARY_VALIDATION.md).)

## 3. The breakthrough — RSA-based selection

**Physiology**: dogs have strong RSA → the true HR is **modulated at the respiratory
frequency**; motion/panting artifacts are not. **Method**: per candidate, derive a smooth
**instantaneous-HR track** (spectrogram → Viterbi → sub-bin interpolation) and score its
**RSA coupling** (iHR-modulation power in the respiratory band + correlation with the
thoracic breathing proxy), then select within a physiological range. It works on *frequency*
(iHR), so it targets true RSA, not RIIV (amplitude).

| selection rule | 7-clip held-out MAE |
|---|---|
| SNR (generic quality) | 81.8 bpm |
| RSA coupling | 45.9 |
| **RSA + physiological gate** | **30.8** ✅ |
| prior cached pipeline | 53.6 |
| oracle (upper bound) | 10.1 |

**−63% vs SNR, −43% vs the cached pipeline**, below the in-sample 37.5. Works **even under
anesthesia** (which blunts RSA → awake should be better). Promoted to default; falls back to
the cached HR when no video. (See [`RSA_SELECTOR_DESIGN`](../research/RSA_SELECTOR_DESIGN.md).)

## 4. Complementary discriminators (PLV, LF)

Seven physiological SQIs tested: harmonic phase-locking (PLV) and Mayer/LF coupling each
**independently recover the case RSA misses** (err 119→21) — proving that artifact is a
respiratory oscillation *with* RSA-band coupling but *without* harmonic/Mayer structure. The
features are physically **complementary**. But on n=7 any hand-tuned fusion overfits → a
*learned* combiner needs labeled data.

## 5. Bonus — new clinical signals

| signal | clinical meaning | status |
|---|---|---|
| **RIIV → RR** | respiration from the pulse → **cross-checks** the chest proxy (confidence) | mean |Δ| ≈ 10 brpm |
| **RSA amplitude** | HR swing at RR = **vagal tone** | directional (noise-inflated) |
| **Vasomotion** | myogenic band = **microcirculation** | new (needs reference) |
| **HRV Poincaré SD1/SD2, pNN50** | autonomic balance | wired |

## 6. Honest negatives & limits (the basis of trust)

- **A+B extraction + RSA**: adding panting-subtraction/zones *regressed* it (30.8→48.9) by
  attenuating the high-HR pulse. Not adopted.
- **Ballistocardiography (BCG)**: motion-based independent HR — on 10/30 fps it locks onto
  gross body/respiratory motion, not the cardiac recoil. Doesn't work here.
- **SQI fusion**: hand-tuning on n=7 overfits → learned selector + data needed.

## 7. Scoreboard

| attempt | result |
|---|---|
| ✅ RSA coupling | **breakthrough** (81.8→30.8, default) |
| ✅ allometric HR / fever / rest-gating / HRV / cyanosis-Hb | wired |
| ✅ RIIV / RSA amplitude / vasomotion | new clinical signals |
| 🧪 PLV / LF (7 SQIs) | complementary; fusion needs learning |
| ❌ A+B fusion / BCG / hand-tuned fusion | not adopted |

## 8. Significance

- **Differentiation**: selecting the rPPG candidate by **physiology (RSA, harmonics,
  autonomic)** rather than generic quality; halving the oracle gap; auditable honesty
  (oracle/held-out/overfit separated, negatives recorded) for regulatory/clinician trust.
- **Data case**: every refinement (fusion, micro-signals) converges on the need for a
  **synchronized-reference (ECG/pulse-ox) cohort** — quantifying *what/why/how much* to collect.
- **Extensibility**: the 9 SQIs + new signals are the inputs for a **learned multi-feature
  selector** and reusable clinical features for cardiac/pain/microcirculation monitoring.

## 9. Reproduce / code

- Validation: `tools/{validate_rsa_selector,eval_rsa_holdout,eval_physio_sqi,eval_riiv_vaso,eval_bcg}.py`
- Core: `petvitals/signal/{ihr,sqi,rsa_select}.py`
- Docs: `docs/research/{PRELIMINARY_VALIDATION,RSA_SELECTOR_DESIGN,PHYSIOLOGY_FEATURES}.md`

> All thresholds/numbers are dev-set (n=7) configurable defaults / research results, not
> clinical cutoffs.
