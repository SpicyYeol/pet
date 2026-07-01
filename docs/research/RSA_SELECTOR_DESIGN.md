# RSA selector — signal-extraction design (per-candidate instantaneous HR)

**Goal.** Close the cardiac-vs-artifact selection gap (oracle 0.4 vs held-out ~45 bpm,
[PRELIMINARY_VALIDATION](PRELIMINARY_VALIDATION.md)) using a physiological
discriminator generic SQI lacks: in dogs the true heart rate is modulated at the
respiratory frequency (strong **respiratory sinus arrhythmia**); the ~100-bpm
motion/panting artifact is not. Scoring each candidate by its **RSA coupling** should
prefer the real cardiac peak — label-free.

Core algorithm is prototyped and verified: [`petvitals/signal/ihr.py`](../../petvitals/signal/ihr.py).

---

## 1. What must change in signal extraction

Today the windowed extractor caches only **one `peak_bpm` per candidate/window** (plus
scalar features) in `candidate_window_peaks.csv`; the BVP *waveform* is saved for just
the single best candidate per stem. RSA needs a **time-resolved** rate, so:

**Change**: for every candidate that survives first-pass rejection (top-K by existing
SQI, to bound cost), **retain its band-passed BVP waveform** for the window (or emit its
iHR track directly). Store as `candidate_bvp.npz` keyed by
`{stem}_{roi}_{method}_{start}`.

**Extraction settings** (differ from the current narrowband peak extractor):
- Band-pass must be **wide enough to contain the RSA frequency excursion** (HR ± ~15-25%),
  not a narrow lock around the peak — otherwise the modulation is filtered out.
- Prefer **longer windows** (≥ 20-30 s) so several respiratory cycles are captured.

> Prototype finding (real cached traces): the existing 20 s *narrowband* single-candidate
> BVP is **inadequate** — iHR tracking is noisy and RSA is not cleanly measurable. This is
> exactly why the extraction change (wideband, per-candidate, longer) is required.

## 2. Instantaneous HR (iHR) — `instantaneous_hr(bvp, fs)`

Spectrogram → smooth frequency track → sub-bin refinement:
1. **STFT** over the HR band (1-4 Hz), Hann window `win_sec≈4 s`, hop `0.25 s`.
2. **Viterbi track** over frequency bins: maximize log-power − `jump_penalty·Δf²`. This
   rejects frame-to-frame jumps to artifacts (naive per-frame argmax fails here).
3. **Parabolic (sub-bin) interpolation** of the chosen peak → ±sub-bin precision so the
   small RSA swing survives the coarse FFT bin width.

**Design tension (learned in prototyping)**: frequency resolution (long window) vs seeing
the modulation (short window). Over-smoothing (high `jump_penalty` + coarse bins) flattens
the track to std 0 and *kills* RSA; the parabolic-interpolation + moderate-penalty
combination is what recovers it. Alternatives considered: Hilbert instantaneous frequency
(needs a good bandpass, brittle), beat-to-beat IBI (needs clean peaks, hard on rPPG).

## 3. RSA coupling metric — `rsa_coupling(ihr, ihr_fs, resp, resp_fs, rr_hz)`

- **Primary (no resp needed)**: fraction of iHR-modulation power inside the respiratory
  band (or ±0.1 Hz around the measured thoracic RR) — "how much does the rate wobble at
  the breathing rate?".
- **Secondary (if a respiration signal is available)**: |correlation| of band-limited iHR
  with the resampled **thoracic** breathing proxy (`tools/dual_respiratory_proxies`).
- `rsa_coupling = ratio` or `0.5·ratio + 0.5·|corr|`.

**Verified discrimination (synthetic self-test, `python -c "from petvitals.signal.ihr import _self_test; _self_test()"`):**

| signal | iHR std | power_ratio | resp_corr | coupling |
|---|---|---|---|---|
| cardiac **+ RSA** | 3.7 | 0.92 | 0.63 | **0.78** |
| constant-rate cardiac | 0.2 | 0.29 | 0.44 | 0.36 |
| ~100-bpm artifact | 0.0 | 0.49 | 0.24 | 0.36 |

→ RSA-modulated cardiac separates cleanly (0.78 vs 0.36).

## 4. Confounds to handle

- **RIIV (respiratory-induced intensity variation)**: breathing also modulates rPPG
  *amplitude/baseline* at the respiratory rate — but **not the frequency**. We compute
  coupling on **iHR (frequency)**, which RIIV does not produce, so the metric targets true
  RSA, not RIIV.
- **Panting vs thoracic breathing**: RSA is tied to **thoracic** respiration; couple iHR to
  the thoracic proxy, not the (faster) panting proxy — and use the thoracic RR band.
- **Artifact at the respiratory harmonic**: guard by requiring the coupling at the *measured*
  RR (not any band peak) and combining with existing SQI.
- **Window length / cost**: needs several breaths; compute only for top-K survivors.

## 4b. Directional validation on real data ✅ (it works)

`tools/validate_rsa_selector.py` does a lightweight fresh extraction (green / g−r /
CHROM on small keypoint ROIs, incl. panting-prone mouth ROIs) → per-candidate iHR +
RSA coupling (respiration = thoracic chest proxy) → selects HR, on all 7 clips.
This is a **fixed rule, no training** (so it is honest held-out for the selector).

| selection rule | MAE (bpm) |
|---|---|
| by SNR (what generic quality does) | **81.8** |
| by RSA coupling | **45.9** |
| **by RSA coupling + physiological plausibility (70–220 bpm)** | **30.8** |
| oracle (upper bound) | 10.1 |

Findings: (1) RSA coupling ~halves the error vs SNR — **SNR is actively misleading
here** (the ~100-bpm artifact has the highest SNR), so naive SNR+RSA blending regresses
back toward the artifact. (2) A physiological (allometric) plausibility gate removes
sub-harmonic mis-picks and takes it to **30.8** — better than the in-sample 37.5. (3) It
works even on *anesthetized* dogs (RSA is blunted under anesthesia) → awake animals
should be better. Caveat: crude extraction (no A+B panting subtraction), n=7 — the
*relative* SNR-vs-RSA comparison is fair; absolute numbers will differ in production.

**Direction confirmed → proceed to production integration (§5, §7).**

## 4c. A+B extraction test + promotion decision

Hypothesis: combining the project's **A+B** extraction (multi-keypoint anatomical zones +
panting-proxy subtraction) with RSA selection would raise absolute performance. **It did
not** — held-out MAE *regressed* 30.8 → **48.9**: A+B won big on the over-estimated clips
(4/5/6/8) but broke the high-HR clips (1/3/7 → under-estimated), i.e. the panting
subtraction / multi-kp zones attenuated the true high-HR pulse. So the **simple
single-keypoint extraction + RSA is the production choice** (`petvitals/signal/rsa_select.py`).

**Held-out re-eval (`tools/eval_rsa_holdout.py`)**: RSA (simple) **MAE 30.8** vs the prior
default (cached pipeline + physiology gating) **53.6** — a 43% reduction, winning 6/7 clips.
→ **Promoted to default** (`RppgConfig.use_rsa_selector=True`); falls back to the cached HR
when no video/extraction, and reports both (`hr_bpm` = RSA, `hr_cached_bpm`).

**Known regression / caveat**: stem 7 (145→70, a *confident-but-wrong* respiratory-band
pick, coupling 0.52 — higher than several correct picks, so a coupling gate can't catch it;
likely a RIIV-like respiratory artifact the frequency-domain metric didn't fully reject).
n=7 dev set, crude extraction — a real external ECG cohort is still the validation path.

## 5. Integration & validation

1. Add `rsa_coupling` as a feature in the candidate table.
2. Add it to the selection score (weight tuned by held-out CV, not on the test videos).
3. **Re-run the oracle/LOOCV analysis** (§ PRELIMINARY_VALIDATION): does held-out MAE drop
   toward the oracle? Report honestly, including where RSA fails (very low RR, sedation with
   blunted RSA — note: deep anesthesia *reduces* RSA, relevant to this dataset).

## 6. Interfaces (implemented)

```python
from petvitals.signal import instantaneous_hr, rsa_coupling
t, ihr, ihr_fs = instantaneous_hr(bvp, fs)                 # smooth iHR track
c = rsa_coupling(ihr, ihr_fs, resp=chest, resp_fs=10, rr_hz=rr)  # -> dict(rsa_coupling, ...)
```

## 7. Phased plan
1. ✅ iHR + RSA-coupling core (this module) + synthetic verification.
2. Extraction change: emit per-candidate wideband BVP for top-K survivors.
3. Compute `rsa_coupling` per candidate; add to selector; held-out re-eval vs oracle.
4. If it closes the gap → productionize into `analyzers/rppg.py` selection; else the
   quantified residual strengthens the data-collection case (labeled ECG cohort).

> Caveat: **anesthesia/sedation blunts RSA** — since this dataset is anesthetized dogs, the
> in-hand data may under-represent RSA; awake-animal data is where this should shine.
