# Pet rPPG — Adaptive ROI Selection: Deployment Guide & Algorithm Specification

**Version**: 2026-05 (Post-Adaptive Selector Integration)  
**Status**: Production-Ready for Single-View Analysis  
**Primary Entry Point**: `tools/demo_rejection_anatomical_video4.py`

---

## 1. Executive Summary

This document describes the **current production-grade implementation** of the adaptive per-zone ROI selection system developed for dog rPPG.

The core innovation is the `AdaptiveROISelector`, which replaces the previous global `--multi_area` flag with a **data-driven, per-anatomical-zone decision**. For each zone (throat, right_ear, left_ear, muzzle, etc.), the system:

1. Generates both **Single-Center** and **Multi-Patch** candidates.
2. Computes rich quality metrics after A+B preprocessing.
3. Selects the superior variant (or keeps both when close) using a transparent scoring function.

This approach solves the key problem identified during research: **forcing multi-patch everywhere hurts performance on certain videos/zones** (notably low-HR Video 6), while being highly beneficial on others (high-HR Video 3).

The implementation is fully integrated into the main analysis pipeline and produces auditable decisions.

---

## 2. High-Level Algorithm Flow (2-Page View)

See the following presentation diagrams for the complete visual flow:

- **15.jpg** — Compact single-page overview of the entire pipeline.
- **18.jpg** (Page 1/2) + **19.jpg** (Page 2/2) — Large 2-page version with explicit placeholders for real frame images. This is the recommended version for presentations and documentation.

**Simplified Text Flow**:

```
Video + DLC Keypoints
        ↓
Dual Candidate Generation (per zone)
        ↓
A+B Preprocessing + Amplification (both variants)
        ↓
Per-Zone Quality Scoring
        ↓
AdaptiveROISelector (data-driven decision)
        ↓
Chosen ROI(s) → Full A+B + Amplification
        ↓
Windowed rPPG + Rejection (with pixel stability)
        ↓
Smart Final Selection (weighted median / cluster)
        ↓
Final BPM + Confidence + Decision Trace
```

---

## 3. Core Components

### 3.1 AdaptiveROISelector (`tools/adaptive_roi_selector.py`)

**Location**: `tools/adaptive_roi_selector.py`

This is the central, reusable decision engine.

**Key Class**: `AdaptiveROISelector`

**Main Methods**:

- `__init__(multi_bonus_threshold=1.15, min_pixel_for_consideration=400, artifact_dist_threshold=30)`
- `_zone_quality(row)` — The heart of the system. Computes a scalar quality for a candidate:
  ```python
  pix_factor   = pixel / (pixel + 600)
  clean_factor = 1 / (1 + post_clean_gr_var / 250)
  art_factor   = 1.0 if dist_from_100 >= 30 else 0.55
  quality = snr * pix_factor * clean_factor * art_factor
  ```
- `select(candidates_df, high_hr_prior=False)` → Returns chosen dict per zone.
- `tag_decisions(...)` → Adds `chosen_for_zone` and `decision_reason` columns.
- `from_dual_candidates(dual_df, ...)` — Convenience method used by the main pipeline.

**Important Design Decisions**:
- Conservative threshold (`1.15×`) — Multi-patch is only chosen when it is clearly superior.
- High-HR prior boost for videos 3/7.
- Explicit `is_merged` awareness via the `roi_family` column.

### 3.2 Main Analysis Pipeline (`tools/demo_rejection_anatomical_video4.py`)

**Location**: Lines ~353–420 (as of May 2026)

When `--dog_aware` is passed **without** forcing `--multi_area`:

```python
if args.dog_aware and AdaptiveROISelector is not None and not args.multi_area:
    # 1. Define the 4 main zones + their single/multi specs
    # 2. For each zone: extract both variants (full video)
    # 3. Apply A+B + amplification
    # 4. Compute rich quality features (SNR, post_clean_gr_var, pixel_mean, peak_dist_from_100)
    # 5. Call selector.from_dual_candidates()
    # 6. Use only the chosen spec(s) for the heavy windowed analysis
```

The chosen ROI name and decision reason are logged and can be stored in the results CSV.

**Legacy Behavior** (still supported):
- `--multi_area` forces the old global multi-patch behavior (for comparison or specific use cases).

### 3.3 Dual Candidate Data Generation (Support Tool)

**Location**: `tools/experiment_dual_roi_candidates.py`

This script generates the rich CSV that the selector loves (`dual_roi_candidates_results.csv`).

It produces, for every zone:
- `roi_family` ("single" / "multi")
- `base_name`
- `post_clean_gr_var`
- `pixel_mean`
- `best_snr`
- `peak_dist_from_100`
- `best_bpm`

This CSV can be fed directly into `AdaptiveROISelector.from_dual_candidates()` for offline analysis or improved decision making.

---

## 4. How to Run (Deployment Instructions)

### Recommended Production Command

```bash
python tools/analyze_video.py \
    --stem 3 \
    --dog_aware \
    --relax_rejection
```

**What happens internally**:
- The demo detects `--dog_aware` + no `--multi_area` → activates adaptive mode.
- For the four main zones, dual candidates are generated on-the-fly.
- `AdaptiveROISelector` makes per-zone decisions using real post-clean statistics.
- Only the chosen ROIs proceed to full windowed analysis + rejection + smart selection.

### Flags Reference

| Flag                  | Effect                                      | Recommended for Production |
|-----------------------|---------------------------------------------|----------------------------|
| `--dog_aware`         | Enables A+B + amplification + adaptive ROI  | Yes (default for dogs)    |
| `--relax_rejection`   | Uses dog-aware relaxed thresholds           | Yes                       |
| `--multi_area`        | Forces legacy global multi-patch            | Only for ablation studies |
| `--adaptive` (future) | Explicit flag to force adaptive mode        | Planned                   |

---

## 5. Output & Auditability

Every run now produces traceable decisions:

- Console logs show exactly which variant was chosen per zone and why.
- Results CSV can be extended to include `roi_family`, `chosen_quality`, `decision_reason`.
- The rich dual-candidate CSV (`dual_roi_candidates_results.csv`) serves as a full audit trail.

---

## 6. Visualization Assets (Presentation Ready)

All diagrams are in `presentation_images/`:

- `15.jpg` — Compact single-page overview
- `18.jpg` + `19.jpg` — **Recommended 2-page large flow** (use these for presentations)
- `10.jpg`, `11.jpg`, `12.jpg` — Detailed module block diagrams (paper quality)
- `13.jpg` / `14.jpg` — End-to-end data flow with real numbers (Video 3 & Video 6)
- Frame-level images (`*_keypoints_kr.jpg`, `*_chosen_rois_kr_with_quality.jpg`) — For explaining "what the algorithm actually sees"

---

## 7. Extension Points & Future Work

1. **Offline Selector Tuning**  
   Run `experiment_dual_roi_candidates.py` once per video → feed the CSV to the selector with different thresholds → find optimal `multi_bonus_threshold` per dog type.

2. **Persistent Decision Cache**  
   Save selector decisions per video/stem so repeated runs are fast.

3. **Learned Quality Model** (long-term)  
   Replace the hand-crafted `zone_quality` with a small model trained on labeled "good ROI" data.

4. **Multi-View Fusion**  
   Run the selector independently per camera, then fuse at the candidate level.

---

## 8. Summary of Files (Deployment Package)

**Core Production Code**
- `tools/demo_rejection_anatomical_video4.py` (main entry with adaptive logic)
- `tools/adaptive_roi_selector.py` (reusable decision engine)
- `tools/analyze_video.py` (thin wrapper)

**Supporting / Research Code**
- `tools/experiment_dual_roi_candidates.py`
- `tools/evaluate_smart_selection*.py`
- `tools/full_evaluation_current_best.py`

**Documentation & Visuals**
- `PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md` (this file)
- `PET_RPPG_FINAL_STRATEGY.md`
- `presentation_images/` (complete set of block diagrams + real frame visuals)

---

**This system is ready for deployment on new dog videos.**  
Run with `--dog_aware --relax_rejection` and the adaptive selector will automatically make intelligent per-zone ROI decisions using real signal quality.

For questions or extensions, refer to the code comments in `adaptive_roi_selector.py` and the detailed flow in `18.jpg` + `19.jpg`.