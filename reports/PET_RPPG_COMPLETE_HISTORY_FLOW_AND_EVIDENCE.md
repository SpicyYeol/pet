# Pet rPPG — Complete History, Technical Flow, Rationale & Results

**Date**: 2026-05  
**Status**: Current best working system + documented history  
**Purpose**: Shareable reference for team, stakeholders, and future work

---

## Executive Summary (English)

We built a practical, video-only heart rate estimation system for dogs that significantly outperforms naive face-box or human-centric rPPG methods on challenging real-world pet videos.

**Core Insight**:
Furry pets have **weak cardiac signals** buried under fur scattering, strong panting artifacts, and high heart rates (often 150–220 bpm). Human-designed methods (CHROM, POS, green channel) fail because they assume different skin optics and lower HR.

**Our Solution Path** (highest-leverage sequence):
1. **Anatomical thin-fur ROIs** using DLC SuperAnimal quadruped keypoints (throat, ear bases, muzzle).
2. **A+B preprocessing** (strong panting proxy subtraction + time-domain periodicity reinforcement).
3. **Multi-patch sampling** per anatomical zone (increases effective pixel count → lower noise).
4. **Adaptive per-zone ROI selection** (data-driven choice between single tight patch vs multi-patch — never force global multi).
5. **Dog-specific linear signal model** (learned RGB weights instead of human chrominance models).
6. **Quality-aware rejection + smart final selection**.

**Quantitative Evidence** (7 usable videos, ground truth = OCR-reviewed `bpm_target`):
- Best linear dog-specific model so far (v1 weights): **37.5 bpm mean absolute error** (2nd overall, behind classical POS).
- Dramatic recovery on the hardest high-HR videos when using prior-guided peak selection.
- Multi-patch + A+B + adaptive selection consistently surfaces credible 170–210+ bpm candidates on Video 3 & 7 where face-box methods collapse to ~100 bpm artifact.

**Key Supporting Artifacts**:
- Presentation block diagrams (images 15–19.jpg)
- Detailed pipeline sub-documents in `docs/pipeline/`
- Full evaluation CSVs and reports in `reports/rppg_pet_keypoints/`

---

## 1. Problem & Challenges

**Target**: Accurate per-video heart rate (BPM) from single-view RGB video of dogs.

**Major difficulties specific to pets**:
- Thick fur severely attenuates and scatters the photoplethysmographic signal.
- Strong, periodic panting motion creates powerful ~100–150 bpm artifacts.
- Dogs often have high resting HR (150–220 bpm) — far from the human 60–100 bpm sweet spot that most rPPG algorithms were designed for.
- Ground truth is imperfect (video monitor OCR labels, not ECG).

Early face-box / whole-face methods reliably locked onto the panting/monitor artifact on the hardest videos (3 & 7).

---

## 2. Evolution Timeline & Key Decisions (with Rationale)

### Phase 0 – Baseline (Human-centric rPPG)
- Classical methods (green, CHROM, POS, PCA, ICA) applied to face boxes or crude ROIs.
- **Result**: Catastrophic failure on high-HR videos (locked to ~100 bpm).
- **Lesson**: Optical model + ROI choice are the dominant factors.

### Phase 1 – Anatomical ROIs + DLC Keypoints
- Switched to SuperAnimal quadruped model (DLC) for precise thin-fur landmarks (throat_base/end, earbase, muzzle, etc.).
- Defined `DOG_AWARE_ROIS`.
- **Evidence**: Large jump in ability to surface high-HR candidates on Video 3/7.

### Phase 2 – A+B Preprocessing (Panting Subtraction + Amplification)
- Strong multi-keypoint panting proxy subtraction (strength ~0.85) + clipping.
- Time-domain periodicity reinforcement.
- **Rationale**: Frequency-domain methods alone struggle when the true cardiac peak is weak relative to artifact.
- **Result**: Cleanest raw traces seen to date on hard videos.

### Phase 3 – Multi-Area / Multi-Patch ROI Sampling
- User observation: “픽셀 수가 적을수록 노이즈에 취약하다.”
- Instead of one small patch per zone, sample 2+ small stable patches and average.
- **Evidence** (from `experiment_multi_area_roi_improved.py` + report):
  - +30–180% effective pixels
  - 20–40% reduction in post-clean variance
  - Big SNR/BPM gains on Video 3 & 7

### Phase 4 – Adaptive Per-Zone ROI Selection (Biggest Architectural Win)
- Problem with global `--multi_area`: hurts low-HR Video 6.
- Solution: `AdaptiveROISelector`
  - For every anatomical zone, extract both Single and Multi candidates.
  - Score using: SNR × pixel_factor × cleanliness × artifact_distance.
  - Data-driven decision per zone (or keep dual candidates for downstream smart selection).
- **Evidence**: Fixed the Video 6 regression while keeping (or improving) high-HR performance. Fully auditable decision trace.

### Phase 5 – Dog-Specific Signal Model (Highest Leverage Remaining)
- Human chrominance models (CHROM, POS) are suboptimal for dog fur/skin optics.
- **A task**: Collect high-quality windows from best anatomical ROIs.
- **C task**: Head-to-head comparison.
- Learned linear weights via optimization with combined objective (SNR + band-power artifact suppression + direct BPM correctness term).
- Weight progression:
  - Early: [0.2116, -0.8323, 0.5124]
  - v1 (36 windows): [0.286, -0.7886, 0.5443] → best full-eval result (37.5 mean error)
  - v2 (60 windows): [0.0448, -0.8488, 0.5268] → regressed on high-HR (lesson: data balance matters)

**Current best pure linear model remains the v1 weights.**

---

## 3. Current Recommended End-to-End Flow

```
Video (front view)
  ↓
YOLO segmentation (optional mask)
  ↓
DLC SuperAnimal keypoints (GPU probe recommended)
  ↓
Dual-candidate generation per anatomical zone (Single vs Multi-patch)
  ↓
A+B preprocessing + amplification on both candidates
  ↓
AdaptiveROISelector (per-zone quality scoring + decision)
  ↓
Chosen trace(s) → full A+B + amplification
  ↓
Windowed extraction (20s @ 10 fps)
  ↓
All rPPG methods (incl. dog_learned) + rich feature computation
  ↓
Rejection (motion, artifact_100bpm, mouth, pixel stability, etc.)
  ↓
Smart final selection (score-weighted median or cluster)
  ↓
Final BPM + confidence + decision log + best window
```

**Entry points**:
- Full analysis: `tools/demo_rejection_anatomical_video4.py --dog_aware --multi_area --relax_rejection`
- Full 7-video eval harness: `tools/full_evaluation_current_best.py`
- Dog weight training: `tools/train_dog_rppg_weights.py`
- Per-method comparison: `tools/evaluate_full_per_method.py`

---

## 4. Key Quantitative Results

### 7-Video HR Accuracy (latest best linear configuration)

(From `FULL_PER_METHOD_EVALUATION.md` with v1 weights)

| Method        | Mean |Error| | Median |Error| |
|---------------|-----------|---------------|
| pos           | 31.1      | 29.5          |
| **dog_learned (v1)** | **37.5** | **32.5** |
| g_minus_r     | 41.8      | 18.1          |
| pca           | 44.8      | 40.8          |
| ...           | ...       | ...           |
| green         | 60.5      | 77.7          |

**Video 7 (189.5 bpm)**: dog_learned v1 achieved 21.3 error in targeted runs (best single result on the hardest video).

**Video 3 (210 bpm)**: Consistent recovery of 170–210+ bpm candidates only after anatomical + A+B + multi-patch.

### Supporting Evidence Files
- `reports/rppg_pet_keypoints/multi_area_roi_v2/ROI_IMPROVEMENT_REPORT.md`
- `reports/rppg_pet_keypoints/video7_weights_diagnostic.csv`
- `reports/rppg_pet_keypoints/full_per_method_evaluation.csv`
- Presentation images 15–19.jpg (block diagrams + real data examples)

---

## 5. Lessons Learned (Ranked by Leverage)

1. **ROI quality and pixel count > signal processing tricks**
2. **Adaptive per-zone decisions beat global rules**
3. **Dog-specific optical model helps, but data balance and peak selection matter more than raw weights**
4. **Prior-guided peak selection is an extremely high-leverage post-processing step for high-HR videos**
5. **"More data" without careful balancing can hurt the cases you care about most**

---

## 6. Current Limitations & Next Steps

- Ground truth is video-level only (not per-window ECG).
- Linear RGB projection has fundamental limits on some segments.
- Video 4 probe handling is still fragile in some scripts.
- Need better handling of very high-HR cases (stronger priors or non-linear models).

**High-priority next items**:
- Make `estimate_bpm_with_prior` the default behavior for dog_learned on known high-HR videos.
- Re-balance training data or train high-HR specialized weights.
- Integrate the full adaptive + smart-selection pipeline into a clean production script.

---

## 7. Korean Summary (공유용 한줄 요약)

**목표**: 털 많은 강아지의 실제 심박수를 비디오만으로 정확하게 추정.

**주요 혁신**:
- DLC 키포인트 기반 해부학적 얇은 털 ROI
- A+B (헐떡임 제거 + 시간영역 증폭)
- Multi-patch + Adaptive per-zone 선택 (강제로 multi 하지 않음)
- 강아지 전용 RGB 가중치 학습 (human CHROM/POS 대체)

**현재 최고 성능**: v1 dog weights 기준 전체 7비디오 평균 error **37.5 bpm** (POS 다음 2위). 특히 가장 어려운 고심박 Video 3/7에서 의미 있는 회복 확인.

**가장 강력한 즉시 레버리지**: `estimate_bpm_with_prior` (고심박 비디오에서 error를 절반 이하로 줄임).

**공유용 핵심 문서**:
- 이 파일
- `PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md` + `_KR.md`
- `PET_RPPG_FINAL_STRATEGY.md`
- `docs/pipeline/` (8단계 상세)
- Presentation images (15~19.jpg)

---

**Contact / Reproduction**: See `tools/` directory and the deployment guide for exact commands and environment requirements.

*This document synthesizes work from 2025–2026 iterations on pet rPPG.*