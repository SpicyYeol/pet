# Self-supervised rPPG — design (label-free: periodicity + multi-view consistency)

*요약(KO): 라벨 없이 학습하는 유일한 DL 방향. **주파수 prior**(HR 대역에 파워 집중 + 단일 우세 피크)와
우리 고유 자산인 **다중 카메라 일관성**(같은 심장 → 뷰 간 HR 일치, 아티팩트는 뷰 특이적)을 손실로 써서
맥파 추출기를 학습한다. POC는 `dataset_multi`(4뷰 동시촬영)로 손실·파이프라인을 검증한다 —
소규모(40초·1세션)라 일반화가 아닌 개념 증명. 구현: `tools/selfsup_rppg_poc.py`.*

## Why self-supervised (and why it fits us)
Supervised rPPG nets need synchronized-HR labels we don't have. Self-supervised rPPG learns a
pulse extractor from **unlabeled** video using signal priors. We have a rare extra prior:
**4 synchronized camera views** (`dataset_multi`) of one animal — the true HR is identical
across views, artifacts are view-specific. That is a strong, project-specific supervision
signal for free.

## Model
Lightweight temporal extractor on ROI RGB traces (not raw video → CPU-feasible):
`input (B, 3, T)` per-window RGB → 1D dilated conv stack (captures periodicity) → `pulse (B, T)`.
(Full spatiotemporal 3D-CNN/transformer, à la PhysNet/Contrast-Phys, is the scale-up once
data/GPU exist.)

## Label-free losses
1. **Band-limit** — pulse power should concentrate in the HR band (0.7–4 Hz = 42–240 bpm):
   `L_band = 1 − power_in_band / total_power`.
2. **Sparsity / peakiness** — one dominant peak (a clean pulse, not broadband noise):
   `L_sparse = 1 − max_bin / sum_in_band`.
3. **Anti-collapse** — non-trivial variance so the net can't output a constant.
4. **Multi-view consistency** — for the same time window across the V views, the predicted
   pulses must share a frequency: penalize disagreement of the in-band spectra
   (`L_mv = mean pairwise (1 − ⟨ŝ_i, ŝ_j⟩)` over softmaxed in-band spectra). **This is the
   discriminative term** — it rejects view-specific motion/panting artifacts, the same failure
   mode the RSA selector targets, but learned end-to-end.

Optional (single-view data): **temporal consistency** (overlapping windows → same HR) and
**spatial consistency** (different ROIs of one view → same HR, Contrast-Phys-style).

## Data & training
- POC: the 4-view `dataset_multi` traces (`reports/rppg_multiview_rgb/cache/*.npz`, ~15 fps,
  40 s, 4 views × face regions). Windows ~10 s, overlapping; multi-view windows require all
  views valid at that time.
- Scale-up: many unlabeled dog clips (single + multi-view) → the losses need no labels.
- Optimizer Adam; a few hundred steps for the POC.

## Evaluation

**POC result** (`tools/selfsup_rppg_poc.py`, 48 multi-view windows, ~250 steps, CPU): the
losses train — band-limit loss **0.54 → 0.01** (pulse power concentrates in the HR band),
sparsity and multi-view terms also drop — and the learned extractor is **more view-consistent
than raw green**: cross-view HR spread **26.1 → 15.9 bpm**. So the multi-view consistency loss
does what it should (pulls the extracted pulse toward the single true, view-consistent HR),
end-to-end and label-free.

- Honest caveat: 1 session / 40 s, tiny model, no HR ground truth (multi-view is unlabeled) →
  this proves the losses + pipeline work and that the multi-view signal is exploitable; it is
  **not** a generalizable model. Real training needs a larger unlabeled dog-video corpus.
- Next: add temporal/spatial consistency + the physiology priors (RSA/harmonic) as losses;
  cross-check the learned HR against the RSA selector as the corpus grows.

## Fusing the two approaches — physiology priors as self-sup losses

Added two differentiable **physiology-prior losses** (fusing the classical breakthrough with
the DL path):
- **harmonic**: reward a 2nd harmonic (periodic non-sinusoidal pulse), from the spectrum.
- **RSA**: reward respiratory-band modulation of the pulse *amplitude envelope* (Hilbert) =
  cardio-respiratory coupling — the same physiology as the RSA selector, now a training loss.

**Result** (baseline vs +physio, same POC):

| metric | baseline | +physio | reading |
|---|---|---|---|
| RSA envelope coupling | 0.61 | **0.80** | ✅ physio loss works — pulse gains RSA structure |
| harmonic presence | 0.009 | 0.013 | barely engages (2nd harmonic often beyond band/Nyquist at high HR on tiny data) |
| cross-view spread | 18.4 | 22.0 bpm | slight trade-off vs multi-view at fixed equal weights |

**Takeaway**: the fusion is mechanically proven — the RSA loss is differentiable and
measurably increases cardio-respiratory coupling. But at fixed equal weights on 40 s / 1
session the physio terms compete with multi-view consistency and the harmonic term doesn't
develop; **loss weighting + a larger unlabeled corpus** are needed to get a net win. Same
conclusion as everywhere: the method works, the data does not yet.

## Where it sits
This is the label-free DL path from [`DL_ROADMAP`](DL_ROADMAP.md). The physiology results
(RSA, harmonic/LF priors) can be added as extra losses/inductive bias. Real generalization
still needs a larger unlabeled dog-video corpus — a lighter data ask than synchronized ECG,
and a natural first DL milestone.
