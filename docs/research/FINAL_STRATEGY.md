# Pet rPPG — Final Strategy for HR Accuracy (2026-05)

## Executive Summary
After extensive iteration (anatomical keypoints, face-box vs anatomical, A+B panting subtraction + thin-fur ROI redesign, time-domain cardiac amplification, rejection redesign, and the latest multi-area ROI experiments), the highest-leverage path to accurate heart rate on furry pets is now clear:

**Maximize raw trace quality upstream → quality-aware multi-ROI fusion → pixel-stability-aware rejection → robust final selection.**

The single biggest recent win is **multi-patch anatomical ROI sampling** (2+ small stable patches per anatomical zone instead of one small patch). This directly solves the user's observation that "픽셀 수가 적을수록 노이즈에 취약하다".

Combined with the existing A+B pipeline (strong panting proxy subtraction 0.85 + clipping + periodicity reinforcement), this produces the cleanest raw signals seen on the hardest videos (3 & 7, targets 210 / 189.5 bpm).

**Ground truth**: Coarse but usable per-video `bpm_target` from `dataset_front/video_labels_ocr.csv` (OCR-reviewed monitor readings). Evaluation target = absolute error vs these targets + high-HR recovery rate on videos 3 & 7.

---

## 1. Lessons Learned (Data-Driven)

1. **ROI / Tissue Selection > Everything Else** (original PET_RPPG_IMPROVEMENT_PLAN.md diagnosis remains true)
   - Face-box methods collapse to ~100 bpm artifact on high-HR videos.
   - Anatomical thin-fur ROIs (throat, ear bases, muzzle) + real keypoints are the foundation.

2. **Pixel Count Directly Predicts Noise Vulnerability**
   - Single small patches (muzzle_skin radius 13 → ~575-700 px typical) show persistently higher post-clean variance.
   - Multi-patch area sampling (2 patches per zone) reliably delivers +30~180% pixels and 20-40% variance reduction after A+B (see `multi_area_roi_v2/ROI_IMPROVEMENT_REPORT.md` and results CSV).

3. **A + B + Amplification Is the Current Raw-Trace Champion**
   - Panting proxy (multi-keypoint mouth + ear motion) subtraction at strength 0.85 + percentile clipping.
   - Time-domain periodicity reinforcement on the green channel surfaces high-HR peaks that pure frequency methods miss.
   - Evidence: Video 3/7 now frequently surface 170-210+ bpm candidates with good SNR in the first 20s window.

4. **Rejection Must Be Re-tuned for the Amplified + Multi-ROI World**
   - Current relaxed dog_aware thresholds (motion 22, artifact 0.55, mouth 42) are better but still kill too many good high-HR windows.
   - Missing features: pixel stability, per-ROI quality, high-HR band power ratio, periodicity strength.

5. **Fusion > Single Best ROI**
   - Weighted averaging (by pixel count or inverse variance) of 2-3 high-quality ROIs often yields more stable traces than any individual ROI.

6. **Ground-Truth Reality**
   - We have usable video-level targets (1:175, 3:210, 4:115.5, 5:135, 6:90, 7:189.5, 8:110.5).
   - Focus evaluation on absolute BPM error + "did we recover a peak near the target band?" rather than perfect per-window regression.

---

## 2. Final Recommended Pipeline (v0.5)

```
Input clip (front view)
  ↓
YOLO animal segmentation (mask) — optional but recommended
  ↓
DLC SuperAnimal quadruped keypoints (GPU probe recommended)
  ↓
Phase 1 — Raw Trace Maximization (Multi-ROI)
  - Use MULTI_PATCH_AREAS (throat_area, ear_area_*, muzzle_area, ...)
  - Per-frame: extract 2+ small patches per zone → average RGB
  - Log pixel_mean / pixel_min per ROI per window
  - A+B: strong panting subtraction (0.85 + clip) using multi-keypoint proxy
  - Time-domain amp: periodicity reinforcement on green
  ↓
Phase 2 — Per-Window Evaluation & Rejection
  - For each 20s window (10fps, step 5s):
    - Run 6 classical rPPG methods (green, g-r, chrom, POS, PCA, ICA)
    - Compute for each candidate:
        * SNR + BPM
        * Existing rejection features (motion, 100bpm artifact power, mouth)
        * NEW: pixel_stability = 1 / (1 + (pixel_mean < 800 ? penalty : 0) + var)
        * Periodicity strength (autocorrelation peak)
    - Per-ROI or fused trace scoring
  - Keep windows with combined_rejection_score < 0.35 (relaxed for amplified signals)
  ↓
Phase 3 — Final HR Selection
  - From kept windows, select top-K by composite score:
      score = SNR * (1 - rejection) * pixel_stability * periodicity
  - Final BPM = median (or weighted mean) of the top candidates
  - Optional: if high-HR band (160-240) has consistent energy across top windows → prefer it
  - Confidence = fraction of top windows that agree within ±10 bpm
  ↓
Output: BPM + confidence + best window index + diagnostic plots
```

**Default mode for production**: `--dog_aware --multi_area --relax_rejection`

---

## 3. Concrete Code Changes (Prioritized)

### High Priority (Do First)
1. **Integrate Multi-Patch ROI (this session)**
   - Add `MULTI_PATCH_AREAS` dict + `extract_rgb_multi_patch` + `extract_patch_with_pixels` helpers to `tools/demo_rejection_anatomical_video4.py`.
   - Add `--multi_area` flag.
   - When enabled in dog_aware mode, use multi-patch extraction for the four main zones and log pixel stats.
   - Update `tools/analyze_video.py` to forward `--multi_area`.

2. **Pixel-Aware Rejection**
   - In `tools/rppg_rejection.py`:
     - Add `compute_pixel_stability(pixel_mean, pixel_min, gr_var)` helper.
     - Extend `RejectionScorer.score_window(...)` to accept `pixel_stats` and include it in the returned dict + combined score.
   - Update callers in the demo script.

3. **Simple Fusion Helper**
   - Add `fuse_best_rois(list_of_rgb_traces, weights)` that does pixel- or SNR-weighted average of G-R channels.

### Medium Priority
4. Update relaxed thresholds in dog_aware mode based on latest amplified + multi-ROI distributions (re-measure motion/artifact/mouth on the new results).
5. Add "high_hr_band_power" and "periodicity_score" as explicit features.
6. In the main loop, when `--multi_area`, also produce a fused trace and evaluate it as an extra "roi".

### Lower Priority / Future
- Full 7-video systematic sweep with the new best config.
- Lightweight tracker (KLT on keypoints) instead of full DLC every frame for real-time HUD.
- Multi-view fusion (when left/right/up views are available).

---

## 4. Evaluation Plan (Measurable)

Run on all 7 videos with ground truth:
- Per-video table: target_bpm, best_pred_bpm, abs_error, best_snr, % windows kept (lenient), % kept (aggressive), best ROI/variant, high-HR recovery flag.
- Focus metrics:
  - Mean / median absolute error across videos.
  - High-HR recovery rate (videos 3 & 7): did any kept window surface a peak within ±15 bpm of target?
  - Average pixel count of the winning traces.
- Diagnostics saved per video: best waveform + spectrum, raw RGB for winning ROI, rejection feature histograms.

Current "good enough" bar (aspirational):
- Video 6 (easy, ~90 bpm): error < 5 bpm
- Video 1,4,5,8 (medium): error < 10-15 bpm
- Video 3 & 7 (hard high-HR): at least surface a credible high-HR candidate with SNR > 10 in ≥1 window; final error < 25 bpm

---

## 5. Immediate Next Steps (Actionable)

1. **This session** — Implement `--multi_area` + pixel logging in the main demo (highest leverage, low risk).
2. Extend RejectionScorer with pixel stability.
3. Re-run the full pipeline on videos 3 & 7 (and ideally all) with the new config.
4. Produce the definitive comparison table (update or replace `anatomical_vs_facebox_comparison.md`).
5. Iterate once on rejection weights/thresholds using the new feature distributions.
6. (Optional but recommended) Add a "final_strategy_evaluate.py" wrapper that produces the clean 7-video report with errors vs bpm_target.

---

## 6. Code Locations (Current Best as of 2026-05)

- Core pipeline: `tools/demo_rejection_anatomical_video4.py` (lines ~45-52 for ROIs, ~184-264 for extraction + A+B + amp, ~213-225 for relaxed thresholds, ~270+ for window loop + rejection).
- Rejection features: `tools/rppg_rejection.py` (RejectionScorer + individual compute_* functions).
- Entry point: `tools/analyze_video.py`.
- Multi-area experiment & data: `tools/experiment_multi_area_roi_improved.py` + `reports/rppg_pet_keypoints/multi_area_roi_v2/`.
- Ground truth: `dataset_front/video_labels_ocr.csv`.
- Historical plan: `PET_RPPG_IMPROVEMENT_PLAN.md`.

---

**Bottom line**: We are no longer guessing. The combination of **multi-patch anatomical ROIs + A+B + amplification + pixel-aware relaxed rejection + fusion selection** is the current best end-to-end strategy. The remaining work is mostly integration, one more round of threshold tuning on real distributions, and disciplined evaluation against the available labels.

This document should be the single source of truth for the next development cycle.

---
*Generated from synthesis of all experiments up to the multi-area ROI improvement task (May 2026).*
